import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert, TouchableOpacity } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useBackupStore } from '../../state/backupStore';
import { Button } from '../../components/Button';
import * as DocumentPicker from 'expo-document-picker';

export default function BackupRestoreScreen() {
  const navigation = useAppNavigation();
  const { restoreBackup, loading } = useBackupStore();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      // Check if the result is not canceled
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select backup file');
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a backup file first');
      return;
    }

    if (!passphrase) {
      Alert.alert('Passphrase Required', 'Please enter your backup passphrase');
      return;
    }

    Alert.alert(
      'Confirm Restore',
      'This will replace your current wallet with the backup. Make sure you have the correct passphrase and backup file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              await restoreBackup(selectedFile, passphrase);
              navigation.navigate('BackupRestoreSuccess');
            } catch (error) {
              Alert.alert('Restore Failed', error instanceof Error ? error.message : 'Failed to restore backup');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Restore Backup</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <Text className="text-text text-lg font-semibold mb-4">
            Restore from Backup
          </Text>

          <Text className="text-textSecondary text-sm mb-6">
            Select your backup file and enter the passphrase you used when creating the backup.
          </Text>

          {/* File Selection */}
          <View className="mb-6">
            <Text className="text-textSecondary mb-2">Backup File</Text>
            <TouchableOpacity
              className="bg-surface border border-gray-300 rounded-lg p-4"
              onPress={handleSelectFile}
            >
              <Text className="text-text">
                {selectedFile ? '✓ Backup file selected' : 'Select backup file...'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Passphrase Input */}
          <View className="mb-6">
            <Text className="text-textSecondary mb-2">Passphrase</Text>
            <View className="flex-row">
              <TextInput
                className="flex-1 bg-surface border border-gray-300 rounded-l-lg p-4 text-text"
                placeholder="Enter your backup passphrase"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry={!showPassphrase}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                className="bg-gray-200 px-4 justify-center rounded-r-lg"
                onPress={() => setShowPassphrase(!showPassphrase)}
              >
                <Text className="text-text font-semibold">
                  {showPassphrase ? '🙈' : '👁️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Warning */}
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <Text className="text-red-800 text-sm">
              ⚠️ Restoring a backup will replace your current wallet. Make sure you have the correct file and passphrase.
            </Text>
          </View>

          {/* Info */}
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <Text className="text-blue-800 text-sm">
              ℹ️ You can restore from a local file or use cloud sync if you have cloud backups enabled.
            </Text>
          </View>
        </View>

        <Button
          title={loading ? "Restoring..." : "Restore Wallet"}
          onPress={handleRestore}
          disabled={loading || !selectedFile || !passphrase}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}