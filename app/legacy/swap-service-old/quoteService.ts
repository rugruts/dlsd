import { appConfig } from '@dumpsack/shared-utils';
import { SwapQuote } from '../../types/swap';

const GOR_MINT = 'GOR111111111111111111111111111111111111111'; // Placeholder

export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: string
): Promise<SwapQuote> {
  if (!appConfig.features.enableSwaps) {
    throw new Error('Swaps are not enabled');
  }

  if (!amount || parseFloat(amount) <= 0) {
    throw new Error('Invalid amount');
  }

  if (inputMint === outputMint) {
    throw new Error('Cannot swap same token');
  }

  const aggregatorUrl = appConfig.swap.aggregatorUrl;
  if (!aggregatorUrl) {
    throw new Error('Swap aggregator not configured');
  }

  try {
    // Convert amount to raw units (assuming lamports for GOR, token decimals for others)
    const rawAmount = inputMint === GOR_MINT
      ? Math.floor(parseFloat(amount) * 1e9) // GOR has 9 decimals
      : Math.floor(parseFloat(amount) * 1e6); // Assume 6 decimals for other tokens

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: rawAmount.toString(),
      slippageBps: '50', // 0.5% slippage
    });

    const response = await fetch(`${aggregatorUrl}/quote?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Aggregator returned ${response.status}`);
    }

    const data = await response.json();

    // Transform aggregator response to our SwapQuote format
    return {
      inputMint,
      outputMint,
      inAmount: amount,
      outAmount: (parseInt(data.outAmount) / 1e9).toString(), // Assume 9 decimals for output
      priceImpact: parseFloat(data.priceImpactPct) || 0,
      fee: data.fee || '0',
      route: data.routePlan || [],
      slippageBps: 50,
    };
  } catch (error) {
    console.error('Failed to get swap quote:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get swap quote');
  }
}