import React from 'react';
import { View, Text } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function NetworkStatusBanner() {
  const { isConnected, rpcHealthy, isOnline } = useNetworkStatus();

  if (isOnline) return null;

  const getMessage = () => {
    if (!isConnected) {
      return 'No internet connection. Some features may be unavailable.';
    }
    if (!rpcHealthy) {
      return 'Blockchain network is experiencing issues. Transactions may be delayed.';
    }
    return '';
  };

  const getStyle = () => {
    if (!isConnected) {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-yellow-50 border-yellow-200';
  };

  const getTextStyle = () => {
    if (!isConnected) {
      return 'text-red-800';
    }
    return 'text-yellow-800';
  };

  return (
    <View className={`border px-4 py-2 ${getStyle()}`}>
      <Text className={`text-sm text-center ${getTextStyle()}`}>
        {getMessage()}
      </Text>
    </View>
  );
}