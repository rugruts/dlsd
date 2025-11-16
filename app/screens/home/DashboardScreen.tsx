import React, { useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useAuthStore } from '../../state/authStore';
import { useWalletStore } from '../../state/walletStore';
import { Button } from '../../components/Button';
import { TokenItem, NftItem } from '../../types/wallet';

export default function DashboardScreen() {
  const navigation = useAppNavigation();
  const { alias, publicKey } = useAuthStore();
  const { balance, tokens, nfts, loading, error, refresh } = useWalletStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    // Initial load
    refresh();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const renderTokenItem = ({ item }: { item: TokenItem }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-surface rounded-lg mb-2"
      onPress={() => navigation.navigate('TokenDetails', { token: item })}
    >
      {item.icon && <Image source={item.icon} className="w-8 h-8 mr-3" />}
      <View className="flex-1">
        <Text className="text-text font-semibold">{item.symbol}</Text>
        <Text className="text-textSecondary text-sm">{item.name}</Text>
      </View>
      <View className="items-end">
        <Text className="text-text font-semibold">{item.balance.toFixed(4)}</Text>
        {item.usdValue && (
          <Text className="text-textSecondary text-sm">${item.usdValue.toFixed(2)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderNftItem = ({ item }: { item: NftItem }) => (
    <TouchableOpacity
      className="w-24 h-24 mr-3 rounded-lg overflow-hidden"
      onPress={() => navigation.navigate('NFTDetail', { nft: item })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} className="w-full h-full" />
      ) : (
        <View className="w-full h-full bg-surface items-center justify-center">
          <Text className="text-textSecondary text-xs">NFT</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const SkeletonLoader = ({ className }: { className: string }) => (
    <View className={`${className} bg-gray-300 animate-pulse rounded`} />
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text text-lg font-semibold">
                @{alias || 'Anonymous'}
              </Text>
              <Text className="text-textSecondary text-sm">
                {publicKey ? `${publicKey.slice(0, 8)}...${publicKey.slice(-8)}` : ''}
              </Text>
            </View>
            <Button
              title="Receive"
              onPress={() => navigation.navigate('Receive')}
              variant="secondary"
              className="px-4 py-2"
            />
          </View>
        </View>

        {/* Balance Card */}
        <View className="mx-6 mb-6">
          <View className="bg-surface rounded-xl p-6">
            {loading && !balance ? (
              <SkeletonLoader className="h-8 w-32 mb-2" />
            ) : (
              <>
                <Text className="text-textSecondary text-sm mb-1">Total Balance</Text>
                <Text className="text-text text-3xl font-bold">
                  {balance ? `${balance.toFixed(4)} GOR` : '--'}
                </Text>
                <Text className="text-textSecondary text-lg mt-1">
                  ${balance ? (balance * 0.01).toFixed(2) : '--'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View className="mx-6 mb-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <Text className="text-yellow-800 text-sm">{error}</Text>
            <TouchableOpacity onPress={refresh} className="mt-2">
              <Text className="text-yellow-600 font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Token List */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text text-xl font-semibold">Tokens</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TokensScreen')}>
              <Text className="text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          {loading && tokens.length === 0 ? (
            <View className="space-y-2">
              <SkeletonLoader className="h-16 w-full" />
              <SkeletonLoader className="h-16 w-full" />
              <SkeletonLoader className="h-16 w-full" />
            </View>
          ) : tokens.length > 0 ? (
            <FlatList
              data={tokens.slice(0, 5)} // Show first 5
              renderItem={renderTokenItem}
              keyExtractor={(item) => item.mint}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-surface rounded-lg p-8 items-center">
              <Text className="text-textSecondary">No tokens found</Text>
            </View>
          )}
        </View>

        {/* NFT Preview */}
        <View className="mx-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text text-xl font-semibold">NFTs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('NFTGallery')}>
              <Text className="text-primary">See All</Text>
            </TouchableOpacity>
          </View>

          {loading && nfts.length === 0 ? (
            <View className="flex-row space-x-3">
              <SkeletonLoader className="w-24 h-24" />
              <SkeletonLoader className="w-24 h-24" />
              <SkeletonLoader className="w-24 h-24" />
            </View>
          ) : nfts.length > 0 ? (
            <FlatList
              data={nfts.slice(0, 10)} // Show first 10
              renderItem={renderNftItem}
              keyExtractor={(item) => item.mint}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View className="bg-surface rounded-lg p-8 items-center">
              <Text className="text-textSecondary">No NFTs yet</Text>
              <Text className="text-textSecondary text-sm mt-1">
                Your NFTs will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}