import { Transaction, PublicKey } from '@solana/web3.js';
import {
  SwapProvider,
  SwapQuoteRequest,
  SwapQuote,
  SwapProviderConfig,
} from '../types';

/**
 * Jupiter Aggregator Provider
 * 
 * Provides swap quotes and transactions using Jupiter's API.
 * Only supports Solana mainnet.
 */
class JupiterProvider implements SwapProvider {
  id = 'jupiter' as const;
  label = 'Jupiter';
  supportedNetworks = ['solana'] as const;

  private config: Required<SwapProviderConfig>;

  constructor(config: SwapProviderConfig = {}) {
    this.config = {
      apiUrl: config.apiUrl || 'https://quote-api.jup.ag/v6',
      apiKey: config.apiKey || '',
      defaultSlippageBps: config.defaultSlippageBps || 50,
      timeoutMs: config.timeoutMs || 30000,
    };
  }

  supports(request: SwapQuoteRequest): boolean {
    // Jupiter only supports Solana network
    if (request.network !== 'solana') {
      return false;
    }

    // Basic validation
    if (!request.fromMint || !request.toMint) {
      return false;
    }

    if (request.fromMint === request.toMint) {
      return false;
    }

    if (request.amountIn <= 0n) {
      return false;
    }

    return true;
  }

  async getQuote(request: SwapQuoteRequest): Promise<SwapQuote> {
    if (!this.supports(request)) {
      throw new Error('Jupiter does not support this swap request');
    }

    try {
      const queryParams = new URLSearchParams({
        inputMint: request.fromMint,
        outputMint: request.toMint,
        amount: request.amountIn.toString(),
        slippageBps: request.slippageBps.toString(),
        swapMode: 'ExactIn',
        onlyDirectRoutes: 'false',
      });

      const response = await fetch(`${this.config.apiUrl}/quote?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Build route description from Jupiter's route plan
      const routeDescription = this.buildRouteDescription(data);

      return {
        providerId: this.id,
        routeId: data.routePlan?.[0]?.swapInfo?.ammKey || 'unknown',
        fromMint: request.fromMint,
        toMint: request.toMint,
        amountIn: BigInt(data.inAmount || request.amountIn),
        amountOut: BigInt(data.outAmount || 0),
        minAmountOut: BigInt(data.otherAmountThreshold || 0),
        priceImpactBps: Math.round(parseFloat(data.priceImpactPct || '0') * 100),
        estimatedFeesLamports: BigInt(data.platformFee?.amount || 0),
        network: 'solana',
        routeData: data, // Store full Jupiter response for buildSwapTx
        routeDescription,
      };
    } catch (error) {
      console.error('Jupiter quote error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to get Jupiter quote: ${error.message}`
          : 'Failed to get Jupiter quote'
      );
    }
  }

  async buildSwapTx(quote: SwapQuote, userPublicKey: PublicKey): Promise<Transaction> {
    if (quote.providerId !== this.id) {
      throw new Error('Quote is not from Jupiter provider');
    }

    if (!quote.routeData) {
      throw new Error('Quote missing route data');
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
        },
        body: JSON.stringify({
          quoteResponse: quote.routeData,
          userPublicKey: userPublicKey.toBase58(),
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: 'auto',
        }),
        signal: AbortSignal.timeout(this.config.timeoutMs),
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Deserialize the transaction
      const txBuffer = Buffer.from(data.swapTransaction, 'base64');
      const tx = Transaction.from(txBuffer);

      return tx;
    } catch (error) {
      console.error('Jupiter swap transaction error:', error);
      throw new Error(
        error instanceof Error
          ? `Failed to build Jupiter swap: ${error.message}`
          : 'Failed to build Jupiter swap'
      );
    }
  }

  private buildRouteDescription(jupiterData: any): string {
    // Extract route info from Jupiter response
    const routePlan = jupiterData.routePlan || [];
    if (routePlan.length === 0) return 'Direct swap';
    if (routePlan.length === 1) return 'Direct swap via Jupiter';
    return `${routePlan.length}-hop swap via Jupiter`;
  }
}

// Export singleton instance
export const jupiterProvider = new JupiterProvider();

