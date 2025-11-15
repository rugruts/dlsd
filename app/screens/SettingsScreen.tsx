import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useUIStore } from '../state/uiStore';

export default function SettingsScreen() {
  const { themeMode, toggleTheme } = useUIStore();

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-text text-2xl font-bold">Settings</Text>
      <TouchableOpacity onPress={toggleTheme} className="mt-4 bg-primary px-4 py-2 rounded">
        <Text className="text-text">Toggle Theme ({themeMode})</Text>
      </TouchableOpacity>
    </View>
  );
}