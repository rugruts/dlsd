import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthProvider = 'google' | 'apple' | 'x' | 'mnemonic';

interface AuthState {
  userId?: string;
  alias?: string;
  publicKey?: string;
  hasWallet: boolean;
  isAuthenticated: boolean;
  authProvider?: AuthProvider;
}

interface AuthActions {
  signInWithProvider: (provider: 'google' | 'apple' | 'x') => Promise<void>;
  importMnemonic: (mnemonic: string) => Promise<void>;
  createAlias: (alias: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Internal actions
  _setAuthenticated: (state: Partial<AuthState>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      hasWallet: false,
      isAuthenticated: false,

      signInWithProvider: async (provider) => {
        // TODO: Implement OAuth flow with zkLogin
        // For now, simulate successful auth
        const mockUserId = `user_${Date.now()}`;
        const mockPublicKey = `mock_pubkey_${mockUserId}`;

        set({
          userId: mockUserId,
          publicKey: mockPublicKey,
          hasWallet: true,
          isAuthenticated: false, // Not fully authenticated until alias is set
          authProvider: provider,
        });
      },

      importMnemonic: async (mnemonic) => {
        // TODO: Validate and derive wallet from mnemonic
        // For now, simulate successful import
        const mockUserId = `imported_${Date.now()}`;
        const mockPublicKey = `imported_pubkey_${mockUserId}`;

        set({
          userId: mockUserId,
          publicKey: mockPublicKey,
          hasWallet: true,
          isAuthenticated: false, // Not fully authenticated until alias is set
          authProvider: 'mnemonic',
        });
      },

      createAlias: async (alias) => {
        // TODO: Register alias via aliasService
        // For now, just set it
        set({
          alias,
          isAuthenticated: true,
        });
      },

      signOut: async () => {
        // TODO: Clear secure storage
        set({
          userId: undefined,
          alias: undefined,
          publicKey: undefined,
          hasWallet: false,
          isAuthenticated: false,
          authProvider: undefined,
        });
      },

      _setAuthenticated: (state) => set(state),
    }),
    {
      name: 'auth-storage',
      // Only persist certain fields
      partialize: (state) => ({
        userId: state.userId,
        alias: state.alias,
        publicKey: state.publicKey,
        hasWallet: state.hasWallet,
        isAuthenticated: state.isAuthenticated,
        authProvider: state.authProvider,
      }),
    }
  )
);