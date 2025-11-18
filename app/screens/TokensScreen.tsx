import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../hooks/useWallet';
import { useTokens } from '../hooks/useTokens';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { ListItem } from '../components/ui/ListItem';
import { Avatar } from '../components/ui/Avatar';
import { TokenHolding } from '../services/blockchain/models';

export default function TokensScreen() {
  const navigation = useNavigation();
  const { publicKey } = useWallet();
  const { tokens, loading, error, refresh } = useTokens(publicKey);

  const formatAmount = (amount: bigint, decimals: number) => {
    return (Number(amount) / Math.pow(10, decimals)).toFixed(4);
  };

  const renderToken = ({ item }: { item: TokenHolding }) => (
    <ListItem
      title={item.symbol || `Token ${item.mint.slice(0, 8)}`}
      subtitle={`${formatAmount(item.amount, item.decimals)} ${item.symbol || 'tokens'}`}
      rightText={item.usdValue !== undefined ? `$${item.usdValue.toFixed(2)}` : '$0.00'}
      icon={<Avatar size={32} fallback={item.symbol?.[0] || 'T'} />}
      onPress={() => navigation.navigate('TokenDetail' as never, { token: item })}
    />
  );

  if (error) {
    return (
      <ScreenContainer>
        <View className="items-center justify-center flex-1">
          <Text className="text-error text-center">{error}</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer refreshing={loading} onRefresh={refresh}>
      <Text className="text-text text-2xl font-bold mb-6">Tokens</Text>
      <FlatList
        data={tokens}
        renderItem={renderToken}
        keyExtractor={(item) => item.mint}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-textSecondary">No tokens found</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}