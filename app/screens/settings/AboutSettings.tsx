/**
 * AboutSettings Component
 * App info, version, links
 */

import React from 'react';
import { View, Text, TouchableOpacity, Image, Linking } from 'react-native';

export function AboutSettings() {
  const appVersion = '1.0.0'; // TODO: Read from app.json

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View className="p-4">
      {/* Logo and App Info */}
      <View className="items-center mb-6">
        <Image
          source={require('../../assets/logo.png')}
          className="w-24 h-24 rounded-2xl mb-4"
          resizeMode="contain"
        />
        <Text className="text-text-primary text-2xl font-bold">DumpSack</Text>
        <Text className="text-text-secondary text-sm mt-1">Gorbagana Native Wallet</Text>
        <Text className="text-text-secondary text-xs mt-2">Version {appVersion}</Text>
      </View>

      {/* Links */}
      <View className="space-y-2 mb-6">
        <TouchableOpacity
          onPress={() => handleOpenLink('https://dumpsack.xyz')}
          className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">🌐</Text>
            <Text className="text-text-primary text-base font-semibold">Website</Text>
          </View>
          <Text className="text-text-secondary">→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenLink('https://support.dumpsack.xyz')}
          className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">💬</Text>
            <Text className="text-text-primary text-base font-semibold">Support</Text>
          </View>
          <Text className="text-text-secondary">→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenLink('https://dumpsack.xyz/terms')}
          className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">📄</Text>
            <Text className="text-text-primary text-base font-semibold">Terms of Service</Text>
          </View>
          <Text className="text-text-secondary">→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleOpenLink('https://dumpsack.xyz/privacy')}
          className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">🔒</Text>
            <Text className="text-text-primary text-base font-semibold">Privacy Policy</Text>
          </View>
          <Text className="text-text-secondary">→</Text>
        </TouchableOpacity>
      </View>

      {/* Environment Info */}
      <View className="bg-card p-4 rounded-xl border border-border">
        <Text className="text-text-secondary text-xs mb-2">Environment</Text>
        <Text className="text-text-primary text-sm font-mono">
          Network: Gorbagana
        </Text>
        <Text className="text-text-primary text-sm font-mono mt-1">
          Build: Production
        </Text>
      </View>

      {/* Copyright */}
      <Text className="text-text-secondary text-xs text-center mt-6">
        © 2025 DumpSack. All rights reserved.
      </Text>
    </View>
  );
}

