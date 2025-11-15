import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export function ListItem({ title, subtitle, rightText, onPress, icon }: ListItemProps) {
  const content = (
    <View className="flex-row items-center py-3">
      {icon && <View className="mr-3">{icon}</View>}
      <View className="flex-1">
        <Text className="text-text text-base font-medium">{title}</Text>
        {subtitle && <Text className="text-textSecondary text-sm">{subtitle}</Text>}
      </View>
      {rightText && <Text className="text-textSecondary text-sm">{rightText}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}