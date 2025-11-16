import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { Button } from '../../components/Button';

export default function BackupRestoreSuccessScreen() {
  const navigation = useAppNavigation();

  const handleContinue = () => {
    // Navigate to the main app, clearing the backup flow
    navigation.popToTop();
    // The app should automatically reload the wallet state
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-green-50 border border-green-200 rounded-full w-20 h-20 justify-center items-center mb-6">
          <Text className="text-green-600 text-3xl">✓</Text>
        </View>

        <Text className="text-text text-2xl font-bold text-center mb-2">
          Wallet Restored Successfully!
        </Text>

        <Text className="text-textSecondary text-center mb-8">
          Your wallet has been restored from the backup. All your accounts and settings have been recovered.
        </Text>

        <View className="bg-surface rounded-lg p-6 w-full mb-8">
          <Text className="text-text font-semibold mb-2">What was restored:</Text>
          <Text className="text-textSecondary text-sm">
            • Private keys and wallet data{'\n'}
            • Account balances and transaction history{'\n'}
            • App settings and preferences{'\n'}
            • Staking positions and delegations
          </Text>
        </View>

        <View className="w-full space-y-4">
          <Button
            title="Continue to Wallet"
            onPress={handleContinue}
            className="w-full"
          />

          <Button
            title="View Backup Settings"
            onPress={() => navigation.navigate('BackupDashboard')}
            variant="secondary"
            className="w-full"
          />
        </View>

        <View className="mt-8">
          <Text className="text-textSecondary text-sm text-center">
            Keep your backup file and passphrase secure for future restores.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}