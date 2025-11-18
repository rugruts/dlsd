import { Transaction, PublicKey } from '@solana/web3.js';
import { createRpcClient } from '../blockchain/rpcClient';
import { walletService } from '../wallet/walletService';
import {
  SwapQuote,
  SwapQuoteRequest,
  SwapProviderId,
  SwapProvider,
  getCurrentNetwork,
  getDefaultProviderForNetwork,
  getProviderById,
  getProvidersForNetwork,
} from '@dumpsack/shared-utils';

interface SwapServiceConfig {
  defaultSlippageBps?: number;
  preferredProviderId?: SwapProviderId;
}

const defaultConfig: SwapServiceConfig = {
  defaultSlippageBps: 50, // 0.5%
};

export class SwapService {
  private config: Required<SwapServiceConfig>;
  private rpcClient = createRpcClient();

  constructor(config: SwapServiceConfig = {}) {
    this.config = {
      defaultSlippageBps: config.defaultSlippageBps || defaultConfig.defaultSlippageBps!,
      preferredProviderId: config.preferredProviderId || undefined!,
    };
  }

  /**
   * Get the appropriate swap provider for current network
   * @param providerId - Optional specific provider ID
   * @returns The swap provider to use
   */
  private getProvider(providerId?: SwapProviderId): SwapProvider {
    if (providerId) {
      return getProviderById(providerId);
    }

    if (this.config.preferredProviderId) {
      return getProviderById(this.config.preferredProviderId);
    }

    const network = getCurrentNetwork();
    return getDefaultProviderForNetwork(network);
  }

  /**
   * Get a swap quote
   * @param inputMint - Input token mint address
   * @param outputMint - Output token mint address
   * @param amount - Input amount in smallest units
   * @param slippageBps - Slippage tolerance in basis points
   * @param providerId - Optional specific provider to use
   * @returns Swap quote with pricing and route information
   */
  async getQuote(
    inputMint: PublicKey,
    outputMint: PublicKey,
    amount: bigint,
    slippageBps: number = this.config.defaultSlippageBps,
    providerId?: SwapProviderId
  ): Promise<SwapQuote> {
    try {
      const network = getCurrentNetwork();
      const provider = this.getProvider(providerId);

      const request: SwapQuoteRequest = {
        fromMint: inputMint.toBase58(),
        toMint: outputMint.toBase58(),
        amountIn: amount,
        slippageBps,
        network,
      };

      if (!provider.supports(request)) {
        throw new Error(
          `${provider.label} does not support swaps on ${network} network. ` +
          `Please switch networks or try a different provider.`
        );
      }

      return await provider.getQuote(request);
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw error instanceof Error ? error : new Error('Failed to get swap quote');
    }
  }

  /**
   * Build a swap transaction from a quote
   * @param quote - The swap quote to execute
   * @param walletPubkey - User's wallet public key
   * @returns Transaction ready to be signed and sent
   */
  async buildSwapTransaction(quote: SwapQuote, walletPubkey: PublicKey): Promise<Transaction> {
    try {
      const provider = getProviderById(quote.providerId);
      const tx = await provider.buildSwapTx(quote, walletPubkey);

      // Update with latest blockhash
      const blockhash = await this.rpcClient.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPubkey;

      return tx;
    } catch (error) {
      console.error('Error building swap transaction:', error);
      throw error instanceof Error ? error : new Error('Failed to build swap transaction');
    }
  }

  /**
   * Simulate a swap transaction
   * @param tx - The transaction to simulate
   * @returns Simulation result
   */
  async simulateSwapTx(tx: Transaction): Promise<unknown> {
    return this.rpcClient.simulateTransaction(tx);
  }

  /**
   * Sign and send a swap transaction
   * @param tx - The transaction to send
   * @returns Transaction signature
   */
  async sendSwapTx(tx: Transaction): Promise<string> {
    const signedTx = await walletService.signTransaction(tx);
    const rawTx = signedTx.serialize();
    return this.rpcClient.sendRawTransaction(rawTx);
  }

  /**
   * Get available swap providers for current network
   * @returns Array of providers that support the current network
   */
  getAvailableProviders(): SwapProvider[] {
    const network = getCurrentNetwork();
    return getProvidersForNetwork(network);
  }

  /**
   * Get current network
   * @returns The active network
   */
  getCurrentNetwork() {
    return getCurrentNetwork();
  }
}

export const swapService = new SwapService();

/**
 * Create swap transaction (convenience function)
 * @param inputMint - Input token mint
 * @param outputMint - Output token mint
 * @param amount - Input amount
 * @param walletPubkey - User's wallet public key
 * @param slippageBps - Optional slippage tolerance
 * @param providerId - Optional specific provider to use
 * @returns Transaction ready to sign and send
 */
export async function createSwapTransaction(
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: bigint,
  walletPubkey: PublicKey,
  slippageBps?: number,
  providerId?: SwapProviderId
): Promise<Transaction> {
  const quote = await swapService.getQuote(inputMint, outputMint, amount, slippageBps, providerId);
  return swapService.buildSwapTransaction(quote, walletPubkey);
}

/**
 * Get swap quote (convenience function)
 * @param inputMint - Input token mint
 * @param outputMint - Output token mint
 * @param amount - Input amount
 * @param slippageBps - Optional slippage tolerance
 * @param providerId - Optional specific provider to use
 * @returns Swap quote
 */
export async function getSwapQuote(
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: bigint,
  slippageBps?: number,
  providerId?: SwapProviderId
): Promise<SwapQuote> {
  return swapService.getQuote(inputMint, outputMint, amount, slippageBps, providerId);
}

/**
 * Simulate swap (convenience function)
 * @param tx - Transaction to simulate
 * @returns Simulation result
 */
export async function simulateSwap(tx: Transaction): Promise<any> {
  return swapService.simulateSwapTx(tx);
}

/**
 * Execute swap (convenience function)
 * @param tx - Transaction to execute
 * @returns Transaction signature
 */
export async function executeSwap(tx: Transaction): Promise<string> {
  return swapService.sendSwapTx(tx);
}