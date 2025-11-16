import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { usePanicStore } from '../../state/panicStore';
import { Button } from '../../components/Button';

export default function PanicBunkerDashboardScreen() {
  const navigation = useAppNavigation();
  const {
    locked,
    safeAddress,
    lockedAt,
    autoLockEnabled,
    loading,
    error,
    lock,
    refresh
  } = usePanicStore();

  useEffect(() => {
    refresh();
  }, []);

  const handleLockWallet = async () => {
    Alert.alert(
      'Lock Wallet',
      'This will immediately disable all signing operations. You will need to authenticate to unlock.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Lock Wallet',
          style: 'destructive',
          onPress: async () => {
            try {
              await lock();
              Alert.alert('Success', 'Wallet has been locked');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to lock wallet');
            }
          },
        },
      ]
    );
  };

  const handleEmergencySweep = () => {
    if (!safeAddress) {
      Alert.alert(
        'Safe Address Required',
        'Please set a safe address first in settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => navigation.navigate('PanicSettingsScreen') },
        ]
      );
      return;
    }

    navigation.navigate('EmergencySweepScreen');
  };

  const handleSettings = () => {
    navigation.navigate('PanicSettingsScreen');
  };

  const formatLockTime = (timestamp?: number) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Panic Bunker</Text>
        </View>

        <View className="flex-1">
          {/* Status Card */}
          <View className="bg-surface rounded-lg p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-text font-semibold">Wallet Status</Text>
              <View className={`w-3 h-3 rounded-full ${locked ? 'bg-red-500' : 'bg-green-500'}`} />
            </View>

            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Status</Text>
                <Text className={`font-semibold ${locked ? 'text-red-500' : 'text-green-500'}`}>
                  {locked ? 'LOCKED' : 'UNLOCKED'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Last Locked</Text>
                <Text className="text-text">{formatLockTime(lockedAt)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Auto-Lock</Text>
                <Text className="text-text">{autoLockEnabled ? 'Enabled' : 'Disabled'}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Safe Address</Text>
                <Text className="text-text">
                  {safeAddress ? 'Set' : 'Not Set'}
                </Text>
              </View>
            </View>
          </View>

          {/* Warning */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <Text className="text-yellow-800 text-sm">
              🚨 Panic Bunker provides emergency protection. When locked, all transaction signing is disabled until you authenticate again.
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}

          {/* Actions */}
          <View className="space-y-4">
            {!locked ? (
              <Button
                title="Lock Wallet Now"
                onPress={handleLockWallet}
                variant="secondary"
                disabled={loading}
                className="w-full"
              />
            ) : (
              <View className="bg-red-50 border border-red-200 rounded-lg p-4">
                <Text className="text-red-800 font-semibold mb-2">Wallet is Locked</Text>
                <Text className="text-red-800 text-sm">
                  All signing operations are disabled. Use biometric authentication or passphrase to unlock.
                </Text>
              </View>
            )}

            <Button
              title="Emergency Sweep"
              onPress={handleEmergencySweep}
              variant="secondary"
              disabled={loading || locked}
              className="w-full"
            />

            <Button
              title="Settings"
              onPress={handleSettings}
              variant="secondary"
              disabled={loading}
              className="w-full"
            />
          </View>

          {/* Help Text */}
          <View className="mt-8">
            <Text className="text-textSecondary text-sm text-center">
              Panic Bunker protects your assets in emergency situations by instantly disabling all wallet operations.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}