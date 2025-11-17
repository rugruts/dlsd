import { MessageRouter } from './types';
import { permissionsStore } from './permissionsStore';
import { connectionStore } from './connectionStore';
import { signerService } from './signerService';
import { rpcProxy } from '../utils/rpcProxy';

export class DumpSackMessageRouter implements MessageRouter {
  private pendingRequests = new Map<string, { resolve: Function; reject: Function }>();

  async handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
    const { type, payload, id, origin } = message;

    // Validate origin
    if (!origin || typeof origin !== 'string') {
      throw new Error('Invalid origin');
    }

    // Check permissions for sensitive operations
    if (['SIGN_MESSAGE', 'SIGN_TRANSACTION', 'SIGN_ALL_TRANSACTIONS'].includes(type)) {
      if (!permissionsStore.isAllowed(origin)) {
        // Trigger approval UI
        const approved = await this.requestApproval(origin, type, payload);
        if (!approved) {
          throw new Error('User rejected the request');
        }
      }
    }

    switch (type) {
      case 'CONNECT':
        return this.handleConnect(origin);

      case 'DISCONNECT':
        return this.handleDisconnect(origin);

      case 'REQUEST_ACCOUNTS':
        return this.handleRequestAccounts(origin);

      case 'GET_ACCOUNT':
        return this.handleGetAccount();

      case 'SIGN_MESSAGE':
        return this.handleSignMessage(payload, origin);

      case 'SIGN_TRANSACTION':
        return this.handleSignTransaction(payload, origin);

      case 'SIGN_ALL_TRANSACTIONS':
        return this.handleSignAllTransactions(payload, origin);

      case 'RPC_REQUEST':
        return this.handleRpcRequest(payload);

      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  }

  private async handleConnect(origin: string): Promise<{ publicKey: string }> {
    const approved = await this.requestApproval(origin, 'CONNECT', {});
    if (!approved) {
      throw new Error('Connection rejected');
    }

    permissionsStore.approve(origin);
    connectionStore.addConnection(origin);

    const publicKey = connectionStore.getPublicKey();
    if (!publicKey) {
      throw new Error('No wallet available');
    }

    return { publicKey: publicKey.toBase58() };
  }

  private async handleDisconnect(origin: string): Promise<void> {
    connectionStore.removeConnection(origin);
  }

  private async handleRequestAccounts(origin: string): Promise<string[]> {
    if (!permissionsStore.isAllowed(origin)) {
      const approved = await this.requestApproval(origin, 'REQUEST_ACCOUNTS', {});
      if (!approved) {
        return [];
      }
      permissionsStore.approve(origin);
    }

    const publicKey = connectionStore.getPublicKey();
    return publicKey ? [publicKey.toBase58()] : [];
  }

  private handleGetAccount(): { publicKey: string | null } {
    const publicKey = connectionStore.getPublicKey();
    return { publicKey: publicKey?.toBase58() || null };
  }

  private async handleSignMessage(payload: any, origin: string): Promise<{ signature: string }> {
    const { message } = payload;
    const signature = await signerService.signMessage(new Uint8Array(message));
    return { signature: Buffer.from(signature).toString('hex') };
  }

  private async handleSignTransaction(payload: any, origin: string): Promise<{ signature: string; serializedTransaction: string }> {
    const { transaction: serializedTx } = payload;
    const transaction = Transaction.from(Buffer.from(serializedTx, 'base64'));

    const signedTransaction = await signerService.signTransaction(transaction);
    const signature = signedTransaction.signature;
    const serialized = signedTransaction.serialize();

    return {
      signature: signature?.toString('hex') || '',
      serializedTransaction: Buffer.from(serialized).toString('base64'),
    };
  }

  private async handleSignAllTransactions(payload: any, origin: string): Promise<{ signatures: string[]; serializedTransactions: string[] }> {
    const { transactions: serializedTxs } = payload;
    const transactions = serializedTxs.map((tx: string) => Transaction.from(Buffer.from(tx, 'base64')));

    const signedTransactions = await signerService.signAllTransactions(transactions);
    const signatures = signedTransactions.map(tx => tx.signature?.toString('hex') || '');
    const serialized = signedTransactions.map(tx => Buffer.from(tx.serialize()).toString('base64'));

    return { signatures, serializedTransactions: serialized };
  }

  private async handleRpcRequest(payload: any): Promise<any> {
    const { method, params } = payload;
    return rpcProxy.request(method, params);
  }

  private async requestApproval(origin: string, type: string, payload: any): Promise<boolean> {
    return new Promise((resolve) => {
      // Open approval popup
      chrome.windows.create({
        url: chrome.runtime.getURL(`ui/approval.html?origin=${encodeURIComponent(origin)}&type=${type}&payload=${encodeURIComponent(JSON.stringify(payload))}`),
        type: 'popup',
        width: 400,
        height: 600,
      }, (window) => {
        // Listen for approval response
        const listener = (message: any) => {
          if (message.type === 'APPROVAL_RESPONSE' && message.origin === origin) {
            chrome.runtime.onMessage.removeListener(listener);
            if (window?.id) {
              chrome.windows.remove(window.id);
            }
            resolve(message.approved);
          }
        };
        chrome.runtime.onMessage.addListener(listener);
      });
    });
  }
}

// Import types and Transaction at the end to avoid circular imports
import { Transaction } from '@dumpsack/shared-utils';