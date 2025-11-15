import { Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { SecureStorage } from '../auth/secureStorage';
import { useAuthStore } from '../auth/authStore';

export class WalletService {
  private keypair: Keypair | null = null;

  constructor() {
    this.loadKeypair();
  }

  private async loadKeypair(): Promise<void> {
    const { userId } = useAuthStore.getState();
    if (!userId) return;

    try {
      this.keypair = await this.getStoredKeypair(userId);
    } catch (error) {
      console.error('Failed to load keypair:', error);
    }
  }

  getPublicKey(): PublicKey | null {
    return this.keypair?.publicKey || null;
  }

  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.keypair) {
      throw new Error('No keypair available');
    }
    tx.sign(this.keypair);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this.keypair) {
      throw new Error('No keypair available');
    }
    return txs.map(tx => {
      tx.sign(this.keypair!);
      return tx;
    });
  }

  // Ledger stubs
  async connectLedger(): Promise<void> {
    // TODO: Implement Ledger BLE connection
    throw new Error('Ledger support not implemented');
  }

  async signWithLedger(tx: Transaction): Promise<Transaction> {
    // TODO: Implement Ledger signing
    throw new Error('Ledger signing not implemented');
  }

  private async getStoredKeypair(userId: string): Promise<Keypair | null> {
    const secretKeyStr = await SecureStorage.getSecureItem(`wallet-${userId}`);
    if (!secretKeyStr) return null;
    const secretKey = new Uint8Array(secretKeyStr.split(',').map(Number));
    return Keypair.fromSecretKey(secretKey);
  }
}

// Singleton instance
export const walletService = new WalletService();