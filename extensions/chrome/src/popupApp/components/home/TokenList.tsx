/**
 * TokenList Component - Phantom-grade token list (Extension)
 * Platform-specific implementation using shared logic
 */

import React from 'react';
import { DumpSackTheme, useTokenList, TokenListProps, TokenItemData, DSTokenIcon } from '@dumpsack/shared-ui';

function TokenListItem({ item }: { item: TokenItemData }) {
  const changeColor = item.change?.color === 'success' ? DumpSackTheme.colors.success : DumpSackTheme.colors.error;

  return (
    <button
      onClick={item.onPress}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
        borderBottom: `${DumpSackTheme.borderWidth.thin}px solid ${DumpSackTheme.colors.border}50`,
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${DumpSackTheme.colors.border}50`,
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      {/* Token Icon */}
      <div style={{ marginRight: DumpSackTheme.spacing.sm }}>
        <DSTokenIcon
          mint={item.mint}
          size={40}
          metadata={{ logoURI: item.icon || undefined }}
        />
      </div>

      {/* Token Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          color: DumpSackTheme.colors.text,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          fontSize: DumpSackTheme.typography.fontSize.base,
        }}>{item.symbol}</div>
        <div style={{
          color: DumpSackTheme.colors.textSecondary,
          fontSize: DumpSackTheme.typography.fontSize.xs,
        }}>{item.name}</div>
      </div>

      {/* Balance + USD */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          color: DumpSackTheme.colors.text,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          fontSize: DumpSackTheme.typography.fontSize.base,
        }}>
          {item.balance}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.xs, justifyContent: 'flex-end' }}>
          {item.usdValue && (
            <span style={{
              color: DumpSackTheme.colors.textSecondary,
              fontSize: DumpSackTheme.typography.fontSize.xs,
            }}>
              {item.usdValue}
            </span>
          )}
          {item.change && (
            <span style={{
              color: changeColor,
              fontSize: DumpSackTheme.typography.fontSize.xs,
              fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            }}>
              {item.change.text}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function SkeletonItem() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
      borderBottom: `1px solid ${DumpSackTheme.colors.border}50`,
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        backgroundColor: DumpSackTheme.colors.surface,
        borderRadius: '50%',
        marginRight: DumpSackTheme.spacing.sm,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{
          height: '16px',
          width: '64px',
          backgroundColor: DumpSackTheme.colors.surface,
          borderRadius: DumpSackTheme.borderRadius.sm,
          marginBottom: '4px',
        }} />
        <div style={{
          height: '12px',
          width: '96px',
          backgroundColor: DumpSackTheme.colors.surface,
          borderRadius: DumpSackTheme.borderRadius.sm,
        }} />
      </div>
    </div>
  );
}

export function TokenList(props: TokenListProps) {
  const data = useTokenList(props);

  if (data.loading && data.isEmpty) {
    return (
      <div style={{ flex: 1, backgroundColor: DumpSackTheme.colors.background }}>
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
        <SkeletonItem />
      </div>
    );
  }

  if (data.isEmpty) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${DumpSackTheme.spacing.xl}px 0`,
        backgroundColor: DumpSackTheme.colors.background,
      }}>
        <div style={{
          color: DumpSackTheme.colors.textSecondary,
          fontSize: DumpSackTheme.typography.fontSize.base,
        }}>No tokens found</div>
        <div style={{
          color: DumpSackTheme.colors.textSecondary,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          marginTop: DumpSackTheme.spacing.xs,
        }}>Your tokens will appear here</div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      backgroundColor: DumpSackTheme.colors.background,
    }}>
      {data.tokens.map((token) => (
        <TokenListItem key={token.mint} item={token} />
      ))}
    </div>
  );
}

// Re-export props type
export type { TokenListProps };

