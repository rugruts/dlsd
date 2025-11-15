import { ProviderRequest, ProviderResponse, ConnectedSite } from '../../../packages/shared-types';

class BackgroundService {
  private connectedSites: Map<string, ConnectedSite> = new Map();
  private mockPublicKey = 'DumpSackMockPublicKey12345678901234567890123456789012';
  private mockPrivateKey = 'DumpSackMockPrivateKey12345678901234567890123456789012';

  constructor() {
    this.setupMessageListeners();
    this.loadConnectedSites();
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
        if (site) {
          // Notify content script of existing connection
          chrome.tabs.sendMessage(tabId, {
            type: 'DUMPSACK_CONNECTION_RESTORED',
            payload: { publicKey: this.mockPublicKey }
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
    // Check if already connected
    if (this.connectedSites.has(origin)) {
      return { publicKey: this.mockPublicKey };
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

    return { publicKey: this.mockPublicKey };
  }

  private async handleDisconnect(origin: string): Promise<void> {
    this.connectedSites.delete(origin);
    await this.saveConnectedSites();
  }

  private async handleSignTransaction(transaction: any, origin: string): Promise<any> {
    const site = this.connectedSites.get(origin);
    if (!site || !site.permissions.includes('signTransaction')) {
      throw new Error('Not authorized to sign transactions for this site');
    }

    // Request user approval (in real implementation, show popup)
    const approved = await this.requestTransactionApproval(origin, 'Sign Transaction');
    if (!approved) {
      throw new Error('Transaction signing denied by user');
    }

    // Mock signing - in real implementation, use actual private key
    console.log('Mock signing transaction for', origin);
    transaction.signature = 'mock_signature_' + Date.now();

    return transaction;
  }

  private async handleSignAllTransactions(transactions: any[], origin: string): Promise<any[]> {
    const site = this.connectedSites.get(origin);
    if (!site || !site.permissions.includes('signTransaction')) {
      throw new Error('Not authorized to sign transactions for this site');
    }

    // Request user approval
    const approved = await this.requestTransactionApproval(origin, 'Sign All Transactions');
    if (!approved) {
      throw new Error('Transaction signing denied by user');
    }

    // Mock signing
    return transactions.map(tx => ({
      ...tx,
      signature: 'mock_signature_' + Date.now() + '_' + Math.random(),
    }));
  }

  private async handleSignMessage(message: Uint8Array, origin: string): Promise<{ signature: Uint8Array }> {
    const site = this.connectedSites.get(origin);
    if (!site || !site.permissions.includes('signMessage')) {
      throw new Error('Not authorized to sign messages for this site');
    }

    // Request user approval
    const approved = await this.requestMessageApproval(origin, 'Sign Message');
    if (!approved) {
      throw new Error('Message signing denied by user');
    }

    // Mock signing
    const mockSignature = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      mockSignature[i] = Math.floor(Math.random() * 256);
    }

    return { signature: mockSignature };
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

  getMockPublicKey(): string {
    return this.mockPublicKey;
  }
}

// Export singleton instance
export const backgroundService = new BackgroundService();

// Make it available globally for popup
(globalThis as any).backgroundService = backgroundService;