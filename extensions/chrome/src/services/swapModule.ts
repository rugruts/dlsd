// Real swap implementation for extension
import { getProviderById, SwapQuote, SwapQuoteRequest, getCurrentNetwork } from '@dumpsack/shared-utils';

export class SwapModule {
  async initialize() {
    console.log('Swap module initialized');
  }

  async getQuote(inputMint: string, outputMint: string, amount: number) {
    try {
      const network = getCurrentNetwork();
      const request: SwapQuoteRequest = {
        fromMint: inputMint,
        toMint: outputMint,
        amountIn: BigInt(amount),
        slippageBps: 50,
        network,
      };

      if (network === 'gorbagana') {
        // For Gorbagana, try the Gorbagana AMM provider
        const gorbaganaProvider = getProviderById('gorbaganaAmm');
        
        if (gorbaganaProvider.supports(request)) {
          const quote = await gorbaganaProvider.getQuote(request);
          return {
            inputAmount: Number(quote.amountIn),
            outputAmount: Number(quote.amountOut),
            fee: Number(quote.estimatedFeesLamports),
            quote,
          };
        }
        
        // If Gorbagana AMM not supported, throw specific error
        throw new Error('GORBAGANA_AMM_NOT_IMPLEMENTED');
      } else if (network === 'solana') {
        // For Solana, use Jupiter provider
        const jupiterProvider = getProviderById('jupiter');
        
        if (jupiterProvider.supports(request)) {
          const quote = await jupiterProvider.getQuote(request);
          return {
            inputAmount: Number(quote.amountIn),
            outputAmount: Number(quote.amountOut),
            fee: Number(quote.estimatedFeesLamports),
            quote,
          };
        }
      }

      throw new Error(`No swap provider available for ${network} network`);
    } catch (error) {
      if (error instanceof Error && error.message === 'GORBAGANA_AMM_NOT_IMPLEMENTED') {
        throw new Error('Gorbagana AMM swaps are coming soon! Please switch to Solana network to use Jupiter for swaps.');
      }
      throw error;
    }
  }
}