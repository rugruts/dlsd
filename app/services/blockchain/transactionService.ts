import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";

export async function buildTransferTx(params: {
  connection: Connection;
  fromPubkey: PublicKey;
  toPubkey: PublicKey;
  lamports: number;
}) {
  const { connection, fromPubkey, toPubkey, lamports } = params;

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

  const tx = new Transaction({
    recentBlockhash: blockhash,
    feePayer: fromPubkey,
  }).add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports,
    })
  );

  return { tx, blockhash, lastValidBlockHeight };
}

export async function sendSignedTx(connection: Connection, signed: Transaction, ctx: {
  blockhash: string;
  lastValidBlockHeight: number;
}) {
  const raw = signed.serialize();
  const sig = await connection.sendRawTransaction(raw, { skipPreflight: false, preflightCommitment: "confirmed" });

  // modern confirm signature
  await connection.confirmTransaction(
    { signature: sig, blockhash: ctx.blockhash, lastValidBlockHeight: ctx.lastValidBlockHeight },
    "confirmed"
  );

  return sig;
}