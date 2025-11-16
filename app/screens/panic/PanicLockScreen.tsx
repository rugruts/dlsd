import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { usePanicStore } from '../../state/panicStore';
import { Button } from '../../components/Button';

export default function PanicLockScreen() {
  const navigation = useAppNavigation();
  const { unlockBiometric, unlockPassphrase, loading, error } = usePanicStore();

  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleBiometricUnlock = async () => {
    const success = await unlockBiometric();
    if (success) {
      navigation.goBack();
    }
  };

  const handlePassphraseUnlock = async () => {
    if (!passphrase) {
      Alert.alert('Error', 'Please enter your passphrase');
      return;
    }

    const success = await unlockPassphrase(passphrase);
    if (success) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Invalid passphrase');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-red-50 border border-red-200 rounded-full w-20 h-20 justify-center items-center mb-6">
          <Text className="text-red-600 text-3xl">🔒</Text>
        </View>

        <Text className="text-text text-2xl font-bold text-center mb-2">
          Wallet Locked
        </Text>

        <Text className="text-textSecondary text-center mb-8">
          Your wallet is protected by Panic Bunker. Authenticate to unlock.
        </Text>

        {error && (
          <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 w-full">
            <Text className="text-red-800 text-sm">{error}</Text>
          </View>
        )}

        <View className="w-full space-y-4">
          <Button
            title="Unlock with Biometrics"
            onPress={handleBiometricUnlock}
            disabled={loading}
            className="w-full"
          />

          <View className="flex-row items-center">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-textSecondary text-sm">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          <View className="space-y-4">
            <TextInput
              className="bg-surface border border-gray-300 rounded-lg p-4 text-text"
              placeholder="Enter unlock passphrase"
              value={passphrase}
              onChangeText={setPassphrase}
              secureTextEntry={!showPassphrase}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="Unlock with Passphrase"
              onPress={handlePassphraseUnlock}
              variant="secondary"
              disabled={loading || !passphrase}
              className="w-full"
            />
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-textSecondary text-sm text-center">
            Panic Bunker prevents all signing operations when active.
            Only authenticate with your own credentials.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}