import { create } from 'zustand';
import { PublicKey } from '@dumpsack/shared-utils/solana';
import { useAuthStore } from './authStore';
import { getTokenList } from '../services/blockchain/tokenService';
import { getNfts } from '../services/blockchain/nftService';
import { loadCachedTokens, saveTokens, loadCachedNfts, saveNfts } from '../services/blockchain/rpcCache';
import { TokenItem, NftItem } from '../types/wallet';

interface WalletState {
  balance: number | null;
  tokens: TokenItem[];
  nfts: NftItem[];
  loading: boolean;
  error: string | null;
}

interface WalletActions {
  refresh: () => Promise<void>;
  loadCachedData: () => Promise<void>;
  _setState: (state: Partial<WalletState>) => void;
}

type WalletStore = WalletState & WalletActions;

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  balance: null,
  tokens: [],
  nfts: [],
  loading: false,
  error: null,

  loadCachedData: async () => {
    const [cachedTokens, cachedNfts] = await Promise.all([
      loadCachedTokens(),
      loadCachedNfts(),
    ]);

    if (cachedTokens || cachedNfts) {
      set({
        tokens: cachedTokens || [],
        nfts: cachedNfts || [],
        balance: cachedTokens?.find(t => t.symbol === 'GOR')?.balance || null,
      });
    }
  },

  refresh: async () => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) return;

    set({ loading: true, error: null });

    try {
      const pubkey = new PublicKey(publicKey);

      // Fetch fresh data with retry logic
      const [tokens, nfts] = await Promise.all([
        retryOperation(() => getTokenList(pubkey), 2),
        retryOperation(() => getNfts(pubkey), 2),
      ]);

      // Update cache
      await Promise.all([
        saveTokens(tokens),
        saveNfts(nfts),
      ]);

      // Update state
      const balance = tokens.find(t => t.symbol === 'GOR')?.balance || null;
      set({
        balance,
        tokens,
        nfts,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to refresh wallet data:', error);
      set({
        loading: false,
        error: 'Failed to load wallet data. Using cached data if available.',
      });
    }
  },

  _setState: (state) => set(state),
}));

// Retry utility
async function retryOperation<T>(operation: () => Promise<T>, maxRetries: number): Promise<T> {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries) throw error;
      console.warn(`Operation failed, retrying (${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
}

// Initialize cached data on store creation
useWalletStore.getState().loadCachedData();