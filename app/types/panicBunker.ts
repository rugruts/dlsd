export interface PanicState {
  locked: boolean;
  safeAddress?: string;   // optional emergency sweep address
  lockedAt?: number;
  autoLockEnabled: boolean;
  lastUnlockedAt?: number;
}

export interface EmergencySweepParams {
  safeAddress: string;
  includeTokens: boolean; // whether to sweep SPL tokens too
}

export interface EmergencySweepResult {
  signature: string;
  sweptAmount: number; // in lamports
  fee: number; // in lamports
  tokenSweeps?: Array<{
    mint: string;
    amount: number;
    signature: string;
  }>;
}

export class PanicBunkerLockedError extends Error {
  constructor(message: string = "Wallet is locked by Panic Bunker") {
    super(message);
    this.name = "PanicBunkerLockedError";
  }
}

export interface PanicUnlockResult {
  success: boolean;
  method: 'biometric' | 'passphrase';
  error?: string;
}

export interface PanicLockResult {
  success: boolean;
  lockedAt: number;
  error?: string;
}