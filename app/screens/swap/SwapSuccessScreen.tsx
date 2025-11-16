import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Linking } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { Button } from '../../components/Button';

export default function SwapSuccessScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'SwapSuccess'>();
  const { signature } = params;

  const handleViewOnExplorer = () => {
    const explorerUrl = `https://explorer.solana.com/tx/${signature}`;
    Linking.openURL(explorerUrl);
  };

  const handleBackToDashboard = () => {
    navigation.navigate('MainTabs');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center items-center">
        {/* Success Icon */}
        <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-8">
          <Text className="text-white text-3xl font-bold">✓</Text>
        </View>

        {/* Success Message */}
        <Text className="text-text text-2xl font-bold text-center mb-4">
          Swap Completed!
        </Text>
        <Text className="text-textSecondary text-center mb-8">
          Your tokens have been successfully swapped
        </Text>

        {/* Transaction Details */}
        <View className="bg-surface rounded-xl p-6 w-full mb-8">
          <Text className="text-textSecondary text-sm mb-2">Transaction Signature</Text>
          <Text className="text-text font-mono text-sm break-all">
            {signature}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
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