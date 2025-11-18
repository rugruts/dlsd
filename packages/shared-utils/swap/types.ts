import { Transaction, PublicKey } from '@solana/web3.js';

/**
 * Supported blockchain networks for swaps
 */
export type SwapNetwork = 'solana' | 'gorbagana';

/**
 * Unique identifier for swap providers
 */
export type SwapProviderId = 'jupiter' | 'gorbaganaAmm';

/**
 * Request parameters for getting a swap quote
 */
export interface SwapQuoteRequest {
  /** Source token mint address */
  fromMint: string;
  /** Destination token mint address */
  toMint: string;
  /** Input amount in token's smallest unit (e.g., lamports) */
  amountIn: bigint;
  /** Maximum slippage in basis points (e.g., 50 = 0.5%) */
  slippageBps: number;
  /** Target blockchain network */
  network: SwapNetwork;
  /** Optional user wallet public key */
  userPublicKey?: PublicKey;
}

/**
 * Swap quote response from a provider
 */
export interface SwapQuote {
  /** Provider that generated this quote */
  providerId: SwapProviderId;
  /** Unique identifier for this route/quote */
  routeId: string;
  /** Input token mint */
  fromMint: string;
  /** Output token mint */
  toMint: string;
  /** Input amount */
  amountIn: bigint;
  /** Expected output amount */
  amountOut: bigint;
  /** Minimum output amount after slippage */
  minAmountOut: bigint;
  /** Price impact in basis points */
  priceImpactBps: number;
  /** Estimated fees in lamports */
  estimatedFeesLamports: bigint;
  /** Network this quote is for */
  network: SwapNetwork;
  /** Provider-specific route data (opaque to consumers) */
  routeData?: any;
  /** Human-readable route description (e.g., "GOR → USDC via Trashbin CPAMM v3") */
  routeDescription?: string;
}

/**
 * Result of executing a swap
 */
export interface SwapResult {
  /** Transaction signature */
  signature: string;
  /** Input amount */
  amountIn: bigint;
  /** Actual output amount received */
  amountOut: bigint;
  /** Fees paid */
  fees: bigint;
}

/**
 * Swap provider interface
 * 
 * Each provider (Jupiter, Gorbagana AMM, etc.) implements this interface
 * to provide quotes and build swap transactions.
 */
export interface SwapProvider {
  /** Unique identifier for this provider */
  id: SwapProviderId;
  /** Human-readable label */
  label: string;
  /** Networks this provider supports */
  supportedNetworks: SwapNetwork[];
  
  /**
   * Check if this provider can handle a specific swap request
   * @param request - The swap quote request
   * @returns true if this provider supports the request
   */
  supports(request: SwapQuoteRequest): boolean;
  
  /**
   * Get a quote for a swap
   * @param request - The swap quote request
   * @returns A swap quote with route and pricing information
   * @throws Error if the swap is not supported or quote fails
   */
  getQuote(request: SwapQuoteRequest): Promise<SwapQuote>;
  
  /**
   * Build a transaction to execute a swap quote
   * @param quote - The quote to execute
   * @param userPublicKey - User's wallet public key
   * @returns A transaction ready to be signed and sent
   * @throws Error if transaction building fails
   */
  buildSwapTx(quote: SwapQuote, userPublicKey: PublicKey): Promise<Transaction>;
}

/**
 * Configuration for swap providers
 */
export interface SwapProviderConfig {
  /** API endpoint URL */
  apiUrl?: string;
  /** API key for authenticated requests */
  apiKey?: string;
  /** Default slippage in basis points */
  defaultSlippageBps?: number;
  /** Request timeout in milliseconds */
  timeoutMs?: number;
}

