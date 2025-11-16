import { create } from 'zustand';
import { PublicKey } from '@dumpsack/shared-utils/solana';
import { useAuthStore } from './authStore';
import { useWalletStore } from './walletStore';
import { buildSendGOR, buildSendSPL, estimateFees } from '../services/transactions/transactionBuilder';
import { simulateTransaction } from '../services/transactions/transactionSimulator';
import { sendAndConfirm } from '../services/transactions/transactionSender';
import { TokenItem } from '../types/wallet';

interface TransactionState {
  sending: boolean;
  lastSignature?: string;
  error?: string;
}

interface TransactionActions {
  sendGOR: (to: string, amount: number) => Promise<void>;
  sendToken: (to: string, token: TokenItem, amount: number) => Promise<void>;
  _setState: (state: Partial<TransactionState>) => void;
}

type TransactionStore = TransactionState & TransactionActions;

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  // Initial state
  sending: false,
  lastSignature: undefined,
  error: undefined,

  sendGOR: async (to: string, amount: number) => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) throw new Error('No wallet available');

    set({ sending: true, error: undefined });

    try {
      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey(to);

      // Build transaction
      const { transaction, blockhash, lastValidBlockHeight } = await buildSendGOR({
        fromPubkey,
        toPubkey,
        lamports: amount,
      });

      // Estimate fees
      const feeEstimate = await estimateFees(transaction);

      // Simulate
      const simulation = await simulateTransaction(transaction);
      if (!simulation.success) {
        throw new Error(simulation.errorMessage || 'Transaction simulation failed');
      }

      // Send and confirm
      const signature = await sendAndConfirm(transaction, {
        blockhash,
        lastValidBlockHeight,
      });

      // Update stores
      set({ sending: false, lastSignature: signature });
      await useWalletStore.getState().refresh(); // Refresh wallet data

    } catch (error) {
      set({
        sending: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      });
      throw error;
    }
  },

  sendToken: async (to: string, token: TokenItem, amount: number) => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) throw new Error('No wallet available');

    set({ sending: true, error: undefined });

    try {
      const fromPubkey = new PublicKey(publicKey);
      const toPubkey = new PublicKey(to);
      const mint = new PublicKey(token.mint);

      // Build transaction
      const { transaction, blockhash, lastValidBlockHeight } = await buildSendSPL({
        fromPubkey,
        toPubkey,
        mint,
        amount,
      });

      // Estimate fees
      const feeEstimate = await estimateFees(transaction);

      // Simulate
      const simulation = await simulateTransaction(transaction);
      if (!simulation.success) {
        throw new Error(simulation.errorMessage || 'Transaction simulation failed');
      }

      // Send and confirm
      const signature = await sendAndConfirm(transaction, {
        blockhash,
        lastValidBlockHeight,
      });

      // Update stores
      set({ sending: false, lastSignature: signature });
      await useWalletStore.getState().refresh(); // Refresh wallet data

    } catch (error) {
      set({
        sending: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      });
      throw error;
    }
  },

  _setState: (state) => set(state),
}));