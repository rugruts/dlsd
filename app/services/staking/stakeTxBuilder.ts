import { PublicKey, Transaction, SystemProgram, Keypair } from '@solana/web3.js';
import { appConfig, GBA_STAKE_PROGRAM_ID } from '@dumpsack/shared-utils';
import { StakeTransactionContext } from './stakingTypes';

export async function buildCreateAndDelegate({
  ownerPubkey,
  votePubkey,
  amountLamports,
}: {
  ownerPubkey: PublicKey;
  votePubkey: string;
  amountLamports: number;
}): Promise<{ transaction: Transaction; context: StakeTransactionContext }> {
  if (!appConfig.features.enableStaking) {
    throw new Error('Staking is not enabled');
  }

  // Get rent-exempt amount
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

  if (amountLamports < rentExemptLamports + 1) {
    throw new Error(`Amount must be at least ${rentExemptLamports + 1} lamports (rent-exempt + 1)`);
  }

  // Get recent blockhash
  const blockhashResponse = await fetch(appConfig.rpc.primary, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }],
    }),
  });

  const blockhashData = await blockhashResponse.json();
  const blockhash = blockhashData.result?.blockhash;
  const lastValidBlockHeight = blockhashData.result?.lastValidBlockHeight;

  if (!blockhash) {
    throw new Error('Failed to get recent blockhash');
  }

  // Generate new stake account keypair
  const stakeAccountKeypair = Keypair.generate();
  const stakeAccountPubkey = stakeAccountKeypair.publicKey;

  // Build transaction
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: ownerPubkey,
  });

  // Create stake account using GBA stake program ID
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: ownerPubkey,
      newAccountPubkey: stakeAccountPubkey,
      lamports: amountLamports,
      space: 200, // Stake account size
      programId: GBA_STAKE_PROGRAM_ID,
    })
  );

  // Initialize stake account (simplified - would need proper stake instruction)
  // Note: This is a placeholder - real implementation would use StakeProgram.initialize

  // Delegate stake
  // Note: This is a placeholder - real implementation would use StakeProgram.delegate

  return {
    transaction,
    context: {
      blockhash,
      lastValidBlockHeight,
      stakeAccountPubkey: stakeAccountPubkey.toBase58(),
    },
  };
}

export async function buildDelegateExisting({
  stakeAccountPubkey,
  votePubkey,
  ownerPubkey,
}: {
  stakeAccountPubkey: string;
  votePubkey: string;
  ownerPubkey: PublicKey;
}): Promise<{ transaction: Transaction; context: StakeTransactionContext }> {
  // Get recent blockhash
  const blockhashResponse = await fetch(appConfig.rpc.primary, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }],
    }),
  });

  const blockhashData = await blockhashResponse.json();
  const blockhash = blockhashData.result?.blockhash;
  const lastValidBlockHeight = blockhashData.result?.lastValidBlockHeight;

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: ownerPubkey,
  });

  // Delegate existing stake account
  // Note: This is a placeholder - real implementation would use StakeProgram.delegate

  return {
    transaction,
    context: {
      blockhash,
      lastValidBlockHeight,
    },
  };
}

export async function buildDeactivate({
  stakeAccountPubkey,
  ownerPubkey,
}: {
  stakeAccountPubkey: string;
  ownerPubkey: PublicKey;
}): Promise<{ transaction: Transaction; context: StakeTransactionContext }> {
  // Get recent blockhash
  const blockhashResponse = await fetch(appConfig.rpc.primary, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }],
    }),
  });

  const blockhashData = await blockhashResponse.json();
  const blockhash = blockhashData.result?.blockhash;
  const lastValidBlockHeight = blockhashData.result?.lastValidBlockHeight;

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: ownerPubkey,
  });

  // Deactivate stake
  // Note: This is a placeholder - real implementation would use StakeProgram.deactivate

  return {
    transaction,
    context: {
      blockhash,
      lastValidBlockHeight,
    },
  };
}

export async function buildWithdraw({
  stakeAccountPubkey,
  destinationPubkey,
  lamports,
  ownerPubkey,
}: {
  stakeAccountPubkey: string;
  destinationPubkey: string;
  lamports: number;
  ownerPubkey: PublicKey;
}): Promise<{ transaction: Transaction; context: StakeTransactionContext }> {
  // Get recent blockhash
  const blockhashResponse = await fetch(appConfig.rpc.primary, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getLatestBlockhash',
      params: [{ commitment: 'confirmed' }],
    }),
  });

  const blockhashData = await blockhashResponse.json();
  const blockhash = blockhashData.result?.blockhash;
  const lastValidBlockHeight = blockhashData.result?.lastValidBlockHeight;

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: ownerPubkey,
  });

  // Withdraw stake
  // Note: This is a placeholder - real implementation would use StakeProgram.withdraw

  return {
    transaction,
    context: {
      blockhash,
      lastValidBlockHeight,
    },
  };
}