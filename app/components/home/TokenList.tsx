/**
 * TokenList Component - Phantom-grade token list (Mobile)
 * Platform-specific implementation using shared logic
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTokenList, TokenListProps, TokenItemData } from '@dumpsack/shared-ui';

function TokenListItem({ item }: { item: TokenItemData }) {
  return (
    <TouchableOpacity
      onPress={item.onPress}
      className="flex-row items-center px-4 py-3 border-b border-border/50"
    >
      {/* Token Icon */}
      <View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-3">
        {item.icon ? (
          <Image source={{ uri: item.icon }} className="w-10 h-10 rounded-full" />
        ) : (
          <Text className="text-textSecondary text-xs font-bold">
            {item.iconFallback}
          </Text>
        )}
      </View>

      {/* Token Info */}
      <View className="flex-1">
        <Text className="text-text font-semibold text-base">{item.symbol}</Text>
        <Text className="text-textSecondary text-xs">{item.name}</Text>
      </View>

      {/* Balance + USD */}
      <View className="items-end">
        <Text className="text-text font-semibold text-base">
          {item.balance}
        </Text>
        <View className="flex-row items-center gap-1">
          {item.usdValue && (
            <Text className="text-textSecondary text-xs">
              {item.usdValue}
            </Text>
          )}
          {item.change && (
            <Text className={`text-${item.change.color} text-xs font-semibold`}>
              {item.change.text}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SkeletonItem() {
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-border/50">
      <View className="w-10 h-10 bg-surface rounded-full mr-3 animate-pulse" />
      <View className="flex-1">
        <View className="h-4 w-16 bg-surface rounded mb-1 animate-pulse" />
        <View className="h-3 w-24 bg-surface rounded animate-pulse" />
      </View>
      <View className="items-end">
        <View className="h-4 w-20 bg-surface rounded mb-1 animate-pulse" />
        <View className="h-3 w-16 bg-surface rounded animate-pulse" />
      </View>
    </View>
  );
}

export function TokenList(props: TokenListProps) {
  const data = useTokenList(props);

  if (data.loading && data.isEmpty) {
    return (
      <View className="flex-1 bg-background">
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </View>
    );
  }

  if (data.isEmpty) {
    return (
      <View className="flex-1 items-center justify-center py-12 bg-background">
        <Text className="text-textSecondary text-base">No tokens found</Text>
        <Text className="text-textSecondary text-sm mt-1">
          Your tokens will appear here
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data.tokens}
      renderItem={({ item }) => <TokenListItem item={item} />}
      keyExtractor={(item) => item.mint}
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    />
  );
}

// Re-export props type
export type { TokenListProps };

