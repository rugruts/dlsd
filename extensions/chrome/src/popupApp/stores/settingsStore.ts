/**
 * Settings Store (Chrome Extension)
 * Manages user preferences: currency, language, theme, custom RPC networks
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Currency = 'USD' | 'EUR' | 'GBP';
export type Language = 'en' | 'es';
export type Theme = 'system' | 'light' | 'dark';

export interface NetworkEntry {
  id: string;
  name: string;
  url: string;
  isDefault?: boolean;
  latencyMs?: number;
  lastCheckedAt?: number;
}

interface SettingsState {
  currency: Currency;
  language: Language;
  theme: Theme;
  networks: NetworkEntry[];
  activeNetworkId: string;
  
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

// Get env from Vite
function getEnv(key: string): string | undefined {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key] as string;
    }
  } catch {}
  return undefined;
}

const getDefaultNetworks = (): NetworkEntry[] => {
  const primary = getEnv('VITE_GBA_RPC_PRIMARY') || 'https://rpc.gorbagana.wtf/';
  const fallback = getEnv('VITE_GBA_RPC_FALLBACK');

  const networks: NetworkEntry[] = [
    { id: 'primary', name: 'Gorbagana RPC', url: primary, isDefault: true },
  ];

  if (fallback) {
    networks.push({ id: 'fallback', name: 'Fallback RPC', url: fallback });
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
        const id = crypto.randomUUID ? crypto.randomUUID() : `network_${Date.now()}`;
        set(s => ({ networks: [...s.networks, { ...n, id }] }));
        return id;
      },

      updateNetwork: (id, patch) => set(s => ({
        networks: s.networks.map(n => n.id === id ? { ...n, ...patch } : n)
      })),

      removeNetwork: (id) => {
        const { networks, activeNetworkId } = get();
        if (networks.length <= 1) {
          throw new Error('Cannot remove the last network');
        }
        const network = networks.find(n => n.id === id);
        if (network?.isDefault) {
          throw new Error('Cannot remove the default network');
        }
        set({
          networks: networks.filter(n => n.id !== id),
          activeNetworkId: activeNetworkId === id ? 'primary' : activeNetworkId,
        });
      },

      setActiveNetwork: (id) => {
        const { networks } = get();
        if (!networks.find(n => n.id === id)) {
          throw new Error('Network not found');
        }
        set({ activeNetworkId: id });
      },

      setDefaultNetwork: (id) => {
        const { networks } = get();
        if (!networks.find(n => n.id === id)) {
          throw new Error('Network not found');
        }
        set({
          networks: networks.map(n => ({ ...n, isDefault: n.id === id }))
        });
      },

      recordLatency: (id, latency) => set(s => ({
        networks: s.networks.map(n => 
          n.id === id ? { ...n, latencyMs: latency, lastCheckedAt: Date.now() } : n
        )
      })),

      resetToDefaults: () => set(defaultState),
    }),
    {
      name: 'dumpsack_settings_v1',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const result = await chrome.storage.local.get(name);
          return result[name] || null;
        },
        setItem: async (name, value) => {
          await chrome.storage.local.set({ [name]: value });
        },
        removeItem: async (name) => {
          await chrome.storage.local.remove(name);
        },
      })),
    }
  )
);

