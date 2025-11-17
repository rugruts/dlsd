/**
 * WalletChip Component
 * Small header chip showing active wallet with avatar
 */

import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useWalletStore } from '../../state/walletStoreV2';
import { generateWalletAvatar } from '@dumpsack/shared-utils';
import { truncatePublicKey } from '@dumpsack/shared-types';

interface WalletChipProps {
  onPress: () => void;
}

export function WalletChip({ onPress }: WalletChipProps) {
  const { wallets, activeIndex } = useWalletStore();
  
  const activeWallet = wallets[activeIndex];
  
  if (!activeWallet) {
    return null;
  }

  const avatar = generateWalletAvatar(activeWallet.name, activeWallet.publicKey);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-card rounded-lg px-3 py-2 border border-border"
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-2"
        style={{ backgroundColor: avatar.backgroundColor }}
      >
        <Text
          className="text-xs font-semibold"
          style={{ color: avatar.textColor }}
        >
          {avatar.initials}
        </Text>
      </View>

      {/* Wallet Info */}
      <View className="flex-1">
        <Text className="text-text-primary text-sm font-semibold" numberOfLines={1}>
          {activeWallet.name}
        </Text>
        <Text className="text-text-secondary text-xs" numberOfLines={1}>
          {truncatePublicKey(activeWallet.publicKey, 4)}
        </Text>
      </View>

      {/* Chevron Down Icon */}
      <View className="ml-2">
        <Text className="text-text-secondary text-xs">▼</Text>
      </View>
    </TouchableOpacity>
  );
}

