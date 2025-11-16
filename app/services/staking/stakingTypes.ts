export interface ValidatorInfo {
  votePubkey: string;
  commission: number;
  name?: string;
  score?: number;
  delinquent: boolean;
  activatedStake: number; // lamports
  epochCredits: number;
}

export interface StakeAccountInfo {
  pubkey: string;
  state: 'inactive' | 'activating' | 'active' | 'deactivating';
  delegated?: {
    votePubkey: string;
    stake: number; // lamports
    activationEpoch: number;
    deactivationEpoch?: number;
  };
  rentExemptLamports: number;
  balanceLamports: number;
  withdrawableLamports: number;
  lockup?: {
    unixTimestamp: number;
    epoch: number;
  };
}

export interface StakeOverview {
  totalActive: number; // lamports
  totalActivating: number; // lamports
  totalDeactivating: number; // lamports
  totalInactive: number; // lamports
  total: number; // lamports
  aprEstimate: number; // percentage
  accounts: StakeAccountInfo[];
}

export interface StakeTransactionContext {
  blockhash: string;
  lastValidBlockHeight: number;
  stakeAccountPubkey?: string;
}

export interface StakeAction {
  type: 'createAndDelegate' | 'delegateExisting' | 'deactivate' | 'withdraw';
  stakeAccountPubkey?: string;
  votePubkey?: string;
  amountLamports?: number;
  destinationPubkey?: string;
}

export interface StakeSimulationResult {
  success: boolean;
  logs: string[];
  units: number;
  errorMessage?: string;
}