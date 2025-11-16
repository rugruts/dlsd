import { useState, useEffect, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createRpcClient } from '../services/blockchain/rpcClient';

const rpcClient = createRpcClient();
const CACHE_KEY_PREFIX = 'balance_cache_';
const CACHE_DURATION = 30000; // 30 seconds

export function useBalance(pubkey: PublicKey | null) {
  const [balance, setBalance] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!pubkey) return;

    setLoading(true);
    setError(null);

    try {
      const bal = await rpcClient.getBalance(pubkey);
      setBalance(bal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [pubkey]);

  return useMemo(() => ({
    balance,
    loading,
    error,
    refresh,
  }), [balance, loading, error]);
}