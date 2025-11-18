import { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { swapService } from '../services/swaps/swapService';
import type { SwapQuote } from '@dumpsack/shared-utils';

export function useSwapQuote(
  inputMint: PublicKey | null,
  outputMint: PublicKey | null,
  amount: bigint | null,
  slippageBps: number = 50
) {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inputMint || !outputMint || !amount || amount <= 0) {
      setQuote(null);
      setError(null);
      return;
    }

    const fetchQuote = async () => {
      setLoading(true);
      setError(null);

      try {
        const newQuote = await swapService.getQuote(inputMint, outputMint, amount, slippageBps);
        setQuote(newQuote);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get quote');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchQuote, 300);

    return () => clearTimeout(timeoutId);
  }, [inputMint?.toBase58(), outputMint?.toBase58(), amount?.toString(), slippageBps]);

  const refresh = () => {
    if (inputMint && outputMint && amount) {
      const fetchQuote = async () => {
        setLoading(true);
        setError(null);

        try {
          const newQuote = await swapService.getQuote(inputMint, outputMint, amount, slippageBps);
          setQuote(newQuote);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to get quote');
          setQuote(null);
        } finally {
          setLoading(false);
        }
      };

      fetchQuote();
    }
  };

  return {
    quote,
    loading,
    error,
    refresh,
  };
}