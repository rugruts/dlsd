import { useState, useEffect, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';

import { createRpcClient } from '../services/blockchain/rpcClient';
import { TokenHolding } from '../services/blockchain/models';
import { PriceService } from '../services/blockchain/priceService';

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

      // Fetch prices for all tokens with symbols
      const symbolsForPricing = tokenList
        .filter(token => token.symbol)
        .map(token => token.symbol!);

      if (symbolsForPricing.length > 0) {
        try {
          const prices = await PriceService.getPrices(symbolsForPricing);

          // Enrich tokens with price data
          for (const token of tokenList) {
            if (token.symbol && prices[token.symbol]) {
              const priceData = prices[token.symbol];
              token.price = priceData.price;
              const balance = Number(token.amount) / Math.pow(10, token.decimals);
              token.usdValue = balance * priceData.price;
            }
          }
        } catch (priceError) {
          console.error('Failed to fetch token prices:', priceError);
          // Continue without prices
        }
      }

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