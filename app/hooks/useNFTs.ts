import { useState, useEffect, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { createRpcClient } from '../services/blockchain/rpcClient';
import { NftItem } from '../services/blockchain/models';

const rpcClient = createRpcClient();

export function useNFTs(pubkey: PublicKey | null) {
  const [nfts, setNfts] = useState<NftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    if (!pubkey) return;

    setLoading(true);
    setError(null);

    try {
      const nftList = await rpcClient.getNFTs(pubkey);
      setNfts(nftList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [pubkey]);

  return useMemo(() => ({
    nfts,
    loading,
    error,
    refresh,
  }), [nfts, loading, error]);
}