import { Transaction, PublicKey, deriveWalletAtIndex } from '@dumpsack/shared-utils';
import { Keypair } from '@solana/web3.js';

export class SignerService {
  private publicKey: PublicKey | null = null;
  private keypair: Keypair | null = null;
  private activeWalletIndex: number = 0;

  constructor() {
    // Initialize with no keypair - will be loaded on demand
  }

  /**
   * Set the active wallet index for signing operations
   */
  setActiveWalletIndex(index: number): void {
    this.activeWalletIndex = index;
    // Clear cached keypair when switching wallets
    this.keypair = null;
  }

  /**
   * Set the public key for the current wallet
   */
  setPublicKey(publicKey: string) {
    this.publicKey = new PublicKey(publicKey);
  }

  /**
   * Get the current public key
   */
  getPublicKey(): PublicKey | null {
    return this.publicKey;
  }

  /**
   * Load keypair from mnemonic (called on-demand for signing)
   */
  private async loadKeypairFromMnemonic(): Promise<Keypair> {
    try {
      // Import wallet store dynamically to avoid circular dependencies
      const { useWalletStore } = await import('../popupApp/stores/walletStoreV2');
      const store = useWalletStore.getState();

      // Get mnemonic from wallet store
      const mnemonic = await store.getMnemonic();

      // Derive keypair at the active wallet index
      const { keypair } = deriveWalletAtIndex(mnemonic, this.activeWalletIndex);

      return keypair;
    } catch (error) {
      console.error('Failed to load keypair from mnemonic:', error);
      throw new Error('Failed to access wallet for signing');
    }
  }

  /**
   * Ensure wallet is available and load keypair if needed
   */
  private async ensureWalletAvailable(): Promise<void> {
    if (!this.publicKey) {
      throw new Error('Wallet not connected. Please connect your wallet first.');
    }

    // Load keypair on demand if not already cached
    if (!this.keypair) {
      this.keypair = await this.loadKeypairFromMnemonic();
    }
  }

  /**
   * Sign a message using ed25519
   * Uses the keypair's secret key to sign the message
   */
  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    await this.ensureWalletAvailable();

    if (!this.keypair) {
      throw new Error('Wallet keypair not available');
    }

    try {
      // For message signing, we use the keypair's secret key directly
      // The Solana Keypair's secretKey is 64 bytes: [32-byte private key][32-byte public key]
      // We need to extract the private key portion
      const secretKey = this.keypair.secretKey;
      const privateKey = secretKey.slice(0, 32);

      // Try to get tweetnacl from the global scope or from @solana/web3.js
      // @solana/web3.js bundles tweetnacl
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let nacl: any;
      try {
        // Try to access tweetnacl from @solana/web3.js's internal dependencies
        const web3Module = await import('@solana/web3.js');
        // Check if tweetnacl is available in the module
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nacl = (web3Module as any).nacl;
      } catch {
        // Fallback: try to access from global scope
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nacl = (globalThis as any).nacl;
      }

      if (!nacl || !nacl.sign || !nacl.sign.detached) {
        throw new Error('ed25519 signing library not available');
      }

      // Sign the message using ed25519
      const signature = nacl.sign.detached(message, privateKey);

      return new Uint8Array(signature);
    } catch (error) {
      throw new Error(`Message signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    await this.ensureWalletAvailable();

    if (!this.keypair || !this.publicKey) {
      throw new Error('Wallet keypair not available');
    }

    // Verify the transaction is for our public key
    if (!transaction.feePayer?.equals(this.publicKey)) {
      throw new Error('Transaction fee payer does not match wallet');
    }

    try {
      transaction.sign(this.keypair);
      return transaction;
    } catch (error) {
      throw new Error(`Transaction signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sign multiple transactions
   */
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    await this.ensureWalletAvailable();

    const signedTransactions: Transaction[] = [];

    for (const transaction of transactions) {
      const signed = await this.signTransaction(transaction);
      signedTransactions.push(signed);
    }

    return signedTransactions;
  }
}

// Export singleton instance
export const signerService = new SignerService();