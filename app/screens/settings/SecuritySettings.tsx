/**
 * SecuritySettings Component
 * Biometrics, auth requirements, Panic Bunker
 */

import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSecurityStore } from '../../state/securityStore';

export function SecuritySettings() {
  const navigation = useNavigation();
  const { biometricsEnabled, requireBiometricsForSend, setBiometricsEnabled, setRequireBiometricsForSend } =
    useSecurityStore();

  const handleOpenPanicBunker = () => {
    // @ts-ignore - navigation type
    navigation.navigate('PanicBunkerDashboard');
  };

  return (
    <View className="p-4">
      {/* Biometrics */}
      <View className="bg-card rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl mr-2">🔐</Text>
              <Text className="text-text-primary text-base font-semibold">
                Use Biometrics
              </Text>
            </View>
            <Text className="text-text-secondary text-sm">
              Use fingerprint or face recognition for approvals
            </Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: '#3e3e3e', true: '#F26A2E' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Require Auth for Send */}
      <View className="bg-card rounded-xl p-4 mb-3 border border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-4">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl mr-2">🛡️</Text>
              <Text className="text-text-primary text-base font-semibold">
                Require Auth to Send
              </Text>
            </View>
            <Text className="text-text-secondary text-sm">
              Require biometric or passcode before sending transactions
            </Text>
          </View>
          <Switch
            value={requireBiometricsForSend}
            onValueChange={setRequireBiometricsForSend}
            trackColor={{ false: '#3e3e3e', true: '#F26A2E' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Panic Bunker */}
      <TouchableOpacity
        onPress={handleOpenPanicBunker}
        className="bg-card rounded-xl p-4 mb-3 border border-border"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-xl mr-2">⚠️</Text>
              <Text className="text-text-primary text-base font-semibold">
                Panic Bunker
              </Text>
            </View>
            <Text className="text-text-secondary text-sm">
              Emergency wallet protection and recovery
            </Text>
          </View>
          <Text className="text-text-secondary text-lg">→</Text>
        </View>
      </TouchableOpacity>

      {/* Info */}
      <View className="bg-card p-4 rounded-xl border border-border mt-4">
        <Text className="text-text-secondary text-sm">
          Security settings help protect your wallet from unauthorized access. Enable biometrics
          and require authentication for sensitive operations.
        </Text>
      </View>
    </View>
  );
}

