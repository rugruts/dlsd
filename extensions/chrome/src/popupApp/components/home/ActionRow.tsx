/**
 * ActionRow Component - Phantom-grade action buttons (Extension)
 * 4 equal-width buttons: Receive | Send | Swap | Backup
 * Height: 90px fixed
 */

import React from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
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
    <div style={{
      height: '90px',
      padding: `0 ${DumpSackTheme.spacing.md}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: DumpSackTheme.colors.background,
      borderBottom: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
    }}>
      <ActionButton icon="📥" label="Receive" onPress={onReceive} />
      <ActionButton icon="📤" label="Send" onPress={onSend} />
      <ActionButton icon="🔄" label="Swap" onPress={onSwap} />
      <ActionButton icon="💾" label="Backup" onPress={onBackup} />
    </div>
  );
}

