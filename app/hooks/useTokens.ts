import { useState, useEffect, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createRpcClient } from '../services/blockchain/rpcClient';
import { TokenHolding } from '../services/blockchain/models';

const rpcClient = createRpcClient();

export function useTokens(pubkey: PublicKey | null) {
  const [tokens, setTokens] = useState<TokenHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!pubkey) return;

    setLoading(true);
    setError(null);

    try {
      const tokenList = await rpcClient.getTokenAccounts(pubkey);
      setTokens(tokenList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [pubkey]);

  return useMemo(() => ({
    tokens,
    loading,
    error,
    refresh,
  }), [tokens, loading, error]);
}