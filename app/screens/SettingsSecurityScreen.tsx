import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useSecurityStore } from '../state/securityStore';
import { biometricsService } from '../services/security/biometricsService';
import { ledgerService } from '../services/security/ledgerService';
import { ScreenContainer } from '../components/ui/ScreenContainer';
import { Button } from '../components/Button';

export default function SettingsSecurityScreen() {
  const {
    biometricsEnabled,
    requireBiometricsForSend,
    requireBiometricsForSwap,
    requireBiometricsForStaking,
    ledgerConnected,
    ledgerDeviceName,
    setBiometricsEnabled,
    setRequireBiometricsForSend,
    setRequireBiometricsForSwap,
    setRequireBiometricsForStaking,
    setLedgerConnected,
  } = useSecurityStore();

  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [connectingLedger, setConnectingLedger] = useState(false);

  useEffect(() => {
    checkBiometricsAvailability();
  }, []);

  const checkBiometricsAvailability = async () => {
    const available = await biometricsService.isBiometricsAvailable();
    setBiometricsAvailable(available);
  };

  const handleBiometricsToggle = async (enabled: boolean) => {
    if (enabled && !biometricsAvailable) {
      Alert.alert('Biometrics Unavailable', 'Biometric authentication is not available on this device.');
      return;
    }

    if (enabled) {
      const success = await biometricsService.requireBiometricAuth('Enable biometric authentication');
      if (!success) {
        Alert.alert('Authentication Failed', 'Biometric authentication setup failed.');
        return;
      }
    }

    setBiometricsEnabled(enabled);
  };

  const handleConnectLedger = async () => {
    setConnectingLedger(true);
    try {
      const devices = await ledgerService.scanForDevices();

      if (devices.length === 0) {
        Alert.alert('No Devices Found', 'No Ledger devices found. Make sure your device is in pairing mode.');
        return;
      }

      // For simplicity, connect to the first device
      const device = devices[0];
      const connected = await ledgerService.connectLedger(device.id);

      if (connected) {
        setLedgerConnected(true, device.name);
        Alert.alert('Success', `Connected to ${device.name}`);
      } else {
        Alert.alert('Connection Failed', 'Failed to connect to Ledger device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan for Ledger devices.');
    } finally {
      setConnectingLedger(false);
    }
  };

  const handleDisconnectLedger = async () => {
    try {
      await ledgerService.disconnectLedger();
      setLedgerConnected(false);
      Alert.alert('Success', 'Ledger device disconnected.');
    } catch (error) {
      Alert.alert('Error', 'Failed to disconnect Ledger device.');
    }
  };

  return (
    <ScreenContainer>
      <Text className="text-text text-2xl font-bold mb-6">Security Settings</Text>

      {/* Biometrics Section */}
      <View className="mb-6">
        <Text className="text-textSecondary text-lg font-semibold mb-4">Biometric Authentication</Text>

        <View className="bg-surface p-4 rounded-lg mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text">Enable Biometrics</Text>
            <TouchableOpacity
              onPress={() => handleBiometricsToggle(!biometricsEnabled)}
              className={`w-12 h-6 rounded-full p-1 ${
                biometricsEnabled ? 'bg-primary' : 'bg-gray-400'
              }`}
            >
              <View
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  biometricsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </TouchableOpacity>
          </View>

          {!biometricsAvailable && (
            <Text className="text-error text-sm mb-3">
              Biometric authentication is not available on this device.
            </Text>
          )}

          {biometricsEnabled && (
            <>
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-text">Require for Send</Text>
                <TouchableOpacity
                  onPress={() => setRequireBiometricsForSend(!requireBiometricsForSend)}
                  className={`w-12 h-6 rounded-full p-1 ${
                    requireBiometricsForSend ? 'bg-primary' : 'bg-gray-400'
                  }`}
                >
                  <View
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      requireBiometricsForSend ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-text">Require for Swap</Text>
                <TouchableOpacity
                  onPress={() => setRequireBiometricsForSwap(!requireBiometricsForSwap)}
                  className={`w-12 h-6 rounded-full p-1 ${
                    requireBiometricsForSwap ? 'bg-primary' : 'bg-gray-400'
                  }`}
                >
                  <View
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      requireBiometricsForSwap ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-text">Require for Staking</Text>
                <TouchableOpacity
                  onPress={() => setRequireBiometricsForStaking(!requireBiometricsForStaking)}
                  className={`w-12 h-6 rounded-full p-1 ${
                    requireBiometricsForStaking ? 'bg-primary' : 'bg-gray-400'
                  }`}
                >
                  <View
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      requireBiometricsForStaking ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Ledger Section */}
      <View className="mb-6">
        <Text className="text-textSecondary text-lg font-semibold mb-4">Hardware Wallet</Text>

        <View className="bg-surface p-4 rounded-lg">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-text">Ledger Device</Text>
            <View className="flex-row items-center">
              {ledgerConnected && (
                <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
              )}
              <Text className={`text-sm ${ledgerConnected ? 'text-green-500' : 'text-textSecondary'}`}>
                {ledgerConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          {ledgerConnected && ledgerDeviceName && (
            <Text className="text-textSecondary text-sm mb-3">
              Device: {ledgerDeviceName}
            </Text>
          )}

          {!ledgerConnected ? (
            <Button
              title={connectingLedger ? "Scanning..." : "Connect Ledger"}
              onPress={handleConnectLedger}
              disabled={connectingLedger}
            />
          ) : (
            <Button
              title="Disconnect Ledger"
              onPress={handleDisconnectLedger}
              variant="secondary"
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}