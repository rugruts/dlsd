import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded';
  const variantClasses = variant === 'primary' ? 'bg-primary' : 'bg-secondary';

  return (
    <TouchableOpacity onPress={onPress} className={`${baseClasses} ${variantClasses}`}>
      <Text className="text-text text-center">{title}</Text>
    </TouchableOpacity>
  );
}