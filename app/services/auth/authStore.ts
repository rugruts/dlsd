import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AuthProvider = 'apple' | 'google' | 'x' | 'mnemonic';

export interface AuthState {
  userId: string | null;
  alias: string | null;
  hasWallet: boolean;
  publicKey: string | null;
  isAuthenticated: boolean;
  authProvider: AuthProvider | null;
  setUserId: (userId: string) => void;
  setAlias: (alias: string) => void;
  setHasWallet: (hasWallet: boolean) => void;
  setPublicKey: (publicKey: string) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAuthProvider: (provider: AuthProvider) => void;
  login: (userId: string, provider: AuthProvider) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      alias: null,
      hasWallet: false,
      publicKey: null,
      isAuthenticated: false,
      authProvider: null,
      setUserId: (userId) => set({ userId }),
      setAlias: (alias) => set({ alias }),
      setHasWallet: (hasWallet) => set({ hasWallet }),
      setPublicKey: (publicKey) => set({ publicKey }),
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      setAuthProvider: (provider) => set({ authProvider: provider }),
      login: (userId, provider) =>
        set({
          userId,
          authProvider: provider,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          userId: null,
          alias: null,
          hasWallet: false,
          publicKey: null,
          isAuthenticated: false,
          authProvider: null,
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);