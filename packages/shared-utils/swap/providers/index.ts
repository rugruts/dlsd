import { SwapProvider, SwapProviderId, SwapNetwork } from '../types';
import { jupiterProvider } from './jupiterProvider';
import { gorbaganaAmmProvider } from './gorbaganaAmmProvider';

/**
 * Registry of all available swap providers
 */
const ALL_PROVIDERS: SwapProvider[] = [
  jupiterProvider,
  gorbaganaAmmProvider,
];

/**
 * Get all swap providers that support a specific network
 * @param network - The blockchain network
 * @returns Array of providers that support the network
 */
export function getProvidersForNetwork(network: SwapNetwork): SwapProvider[] {
  return ALL_PROVIDERS.filter(p => p.supportedNetworks.includes(network));
}

/**
 * Get the default (recommended) swap provider for a network
 * @param network - The blockchain network
 * @returns The default provider for the network
 * @throws Error if no providers support the network
 */
export function getDefaultProviderForNetwork(network: SwapNetwork): SwapProvider {
  if (network === 'solana') {
    return jupiterProvider;
  }
  
  if (network === 'gorbagana') {
    return gorbaganaAmmProvider;
  }

  throw new Error(`No default provider configured for network: ${network}`);
}

/**
 * Get a swap provider by its ID
 * @param id - The provider ID
 * @returns The provider instance
 * @throws Error if provider not found
 */
export function getProviderById(id: SwapProviderId): SwapProvider {
  const provider = ALL_PROVIDERS.find(p => p.id === id);
  if (!provider) {
    throw new Error(`Unknown swap provider: ${id}`);
  }
  return provider;
}

/**
 * Get all available swap providers
 * @returns Array of all registered providers
 */
export function getAllProviders(): SwapProvider[] {
  return [...ALL_PROVIDERS];
}

/**
 * Check if a provider ID is valid
 * @param id - The provider ID to check
 * @returns true if the provider exists
 */
export function isValidProviderId(id: string): id is SwapProviderId {
  return ALL_PROVIDERS.some(p => p.id === id);
}

// Re-export providers for direct access if needed
export { jupiterProvider } from './jupiterProvider';
export { gorbaganaAmmProvider } from './gorbaganaAmmProvider';

