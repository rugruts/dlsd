import React from 'react';
import { View, Text, SafeAreaView, Image, ScrollView } from 'react-native';
import { useAppRoute } from '../../navigation/hooks';
import { Button } from '../../components/Button';

export default function NFTDetailScreen() {
  const { params } = useAppRoute<'NFTDetail'>();
  const { nft } = params;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* NFT Image */}
        <View className="w-full aspect-square">
          {nft.image ? (
            <Image source={{ uri: nft.image }} className="w-full h-full" />
          ) : (
            <View className="w-full h-full bg-surface items-center justify-center">
              <Text className="text-textSecondary text-lg">No Image Available</Text>
            </View>
          )}
        </View>

        {/* NFT Details */}
        <View className="px-6 py-4">
          <Text className="text-text text-2xl font-bold mb-2">
            {nft.name || 'Unnamed NFT'}
          </Text>

          {nft.collection && (
            <Text className="text-textSecondary text-lg mb-4">
              {nft.collection}
            </Text>
          )}

          {nft.description && (
            <View className="mb-6">
              <Text className="text-textSecondary text-sm mb-2">Description</Text>
              <Text className="text-text">{nft.description}</Text>
            </View>
          )}

          {/* Attributes */}
          {nft.attributes && nft.attributes.length > 0 && (
            <View className="mb-6">
              <Text className="text-textSecondary text-sm mb-3">Attributes</Text>
              <View className="flex-row flex-wrap">
                {nft.attributes.map((attr, index) => (
                  <View key={index} className="bg-surface rounded-lg px-3 py-2 mr-2 mb-2">
                    <Text className="text-textSecondary text-xs">{attr.trait_type}</Text>
                    <Text className="text-text font-semibold">{attr.value}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Contract Address */}
          <View className="mb-8">
            <Text className="text-textSecondary text-sm mb-2">Contract Address</Text>
            <Text className="text-text font-mono text-sm bg-surface p-3 rounded">
              {nft.mint}
            </Text>
          </View>

          {/* Actions */}
          <Button
            title="Send NFT"
            onPress={() => {/* TODO: Navigate to send NFT screen */}}
            className="w-full"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}