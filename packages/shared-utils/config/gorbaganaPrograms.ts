import { PublicKey } from '@solana/web3.js';

/**
 * Gorbagana Program IDs - Single Source of Truth
 * 
 * All on-chain program addresses for the Gorbagana network.
 * These mirror Solana's core programs where applicable.
 * 
 * IMPORTANT: Always import program IDs from this file.
 * Never hard-code program addresses elsewhere in the codebase.
 */
export const GBA_PROGRAMS = {
  amm: {
    trashbinCpamm: new PublicKey('Fwy1A7vQG7Rj4jW2oP4p5qWxqoUqMFq2BLt3zSe9FKzC'),
    trashbinCpammV2: new PublicKey('6YJXQ2hHphsMeUZ8tDGAqVnNm7ArDPMsLL7JkaELF77j'),
    trashbinCpammV3: new PublicKey('5Yh3pLTTn1B4z96SYpjb52mxPySBLx6LL4toPjDWkWdc'),
    meteoraDammV2Fork: new PublicKey('2eSMQ8VJ6h3dBcthF1kkmMaf4qBAc4dml4BeceUccqU5'),
    meteoraBondingCurveFork: new PublicKey('3zUuUsjdy97qwbJwCHFoP93AskZMJhXNzqzGQ4rhVfHp'),
  },

  gns: {
    gorid: new PublicKey('6xq9xx2Vfkoq1j2r3X7gC9rFsmuDvjTgMTgJqwXFkR1k'),
  },

  nft: {
    metadata: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
    entangler: new PublicKey('6B4okfFQvXn93QJ6xp3o4KhWzWbPSHuzN8dbM6f8Kss'),
  },

  stake: {
    native: new PublicKey('Stake11111111111111111111111111111111111111'),
  },

  token: {
    spl: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    ata: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
  },

  system: {
    system: new PublicKey('11111111111111111111111111111111'),
    config: new PublicKey('Config1111111111111111111111111111111111111'),
    loaderUpgradeable: new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111'),
    loader: new PublicKey('BPFLoader1111111111111111111111111111111111'),
    loaderV1: new PublicKey('BPFLoader2111111111111111111111111111111111'),
  },

  sysvar: {
    clock: new PublicKey('SysvarC1ock11111111111111111111111111111111'),
    rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
    slotHashes: new PublicKey('SysvarS1otHashes111111111111111111111111111'),
    stakeHistory: new PublicKey('SysvarStakeHistory11111111111111111111111111'),
    epochSchedule: new PublicKey('SysvarEpochSchedu1e111111111111111111111111'),
    fees: new PublicKey('SysvarFees111111111111111111111111111111111'),
    recentBlockhashes: new PublicKey('SysvarRecentB1ockHashes111111111111111111111'),
    rewards: new PublicKey('SysvarRewards1111111111111111111111111111111'),
    instructions: new PublicKey('Sysvar1nstructions11111111111111111111111111'),
  },

  vote: {
    vote: new PublicKey('Vote111111111111111111111111111111111111111'),
  },
};

/**
 * Convenience exports for commonly used program IDs
 */
export const GBA_STAKE_PROGRAM_ID = GBA_PROGRAMS.stake.native;
export const GBA_TOKEN_PROGRAM_ID = GBA_PROGRAMS.token.spl;
export const GBA_ASSOCIATED_TOKEN_PROGRAM_ID = GBA_PROGRAMS.token.ata;
export const GBA_SYSTEM_PROGRAM_ID = GBA_PROGRAMS.system.system;
export const GBA_SYSVARS = GBA_PROGRAMS.sysvar;
export const GBA_AMM_PROGRAMS = GBA_PROGRAMS.amm;
export const GBA_NFT_PROGRAMS = GBA_PROGRAMS.nft;

