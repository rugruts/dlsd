/**
 * Multi-Wallet Store V2 (Extension)
 * Chrome extension version with chrome.storage persistence
 */

import type { MultiWalletState } from '@dumpsack/shared-types';
import { MAX_WALLETS } from '@dumpsack/shared-types';
import {
  deriveWalletAtIndex,
  createWalletRef,
  getNextWalletIndex,
  reorderWallets as reorderWalletsUtil,
  isWalletNameUnique,
  encryptMnemonic,
  decryptMnemonic,
  type EncryptedMnemonic,
  getSupabase,
} from '@dumpsack/shared-utils';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Secure storage keys
const MNEMONIC_KEY = 'dumpsack_mnemonic_v2';
const SESSION_SALT_KEY = 'dumpsack_session_salt'; // Salt for session-based encryption
const WALLETS_TABLE = 'user_wallets'; // Supabase table for wallet metadata

/**
 * Save wallet metadata to Supabase
 * This links wallets to the user's email account
 */
async function saveWalletsToSupabase(wallets: any[]): Promise<void> {
  try {
    const supabase = getSupabase();

    // Retry logic to wait for session to be established
    let user = null;
    let retries = 0;
    const maxRetries = 5;

    while (!user && retries < maxRetries) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        user = currentUser;
        break;
      }
      retries++;
      if (retries < maxRetries) {
        console.log(`Waiting for user session... (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!user) {
      console.warn('No authenticated user after retries, skipping Supabase wallet save');
      return;
    }

    console.log('Saving wallets for user:', user.id);

    // Save wallet list to Supabase using upsert
    const { error } = await supabase
      .from(WALLETS_TABLE)
      .upsert(
        {
          user_id: user.id,
          wallets: wallets,
          updated_at: new Date().toISOString(),
        }
      );

    if (error) {
      console.error('Failed to save wallets to Supabase:', error);
      console.error('Error details:', error.message, error.code);
    } else {
      console.log('Wallets saved to Supabase successfully for user:', user.id);
    }
  } catch (error) {
    console.error('Error saving wallets to Supabase:', error);
  }
}

/**
 * Restore wallet metadata from Supabase
 * This retrieves wallets linked to the user's email account
 */
async function restoreWalletsFromSupabase(): Promise<any[] | null> {
  try {
    const supabase = getSupabase();

    // Retry logic to wait for session to be established
    let user = null;
    let retries = 0;
    const maxRetries = 5;

    while (!user && retries < maxRetries) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        user = currentUser;
        break;
      }
      retries++;
      if (retries < maxRetries) {
        console.log(`Waiting for user session to restore wallets... (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!user) {
      console.warn('No authenticated user after retries, cannot restore wallets from Supabase');
      return null;
    }

    console.log('Attempting to restore wallets for user:', user.id);

    const { data, error } = await supabase
      .from(WALLETS_TABLE)
      .select('wallets')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found - this is expected for new users
        console.log('No wallets found in Supabase for user:', user.id);
        return null;
      }
      console.error('Failed to restore wallets from Supabase:', error);
      console.error('Error details:', error.message, error.code);
      return null;
    }

    if (data?.wallets && data.wallets.length > 0) {
      console.log(`Successfully restored ${data.wallets.length} wallet(s) from Supabase`);
      return data.wallets;
    }

    console.log('No wallets in Supabase record');
    return null;
  } catch (error) {
    console.error('Error restoring wallets from Supabase:', error);
    return null;
  }
}

interface WalletStoreState extends MultiWalletState {
  // Actions
  addWallet: () => Promise<void>;
  importFromMnemonic: (mnemonic: string, startIndex?: number) => Promise<void>;
  renameWallet: (index: number, name: string) => void;
  reorderWallets: (fromIndex: number, toIndex: number) => void;
  removeWallet: (index: number) => Promise<void>;
  setActive: (index: number) => void;
  toggleHidden: (index: number) => void;
  getMnemonic: () => Promise<string>;

  // Internal
  _setState: (state: Partial<WalletStoreState>) => void;
}

