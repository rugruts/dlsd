/**
 * Settings Store
 * Manages user preferences: currency, language, theme, custom RPC networks
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Currency = 'USD' | 'EUR' | 'GBP';
export type Language = 'en' | 'es';
export type Theme = 'system' | 'light' | 'dark';

export interface NetworkEntry {
  id: string;          // uuid v4
  name: string;        // "Gorbagana RPC", "My Node"
  url: string;
  isDefault?: boolean; // only one default at a time
  latencyMs?: number;  // last probe
  lastCheckedAt?: number;
}

interface SettingsState {
  currency: Currency;
  language: Language;
  theme: Theme;
  networks: NetworkEntry[];
  activeNetworkId: string;     // current selected network
  
  // Actions
  setCurrency: (c: Currency) => void;
  setLanguage: (l: Language) => void;
  setTheme: (t: Theme) => void;
  addNetwork: (n: Omit<NetworkEntry, 'id'>) => string;
  updateNetwork: (id: string, patch: Partial<NetworkEntry>) => void;
  removeNetwork: (id: string) => void;
  setActiveNetwork: (id: string) => void;
  setDefaultNetwork: (id: string) => void;
  recordLatency: (id: string, latency: number) => void;
  resetToDefaults: () => void;
}

// Helper to get env var (cross-platform)
function getEnv(key: string): string | undefined {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch {}
  return undefined;
}

// Default networks from environment
const getDefaultNetworks = (): NetworkEntry[] => {
  const primary = getEnv('EXPO_PUBLIC_GBA_RPC_PRIMARY') || 'https://rpc.gorbagana.wtf/';
  const fallback = getEnv('EXPO_PUBLIC_GBA_RPC_FALLBACK');

  const networks: NetworkEntry[] = [
    { 
      id: 'primary', 
      name: 'Gorbagana RPC', 
      url: primary, 
      isDefault: true 
    },
  ];

  if (fallback) {
    networks.push({
      id: 'fallback',
      name: 'Fallback RPC',
      url: fallback,
    });
  }

  return networks;
};

const defaultState = {
  currency: 'USD' as Currency,
  language: 'en' as Language,
  theme: 'dark' as Theme,
  networks: getDefaultNetworks(),
  activeNetworkId: 'primary',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setCurrency: (currency) => set({ currency }),
      
      setLanguage: (language) => set({ language }),
      
      setTheme: (theme) => set({ theme }),

      addNetwork: (n) => {
        // Generate UUID (fallback to timestamp if crypto.randomUUID not available)
        const id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `network_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        set(s => ({ 
          networks: [...s.networks, { ...n, id }] 
        }));
        
        return id;
      },

      updateNetwork: (id, patch) => set(s => ({
        networks: s.networks.map(n => 
          n.id === id ? { ...n, ...patch } : n
        )
      })),

      removeNetwork: (id) => {
        const { networks, activeNetworkId } = get();
        
        // Prevent removing the last network
        if (networks.length <= 1) {
          throw new Error('Cannot remove the last network');
        }

        // Prevent removing default network
        const network = networks.find(n => n.id === id);
        if (network?.isDefault) {
          throw new Error('Cannot remove the default network. Set another network as default first.');
        }

        set({
          networks: networks.filter(n => n.id !== id),
          activeNetworkId: activeNetworkId === id ? 'primary' : activeNetworkId,
        });
      },

      setActiveNetwork: (id) => {
        const { networks } = get();
        const network = networks.find(n => n.id === id);
        
        if (!network) {
          throw new Error('Network not found');
        }

        set({ activeNetworkId: id });
      },

      setDefaultNetwork: (id) => {
        const { networks } = get();
        const network = networks.find(n => n.id === id);
        
        if (!network) {
          throw new Error('Network not found');
        }

        set({
          networks: networks.map(n => ({ 
            ...n, 
            isDefault: n.id === id 
          }))
        });
      },

      recordLatency: (id, latency) => set(s => ({
        networks: s.networks.map(n => 
          n.id === id 
            ? { ...n, latencyMs: latency, lastCheckedAt: Date.now() } 
            : n
        )
      })),

      resetToDefaults: () => set(defaultState),
    }),
    {
      name: 'dumpsack_settings_v1',
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
    }
  )
);

