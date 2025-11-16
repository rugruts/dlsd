import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useWalletStore } from '../../state/walletStore';
import { useSwapStore } from '../../state/swapStore';
import { Button } from '../../components/Button';
import { TokenItem } from '../../types/wallet';
import { parseSwapAmount, calculateMaxSwapAmount, formatPriceImpact, formatSwapFee } from '../../utils/swapAmounts';

const GOR_TOKEN: TokenItem = {
  mint: 'GOR111111111111111111111111111111111111111',
  symbol: 'GOR',
  name: 'Gorbagana',
  balance: 0,
  decimals: 9,
  address: 'GOR111111111111111111111111111111111111111',
};

export default function SwapScreen() {
  const navigation = useAppNavigation();
  const { tokens } = useWalletStore();
  const { fetchQuote, quote, loading, error, reset } = useSwapStore();

  const [inputToken, setInputToken] = useState<TokenItem>(GOR_TOKEN);
  const [outputToken, setOutputToken] = useState<TokenItem | null>(null);
  const [amount, setAmount] = useState('');

  const availableTokens = [GOR_TOKEN, ...tokens.filter(t => t.mint !== GOR_TOKEN.mint)];

  const handleGetQuote = async () => {
    if (!inputToken || !outputToken || !amount.trim()) {
      Alert.alert('Missing Information', 'Please select tokens and enter an amount.');
      return;
    }

    if (inputToken.mint === outputToken.mint) {
      Alert.alert('Invalid Swap', 'Cannot swap the same token.');
      return;
    }

    try {
      const parsedAmount = parseSwapAmount(amount, inputToken);
      if (parsedAmount > inputToken.balance) {
        Alert.alert('Insufficient Balance', 'Amount exceeds available balance.');
        return;
      }

      await fetchQuote(inputToken.mint, outputToken.mint, amount);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to get quote');
    }
  };

  const handleReviewSwap = () => {
    if (quote) {
      navigation.navigate('SwapReview', { quote });
    }
  };

  const handleMaxAmount = () => {
    const maxAmount = calculateMaxSwapAmount(inputToken.balance, inputToken.decimals);
    setAmount((maxAmount / Math.pow(10, inputToken.decimals)).toString());
  };

  const renderTokenSelector = (
    token: TokenItem | null,
    onSelect: (token: TokenItem) => void,
    placeholder: string
  ) => (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 bg-surface rounded-lg"
      onPress={() => {
        // TODO: Open token select modal
        Alert.alert('Token Selection', 'Token selector modal not implemented yet');
      }}
    >
      {token ? (
        <View className="flex-row items-center">
          {token.icon && <Image source={token.icon} className="w-6 h-6 mr-3" />}
          <View>
            <Text className="text-text font-semibold">{token.symbol}</Text>
            <Text className="text-textSecondary text-sm">{token.name}</Text>
          </View>
        </View>
      ) : (
        <Text className="text-textSecondary">{placeholder}</Text>
      )}
      <Text className="text-primary">▼</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Swap</Text>
          <TouchableOpacity onPress={reset}>
            <Text className="text-primary">Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Input Token */}
        <View className="mb-4">
          <Text className="text-textSecondary text-sm mb-2">From</Text>
          {renderTokenSelector(inputToken, setInputToken, 'Select input token')}
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-textSecondary text-sm">Amount</Text>
            {inputToken && (
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
          {inputToken && (
            <Text className="text-textSecondary text-xs mt-1">
              Balance: {inputToken.balance.toFixed(4)} {inputToken.symbol}
            </Text>
          )}
        </View>

        {/* Output Token */}
        <View className="mb-6">
          <Text className="text-textSecondary text-sm mb-2">To</Text>
          {renderTokenSelector(outputToken, setOutputToken, 'Select output token')}
        </View>

        {/* Get Quote Button */}
        <Button
          title={loading ? 'Getting Quote...' : 'Get Quote'}
          onPress={handleGetQuote}
          disabled={!inputToken || !outputToken || !amount.trim() || loading}
          className="w-full mb-6"
        />

        {/* Quote Display */}
        {quote && (
          <View className="bg-surface rounded-xl p-6 mb-6">
            <Text className="text-textSecondary text-sm mb-3">Swap Preview</Text>

            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-textSecondary">Expected Output</Text>
              <Text className="text-text font-semibold">
                {quote.outAmount} {outputToken?.symbol}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mb-2">
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
        )}

        {/* Error Display */}
        {error && (
          <View className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
            <Text className="text-red-800 text-sm">{error}</Text>
          </View>
        )}

        {/* Review Swap Button */}
        {quote && (
          <Button
            title="Review Swap"
            onPress={handleReviewSwap}
            className="w-full"
          />
        )}
      </View>
    </SafeAreaView>
  );
}