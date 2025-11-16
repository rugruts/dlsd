import { PublicKey } from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';
import { StakeAccountInfo, StakeOverview } from './stakingTypes';
import { getEstimatedAPR } from './validatorService';

export async function getStakeAccounts(ownerPubkey: PublicKey): Promise<StakeAccountInfo[]> {
  if (!appConfig.features.enableStaking) {
    throw new Error('Staking is not enabled');
  }

  try {
    // Query stake program accounts owned by the user
    const response = await fetch(appConfig.rpc.primary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [
          'Stake11111111111111111111111111111111111111', // Stake program ID
          {
            commitment: 'confirmed',
            filters: [
              {
                memcmp: {
                  offset: 12, // Owner field offset in stake account
                  bytes: ownerPubkey.toBase58(),
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status}`);
    }

    const data = await response.json();
    const accounts = data.result || [];

    // Parse stake accounts
    const stakeAccounts: StakeAccountInfo[] = [];
    for (const account of accounts) {
      try {
        const stakeInfo = await parseStakeAccount(account);
        stakeAccounts.push(stakeInfo);
      } catch (error) {
        console.warn('Failed to parse stake account:', account.pubkey, error);
      }
    }

    return stakeAccounts;
  } catch (error) {
    console.error('Failed to fetch stake accounts:', error);
    throw new Error('Failed to load stake accounts');
  }
}

async function parseStakeAccount(account: any): Promise<StakeAccountInfo> {
  const pubkey = account.pubkey;
  const balanceLamports = account.account?.lamports || 0;

  // Get rent-exempt amount for stake accounts
  const rentResponse = await fetch(appConfig.rpc.primary, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getMinimumBalanceForRentExemption',
      params: [200], // Stake account size
    }),
  });

  const rentData = await rentResponse.json();
  const rentExemptLamports = rentData.result || 0;

  // Parse stake state (simplified - in production would decode full stake state)
  let state: StakeAccountInfo['state'] = 'inactive';
  let delegated: StakeAccountInfo['delegated'] | undefined;
  let withdrawableLamports = balanceLamports;

  // This is a simplified parsing - real implementation would decode the stake account data
  // For now, we'll assume all accounts are inactive
  // TODO: Implement full stake account parsing

  return {
    pubkey,
    state,
    delegated,
    rentExemptLamports,
    balanceLamports,
    withdrawableLamports,
  };
}

export async function getStakeOverview(ownerPubkey: PublicKey): Promise<StakeOverview> {
  const accounts = await getStakeAccounts(ownerPubkey);

  let totalActive = 0;
  let totalActivating = 0;
  let totalDeactivating = 0;
  let totalInactive = 0;

  for (const account of accounts) {
    switch (account.state) {
      case 'active':
        totalActive += account.balanceLamports;
        break;
      case 'activating':
        totalActivating += account.balanceLamports;
        break;
      case 'deactivating':
        totalDeactivating += account.balanceLamports;
        break;
      case 'inactive':
        totalInactive += account.balanceLamports;
        break;
    }
  }

  const total = totalActive + totalActivating + totalDeactivating + totalInactive;
  const aprEstimate = getEstimatedAPR();

  return {
    totalActive,
    totalActivating,
    totalDeactivating,
    totalInactive,
    total,
    aprEstimate,
    accounts,
  };
}