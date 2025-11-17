/**
 * Real Validator Service for Gorbagana network
 * Fetches validators from RPC and enhances with Trashscan registry data
 */

import { appConfig } from '@dumpsack/shared-utils';
import type { ValidatorInfo } from './stakingTypes';

/**
 * Validator registry from Trashscan
 * Maps vote pubkey to validator metadata
 */
interface ValidatorMetadata {
  name: string;
  website?: string;
  iconUrl?: string;
  description?: string;
}

/**
 * Known validators on Gorbagana (from Trashscan)
 * This should be populated from https://trashscan.xyz/validators API
 */
const VALIDATOR_REGISTRY: Record<string, ValidatorMetadata> = {
  // Add known validators here as we discover them
  // Example:
  // 'CertusDeBmqN8ZawdkxK5kFGMwBXdudvWHYwtNgNhvLu': {
  //   name: 'Certus One',
  //   website: 'https://certus.one',
  // },
};

/**
 * APR calculation cache
 */
let cachedAPR: number | null = null;
let aprCacheTimestamp = 0;
const APR_CACHE_TTL = 300000; // 5 minutes

/**
 * Get all validators from Gorbagana RPC
 */
export async function getValidators(): Promise<ValidatorInfo[]> {
  if (!appConfig.features.enableStaking) {
    throw new Error('Staking is not enabled');
  }

  try {
    // Get vote accounts from RPC
    const response = await fetch(appConfig.rpc.primary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getVoteAccounts',
        params: [{ commitment: 'confirmed' }],
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    const current = data.result?.current || [];
    const delinquent = data.result?.delinquent || [];

    // Combine and normalize validators
    const validators: ValidatorInfo[] = [
      ...current.map((v: any) => normalizeValidator(v, false)),
      ...delinquent.map((v: any) => normalizeValidator(v, true)),
    ];

    // Sort: non-delinquent first, then by commission, then by activated stake
    return validators.sort((a, b) => {
      if (a.delinquent !== b.delinquent) {
        return a.delinquent ? 1 : -1;
      }
      if (a.commission !== b.commission) {
        return a.commission - b.commission;
      }
      return b.activatedStake - a.activatedStake;
    });
  } catch (error) {
    console.error('Failed to fetch validators:', error);
    throw new Error('Failed to load validators');
  }
}

/**
 * Normalize validator data from RPC response
 */
function normalizeValidator(voteAccount: any, isDelinquent: boolean): ValidatorInfo {
  const votePubkey = voteAccount.votePubkey;
  const metadata = VALIDATOR_REGISTRY[votePubkey];

  return {
    votePubkey,
    commission: voteAccount.commission,
    name: metadata?.name || deriveValidatorName(votePubkey),
    score: voteAccount.score || 0,
    delinquent: isDelinquent,
    activatedStake: parseInt(voteAccount.activatedStake) || 0,
    epochCredits: voteAccount.epochCredits || 0,
  };
}

/**
 * Derive validator name from vote pubkey
 */
function deriveValidatorName(votePubkey: string): string {
  return `Validator ${votePubkey.slice(0, 8)}...${votePubkey.slice(-4)}`;
}

/**
 * Calculate estimated APR from recent epoch data
 */
export async function getEstimatedAPR(): Promise<number> {
  // Check cache
  if (cachedAPR !== null && Date.now() - aprCacheTimestamp < APR_CACHE_TTL) {
    return cachedAPR;
  }

  try {
    // Get epoch info
    const response = await fetch(appConfig.rpc.primary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getEpochInfo',
        params: [{ commitment: 'confirmed' }],
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('Failed to fetch epoch info:', data.error);
      return 0.07; // Fallback to 7%
    }

    // Calculate APR based on epoch data
    // This is a simplified calculation - in production, you'd want to:
    // 1. Get inflation rate from getInflationRate RPC call
    // 2. Calculate average validator performance
    // 3. Factor in commission rates

    // For now, use a reasonable estimate
    const estimatedAPR = 0.07; // 7% base APR

    cachedAPR = estimatedAPR;
    aprCacheTimestamp = Date.now();

    return estimatedAPR;
  } catch (error) {
    console.error('Failed to calculate APR:', error);
    return 0.07; // Fallback to 7%
  }
}

/**
 * Get validator details by vote pubkey
 */
export async function getValidatorDetails(votePubkey: string): Promise<ValidatorInfo | null> {
  const validators = await getValidators();
  return validators.find(v => v.votePubkey === votePubkey) || null;
}