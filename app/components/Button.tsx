import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export function Button({ title, onPress, variant = 'primary', disabled = false, className = '' }: ButtonProps) {
  const baseClasses = 'px-4 py-2 rounded';
  const variantClasses = variant === 'primary' ? 'bg-primary' : 'bg-secondary';
  const disabledClasses = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      className={`${baseClasses} ${variantClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
    >
      <Text className="text-text text-center">{title}</Text>
    </TouchableOpacity>
  );
}