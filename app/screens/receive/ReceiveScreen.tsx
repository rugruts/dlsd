import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Clipboard, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useAuthStore } from '../../state/authStore';
import { shortAddress } from '../../utils/address';

export default function ReceiveScreen() {
  const { publicKey } = useAuthStore();

  const handleCopyAddress = async () => {
    if (publicKey) {
      await Clipboard.setString(publicKey);
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    Alert.alert('Share', 'Share functionality not implemented yet');
  };

  if (!publicKey) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-textSecondary text-center">
            No wallet available
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8">
        <View className="items-center">
          <Text className="text-text text-2xl font-bold mb-8">Receive</Text>

          {/* QR Code */}
          <View className="bg-white p-4 rounded-xl mb-8">
            <QRCode
              value={publicKey}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>

          {/* Address */}
          <View className="w-full mb-8">
            <Text className="text-textSecondary text-sm text-center mb-2">Your Address</Text>
            <Text className="text-text font-mono text-center text-sm bg-surface p-4 rounded-lg break-all">
              {publicKey}
            </Text>
          </View>

          {/* Short Address */}
          <View className="mb-8">
            <Text className="text-textSecondary text-sm text-center">
              {shortAddress(publicKey)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="w-full space-y-4">
            <TouchableOpacity
              className="bg-primary py-4 px-6 rounded-lg items-center"
              onPress={handleCopyAddress}
            >
              <Text className="text-white font-semibold">Copy Address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface py-4 px-6 rounded-lg items-center"
              onPress={handleShare}
            >
              <Text className="text-text font-semibold">Share</Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View className="mt-8 px-4">
            <Text className="text-textSecondary text-xs text-center">
              Only send GOR or SPL tokens to this address. Sending other assets may result in permanent loss.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}