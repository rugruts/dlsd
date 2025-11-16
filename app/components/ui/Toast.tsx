import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { UserError } from '@dumpsack/shared-utils';

interface ToastProps {
  error: UserError | null;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ error, onDismiss, duration = 5000 }: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (error) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after duration
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!error) return null;

  return (
    <Animated.View
      className="absolute top-12 left-4 right-4 z-50"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-red-800 font-semibold text-sm mb-1">
              {error.title}
            </Text>
            <Text className="text-red-700 text-sm">
              {error.message}
            </Text>
            {error.action && (
              <TouchableOpacity
                className="mt-2 bg-red-600 px-3 py-1 rounded"
                onPress={() => {
                  error.action!.onPress();
                  handleDismiss();
                }}
              >
                <Text className="text-white text-xs font-semibold">
                  {error.action.label}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            className="w-6 h-6 justify-center items-center"
            onPress={handleDismiss}
          >
            <Text className="text-red-600 text-lg">×</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

// Toast manager hook
export function useToast() {
  const [currentError, setCurrentError] = useState<UserError | null>(null);

  const showError = (error: UserError) => {
    setCurrentError(error);
  };

  const dismissError = () => {
    setCurrentError(null);
  };

  return {
    toast: <Toast error={currentError} onDismiss={dismissError} />,
    showError,
    dismissError,
  };
}