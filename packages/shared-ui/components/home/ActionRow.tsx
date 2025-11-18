/**
 * ActionRow Component - Phantom-grade action buttons
 * Platform-agnostic: Works for both React Native (mobile) and React (extension)
 * Height: 90px fixed
 */

import React from 'react';

export interface ActionRowProps {
  onReceive: () => void;
  onSend: () => void;
  onSwap: () => void;
  onBackup: () => void;
}

export interface Action {
  icon: string;
  label: string;
  onPress: () => void;
}

/**
 * Platform-agnostic ActionRow logic
 * Returns action definitions for platform-specific rendering
 */
export function useActionRow(props: ActionRowProps) {
  const { onReceive, onSend, onSwap, onBackup } = props;

  const actions: Action[] = [
    {
      icon: '📥',
      label: 'Receive',
      onPress: onReceive,
    },
    {
      icon: '📤',
      label: 'Send',
      onPress: onSend,
    },
    {
      icon: '🔄',
      label: 'Swap',
      onPress: onSwap,
    },
    {
      icon: '💾',
      label: 'Backup',
      onPress: onBackup,
    },
  ];

  return { actions };
}

// Export type for platform implementations
export type ActionRowData = ReturnType<typeof useActionRow>;

