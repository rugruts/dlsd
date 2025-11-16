import React from 'react';
import { View, Text, ActivityIndicator, Modal } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible}>
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-surface rounded-lg p-6 items-center min-w-48">
          <ActivityIndicator size="large" color="#ff6b35" className="mb-4" />
          <Text className="text-text text-center">{message}</Text>
        </View>
      </View>
    </Modal>
  );
}