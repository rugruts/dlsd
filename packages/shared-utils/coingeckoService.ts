/**
 * Coingecko Service - Fetch top 10 Solana tokens
 * Caches results for 24 hours
 */

export interface CoingeckoToken {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
}

const CACHE_KEY = 'dumpsack_top_tokens_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: CoingeckoToken[];
  timestamp: number;
}

async function fetchFromCoingecko(): Promise<CoingeckoToken[]> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/coins/markets?' +
      'vs_currency=usd&' +
      'category=solana-ecosystem&' +
      'order=market_cap_desc&' +
      'per_page=10&' +
      'page=1&' +
      'sparkline=false'
    );

    if (!response.ok) {
      throw new Error(`Coingecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from Coingecko:', error);
    throw error;
  }
}

function getCacheFromStorage(): CacheEntry | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    return JSON.parse(cached);
  } catch {
    return null;
  }
}

function setCacheInStorage(data: CoingeckoToken[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to cache tokens:', error);
  }
}

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION;
}

export async function getTopSolanaTokens(): Promise<CoingeckoToken[]> {
  // Check cache first
  const cached = getCacheFromStorage();
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  // Fetch fresh data
  const tokens = await fetchFromCoingecko();
  setCacheInStorage(tokens);
  return tokens;
}

export function clearTokenCache(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear token cache:', error);
  }
}

