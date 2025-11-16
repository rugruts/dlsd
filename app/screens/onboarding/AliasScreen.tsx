import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, TextInput, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useAuthStore } from '../../state/authStore';
import { isAliasAvailable, registerAlias } from '../../services/auth/aliasService';
import { Button } from '../../components/Button';

export default function AliasScreen() {
  const navigation = useAppNavigation();
  const { createAlias, userId, publicKey } = useAuthStore();
  const [alias, setAlias] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounced availability check
  useEffect(() => {
    if (alias.length < 3) {
      setAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setChecking(true);
      try {
        const isAvailable = await isAliasAvailable(alias);
        setAvailable(isAvailable);
      } catch (error) {
        console.error('Availability check failed:', error);
        setAvailable(null);
      } finally {
        setChecking(false);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [alias]);

  const handleContinue = async () => {
    if (!available || !userId || !publicKey) {
      Alert.alert('Error', 'Please choose an available alias.');
      return;
    }

    setLoading(true);
    try {
      // Register alias
      await registerAlias(alias, publicKey, userId);

      // Update auth store
      await createAlias(alias);

      // Navigate to main app
      navigation.navigate('MainTabs');
    } catch (error) {
      console.error('Alias registration failed:', error);
      Alert.alert('Registration Failed', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (checking) return 'Checking...';
    if (available === true) return 'Available ✓';
    if (available === false) return 'Taken ✗';
    return '';
  };

  const getStatusColor = () => {
    if (available === true) return 'text-green-500';
    if (available === false) return 'text-red-500';
    return 'text-textSecondary';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-text text-2xl font-bold text-center mb-4">
            Choose Your Alias
          </Text>
          <Text className="text-textSecondary text-center">
            This will be your unique identifier on the network
          </Text>
        </View>

        <View className="mb-8">
          <Text className="text-textSecondary text-sm mb-2">Alias</Text>
          <View className="flex-row items-center">
            <Text className="text-text text-lg mr-2">@</Text>
            <TextInput
              className="flex-1 bg-surface border border-gray-300 rounded-lg p-4 text-text"
              placeholder="youralias"
              value={alias}
              onChangeText={setAlias}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>
          {alias.length >= 3 && (
            <Text className={`text-sm mt-2 ${getStatusColor()}`}>
              {getStatusText()}
            </Text>
          )}
        </View>

        <View className="space-y-4">
          <Button
            title={loading ? 'Setting up...' : 'Continue'}
            onPress={handleContinue}
            disabled={!available || loading}
            className="w-full"
          />
        </View>

        <View className="mt-8">
          <Text className="text-textSecondary text-xs text-center">
            Aliases are unique and cannot be changed later
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}