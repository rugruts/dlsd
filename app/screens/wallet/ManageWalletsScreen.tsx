/**
 * ManageWalletsScreen
 * Full screen for managing wallets (rename, hide, remove, reorder)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useWalletStore } from '../../state/walletStoreV2';
import { generateWalletAvatar } from '@dumpsack/shared-utils';
import { truncatePublicKey, MAX_WALLETS } from '@dumpsack/shared-types';

export default function ManageWalletsScreen() {
  const navigation = useNavigation();
  const {
    wallets,
    activeIndex,
    setActive,
    renameWallet,
    removeWallet,
    toggleHidden,
    addWallet,
    reorderWallets,
  } = useWalletStore();

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingWalletIndex, setRenamingWalletIndex] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = (index: number, currentName: string) => {
    setRenamingWalletIndex(index);
    setNewName(currentName);
    setRenameModalVisible(true);
  };

  const handleSaveRename = () => {
    if (renamingWalletIndex === null) return;

    try {
      renameWallet(renamingWalletIndex, newName.trim());
      setRenameModalVisible(false);
      setRenamingWalletIndex(null);
      setNewName('');
      Alert.alert('Success', 'Wallet renamed successfully');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to rename wallet');
    }
  };

  const handleRemove = (index: number, name: string) => {
    if (wallets.length <= 1) {
      Alert.alert('Cannot Remove', 'You must have at least one wallet');
      return;
    }

    Alert.alert(
      'Remove Wallet',
      `Are you sure you want to remove "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeWallet(index);
              Alert.alert('Success', 'Wallet removed successfully');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to remove wallet');
            }
          },
        },
      ]
    );
  };

  const handleToggleHidden = (index: number) => {
    try {
      toggleHidden(index);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to toggle visibility');
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

  const handleMoveUp = (fromIndex: number) => {
    if (fromIndex > 0) {
      reorderWallets(fromIndex, fromIndex - 1);
    }
  };

  const handleMoveDown = (fromIndex: number) => {
    if (fromIndex < wallets.length - 1) {
      reorderWallets(fromIndex, fromIndex + 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-accent text-base">← Back</Text>
        </TouchableOpacity>
        <Text className="text-text-primary text-lg font-bold">Manage Wallets</Text>
        <View className="w-16" />
      </View>

      {/* Wallet List */}
      <ScrollView className="flex-1 px-4 py-4">
        {wallets.map((wallet, arrayIndex) => {
          const avatar = generateWalletAvatar(wallet.name, wallet.publicKey);
          const isActive = activeIndex === arrayIndex;

          return (
            <TouchableOpacity
              key={wallet.index}
              onPress={() => setActive(wallet.index)}
              className={`bg-card rounded-xl p-4 mb-3 ${
                isActive ? 'border-2 border-accent' : 'border border-border'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                {/* Avatar */}
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: avatar.backgroundColor }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: avatar.textColor }}
                  >
                    {avatar.initials}
                  </Text>
                </View>

                {/* Wallet Info */}
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-text-primary text-base font-semibold">
                      {wallet.name}
                    </Text>
                    {isActive && (
                      <View className="bg-accent px-2 py-0.5 rounded ml-2">
                        <Text className="text-white text-xs font-semibold">Active</Text>
                      </View>
                    )}
                    {wallet.hidden && (
                      <View className="bg-text-secondary/20 px-2 py-0.5 rounded ml-2">
                        <Text className="text-text-secondary text-xs">Hidden</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-text-secondary text-sm mt-1">
                    {truncatePublicKey(wallet.publicKey, 4)}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row items-center justify-end mt-3 space-x-2">
                {/* Reorder Buttons */}
                <TouchableOpacity
                  onPress={() => handleMoveUp(arrayIndex)}
                  disabled={arrayIndex === 0}
                  className={`p-2 rounded ${arrayIndex === 0 ? 'opacity-30' : ''}`}
                >
                  <Text className="text-text-secondary">↑</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMoveDown(arrayIndex)}
                  disabled={arrayIndex === wallets.length - 1}
                  className={`p-2 rounded ${arrayIndex === wallets.length - 1 ? 'opacity-30' : ''}`}
                >
                  <Text className="text-text-secondary">↓</Text>
                </TouchableOpacity>

                {/* Rename Button */}
                <TouchableOpacity
                  onPress={() => handleRename(wallet.index, wallet.name)}
                  className="p-2 rounded flex-row items-center"
                >
                  <Icon name="edit-2" size={16} color="#F26A2E" />
                  <Text className="text-accent ml-1">Rename</Text>
                </TouchableOpacity>

                {/* Hide/Show Button */}
                <TouchableOpacity
                  onPress={() => handleToggleHidden(wallet.index)}
                  className="p-2 rounded flex-row items-center"
                  disabled={isActive}
                >
                  <Icon
                    name={wallet.hidden ? 'eye' : 'eye-off'}
                    size={16}
                    color={isActive ? '#C6D0C380' : '#C6D0C3'}
                  />
                  <Text className={isActive ? 'text-text-secondary/30 ml-1' : 'text-text-secondary ml-1'}>
                    {wallet.hidden ? 'Show' : 'Hide'}
                  </Text>
                </TouchableOpacity>

                {/* Remove Button */}
                <TouchableOpacity
                  onPress={() => handleRemove(wallet.index, wallet.name)}
                  className="p-2 rounded flex-row items-center"
                  disabled={wallets.length <= 1}
                >
                  <Icon
                    name="trash-2"
                    size={16}
                    color={wallets.length <= 1 ? '#E4575780' : '#E45757'}
                  />
                  <Text className={wallets.length <= 1 ? 'text-error/30 ml-1' : 'text-error ml-1'}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Add Wallet Button */}
      <View className="px-4 pb-4 border-t border-border pt-4">
        <TouchableOpacity
          onPress={handleAddWallet}
          className="bg-accent py-4 rounded-xl items-center"
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">
            Add Wallet ({wallets.length}/{MAX_WALLETS})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rename Modal */}
      <Modal
        visible={renameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-background rounded-2xl p-6 w-full max-w-sm">
            <Text className="text-text-primary text-lg font-bold mb-4">Rename Wallet</Text>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter wallet name"
              placeholderTextColor="#888"
              className="bg-card text-text-primary px-4 py-3 rounded-xl border border-border mb-4"
              autoFocus
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setRenameModalVisible(false)}
                className="flex-1 bg-card py-3 rounded-xl items-center border border-border"
              >
                <Text className="text-text-primary font-semibold">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveRename}
                className="flex-1 bg-accent py-3 rounded-xl items-center"
                disabled={!newName.trim()}
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

