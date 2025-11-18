import {
  Transaction,
  PublicKey,
  SystemProgram,
  StakeProgram,
  Authorized,
  Lockup,
  Connection,
  Keypair,
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_STAKE_HISTORY_PUBKEY,
} from '@solana/web3.js';
import {
  GBA_STAKE_PROGRAM_ID,
  GBA_SYSVARS,
  GBA_SYSTEM_PROGRAM_ID,
  appConfig
} from '@dumpsack/shared-utils';
import { createRpcClient } from '../blockchain/rpcClient';
import { walletService } from '../wallet/walletService';
import { StakingSummary } from '../../../packages/shared-types';
import { getStakeAccounts } from './stakeAccountService';

export class StakingService {
  private rpcClient = createRpcClient();
  private connection: Connection;

  constructor() {
    this.connection = new Connection(appConfig.rpc.primary, appConfig.rpc.commitment);
  }

  /**
   * Get staking summary for a wallet
   * Fetches real stake accounts from native stake program
   */
  async getStakingSummary(walletPubkey: PublicKey): Promise<StakingSummary> {
    try {
      const stakeAccounts = await getStakeAccounts(walletPubkey);

      let stakedBalance = BigInt(0);
      for (const account of stakeAccounts) {
        if (account.state === 'active' || account.state === 'activating') {
          stakedBalance += BigInt(account.balanceLamports);
        }
      }

      // Estimate APY based on network inflation (simplified)
      const apy = 7.5; // Typical Solana/Gorbagana staking APY

      return {
        stakedBalance,
        pendingRewards: BigInt(0), // Native staking doesn't have pending rewards
        apy,
        lockupPeriod: 0, // No lockup for native staking
      };
    } catch (error) {
      console.error('Error getting staking summary:', error);
      throw new Error('Failed to get staking summary');
    }
  }

  /**
   * Build transaction to create stake account and delegate to validator
   *
   * @param amount - Amount in lamports to stake
   * @param walletPubkey - Wallet public key (staker and withdrawer authority)
   * @param votePubkey - Validator vote account to delegate to
   */
  async buildDelegateStakeTx(
    amount: bigint,
    walletPubkey: PublicKey,
    votePubkey: PublicKey
  ): Promise<Transaction> {
    try {
      const tx = new Transaction();

      // Generate new stake account keypair
      const stakeAccount = Keypair.generate();

      // Get minimum balance for rent exemption
      const rentExemption = await this.connection.getMinimumBalanceForRentExemption(200);
      const totalLamports = Number(amount) + rentExemption;

      // 1. Create stake account
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: walletPubkey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports: totalLamports,
        space: 200, // Stake account size
        programId: GBA_STAKE_PROGRAM_ID,
      });

      // 2. Initialize stake account
      const initializeIx = StakeProgram.initialize({
        stakePubkey: stakeAccount.publicKey,
        authorized: new Authorized(walletPubkey, walletPubkey), // staker and withdrawer
        lockup: new Lockup(0, 0, walletPubkey), // No lockup
      });

      // 3. Delegate stake to validator
      const delegateIx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: walletPubkey,
        votePubkey: votePubkey,
      });

      tx.add(createAccountIx, initializeIx, delegateIx);

      // Set recent blockhash and fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPubkey;

      // Partially sign with stake account keypair
      tx.partialSign(stakeAccount);

      return tx;
    } catch (error) {
      console.error('Error building delegate stake transaction:', error);
      throw new Error('Failed to build delegate stake transaction');
    }
  }

  /**
   * Legacy method - redirects to buildDelegateStakeTx
   */
  async buildStakeTx(amount: bigint, walletPubkey: PublicKey, votePubkey: PublicKey): Promise<Transaction> {
    return this.buildDelegateStakeTx(amount, walletPubkey, votePubkey);
  }

  /**
   * Build transaction to deactivate stake account
   *
   * @param stakeAccountPubkey - Stake account to deactivate
   * @param walletPubkey - Authorized staker public key
   */
  async buildDeactivateStakeTx(
    stakeAccountPubkey: PublicKey,
    walletPubkey: PublicKey
  ): Promise<Transaction> {
    try {
      const tx = new Transaction();

      // Deactivate stake instruction
      const deactivateIx = StakeProgram.deactivate({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: walletPubkey,
      });

      tx.add(deactivateIx);

      // Set recent blockhash and fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPubkey;

      return tx;
    } catch (error) {
      console.error('Error building deactivate stake transaction:', error);
      throw new Error('Failed to build deactivate stake transaction');
    }
  }

  /**
   * Build transaction to withdraw from deactivated stake account
   *
   * @param stakeAccountPubkey - Stake account to withdraw from
   * @param walletPubkey - Authorized withdrawer public key
   * @param amount - Amount in lamports to withdraw
   */
  async buildWithdrawStakeTx(
    stakeAccountPubkey: PublicKey,
    walletPubkey: PublicKey,
    amount: bigint
  ): Promise<Transaction> {
    try {
      const tx = new Transaction();

      // Withdraw stake instruction
      const withdrawIx = StakeProgram.withdraw({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: walletPubkey,
        toPubkey: walletPubkey,
        lamports: Number(amount),
      });

      tx.add(withdrawIx);

      // Set recent blockhash and fee payer
      const { blockhash } = await this.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = walletPubkey;

      return tx;
    } catch (error) {
      console.error('Error building withdraw stake transaction:', error);
      throw new Error('Failed to build withdraw stake transaction');
    }
  }

  /**
   * Legacy method - redirects to buildDeactivateStakeTx
   */
  async buildUnstakeTx(stakeAccountPubkey: PublicKey, walletPubkey: PublicKey): Promise<Transaction> {
    return this.buildDeactivateStakeTx(stakeAccountPubkey, walletPubkey);
  }

  /**
   * Native staking doesn't have separate "claim rewards" - rewards are automatically
   * added to the stake account balance. To access rewards, you must deactivate and withdraw.
   *
   * This method is kept for API compatibility but throws an error.
   */
  async buildClaimRewardsTx(walletPubkey: PublicKey): Promise<Transaction> {
    throw new Error(
      'Native staking does not support claiming rewards separately. ' +
      'Rewards are automatically added to your stake account. ' +
      'To access rewards, deactivate your stake and withdraw.'
    );
  }

  async simulateStakingTx(tx: Transaction): Promise<any> {
    return this.rpcClient.simulateTransaction(tx);
  }

  async sendStakingTx(tx: Transaction): Promise<string> {
    const signedTx = await walletService.signTransaction(tx);
    const rawTx = signedTx.serialize();
    return this.rpcClient.sendRawTransaction(rawTx);
  }
}

export const stakingService = new StakingService();