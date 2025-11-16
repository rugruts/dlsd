import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useBackupStore } from '../../state/backupStore';
import { Button } from '../../components/Button';

export default function BackupDashboardScreen() {
  const navigation = useAppNavigation();
  const { cloudEnabled, lastBackupAt, loading, error, loadSettings } = useBackupStore();

  useEffect(() => {
    loadSettings();
  }, []);

  const handleCreateBackup = () => {
    navigation.navigate('BackupCreate');
  };

  const handleCloudSettings = () => {
    navigation.navigate('BackupCloud');
  };

  const handleRestoreBackup = () => {
    Alert.alert(
      'Restore Backup',
      'This will replace your current wallet. Make sure you have your backup file and passphrase ready.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => navigation.navigate('BackupRestore') },
      ]
    );
  };

  const formatLastBackup = (timestamp?: number) => {
    if (!timestamp) return 'Never';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getBackupStatus = () => {
    if (!lastBackupAt) return { status: 'No backup', color: 'text-red-500' };

    const daysSince = Math.floor((Date.now() - lastBackupAt) / (1000 * 60 * 60 * 24));

    if (daysSince === 0) return { status: 'Up to date', color: 'text-green-500' };
    if (daysSince <= 7) return { status: 'Recent', color: 'text-yellow-500' };
    return { status: 'Outdated', color: 'text-red-500' };
  };

  const backupStatus = getBackupStatus();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Backup & Recovery</Text>
        </View>

        {/* Backup Status */}
        <View className="bg-surface rounded-lg p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text text-lg font-semibold">Backup Status</Text>
            <Text className={`font-semibold ${backupStatus.color}`}>
              {backupStatus.status}
            </Text>
          </View>

          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-textSecondary">Last Backup</Text>
              <Text className="text-text">{formatLastBackup(lastBackupAt)}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-textSecondary">Cloud Sync</Text>
              <Text className="text-text">
                {cloudEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <Text className="text-blue-800 text-sm">
            🔐 Your backups are encrypted with AES-GCM. Only you can decrypt them with your passphrase.
            Never share your passphrase or backup files.
          </Text>
        </View>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-800 text-sm">{error}</Text>
          </View>
        )}

        {/* Actions */}
        <View className="space-y-4">
          <Button
            title="Create New Backup"
            onPress={handleCreateBackup}
            className="w-full"
            disabled={loading}
          />

          <Button
            title="Cloud Backup Settings"
            onPress={handleCloudSettings}
            variant="secondary"
            className="w-full"
            disabled={loading}
          />

          <Button
            title="Restore from Backup"
            onPress={handleRestoreBackup}
            variant="secondary"
            className="w-full"
            disabled={loading}
          />
        </View>

        {/* Help Text */}
        <View className="mt-8">
          <Text className="text-textSecondary text-sm text-center">
            Regular backups ensure you can always recover your wallet on any device.
            Store backup files securely and never share your passphrase.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}