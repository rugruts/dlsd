import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../hooks/useWallet';
import { useTokens } from '../hooks/useTokens';
import { useSwapQuote } from '../hooks/useSwapQuote';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Button } from '../components/Button';
import { SwapFormData } from '../../packages/shared-types';

export default function SwapScreen() {
  const navigation = useNavigation();
  const { publicKey } = useWallet();
  const { tokens } = useTokens(publicKey);

  const [form, setForm] = useState<SwapFormData>({
    inputToken: 'GOR',
    outputToken: '',
    inputAmount: '',
  });

  const [slippage, setSlippage] = useState(0.5); // 0.5%

  // Available tokens: GOR + user's tokens
  const availableTokens = [
    { symbol: 'GOR', mint: null },
    ...tokens.map(t => ({ symbol: t.symbol || 'Unknown', mint: t.mint })),
  ];

  const inputMint = form.inputToken === 'GOR' ? null : new PublicKey(form.inputToken);
  const outputMint = form.outputToken === 'GOR' ? null : form.outputToken ? new PublicKey(form.outputToken) : null;
  const amount = form.inputAmount ? BigInt(Math.floor(parseFloat(form.inputAmount) * 1000000000)) : null; // Assume 9 decimals

  const { quote, loading: quoteLoading, error: quoteError } = useSwapQuote(
    inputMint,
    outputMint,
    amount,
    Math.floor(slippage * 100) // Convert to bps
  );

  const handleSwapTokens = () => {
    setForm({
      ...form,
      inputToken: form.outputToken,
      outputToken: form.inputToken,
      inputAmount: '',
    });
  };

  const handleSubmit = () => {
    if (!form.inputAmount || !form.outputToken || !quote) {
      Alert.alert('Error', 'Please fill all fields and ensure quote is available');
      return;
    }

    navigation.navigate('SwapReview' as never, { form, quote });
  };

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1000000000).toFixed(6);
  };

  return (
    <ScreenContainer>
      <Text className="text-text text-2xl font-bold mb-6">Swap</Text>

      {/* Input Token Selector */}
      <View className="mb-4">
        <Text className="text-textSecondary mb-2">From</Text>
        <View className="flex-row items-center bg-surface p-3 rounded-lg">
          <View className="flex-1">
            <Text className="text-textSecondary text-sm">Token</Text>
            <View className="flex-row flex-wrap mt-1">
              {availableTokens.map((token) => (
                <TouchableOpacity
                  key={token.mint || 'GOR'}
                  onPress={() => setForm({ ...form, inputToken: token.mint || 'GOR' })}
                  className={`mr-2 mb-1 px-2 py-1 rounded ${
                    form.inputToken === (token.mint || 'GOR')
                      ? 'bg-primary'
                      : 'bg-surface'
                  }`}
                >
                  <Text className={`text-xs ${
                    form.inputToken === (token.mint || 'GOR')
                      ? 'text-white'
                      : 'text-text'
                  }`}>
                    {token.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TextInput
            className="flex-1 bg-transparent text-text text-right"
            placeholder="0.00"
            keyboardType="numeric"
            value={form.inputAmount}
            onChangeText={(text) => setForm({ ...form, inputAmount: text })}
          />
        </View>
      </View>

      {/* Swap Button */}
      <View className="items-center mb-4">
        <TouchableOpacity
          onPress={handleSwapTokens}
          className="bg-primary w-10 h-10 rounded-full items-center justify-center"
        >
          <Text className="text-white text-lg">⇅</Text>
        </TouchableOpacity>
      </View>

      {/* Output Token Selector */}
      <View className="mb-4">
        <Text className="text-textSecondary mb-2">To</Text>
        <View className="flex-row items-center bg-surface p-3 rounded-lg">
          <View className="flex-1">
            <Text className="text-textSecondary text-sm">Token</Text>
            <View className="flex-row flex-wrap mt-1">
              {availableTokens
                .filter(token => (token.mint || 'GOR') !== form.inputToken)
                .map((token) => (
                <TouchableOpacity
                  key={token.mint || 'GOR'}
                  onPress={() => setForm({ ...form, outputToken: token.mint || 'GOR' })}
                  className={`mr-2 mb-1 px-2 py-1 rounded ${
                    form.outputToken === (token.mint || 'GOR')
                      ? 'bg-primary'
                      : 'bg-surface'
                  }`}
                >
                  <Text className={`text-xs ${
                    form.outputToken === (token.mint || 'GOR')
                      ? 'text-white'
                      : 'text-text'
                  }`}>
                    {token.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1 items-end">
            {quote && (
              <Text className="text-text text-right">
                {formatAmount(quote.outputAmount)}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Slippage */}
      <View className="mb-4">
        <Text className="text-textSecondary mb-2">Slippage Tolerance</Text>
        <View className="flex-row">
          {[0.1, 0.5, 1.0].map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSlippage(value)}
              className={`mr-2 px-3 py-1 rounded ${
                slippage === value ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <Text className={`${
                slippage === value ? 'text-white' : 'text-text'
              }`}>
                {value}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quote Preview */}
      {quote && (
        <View className="mb-4 bg-surface p-3 rounded-lg">
          <Text className="text-textSecondary text-sm mb-1">Quote Preview</Text>
          <Text className="text-text">Min. Received: {formatAmount(quote.minOutputAmount)}</Text>
          <Text className="text-text">Price Impact: {(quote.priceImpact * 100).toFixed(2)}%</Text>
          <Text className="text-text">Fee: {formatAmount(quote.fee)}</Text>
        </View>
      )}

      {quoteError && (
        <Text className="text-error text-center mb-4">{quoteError}</Text>
      )}

      <Button
        title={quoteLoading ? "Getting Quote..." : "Review Swap"}
        onPress={handleSubmit}
        disabled={quoteLoading || !quote}
      />
    </ScreenContainer>
  );
}