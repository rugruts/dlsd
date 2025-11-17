/**
 * Network Service (Chrome Extension)
 * Manages RPC connections and network health monitoring
 */

import { Connection } from '@solana/web3.js';
import { useSettingsStore } from '../popupApp/stores/settingsStore';

export function getActiveRpcUrl(): string {
  const { networks, activeNetworkId } = useSettingsStore.getState();
  const activeNetwork = networks.find(n => n.id === activeNetworkId);
  
  if (!activeNetwork) {
    const fallback = networks[0] || { url: 'https://rpc.gorbagana.wtf/' };
    return fallback.url;
  }

  return activeNetwork.url;
}

export function getDefaultRpcUrl(): string {
  const { networks } = useSettingsStore.getState();
  const defaultNetwork = networks.find(n => n.isDefault);
  
  if (!defaultNetwork) {
    return networks[0]?.url || 'https://rpc.gorbagana.wtf/';
  }

  return defaultNetwork.url;
}

export function getConnection(commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'): Connection {
  const url = getActiveRpcUrl();
  return new Connection(url, commitment);
}

export async function probeLatency(url: string, timeoutMs: number = 5000): Promise<number> {
  const startTime = Date.now();
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const connection = new Connection(url, 'confirmed');
    await connection.getSlot();
    
    clearTimeout(timeoutId);
    
    return Date.now() - startTime;
  } catch (error) {
    console.error(`Failed to probe ${url}:`, error);
    return -1;
  }
}

export async function probeAllNetworks(): Promise<void> {
  const { networks, recordLatency } = useSettingsStore.getState();
  
  const probes = networks.map(async (network) => {
    const latency = await probeLatency(network.url);
    if (latency > 0) {
      recordLatency(network.id, latency);
    }
  });

  await Promise.allSettled(probes);
}

export function getLatencyColor(latencyMs?: number): 'success' | 'warning' | 'error' | 'neutral' {
  if (!latencyMs || latencyMs < 0) return 'neutral';
  if (latencyMs < 200) return 'success';
  if (latencyMs < 600) return 'warning';
  return 'error';
}

export function formatLatency(latencyMs?: number): string {
  if (!latencyMs || latencyMs < 0) return 'Unknown';
  return `${latencyMs}ms`;
}

export function isValidRpcUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function testRpcConnection(url: string): Promise<boolean> {
  try {
    const connection = new Connection(url, 'confirmed');
    await connection.getSlot();
    return true;
  } catch {
    return false;
  }
}

export async function switchNetwork(networkId: string): Promise<void> {
  const { setActiveNetwork, networks } = useSettingsStore.getState();
  
  const network = networks.find(n => n.id === networkId);
  if (!network) {
    throw new Error('Network not found');
  }

  const isValid = await testRpcConnection(network.url);
  if (!isValid) {
    throw new Error('Failed to connect to network');
  }

  setActiveNetwork(networkId);
}

export function getNetworkById(id: string) {
  const { networks } = useSettingsStore.getState();
  return networks.find(n => n.id === id);
}

export function getActiveNetwork() {
  const { networks, activeNetworkId } = useSettingsStore.getState();
  return networks.find(n => n.id === activeNetworkId);
}

