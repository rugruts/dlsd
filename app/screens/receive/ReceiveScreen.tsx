import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import { useWalletStore } from '../../state/walletStoreV2';
import { solanaUri } from '@dumpsack/shared-utils';
import { truncatePublicKey } from '@dumpsack/shared-types';

export default function ReceiveScreen() {
  const { wallets, activeIndex } = useWalletStore();
  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [amountModalVisible, setAmountModalVisible] = useState(false);
  const [amountInput, setAmountInput] = useState('');

  const activeWallet = wallets[activeIndex];
  const publicKey = activeWallet?.publicKey;

  const handleCopyAddress = () => {
    if (publicKey) {
      Clipboard.setString(publicKey);
      Alert.alert('Copied', 'Address copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (!publicKey) return;

    const uri = solanaUri(publicKey, requestedAmount || undefined, 'DumpSack');

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // For sharing, we'd need to create a temporary file with the QR code
        // For now, just copy the URI
        Clipboard.setString(uri);
        Alert.alert('Copied', 'Solana URI copied to clipboard');
      } else {
        Clipboard.setString(uri);
        Alert.alert('Copied', 'Solana URI copied to clipboard');
      }
    } catch (error) {
      console.error('Share error:', error);
      Clipboard.setString(uri);
      Alert.alert('Copied', 'Solana URI copied to clipboard');
    }
  };

  const handleRequestAmount = () => {
    setAmountModalVisible(true);
  };

  const handleSaveAmount = () => {
    setRequestedAmount(amountInput);
    setAmountModalVisible(false);
  };

  const handleClearAmount = () => {
    setRequestedAmount('');
    setAmountInput('');
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

  const qrValue = solanaUri(publicKey, requestedAmount || undefined, 'DumpSack');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-8">
        <View className="items-center">
          <Text className="text-text-primary text-2xl font-bold mb-8">Receive</Text>

          {/* Wallet Name */}
          {activeWallet && (
            <Text className="text-text-secondary text-sm mb-4">
              {activeWallet.name} • {truncatePublicKey(publicKey, 4)}
            </Text>
          )}

          {/* QR Code */}
          <View className="bg-white p-6 rounded-2xl mb-6">
            <QRCode
              value={qrValue}
              size={220}
              color="black"
              backgroundColor="white"
            />
          </View>

          {/* Requested Amount */}
          {requestedAmount && (
            <View className="bg-accent/10 px-4 py-2 rounded-lg mb-4">
              <Text className="text-accent text-sm font-semibold">
                Requesting: {requestedAmount} GOR
              </Text>
            </View>
          )}

          {/* Address */}
          <View className="w-full mb-6">
            <Text className="text-text-secondary text-sm text-center mb-2">Your Address</Text>
            <TouchableOpacity
              onPress={handleCopyAddress}
              className="bg-card p-4 rounded-xl border border-border"
            >
              <Text className="text-text-primary font-mono text-center text-sm">
                {publicKey}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="w-full space-y-3 mb-6">
            <TouchableOpacity
              className="bg-accent py-4 px-6 rounded-xl items-center"
              onPress={handleCopyAddress}
            >
              <Text className="text-white font-semibold">📋 Copy Address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-card py-4 px-6 rounded-xl items-center border border-border"
              onPress={handleRequestAmount}
            >
              <Text className="text-text-primary font-semibold">
                💰 {requestedAmount ? 'Change Amount' : 'Request Amount'}
              </Text>
            </TouchableOpacity>

            {requestedAmount && (
              <TouchableOpacity
                className="bg-card py-4 px-6 rounded-xl items-center border border-border"
                onPress={handleClearAmount}
              >
                <Text className="text-text-primary font-semibold">✕ Clear Amount</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="bg-card py-4 px-6 rounded-xl items-center border border-border"
              onPress={handleShare}
            >
              <Text className="text-text-primary font-semibold">📤 Share</Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View className="bg-warning/10 p-4 rounded-xl border border-warning/30">
            <Text className="text-warning text-xs text-center">
              ⚠️ Only send GOR and GOR-based tokens to this address. Sending other assets may result in permanent loss.
            </Text>
          </View>
        </View>
      </View>

      {/* Request Amount Modal */}
      <Modal
        visible={amountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAmountModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-text-primary text-lg font-bold mb-4">Request Amount</Text>

            <Text className="text-text-secondary text-sm mb-2">Amount (GOR)</Text>
            <TextInput
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="0.00"
              placeholderTextColor="#888"
              keyboardType="decimal-pad"
              className="bg-card text-text-primary px-4 py-3 rounded-xl border border-border mb-4 text-lg"
              autoFocus
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => {
                  setAmountModalVisible(false);
                  setAmountInput(requestedAmount);
                }}
                className="flex-1 bg-card py-3 rounded-xl items-center border border-border"
              >
                <Text className="text-text-primary font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveAmount}
                className="flex-1 bg-accent py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}