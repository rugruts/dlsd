/**
 * Create Wallet Screen - Onboarding Flow
 * Choose between seedless or classic wallet creation
 */

import React, { useState } from 'react';
import { DumpSackTheme, DSButton, DSCard } from '@dumpsack/shared-ui';

interface CreateWalletProps {
  onSeedless: () => void;
  onClassic: () => void;
  onBack: () => void;
}

export function CreateWallet({ onSeedless, onClassic, onBack }: CreateWalletProps) {
  return (
    <div style={{
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: DumpSackTheme.spacing.lg,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: DumpSackTheme.colors.text,
            cursor: 'pointer',
            fontSize: DumpSackTheme.typography.fontSize.xl,
          }}
        >
          ←
        </button>
        <h1 style={{
          fontSize: DumpSackTheme.typography.fontSize.xl,
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
          marginLeft: DumpSackTheme.spacing.md,
        }}>
          Create Wallet
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.lg }}>
        {/* Seedless Option */}
        <DSCard
          onClick={onSeedless}
          hoverable
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: DumpSackTheme.spacing.md,
          }}>
            <div style={{
              width: 48,
              height: 48,
              backgroundColor: DumpSackTheme.colors.background,
              borderRadius: DumpSackTheme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.eyebrowOrange} strokeWidth="2">
                <path d="M12 1v22M4.22 4.22l15.56 15.56M19.78 4.22L4.22 19.78" />
              </svg>
            </div>
            <div>
              <h3 style={{
                fontSize: DumpSackTheme.typography.fontSize.base,
                fontWeight: DumpSackTheme.typography.fontWeight.bold,
                color: DumpSackTheme.colors.text,
                marginBottom: DumpSackTheme.spacing.xs,
              }}>
                Seedless Login
              </h3>
              <p style={{
                fontSize: DumpSackTheme.typography.fontSize.sm,
                color: DumpSackTheme.colors.textSecondary,
              }}>
                Sign up with email and biometrics
              </p>
            </div>
          </div>
        </DSCard>

        {/* Classic Option */}
        <DSCard
          onClick={onClassic}
          hoverable
          style={{ cursor: 'pointer' }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: DumpSackTheme.spacing.md,
          }}>
            <div style={{
              width: 48,
              height: 48,
              backgroundColor: DumpSackTheme.colors.background,
              borderRadius: DumpSackTheme.borderRadius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.eyebrowOrange} strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 style={{
                fontSize: DumpSackTheme.typography.fontSize.base,
                fontWeight: DumpSackTheme.typography.fontWeight.bold,
                color: DumpSackTheme.colors.text,
                marginBottom: DumpSackTheme.spacing.xs,
              }}>
                Secret Phrase
              </h3>
              <p style={{
                fontSize: DumpSackTheme.typography.fontSize.sm,
                color: DumpSackTheme.colors.textSecondary,
              }}>
                Create with 12-word recovery phrase
              </p>
            </div>
          </div>
        </DSCard>
      </div>
    </div>
  );
}

