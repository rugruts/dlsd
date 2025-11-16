import React from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native';
import { useAppRoute } from '../../navigation/hooks';
import { Button } from '../../components/Button';

export default function TokenDetailsScreen() {
  const { params } = useAppRoute<'TokenDetails'>();
  const { token } = params;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="items-center mb-8">
          {token.icon && (
            <Image source={token.icon} className="w-16 h-16 mb-4" />
          )}
          <Text className="text-text text-2xl font-bold">{token.name}</Text>
          <Text className="text-textSecondary text-lg">{token.symbol}</Text>
        </View>

        {/* Balance */}
        <View className="bg-surface rounded-xl p-6 mb-6">
          <Text className="text-textSecondary text-sm mb-2">Balance</Text>
          <Text className="text-text text-3xl font-bold">
            {token.balance.toFixed(token.decimals)}
          </Text>
          {token.usdValue && (
            <Text className="text-textSecondary text-lg mt-1">
              ${token.usdValue.toFixed(2)} USD
            </Text>
          )}
        </View>

        {/* Address */}
        <View className="mb-8">
          <Text className="text-textSecondary text-sm mb-2">Contract Address</Text>
          <Text className="text-text font-mono text-sm bg-surface p-3 rounded">
            {token.address}
          </Text>
        </View>

        {/* Actions */}
        <View className="space-y-4">
          <Button
            title="Send"
            onPress={() => {/* TODO: Navigate to send screen */}}
            className="w-full"
          />
          <Button
            title="Swap"
            onPress={() => {/* TODO: Navigate to swap screen */}}
            variant="secondary"
            className="w-full"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}