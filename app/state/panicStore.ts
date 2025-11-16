import { create } from 'zustand';
import { panicService } from '../services/panicService';
import { PanicState, EmergencySweepParams, EmergencySweepResult } from '../types/panicBunker';

interface PanicStore extends PanicState {
  loading: boolean;
  error?: string;

  // Actions
  lock(): Promise<void>;
  unlockBiometric(): Promise<boolean>;
  unlockPassphrase(passphrase: string): Promise<boolean>;
  setSafeAddress(address: string): Promise<void>;
  setAutoLockEnabled(enabled: boolean): Promise<void>;
  runEmergencySweep(params: EmergencySweepParams): Promise<EmergencySweepResult>;
  refresh(): Promise<void>;
  _setState: (state: Partial<PanicStore>) => void;
}

export const usePanicStore = create<PanicStore>((set, get) => ({
  // Initial state
  locked: false,
  safeAddress: undefined,
  lockedAt: undefined,
  autoLockEnabled: true,
  lastUnlockedAt: undefined,
  loading: false,
  error: undefined,

  lock: async (): Promise<void> => {
    set({ loading: true, error: undefined });

    try {
      await panicService.lockWallet();
      await get().refresh();
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to lock wallet',
      });
      throw error;
    }
  },

  unlockBiometric: async (): Promise<boolean> => {
    set({ loading: true, error: undefined });

    try {
      const result = await panicService.unlockWalletWithBiometrics();
      if (result.success) {
        await get().refresh();
        set({ loading: false });
        return true;
      } else {
        set({
          loading: false,
          error: result.error || 'Biometric authentication failed',
        });
        return false;
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Biometric unlock failed',
      });
      return false;
    }
  },

  unlockPassphrase: async (passphrase: string): Promise<boolean> => {
    set({ loading: true, error: undefined });

    try {
      const result = await panicService.unlockWalletWithPassphrase(passphrase);
      if (result.success) {
        await get().refresh();
        set({ loading: false });
        return true;
      } else {
        set({
          loading: false,
          error: result.error || 'Invalid passphrase',
        });
        return false;
      }
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Passphrase unlock failed',
      });
      return false;
    }
  },

  setSafeAddress: async (address: string): Promise<void> => {
    set({ loading: true, error: undefined });

    try {
      await panicService.setSafeAddress(address);
      await get().refresh();
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to set safe address',
      });
      throw error;
    }
  },

  setAutoLockEnabled: async (enabled: boolean): Promise<void> => {
    set({ loading: true, error: undefined });

    try {
      await panicService.setAutoLockEnabled(enabled);
      await get().refresh();
      set({ loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update auto-lock setting',
      });
      throw error;
    }
  },

  runEmergencySweep: async (params: EmergencySweepParams): Promise<EmergencySweepResult> => {
    set({ loading: true, error: undefined });

    try {
      const result = await panicService.triggerEmergencySweep(params);
      set({ loading: false });
      return result;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Emergency sweep failed',
      });
      throw error;
    }
  },

  refresh: async (): Promise<void> => {
    try {
      const panicState = await panicService.loadPanicState();
      set({
        ...panicState,
        error: undefined,
      });
    } catch (error) {
      console.warn('Failed to refresh panic state:', error);
    }
  },

  _setState: (state) => set(state),
}));