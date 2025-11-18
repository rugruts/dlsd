/**
 * ActionRow Component - Phantom-grade action buttons
 * 4 equal-width buttons: Receive | Send | Swap | Backup
 * Height: 90px fixed
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
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

interface ActionRowProps {
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
  onBackup: () => void;
}

export function ActionRow({
  onReceive,
  onSend,
  onSwap,
  onBackup,
}: ActionRowProps) {
  return (
    <View className="h-[90px] px-4 flex-row items-center justify-between bg-background border-b border-border">
      <ActionButton icon="📥" label="Receive" onPress={onReceive} />
      <ActionButton icon="📤" label="Send" onPress={onSend} />
      <ActionButton icon="🔄" label="Swap" onPress={onSwap} />
      <ActionButton icon="💾" label="Backup" onPress={onBackup} />
    </View>
  );
}

