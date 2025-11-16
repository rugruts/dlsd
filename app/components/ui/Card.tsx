import React from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
}

export function Card({ children, onPress, className = '', style }: CardProps) {
  const baseClasses = 'bg-surface rounded-lg p-4 shadow-sm';
  const combinedClasses = `${baseClasses} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} className={combinedClasses} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedClasses} style={style}>
      {children}
    </View>
  );
}