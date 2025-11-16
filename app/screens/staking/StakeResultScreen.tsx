import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { Button } from '../../components/Button';

export default function StakeResultScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'StakeResult'>();
  const { signature } = params;

  const handleViewOnExplorer = () => {
    // Would open explorer URL
    console.log('View on explorer:', signature);
  };

  const handleBackToDashboard = () => {
    navigation.popToTop();
    navigation.replace('StakingDashboard');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-green-50 border border-green-200 rounded-full w-20 h-20 justify-center items-center mb-6">
          <Text className="text-green-600 text-3xl">✓</Text>
        </View>

        <Text className="text-text text-2xl font-bold text-center mb-2">
          Transaction Successful!
        </Text>

        <Text className="text-textSecondary text-center mb-6">
          Your staking transaction has been confirmed on the blockchain.
        </Text>

        <View className="bg-surface rounded-lg p-4 w-full mb-6">
          <Text className="text-textSecondary text-sm mb-1">Transaction Signature</Text>
          <Text className="text-text font-mono text-sm break-all">{signature}</Text>
        </View>

        <View className="w-full space-y-3">
          <Button
            title="View on Explorer"
            onPress={handleViewOnExplorer}
            variant="secondary"
            className="w-full"
          />

          <Button
            title="Back to Dashboard"
            onPress={handleBackToDashboard}
            className="w-full"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}