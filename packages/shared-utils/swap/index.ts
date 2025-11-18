/**
 * Swap Module
 * 
 * Provider-based swap architecture supporting multiple networks and DEX aggregators.
 * 
 * Architecture:
 * - SwapProvider interface: Common interface for all swap providers
 * - Jupiter Provider: Solana swaps via Jupiter aggregator
 * - Gorbagana AMM Provider: Native Gorbagana swaps (coming soon)
 * - Network detection: Automatic network detection based on RPC endpoint
 * - Provider registry: Centralized provider management
 */

// Export types
export type {
  SwapNetwork,
  SwapProviderId,
  SwapQuoteRequest,
  SwapQuote,
  SwapResult,
  SwapProvider,
  SwapProviderConfig,
} from './types';

// Export providers
export {
  getProvidersForNetwork,
  getDefaultProviderForNetwork,
  getProviderById,
  getAllProviders,
  isValidProviderId,
  jupiterProvider,
  gorbaganaAmmProvider,
} from './providers';

// Export network utilities
export {
  getCurrentNetwork,
  isSolanaNetwork,
  isGorbaganaNetwork,
  getNetworkDisplayName,
  getNetworkExplorerUrl,
  getTransactionUrl,
} from './networkService';

