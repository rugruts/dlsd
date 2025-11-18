/**
 * Welcome Screen - Onboarding Flow
 * First screen users see when opening the extension
 */

import React from 'react';
import { DumpSackTheme, DSButton } from '@dumpsack/shared-ui';

interface WelcomeProps {
  onCreateWallet: () => void;
  onRestoreWallet: () => void;
}

export function Welcome({ onCreateWallet, onRestoreWallet }: WelcomeProps) {
  return (
    <div style={{
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: DumpSackTheme.spacing.lg,
    }}>
      {/* Top spacing */}
      <div style={{ flex: 1 }} />

      {/* Logo/Mascot */}
      <div style={{
        width: 190,
        height: 190,
        backgroundColor: DumpSackTheme.colors.surface,
        borderRadius: DumpSackTheme.borderRadius.full,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: DumpSackTheme.spacing.xxl,
        border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.furGreen}`,
      }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.eyebrowOrange} strokeWidth="1.5">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <circle cx="9" cy="10" r="1.5" fill={DumpSackTheme.colors.eyebrowOrange} />
          <circle cx="15" cy="10" r="1.5" fill={DumpSackTheme.colors.eyebrowOrange} />
          <path d="M9 15c1 1 2 1.5 3 1.5s2-.5 3-1.5" />
        </svg>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: DumpSackTheme.typography.fontSize['3xl'],
        fontWeight: DumpSackTheme.typography.fontWeight.bold,
        color: DumpSackTheme.colors.text,
        textAlign: 'center',
        marginBottom: DumpSackTheme.spacing.md,
      }}>
        DumpSack Wallet
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: DumpSackTheme.typography.fontSize.base,
        color: DumpSackTheme.colors.textSecondary,
        textAlign: 'center',
        marginBottom: DumpSackTheme.spacing.xxl,
        maxWidth: 300,
      }}>
        Your trashpunk gateway to Gorbagana and beyond
      </p>

      {/* Bottom spacing */}
      <div style={{ flex: 1 }} />

      {/* Buttons */}
      <div style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: DumpSackTheme.spacing.md,
      }}>
        <DSButton
          variant="primary"
          fullWidth
          onClick={onCreateWallet}
        >
          Create Wallet
        </DSButton>
        <DSButton
          variant="secondary"
          fullWidth
          onClick={onRestoreWallet}
        >
          Restore Wallet
        </DSButton>
      </div>
    </div>
  );
}

