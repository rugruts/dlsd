import React from 'react';
import { View, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Avatar } from '../components/ui/Avatar';
import { NftItem } from '../services/blockchain/models';

type NftDetailRouteProp = RouteProp<{ NftDetail: { nft: NftItem } }, 'NftDetail'>;

export default function NftDetailScreen() {
  const route = useRoute<NftDetailRouteProp>();
  const { nft } = route.params;

  return (
    <ScreenContainer>
      <Text className="text-text text-2xl font-bold mb-6">NFT Details</Text>
      <View className="items-center mb-6">
        <Avatar size={200} uri={nft.image} fallback={nft.name?.[0] || 'N'} />
      </View>
      <View className="bg-surface p-4 rounded-lg">
        <Text className="text-text text-lg font-medium mb-2">
          {nft.name || `NFT ${nft.mint.slice(0, 8)}`}
        </Text>
        <Text className="text-textSecondary mb-2">Mint: {nft.mint}</Text>
        {nft.image && <Text className="text-textSecondary">Image: {nft.image}</Text>}
      </View>
    </ScreenContainer>
  );
}