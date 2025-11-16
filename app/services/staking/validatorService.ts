import { appConfig } from '@dumpsack/shared-utils';
import { ValidatorInfo } from './stakingTypes';

const ESTIMATED_APR = 0.07; // 7% APR placeholder

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
    const current = data.result?.current || [];
    const delinquent = data.result?.delinquent || [];

    // Combine and normalize validators
    const validators: ValidatorInfo[] = [
      ...current.map(normalizeValidator),
      ...delinquent.map(normalizeValidator),
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

function normalizeValidator(voteAccount: any): ValidatorInfo {
  return {
    votePubkey: voteAccount.votePubkey,
    commission: voteAccount.commission,
    name: deriveValidatorName(voteAccount.votePubkey),
    score: voteAccount.score || 0,
    delinquent: voteAccount.delinquent || false,
    activatedStake: parseInt(voteAccount.activatedStake) || 0,
    epochCredits: voteAccount.epochCredits || 0,
  };
}

function deriveValidatorName(votePubkey: string): string {
  // Simple name derivation - in production, this could come from a registry
  return `Validator ${votePubkey.slice(0, 8)}...`;
}

export function getEstimatedAPR(): number {
  // Placeholder - in production, this could be calculated from recent epoch data
  return ESTIMATED_APR;
}