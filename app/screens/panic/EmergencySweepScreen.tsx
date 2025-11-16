import React, { useState } from 'react';
import { View, Text, SafeAreaView, Alert } from 'react-native';
import { useAppNavigation } from '../../navigation/hooks';
import { usePanicStore } from '../../state/panicStore';
import { Button } from '../../components/Button';

export default function EmergencySweepScreen() {
  const navigation = useAppNavigation();
  const { safeAddress, runEmergencySweep, loading } = usePanicStore();

  const [includeTokens, setIncludeTokens] = useState(false);

  const handleEmergencySweep = async () => {
    if (!safeAddress) {
      Alert.alert('Error', 'Safe address not configured');
      return;
    }

    Alert.alert(
      'FINAL WARNING',
      'This will transfer ALL your funds to the safe address. This action cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'I UNDERSTAND - SWEEP ALL FUNDS',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await runEmergencySweep({
                safeAddress,
                includeTokens,
              });

              Alert.alert(
                'Emergency Sweep Complete',
                `Successfully swept ${result.sweptAmount} lamports to ${safeAddress.slice(0, 8)}...${safeAddress.slice(-8)}`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('PanicBunkerDashboard'),
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Emergency sweep failed');
            }
          },
        },
      ]
    );
  };

  if (!safeAddress) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-text text-xl font-bold text-center mb-4">
            Safe Address Required
          </Text>
          <Text className="text-textSecondary text-center mb-8">
            You must configure a safe address before using emergency sweep.
          </Text>
          <Button
            title="Go to Settings"
            onPress={() => navigation.navigate('PanicSettingsScreen')}
            className="w-full"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-text text-2xl font-bold">Emergency Sweep</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-textSecondary text-lg">✕</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1">
          <View className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <Text className="text-red-800 font-bold text-lg mb-2">⚠️ EMERGENCY ACTION</Text>
            <Text className="text-red-800 text-sm">
              This will transfer ALL your GOR tokens and optionally all SPL tokens to your safe address.
              This action is irreversible and cannot be undone.
            </Text>
          </View>

          <View className="bg-surface rounded-lg p-6 mb-6">
            <Text className="text-text font-semibold mb-4">Sweep Details</Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-textSecondary">Destination</Text>
                <Text className="text-text font-mono text-sm">
                  {safeAddress.slice(0, 8)}...{safeAddress.slice(-8)}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-textSecondary">Include SPL Tokens</Text>
                <TouchableOpacity
                  className={`w-6 h-6 rounded border-2 justify-center items-center ${
                    includeTokens ? 'bg-red-500 border-red-500' : 'border-gray-300'
                  }`}
                  onPress={() => setIncludeTokens(!includeTokens)}
                >
                  {includeTokens && <Text className="text-white text-xs">✓</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <Text className="text-yellow-800 text-sm">
              💡 Emergency sweep is designed for critical situations where you need to quickly secure your funds.
              Make sure your safe address is secure and under your control.
            </Text>
          </View>
        </View>

        <Button
          title={loading ? "Sweeping..." : "EXECUTE EMERGENCY SWEEP"}
          onPress={handleEmergencySweep}
          disabled={loading}
          className="w-full bg-red-600"
        />
      </View>
    </SafeAreaView>
  );
}