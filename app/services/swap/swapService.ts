import { Transaction, PublicKey } from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';
import { SwapQuote } from '../../types/swap';
import { simulateTransaction } from '../transactions/transactionSimulator';
import { sendAndConfirm } from '../transactions/transactionSender';
import { signTransaction } from '../wallet/walletService';

export async function createSwapTransaction(
  quote: SwapQuote,
  userPubkey: PublicKey
): Promise<Transaction> {
  if (!appConfig.features.enableSwaps) {
    throw new Error('Swaps are not enabled');
  }

  const aggregatorUrl = appConfig.swap.aggregatorUrl;
  if (!aggregatorUrl) {
    throw new Error('Swap aggregator not configured');
  }

  try {
    const response = await fetch(`${aggregatorUrl}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPubkey.toBase58(),
        wrapAndUnwrapSol: true,
        feeAccount: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`Aggregator returned ${response.status}`);
    }

    const data = await response.json();

    // Deserialize the transaction
    const transaction = Transaction.from(Buffer.from(data.swapTransaction, 'base64'));

    return transaction;
  } catch (error) {
    console.error('Failed to create swap transaction:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create swap transaction');
  }
}

export async function simulateSwap(tx: Transaction) {
  return simulateTransaction(tx);
}

export async function executeSwap(tx: Transaction): Promise<string> {
  // Sign the transaction
  const signedTransaction = await signTransaction(tx);

  // Send and confirm
  const signature = await sendAndConfirm(signedTransaction, {
    blockhash: tx.recentBlockhash!,
    lastValidBlockHeight: 0, // Will be updated by confirmation logic
  });

  return signature;
}