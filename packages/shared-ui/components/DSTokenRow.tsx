/**
 * DSTokenRow - Token List Row
 * Spec: Section 3.7
 * Content: Token icon | Token name | Balance (right) | Fiat equivalent (right, secondary) | Chevron
 */

import React from 'react';
import { DumpSackTheme } from '../theme';

export interface DSTokenRowProps {
  icon: string;
  name: string;
  symbol: string;
  balance: string;
  fiatValue: string;
  priceChange?: number;
  onClick: () => void;
}

export function DSTokenRow({
  icon,
  name,
  symbol,
  balance,
  fiatValue,
  priceChange,
  onClick,
}: DSTokenRowProps) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: DumpSackTheme.spacing.md,
        padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        borderRadius: DumpSackTheme.borderRadius.sm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = DumpSackTheme.colors.backgroundElevated;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Token Icon */}
      <img
        src={icon}
        alt={name}
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
        }}
      />

      {/* Token Name & Symbol */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: DumpSackTheme.typography.body.fontSize,
            fontWeight: DumpSackTheme.typography.body.fontWeight,
            color: DumpSackTheme.colors.textPrimary,
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: DumpSackTheme.typography.small.fontSize,
            color: DumpSackTheme.colors.textSecondary,
          }}
        >
          {symbol}
        </div>
      </div>

      {/* Balance & Fiat Value */}
      <div style={{ textAlign: 'right' }}>
        <div
          style={{
            fontSize: DumpSackTheme.typography.body.fontSize,
            fontWeight: DumpSackTheme.typography.body.fontWeight,
            color: DumpSackTheme.colors.textPrimary,
          }}
        >
          {balance}
        </div>
        <div
          style={{
            fontSize: DumpSackTheme.typography.small.fontSize,
            color: DumpSackTheme.colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: DumpSackTheme.spacing.xs,
            justifyContent: 'flex-end',
          }}
        >
          {fiatValue}
          {priceChange !== undefined && (
            <span
              style={{
                color: priceChange >= 0 ? DumpSackTheme.colors.success : DumpSackTheme.colors.error,
              }}
            >
              {priceChange >= 0 ? '+' : ''}
              {priceChange.toFixed(2)}%
            </span>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={DumpSackTheme.colors.textMuted}
        strokeWidth="2"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  );
}

