import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  GBA_TOKEN_PROGRAM_ID,
  GBA_ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@dumpsack/shared-utils';
import { appConfig } from '@dumpsack/shared-utils';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';

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

  // Get associated token accounts using GBA program IDs
  const fromATA = await getAssociatedTokenAddress(
    mint,
    fromPubkey,
    false,
    GBA_TOKEN_PROGRAM_ID,
    GBA_ASSOCIATED_TOKEN_PROGRAM_ID
  );
  const toATA = await getAssociatedTokenAddress(
    mint,
    toPubkey,
    false,
    GBA_TOKEN_PROGRAM_ID,
    GBA_ASSOCIATED_TOKEN_PROGRAM_ID
  );

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
        mint, // mint
        GBA_TOKEN_PROGRAM_ID,
        GBA_ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  // Add transfer instruction using GBA token program
  transaction.add(
    createTransferInstruction(
      fromATA, // source
      toATA, // destination
      fromPubkey, // owner
      amount, // amount
      [], // multiSigners
      GBA_TOKEN_PROGRAM_ID
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