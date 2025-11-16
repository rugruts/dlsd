import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { Button } from '../../components/Button';

export default function OnboardingScreen() {
  const navigation = useAppNavigation();

  const handleContinueWithProvider = () => {
    navigation.navigate('Login');
  };

  const handleImportWallet = () => {
    navigation.navigate('ImportWallet');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 justify-center">
        <View className="items-center mb-12">
          <Text className="text-text text-3xl font-bold text-center mb-4">
            Welcome to DumpSack
          </Text>
          <Text className="text-textSecondary text-lg text-center">
            Your secure wallet for the Gorbagana blockchain
          </Text>
        </View>

        <View className="space-y-4">
          <Button
            title="Continue with Google/Apple/X"
            onPress={handleContinueWithProvider}
            className="w-full"
          />

          <Button
            title="Import using Secret Phrase"
            onPress={handleImportWallet}
            variant="secondary"
            className="w-full"
          />
        </View>

        <View className="mt-8">
          <Text className="text-textSecondary text-sm text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}