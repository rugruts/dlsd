import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { useAuthStore } from '../../state/authStore';
import { Button } from '../../components/Button';

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const { signInWithProvider } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);

  const handleProviderSignIn = async (provider: 'google' | 'apple' | 'x') => {
    setLoading(provider);
    try {
      await signInWithProvider(provider);
      // On success, navigate to alias screen
      navigation.navigate('Alias');
    } catch (error) {
      console.error('Sign in failed:', error);
      Alert.alert('Sign In Failed', 'Please try again or contact support.');
    } finally {
      setLoading(null);
    }
  };

  const handleDevSkip = async () => {
    // For development: create a test wallet directly
    setLoading('dev');
    try {
      await signInWithProvider('google'); // Use mock Google sign-in
      navigation.navigate('Alias');
    } catch (error) {
      console.error('Dev skip failed:', error);
      Alert.alert('Error', 'Failed to create wallet');
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-text text-2xl font-bold text-center mb-4">
            Sign In
          </Text>
          <Text className="text-textSecondary text-center">
            Choose your preferred sign-in method
          </Text>
        </View>

        <View className="space-y-4">
          <Button
            title={loading === 'google' ? 'Signing in...' : 'Continue with Google'}
            onPress={() => handleProviderSignIn('google')}
            disabled={!!loading}
            className="w-full"
          />

          <Button
            title={loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
            onPress={() => handleProviderSignIn('apple')}
            disabled={!!loading}
            className="w-full"
          />

          <Button
            title={loading === 'x' ? 'Signing in...' : 'Continue with X (Twitter)'}
            onPress={() => handleProviderSignIn('x')}
            disabled={!!loading}
            className="w-full"
          />

          {/* Development toggle */}
          {__DEV__ && (
            <Button
              title="Skip OAuth (Dev)"
              onPress={handleDevSkip}
              variant="secondary"
              className="w-full mt-8"
            />
          )}
        </View>

        <View className="mt-8">
          <Text className="text-textSecondary text-sm text-center">
            Your data is encrypted and secure
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}