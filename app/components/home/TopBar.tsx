/**
 * TopBar Component - Phantom-grade compact header (Mobile)
 * Platform-specific implementation using shared logic
 * Height: 60px fixed
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTopBar, TopBarProps } from '@dumpsack/shared-ui';

export function TopBar(props: TopBarProps) {
  const data = useTopBar(props);

  return (
    <View className="h-[60px] px-4 flex-row items-center justify-between bg-background border-b border-border">
      {/* Logo */}
      <View className="flex-row items-center">
        <View className="w-8 h-8 bg-primary rounded-full items-center justify-center mr-2">
          <Text className="text-background font-bold text-sm">{data.logo.text}</Text>
        </View>
        <Text className="text-text font-semibold text-base">{data.logo.label}</Text>
      </View>

      {/* Account Switcher */}
      <TouchableOpacity
        onPress={data.account.onPress}
        className="flex-1 mx-4 flex-row items-center justify-center bg-surface rounded-lg px-3 py-2"
      >
        <View className="flex-1 items-center">
          <Text className="text-text font-semibold text-sm">{data.account.name}</Text>
          <Text className="text-textSecondary text-xs">{data.account.address}</Text>
        </View>
        <Text className="text-textSecondary ml-2">▼</Text>
      </TouchableOpacity>

      {/* Network + Settings */}
      <View className="flex-row items-center gap-2">
        <View className="bg-success/20 px-2 py-1 rounded">
          <Text className="text-success text-xs font-semibold">{data.network.label}</Text>
        </View>
        <TouchableOpacity onPress={data.settings.onPress} className="p-2">
          <Text className="text-textSecondary text-lg">{data.settings.icon}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Re-export props type
export type { TopBarProps };

