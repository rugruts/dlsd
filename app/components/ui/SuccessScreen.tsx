import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { Button } from '../Button';

interface SuccessScreenProps {
  title: string;
  message: string;
  transactionHash?: string;
  onShare?: () => void;
  onDone: () => void;
  doneLabel?: string;
}

export function SuccessScreen({
  title,
  message,
  transactionHash,
  onShare,
  onDone,
  doneLabel = 'Done'
}: SuccessScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center items-center px-6">
        <View className="bg-green-50 border border-green-200 rounded-full w-20 h-20 justify-center items-center mb-6">
          <Text className="text-green-600 text-3xl">✓</Text>
        </View>

        <Text className="text-text text-2xl font-bold text-center mb-2">
          {title}
        </Text>

        <Text className="text-textSecondary text-center mb-6">
          {message}
        </Text>

        {transactionHash && (
          <View className="bg-surface rounded-lg p-4 mb-6 w-full">
            <Text className="text-textSecondary text-sm mb-2">Transaction Hash</Text>
            <Text className="text-text font-mono text-sm break-all">
              {transactionHash}
            </Text>
          </View>
        )}

        <View className="w-full space-y-4">
          {onShare && (
            <Button
              title="Share Transaction"
              onPress={onShare}
              variant="secondary"
              className="w-full"
            />
          )}

          <Button
            title={doneLabel}
            onPress={onDone}
            className="w-full"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}