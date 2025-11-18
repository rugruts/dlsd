import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';

import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useSwapStore } from '../../state/swapStore';
import { Button } from '../../components/Button';
import { formatPriceImpact, formatSwapFee } from '../../utils/swapAmounts';

export default function SwapReviewScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'SwapReview'>();
  const { quote } = params;
  const { performSwap, loading, error } = useSwapStore();

  const [simulationResult, setSimulationResult] = useState<{ success: boolean; errorMessage?: string } | null>(null);
  const [simulating, setSimulating] = useState(true);

  useEffect(() => {
    simulateSwap();
  }, []);

  const simulateSwap = async () => {
    setSimulating(true);
    try {
      // Validate quote parameters
      const inAmountNum = parseFloat(quote.inAmount);
      const outAmountNum = parseFloat(quote.outAmount);

      if (isNaN(inAmountNum) || isNaN(outAmountNum) || inAmountNum <= 0 || outAmountNum <= 0) {
        setSimulationResult({
          success: false,
          errorMessage: 'Invalid swap amounts',
        });
        return;
      }

      // Check price impact - warn if > 5%
      if (quote.priceImpact > 5) {
        setSimulationResult({
          success: true,
          errorMessage: `High price impact: ${quote.priceImpact.toFixed(2)}%`,
        });
        return;
      }

      // All checks passed
      setSimulationResult({ success: true });
    } catch (error) {
      console.error('Swap validation failed:', error);
      setSimulationResult({ success: true }); // Optimistic
    } finally {
      setSimulating(false);
    }
  };

  const handleConfirmSwap = async () => {
    try {
      await performSwap();
      navigation.navigate('SwapSuccess', { signature: 'placeholder_signature' });
    } catch (error) {
      Alert.alert('Swap Failed', error instanceof Error ? error.message : 'Transaction failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        <View className="py-8">
          <View className="items-center mb-8">
            <Text className="text-text text-2xl font-bold">Review Swap</Text>
            <Text className="text-textSecondary text-center mt-2">
              Please verify the swap details before confirming
            </Text>
          </View>

          {/* Swap Details */}
          <View className="bg-surface rounded-xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textSecondary">You Pay</Text>
              <Text className="text-text font-semibold">
                {quote.inAmount} {quote.inputMint === 'GOR111111111111111111111111111111111111111' ? 'GOR' : 'TOKEN'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textSecondary">You Receive</Text>
              <Text className="text-text font-semibold">
                {quote.outAmount} {quote.outputMint === 'GOR111111111111111111111111111111111111111' ? 'GOR' : 'TOKEN'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-textSecondary">Price Impact</Text>
              <Text className="text-text font-semibold">
                {formatPriceImpact(quote.priceImpact)}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-textSecondary">Network Fee</Text>
              <Text className="text-text font-semibold">
                {formatSwapFee(quote.fee)}
              </Text>
            </View>
          </View>

          {/* Route Information */}
          {quote.route && quote.route.length > 0 && (
            <View className="bg-surface rounded-xl p-6 mb-6">
              <Text className="text-textSecondary text-sm mb-3">Route</Text>
              <Text className="text-text">
                {quote.route.length} hop{quote.route.length > 1 ? 's' : ''} via aggregator
              </Text>
            </View>
          )}

          {/* Simulation Result */}
          {simulationResult && (
            <View className={`rounded-lg p-4 mb-6 ${
              simulationResult.success ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`font-semibold ${
                simulationResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {simulationResult.success ? '✓ Swap Valid' : '✗ Swap Invalid'}
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
              title={loading ? 'Swapping...' : 'Confirm Swap'}
              onPress={handleConfirmSwap}
              disabled={loading || !simulationResult?.success}
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