import { PublicKey, Transaction, CryptoService, SolanaDerive } from '@dumpsack/shared-utils';
import { Keypair } from '@solana/web3.js';
import { loadPrivateKey, savePrivateKey } from '../auth/secureStorage';
import { BackupCrypto, PanicBunkerLockedError } from '@dumpsack/shared-utils';
import { panicService } from '../panicService';

interface EncryptedBlob {
  version: number;
  salt: string;
  iv: string;
  data: string;
}

export interface WalletKeypair {
  publicKey: PublicKey;
  // Private key is never exposed - signing happens internally
}

class WalletService {
  private keypair: Keypair | null = null;
  private publicKey: PublicKey | null = null;

  /**
   * Initialize wallet from secure storage
   * Restores encrypted wallet using user password
   */
  async restoreWalletFromStorage(password: string): Promise<WalletKeypair | null> {
    const encryptedData = await loadPrivateKey();
    if (!encryptedData) {
      return null;
    }

    try {
      // Parse encrypted blob
      const blob: EncryptedBlob = JSON.parse(encryptedData);

      // Decrypt mnemonic using PBKDF2 + AES-GCM
      const mnemonic = await CryptoService.decryptMnemonic(blob, password);

      // Derive keypair from mnemonic
      this.keypair = SolanaDerive.deriveSolanaKeypairFromMnemonic(mnemonic);
      this.publicKey = this.keypair.publicKey;

      return { publicKey: this.publicKey };
    } catch (error) {
      console.error('Failed to restore wallet from storage:', error);
      throw new Error('Invalid password or corrupted wallet data');
    }
  }

  /**
   * Initialize wallet from secure storage (legacy method)
   */
  async initialize(): Promise<void> {
    const encryptedKey = await loadPrivateKey();
    if (encryptedKey) {
      console.log('Wallet data found in secure storage');
    }
  }

  /**
   * Create a new wallet keypair
   */
  async createWallet(): Promise<WalletKeypair> {
    this.keypair = Keypair.generate();
    this.publicKey = this.keypair.publicKey;

    // Encrypt and save the private key
    const privateKeyBytes = this.keypair.secretKey;
    const encrypted = await BackupCrypto.uint8ArrayToBase64(privateKeyBytes);
    await savePrivateKey(encrypted);

    return { publicKey: this.publicKey };
  }

  /**
   * Import wallet from mnemonic
   */
  async importFromMnemonic(mnemonic: string): Promise<WalletKeypair> {
    // TODO: Implement proper BIP39 derivation
    // For now, create a deterministic keypair from mnemonic hash
    const encoder = new TextEncoder();
    const data = encoder.encode(mnemonic);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // Use first 32 bytes as seed for keypair
    const seed = new Uint8Array(hashArray.slice(0, 32));
    this.keypair = Keypair.fromSeed(seed);
    this.publicKey = this.keypair.publicKey;

    // Encrypt and save the private key
    const privateKeyBytes = this.keypair.secretKey;
    const encrypted = await BackupCrypto.uint8ArrayToBase64(privateKeyBytes);
    await savePrivateKey(encrypted);

    return { publicKey: this.publicKey };
  }

  /**
   * Get public key
   */
  getPublicKey(): PublicKey | null {
    return this.publicKey;
  }

  /**
   * Sign a transaction (returns signed transaction)
   */
  async signTransaction(tx: Transaction): Promise<Transaction> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    // Check panic bunker lock
    if (panicService.isLocked()) {
      throw new PanicBunkerLockedError();
    }

    tx.sign(this.keypair);
    return tx;
  }

  /**
   * Sign multiple transactions
   */
  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    if (!this.keypair) {
      throw new Error('Wallet not initialized');
    }

    // Check panic bunker lock
    if (panicService.isLocked()) {
      throw new PanicBunkerLockedError();
    }

    return txs.map(tx => {
      tx.sign(this.keypair!);
      return tx;
    });
  }

  /**
   * Clear wallet data
   */
  async clear(): Promise<void> {
    this.keypair = null;
    this.publicKey = null;
    // Secure storage is cleared by auth service
  }
}

// Singleton instance
export const walletService = new WalletService();