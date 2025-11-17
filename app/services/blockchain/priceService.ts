/**
 * Real Price Service for Gorbagana tokens
 * Uses CoinGecko API for price data
 */

import { TOKEN_REGISTRY, getTokenMetadata } from './tokenRegistry';

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  lastUpdated?: number;
}

interface CoinGeckoPriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    last_updated_at?: number;
  };
}

/**
 * CoinGecko API configuration
 */
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const PRICE_CACHE_TTL = 60000; // 1 minute cache

/**
 * Price cache to avoid excessive API calls
 */
const priceCache = new Map<string, { data: PriceData; timestamp: number }>();

export class PriceService {
  /**
   * Get price for a single token by symbol
   */
  static async getPrice(symbol: string): Promise<PriceData | null> {
    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < PRICE_CACHE_TTL) {
      return cached.data;
    }

    // Find token in registry
    const token = Object.values(TOKEN_REGISTRY).find(t => t.symbol === symbol);
    if (!token?.coingeckoId) {
      console.warn(`No CoinGecko ID for token: ${symbol}`);
      return null;
    }

    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${token.coingeckoId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24h_vol=true&include_last_updated_at=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoPriceResponse = await response.json();
      const priceInfo = data[token.coingeckoId];

      if (!priceInfo) {
        return null;
      }

      const priceData: PriceData = {
        symbol,
        price: priceInfo.usd,
        change24h: priceInfo.usd_24h_change || 0,
        marketCap: priceInfo.usd_market_cap,
        volume24h: priceInfo.usd_24h_vol,
        lastUpdated: priceInfo.last_updated_at,
      };

      // Cache the result
      priceCache.set(symbol, { data: priceData, timestamp: Date.now() });

      return priceData;
    } catch (error) {
      console.error(`Failed to fetch price for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get prices for multiple tokens by symbol
   */
  static async getPrices(symbols: string[]): Promise<Record<string, PriceData>> {
    // Get all CoinGecko IDs
    const coingeckoIds: string[] = [];
    const symbolToId: Record<string, string> = {};

    for (const symbol of symbols) {
      const token = Object.values(TOKEN_REGISTRY).find(t => t.symbol === symbol);
      if (token?.coingeckoId) {
        coingeckoIds.push(token.coingeckoId);
        symbolToId[token.coingeckoId] = symbol;
      }
    }

    if (coingeckoIds.length === 0) {
      return {};
    }

    try {
      const response = await fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=${coingeckoIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24h_vol=true&include_last_updated_at=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data: CoinGeckoPriceResponse = await response.json();
      const results: Record<string, PriceData> = {};

      for (const [coingeckoId, priceInfo] of Object.entries(data)) {
        const symbol = symbolToId[coingeckoId];
        if (symbol) {
          const priceData: PriceData = {
            symbol,
            price: priceInfo.usd,
            change24h: priceInfo.usd_24h_change || 0,
            marketCap: priceInfo.usd_market_cap,
            volume24h: priceInfo.usd_24h_vol,
            lastUpdated: priceInfo.last_updated_at,
          };

          results[symbol] = priceData;
          priceCache.set(symbol, { data: priceData, timestamp: Date.now() });
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      return {};
    }
  }

  /**
   * Clear price cache
   */
  static clearCache(): void {
    priceCache.clear();
  }
}