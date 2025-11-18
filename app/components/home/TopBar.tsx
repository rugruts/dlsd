/**
 * TopBar Component - Phantom-grade compact header
 * Shows: Logo, Account switcher, Network, Settings
 * Height: 60px fixed
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { truncatePublicKey } from '@dumpsack/shared-types';

interface TopBarProps {
  walletName: string;
  walletAddress: string;
  network: string;
  onAccountPress: () => void;
  onSettingsPress: () => void;
}

export function TopBar({
  walletName,
  walletAddress,
  network,
  onAccountPress,
  onSettingsPress,
}: TopBarProps) {
  return (
    <View className="h-[60px] px-4 flex-row items-center justify-between bg-background border-b border-border">
      {/* Logo */}
      <View className="flex-row items-center">
        <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
          <Text className="text-background font-bold text-sm">DS</Text>
        </View>
        <Text className="text-text font-semibold text-base">DumpSack</Text>
      </View>

      {/* Account Switcher */}
      <TouchableOpacity
        onPress={onAccountPress}
        className="flex-1 mx-4 flex-row items-center justify-center bg-surface rounded-lg px-3 py-2"
      >
        <View className="flex-1 items-center">
          <Text className="text-text font-semibold text-sm">{walletName}</Text>
          <Text className="text-textSecondary text-xs">
            {truncatePublicKey(walletAddress)}
          </Text>
        </View>
        <Text className="text-textSecondary ml-2">▼</Text>
      </TouchableOpacity>

      {/* Network + Settings */}
      <View className="flex-row items-center gap-2">
        <View className="bg-success/20 px-2 py-1 rounded">
          <Text className="text-success text-xs font-semibold">{network}</Text>
        </View>
        <TouchableOpacity onPress={onSettingsPress} className="p-2">
          <Text className="text-textSecondary text-lg">⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

