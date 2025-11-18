import { PublicKey } from '@solana/web3.js';

export interface TokenHolding {
  mint: string;
  symbol?: string;
  amount: bigint;
  decimals: number;
  usdValue?: number; // USD value of the token holding
  price?: number; // Price per token in USD
}

export interface NftItem {
  mint: string;
  name?: string;
  image?: string;
}

export interface RpcError {
  code?: string;
  message: string;
  context?: Record<string, unknown>;
}

export type RpcErrorType = 'network' | 'timeout' | 'invalid_params' | 'preflight_failure' | 'rate_limited';

export interface RpcHealth {
  status: 'ok' | 'unhealthy';
  latencyMs: number;
}

export interface FeeEstimate {
  lamports: bigint;
  gor: number; // Converted from lamports
  computeUnits: number;
}

export interface TransactionSummary {
  description: string;
  feeEstimate: FeeEstimate;
  computeUnits: number;
}

export interface RpcClientConfig {
  primaryRpc: string;
  fallbackRpc?: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
  timeoutMs: number;
  maxRetries: number;
}

export interface TransferTxParams {
  from: PublicKey;
  to: PublicKey;
  amount: bigint;
  mint?: PublicKey; // If not provided, native GOR transfer
}