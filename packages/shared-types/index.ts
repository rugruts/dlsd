export interface Wallet {
  address: string;
  balance: number;
}

// Multi-wallet types
export * from './wallet';

export interface FeeEstimate {
  lamports: bigint;
  gor: number;
  computeUnits: number;
}

export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  status: TransactionStatus;
  timestamp: number;
  txHash?: string;
  fee?: string;
}

export interface SendFormData {
  recipient: string;
  amount: string;
  token: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: bigint;
  outputAmount: bigint;
  minOutputAmount: bigint;
  priceImpact: number;
  fee: bigint;
  route: SwapRoute[];
}

export interface SwapRoute {
  programId: string;
  accounts: string[];
  data: string;
}

export interface StakingSummary {
  stakedBalance: bigint;
  pendingRewards: bigint;
  apy: number;
  lockupPeriod: number; // in days
}

export interface SwapFormData {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
}

export interface SecuritySettings {
  biometricsEnabled: boolean;
  requireBiometricsForSend: boolean;
  requireBiometricsForSwap: boolean;
  requireBiometricsForStaking: boolean;
  ledgerConnected: boolean;
  ledgerDeviceName?: string;
}

export interface TransactionSimulation {
  feeEstimate: FeeEstimate;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  warnings: string[];
}

export interface LedgerDevice {
  id: string;
  name: string;
  connected: boolean;
}

export interface DumpSackProvider {
  isDumpSack?: boolean;
  connect(): Promise<{ publicKey: string }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

export interface ProviderRequest {
  id: string;
  method: string;
  params: any[];
}

export interface ProviderResponse {
  id: string;
  result?: any;
  error?: {
    code: number;
    message: string;
  };
}

export interface ConnectedSite {
  origin: string;
  connectedAt: number;
  permissions: string[];
}

export interface WalletBackup {
  version: number;
  encryptedData: string; // Base64 encoded encrypted payload
  salt: string; // Base64 encoded salt for key derivation
  createdAt: number;
  updatedAt: number;
}

export interface BackupKeyMaterial {
  publicKey: string;
  privateKey: string; // Encrypted or derived - NEVER store plaintext
  // Add other wallet-specific data as needed
}

// Cloud backup document stored in Supabase Storage
export interface CloudBackupDocument {
  userId: string;
  encryptedBackup: string;
  updatedAt: Date;
  version: number;
}

export interface UserProfile {
  uid: string;
  alias?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  biometricsEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface AliasDocument {
  alias: string;
  userId: string;
  resolvedAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThroneLink {
  id: string;
  ownerUserId: string;
  type: 'token' | 'nft' | 'bundle';
  payload: ThroneLinkPayload;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export interface ThroneLinkPayload {
  tokenMint?: string;
  amount?: string;
  nftMint?: string;
  bundleItems?: Array<{
    type: 'token' | 'nft';
    mint: string;
    amount?: string;
  }>;
}