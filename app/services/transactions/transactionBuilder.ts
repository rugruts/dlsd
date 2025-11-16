import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
} from '@dumpsack/shared-utils/solana';
import { appConfig } from '@dumpsack/shared-utils';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';

export interface SendGORParams {
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  lamports: number;
}

export interface SendSPLParams {
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  mint: PublicKey;
  amount: number;
}

export async function buildSendGOR(params: SendGORParams): Promise<{
  transaction: Transaction;
  blockhash: string;
  lastValidBlockHeight: number;
}> {
  const { fromPubkey, toPubkey, lamports } = params;
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  }).add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    })
  );

  return { transaction, blockhash, lastValidBlockHeight };
}

export async function buildSendSPL(params: SendSPLParams): Promise<{
  transaction: Transaction;
  blockhash: string;
  lastValidBlockHeight: number;
}> {
  const { fromPubkey, toPubkey, mint, amount } = params;
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');

  // Get associated token accounts
  const fromATA = await getAssociatedTokenAddress(mint, fromPubkey);
  const toATA = await getAssociatedTokenAddress(mint, toPubkey);

  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  });

  // Check if recipient ATA exists, create if not
  try {
    await connection.getAccountInfo(toATA);
  } catch {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        fromPubkey, // payer
        toATA, // ata
        toPubkey, // owner
        mint // mint
      )
    );
  }

  // Add transfer instruction
  transaction.add(
    createTransferInstruction(
      fromATA, // source
      toATA, // destination
      fromPubkey, // owner
      amount // amount
    )
  );

  return { transaction, blockhash, lastValidBlockHeight };
}

export async function estimateFees(transaction: Transaction): Promise<number> {
  const connection = new Connection(appConfig.rpc.primary, 'confirmed');

  try {
    const { value } = await connection.getFeeForMessage(
      transaction.compileMessage(),
      'confirmed'
    );
    return value;
  } catch (error) {
    // Fallback estimation: assume 5000 lamports per signature
    const signatures = transaction.signatures.length || 1;
    return signatures * 5000;
  }
}