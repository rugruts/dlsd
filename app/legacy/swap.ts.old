export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpact: number;
  fee: string;
  route: Array<{
    inAmount: string;
    outAmount: string;
    fee: string;
    marketInfos: Array<{
      id: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      fee: string;
    }>;
  }>;
  slippageBps: number;
}

export interface SwapResult {
  signature: string;
  inputAmount: string;
  outputAmount: string;
  fee: string;
}