import React from 'react';
import { View, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { TokenHolding } from '../services/blockchain/models';

type TokenDetailRouteProp = RouteProp<{ TokenDetail: { token: TokenHolding } }, 'TokenDetail'>;

export default function TokenDetailScreen() {
  const route = useRoute<TokenDetailRouteProp>();
  const { token } = route.params;

  return (
    <ScreenContainer>
      <Text className="text-text text-2xl font-bold mb-6">Token Details</Text>
      <View className="bg-surface p-4 rounded-lg">
        <Text className="text-text text-lg font-medium mb-2">
          {token.symbol || `Token ${token.mint.slice(0, 8)}`}
        </Text>
        <Text className="text-textSecondary mb-2">Mint: {token.mint}</Text>
        <Text className="text-textSecondary mb-2">
          Balance: {(Number(token.amount) / Math.pow(10, token.decimals)).toFixed(4)}
        </Text>
        <Text className="text-textSecondary">Decimals: {token.decimals}</Text>
      </View>
    </ScreenContainer>
  );
}