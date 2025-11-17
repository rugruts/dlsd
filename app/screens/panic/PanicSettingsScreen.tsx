import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { usePanicStore } from '../../state/panicStore';
import { Button } from '../../components/Button';

export default function PanicSettingsScreen() {
  const navigation = useAppNavigation();
  const {
    safeAddress,
    autoLockEnabled,
    setSafeAddress,
    setAutoLockEnabled,
    loading,
    refresh
  } = usePanicStore();

  const [newSafeAddress, setNewSafeAddress] = useState(safeAddress || '');
  const [newAutoLockEnabled, setNewAutoLockEnabled] = useState(autoLockEnabled);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    setNewSafeAddress(safeAddress || '');
    setNewAutoLockEnabled(autoLockEnabled);
  }, [safeAddress, autoLockEnabled]);

  const handleSaveSafeAddress = async () => {
    if (!newSafeAddress) {
      Alert.alert('Error', 'Please enter a safe address');
      return;
    }

    // Basic validation for Solana address (44 characters)
    if (newSafeAddress.length !== 44) {
      Alert.alert('Error', 'Invalid Solana address format');
      return;
    }

    try {
      await setSafeAddress(newSafeAddress);
      Alert.alert('Success', 'Safe address updated');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update safe address');
    }
  };

  const handleToggleAutoLock = async () => {
    try {
      await setAutoLockEnabled(!newAutoLockEnabled);
      setNewAutoLockEnabled(!newAutoLockEnabled);
      Alert.alert('Success', `Auto-lock ${!newAutoLockEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update auto-lock setting');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Panic Bunker Settings</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <Text className="text-text text-lg font-semibold mb-4">
            Emergency Configuration
          </Text>

          <Text className="text-textSecondary text-sm mb-6">
            Configure your panic bunker settings for emergency situations.
          </Text>

          {/* Safe Address */}
          <View className="mb-6">
            <Text className="text-textSecondary mb-2">Safe Address</Text>
            <Text className="text-textSecondary text-xs mb-2">
              Address where emergency sweep will send funds
            </Text>
            <TextInput
              className="bg-surface border border-gray-300 rounded-lg p-4 text-text font-mono text-sm"
              placeholder="Enter Solana address for emergency sweep"
              value={newSafeAddress}
              onChangeText={setNewSafeAddress}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              title="Save Safe Address"
              onPress={handleSaveSafeAddress}
              disabled={loading || newSafeAddress === safeAddress}
              className="mt-2"
            />
          </View>

          {/* Auto Lock */}
          <View className="mb-6">
            <Text className="text-textSecondary mb-2">Auto-Lock</Text>
            <Text className="text-textSecondary text-xs mb-4">
              Automatically lock wallet when app goes to background
            </Text>

            <TouchableOpacity
              className={`flex-row items-center p-4 rounded-lg border ${
                newAutoLockEnabled ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-surface'
              }`}
              onPress={handleToggleAutoLock}
              disabled={loading}
            >
              <View className={`w-6 h-6 rounded border-2 justify-center items-center mr-3 ${
                newAutoLockEnabled ? 'bg-green-500 border-green-500' : 'border-gray-300'
              }`}>
                {newAutoLockEnabled && <Text className="text-white text-xs">✓</Text>}
              </View>
              <View className="flex-1">
                <Text className="text-text font-semibold">
                  {newAutoLockEnabled ? 'Auto-Lock Enabled' : 'Auto-Lock Disabled'}
                </Text>
                <Text className="text-textSecondary text-sm">
                  {newAutoLockEnabled
                    ? 'Wallet will lock automatically when not in use'
                    : 'Wallet stays unlocked until manually locked'
                  }
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Security Notice */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 text-sm">
              🔐 Your safe address and settings are stored securely. Make sure your safe address is a wallet you control and keep it secure.
            </Text>
          </View>

          {/* Warning */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <Text className="text-yellow-800 text-sm">
              ⚠️ Emergency sweep cannot be undone. Double-check your safe address before saving.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}