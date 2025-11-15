import React, { useState } from 'react';
import { View, Text, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { swapService } from '../services/swaps/swapService';
import { useTransactionStore } from '../state/transactionStore';
import { useSecurityStore } from '../state/securityStore';
import { biometricsService } from '../services/security/biometricsService';
import { Button } from './Button';
import { SwapFormData, SwapQuote } from '../../packages/shared-types';

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
  const { addTransaction, updateTransactionStatus } = useTransactionStore();
  const { biometricsEnabled, requireBiometricsForSwap } = useSecurityStore();
  const [loading, setLoading] = useState(false);

  const fromAddress = 'Your Address'; // TODO: Get from wallet

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1000000000).toFixed(6); // Assume 9 decimals
  };

  const handleConfirm = async () => {
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
      // Add to store
      const txId = addTransaction({
        from: fromAddress,
        to: 'Swap Aggregator', // Placeholder
        amount: form.inputAmount,
        token: `${form.inputToken} → ${form.outputToken}`,
      });

      // Build swap transaction
      const walletPubkey = new PublicKey(fromAddress); // TODO: Get real public key
      const tx = await swapService.buildSwapTransaction(quote, walletPubkey);

      // Send transaction
      const txHash = await swapService.sendSwapTx(tx);

      // Update status
      updateTransactionStatus(txId, 'success', txHash);

      Alert.alert('Success', 'Swap completed successfully!');
      onClose();
      navigation.goBack();
    } catch (error) {
      console.error('Swap failed:', error);
      updateTransactionStatus('last', 'failed');
      Alert.alert('Error', 'Swap failed');
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
              {formatAmount(quote.outputAmount)} {form.outputToken}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Minimum Received</Text>
            <Text className="text-text">
              {formatAmount(quote.minOutputAmount)} {form.outputToken}
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Price Impact</Text>
            <Text className="text-text">
              {(quote.priceImpact * 100).toFixed(2)}%
            </Text>
          </View>

          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Fee</Text>
            <Text className="text-text">
              {formatAmount(quote.fee)} GOR
            </Text>
          </View>

          {/* Route Info */}
          <View className="mb-6">
            <Text className="text-textSecondary text-sm">Route</Text>
            <Text className="text-text">
              {quote.route.length} hop{quote.route.length > 1 ? 's' : ''} via aggregator
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