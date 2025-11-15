import React from 'react';
import { View, Text, TouchableOpacity, Alert, Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useWallet } from '../hooks/useWallet';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Button } from '../components/Button';
import { QRCode } from '../components/QRCode';

export default function ReceiveScreen() {
  const { publicKey } = useWallet();

  const address = publicKey?.toBase58() || 'No address available';

  const handleCopy = () => {
    if (address !== 'No address available') {
      Clipboard.setString(address);
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My wallet address: ${address}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share address');
    }
  };

  return (
    <ScreenContainer>
      <Text className="text-text text-2xl font-bold mb-6">Receive</Text>

      <View className="items-center">
        {/* QR Code */}
        <View className="mb-6">
          <QRCode value={address} size={180} />
        </View>

        {/* Address */}
        <Text className="text-textSecondary mb-2">Your Address</Text>
        <Text className="text-text text-center text-sm mb-6 px-4" selectable>
          {address}
        </Text>

        {/* Buttons */}
        <View className="w-full space-y-4">
          <Button title="Copy Address" onPress={handleCopy} />
          <Button title="Share Address" onPress={handleShare} variant="secondary" />
        </View>
      </View>
    </ScreenContainer>
  );
}