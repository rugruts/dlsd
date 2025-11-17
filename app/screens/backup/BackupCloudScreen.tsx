import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, Switch, Alert, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useBackupStore } from '../../state/backupStore';
import { Button } from '../../components/Button';

export default function BackupCloudScreen() {
  const navigation = useAppNavigation();
  const {
    cloudEnabled,
    lastBackupAt,
    loading,
    error,
    toggleCloud,
    syncToCloud,
    loadSettings
  } = useBackupStore();

  const [localCloudEnabled, setLocalCloudEnabled] = useState(cloudEnabled);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setLocalCloudEnabled(cloudEnabled);
  }, [cloudEnabled]);

  const handleToggleCloud = async (enabled: boolean) => {
    setLocalCloudEnabled(enabled);

    try {
      await toggleCloud(enabled);

      if (enabled) {
        Alert.alert(
          'Cloud Backup Enabled',
          'Your backups will now be automatically synced to the cloud.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Cloud Backup Disabled',
          'Cloud backups have been disabled and any stored backups have been deleted.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Revert local state on error
      setLocalCloudEnabled(!enabled);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update cloud settings');
    }
  };

  const handleManualSync = async () => {
    try {
      await syncToCloud();
      Alert.alert('Success', 'Backup synced to cloud successfully');
    } catch (error) {
      Alert.alert('Sync Failed', error instanceof Error ? error.message : 'Failed to sync backup');
    }
  };

  const formatLastSync = (timestamp?: number) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Cloud Backup</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <Text className="text-text text-lg font-semibold mb-4">
            Secure Cloud Storage
          </Text>

          <Text className="text-textSecondary text-sm mb-6">
            Store encrypted backups in the cloud for easy access across devices.
            Your passphrase is never stored and backups remain encrypted.
          </Text>

          {/* Cloud Toggle */}
          <View className="bg-surface rounded-lg p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text className="text-text font-semibold mb-1">Cloud Backup</Text>
                <Text className="text-textSecondary text-sm">
                  {localCloudEnabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
              <Switch
                value={localCloudEnabled}
                onValueChange={handleToggleCloud}
                disabled={loading}
              />
            </View>

            {localCloudEnabled && (
              <View className="pt-4 border-t border-gray-200">
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-textSecondary">Last Sync</Text>
                  <Text className="text-text text-sm">
                    {formatLastSync(lastBackupAt)}
                  </Text>
                </View>

                <Button
                  title="Sync Now"
                  onPress={handleManualSync}
                  variant="secondary"
                  disabled={loading}
                  className="w-full"
                />
              </View>
            )}
          </View>

          {/* Security Notice */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 text-sm">
              🔐 Cloud backups are encrypted with AES-GCM using your passphrase.
              Only encrypted data is stored in the cloud - your passphrase never leaves your device.
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <Text className="text-red-800 text-sm">{error}</Text>
            </View>
          )}

          {/* Benefits */}
          <View className="bg-green-50 border border-green-200 rounded-lg p-4">
            <Text className="text-green-800 font-semibold mb-2">Benefits</Text>
            <Text className="text-green-800 text-sm">
              • Access your backup from any device{'\n'}
              • Automatic syncing when creating backups{'\n'}
              • Secure encryption ensures your data stays private
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}