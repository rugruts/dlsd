/**
 * DumpSack Wallet - NFTs View
 * NFT gallery with DumpSack theme
 */

import React from 'react';
import { useWalletStore } from '../stores/walletStore';
import { DumpSackTheme } from '@dumpsack/shared-ui';

export function NFTs() {
  const { publicKey } = useWalletStore();

  if (!publicKey) {
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
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textSecondary} strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p style={{
          marginTop: DumpSackTheme.spacing.md,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Connect a wallet to view NFTs
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
        NFTs
      </h1>

      <div style={{
        textAlign: 'center',
        paddingTop: DumpSackTheme.spacing.xxl,
        paddingBottom: DumpSackTheme.spacing.xxl,
      }}>
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
          marginTop: DumpSackTheme.spacing.lg,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          No NFTs Yet
        </h2>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Your NFT collection will appear here
        </p>
      </div>
    </div>
  );
}

