import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useStakingStore } from '../../state/stakingStore';
import { Button } from '../../components/Button';
import { formatLamports, formatStakeState, getStakeStateColor } from '../../utils/stake';

export default function StakingDashboardScreen() {
  const navigation = useAppNavigation();
  const { overview, loading, error, refresh } = useStakingStore();

  useEffect(() => {
    refresh();
  }, []);

  const handleStakeGOR = () => {
    navigation.navigate('ValidatorList');
  };

  const handleManageStake = (stakeAccount: any) => {
    navigation.navigate('StakeAction', {
      mode: 'delegateExisting',
      stakeAccount: stakeAccount.pubkey,
    });
  };

  if (!overview) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-text text-lg mb-4">Loading staking data...</Text>
          {error && (
            <Text className="text-red-500 text-sm text-center mb-4">{error}</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
      >
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-text text-2xl font-bold">Staking</Text>
            <Text className="text-textSecondary text-sm">
              APR: {(overview.aprEstimate * 100).toFixed(1)}%
            </Text>
          </View>

          {/* Summary Cards */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-4">
              <View className="flex-1 bg-surface rounded-lg p-4 mr-2">
                <Text className="text-textSecondary text-sm">Total Staked</Text>
                <Text className="text-text text-xl font-bold">
                  {formatLamports(overview.totalActive)} GOR
                </Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-4 ml-2">
                <Text className="text-textSecondary text-sm">Rewards</Text>
                <Text className="text-green-500 text-xl font-bold">
                  +{formatLamports(Math.floor(overview.totalActive * overview.aprEstimate * 0.01))} GOR
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 bg-surface rounded-lg p-4 mr-2">
                <Text className="text-textSecondary text-sm">Activating</Text>
                <Text className="text-yellow-500 text-lg font-semibold">
                  {formatLamports(overview.totalActivating)} GOR
                </Text>
              </View>
              <View className="flex-1 bg-surface rounded-lg p-4 ml-2">
                <Text className="text-textSecondary text-sm">Deactivating</Text>
                <Text className="text-orange-500 text-lg font-semibold">
                  {formatLamports(overview.totalDeactivating)} GOR
                </Text>
              </View>
            </View>
          </View>

          {/* Stake GOR Button */}
          <Button
            title="Stake GOR"
            onPress={handleStakeGOR}
            className="w-full mb-6"
          />

          {/* Stake Accounts */}
          <Text className="text-text text-lg font-semibold mb-4">Your Stake Accounts</Text>

          {overview.accounts.length === 0 ? (
            <View className="bg-surface rounded-lg p-6 items-center">
              <Text className="text-textSecondary text-center">
                No stake accounts found. Start by staking some GOR!
              </Text>
            </View>
          ) : (
            overview.accounts.map((account) => (
              <View key={account.pubkey} className="bg-surface rounded-lg p-4 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-text font-semibold">
                    {account.pubkey.slice(0, 8)}...{account.pubkey.slice(-8)}
                  </Text>
                  <Text className={`font-semibold ${getStakeStateColor(account.state)}`}>
                    {formatStakeState(account.state)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-textSecondary text-sm">Balance</Text>
                  <Text className="text-text">
                    {formatLamports(account.balanceLamports)} GOR
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-textSecondary text-sm">Withdrawable</Text>
                  <Text className="text-text">
                    {formatLamports(account.withdrawableLamports)} GOR
                  </Text>
                </View>

                <Button
                  title="Manage"
                  onPress={() => handleManageStake(account)}
                  variant="secondary"
                  className="w-full"
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}