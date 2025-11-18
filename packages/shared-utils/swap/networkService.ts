import { SwapNetwork } from './types';
import { appConfig } from '../index';

/**
 * Network detection and management for swaps
 */

/**
 * Get the current active network based on RPC endpoint
 * @returns The current network ('solana' or 'gorbagana')
 */
export function getCurrentNetwork(): SwapNetwork {
  const rpcUrl = appConfig.rpc.primary.toLowerCase();
  
  // Check if using Gorbagana RPC
  if (rpcUrl.includes('gorbagana')) {
    return 'gorbagana';
  }
  
  // Check for common Solana RPC endpoints
  if (
    rpcUrl.includes('solana') ||
    rpcUrl.includes('mainnet-beta') ||
    rpcUrl.includes('devnet') ||
    rpcUrl.includes('testnet') ||
    rpcUrl.includes('api.mainnet') ||
    rpcUrl.includes('rpc.ankr.com/solana') ||
    rpcUrl.includes('solana.rpcpool.com') ||
    rpcUrl.includes('api.metaplex.solana.com')
  ) {
    return 'solana';
  }
  
  // Default to Gorbagana since that's our primary network
  return 'gorbagana';
}

/**
 * Check if currently on Solana network
 * @returns true if on Solana
 */
export function isSolanaNetwork(): boolean {
  return getCurrentNetwork() === 'solana';
}

/**
 * Check if currently on Gorbagana network
 * @returns true if on Gorbagana
 */
export function isGorbaganaNetwork(): boolean {
  return getCurrentNetwork() === 'gorbagana';
}

/**
 * Get network display name
 * @param network - The network
 * @returns Human-readable network name
 */
export function getNetworkDisplayName(network: SwapNetwork): string {
  switch (network) {
    case 'solana':
      return 'Solana';
    case 'gorbagana':
      return 'Gorbagana';
    default:
      return 'Unknown';
  }
}

/**
 * Get network-specific explorer URL
 * @param network - The network
 * @returns Base URL for the network's explorer
 */
export function getNetworkExplorerUrl(network: SwapNetwork): string {
  switch (network) {
    case 'solana':
      return 'https://solscan.io';
    case 'gorbagana':
      return 'https://trashscan.xyz';
    default:
      return '';
  }
}

/**
 * Build transaction URL for network explorer
 * @param signature - Transaction signature
 * @param network - The network (defaults to current)
 * @returns Full URL to view transaction
 */
export function getTransactionUrl(signature: string, network?: SwapNetwork): string {
  const net = network || getCurrentNetwork();
  const baseUrl = getNetworkExplorerUrl(net);
  return `${baseUrl}/tx/${signature}`;
}

