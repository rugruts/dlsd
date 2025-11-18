/**
 * BalanceCard Component - Phantom-grade balance display (Mobile)
 * Platform-specific implementation using shared logic
 * Height: 140px fixed
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useBalanceCard, BalanceCardProps } from '@dumpsack/shared-ui';

export function BalanceCard(props: BalanceCardProps) {
  const data = useBalanceCard(props);

  return (
    <View className="h-[140px] px-6 py-6 justify-center items-center bg-background">
      {data.loading ? (
        <View className="items-center">
          <View className="h-12 w-32 bg-surface rounded animate-pulse mb-2" />
          <View className="h-6 w-24 bg-surface rounded animate-pulse" />
        </View>
      ) : (
        <>
          {/* Main Balance */}
          <Text className="text-text text-5xl font-bold mb-1">
            {data.balance.amount}
          </Text>
          <Text className="text-textSecondary text-xs font-medium mb-1">
            {data.balance.currency}
          </Text>

          {/* USD Value + Change */}
          <View className="flex-row items-center gap-2">
            <Text className="text-textSecondary text-lg font-medium">
              {data.usd.amount}
            </Text>
            {data.change && (
              <Text className={`text-${data.change.color} text-sm font-semibold`}>
                {data.change.text}
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

// Re-export props type
export type { BalanceCardProps };

