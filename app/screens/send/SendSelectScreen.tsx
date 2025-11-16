import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert, FlatList, TouchableOpacity, Image } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { useWalletStore } from '../../state/walletStore';
import { Button } from '../../components/Button';
import { TokenItem } from '../../types/wallet';
import { isValidAddress, resolveAddressOrAlias } from '../../utils/address';
import { parseAmount, calculateMaxAmount } from '../../utils/amount';

export default function SendSelectScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'SendSelect'>();
  const { tokens } = useWalletStore();

  const [selectedToken, setSelectedToken] = useState<TokenItem | null>(params?.token || null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [validating, setValidating] = useState(false);

  const availableTokens = tokens.filter(t => t.balance > 0);

  const handleContinue = async () => {
    if (!selectedToken) {
      Alert.alert('Select Asset', 'Please select a token to send.');
      return;
    }

    if (!recipient.trim()) {
      Alert.alert('Recipient Required', 'Please enter a recipient address or alias.');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Amount Required', 'Please enter an amount to send.');
      return;
    }

    setValidating(true);
    try {
      // Validate recipient
      await resolveAddressOrAlias(recipient.trim());

      // Parse and validate amount
      const parsedAmount = parseAmount(amount, selectedToken.decimals);
      const maxAmount = calculateMaxAmount(selectedToken.balance, selectedToken.decimals);

      if (parsedAmount > maxAmount) {
        Alert.alert('Insufficient Balance', `Maximum sendable amount is ${maxAmount.toFixed(selectedToken.decimals)}`);
        return;
      }

      // Navigate to review
      navigation.navigate('SendReview', {
        token: selectedToken,
        recipient: recipient.trim(),
        amount: amount.trim(),
      });

    } catch (error) {
      Alert.alert('Validation Error', error instanceof Error ? error.message : 'Invalid input');
    } finally {
      setValidating(false);
    }
  };

  const handleMaxAmount = () => {
    if (selectedToken) {
      const maxAmount = calculateMaxAmount(selectedToken.balance, selectedToken.decimals);
      setAmount(maxAmount.toString());
    }
  };

  const renderTokenItem = ({ item }: { item: TokenItem }) => (
    <TouchableOpacity
      className={`flex-row items-center p-4 rounded-lg mb-2 ${
        selectedToken?.mint === item.mint ? 'bg-primary/20 border border-primary' : 'bg-surface'
      }`}
      onPress={() => setSelectedToken(item)}
    >
      {item.icon && <Image source={item.icon} className="w-8 h-8 mr-3" />}
      <View className="flex-1">
        <Text className="text-text font-semibold">{item.symbol}</Text>
        <Text className="text-textSecondary text-sm">{item.name}</Text>
      </View>
      <Text className="text-text">{item.balance.toFixed(4)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6">
        <View className="py-4">
          <Text className="text-text text-2xl font-bold">Send</Text>
        </View>

        {/* Token Selection */}
        <View className="mb-6">
          <Text className="text-textSecondary text-sm mb-3">Select Asset</Text>
          <FlatList
            data={availableTokens}
            renderItem={renderTokenItem}
            keyExtractor={(item) => item.mint}
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 200 }}
          />
        </View>

        {/* Recipient */}
        <View className="mb-6">
          <Text className="text-textSecondary text-sm mb-2">Recipient</Text>
          <TextInput
            className="bg-surface border border-gray-300 rounded-lg p-4 text-text"
            placeholder="Address or @alias"
            value={recipient}
            onChangeText={setRecipient}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Amount */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-textSecondary text-sm">Amount</Text>
            {selectedToken && (
              <TouchableOpacity onPress={handleMaxAmount}>
                <Text className="text-primary font-semibold">MAX</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            className="bg-surface border border-gray-300 rounded-lg p-4 text-text"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          {selectedToken && (
            <Text className="text-textSecondary text-xs mt-1">
              Balance: {selectedToken.balance.toFixed(4)} {selectedToken.symbol}
            </Text>
          )}
        </View>

        {/* Continue Button */}
        <Button
          title={validating ? 'Validating...' : 'Continue'}
          onPress={handleContinue}
          disabled={!selectedToken || !recipient.trim() || !amount.trim() || validating}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}