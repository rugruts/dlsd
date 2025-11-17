/**
 * WalletSwitcherSheet Component
 * Bottom sheet for switching between wallets
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { useWalletStore } from '../../state/walletStoreV2';
import { generateWalletAvatar } from '@dumpsack/shared-utils';
import { truncatePublicKey, MAX_WALLETS } from '@dumpsack/shared-types';
import { useNavigation } from '@react-navigation/native';

interface WalletSwitcherSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function WalletSwitcherSheet({ visible, onClose }: WalletSwitcherSheetProps) {
  const navigation = useNavigation();
  const { wallets, activeIndex, setActive, addWallet } = useWalletStore();
  
  // Filter out hidden wallets
  const visibleWallets = wallets.filter(w => !w.hidden);

  const handleSelectWallet = (index: number) => {
    const walletIndex = wallets.findIndex(w => w.index === index);
    if (walletIndex !== -1) {
      setActive(index);
      onClose();
    }
  };

  const handleAddWallet = async () => {
    if (wallets.length >= MAX_WALLETS) {
      Alert.alert('Maximum Wallets', `You can only have up to ${MAX_WALLETS} wallets.`);
      return;
    }

    try {
      await addWallet();
      Alert.alert('Success', 'New wallet added successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add wallet');
    }
  };

  const handleManageWallets = () => {
    onClose();
    // @ts-ignore - navigation type
    navigation.navigate('ManageWallets');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View className="bg-background rounded-t-3xl p-6 max-h-[80%]">
              {/* Header */}
              <View className="mb-4">
                <Text className="text-text-primary text-xl font-bold">Wallets</Text>
                <Text className="text-text-secondary text-sm mt-1">
                  Manage your derived wallets
                </Text>
              </View>

              {/* Wallet List */}
              <ScrollView className="mb-4" showsVerticalScrollIndicator={false}>
                {visibleWallets.map((wallet) => {
                  const avatar = generateWalletAvatar(wallet.name, wallet.publicKey);
                  const isActive = wallets[activeIndex]?.index === wallet.index;

                  return (
                    <TouchableOpacity
                      key={wallet.index}
                      onPress={() => handleSelectWallet(wallet.index)}
                      className={`flex-row items-center p-4 rounded-xl mb-2 ${
                        isActive ? 'bg-accent/10 border border-accent' : 'bg-card'
                      }`}
                      activeOpacity={0.7}
                    >
                      {/* Avatar */}
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: avatar.backgroundColor }}
                      >
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: avatar.textColor }}
                        >
                          {avatar.initials}
                        </Text>
                      </View>

                      {/* Wallet Info */}
                      <View className="flex-1">
                        <Text className="text-text-primary text-base font-semibold">
                          {wallet.name}
                        </Text>
                        <Text className="text-text-secondary text-sm">
                          {truncatePublicKey(wallet.publicKey, 4)}
                        </Text>
                      </View>

                      {/* Active Badge */}
                      {isActive && (
                        <View className="bg-accent px-3 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">Active</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer Buttons */}
              <View className="space-y-2">
                <TouchableOpacity
                  onPress={handleAddWallet}
                  className="bg-accent py-4 rounded-xl items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-base font-semibold">Add Wallet</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleManageWallets}
                  className="bg-card py-4 rounded-xl items-center border border-border"
                  activeOpacity={0.8}
                >
                  <Text className="text-text-primary text-base font-semibold">
                    Manage Wallets
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