// Helper: Get encrypted mnemonic from chrome storage
async function getEncryptedMnemonic(): Promise<EncryptedMnemonic | null> {
  try {
    const result = await chrome.storage.local.get([MNEMONIC_KEY]);
    const data = result[MNEMONIC_KEY] as EncryptedMnemonic | string | undefined;

    // Handle legacy plaintext mnemonic (migration)
    if (typeof data === 'string') {
      console.warn('Found legacy plaintext mnemonic - migration required');
      return null;
    }

    if (!data) {
      return null;
    }

    // Validate it has the required properties
    if (!data.version || !data.salt || !data.iv || !data.ciphertext) {
      console.warn('Invalid encrypted mnemonic structure');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get encrypted mnemonic:', error);
    return null;
  }
}

// Helper: Save encrypted mnemonic to chrome storage
async function saveEncryptedMnemonic(encrypted: EncryptedMnemonic): Promise<void> {
  try {
    await chrome.storage.local.set({ [MNEMONIC_KEY]: encrypted });
  } catch (error) {
    console.error('Failed to save encrypted mnemonic:', error);
    throw new Error('Failed to save encrypted mnemonic');
  }
}

// Helper: Get or create session salt (stored in Supabase for persistence)
async function getSessionSalt(): Promise<string> {
  try {
    const supabase = getSupabase();

    // Retry logic to wait for user to be authenticated
    let user = null;
    let retries = 0;
    const maxRetries = 10;

    while (!user && retries < maxRetries) {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        user = currentUser;
        break;
      }
      retries++;
      if (retries < maxRetries) {
        console.log(`Waiting for user session to get salt... (attempt ${retries}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    if (!user) {
      console.warn('No authenticated user after retries, using local salt only');
      // Fall back to local storage only
      const result = await chrome.storage.local.get([SESSION_SALT_KEY]);
      const existingSalt = result[SESSION_SALT_KEY] as string | undefined;

      if (existingSalt && typeof existingSalt === 'string') {
        return existingSalt;
      }

      // Generate new salt if none exists
      const salt = crypto.randomUUID();
      await chrome.storage.local.set({ [SESSION_SALT_KEY]: salt });
      return salt;
    }

    // Try to get salt from Supabase first (for persistence across devices)
    const { data } = await supabase
      .from('user_wallets')
      .select('salt')
      .eq('user_id', user.id)
      .single();

    if (data?.salt && typeof data.salt === 'string') {
      console.log('Using existing salt from Supabase');
      // Also cache locally for faster access
      await chrome.storage.local.set({ [SESSION_SALT_KEY]: data.salt });
      return data.salt;
    }

    // If not in Supabase, check local storage (for backward compatibility)
    const result = await chrome.storage.local.get([SESSION_SALT_KEY]);
    const existingSalt = result[SESSION_SALT_KEY] as string | undefined;

    if (existingSalt && typeof existingSalt === 'string') {
      console.log('Using existing salt from local storage');
      // Save to Supabase for future devices (non-blocking)
      try {
        await supabase
          .from('user_wallets')
          .update({ salt: existingSalt })
          .eq('user_id', user.id);
        console.log('Salt saved to Supabase');
      } catch (err) {
        console.warn('Failed to save salt to Supabase:', err);
      }
      return existingSalt;
    }

    // Generate new salt
    const salt = crypto.randomUUID();
    console.log('Generated new salt:', salt);

    // Save to both local storage and Supabase
    await chrome.storage.local.set({ [SESSION_SALT_KEY]: salt });
    try {
      await supabase
        .from('user_wallets')
        .upsert({
          user_id: user.id,
          salt: salt,
          wallets: [],
          updated_at: new Date().toISOString(),
        });
      console.log('New salt saved to Supabase');
    } catch (err) {
      console.warn('Failed to save salt to Supabase:', err);
    }

    return salt;
  } catch (error) {
    console.error('Failed to get session salt:', error);
    // Fall back to local storage only
    const result = await chrome.storage.local.get([SESSION_SALT_KEY]);
    const existingSalt = result[SESSION_SALT_KEY] as string | undefined;

    if (existingSalt && typeof existingSalt === 'string') {
      console.warn('Using local salt as fallback');
      return existingSalt;
    }

    // Last resort: generate new salt
    const salt = crypto.randomUUID();
    await chrome.storage.local.set({ [SESSION_SALT_KEY]: salt });
    return salt;
  }
}

// Helper: Get session-based passphrase (derived from user session + salt)
async function getSessionPassphrase(): Promise<string> {
  const { getSupabase } = await import('@dumpsack/shared-utils');
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error('No active session');
  }

  const salt = await getSessionSalt();
  // Derive passphrase from user ID + salt (deterministic but unique per install)
  return `${session.user.id}:${salt}`;
}

interface StoredState {
  state: {
    wallets: Array<{ publicKey: string; [key: string]: unknown }>;
    [key: string]: unknown;
  };
  version?: number;
}

// Helper: Validate and sanitize stored state before hydration
function validateStoredState(storedState: unknown): StoredState | null {
  if (!storedState || typeof storedState !== 'object') {
    return null;
  }

  const state = storedState as Record<string, unknown>;

  if (!state.state || typeof state.state !== 'object') {
    return null;
  }

  try {
    const stateObj = state.state as Record<string, unknown>;
    const { wallets } = stateObj;

    if (!Array.isArray(wallets)) {
      console.warn('Invalid wallets array in stored state');
      return null;
    }

    // Validate each wallet's publicKey
    for (const wallet of wallets) {
      if (!wallet || typeof wallet !== 'object') {
        console.warn('Invalid wallet object');
        return null;
      }

      const walletObj = wallet as Record<string, unknown>;

      if (!walletObj.publicKey || typeof walletObj.publicKey !== 'string') {
        console.warn('Wallet missing publicKey, clearing storage');
        return null;
      }

      // Check if publicKey contains only valid base58 characters
      if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(walletObj.publicKey)) {
        console.warn('Invalid base58 publicKey detected, clearing storage');
        return null;
      }

      // Additional length check (Solana public keys are 32-44 chars in base58)
      if (walletObj.publicKey.length < 32 || walletObj.publicKey.length > 44) {
        console.warn('Invalid publicKey length, clearing storage');
        return null;
      }
    }

    return storedState as StoredState;
  } catch (error) {
    console.error('Error validating stored state:', error);
    return null;
  }
}

export const useWalletStore = create<WalletStoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      wallets: [],
      activeIndex: 0,
      version: 1,

      // Internal setState
      _setState: (state) => set(state),

      // Import from mnemonic
      importFromMnemonic: async (mnemonic: string, startIndex: number = 0) => {
        try {
          // Derive first wallet
          const { publicKey } = deriveWalletAtIndex(mnemonic, startIndex);
          const walletRef = createWalletRef(startIndex, publicKey);

          // Encrypt and save mnemonic with session-based passphrase
          const passphrase = await getSessionPassphrase();
          const encrypted = await encryptMnemonic(mnemonic, passphrase);
          await saveEncryptedMnemonic(encrypted);

          // Update state
          const newWallets = [walletRef];
          set({
            wallets: newWallets,
            activeIndex: 0,
          });

          // Save to Supabase to link wallets to email account
          await saveWalletsToSupabase(newWallets);
        } catch (error) {
          console.error('Failed to import mnemonic:', error);
          throw new Error('Failed to import wallet');
        }
      },

      // Add new wallet
      addWallet: async () => {
        const { wallets } = get();

        if (wallets.length >= MAX_WALLETS) {
          throw new Error(`Maximum ${MAX_WALLETS} wallets allowed`);
        }

        const encrypted = await getEncryptedMnemonic();
        if (!encrypted) {
          throw new Error('No mnemonic found. Please import a wallet first.');
        }

        try {
          // Decrypt mnemonic with session passphrase
          const passphrase = await getSessionPassphrase();
          const mnemonic = await decryptMnemonic(encrypted, passphrase);

          const nextIndex = getNextWalletIndex(wallets);

          if (nextIndex === null) {
            throw new Error('Maximum number of wallets reached');
          }

          const { publicKey } = deriveWalletAtIndex(mnemonic, nextIndex);
          const walletRef = createWalletRef(nextIndex, publicKey);

          const newWallets = [...wallets, walletRef];
          set({
            wallets: newWallets,
          });

          // Save to Supabase to keep wallets in sync
          await saveWalletsToSupabase(newWallets);
        } catch (error) {
          console.error('Failed to add wallet:', error);
          throw new Error('Failed to add wallet');
        }
      },

      // Get mnemonic (for signing transactions)
      getMnemonic: async (): Promise<string> => {
        const encrypted = await getEncryptedMnemonic();
        if (!encrypted) {
          throw new Error('No mnemonic found');
        }

        try {
          const passphrase = await getSessionPassphrase();
          return await decryptMnemonic(encrypted, passphrase);
        } catch (error) {
          console.error('Failed to decrypt mnemonic:', error);
          throw new Error('Failed to access wallet');
        }
      },

      // Restore wallets from Supabase (called after sign-in)
      restoreFromSupabase: async () => {
        try {
          console.log('Starting wallet restoration from Supabase...');
          const restoredWallets = await restoreWalletsFromSupabase();

          if (restoredWallets && restoredWallets.length > 0) {
            console.log(`Found ${restoredWallets.length} wallet(s) in Supabase, updating store...`);

            // Update store state with Supabase wallets
            set({
              wallets: restoredWallets,
              activeIndex: 0,
            });

            // Force persist to save the restored wallets to local storage
            // This ensures Zustand's persist middleware syncs with Supabase data
            await new Promise(resolve => setTimeout(resolve, 100));

            console.log(`Successfully restored and persisted ${restoredWallets.length} wallet(s) from Supabase`);
            return true;
          }

          console.log('No wallets found in Supabase');
          return false;
        } catch (error) {
          console.error('Failed to restore wallets from Supabase:', error);
          return false;
        }
      },

      // Rename wallet
      renameWallet: (index: number, name: string) => {
        const { wallets } = get();
        const wallet = wallets.find((w) => w.index === index);

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        if (!isWalletNameUnique(wallets, name, index)) {
          throw new Error('Wallet name already exists');
        }

        set({
          wallets: wallets.map((w) =>
            w.index === index ? { ...w, name } : w
          ),
        });
      },

      // Reorder wallets
      reorderWallets: (fromIndex: number, toIndex: number) => {
        const { wallets } = get();
        const reordered = reorderWalletsUtil(wallets, fromIndex, toIndex);
        set({ wallets: reordered });
      },

      // Remove wallet
      removeWallet: async (index: number) => {
        const { wallets, activeIndex } = get();

        if (wallets.length === 1) {
          throw new Error('Cannot remove the last wallet');
        }

        const newWallets = wallets.filter((w) => w.index !== index);
        let newActiveIndex = activeIndex;

        // If removing active wallet, switch to first wallet
        if (index === activeIndex) {
          newActiveIndex = newWallets[0].index;
        }

        set({
          wallets: newWallets,
          activeIndex: newActiveIndex,
        });
      },

      // Set active wallet
      setActive: (index: number) => {
        set({ activeIndex: index });
      },

      // Toggle hidden
      toggleHidden: (index: number) => {
        const { wallets, activeIndex } = get();

        if (index === activeIndex) {
          throw new Error('Cannot hide the active wallet');
        }

        set({
          wallets: wallets.map((w) =>
            w.index === index ? { ...w, hidden: !w.hidden } : w
          ),
        });
      },
    }),
    {
      name: 'dumpsack-wallet-v2',
      storage: {
        getItem: async (name) => {
          try {
            const result = await chrome.storage.local.get([name]);
            const data = result[name];

            if (!data) {
              return null;
            }

            // Validate the stored state before returning
            const validatedData = validateStoredState(data);

            if (!validatedData) {
              console.warn('Invalid wallet data detected, clearing storage...');
              await chrome.storage.local.remove([name]);
              return null;
            }

            return validatedData;
          } catch (error) {
            console.error('Error loading wallet data:', error);
            // Clear corrupted data
            try {
              await chrome.storage.local.remove([name]);
            } catch (e) {
              console.error('Failed to clear corrupted data:', e);
            }
            return null;
          }
        },
        setItem: async (name, value) => {
          try {
            await chrome.storage.local.set({ [name]: value });
          } catch (error) {
            console.error('Failed to save wallet data:', error);
          }
        },
        removeItem: async (name) => {
          await chrome.storage.local.remove([name]);
        },
      },
      // Custom deserialize to catch base64 errors
      deserialize: (str) => {
        try {
          return JSON.parse(str);
        } catch (error) {
          console.error('Failed to deserialize wallet data:', error);
          // Return empty state to trigger fresh start
          return { state: { wallets: [], activeIndex: 0 }, version: 0 };
        }
      },
      // Handle rehydration errors gracefully
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('Failed to rehydrate wallet store:', error);
            // Clear corrupted storage
            chrome.storage.local.remove(['dumpsack-wallet-v2']).catch(console.error);
          }
        };
      },
    }
  )
);

