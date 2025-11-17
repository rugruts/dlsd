/**
 * DumpSack Wallet - Staking View
 * Staking interface (coming soon)
 */

import React from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';

interface StakingProps {
  enabled: boolean;
}

export function Staking({ enabled }: StakingProps) {
  if (!enabled) {
    return (
      <div style={{
        padding: DumpSackTheme.spacing.lg,
        textAlign: 'center',
        backgroundColor: DumpSackTheme.colors.background,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <polyline points="17 5 12 1 7 5" />
          <polyline points="7 19 12 23 17 19" />
        </svg>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
          marginTop: DumpSackTheme.spacing.lg,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Staking Coming Soon
        </h2>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          This feature is currently disabled
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: DumpSackTheme.spacing.lg,
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100%',
    }}>
      <h1 style={{
        fontSize: DumpSackTheme.typography.fontSize.xl,
        fontWeight: DumpSackTheme.typography.fontWeight.bold,
        color: DumpSackTheme.colors.text,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        Staking
      </h1>

      <div style={{
        textAlign: 'center',
        paddingTop: DumpSackTheme.spacing.xxl,
        paddingBottom: DumpSackTheme.spacing.xxl,
      }}>
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <line x1="12" y1="1" x2="12" y2="23" />
          <polyline points="17 5 12 1 7 5" />
          <polyline points="7 19 12 23 17 19" />
        </svg>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
          marginTop: DumpSackTheme.spacing.lg,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Staking Feature
        </h2>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Stake your GOR tokens to earn rewards
        </p>
      </div>
    </div>
  );
}

