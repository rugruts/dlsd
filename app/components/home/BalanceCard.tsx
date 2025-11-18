/**
 * BalanceCard Component - Phantom-grade balance display
 * Shows: Big GOR balance, USD value, % change
 * Height: 140px fixed
 */

import React from 'react';
import { View, Text } from 'react-native';

interface BalanceCardProps {
  balanceGOR: string;
  balanceUSD: string;
  change24h?: number;
  loading?: boolean;
}

export function BalanceCard({
  balanceGOR,
  balanceUSD,
  change24h,
  loading = false,
}: BalanceCardProps) {
  const changeColor = change24h && change24h >= 0 ? 'text-success' : 'text-error';
  const changeSign = change24h && change24h >= 0 ? '+' : '';

  return (
    <View className="h-[140px] px-6 py-6 justify-center items-center bg-background">
      {loading ? (
        <View className="items-center">
          <View className="h-12 w-32 bg-surface rounded animate-pulse mb-2" />
          <View className="h-6 w-24 bg-surface rounded animate-pulse" />
        </View>
      ) : (
        <>
          {/* Main Balance */}
          <Text className="text-text text-5xl font-bold mb-1">
            {balanceGOR}
          </Text>
          <Text className="text-textSecondary text-xs font-medium mb-1">GOR</Text>

          {/* USD Value + Change */}
          <View className="flex-row items-center gap-2">
            <Text className="text-textSecondary text-lg font-medium">
              {balanceUSD}
            </Text>
            {change24h !== undefined && (
              <Text className={`${changeColor} text-sm font-semibold`}>
                {changeSign}{change24h.toFixed(2)}%
              </Text>
            )}
          </View>
        </>
      )}
    </View>
  );
}

