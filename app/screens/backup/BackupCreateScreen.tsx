import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useBackupStore } from '../../state/backupStore';
import { Button } from '../../components/Button';
import { validatePassphraseStrength } from '../../services/backup/backupUtils';

export default function BackupCreateScreen() {
  const navigation = useAppNavigation();
  const { createBackup, loading } = useBackupStore();

  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  const passphraseValidation = validatePassphraseStrength(passphrase);

  const handleCreateBackup = async () => {
    if (!passphraseValidation.isValid) {
      Alert.alert('Invalid Passphrase', 'Please ensure your passphrase meets the requirements.');
      return;
    }

    if (passphrase !== confirmPassphrase) {
      Alert.alert('Passphrase Mismatch', 'The passphrases do not match.');
      return;
    }

    try {
      const backupPayload = await createBackup(passphrase);
      navigation.navigate('BackupExport', { backupPayload });
    } catch (error) {
      Alert.alert('Backup Failed', error instanceof Error ? error.message : 'Failed to create backup');
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Create Backup</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <Text className="text-text text-lg font-semibold mb-4">
            Set a strong passphrase
          </Text>

          <Text className="text-textSecondary text-sm mb-6">
            This passphrase will be required to restore your wallet. Choose a strong, memorable passphrase that you can remember.
          </Text>

          {/* Passphrase Input */}
          <View className="mb-4">
            <Text className="text-textSecondary mb-2">Passphrase</Text>
            <View className="flex-row">
              <TextInput
                className="flex-1 bg-surface border border-gray-300 rounded-l-lg p-4 text-text"
                placeholder="Enter a strong passphrase"
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

          {/* Confirm Passphrase */}
          <View className="mb-4">
            <Text className="text-textSecondary mb-2">Confirm Passphrase</Text>
            <TextInput
              className="bg-surface border border-gray-300 rounded-lg p-4 text-text"
              placeholder="Confirm your passphrase"
              value={confirmPassphrase}
              onChangeText={setConfirmPassphrase}
              secureTextEntry={!showPassphrase}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Strength Indicator */}
          {passphrase.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-textSecondary text-sm">Strength:</Text>
                <Text className={`font-semibold capitalize ${getStrengthColor(passphraseValidation.strength)}`}>
                  {passphraseValidation.strength}
                </Text>
              </View>

              {passphraseValidation.errors.length > 0 && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                  {passphraseValidation.errors.map((error, index) => (
                    <Text key={index} className="text-red-800 text-sm">
                      • {error}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Warning */}
          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <Text className="text-yellow-800 text-sm">
              ⚠️ Store this passphrase securely. You cannot recover your wallet without it.
              Never share it with anyone.
            </Text>
          </View>
        </View>

        <Button
          title={loading ? "Creating Backup..." : "Create Backup"}
          onPress={handleCreateBackup}
          disabled={loading || !passphraseValidation.isValid || passphrase !== confirmPassphrase}
          className="w-full"
        />
      </View>
    </SafeAreaView>
  );
}