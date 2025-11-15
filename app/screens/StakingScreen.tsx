import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useWallet } from '../hooks/useWallet';
import { useStakingSummary } from '../hooks/useStakingSummary';
import { stakingService } from '../services/staking/stakingService';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Button } from '../components/Button';

export default function StakingScreen() {
  const { publicKey } = useWallet();
  const { summary, loading, error, refresh } = useStakingSummary(publicKey);

  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1000000000).toFixed(6); // Assume 9 decimals for GOR
  };

  const handleStake = async () => {
    if (!stakeAmount || !publicKey) return;

    setActionLoading(true);
    try {
      const amount = BigInt(Math.floor(parseFloat(stakeAmount) * 1000000000));
      const tx = await stakingService.buildStakeTx(amount, publicKey);

      // Simulate and send
      await stakingService.simulateStakingTx(tx);
      const txHash = await stakingService.sendStakingTx(tx);

      Alert.alert('Success', `Staked ${stakeAmount} GOR successfully!`);
      setStakeAmount('');
      refresh();
    } catch (err) {
      Alert.alert('Error', 'Failed to stake tokens');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || !publicKey) return;

    setActionLoading(true);
    try {
      const amount = BigInt(Math.floor(parseFloat(unstakeAmount) * 1000000000));
      const tx = await stakingService.buildUnstakeTx(amount, publicKey);

      await stakingService.simulateStakingTx(tx);
      const txHash = await stakingService.sendStakingTx(tx);

      Alert.alert('Success', `Unstaked ${unstakeAmount} GOR successfully!`);
      setUnstakeAmount('');
      refresh();
    } catch (err) {
      Alert.alert('Error', 'Failed to unstake tokens');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!publicKey) return;

    setActionLoading(true);
    try {
      const tx = await stakingService.buildClaimRewardsTx(publicKey);

      await stakingService.simulateStakingTx(tx);
      const txHash = await stakingService.sendStakingTx(tx);

      Alert.alert('Success', 'Rewards claimed successfully!');
      refresh();
    } catch (err) {
      Alert.alert('Error', 'Failed to claim rewards');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <Text className="text-text">Loading staking data...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <View className="flex-1 justify-center items-center">
          <Text className="text-error text-center mb-4">{error}</Text>
          <Button title="Retry" onPress={refresh} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={loading} onRefresh={refresh}>
      <Text className="text-text text-2xl font-bold mb-6">Staking</Text>

      {/* Summary */}
      <View className="bg-surface p-4 rounded-lg mb-6">
        <Text className="text-textSecondary mb-2">Staking Summary</Text>
        <View className="flex-row justify-between mb-2">
          <Text className="text-text">Staked Balance:</Text>
          <Text className="text-text font-bold">
            {summary ? formatAmount(summary.stakedBalance) : '0'} GOR
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-text">Pending Rewards:</Text>
          <Text className="text-text font-bold">
            {summary ? formatAmount(summary.pendingRewards) : '0'} GOR
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-text">APY:</Text>
          <Text className="text-text font-bold">
            {summary ? `${summary.apy}%` : '0%'}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-text">Lock-up Period:</Text>
          <Text className="text-text font-bold">
            {summary ? `${summary.lockupPeriod} days` : '0 days'}
          </Text>
        </View>
      </View>

      {/* Stake */}
      <View className="mb-6">
        <Text className="text-textSecondary mb-2">Stake GOR</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-surface p-3 rounded-l-lg text-text"
            placeholder="Amount to stake"
            keyboardType="numeric"
            value={stakeAmount}
            onChangeText={setStakeAmount}
          />
          <Button
            title="Stake"
            onPress={handleStake}
            disabled={actionLoading || !stakeAmount}
          />
        </View>
      </View>

      {/* Unstake */}
      <View className="mb-6">
        <Text className="text-textSecondary mb-2">Unstake GOR</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-surface p-3 rounded-l-lg text-text"
            placeholder="Amount to unstake"
            keyboardType="numeric"
            value={unstakeAmount}
            onChangeText={setUnstakeAmount}
          />
          <Button
            title="Unstake"
            onPress={handleUnstake}
            disabled={actionLoading || !unstakeAmount}
          />
        </View>
      </View>

      {/* Claim Rewards */}
      <View className="mb-6">
        <Button
          title="Claim Rewards"
          onPress={handleClaimRewards}
          disabled={actionLoading || !summary || summary.pendingRewards <= 0}
        />
      </View>
    </ScreenContainer>
  );
}