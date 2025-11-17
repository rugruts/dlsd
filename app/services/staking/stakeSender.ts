import { Transaction } from '@dumpsack/shared-utils';
import { appConfig } from '@dumpsack/shared-utils';
import { StakeTransactionContext } from './stakingTypes';
import { walletService } from '../wallet/walletService';

export async function sendAndConfirmStake(
  transaction: Transaction,
  context: StakeTransactionContext
): Promise<string> {
  if (!appConfig.features.enableStaking) {
    throw new Error('Staking is not enabled');
  }

  try {
    // Sign the transaction
    const signedTransaction = await walletService.signTransaction(transaction);

    // Serialize and send
    const serialized = signedTransaction.serialize();
    const base64Tx = Buffer.from(serialized).toString('base64');

    const sendResponse = await fetch(appConfig.rpc.primary, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [base64Tx, { encoding: 'base64', skipPreflight: false, preflightCommitment: 'confirmed' }],
      }),
    });

    if (!sendResponse.ok) {
      throw new Error(`Send transaction failed: ${sendResponse.status}`);
    }

    const sendData = await sendResponse.json();
    if (sendData.error) {
      throw new Error(`Send transaction error: ${sendData.error.message}`);
    }

    const signature = sendData.result;

    // Confirm transaction
    await confirmTransaction(signature, context);

    return signature;
  } catch (error) {
    console.error('Failed to send stake transaction:', error);
    throw error;
  }
}

async function confirmTransaction(signature: string, context: StakeTransactionContext): Promise<void> {
  const maxRetries = 30;
  const retryDelay = 1000; // 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(appConfig.rpc.primary, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'confirmTransaction',
          params: [{
            signature,
            blockhash: context.blockhash,
            lastValidBlockHeight: context.lastValidBlockHeight,
          }, { commitment: 'confirmed' }],
        }),
      });

      if (!response.ok) {
        throw new Error(`Confirm request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.result?.value?.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(data.result.value.err)}`);
      }

      if (data.result?.value?.confirmationStatus === 'confirmed') {
        return; // Success
      }

      // Check if blockhash is still valid
      if (i > 10) { // After 10 seconds, check blockhash validity
        const blockhashResponse = await fetch(appConfig.rpc.primary, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getLatestBlockhash',
            params: [{ commitment: 'confirmed' }],
          }),
        });

        const blockhashData = await blockhashResponse.json();
        const currentBlockHeight = blockhashData.result?.context?.slot;

        if (currentBlockHeight && currentBlockHeight > context.lastValidBlockHeight) {
          throw new Error('Transaction expired - blockhash no longer valid');
        }
      }

    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
    }

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, retryDelay));
  }

  throw new Error('Transaction confirmation timeout');
}