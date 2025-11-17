import {
  Transaction,
  SystemProgram,
  PublicKey,
  TransactionInstruction,
  ComputeBudgetProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction
} from '@solana/spl-token';
import { createRpcClient } from '../blockchain/rpcClient';
import { walletService } from '../wallet/walletService';
import { TransferTxParams, TransactionSummary, FeeEstimate } from '../blockchain/models';
import { TransactionSimulation } from '../../../packages/shared-types';

const GOR_TO_LAMPORTS = LAMPORTS_PER_SOL; // Assuming 1 GOR = 1 SOL for conversion

export class TransactionService {
  private rpcClient = createRpcClient();

  async buildTransferTx(params: TransferTxParams): Promise<Transaction> {
    const { from, to, amount, mint } = params;
    const tx = new Transaction();

    if (mint) {
      // SPL token transfer
      await this.addTokenTransferInstructions(tx, from, to, mint, amount);
    } else {
      // Native GOR transfer
      tx.add(
        SystemProgram.transfer({
          fromPubkey: from,
          toPubkey: to,
          lamports: amount,
        })
      );
    }

    // Add recent blockhash
    const blockhash = await this.rpcClient.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.feePayer = from;

    return tx;
  }

  private async addTokenTransferInstructions(
    tx: Transaction,
    from: PublicKey,
    to: PublicKey,
    mint: PublicKey,
    amount: bigint
  ): Promise<void> {
    // Get sender's ATA
    const senderATA = await getAssociatedTokenAddress(mint, from);

    // Get receiver's ATA
    const receiverATA = await getAssociatedTokenAddress(mint, to);

    // Check if receiver ATA exists, if not, create it
    const accountInfo = await this.rpcClient.getAccountInfo(receiverATA);
    if (!accountInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          from, // payer
          receiverATA, // ata
          to, // owner
          mint // mint
        )
      );
    }

    // Add transfer instruction
    tx.add(
      createTransferInstruction(
        senderATA, // source
        receiverATA, // destination
        from, // owner
        amount, // amount
        [], // multiSigners
        TOKEN_PROGRAM_ID // programId
      )
    );
  }

  async simulateTransaction(tx: Transaction): Promise<TransactionSimulation> {
    // Simulate the transaction
    const simulation = await this.rpcClient.simulateTransaction(tx);

    if (simulation.value.err) {
      throw new Error(`Simulation failed: ${simulation.value.err}`);
    }

    const computeUnits = simulation.value.unitsConsumed || 0;
    const feeEstimate = await this.estimateFees(tx);
    const description = this.describeTransaction(tx);
    const warnings = this.analyzeTransactionRisks(tx, feeEstimate);

    // Determine risk level based on various factors
    const riskLevel = this.calculateRiskLevel(tx, feeEstimate, warnings);

    return {
      feeEstimate,
      description,
      riskLevel,
      warnings,
    };
  }

  describeTransaction(tx: Transaction): string {
    try {
      // Analyze the first instruction to determine transaction type
      const instruction = tx.instructions[0];

      if (instruction.programId.equals(SystemProgram.programId)) {
        // System program - likely transfer
        if (instruction.data.length >= 12) {
          // Extract amount from transfer instruction
          const amount = instruction.data.slice(4, 12);
          const lamports = amount.readBigUInt64LE(0);
          const gor = Number(lamports) / LAMPORTS_PER_SOL;

          return `Transfer ${gor.toFixed(4)} GOR`;
        }
      } else if (instruction.programId.equals(TOKEN_PROGRAM_ID)) {
        // Token program - SPL token transfer
        return `Transfer SPL tokens`;
      }

      return `Unknown transaction`;
    } catch (error) {
      return `Transaction`;
    }
  }

  private analyzeTransactionRisks(tx: Transaction, feeEstimate: FeeEstimate): string[] {
    const warnings: string[] = [];

    // Check for high fees
    if (feeEstimate.gor > 0.01) {
      warnings.push('High transaction fee detected');
    }

    // Check for large amounts (placeholder logic)
    // In a real implementation, you'd analyze the instruction data

    // Check for suspicious destinations
    // Add more risk analysis as needed

    return warnings;
  }

  private calculateRiskLevel(tx: Transaction, feeEstimate: FeeEstimate, warnings: string[]): 'low' | 'medium' | 'high' {
    if (warnings.length > 2 || feeEstimate.gor > 0.1) {
      return 'high';
    } else if (warnings.length > 0 || feeEstimate.gor > 0.01) {
      return 'medium';
    }
    return 'low';
  }

  async sendTransaction(tx: Transaction): Promise<string> {
    // Sign the transaction
    const signedTx = await walletService.signTransaction(tx);

    // Serialize and send
    const rawTx = signedTx.serialize();
    return await this.rpcClient.sendRawTransaction(rawTx);
  }

  async estimateFees(tx: Transaction): Promise<FeeEstimate> {
    const simulation = await this.rpcClient.simulateTransaction(tx);

    const lamports = BigInt(simulation.value.accounts?.[0]?.lamports || 2000); // Default fee
    const gor = Number(lamports) / GOR_TO_LAMPORTS;
    const computeUnits = simulation.value.unitsConsumed || 0;

    return {
      lamports,
      gor,
      computeUnits,
    };
  }
}

// Singleton
export const transactionService = new TransactionService();