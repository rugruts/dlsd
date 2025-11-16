import { PublicKey } from '@dumpsack/shared-utils/solana';
import { ConnectionState } from './types';

class ConnectionStore {
  private state: ConnectionState = {
    publicKey: null,
    connectedOrigins: new Set(),
  };

  private listeners: Set<(state: ConnectionState) => void> = new Set();

  constructor() {
    // Load from storage on initialization
    this.loadFromStorage();

    // Listen for account changes (would come from wallet service)
    // For now, we'll set a default public key
    this.setPublicKey('11111111111111111111111111111112'); // Placeholder
  }

  private async loadFromStorage() {
    try {
      const result = await chrome.storage.local.get(['dumpsack-connections']);
      if (result['dumpsack-connections']) {
        const saved = result['dumpsack-connections'];
        this.state.connectedOrigins = new Set(saved.connectedOrigins || []);
        if (saved.publicKey) {
          this.state.publicKey = saved.publicKey;
        }
      }
    } catch (error) {
      console.error('Failed to load connection state:', error);
    }
  }

  private async saveToStorage() {
    try {
      await chrome.storage.local.set({
        'dumpsack-connections': {
          publicKey: this.state.publicKey,
          connectedOrigins: Array.from(this.state.connectedOrigins),
        },
      });
    } catch (error) {
      console.error('Failed to save connection state:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  setPublicKey(publicKey: string | null) {
    this.state.publicKey = publicKey;
    this.saveToStorage();
    this.notifyListeners();
  }

  getPublicKey(): PublicKey | null {
    return this.state.publicKey ? new PublicKey(this.state.publicKey) : null;
  }

  addConnection(origin: string) {
    this.state.connectedOrigins.add(origin);
    this.saveToStorage();
    this.notifyListeners();
  }

  removeConnection(origin: string) {
    this.state.connectedOrigins.delete(origin);
    this.saveToStorage();
    this.notifyListeners();
  }

  isConnected(origin: string): boolean {
    return this.state.connectedOrigins.has(origin);
  }

  getConnectedOrigins(): string[] {
    return Array.from(this.state.connectedOrigins);
  }

  subscribe(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): ConnectionState {
    return { ...this.state };
  }
}

// Export singleton instance
export const connectionStore = new ConnectionStore();