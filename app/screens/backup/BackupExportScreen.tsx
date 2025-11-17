import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { useAppNavigation, useAppRoute } from '../../navigation/hooks';
import { backupService } from '../../services/backup/backupService';
import { Button } from '../../components/Button';

export default function BackupExportScreen() {
  const navigation = useAppNavigation();
  const { params } = useAppRoute<'BackupExport'>();
  const { backupPayload } = params;

  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleExportToFile = async () => {
    setExporting(true);
    try {
      const fileUri = await backupService.exportBackupToFile(backupPayload);
      Alert.alert(
        'Backup Saved',
        `Backup saved to: ${fileUri}`,
        [{ text: 'OK', onPress: () => navigation.navigate('BackupDashboard') }]
      );
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Failed to export backup');
    } finally {
      setExporting(false);
    }
  };

  const handleShareBackup = async () => {
    setSharing(true);
    try {
      const fileUri = await backupService.exportBackupToFile(backupPayload);
      await backupService.shareBackupFile(fileUri);
      navigation.navigate('BackupDashboard');
    } catch (error) {
      Alert.alert('Share Failed', error instanceof Error ? error.message : 'Failed to share backup');
    } finally {
      setSharing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Export Backup</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center">
          <View className="bg-green-50 border border-green-200 rounded-full w-20 h-20 justify-center items-center mb-6 mx-auto">
            <Text className="text-green-600 text-3xl">✓</Text>
          </View>

          <Text className="text-text text-xl font-bold text-center mb-2">
            Backup Created Successfully!
          </Text>

          <Text className="text-textSecondary text-center mb-8">
            Your wallet has been encrypted and is ready to export. Choose how you want to save it.
          </Text>

          <View className="bg-surface rounded-lg p-6 mb-8">
            <Text className="text-text font-semibold mb-2">Backup Details</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Version</Text>
                <Text className="text-text">v{backupPayload.version}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Created</Text>
                <Text className="text-text">
                  {new Date(backupPayload.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Public Key</Text>
                <Text className="text-text font-mono text-sm">
                  {backupPayload.publicKey.slice(0, 8)}...{backupPayload.publicKey.slice(-8)}
                </Text>
              </View>
            </View>
          </View>

          <View className="space-y-4">
            <Button
              title={exporting ? "Saving..." : "Save to Device"}
              onPress={handleExportToFile}
              disabled={exporting || sharing}
              className="w-full"
            />

            <Button
              title={sharing ? "Sharing..." : "Share Backup"}
              onPress={handleShareBackup}
              variant="secondary"
              disabled={exporting || sharing}
              className="w-full"
            />
          </View>

          <View className="mt-8">
            <Text className="text-textSecondary text-sm text-center">
              Store this backup file securely. You will need your passphrase to restore it.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}