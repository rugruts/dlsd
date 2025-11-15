import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const baseClasses = 'bg-surface rounded-lg p-4 shadow-sm';
  const combinedClasses = `${baseClasses} ${className}`;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} className={combinedClasses}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={combinedClasses}>
      {children}
    </View>
  );
}