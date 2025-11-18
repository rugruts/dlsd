/**
 * TopBar Component - Phantom-grade compact header (Extension)
 * Shows: Logo, Account switcher, Network, Settings
 * Height: 60px fixed
 */

import React from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { truncatePublicKey } from '@dumpsack/shared-types';

interface TopBarProps {
  walletName: string;
  walletAddress: string;
  network: string;
  onAccountPress: () => void;
  onSettingsPress: () => void;
}

export function TopBar({
  walletName,
  walletAddress,
  network,
  onAccountPress,
  onSettingsPress,
}: TopBarProps) {
  return (
    <div style={{
      height: '60px',
      padding: `0 ${DumpSackTheme.spacing.md}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: DumpSackTheme.colors.background,
      borderBottom: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.sm }}>
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: DumpSackTheme.colors.primary,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            color: DumpSackTheme.colors.background,
            fontWeight: DumpSackTheme.typography.fontWeight.bold,
            fontSize: DumpSackTheme.typography.fontSize.sm,
          }}>DS</span>
        </div>
        <span style={{
          color: DumpSackTheme.colors.text,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          fontSize: DumpSackTheme.typography.fontSize.base,
        }}>DumpSack</span>
      </div>

      {/* Account Switcher */}
      <button
        onClick={onAccountPress}
        style={{
          flex: 1,
          margin: `0 ${DumpSackTheme.spacing.md}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: DumpSackTheme.colors.surface,
          borderRadius: DumpSackTheme.borderRadius.md,
          padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.sm}px`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
          cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            color: DumpSackTheme.colors.text,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            fontSize: DumpSackTheme.typography.fontSize.sm,
          }}>{walletName}</div>
          <div style={{
            color: DumpSackTheme.colors.textSecondary,
            fontSize: DumpSackTheme.typography.fontSize.xs,
          }}>{truncatePublicKey(walletAddress)}</div>
        </div>
        <span style={{ color: DumpSackTheme.colors.textSecondary, marginLeft: DumpSackTheme.spacing.xs }}>▼</span>
      </button>

      {/* Network + Settings */}
      <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.xs }}>
        <div style={{
          backgroundColor: `${DumpSackTheme.colors.success}33`,
          padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.sm}px`,
          borderRadius: DumpSackTheme.borderRadius.sm,
        }}>
          <span style={{
            color: DumpSackTheme.colors.success,
            fontSize: DumpSackTheme.typography.fontSize.xs,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          }}>{network}</span>
        </div>
        <button
          onClick={onSettingsPress}
          style={{
            padding: DumpSackTheme.spacing.xs,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: DumpSackTheme.typography.fontSize.lg,
          }}
        >⚙️</button>
      </div>
    </div>
  );
}

