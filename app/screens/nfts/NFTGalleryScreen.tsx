import React from 'react';
import { View, Text, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useWalletStore } from '../../state/walletStore';
import { NftItem } from '../../types/wallet';

export default function NFTGalleryScreen() {
  const navigation = useAppNavigation();
  const { nfts } = useWalletStore();

  const renderNftItem = ({ item }: { item: NftItem }) => (
    <TouchableOpacity
      className="flex-1 m-2 bg-surface rounded-lg overflow-hidden"
      onPress={() => navigation.navigate('NFTDetail', { nft: item })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} className="w-full aspect-square" />
      ) : (
        <View className="w-full aspect-square bg-gray-300 items-center justify-center">
          <Text className="text-textSecondary">No Image</Text>
        </View>
      )}
      <View className="p-3">
        <Text className="text-text font-semibold" numberOfLines={1}>
          {item.name || 'Unnamed NFT'}
        </Text>
        {item.collection && (
          <Text className="text-textSecondary text-sm" numberOfLines={1}>
            {item.collection}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-6 py-4">
        <Text className="text-text text-2xl font-bold">My NFTs</Text>
        <Text className="text-textSecondary mt-1">
          {nfts.length} NFT{nfts.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {nfts.length > 0 ? (
        <FlatList
          data={nfts}
          renderItem={renderNftItem}
          keyExtractor={(item) => item.mint}
          numColumns={2}
          contentContainerStyle={{ padding: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-textSecondary text-lg text-center">
            No NFTs found
          </Text>
          <Text className="text-textSecondary text-center mt-2">
            Your NFTs will appear here once you acquire them
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}