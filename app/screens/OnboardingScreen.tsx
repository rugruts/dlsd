import React, { useState } from 'react';
import { View, Text, TextInput, Alert } from 'react-native';
import { useAuthStore } from '../services/auth/authStore';
import * as aliasService from '../services/auth/aliasService';
import { Button } from '../components/Button';

export default function OnboardingScreen() {
  const [alias, setAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId, setAlias: setStoreAlias } = useAuthStore();

  const handleCreateAlias = async () => {
    if (!alias.trim()) {
      Alert.alert('Error', 'Please enter an alias');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'No user ID found');
      return;
    }

    setLoading(true);
    try {
      // TODO: Get actual wallet address
      const address = 'placeholder_address';
      await aliasService.registerAlias(alias.trim(), address, userId);
      setStoreAlias(alias.trim());
      Alert.alert('Success', 'Alias created successfully!');
      // TODO: Navigate to next screen
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create alias');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center p-4">
      <Text className="text-text text-2xl font-bold mb-8">Welcome to DumpSack Wallet</Text>
      <Text className="text-textSecondary text-center mb-6">
        Create your unique @alias for easy sending and receiving
      </Text>
      <TextInput
        className="w-full bg-surface text-text p-4 rounded mb-4"
        placeholder="Enter your alias (e.g., myname)"
        placeholderTextColor="#cccccc"
        value={alias}
        onChangeText={setAlias}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        title={loading ? 'Creating...' : 'Create Alias'}
        onPress={handleCreateAlias}
        variant="primary"
      />
    </View>
  );
}