/**
 * AppHeader Component
 * Main header with logo, wallet chip, and settings button
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { WalletChip } from '../wallet/WalletChip';
import { WalletSwitcherSheet } from '../wallet/WalletSwitcherSheet';

interface AppHeaderProps {
  title?: string;
  showWalletChip?: boolean;
  showSettings?: boolean;
}

export function AppHeader({
  title,
  showWalletChip = true,
  showSettings = true
}: AppHeaderProps) {
  const navigation = useNavigation();
  const [walletSwitcherVisible, setWalletSwitcherVisible] = useState(false);

  return (
    <>
      <View className="flex-row items-center justify-between px-4 py-3 bg-background border-b border-border">
        {/* Left: Logo + Brand */}
        <View className="flex-row items-center flex-1">
          <Image
            source={require('../../assets/logo.png')}
            className="w-8 h-8 rounded"
            resizeMode="contain"
          />
          <Text className="text-text-primary text-lg font-semibold ml-2">
            DumpSack
          </Text>
        </View>

        {/* Center: Title (if provided) */}
        {title && (
          <View className="flex-1 items-center">
            <Text className="text-text-primary text-base font-medium">
              {title}
            </Text>
          </View>
        )}

        {/* Right: Wallet Chip + Settings */}
        <View className="flex-row items-center space-x-2 flex-1 justify-end">
          {showWalletChip && (
            <WalletChip onPress={() => setWalletSwitcherVisible(true)} />
          )}

          {showSettings && (
            <TouchableOpacity
              onPress={() => {
                // @ts-ignore - navigation type
                navigation.navigate('SettingsMain');
              }}
              className="p-2"
            >
              <Icon name="settings" size={20} color="#C6D0C3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Wallet Switcher Sheet */}
      <WalletSwitcherSheet
        visible={walletSwitcherVisible}
        onClose={() => setWalletSwitcherVisible(false)}
      />
    </>
  );
}

