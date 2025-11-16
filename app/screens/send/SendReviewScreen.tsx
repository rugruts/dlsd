import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Alert, ScrollView, Image } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useTransactionStore } from '../../state/transactionStore';
import { Button } from '../../components/Button';
import { shortAddress } from '../../utils/address';
import { parseAmount, formatAmount, lamportsToSol } from '../../utils/amount';

export default function SendReviewScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'SendReview'>();
  const { token, recipient, amount } = params;
  const { sendGOR, sendToken, sending, error } = useTransactionStore();

  const [feeEstimate, setFeeEstimate] = useState<number | null>(null);
  const [simulationResult, setSimulationResult] = useState<{ success: boolean; errorMessage?: string } | null>(null);

  const parsedAmount = parseAmount(amount, token.decimals);
  const displayAmount = formatAmount(parsedAmount, token.decimals);

  useEffect(() => {
    // TODO: Implement fee estimation and simulation
    // For now, use placeholder values
    setFeeEstimate(5000); // 5000 lamports
    setSimulationResult({ success: true });
  }, []);

  const handleSend = async () => {
    try {
      if (token.symbol === 'GOR') {
        await sendGOR(recipient, parsedAmount);
      } else {
        await sendToken(recipient, token, parsedAmount);
      }

      // Navigate to success
      navigation.navigate('SendSuccess', { signature: 'placeholder_signature' });
    } catch (error) {
      Alert.alert('Send Failed', error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        <View className="py-8">
          <View className="items-center mb-8">
            <Text className="text-text text-2xl font-bold">Review Transaction</Text>
            <Text className="text-textSecondary text-center mt-2">
              Please verify the details before sending
            </Text>
          </View>

          {/* Transaction Details */}
          <View className="bg-surface rounded-xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textSecondary">Asset</Text>
              <View className="flex-row items-center">
                {token.icon && <Image source={token.icon} className="w-5 h-5 mr-2" />}
                <Text className="text-text font-semibold">{token.symbol}</Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textSecondary">Amount</Text>
              <Text className="text-text font-semibold">{displayAmount} {token.symbol}</Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textSecondary">Recipient</Text>
              <Text className="text-text font-mono text-sm">{shortAddress(recipient)}</Text>
            </View>

            {feeEstimate && (
              <View className="flex-row items-center justify-between">
                <Text className="text-textSecondary">Network Fee</Text>
                <Text className="text-text font-semibold">
                  {lamportsToSol(feeEstimate).toFixed(6)} GOR
                </Text>
              </View>
            )}
          </View>

          {/* Simulation Result */}
          {simulationResult && (
            <View className={`rounded-lg p-4 mb-6 ${
              simulationResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`font-semibold ${
                simulationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {simulationResult.success ? '✓ Transaction Valid' : '✗ Transaction Invalid'}
              </Text>
              {simulationResult.errorMessage && (
                <Text className="text-red-700 text-sm mt-1">
                  {simulationResult.errorMessage}
                </Text>
              )}
            </View>
          )}

          {/* Error Banner */}
          {error && (
            <View className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="space-y-4">
            <Button
              title={sending ? 'Sending...' : 'Send Transaction'}
              onPress={handleSend}
              disabled={sending || !simulationResult?.success}
              className="w-full"
            />
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="secondary"
              className="w-full"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}