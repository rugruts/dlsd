import React from 'react';
import { View, Text } from 'react-native';
// import QRCode from 'react-native-qrcode-svg'; // TODO: Install and import

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 200 }: QRCodeProps) {
  // TODO: Replace with actual QR code library
  return (
    <View
      className="items-center justify-center border-2 border-textSecondary"
      style={{ width: size, height: size }}
    >
      <Text className="text-textSecondary text-xs">QR: {value.slice(0, 20)}...</Text>
    </View>
  );
}