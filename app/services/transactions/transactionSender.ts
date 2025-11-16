import { Connection, Transaction } from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';
import { signTransaction } from '../wallet/walletService';

export interface SendContext {
  blockhash: string;
  lastValidBlockHeight: number;
}

export async function sendAndConfirm(
  transaction: Transaction,
  context: SendContext
): Promise<string> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  // Sign the transaction
  const signedTransaction = await signTransaction(transaction);

  // Serialize for sending
  const rawTransaction = signedTransaction.serialize();

  // Send with retry logic
  let signature: string;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    try {
      signature = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });
      break;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to send transaction after ${maxAttempts} attempts: ${error}`);
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  // Confirm transaction
  try {
    await connection.confirmTransaction(
      {
        signature,
        blockhash: context.blockhash,
        lastValidBlockHeight: context.lastValidBlockHeight,
      },
      'confirmed'
    );
  } catch (error) {
    // Check if blockhash expired
    if (error.message?.includes('Blockhash not found')) {
      throw new Error('Transaction expired. Please try again.');
    }
    throw new Error(`Transaction confirmation failed: ${error}`);
  }

  return signature!;
}