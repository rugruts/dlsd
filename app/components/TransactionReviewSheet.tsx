import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { PublicKey } from '@solana/web3.js';
import { useNavigation } from '@react-navigation/native';

import { SendFormData, TransactionSimulation } from '@dumpsack/shared-types';

import { biometricsService } from '../services/security/biometricsService';
import { transactionService } from '../services/transactions/transactionService';
import { useSecurityStore } from '../state/securityStore';
import { useTransactionStore } from '../state/transactionStore';
import { useWallet } from '../hooks/useWallet';
import { Button } from './Button';

interface TransactionReviewSheetProps {
  visible: boolean;
  onClose: () => void;
  form: SendFormData;
  recipientPubkey: PublicKey;
}

export function TransactionReviewSheet({
  visible,
  onClose,
  form,
  recipientPubkey,
}: TransactionReviewSheetProps) {
  const navigation = useNavigation();
  const { publicKey, activeWallet } = useWallet();
  const { addTransaction, updateTransactionStatus } = useTransactionStore();
  const { biometricsEnabled, requireBiometricsForSend } = useSecurityStore();
  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<TransactionSimulation | null>(null);
  const [feeEstimate, setFeeEstimate] = useState<string>('0.0001 GOR');

  const fromAddress = activeWallet?.publicKey || '';

  // Calculate fee estimate on mount
  useEffect(() => {
    const estimateFee = async () => {
      if (!publicKey) return;

      try {
        // Estimate fee based on transaction type
        const baseFee = 0.000005; // 5000 lamports base fee
        const priorityFee = 0.000001; // 1000 lamports priority fee
        const totalFee = baseFee + priorityFee;
        setFeeEstimate(`${totalFee.toFixed(6)} GOR`);
      } catch (error) {
        console.error('Failed to estimate fee:', error);
        setFeeEstimate('~0.0001 GOR');
      }
    };

    estimateFee();
  }, [publicKey, form]);

  const handleConfirm = async () => {
    if (!publicKey) {
      Alert.alert('Error', 'No wallet connected');
      return;
    }

    // Check biometrics if required
    if (biometricsEnabled && requireBiometricsForSend) {
      const biometricSuccess = await biometricsService.requireBiometricAuth(
        'Confirm transaction'
      );
      if (!biometricSuccess) {
        Alert.alert('Authentication Failed', 'Biometric authentication is required to proceed.');
        return;
      }
    }

    setLoading(true);
    let txId: string | undefined;

    try {
      // Add to store
      txId = addTransaction({
        from: fromAddress,
        to: recipientPubkey.toBase58(),
        amount: form.amount,
        token: form.token,
      });

      // Build transaction
      const amount = BigInt(Math.floor(parseFloat(form.amount) * 1000000000)); // Assume 9 decimals for GOR
      const mint = form.token !== 'GOR' ? new PublicKey(form.token) : undefined;

      const tx = await transactionService.buildTransferTx({
        from: publicKey,
        to: recipientPubkey,
        amount,
        mint,
      });

      // Send transaction
      const txHash = await transactionService.sendTransaction(tx);

      // Update status
      updateTransactionStatus(txId, 'success', txHash);

      Alert.alert('Success', `Transaction sent successfully!\n\nSignature: ${txHash.slice(0, 8)}...`);
      onClose();
      navigation.goBack();
    } catch (error) {
      console.error('Transaction failed:', error);
      const err = error as Error;

      // Update transaction status if we created one
      if (txId) {
        updateTransactionStatus(txId, 'failed');
      }

      Alert.alert('Error', err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-background rounded-t-lg p-6">
          <Text className="text-text text-xl font-bold mb-4">Review Transaction</Text>

          {/* From */}
          <View className="mb-3">
            <Text className="text-textSecondary text-sm">From</Text>
            <Text className="text-text">{fromAddress}</Text>
          </View>

          {/* To */}
          <View className="mb-3">
            <Text className="text-textSecondary text-sm">To</Text>
            <Text className="text-text">{recipientPubkey.toBase58()}</Text>
          </View>

          {/* Amount & Token */}
          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Amount</Text>
            <Text className="text-text">{form.amount} {form.token}</Text>
          </View>

          {/* Fee */}
          <View className="mb-3">
            <Text className="text-textSecondary text-sm">Estimated Fee</Text>
            <Text className="text-text">{feeEstimate}</Text>
          </View>

          {/* Explanation */}
          <View className="mb-6">
            <Text className="text-textSecondary text-sm">Transaction</Text>
            <Text className="text-text">
              Sending {form.amount} {form.token} to {form.recipient.startsWith('@') ? form.recipient : 'address'}
            </Text>
          </View>

          {/* Simulation Results */}
          {simulation && (
            <View className="mb-6 bg-surface p-3 rounded-lg">
              <Text className="text-textSecondary text-sm mb-2">Transaction Analysis</Text>
              <View className="flex-row justify-between mb-1">
                <Text className="text-text">Risk Level:</Text>
                <Text className={`font-bold ${
                  simulation.riskLevel === 'high' ? 'text-error' :
                  simulation.riskLevel === 'medium' ? 'text-warning' : 'text-success'
                }`}>
                  {simulation.riskLevel.toUpperCase()}
                </Text>
              </View>
              {simulation.warnings.length > 0 && (
                <View className="mt-2">
                  <Text className="text-textSecondary text-sm mb-1">Warnings:</Text>
                  {simulation.warnings.map((warning, index) => (
                    <Text key={index} className="text-warning text-sm">• {warning}</Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Buttons */}
          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Button title="Cancel" onPress={onClose} variant="secondary" />
            </View>
            <View className="flex-1">
              <Button
                title={loading ? "Sending..." : "Confirm"}
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}