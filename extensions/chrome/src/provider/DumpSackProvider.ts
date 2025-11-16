import { PublicKey } from '@dumpsack/shared-utils/solana';
import { SignatureResult, TransactionSignatureResult } from '../background/types';

declare global {
  interface Window {
    dumpsack: DumpSackProvider;
  }
}

export class DumpSackProvider {
  public readonly isDumpSack = true;
  public publicKey: PublicKey | null = null;
  private _connected = false;
  private _connecting = false;
  private eventListeners: { [event: string]: ((...args: any[]) => void)[] } = {};

  constructor() {
    // Listen for messages from background script
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  // Connection methods
  async connect(): Promise<{ publicKey: PublicKey }> {
    if (this._connecting) {
      throw new Error('Already connecting');
    }

    this._connecting = true;

    try {
      const response = await this.sendMessage('CONNECT');
      const publicKey = new PublicKey(response.publicKey);

      this.publicKey = publicKey;
      this._connected = true;

      this.emit('connect', { publicKey });
      return { publicKey };
    } finally {
      this._connecting = false;
    }
  }

  async disconnect(): Promise<void> {
    await this.sendMessage('DISCONNECT');
    this.publicKey = null;
    this._connected = false;
    this.emit('disconnect');
  }

  // Account methods
  async requestAccounts(): Promise<string[]> {
    const response = await this.sendMessage('REQUEST_ACCOUNTS');
    return response.accounts || [];
  }

  // Signing methods
  async signMessage(message: Uint8Array): Promise<SignatureResult> {
    if (!this._connected || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    const response = await this.sendMessage('SIGN_MESSAGE', {
      message: Array.from(message),
    });

    return {
      signature: response.signature,
      publicKey: this.publicKey.toBase58(),
    };
  }

  async signTransaction(transaction: any): Promise<TransactionSignatureResult> {
    if (!this._connected || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Serialize transaction to base64
    const serialized = transaction.serialize();
    const base64Tx = Buffer.from(serialized).toString('base64');

    const response = await this.sendMessage('SIGN_TRANSACTION', {
      transaction: base64Tx,
    });

    return {
      signature: response.signature,
      publicKey: this.publicKey.toBase58(),
      serializedTransaction: response.serializedTransaction,
    };
  }

  async signAllTransactions(transactions: any[]): Promise<TransactionSignatureResult[]> {
    if (!this._connected || !this.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Serialize all transactions
    const serializedTxs = transactions.map(tx => Buffer.from(tx.serialize()).toString('base64'));

    const response = await this.sendMessage('SIGN_ALL_TRANSACTIONS', {
      transactions: serializedTxs,
    });

    return response.signatures.map((sig: string, index: number) => ({
      signature: sig,
      publicKey: this.publicKey!.toBase58(),
      serializedTransaction: response.serializedTransactions[index],
    }));
  }

  // RPC passthrough
  async request(method: string, params: any[] = []): Promise<any> {
    return this.sendMessage('RPC_REQUEST', { method, params });
  }

  // Event handling
  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  off(event: string, handler?: (...args: any[]) => void): void {
    if (!this.eventListeners[event]) return;

    if (handler) {
      const index = this.eventListeners[event].indexOf(handler);
      if (index > -1) {
        this.eventListeners[event].splice(index, 1);
      }
    } else {
      delete this.eventListeners[event];
    }
  }

  private emit(event: string, ...args: any[]): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error('Error in event handler:', error);
        }
      });
    }
  }

  private handleMessage(event: MessageEvent): void {
    // Only accept messages from our extension
    if (event.source !== window) return;
    if (event.data.type === 'ACCOUNT_CHANGED') {
      const { publicKey } = event.data.payload;
      this.publicKey = publicKey ? new PublicKey(publicKey) : null;
      this.emit('accountChanged', { publicKey });
    }
  }

  private async sendMessage(type: string, payload: any = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      const messageId = Date.now().toString() + Math.random().toString();

      const message = {
        type,
        payload,
        id: messageId,
        origin: window.location.origin,
      };

      // Send to background script
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response.success) {
          resolve(response.result);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }
}

// Auto-instantiate and inject into window
const provider = new DumpSackProvider();
window.dumpsack = provider;