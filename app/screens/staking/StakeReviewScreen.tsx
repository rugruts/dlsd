import React, { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useStakingStore } from '../../state/stakingStore';
import { Button } from '../../components/Button';
import { formatLamports, shortVoteKey } from '../../utils/stake';

export default function StakeReviewScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'StakeReview'>();
  const { action, stakeData } = params;

  const { loading, createAndDelegate, delegateExisting, deactivate, withdraw } = useStakingStore();
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      let signature: string;

      switch (action.type) {
        case 'createAndDelegate':
          signature = await createAndDelegate(
            action.votePubkey!,
            (action.amountLamports! / 1e9).toString()
          );
          break;
        case 'delegateExisting':
          signature = await delegateExisting(action.stakeAccountPubkey!, action.votePubkey!);
          break;
        case 'deactivate':
          signature = await deactivate(action.stakeAccountPubkey!);
          break;
        case 'withdraw':
          signature = await withdraw(
            action.stakeAccountPubkey!,
            action.destinationPubkey!,
            (action.amountLamports! / 1e9).toString()
          );
          break;
        default:
          throw new Error('Unknown action type');
      }

      navigation.navigate('StakeResult', { signature });
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Transaction failed');
    } finally {
      setProcessing(false);
    }
  };

  const renderActionDetails = () => {
    switch (action.type) {
      case 'createAndDelegate':
        return (
          <View>
            <Text className="text-text font-semibold mb-2">Create Stake Account & Delegate</Text>
            <Text className="text-textSecondary">Amount: {formatLamports(action.amountLamports!)} GOR</Text>
            <Text className="text-textSecondary">Validator: {shortVoteKey(action.votePubkey!)}</Text>
          </View>
        );
      case 'delegateExisting':
        return (
          <View>
            <Text className="text-text font-semibold mb-2">Delegate Existing Stake</Text>
            <Text className="text-textSecondary">Account: {shortVoteKey(action.stakeAccountPubkey!)}</Text>
            <Text className="text-textSecondary">Validator: {shortVoteKey(action.votePubkey!)}</Text>
          </View>
        );
      case 'deactivate':
        return (
          <View>
            <Text className="text-text font-semibold mb-2">Deactivate Stake</Text>
            <Text className="text-textSecondary">Account: {shortVoteKey(action.stakeAccountPubkey!)}</Text>
            <Text className="text-red-500 text-sm mt-2">
              ⚠️ This will start the unstaking process. Funds will be locked for ~1-2 days.
            </Text>
          </View>
        );
      case 'withdraw':
        return (
          <View>
            <Text className="text-text font-semibold mb-2">Withdraw Stake</Text>
            <Text className="text-textSecondary">Account: {shortVoteKey(action.stakeAccountPubkey!)}</Text>
            <Text className="text-textSecondary">Amount: {formatLamports(action.amountLamports!)} GOR</Text>
            <Text className="text-textSecondary">Destination: {shortVoteKey(action.destinationPubkey!)}</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Review Transaction</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-surface rounded-lg p-6 mb-6">
          <Text className="text-text text-lg font-semibold mb-4">Transaction Details</Text>
          {renderActionDetails()}
        </View>

        <View className="bg-surface rounded-lg p-6 mb-6">
          <Text className="text-text text-lg font-semibold mb-4">Network Fee</Text>
          <Text className="text-textSecondary">Estimated: ~0.000005 GOR</Text>
        </View>

        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <Text className="text-yellow-800 text-sm">
            ⚠️ This transaction will be simulated before execution. Please review all details carefully.
          </Text>
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <Button
          title={processing ? "Processing..." : "Confirm Transaction"}
          onPress={handleConfirm}
          disabled={processing || loading}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}