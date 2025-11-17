import { Transaction, PublicKey } from '@solana/web3.js';
import { createRpcClient } from '../blockchain/rpcClient';
import { walletService } from '../wallet/walletService';
import { SwapQuote, SwapRoute } from '../../../packages/shared-types';

interface SwapConfig {
  aggregatorUrl: string;
  aggregatorApiKey?: string;
  slippageBps: number;
}

const defaultConfig: SwapConfig = {
  aggregatorUrl: process.env.EXPO_PUBLIC_SWAP_AGGREGATOR_URL || 'https://api.jupiter.ag',
  aggregatorApiKey: process.env.EXPO_PUBLIC_SWAP_API_KEY,
  slippageBps: 50, // 0.5%
};

export class SwapService {
  private config: SwapConfig;
  private rpcClient = createRpcClient();

  constructor(config: Partial<SwapConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async getQuote(
    inputMint: PublicKey,
    outputMint: PublicKey,
    amount: bigint,
    slippageBps: number = this.config.slippageBps
  ): Promise<SwapQuote> {
    try {
      // Use Jupiter API v6 for quotes
      const queryParams = new URLSearchParams({
        inputMint: inputMint.toBase58(),
        outputMint: outputMint.toBase58(),
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        swapMode: 'ExactIn',
        onlyDirectRoutes: 'false',
      });

      const response = await fetch(`${this.config.aggregatorUrl}/v6/quote?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        inputMint: inputMint.toBase58(),
        outputMint: outputMint.toBase58(),
        inputAmount: BigInt(data.inAmount || amount),
        outputAmount: BigInt(data.outAmount || 0),
        minOutputAmount: BigInt(data.otherAmountThreshold || 0),
        priceImpact: parseFloat(data.priceImpactPct || '0') / 100,
        fee: BigInt(data.platformFee?.amount || 0),
        route: data.routePlan || [],
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error('Failed to get swap quote');
    }
  }

  async buildSwapTransaction(quote: SwapQuote, walletPubkey: PublicKey): Promise<Transaction> {
    try {
      // Use Jupiter API v6 to build swap transaction
      const response = await fetch(`${this.config.aggregatorUrl}/v6/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: walletPubkey.toBase58(),
          wrapAndUnwrapSol: true,
          computeUnitPriceMicroLamports: 'auto',
        }),
      });

      if (!response.ok) {
        throw new Error(`Jupiter swap API error: ${response.status}`);
      }

      const data = await response.json();

      // Deserialize the transaction
      const txBuffer = Buffer.from(data.swapTransaction, 'base64');
      const tx = Transaction.from(txBuffer);

      // Update with latest blockhash
      const blockhash = await this.rpcClient.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPubkey;

      return tx;
    } catch (error) {
      console.error('Error building swap transaction:', error);
      throw new Error('Failed to build swap transaction');
    }
  }

  async simulateSwapTx(tx: Transaction): Promise<unknown> {
    return this.rpcClient.simulateTransaction(tx);
  }

  async sendSwapTx(tx: Transaction): Promise<string> {
    const signedTx = await walletService.signTransaction(tx);
    const rawTx = signedTx.serialize();
    return this.rpcClient.sendRawTransaction(rawTx);
  }
}

export const swapService = new SwapService();

/**
 * Create swap transaction (convenience function)
 */
export async function createSwapTransaction(
  inputMint: PublicKey,
  outputMint: PublicKey,
  amount: bigint,
  walletPubkey: PublicKey,
  slippageBps?: number
): Promise<Transaction> {
  const quote = await swapService.getQuote(inputMint, outputMint, amount, slippageBps);
  return swapService.buildSwapTransaction(quote, walletPubkey);
}

/**
 * Simulate swap (convenience function)
 */
export async function simulateSwap(tx: Transaction): Promise<any> {
  return swapService.simulateSwapTx(tx);
}

/**
 * Execute swap (convenience function)
 */
export async function executeSwap(tx: Transaction): Promise<string> {
  return swapService.sendSwapTx(tx);
}