import React, { useState } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert, ScrollView } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useAuthStore } from '../../state/authStore';
import { Button } from '../../components/Button';

export default function ImportWalletScreen() {
  const navigation = useAppNavigation();
  const { importMnemonic } = useAuthStore();
  const [mnemonic, setMnemonic] = useState('');
  const [loading, setLoading] = useState(false);
  const [derivedAddress, setDerivedAddress] = useState<string | null>(null);

  const validateMnemonic = (words: string[]): boolean => {
    // Basic validation: 12 or 24 words
    return words.length === 12 || words.length === 24;
  };

  const handlePreview = () => {
    const words = mnemonic.trim().split(/\s+/).filter(word => word.length > 0);
    if (!validateMnemonic(words)) {
      Alert.alert('Invalid Mnemonic', 'Please enter 12 or 24 words separated by spaces.');
      return;
    }

    // TODO: Actually derive address from mnemonic
    // For now, show a mock address
    setDerivedAddress('GorbaganaAddress1234567890abcdef');
  };

  const handleImport = async () => {
    if (!derivedAddress) {
      Alert.alert('Preview Required', 'Please preview your wallet first.');
      return;
    }

    setLoading(true);
    try {
      await importMnemonic(mnemonic.trim());
      navigation.navigate('Alias');
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Import Failed', 'Please check your mnemonic and try again.');
    } finally {
      setLoading(false);
    }
  };

  const words = mnemonic.trim().split(/\s+/).filter(word => word.length > 0);
  const isValidLength = validateMnemonic(words);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6">
        <View className="py-8">
          <View className="items-center mb-8">
            <Text className="text-text text-2xl font-bold text-center mb-4">
              Import Wallet
            </Text>
            <Text className="text-textSecondary text-center">
              Enter your 12 or 24-word secret recovery phrase
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-textSecondary text-sm mb-2">Recovery Phrase</Text>
            <TextInput
              className="bg-surface border border-gray-300 rounded-lg p-4 text-text min-h-[120px]"
              multiline
              numberOfLines={4}
              placeholder="Enter your recovery phrase..."
              value={mnemonic}
              onChangeText={setMnemonic}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text className="text-textSecondary text-xs mt-2">
              {words.length} words • {isValidLength ? 'Valid length' : 'Must be 12 or 24 words'}
            </Text>
          </View>

          {derivedAddress && (
            <View className="bg-surface rounded-lg p-4 mb-6">
              <Text className="text-textSecondary text-sm mb-2">Derived Address</Text>
              <Text className="text-text font-mono text-sm">{derivedAddress}</Text>
            </View>
          )}

          <View className="space-y-4">
            {!derivedAddress ? (
              <Button
                title="Preview Wallet"
                onPress={handlePreview}
                disabled={!isValidLength}
                className="w-full"
              />
            ) : (
              <>
                <Button
                  title={loading ? 'Importing...' : 'Import Wallet'}
                  onPress={handleImport}
                  disabled={loading}
                  className="w-full"
                />
                <Button
                  title="Change Phrase"
                  onPress={() => {
                    setDerivedAddress(null);
                    setMnemonic('');
                  }}
                  variant="secondary"
                  className="w-full"
                />
              </>
            )}
          </View>

          <View className="mt-8">
            <Text className="text-textSecondary text-xs text-center">
              Your recovery phrase is encrypted and stored securely on this device only.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}