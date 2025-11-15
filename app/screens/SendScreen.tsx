import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '../hooks/useWallet';
import { useTokens } from '../hooks/useTokens';
import { useQRScanner } from '../hooks/useQRScanner';
import { aliasService } from '../services/aliasService';
import { transactionService } from '../services/transactions/transactionService';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Button } from '../components/Button';
import { SendFormData } from '../../packages/shared-types';

export default function SendScreen() {
  const navigation = useNavigation();
  const { publicKey } = useWallet();
  const { tokens } = useTokens(publicKey);
  const { scanning, startScan } = useQRScanner();

  const [form, setForm] = useState<SendFormData>({
    recipient: '',
    amount: '',
    token: 'GOR', // Default to native
  });

  const [feeEstimate, setFeeEstimate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  // Available tokens: GOR + user's tokens
  const availableTokens = [
    { symbol: 'GOR', mint: null },
    ...tokens.map(t => ({ symbol: t.symbol || 'Unknown', mint: t.mint })),
  ];

  const validateRecipient = async (recipient: string): Promise<PublicKey | null> => {
    try {
      if (recipient.startsWith('@')) {
        // Resolve alias
        const address = await aliasService.fetchAddressByAlias(recipient);
        if (!address) return null;
        return new PublicKey(address);
      } else {
        // Validate as address
        return new PublicKey(recipient);
      }
    } catch {
      return null;
    }
  };

  const estimateFee = async () => {
    if (!form.amount || !publicKey) return;

    try {
      const recipientPubkey = await validateRecipient(form.recipient);
      if (!recipientPubkey) return;

      const amount = BigInt(Math.floor(parseFloat(form.amount) * LAMPORTS_PER_SOL));
      const mint = form.token !== 'GOR' ? new PublicKey(form.token) : undefined;

      const tx = await transactionService.buildTransferTx({
        from: publicKey,
        to: recipientPubkey,
        amount,
        mint,
      });

      const summary = await transactionService.simulateTransaction(tx);
      setFeeEstimate(`${summary.feeEstimate.gor.toFixed(4)} GOR`);
    } catch (error) {
      console.error('Fee estimation failed:', error);
      setFeeEstimate('Unable to estimate');
    }
  };

  useEffect(() => {
    estimateFee();
  }, [form.amount, form.recipient, form.token]);

  const handleSubmit = async () => {
    if (!form.recipient || !form.amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setValidating(true);
    const recipientPubkey = await validateRecipient(form.recipient);
    setValidating(false);

    if (!recipientPubkey) {
      Alert.alert('Error', 'Invalid recipient address or alias');
      return;
    }

    // Navigate to review sheet with form data
    navigation.navigate('TransactionReview' as never, { form, recipientPubkey });
  };

  const handleQRScan = async () => {
    try {
      const scannedData = await startScan();
      setForm({ ...form, recipient: scannedData });
    } catch (error) {
      Alert.alert('Error', 'Failed to scan QR code');
    }
  };

  return (
    <ScreenContainer>
      <Text className="text-text text-2xl font-bold mb-6">Send</Text>

      {/* Token Selector */}
      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Token</Text>
        <View className="flex-row flex-wrap">
          {availableTokens.map((token) => (
            <TouchableOpacity
              key={token.mint || 'GOR'}
              onPress={() => setForm({ ...form, token: token.mint || 'GOR' })}
              className={`mr-2 mb-2 px-3 py-2 rounded-lg ${
                form.token === (token.mint || 'GOR')
                  ? 'bg-primary'
                  : 'bg-surface'
              }`}
            >
              <Text className={`${
                form.token === (token.mint || 'GOR')
                  ? 'text-white'
                  : 'text-text'
              }`}>
                {token.symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recipient Input */}
      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Recipient (Address or @alias)</Text>
        <View className="flex-row">
          <TextInput
            className="flex-1 bg-surface p-3 rounded-lg text-text mr-2"
            placeholder="Enter address or @username"
            value={form.recipient}
            onChangeText={(text) => setForm({ ...form, recipient: text })}
          />
          <TouchableOpacity
            onPress={handleQRScan}
            disabled={scanning}
            className="bg-primary p-3 rounded-lg justify-center"
          >
            <Text className="text-white">{scanning ? '...' : '📷'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Amount</Text>
        <TextInput
          className="bg-surface p-3 rounded-lg text-text"
          placeholder="0.00"
          keyboardType="numeric"
          value={form.amount}
          onChangeText={(text) => setForm({ ...form, amount: text })}
        />
      </View>

      {/* Fee Estimate */}
      {feeEstimate && (
        <View className="mb-4">
          <Text className="text-textSecondary">Estimated Fee: {feeEstimate}</Text>
        </View>
      )}

      {/* Submit Button */}
      <Button
        title={validating ? "Validating..." : "Review Transaction"}
        onPress={handleSubmit}
        disabled={loading || validating}
      />
    </ScreenContainer>
  );
}