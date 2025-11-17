/**
 * Multi-Wallet Store (V2)
 * Supports up to 10 derived wallets from a single mnemonic
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { PublicKey } from '@dumpsack/shared-utils';
import { 
  WalletRef, 
  MultiWalletState, 
  MAX_WALLETS,
  getDefaultWalletName,
  truncatePublicKey,
} from '@dumpsack/shared-types';
import {
  deriveWalletAtIndex,
  createWalletRef,
  deriveMultipleWallets,
  getNextWalletIndex,
  reorderWallets as reorderWalletsUtil,
  findWalletByIndex,
  isWalletNameUnique,
  encryptMnemonic,
  decryptMnemonic,
  type EncryptedMnemonic,
  getSupabase,
} from '@dumpsack/shared-utils';
import { getTokenList } from '../services/blockchain/tokenService';
import { getNfts } from '../services/blockchain/nftService';
import { loadCachedTokens, saveTokens, loadCachedNfts, saveNfts } from '../services/blockchain/rpcCache';
import { TokenItem, NftItem } from '../types/wallet';

// Secure storage keys
const MNEMONIC_KEY = 'dumpsack_mnemonic_v2';
const SESSION_SALT_KEY = 'dumpsack_session_salt';
const WALLET_VERSION_KEY = 'dumpsack_wallet_version';

interface WalletDataState {
  balance: number | null;
  tokens: TokenItem[];
  nfts: NftItem[];
  loading: boolean;
  error: string | null;
}

interface WalletStoreState extends MultiWalletState, WalletDataState {
  // Computed properties
  activeWallet: WalletRef | null;

  // Actions
  addWallet: () => Promise<void>;
  importFromMnemonic: (mnemonic: string, startIndex?: number) => Promise<void>;
  renameWallet: (index: number, name: string) => void;
  reorderWallets: (fromIndex: number, toIndex: number) => void;
  removeWallet: (index: number) => Promise<void>;
  setActive: (index: number) => void;
  toggleHidden: (index: number) => void;

  // Data actions
  refresh: () => Promise<void>;
  loadCachedData: () => Promise<void>;

  // Internal
  _setState: (state: Partial<WalletStoreState>) => void;
  _migrate: () => Promise<void>;
}

// Helper: Get or create session salt
async function getSessionSalt(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(SESSION_SALT_KEY);
    if (existing) return existing;

    // Generate new salt
    const salt = crypto.randomUUID();
    await AsyncStorage.setItem(SESSION_SALT_KEY, salt);
    return salt;
  } catch (error) {
    console.error('Failed to get session salt:', error);
    throw new Error('Failed to initialize secure storage');
  }
}

// Helper: Get session-based passphrase
async function getSessionPassphrase(): Promise<string> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('No active session');
  }

  const salt = await getSessionSalt();
  return `${session.user.id}:${salt}`;
}

// Helper: Get encrypted mnemonic from secure storage
async function getEncryptedMnemonic(): Promise<EncryptedMnemonic | null> {
  try {
    const data = await SecureStore.getItemAsync(MNEMONIC_KEY);
    if (!data) return null;

    // Handle legacy plaintext mnemonic
    if (!data.startsWith('{')) {
      console.warn('Found legacy plaintext mnemonic - migration required');
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to get encrypted mnemonic:', error);
    return null;
  }
}

// Helper: Save encrypted mnemonic to secure storage
async function saveEncryptedMnemonic(encrypted: EncryptedMnemonic): Promise<void> {
  try {
    await SecureStore.setItemAsync(MNEMONIC_KEY, JSON.stringify(encrypted), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  } catch (error) {
    console.error('Failed to save encrypted mnemonic:', error);
    throw new Error('Failed to securely store mnemonic');
  }
}

// Helper: Get active wallet
function getActiveWallet(state: WalletStoreState): WalletRef | null {
  return state.wallets[state.activeIndex] || null;
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallets: [],
      activeIndex: 0,
      version: 2,
      balance: null,
      tokens: [],
      nfts: [],
      loading: false,
      error: null,

      // Computed properties
      get activeWallet() {
        return getActiveWallet(get());
      },

      addWallet: async () => {
        const { wallets } = get();

        if (wallets.length >= MAX_WALLETS) {
          throw new Error(`Maximum ${MAX_WALLETS} wallets allowed`);
        }

        const encrypted = await getEncryptedMnemonic();
        if (!encrypted) {
          throw new Error('No mnemonic found. Please import or create a wallet first.');
        }

        try {
          const passphrase = await getSessionPassphrase();
          const mnemonic = await decryptMnemonic(encrypted, passphrase);

          const nextIndex = getNextWalletIndex(wallets);
          if (nextIndex === null) {
            throw new Error('No available wallet slots');
          }

          const { publicKey } = deriveWalletAtIndex(mnemonic, nextIndex);
          const newWallet = createWalletRef(nextIndex, publicKey);

          set({
            wallets: [...wallets, newWallet],
          });
        } catch (error) {
          console.error('Failed to add wallet:', error);
          throw new Error('Failed to add wallet');
        }
      },

      importFromMnemonic: async (mnemonic: string, startIndex: number = 0) => {
        try {
          // Derive first wallet
          const newWallets = deriveMultipleWallets(mnemonic, startIndex, 1);

          // Encrypt and save mnemonic
          const passphrase = await getSessionPassphrase();
          const encrypted = await encryptMnemonic(mnemonic, passphrase);
          await saveEncryptedMnemonic(encrypted);

          // Set version marker
          await AsyncStorage.setItem(WALLET_VERSION_KEY, '2');

          set({
            wallets: newWallets,
            activeIndex: 0,
            version: 2,
          });

          // Load data for new wallet
          await get().refresh();
        } catch (error) {
          console.error('Failed to import mnemonic:', error);
          throw new Error('Failed to import wallet');
        }
      },

      renameWallet: (index: number, name: string) => {
        const { wallets } = get();
        const wallet = findWalletByIndex(wallets, index);

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        if (!isWalletNameUnique(wallets, name, index)) {
          throw new Error('Wallet name must be unique');
        }

        set({
          wallets: wallets.map(w =>
            w.index === index ? { ...w, name } : w
          ),
        });
      },

      reorderWallets: (fromIndex: number, toIndex: number) => {
        const { wallets, activeIndex } = get();
        const newWallets = reorderWalletsUtil(wallets, fromIndex, toIndex);

        // Adjust activeIndex if the active wallet was moved
        let newActiveIndex = activeIndex;
        if (fromIndex === activeIndex) {
          newActiveIndex = toIndex;
        } else if (fromIndex < activeIndex && toIndex >= activeIndex) {
          newActiveIndex--;
        } else if (fromIndex > activeIndex && toIndex <= activeIndex) {
          newActiveIndex++;
        }

        set({
          wallets: newWallets,
          activeIndex: newActiveIndex,
        });
      },

      removeWallet: async (index: number) => {
        const { wallets, activeIndex } = get();

        if (wallets.length <= 1) {
          throw new Error('Cannot remove the last wallet');
        }

        const walletIndex = wallets.findIndex(w => w.index === index);
        if (walletIndex === -1) {
          throw new Error('Wallet not found');
        }

        const newWallets = wallets.filter(w => w.index !== index);

        // Adjust activeIndex if needed
        let newActiveIndex = activeIndex;
        if (walletIndex === activeIndex) {
          // If removing active wallet, switch to first wallet
          newActiveIndex = 0;
        } else if (walletIndex < activeIndex) {
          // If removing a wallet before active, decrement activeIndex
          newActiveIndex--;
        }

        set({
          wallets: newWallets,
          activeIndex: newActiveIndex,
        });

        // Refresh data for new active wallet
        await get().refresh();
      },

      setActive: (index: number) => {
        const { wallets } = get();
        const walletIndex = wallets.findIndex(w => w.index === index);

        if (walletIndex === -1) {
          throw new Error('Wallet not found');
        }

        set({ activeIndex: walletIndex });

        // Load data for new active wallet
        get().refresh();
      },

      toggleHidden: (index: number) => {
        const { wallets } = get();

        set({
          wallets: wallets.map(w =>
            w.index === index ? { ...w, hidden: !w.hidden } : w
          ),
        });
      },

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
        const activeWallet = getActiveWallet(get());
        if (!activeWallet) return;

        set({ loading: true, error: null });

        try {
          const pubkey = new PublicKey(activeWallet.publicKey);

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

      _migrate: async () => {
        // Migration from V1 (single wallet) to V2 (multi-wallet)
        // This will be called automatically by the persist middleware
        const version = await AsyncStorage.getItem(WALLET_VERSION_KEY);

        if (version === '2') {
          // Already migrated
          return;
        }

        // Check if there's a V1 wallet (stored in authStore)
        // For now, we'll handle this in the app initialization
        console.log('Wallet store migration needed');
      },
    }),
    {
      name: 'wallet-storage-v2',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({
        wallets: state.wallets,
        activeIndex: state.activeIndex,
        version: state.version,
      }),
    }
  )
);

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


