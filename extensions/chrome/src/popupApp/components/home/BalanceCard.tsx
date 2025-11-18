/**
 * BalanceCard Component - Phantom-grade balance display (Extension)
 * Platform-specific implementation using shared logic
 * Height: 140px fixed
 */

import React from 'react';
import { DumpSackTheme, useBalanceCard, BalanceCardProps } from '@dumpsack/shared-ui';

export function BalanceCard(props: BalanceCardProps) {
  const data = useBalanceCard(props);
  const changeColor = data.change?.color === 'success' ? DumpSackTheme.colors.success : DumpSackTheme.colors.error;

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
      {data.loading ? (
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
            {data.balance.amount}
          </div>
          <div style={{
            fontSize: DumpSackTheme.typography.fontSize.xs,
            fontWeight: DumpSackTheme.typography.fontWeight.medium,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: '4px',
          }}>
            {data.balance.currency}
          </div>

          {/* USD Value + Change */}
          <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.sm }}>
            <span style={{
              fontSize: DumpSackTheme.typography.fontSize.lg,
              fontWeight: DumpSackTheme.typography.fontWeight.medium,
              color: DumpSackTheme.colors.textSecondary,
            }}>
              {data.usd.amount}
            </span>
            {data.change && (
              <span style={{
                fontSize: DumpSackTheme.typography.fontSize.sm,
                fontWeight: DumpSackTheme.typography.fontWeight.semibold,
                color: changeColor,
              }}>
                {data.change.text}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Re-export props type
export type { BalanceCardProps };

