import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore, AuthProvider } from '../services/auth/authStore';
import { AuthService } from '../services/auth/authService';
import { Button } from '../components/Button';

export default function LoginScreen() {
  const [loading, setLoading] = useState<AuthProvider | null>(null);
  const { login, setPublicKey, setHasWallet } = useAuthStore();
  const navigation = useNavigation();

  const handleOAuthLogin = async (provider: AuthProvider) => {
    setLoading(provider);
    try {
      const { userId, keypair } = await AuthService.signInWithProvider(provider);
      login(userId, provider);
      setPublicKey(keypair.publicKey.toBase58());
      setHasWallet(true);
      // TODO: Navigate to onboarding or dashboard
      Alert.alert('Success', 'Logged in successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center justify-center p-4 pt-20">
        <Text className="text-text text-3xl font-bold mb-8">DumpSack Wallet</Text>
        <Text className="text-textSecondary text-center mb-8">
          Sign in with your preferred provider for zkLogin
        </Text>

        <Button
          title={loading === 'google' ? 'Signing in...' : 'Continue with Google'}
          onPress={() => handleOAuthLogin('google')}
          variant="primary"
        />
        <View className="h-4" />
        <Button
          title={loading === 'apple' ? 'Signing in...' : 'Continue with Apple'}
          onPress={() => handleOAuthLogin('apple')}
          variant="secondary"
        />
        <View className="h-4" />
        <Button
          title={loading === 'x' ? 'Signing in...' : 'Continue with X (Twitter)'}
          onPress={() => handleOAuthLogin('x')}
          variant="secondary"
        />

        <Text className="text-textSecondary text-center mt-8 mb-4">Or</Text>
        <Button
          title="Import Existing Wallet"
          onPress={() => navigation.navigate('ImportWallet' as never)}
          variant="secondary"
        />
      </View>
    </ScrollView>
  );
}