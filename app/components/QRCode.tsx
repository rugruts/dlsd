import React from 'react';
import { View } from 'react-native';
import QRCodeSVG from 'react-native-qrcode-svg';

interface QRCodeProps {
  value: string;
  size?: number;
  backgroundColor?: string;
  color?: string;
}

export function QRCode({
  value,
  size = 200,
  backgroundColor = '#FFFFFF',
  color = '#000000'
}: QRCodeProps) {
  return (
    <View className="items-center justify-center">
      <QRCodeSVG
        value={value}
        size={size}
        backgroundColor={backgroundColor}
        color={color}
      />
    </View>
  );
}