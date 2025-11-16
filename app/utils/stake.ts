import { StakeAccountInfo } from '../services/staking/stakingTypes';

export function formatStakeState(state: StakeAccountInfo['state']): string {
  switch (state) {
    case 'inactive':
      return 'Inactive';
    case 'activating':
      return 'Activating';
    case 'active':
      return 'Active';
    case 'deactivating':
      return 'Deactivating';
    default:
      return 'Unknown';
  }
}

export function getStakeStateColor(state: StakeAccountInfo['state']): string {
  switch (state) {
    case 'inactive':
      return 'text-gray-500';
    case 'activating':
      return 'text-yellow-500';
    case 'active':
      return 'text-green-500';
    case 'deactivating':
      return 'text-orange-500';
    default:
      return 'text-gray-500';
  }
}

export async function calcRentExemptForStake(rpcUrl: string): Promise<number> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getMinimumBalanceForRentExemption',
      params: [200], // Stake account size
    }),
  });

  const data = await response.json();
  return data.result || 0;
}

export function shortVoteKey(votePubkey: string): string {
  return `${votePubkey.slice(0, 8)}...${votePubkey.slice(-8)}`;
}

export function gorToLamports(gor: string): number {
  return Math.floor(parseFloat(gor) * 1e9);
}

export function lamportsToGor(lamports: number): string {
  return (lamports / 1e9).toFixed(9);
}

export function formatLamports(lamports: number, decimals: number = 4): string {
  return (lamports / 1e9).toFixed(decimals);
}

export function isValidPublicKey(key: string): boolean {
  try {
    // Basic validation - should be 32 bytes base58
    return key.length >= 32 && key.length <= 44 && /^[A-HJ-NP-Z0-9]+$/i.test(key);
  } catch {
    return false;
  }
}

export function calculateCooldownEnd(activationEpoch: number, currentEpoch: number): number {
  // Simplified cooldown calculation - in reality this depends on network parameters
  const cooldownEpochs = 1; // Placeholder
  return Math.max(0, activationEpoch + cooldownEpochs - currentEpoch);
}

export function canWithdraw(account: StakeAccountInfo): boolean {
  return account.withdrawableLamports > 0;
}

export function canDeactivate(account: StakeAccountInfo): boolean {
  return account.state === 'active';
}

export function canDelegate(account: StakeAccountInfo): boolean {
  return account.state === 'inactive';
}