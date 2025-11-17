/**
 * Multi-Wallet Derivation & Management
 * Handles BIP44 derivation for multiple Solana accounts from a single mnemonic
 */

import { Keypair } from '@solana/web3.js';
import { deriveSolanaKeypairAtIndex } from './solanaDerive';
import { WalletRef, getDefaultWalletName, MAX_WALLETS } from '@dumpsack/shared-types';

/**
 * Derive a wallet at a specific index
 * Path: m/44'/501'/{index}'/0'
 */
export function deriveWalletAtIndex(
  mnemonic: string,
  index: number,
  passphrase: string = ''
): { publicKey: string; keypair: Keypair } {
  if (index < 0 || index >= MAX_WALLETS) {
    throw new Error(`Wallet index must be between 0 and ${MAX_WALLETS - 1}`);
  }

  const keypair = deriveSolanaKeypairAtIndex(mnemonic, index, 0, passphrase);
  const publicKey = keypair.publicKey.toBase58();

  return { publicKey, keypair };
}

/**
 * Create a WalletRef from derivation
 */
export function createWalletRef(
  index: number,
  publicKey: string,
  name?: string
): WalletRef {
  return {
    index,
    name: name || getDefaultWalletName(index),
    publicKey,
    createdAt: Date.now(),
  };
}

/**
 * Derive multiple wallets from mnemonic
 * Used for initial import or adding multiple wallets at once
 */
export function deriveMultipleWallets(
  mnemonic: string,
  startIndex: number = 0,
  count: number = 1,
  passphrase: string = ''
): WalletRef[] {
  if (startIndex < 0 || startIndex >= MAX_WALLETS) {
    throw new Error(`Start index must be between 0 and ${MAX_WALLETS - 1}`);
  }

  if (count < 1 || startIndex + count > MAX_WALLETS) {
    throw new Error(`Cannot derive ${count} wallets starting at index ${startIndex}`);
  }

  const wallets: WalletRef[] = [];

  for (let i = 0; i < count; i++) {
    const index = startIndex + i;
    const { publicKey } = deriveWalletAtIndex(mnemonic, index, passphrase);
    wallets.push(createWalletRef(index, publicKey));
  }

  return wallets;
}

/**
 * Validate wallet index
 */
export function isValidWalletIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < MAX_WALLETS;
}

/**
 * Get next available wallet index
 */
export function getNextWalletIndex(existingWallets: WalletRef[]): number | null {
  if (existingWallets.length >= MAX_WALLETS) {
    return null;
  }

  const usedIndices = new Set(existingWallets.map(w => w.index));
  
  for (let i = 0; i < MAX_WALLETS; i++) {
    if (!usedIndices.has(i)) {
      return i;
    }
  }

  return null;
}

/**
 * Reorder wallets array
 */
export function reorderWallets(
  wallets: WalletRef[],
  fromIndex: number,
  toIndex: number
): WalletRef[] {
  if (fromIndex === toIndex) return wallets;
  if (fromIndex < 0 || fromIndex >= wallets.length) return wallets;
  if (toIndex < 0 || toIndex >= wallets.length) return wallets;

  const result = [...wallets];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);

  return result;
}

/**
 * Find wallet by public key
 */
export function findWalletByPublicKey(
  wallets: WalletRef[],
  publicKey: string
): WalletRef | undefined {
  return wallets.find(w => w.publicKey === publicKey);
}

/**
 * Find wallet by index
 */
export function findWalletByIndex(
  wallets: WalletRef[],
  index: number
): WalletRef | undefined {
  return wallets.find(w => w.index === index);
}

/**
 * Check if wallet name is unique
 */
export function isWalletNameUnique(
  wallets: WalletRef[],
  name: string,
  excludeIndex?: number
): boolean {
  return !wallets.some(w => 
    w.name.toLowerCase() === name.toLowerCase() && 
    w.index !== excludeIndex
  );
}

