/**
 * DumpSack Wallet - Swap View
 * Token swapping interface (coming soon)
 */

import React from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';

interface SwapProps {
  enabled: boolean;
}

export function Swap({ enabled }: SwapProps) {
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
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
          marginTop: DumpSackTheme.spacing.lg,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Swaps Coming Soon
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
        Swap Tokens
      </h1>

      <div style={{
        textAlign: 'center',
        paddingTop: DumpSackTheme.spacing.xxl,
        paddingBottom: DumpSackTheme.spacing.xxl,
      }}>
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
          marginTop: DumpSackTheme.spacing.lg,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Swap Feature
        </h2>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Token swapping will be available soon
        </p>
      </div>
    </div>
  );
}

