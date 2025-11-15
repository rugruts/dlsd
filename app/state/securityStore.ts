import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SecuritySettings } from '../../packages/shared-types';

interface SecurityState extends SecuritySettings {
  setBiometricsEnabled: (enabled: boolean) => void;
  setRequireBiometricsForSend: (enabled: boolean) => void;
  setRequireBiometricsForSwap: (enabled: boolean) => void;
  setRequireBiometricsForStaking: (enabled: boolean) => void;
  setLedgerConnected: (connected: boolean, deviceName?: string) => void;
  resetToDefaults: () => void;
}

const defaultSettings: SecuritySettings = {
  biometricsEnabled: false,
  requireBiometricsForSend: false,
  requireBiometricsForSwap: false,
  requireBiometricsForStaking: false,
  ledgerConnected: false,
};

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),

      setRequireBiometricsForSend: (enabled) => set({ requireBiometricsForSend: enabled }),

      setRequireBiometricsForSwap: (enabled) => set({ requireBiometricsForSwap: enabled }),

      setRequireBiometricsForStaking: (enabled) => set({ requireBiometricsForStaking: enabled }),

      setLedgerConnected: (connected, deviceName) => set({
        ledgerConnected: connected,
        ledgerDeviceName: deviceName,
      }),

      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'security-storage',
      // Only persist certain settings, not runtime state
      partialize: (state) => ({
        biometricsEnabled: state.biometricsEnabled,
        requireBiometricsForSend: state.requireBiometricsForSend,
        requireBiometricsForSwap: state.requireBiometricsForSwap,
        requireBiometricsForStaking: state.requireBiometricsForStaking,
        ledgerConnected: state.ledgerConnected,
        ledgerDeviceName: state.ledgerDeviceName,
      }),
    }
  )
);