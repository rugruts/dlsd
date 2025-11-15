import { Keypair } from '@solana/web3.js';
import { SecureStorage } from './secureStorage';

export class MnemonicService {
  static async importMnemonic(mnemonic: string, userId: string): Promise<Keypair> {
    // TODO: Use bip39 to validate and derive seed from mnemonic
    // For now, simple hash derivation
    const seed = new TextEncoder().encode(mnemonic + userId);
    const hash = await crypto.subtle.digest('SHA-256', seed);
    const hashArray = new Uint8Array(hash);
    const keypair = Keypair.fromSeed(hashArray.slice(0, 32));

    // Store encrypted private key
    await SecureStorage.storeSecureItem(`wallet-${userId}`, keypair.secretKey.toString());

    return keypair;
  }

  static validateMnemonic(mnemonic: string): boolean {
    // TODO: Implement proper BIP39 validation
    const words = mnemonic.trim().split(/\s+/);
    return words.length === 12 || words.length === 24; // Basic check
  }
}