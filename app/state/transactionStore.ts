import { create } from 'zustand';
import { Transaction, TransactionStatus } from '../../packages/shared-types';

interface TransactionState {
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'status'>) => string;
  updateTransactionStatus: (id: string, status: TransactionStatus, txHash?: string) => void;
  getTransaction: (id: string) => Transaction | undefined;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],

  addTransaction: (tx) => {
    const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newTx: Transaction = {
      ...tx,
      id,
      timestamp: Date.now(),
      status: 'pending',
    };

    set((state) => ({
      transactions: [newTx, ...state.transactions],
    }));

    return id;
  },

  updateTransactionStatus: (id, status, txHash) => {
    set((state) => ({
      transactions: state.transactions.map((tx) =>
        tx.id === id
          ? { ...tx, status, txHash: txHash || tx.txHash }
          : tx
      ),
    }));
  },

  getTransaction: (id) => {
    return get().transactions.find((tx) => tx.id === id);
  },

  clearTransactions: () => {
    set({ transactions: [] });
  },
}));