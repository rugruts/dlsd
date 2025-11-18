import type { PublicKey } from '@solana/web3.js';

/**
 * AMM (Automated Market Maker) Configuration for Gorbagana
 *
 * NOTE: AMM programs are temporarily disabled until we add Gorbagana-native
 * swap support. For now, swaps on Solana network use Jupiter aggregator.
 *
 * Defines available DEX programs and routing preferences for swaps.
 */

export interface AmmProgram {
  id: PublicKey;
  name: string;
  version: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority for routing
}

// TODO: Re-add AMM programs when Gorbagana swap support is implemented
export const AVAILABLE_AMMS: AmmProgram[] = [];

/**
 * Get enabled AMM programs sorted by priority
 */
export function getEnabledAmms(): AmmProgram[] {
  return AVAILABLE_AMMS
    .filter(amm => amm.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get AMM program by ID
 */
export function getAmmById(id: PublicKey): AmmProgram | undefined {
  return AVAILABLE_AMMS.find(amm => amm.id.equals(id));
}

/**
 * Get default AMM (highest priority enabled AMM)
 */
export function getDefaultAmm(): AmmProgram {
  const enabled = getEnabledAmms();
  if (enabled.length === 0) {
    throw new Error('No AMM programs enabled');
  }
  return enabled[0];
}

/**
 * Check if a program ID is a known AMM
 */
export function isKnownAmm(programId: PublicKey): boolean {
  return AVAILABLE_AMMS.some(amm => amm.id.equals(programId));
}

