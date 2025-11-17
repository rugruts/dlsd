import { create } from 'zustand';
import { PublicKey } from '@dumpsack/shared-utils';
import { useAuthStore } from './authStore';
import { useWalletStore } from './walletStoreV2';
import { getValidators } from '../services/staking/validatorService';
import { getStakeOverview } from '../services/staking/stakeAccountService';
import {
  buildCreateAndDelegate,
  buildDelegateExisting,
  buildDeactivate,
  buildWithdraw
} from '../services/staking/stakeTxBuilder';
import { simulateStakeTx } from '../services/staking/stakeSimulator';
import { sendAndConfirmStake } from '../services/staking/stakeSender';
import { StakeOverview, ValidatorInfo } from '../services/staking/stakingTypes';

interface StakingState {
  loading: boolean;
  overview?: StakeOverview;
  validators: ValidatorInfo[];
  error?: string;
  lastRefresh: number;
}

interface StakingActions {
  refresh(): Promise<void>;
  createAndDelegate(votePubkey: string, amountGOR: string): Promise<string>;
  delegateExisting(stakeAccount: string, votePubkey: string): Promise<string>;
  deactivate(stakeAccount: string): Promise<string>;
  withdraw(stakeAccount: string, destination: string, amountGOR: string): Promise<string>;
  _setState: (state: Partial<StakingState>) => void;
}

type StakingStore = StakingState & StakingActions;

const CACHE_DURATION = 60 * 1000; // 60 seconds

export const useStakingStore = create<StakingStore>((set, get) => ({
  // Initial state
  loading: false,
  overview: undefined,
  validators: [],
  error: undefined,
  lastRefresh: 0,

  refresh: async () => {
    const { lastRefresh } = get();
    const now = Date.now();

    // Use cache if recent
    if (now - lastRefresh < CACHE_DURATION && get().overview) {
      return;
    }

    set({ loading: true, error: undefined });

    try {
      const { publicKey } = useAuthStore.getState();
      if (!publicKey) {
        throw new Error('No wallet connected');
      }

      const ownerPubkey = new PublicKey(publicKey);

      // Load overview and validators in parallel
      const [overview, validators] = await Promise.all([
        getStakeOverview(ownerPubkey),
        getValidators(),
      ]);

      set({
        overview,
        validators,
        loading: false,
        lastRefresh: now,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to refresh staking data',
      });
      throw error;
    }
  },

  createAndDelegate: async (votePubkey: string, amountGOR: string): Promise<string> => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) {
      throw new Error('No wallet connected');
    }

    const ownerPubkey = new PublicKey(publicKey);
    const amountLamports = Math.floor(parseFloat(amountGOR) * 1e9); // Convert GOR to lamports

    set({ loading: true, error: undefined });

    try {
      // Build transaction
      const { transaction, context } = await buildCreateAndDelegate({
        ownerPubkey,
        votePubkey,
        amountLamports,
      });

      // Simulate
      const simulation = await simulateStakeTx(transaction);
      if (!simulation.success) {
        throw new Error(simulation.errorMessage || 'Transaction simulation failed');
      }

      // Send and confirm
      const signature = await sendAndConfirmStake(transaction, context);

      // Refresh data
      await get().refresh();

      set({ loading: false });
      return signature;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Stake creation failed',
      });
      throw error;
    }
  },

  delegateExisting: async (stakeAccount: string, votePubkey: string): Promise<string> => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) {
      throw new Error('No wallet connected');
    }

    const ownerPubkey = new PublicKey(publicKey);

    set({ loading: true, error: undefined });

    try {
      // Build transaction
      const { transaction, context } = await buildDelegateExisting({
        stakeAccountPubkey: stakeAccount,
        votePubkey,
        ownerPubkey,
      });

      // Simulate
      const simulation = await simulateStakeTx(transaction);
      if (!simulation.success) {
        throw new Error(simulation.errorMessage || 'Transaction simulation failed');
      }

      // Send and confirm
      const signature = await sendAndConfirmStake(transaction, context);

      // Refresh data
      await get().refresh();

      set({ loading: false });
      return signature;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Delegation failed',
      });
      throw error;
    }
  },

  deactivate: async (stakeAccount: string): Promise<string> => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) {
      throw new Error('No wallet connected');
    }

    const ownerPubkey = new PublicKey(publicKey);

    set({ loading: true, error: undefined });

    try {
      // Build transaction
      const { transaction, context } = await buildDeactivate({
        stakeAccountPubkey: stakeAccount,
        ownerPubkey,
      });

      // Simulate
      const simulation = await simulateStakeTx(transaction);
      if (!simulation.success) {
        throw new Error(simulation.errorMessage || 'Transaction simulation failed');
      }

      // Send and confirm
      const signature = await sendAndConfirmStake(transaction, context);

      // Refresh data
      await get().refresh();

      set({ loading: false });
      return signature;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Deactivation failed',
      });
      throw error;
    }
  },

  withdraw: async (stakeAccount: string, destination: string, amountGOR: string): Promise<string> => {
    const { publicKey } = useAuthStore.getState();
    if (!publicKey) {
      throw new Error('No wallet connected');
    }

    const ownerPubkey = new PublicKey(publicKey);
    const amountLamports = Math.floor(parseFloat(amountGOR) * 1e9);

    set({ loading: true, error: undefined });

    try {
      // Build transaction
      const { transaction, context } = await buildWithdraw({
        stakeAccountPubkey: stakeAccount,
        destinationPubkey: destination,
        lamports: amountLamports,
        ownerPubkey,
      });

      // Simulate
      const simulation = await simulateStakeTx(transaction);
      if (!simulation.success) {
        throw new Error(simulation.errorMessage || 'Transaction simulation failed');
      }

      // Send and confirm
      const signature = await sendAndConfirmStake(transaction, context);

      // Refresh data
      await get().refresh();

      set({ loading: false });
      return signature;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Withdrawal failed',
      });
      throw error;
    }
  },

  _setState: (state) => set(state),
}));