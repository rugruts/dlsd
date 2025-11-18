/**
 * BalanceCard Component - Phantom-grade balance display (Extension)
 * Shows: Big GOR balance, USD value, % change
 * Height: 140px fixed
 */

import React from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';

interface BalanceCardProps {
  balanceGOR: string;
  balanceUSD: string;
  change24h?: number;
  loading?: boolean;
}

export function BalanceCard({
  balanceGOR,
  balanceUSD,
  change24h,
  loading = false,
}: BalanceCardProps) {
  const changeColor = change24h && change24h >= 0 ? DumpSackTheme.colors.success : DumpSackTheme.colors.error;
  const changeSign = change24h && change24h >= 0 ? '+' : '';

  return (
    <div style={{
      height: '140px',
      padding: `${DumpSackTheme.spacing.lg}px ${DumpSackTheme.spacing.xl}px`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: DumpSackTheme.colors.background,
    }}>
      {loading ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            height: '48px',
            width: '128px',
            backgroundColor: DumpSackTheme.colors.surface,
            borderRadius: DumpSackTheme.borderRadius.md,
            marginBottom: DumpSackTheme.spacing.sm,
          }} />
          <div style={{
            height: '24px',
            width: '96px',
            backgroundColor: DumpSackTheme.colors.surface,
            borderRadius: DumpSackTheme.borderRadius.md,
          }} />
        </div>
      ) : (
        <>
          {/* Main Balance */}
          <div style={{
            fontSize: '48px',
            fontWeight: DumpSackTheme.typography.fontWeight.bold,
            color: DumpSackTheme.colors.text,
            marginBottom: '4px',
          }}>
            {balanceGOR}
          </div>
          <div style={{
            fontSize: DumpSackTheme.typography.fontSize.xs,
            fontWeight: DumpSackTheme.typography.fontWeight.medium,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: '4px',
          }}>
            GOR
          </div>

          {/* USD Value + Change */}
          <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.sm }}>
            <span style={{
              fontSize: DumpSackTheme.typography.fontSize.lg,
              fontWeight: DumpSackTheme.typography.fontWeight.medium,
              color: DumpSackTheme.colors.textSecondary,
            }}>
              {balanceUSD}
            </span>
            {change24h !== undefined && (
              <span style={{
                fontSize: DumpSackTheme.typography.fontSize.sm,
                fontWeight: DumpSackTheme.typography.fontWeight.semibold,
                color: changeColor,
              }}>
                {changeSign}{change24h.toFixed(2)}%
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

