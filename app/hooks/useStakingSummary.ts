import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { stakingService } from '../services/staking/stakingService';
import { StakingSummary } from '../../packages/shared-types';

export function useStakingSummary(walletPubkey: PublicKey | null) {
  const [summary, setSummary] = useState<StakingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    if (!walletPubkey) {
      setSummary(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newSummary = await stakingService.getStakingSummary(walletPubkey);
      setSummary(newSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get staking summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [walletPubkey?.toBase58()]);

  const refresh = () => {
    fetchSummary();
  };

  return {
    summary,
    loading,
    error,
    refresh,
  };
}