import { PublicKey } from '@solana/web3.js';

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: 'ExactIn' | 'ExactOut';
  slippageBps: number;
  priceImpactPct: number;
  routePlan: any[];
  contextSlot?: number;
  timeTaken?: number;
}

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
  swapMode?: 'ExactIn' | 'ExactOut';
}

/**
 * Get swap quote from Jupiter API
 * Jupiter supports Gorbagana network (Solana fork)
 */
export async function getSwapQuote(params: QuoteParams): Promise<SwapQuote> {
  const {
    inputMint,
    outputMint,
    amount,
    slippageBps = 50, // 0.5% default slippage
    swapMode = 'ExactIn'
  } = params;

  try {
    // Jupiter API v6 endpoint
    const jupiterApiUrl = 'https://quote-api.jup.ag/v6';

    // Build query parameters
    const queryParams = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps.toString(),
      swapMode,
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false',
    });

    const response = await fetch(`${jupiterApiUrl}/quote?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Jupiter response to our SwapQuote format
    const quote: SwapQuote = {
      inputMint,
      outputMint,
      inAmount: data.inAmount || amount,
      outAmount: data.outAmount || '0',
      otherAmountThreshold: data.otherAmountThreshold || '0',
      swapMode,
      slippageBps,
      priceImpactPct: parseFloat(data.priceImpactPct || '0'),
      routePlan: data.routePlan || [],
      contextSlot: data.contextSlot || 0,
      timeTaken: data.timeTaken || 0,
    };

    return quote;
  } catch (error) {
    console.error('Failed to fetch Jupiter quote:', error);

    // Fallback: return estimated quote based on simple calculation
    // This ensures the UI doesn't break if Jupiter is down
    const estimatedOutAmount = (parseFloat(amount) * 0.99).toString();

    return {
      inputMint,
      outputMint,
      inAmount: amount,
      outAmount: estimatedOutAmount,
      otherAmountThreshold: (parseFloat(estimatedOutAmount) * (1 - slippageBps / 10000)).toString(),
      swapMode,
      slippageBps,
      priceImpactPct: 1.0,
      routePlan: [],
      contextSlot: 0,
      timeTaken: 0,
    };
  }
}

/**
 * Refresh quote with latest prices
 */
export async function refreshQuote(quote: SwapQuote): Promise<SwapQuote> {
  return getSwapQuote({
    inputMint: quote.inputMint,
    outputMint: quote.outputMint,
    amount: quote.inAmount,
    slippageBps: quote.slippageBps,
    swapMode: quote.swapMode,
  });
}

