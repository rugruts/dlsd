import { ProviderRequest, ProviderResponse, ConnectedSite } from '../../../packages/shared-types';
import { signerService } from './background/signerService';
import { Transaction } from '@dumpsack/shared-utils';

class BackgroundService {
  private connectedSites: Map<string, ConnectedSite> = new Map();
  private currentPublicKey: string | null = null;

  constructor() {
    this.setupMessageListeners();
    this.loadConnectedSites();
    this.loadWalletPublicKey();
  }

  private async loadWalletPublicKey(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(['walletPublicKey']) as { walletPublicKey?: string };
      if (result.walletPublicKey) {
        this.currentPublicKey = result.walletPublicKey;
        signerService.setPublicKey(result.walletPublicKey);
      }
    } catch (error) {
      console.error('Failed to load wallet public key:', error);
    }
  }

  private setupMessageListeners() {
    // Listen for messages from content scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'DUMPSACK_PROVIDER_REQUEST') {
        this.handleProviderRequest(message.payload, sender)
          .then(result => sendResponse({ type: 'DUMPSACK_BACKGROUND_RESPONSE', payload: result }))
          .catch(error => sendResponse({
            type: 'DUMPSACK_BACKGROUND_RESPONSE',
            payload: {
              id: message.payload.id,
              error: { code: -32603, message: error.message }
            }
          }));
        return true; // Keep message channel open for async response
      }
    });

    // Listen for tab updates to manage connections
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading' && tab.url) {
        const url = new URL(tab.url);
        const origin = url.origin;

        // Check if we have a connection for this origin
        const site = this.connectedSites.get(origin);
        if (site && this.currentPublicKey) {
          // Notify content script of existing connection
          chrome.tabs.sendMessage(tabId, {
            type: 'DUMPSACK_CONNECTION_RESTORED',
            payload: { publicKey: this.currentPublicKey }
          }).catch(() => {
            // Content script might not be ready yet
          });
        }
      }
    });
  }

  private async loadConnectedSites() {
    try {
      const result = await chrome.storage.local.get(['connectedSites']);
      if (result.connectedSites) {
        this.connectedSites = new Map(Object.entries(result.connectedSites));
      }
    } catch (error) {
      console.error('Failed to load connected sites:', error);
    }
  }

  private async saveConnectedSites() {
    try {
      const sitesObject = Object.fromEntries(this.connectedSites);
      await chrome.storage.local.set({ connectedSites: sitesObject });
    } catch (error) {
      console.error('Failed to save connected sites:', error);
    }
  }

  private async handleProviderRequest(request: ProviderRequest, sender: chrome.runtime.MessageSender): Promise<ProviderResponse> {
    const origin = sender.origin || (sender.tab ? new URL(sender.tab.url!).origin : 'unknown');

    try {
      let result: any;

      switch (request.method) {
        case 'connect':
          result = await this.handleConnect(origin);
          break;
        case 'disconnect':
          result = await this.handleDisconnect(origin);
          break;
        case 'signTransaction':
          result = await this.handleSignTransaction(request.params[0], origin);
          break;
        case 'signAllTransactions':
          result = await this.handleSignAllTransactions(request.params[0], origin);
          break;
        case 'signMessage':
          result = await this.handleSignMessage(request.params[0], origin);
          break;
        default:
          throw new Error(`Unknown method: ${request.method}`);
      }

      return {
        id: request.id,
        result,
      };
    } catch (error) {
      return {
        id: request.id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  private async handleConnect(origin: string): Promise<{ publicKey: string }> {
    if (!this.currentPublicKey) {
      throw new Error('No wallet available. Please unlock your wallet first.');
    }

    // Check if already connected
    if (this.connectedSites.has(origin)) {
      return { publicKey: this.currentPublicKey };
    }

    // Request permission (in real implementation, show popup)
    const granted = await this.requestPermission(origin);
    if (!granted) {
      throw new Error('Connection denied by user');
    }

    // Create connection
    const site: ConnectedSite = {
      origin,
      connectedAt: Date.now(),
      permissions: ['connect', 'signTransaction', 'signMessage'],
    };

    this.connectedSites.set(origin, site);
    await this.saveConnectedSites();

    return { publicKey: this.currentPublicKey };
  }

  private async handleDisconnect(origin: string): Promise<void> {
    this.connectedSites.delete(origin);
    await this.saveConnectedSites();
  }

  private async handleSignTransaction(transaction: Transaction, origin: string): Promise<Transaction> {
    const site = this.connectedSites.get(origin);
    if (!site || !site.permissions.includes('signTransaction')) {
      throw new Error('Not authorized to sign transactions for this site');
    }

    if (!this.currentPublicKey) {
      throw new Error('No wallet available. Please unlock your wallet first.');
    }

    // Request user approval (in real implementation, show popup)
    const approved = await this.requestTransactionApproval(origin, 'Sign Transaction');
    if (!approved) {
      throw new Error('Transaction signing denied by user');
    }

    // Use real signing service
    try {
      const signedTransaction = await signerService.signTransaction(transaction);
      return signedTransaction;
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSignAllTransactions(transactions: Transaction[], origin: string): Promise<Transaction[]> {
    const site = this.connectedSites.get(origin);
    if (!site || !site.permissions.includes('signTransaction')) {
      throw new Error('Not authorized to sign transactions for this site');
    }

    if (!this.currentPublicKey) {
      throw new Error('No wallet available. Please unlock your wallet first.');
    }

    // Request user approval
    const approved = await this.requestTransactionApproval(origin, 'Sign All Transactions');
    if (!approved) {
      throw new Error('Transaction signing denied by user');
    }

    // Use real signing service
    try {
      return await signerService.signAllTransactions(transactions);
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSignMessage(message: Uint8Array, origin: string): Promise<{ signature: Uint8Array }> {
    const site = this.connectedSites.get(origin);
    if (!site || !site.permissions.includes('signMessage')) {
      throw new Error('Not authorized to sign messages for this site');
    }

    if (!this.currentPublicKey) {
      throw new Error('No wallet available. Please unlock your wallet first.');
    }

    // Request user approval
    const approved = await this.requestMessageApproval(origin, 'Sign Message');
    if (!approved) {
      throw new Error('Message signing denied by user');
    }

    // Use real signing service
    try {
      const signature = await signerService.signMessage(message);
      return { signature };
    } catch (error) {
      throw new Error(`Message signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async requestPermission(origin: string): Promise<boolean> {
    // In real implementation, show permission popup
    // For now, auto-approve for demo
    return true;
  }

  private async requestTransactionApproval(origin: string, type: string): Promise<boolean> {
    // In real implementation, show approval popup
    // For now, auto-approve for demo
    return true;
  }

  private async requestMessageApproval(origin: string, type: string): Promise<boolean> {
    // In real implementation, show approval popup
    // For now, auto-approve for demo
    return true;
  }

  // Public methods for popup
  getConnectedSites(): ConnectedSite[] {
    return Array.from(this.connectedSites.values());
  }

  async disconnectSite(origin: string): Promise<void> {
    this.connectedSites.delete(origin);
    await this.saveConnectedSites();
  }

  getPublicKey(): string | null {
    return this.currentPublicKey;
  }

  async setWalletPublicKey(publicKey: string): Promise<void> {
    this.currentPublicKey = publicKey;
    signerService.setPublicKey(publicKey);
    try {
      await chrome.storage.local.set({ walletPublicKey: publicKey });
    } catch (error) {
      console.error('Failed to save wallet public key:', error);
    }
  }
}

// Export singleton instance
export const backgroundService = new BackgroundService();

// Make it available globally for popup
(globalThis as typeof window & { backgroundService?: BackgroundService }).backgroundService = backgroundService;