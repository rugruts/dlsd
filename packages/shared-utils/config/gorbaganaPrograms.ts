import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  StakeProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_EPOCH_SCHEDULE_PUBKEY,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  SYSVAR_REWARDS_PUBKEY,
  SYSVAR_STAKE_HISTORY_PUBKEY,
  SystemProgram,
} from '@solana/web3.js';

/**
 * Gorbagana Program IDs - Single Source of Truth
 *
 * For now we only keep the core programs we actually use and
 * rely on the canonical IDs exported by @solana/web3.js and
 * @solana/spl-token instead of hard-coding base58 strings.
 *
 * When we implement Gorbagana-native AMMs / NFTs we can add
 * those program IDs back here as strings.
 */

export const GBA_PROGRAMS = {
  // AMMs, GNS, NFT, vote are intentionally omitted for now.
  // We'll re-add them later when Gorbagana AMM/NFT support goes live.

  stake: {
    // Native stake program (same as Solana's Stake111…)
    native: StakeProgram.programId,
  },

  token: {
    // SPL token program + associated token account program
    spl: TOKEN_PROGRAM_ID,
    ata: ASSOCIATED_TOKEN_PROGRAM_ID,
  },

  system: {
    // System program (1111…)
    system: SystemProgram.programId,
    // Config program is currently unused; if needed we can add:
    // config: new PublicKey('Config1111111111111111111111111111111111111'),
  },

  sysvar: {
    clock: SYSVAR_CLOCK_PUBKEY,
    rent: SYSVAR_RENT_PUBKEY,
    stakeHistory: SYSVAR_STAKE_HISTORY_PUBKEY,
    epochSchedule: SYSVAR_EPOCH_SCHEDULE_PUBKEY,
    rewards: SYSVAR_REWARDS_PUBKEY,
    instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    // fees, slotHashes, recentBlockhashes are not exported by @solana/web3.js
    // and are not used by our code, so we leave them out for now.
  },
} as const;

/**
 * Convenience exports for commonly used program IDs
 */
export const GBA_STAKE_PROGRAM_ID = GBA_PROGRAMS.stake.native;
export const GBA_TOKEN_PROGRAM_ID = GBA_PROGRAMS.token.spl;
export const GBA_ASSOCIATED_TOKEN_PROGRAM_ID = GBA_PROGRAMS.token.ata;
export const GBA_SYSTEM_PROGRAM_ID = GBA_PROGRAMS.system.system;
export const GBA_SYSVARS = GBA_PROGRAMS.sysvar;
// AMM/NFT helpers intentionally omitted until we re-add those configs.

