import React from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useWallet } from '../hooks/useWallet';
import { useNFTs } from '../hooks/useNFTs';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { NftItem } from '../services/blockchain/models';

const { width } = Dimensions.get('window');
const itemWidth = (width - 48) / 2; // 2 columns with padding

export default function NFTsScreen() {
  const navigation = useNavigation();
  const { publicKey } = useWallet();
  const { nfts, loading, error, refresh } = useNFTs(publicKey);

  const renderNft = ({ item }: { item: NftItem }) => (
    <Card
      className="m-1"
      style={{ width: itemWidth }}
      onPress={() => navigation.navigate('NftDetail' as never, { nft: item })}
    >
      <View className="items-center p-2">
        <Avatar size={itemWidth - 16} uri={item.image} fallback={item.name?.[0] || 'N'} />
        <Text className="text-text text-sm font-medium mt-2 text-center" numberOfLines={1}>
          {item.name || `NFT ${item.mint.slice(0, 8)}`}
        </Text>
      </View>
    </Card>
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
      <Text className="text-text text-2xl font-bold mb-6">NFTs</Text>
      <FlatList
        data={nfts}
        renderItem={renderNft}
        keyExtractor={(item) => item.mint}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-textSecondary">No NFTs found</Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}