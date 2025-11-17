/**
 * Multi-Wallet Types
 * Supports up to 10 derived wallets from a single mnemonic
 */

export interface WalletRef {
  /** Derivation index (0-9) */
  index: number;
  
  /** User-assigned label */
  name: string;
  
  /** Base58 public key */
  publicKey: string;
  
  /** Creation timestamp */
  createdAt: number;
  
  /** Hidden from main UI (optional) */
  hidden?: boolean;
}

export interface MultiWalletState {
  /** List of derived wallets (max 10) */
  wallets: WalletRef[];
  
  /** Index of currently active wallet */
  activeIndex: number;
  
  /** Schema version for migrations */
  version: number;
}

/** Maximum number of wallets allowed */
export const MAX_WALLETS = 10;

/** Default wallet names */
export const DEFAULT_WALLET_NAMES = [
  'Main',
  'Trading',
  'Savings',
  'DeFi',
  'NFTs',
  'Gaming',
  'Airdrops',
  'Cold Storage',
  'Wallet 9',
  'Wallet 10',
];

/** Generate default name for wallet at index */
export function getDefaultWalletName(index: number): string {
  return DEFAULT_WALLET_NAMES[index] || `Wallet ${index + 1}`;
}

/** Get initials for wallet avatar */
export function getWalletInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Truncate public key for display */
export function truncatePublicKey(publicKey: string, chars: number = 4): string {
  if (publicKey.length <= chars * 2) return publicKey;
  return `${publicKey.slice(0, chars)}...${publicKey.slice(-chars)}`;
}

