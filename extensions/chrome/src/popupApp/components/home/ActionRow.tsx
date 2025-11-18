/**
 * ActionRow Component - Phantom-grade action buttons (Extension)
 * Platform-specific implementation using shared logic
 * Height: 90px fixed
 */

import React from 'react';
import { DumpSackTheme, useActionRow, ActionRowProps, Action } from '@dumpsack/shared-ui';

function ActionButton({ icon, label, onPress }: Action) {
  return (
    <button
      onClick={onPress}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${DumpSackTheme.spacing.md}px 0`,
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        backgroundColor: DumpSackTheme.colors.surface,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: DumpSackTheme.spacing.sm,
      }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
      </div>
      <span style={{
        color: DumpSackTheme.colors.text,
        fontSize: DumpSackTheme.typography.fontSize.xs,
        fontWeight: DumpSackTheme.typography.fontWeight.semibold,
      }}>{label}</span>
    </button>
  );
}

export function ActionRow(props: ActionRowProps) {
  const data = useActionRow(props);

  return (
    <div style={{
      height: '90px',
      padding: `0 ${DumpSackTheme.spacing.md}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: DumpSackTheme.colors.background,
      borderBottom: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
    }}>
      {data.actions.map((action, index) => (
        <ActionButton key={index} {...action} />
      ))}
    </div>
  );
}

// Re-export props type
export type { ActionRowProps };

