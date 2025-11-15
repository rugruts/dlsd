import React from 'react';
import { View, Text } from 'react-native';

interface AvatarProps {
  uri?: string;
  size?: number;
  fallback?: string;
}

export function Avatar({ uri, size = 40, fallback = '?' }: AvatarProps) {
  // TODO: Implement image loading with fallback
  return (
    <View
      className="bg-primary rounded-full items-center justify-center"
      style={{ width: size, height: size }}
    >
      <Text className="text-text text-lg font-bold">{fallback}</Text>
    </View>
  );
}