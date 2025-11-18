import { PublicKey, GBA_STAKE_PROGRAM_ID } from '@dumpsack/shared-utils';
import { appConfig } from '@dumpsack/shared-utils';
import { StakeAccountInfo, StakeOverview } from './stakingTypes';
import { getEstimatedAPR } from './validatorService';
import { Connection } from '@solana/web3.js';

export async function getStakeAccounts(ownerPubkey: PublicKey): Promise<StakeAccountInfo[]> {
  if (!appConfig.features.enableStaking) {
    throw new Error('Staking is not enabled');
  }

  try {
    // Create connection
    const connection = new Connection(appConfig.rpc.primary, appConfig.rpc.commitment);

    // Query stake program accounts owned by the user using GBA_STAKE_PROGRAM_ID
    const accounts = await connection.getProgramAccounts(GBA_STAKE_PROGRAM_ID, {
      commitment: appConfig.rpc.commitment,
      filters: [
        {
          memcmp: {
            offset: 12, // Authorized staker offset in stake account
            bytes: ownerPubkey.toBase58(),
          },
        },
      ],
    });

    // Parse stake accounts
    const stakeAccounts: StakeAccountInfo[] = [];
    for (const accountInfo of accounts) {
      try {
        const stakeInfo = await parseStakeAccount(accountInfo, connection);
        stakeAccounts.push(stakeInfo);
      } catch (error) {
        console.warn('Failed to parse stake account:', accountInfo.pubkey.toBase58(), error);
      }
    }

    return stakeAccounts;
  } catch (error) {
    console.error('Failed to fetch stake accounts:', error);
    throw new Error('Failed to load stake accounts');
  }
}

/**
 * Parse native stake account data
 *
 * Stake account layout (Solana native):
 * - Bytes 0-3: State discriminator (0 = uninitialized, 1 = initialized, 2 = delegated)
 * - Bytes 4-11: Meta (authorized staker, authorized withdrawer, lockup)
 * - Bytes 12+: Stake data (if delegated)
 */
async function parseStakeAccount(
  accountInfo: { pubkey: PublicKey; account: { data: Buffer; lamports: number } },
  connection: Connection
): Promise<StakeAccountInfo> {
  const pubkey = accountInfo.pubkey.toBase58();
  const balanceLamports = accountInfo.account.lamports;
  const data = accountInfo.account.data;

  // Get rent-exempt amount for stake accounts (200 bytes)
  const rentExemptLamports = await connection.getMinimumBalanceForRentExemption(200);

  // Parse stake state from account data
  let state: StakeAccountInfo['state'] = 'inactive';
  let delegated: StakeAccountInfo['delegated'] | undefined;
  let withdrawableLamports = balanceLamports;

  try {
    // Read state discriminator (first 4 bytes as u32 little-endian)
    const stateDiscriminator = data.readUInt32LE(0);

    if (stateDiscriminator === 2) {
      // Delegated state
      // Parse delegation info starting at byte 220 (after Meta struct)
      const voterPubkeyBytes = data.slice(220, 252); // 32 bytes for voter pubkey
      const votePubkey = new PublicKey(voterPubkeyBytes).toBase58();

      // Parse stake amount (8 bytes u64 at offset 252)
      const stakeLamports = Number(data.readBigUInt64LE(252));

      // Parse activation epoch (8 bytes u64 at offset 260)
      const activationEpoch = Number(data.readBigUInt64LE(260));

      // Parse deactivation epoch (8 bytes u64 at offset 268)
      // If deactivation epoch is u64::MAX, it's not deactivating
      const deactivationEpochRaw = data.readBigUInt64LE(268);
      const deactivationEpoch = deactivationEpochRaw === BigInt('18446744073709551615')
        ? undefined
        : Number(deactivationEpochRaw);

      // Get current epoch to determine state
      const epochInfo = await connection.getEpochInfo();
      const currentEpoch = epochInfo.epoch;

      // Determine state based on epochs
      if (deactivationEpoch !== undefined) {
        state = currentEpoch >= deactivationEpoch ? 'inactive' : 'deactivating';
        withdrawableLamports = state === 'inactive' ? balanceLamports : 0;
      } else if (currentEpoch >= activationEpoch) {
        state = 'active';
        withdrawableLamports = 0;
      } else {
        state = 'activating';
        withdrawableLamports = 0;
      }

      delegated = {
        votePubkey,
        stake: stakeLamports,
        activationEpoch,
        deactivationEpoch,
      };
    } else if (stateDiscriminator === 1) {
      // Initialized but not delegated
      state = 'inactive';
      withdrawableLamports = balanceLamports;
    }
  } catch (error) {
    console.warn('Failed to parse stake account data, assuming inactive:', error);
    state = 'inactive';
    withdrawableLamports = balanceLamports;
  }

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
  const aprEstimate = await getEstimatedAPR();

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