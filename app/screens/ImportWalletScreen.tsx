import React, { useState } from 'react';
import { View, Text, TextInput, Alert, ScrollView } from 'react-native';
import { useAuthStore } from '../services/auth/authStore';
import { MnemonicService } from '../services/auth/mnemonicService';
import { Button } from '../components/Button';

export default function ImportWalletScreen() {
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId, setPublicKey, setHasWallet, setAuthProvider } = useAuthStore();

  const handleImport = async () => {
    if (!mnemonic.trim()) {
      Alert.alert('Error', 'Please enter your mnemonic phrase');
      return;
    }

    if (!MnemonicService.validateMnemonic(mnemonic.trim())) {
      Alert.alert('Error', 'Invalid mnemonic phrase');
      return;
    }

    if (!userId) {
      // For mnemonic import, we might need to create a pseudo userId
      Alert.alert('Error', 'No user session found');
      return;
    }

    setLoading(true);
    try {
      const keypair = await MnemonicService.importMnemonic(mnemonic.trim(), userId);
      setPublicKey(keypair.publicKey.toBase58());
      setHasWallet(true);
      setAuthProvider('mnemonic');
      Alert.alert('Success', 'Wallet imported successfully!');
      // TODO: Navigate to dashboard
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center justify-center p-4 pt-20">
        <Text className="text-text text-2xl font-bold mb-8">Import Existing Wallet</Text>
        <Text className="text-textSecondary text-center mb-6">
          Enter your 12 or 24-word mnemonic phrase
        </Text>
        <TextInput
          className="w-full bg-surface text-text p-4 rounded mb-4 min-h-24"
          placeholder="Enter your mnemonic phrase..."
          placeholderTextColor="#cccccc"
          value={mnemonic}
          onChangeText={setMnemonic}
          multiline
          numberOfLines={4}
          autoCapitalize="none"
          autoCorrect={false}
          textAlignVertical="top"
        />
        <Button
          title={loading ? 'Importing...' : 'Import Wallet'}
          onPress={handleImport}
          variant="primary"
        />
      </View>
    </ScrollView>
  );
}