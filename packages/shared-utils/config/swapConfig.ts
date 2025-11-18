import { PublicKey } from '@solana/web3.js';
import { GBA_AMM_PROGRAMS } from './gorbaganaPrograms';

/**
 * AMM (Automated Market Maker) Configuration for Gorbagana
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

export const AVAILABLE_AMMS: AmmProgram[] = [
  {
    id: GBA_AMM_PROGRAMS.trashbinCpammV3,
    name: 'Trashbin CPAMM',
    version: 'v3',
    enabled: true,
    priority: 1, // Highest priority - default
  },
  {
    id: GBA_AMM_PROGRAMS.trashbinCpammV2,
    name: 'Trashbin CPAMM',
    version: 'v2',
    enabled: true,
    priority: 2,
  },
  {
    id: GBA_AMM_PROGRAMS.meteoraDammV2Fork,
    name: 'Meteora DAMM',
    version: 'v2',
    enabled: true,
    priority: 3,
  },
  {
    id: GBA_AMM_PROGRAMS.meteoraBondingCurveFork,
    name: 'Meteora Bonding Curve',
    version: 'v1',
    enabled: true,
    priority: 4,
  },
  {
    id: GBA_AMM_PROGRAMS.trashbinCpamm,
    name: 'Trashbin CPAMM',
    version: 'v1',
    enabled: false, // Legacy version, disabled by default
    priority: 5,
  },
];

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

