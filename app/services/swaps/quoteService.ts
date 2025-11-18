import { PublicKey } from '@solana/web3.js';
import {
  SwapQuote,
  SwapProviderId,
  getCurrentNetwork,
  getDefaultProviderForNetwork,
  getProviderById,
} from '@dumpsack/shared-utils';

/**
 * DEPRECATED: This file is kept for backward compatibility.
 * New code should use swapService.ts which uses the provider abstraction.
 */

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
  providerId?: SwapProviderId;
}

/**
 * Get swap quote using provider abstraction
 * @deprecated Use swapService.getQuote() instead
 */
export async function getSwapQuote(params: QuoteParams): Promise<SwapQuote> {
  const {
    inputMint,
    outputMint,
    amount,
    slippageBps = 50,
    providerId,
  } = params;

  try {
    const network = getCurrentNetwork();
    const provider = providerId
      ? getProviderById(providerId)
      : getDefaultProviderForNetwork(network);

    const quote = await provider.getQuote({
      fromMint: inputMint,
      toMint: outputMint,
      amountIn: BigInt(amount),
      slippageBps,
      network,
    });

    return quote;
  } catch (error) {
    console.error('Failed to fetch swap quote:', error);
    throw error;
  }
}

/**
 * Refresh quote with latest prices
 * @deprecated Use swapService.getQuote() instead
 */
export async function refreshQuote(quote: SwapQuote): Promise<SwapQuote> {
  return getSwapQuote({
    inputMint: quote.fromMint,
    outputMint: quote.toMint,
    amount: quote.amountIn.toString(),
    slippageBps: quote.priceImpactBps,
    providerId: quote.providerId,
  });
}

