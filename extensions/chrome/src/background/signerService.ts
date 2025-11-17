import { Transaction, PublicKey } from '@dumpsack/shared-utils';

export class SignerService {
  private publicKey: PublicKey | null = null;

  constructor() {
    // Initialize with a placeholder key for demo
    // In production, this would connect to the wallet service
    this.publicKey = new PublicKey('11111111111111111111111111111112');
  }

  setPublicKey(publicKey: string) {
    this.publicKey = new PublicKey(publicKey);
  }

  getPublicKey(): PublicKey | null {
    return this.publicKey;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    if (!this.publicKey) {
      throw new Error('No wallet available');
    }

    // In a real implementation, this would use the wallet service
    // For demo purposes, we'll return a mock signature
    console.warn('Using mock signature - implement real signing');
    return new Uint8Array(64).fill(1); // Mock 64-byte signature
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.publicKey) {
      throw new Error('No wallet available');
    }

    // Verify the transaction is for our public key
    if (!transaction.feePayer?.equals(this.publicKey)) {
      throw new Error('Transaction fee payer does not match wallet');
    }

    // In a real implementation, this would use the wallet service
    // For demo purposes, we'll add a mock signature
    console.warn('Using mock transaction signature - implement real signing');

    // Mock signature (64 bytes)
    const mockSignature = new Uint8Array(64).fill(2);

    // Add the signature to the transaction
    transaction.addSignature(this.publicKey, mockSignature);

    return transaction;
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.publicKey) {
      throw new Error('No wallet available');
    }

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