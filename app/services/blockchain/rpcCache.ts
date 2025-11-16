import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenItem, NftItem } from '../../types/wallet';

const TOKENS_CACHE_KEY = 'wallet_tokens_cache';
const NFTS_CACHE_KEY = 'wallet_nfts_cache';
const CACHE_EXPIRY_MS = 60 * 1000; // 60 seconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export async function loadCachedTokens(): Promise<TokenItem[] | null> {
  try {
    const cached = await AsyncStorage.getItem(TOKENS_CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry<TokenItem[]> = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
      return null; // Expired
    }

    return entry.data;
  } catch (error) {
    console.error('Failed to load cached tokens:', error);
    return null;
  }
}

export async function saveTokens(tokens: TokenItem[]): Promise<void> {
  try {
    const entry: CacheEntry<TokenItem[]> = {
      data: tokens,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(TOKENS_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to save tokens cache:', error);
  }
}

export async function loadCachedNfts(): Promise<NftItem[] | null> {
  try {
    const cached = await AsyncStorage.getItem(NFTS_CACHE_KEY);
    if (!cached) return null;

    const entry: CacheEntry<NftItem[]> = JSON.parse(cached);
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
      return null; // Expired
    }

    return entry.data;
  } catch (error) {
    console.error('Failed to load cached NFTs:', error);
    return null;
  }
}

export async function saveNfts(nfts: NftItem[]): Promise<void> {
  try {
    const entry: CacheEntry<NftItem[]> = {
      data: nfts,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(NFTS_CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to save NFTs cache:', error);
  }
}