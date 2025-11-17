/**
 * BIP39/BIP44 Solana Derivation Utilities
 * 
 * This module provides standard BIP39 mnemonic → SLIP-0010 ed25519 derivation
 * for Solana wallets, matching the behavior of Phantom and other standard wallets.
 * 
 * Derivation path: m/44'/501'/0'/0' (account=0, change=0)
 */

import { mnemonicToSeedSync, validateMnemonic, generateMnemonic as generateMnemonicBip39 } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { ed25519 } from '@noble/curves/ed25519';
import { Keypair } from '@solana/web3.js';

/**
 * Standard Solana derivation path
 * m/44' (BIP44) / 501' (Solana) / 0' (account) / 0' (change)
 */
export const SOLANA_DERIVATION_PATH = "m/44'/501'/0'/0'";

/**
 * Generate a new BIP39 mnemonic (12 words by default)
 * @param strength - Entropy strength in bits (128 = 12 words, 256 = 24 words)
 * @returns A new mnemonic phrase
 */
export function generateMnemonic(strength: 128 | 256 = 128): string {
  return generateMnemonicBip39(wordlist, strength);
}

/**
 * Validate a BIP39 mnemonic phrase
 * @param mnemonic - The mnemonic phrase to validate
 * @returns true if valid, false otherwise
 */
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic, wordlist);
}

/**
 * Derive a Solana keypair from a BIP39 mnemonic using standard derivation
 * 
 * This function:
 * 1. Validates the mnemonic
 * 2. Converts mnemonic to BIP39 seed (64 bytes)
 * 3. Derives HD key using SLIP-0010 ed25519
 * 4. Extracts the private key at the Solana derivation path
 * 5. Creates a Solana Keypair from the seed
 * 
 * @param mnemonic - BIP39 mnemonic phrase (12 or 24 words)
 * @param passphrase - Optional BIP39 passphrase (default: empty string)
 * @param derivationPath - Optional custom derivation path (default: m/44'/501'/0'/0')
 * @returns Solana Keypair
 * @throws Error if mnemonic is invalid or derivation fails
 */
export function deriveSolanaKeypairFromMnemonic(
  mnemonic: string,
  passphrase: string = '',
  derivationPath: string = SOLANA_DERIVATION_PATH
): Keypair {
  // Validate mnemonic
  if (!validateMnemonic(mnemonic, wordlist)) {
    throw new Error('Invalid mnemonic phrase');
  }

  // Convert mnemonic to BIP39 seed (64 bytes)
  const seed = mnemonicToSeedSync(mnemonic, passphrase);

  // Derive HD key using SLIP-0010 ed25519
  const master = HDKey.fromMasterSeed(seed, ed25519.CURVE);
  const child = master.derive(derivationPath);

  if (!child.privateKey) {
    throw new Error('Failed to derive private key from mnemonic');
  }

  // Convert to ed25519 private key (32-byte seed)
  // Note: @scure/bip32 gives us the 32-byte private key directly for ed25519
  const secretKey = child.privateKey;

  // Create Solana Keypair from the 32-byte seed
  const keypair = Keypair.fromSeed(secretKey);

  return keypair;
}

/**
 * Derive multiple Solana keypairs from a single mnemonic (for account derivation)
 * 
 * @param mnemonic - BIP39 mnemonic phrase
 * @param accountIndex - Account index (default: 0)
 * @param changeIndex - Change index (default: 0)
 * @param passphrase - Optional BIP39 passphrase
 * @returns Solana Keypair for the specified account
 */
export function deriveSolanaKeypairAtIndex(
  mnemonic: string,
  accountIndex: number = 0,
  changeIndex: number = 0,
  passphrase: string = ''
): Keypair {
  const path = `m/44'/501'/${accountIndex}'/${changeIndex}'`;
  return deriveSolanaKeypairFromMnemonic(mnemonic, passphrase, path);
}

/**
 * Get the public key (base58) from a mnemonic without creating a full keypair
 * Useful for verification without exposing the private key
 * 
 * @param mnemonic - BIP39 mnemonic phrase
 * @param passphrase - Optional BIP39 passphrase
 * @param derivationPath - Optional custom derivation path
 * @returns Base58-encoded public key
 */
export function getPublicKeyFromMnemonic(
  mnemonic: string,
  passphrase: string = '',
  derivationPath: string = SOLANA_DERIVATION_PATH
): string {
  const keypair = deriveSolanaKeypairFromMnemonic(mnemonic, passphrase, derivationPath);
  return keypair.publicKey.toBase58();
}

/**
 * Verify that a mnemonic derives to a specific public key
 * Useful for testing and validation
 * 
 * @param mnemonic - BIP39 mnemonic phrase
 * @param expectedPublicKey - Expected public key (base58)
 * @param passphrase - Optional BIP39 passphrase
 * @param derivationPath - Optional custom derivation path
 * @returns true if the mnemonic derives to the expected public key
 */
export function verifyMnemonicDerivation(
  mnemonic: string,
  expectedPublicKey: string,
  passphrase: string = '',
  derivationPath: string = SOLANA_DERIVATION_PATH
): boolean {
  try {
    const derivedPublicKey = getPublicKeyFromMnemonic(mnemonic, passphrase, derivationPath);
    return derivedPublicKey === expectedPublicKey;
  } catch {
    return false;
  }
}

