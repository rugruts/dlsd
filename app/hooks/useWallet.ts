import { useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWalletStore } from '../state/walletStoreV2';

export function useWallet() {
  const { activeWallet, wallets } = useWalletStore();

  // Convert string publicKey to PublicKey object
  const publicKey = useMemo(() => {
    if (!activeWallet?.publicKey) return null;
    try {
      return new PublicKey(activeWallet.publicKey);
    } catch {
      return null;
    }
  }, [activeWallet?.publicKey]);

  const ready = publicKey !== null && wallets.length > 0;

  const refresh = () => {
    // Force reload keypair if needed
    // For now, no-op
  };

  return useMemo(() => ({
    publicKey,
    ready,
    refresh,
    activeWallet,
    wallets,
  }), [publicKey, ready, activeWallet, wallets]);
}