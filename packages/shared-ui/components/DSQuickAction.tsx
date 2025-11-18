/**
 * DSQuickAction - Quick Action Button
 * Spec: Section 3.6
 * Size: 72×72
 * Background: backgroundElevated
 * Icon size: 28px
 * Label: small text
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export interface DSQuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function DSQuickAction({ icon, label, onClick, disabled = false }: DSQuickActionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 72,
        height: 72,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: DumpSackTheme.spacing.xs,
        backgroundColor: DumpSackTheme.colors.backgroundElevated,
        borderRadius: DumpSackTheme.borderRadius.md,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = '0.9';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.opacity = '1';
        }
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <span
        style={{
          fontSize: DumpSackTheme.typography.small.fontSize,
          fontWeight: DumpSackTheme.typography.small.fontWeight,
          color: DumpSackTheme.colors.textPrimary,
        }}
      >
        {label}
      </span>
    </button>
  );
}

