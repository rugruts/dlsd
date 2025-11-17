/**
 * Multi-Wallet Store V2 (Extension)
 * Chrome extension version with chrome.storage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WalletRef,
  MultiWalletState,
  MAX_WALLETS,
  getDefaultWalletName,
} from '@dumpsack/shared-types';
import {
  deriveWalletAtIndex,
  createWalletRef,
  getNextWalletIndex,
  reorderWallets as reorderWalletsUtil,
  isWalletNameUnique,
  encryptMnemonic,
  decryptMnemonic,
  type EncryptedMnemonic,
} from '@dumpsack/shared-utils';

// Secure storage keys
const MNEMONIC_KEY = 'dumpsack_mnemonic_v2';
const SESSION_SALT_KEY = 'dumpsack_session_salt'; // Salt for session-based encryption

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
    const data = result[MNEMONIC_KEY];

    // Handle legacy plaintext mnemonic (migration)
    if (typeof data === 'string') {
      console.warn('Found legacy plaintext mnemonic - migration required');
      return null;
    }

    return data || null;
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

// Helper: Get or create session salt
async function getSessionSalt(): Promise<string> {
  try {
    const result = await chrome.storage.local.get([SESSION_SALT_KEY]);
    if (result[SESSION_SALT_KEY]) {
      return result[SESSION_SALT_KEY];
    }

    // Generate new salt
    const salt = crypto.randomUUID();
    await chrome.storage.local.set({ [SESSION_SALT_KEY]: salt });
    return salt;
  } catch (error) {
    console.error('Failed to get session salt:', error);
    throw new Error('Failed to initialize secure storage');
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
          set({
            wallets: [walletRef],
            activeIndex: 0,
          });
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
          const { publicKey } = deriveWalletAtIndex(mnemonic, nextIndex);
          const walletRef = createWalletRef(nextIndex, publicKey);

          set({
            wallets: [...wallets, walletRef],
          });
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
          const result = await chrome.storage.local.get([name]);
          return result[name] || null;
        },
        setItem: async (name, value) => {
          await chrome.storage.local.set({ [name]: value });
        },
        removeItem: async (name) => {
          await chrome.storage.local.remove([name]);
        },
      },
    }
  )
);

