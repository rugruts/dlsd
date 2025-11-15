import { useMemo } from 'react';
import { walletService } from '../services/blockchain/walletService';

export function useWallet() {
  const publicKey = walletService.getPublicKey();
  const ready = publicKey !== null;

  const refresh = () => {
    // Force reload keypair if needed
    // For now, no-op
  };

  return useMemo(() => ({
    publicKey,
    ready,
    refresh,
  }), [publicKey, ready]);
}