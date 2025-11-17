import { Keypair } from '@solana/web3.js';
import { SolanaDerive } from '@dumpsack/shared-utils';
import { SecureStorage } from './secureStorage';

/**
 * Service for managing BIP39 mnemonic phrases and deriving Solana keypairs
 * Uses standard BIP39 → SLIP-0010 ed25519 derivation (m/44'/501'/0'/0')
 */
export class MnemonicService {
  /**
   * Import a BIP39 mnemonic and derive a Solana keypair
   * Uses standard derivation path m/44'/501'/0'/0' to match Phantom and other wallets
   *
   * @param mnemonic - BIP39 mnemonic phrase (12 or 24 words)
   * @param userId - User ID for secure storage
   * @param passphrase - Optional BIP39 passphrase (default: empty string)
   * @returns Derived Solana keypair
   */
  static async importMnemonic(
    mnemonic: string,
    userId: string,
    passphrase: string = ''
  ): Promise<Keypair> {
    // Validate mnemonic using BIP39 standard
    if (!SolanaDerive.isValidMnemonic(mnemonic)) {
      throw new Error('Invalid BIP39 mnemonic phrase');
    }

    // Derive keypair using standard BIP39/BIP44 derivation
    const keypair = SolanaDerive.deriveSolanaKeypairFromMnemonic(mnemonic, passphrase);

    // Store encrypted private key
    await SecureStorage.storeSecureItem(`wallet-${userId}`, keypair.secretKey.toString());

    return keypair;
  }

  /**
   * Generate a new BIP39 mnemonic phrase
   *
   * @param strength - Entropy strength (128 = 12 words, 256 = 24 words)
   * @returns New BIP39 mnemonic phrase
   */
  static generateMnemonic(strength: 128 | 256 = 128): string {
    return SolanaDerive.generateMnemonic(strength);
  }

  /**
   * Validate a BIP39 mnemonic phrase
   *
   * @param mnemonic - Mnemonic phrase to validate
   * @returns true if valid BIP39 mnemonic, false otherwise
   */
  static validateMnemonic(mnemonic: string): boolean {
    return SolanaDerive.isValidMnemonic(mnemonic);
  }

  /**
   * Get the public key from a mnemonic without storing it
   * Useful for verification before import
   *
   * @param mnemonic - BIP39 mnemonic phrase
   * @param passphrase - Optional BIP39 passphrase
   * @returns Base58-encoded public key
   */
  static getPublicKeyFromMnemonic(mnemonic: string, passphrase: string = ''): string {
    return SolanaDerive.getPublicKeyFromMnemonic(mnemonic, passphrase);
  }
}