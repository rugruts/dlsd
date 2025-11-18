import React, { useState } from 'react';
import { View, Text, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { SwapQuote } from '@dumpsack/shared-utils';

// SwapFormData is a simple form type, can be defined locally or kept in shared-types
interface SwapFormData {
  inputToken: string;
  outputToken: string;
  inputAmount: string;
}

import { biometricsService } from '../services/security/biometricsService';
import { swapService } from '../services/swaps/swapService';
import { useSecurityStore } from '../state/securityStore';
import { useTransactionStore } from '../state/transactionStore';
import { useWallet } from '../hooks/useWallet';
import { Button } from './Button';

interface SwapReviewSheetProps {
  visible: boolean;
  onClose: () => void;
  form: SwapFormData;
  quote: SwapQuote;
}

export function SwapReviewSheet({
  visible,
  onClose,
  form,
  quote,
}: SwapReviewSheetProps) {
  const navigation = useNavigation();
  const { publicKey } = useWallet();
  const { addTransaction } = useTransactionStore();
  const { biometricsEnabled, requireBiometricsForSwap } = useSecurityStore();
  const [loading, setLoading] = useState(false);

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1000000000).toFixed(6); // Assume 9 decimals
  };

  const handleConfirm = async () => {
    if (!publicKey) {
      Alert.alert('Error', 'No wallet connected');
      return;
    }

    // Check biometrics if required
    if (biometricsEnabled && requireBiometricsForSwap) {
      const biometricSuccess = await biometricsService.requireBiometricAuth(
        'Confirm swap transaction'
      );
      if (!biometricSuccess) {
        Alert.alert('Authentication Failed', 'Biometric authentication is required to proceed.');
        return;
      }
    }

    setLoading(true);

    try {
      // Build swap transaction
      const tx = await swapService.buildSwapTransaction(quote, publicKey);

      // Send transaction
      const txHash = await swapService.sendSwapTx(tx);

      // Log transaction
      addTransaction({
        signature: txHash,
        type: 'swap',
        amount: parseFloat(form.inputAmount),
        to: `${form.inputToken} → ${form.outputToken}`,
      });

      Alert.alert('Success', `Swap completed successfully!\n\nSignature: ${txHash.slice(0, 8)}...`);
      onClose();
      navigation.goBack();
    } catch (error) {
      console.error('Swap failed:', error);
      const err = error as Error;
      Alert.alert('Error', err.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-background rounded-t-lg p-6">
          <Text className="text-text text-xl font-bold mb-4">Review Swap</Text>

          {/* Swap Details */}
          <View className="mb-3">
            <Text className="text-textSecondary text-sm">From</Text>
            <Text className="text-text">
              {form.inputAmount} {form.inputToken}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">To</Text>
            <Text className="text-text">
              {formatAmount(quote.amountOut)} {form.outputToken}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Minimum Received</Text>
            <Text className="text-text">
              {formatAmount(quote.minAmountOut)} {form.outputToken}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Price Impact</Text>
            <Text className="text-text">
              {(quote.priceImpactBps / 100).toFixed(2)}%
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Fee</Text>
            <Text className="text-text">
              {formatAmount(quote.estimatedFeesLamports)} GOR
            </Text>
          </View>

          {/* Route Info */}
          <View className="mb-6">
            <Text className="text-textSecondary text-sm">Route</Text>
            <Text className="text-text">
              {quote.routeDescription || `via ${quote.providerId}`}
            </Text>
          </View>

          {/* Buttons */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Button title="Cancel" onPress={onClose} variant="secondary" />
            </View>
            <View className="flex-1">
              <Button
                title={loading ? "Swapping..." : "Confirm Swap"}
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}