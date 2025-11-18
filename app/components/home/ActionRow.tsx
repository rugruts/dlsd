/**
 * ActionRow Component - Phantom-grade action buttons (Mobile)
 * Platform-specific implementation using shared logic
 * Height: 90px fixed
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useActionRow, ActionRowProps, Action } from '@dumpsack/shared-ui';

function ActionButton({ icon, label, onPress }: Action) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center py-4"
    >
      <View className="w-12 h-12 bg-surface rounded-full items-center justify-center mb-2">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <Text className="text-text text-xs font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}

export function ActionRow(props: ActionRowProps) {
  const data = useActionRow(props);

  return (
    <View className="h-[90px] px-4 flex-row items-center justify-between bg-background border-b border-border">
      {data.actions.map((action, index) => (
        <ActionButton key={index} {...action} />
      ))}
    </View>
  );
}

// Re-export props type
export type { ActionRowProps };

