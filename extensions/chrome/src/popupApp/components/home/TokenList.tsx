/**
 * TokenList Component - Phantom-grade token list (Extension)
 * Compact, scrollable list of tokens with prices
 */

import React from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';

interface Token {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  usdValue?: number;
  change24h?: number;
  icon?: string;
}

interface TokenListProps {
  tokens: Token[];
  loading?: boolean;
  onTokenPress: (token: Token) => void;
}

function TokenListItem({ item, onPress }: { item: Token; onPress: () => void }) {
  const changeColor = item.change24h && item.change24h >= 0 ? DumpSackTheme.colors.success : DumpSackTheme.colors.error;
  const changeSign = item.change24h && item.change24h >= 0 ? '+' : '';

  return (
    <button
      onClick={onPress}
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
      <div style={{
        width: '40px',
        height: '40px',
        backgroundColor: DumpSackTheme.colors.surface,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: DumpSackTheme.spacing.sm,
      }}>
        {item.icon ? (
          <img src={item.icon} alt={item.symbol} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        ) : (
          <span style={{
            color: DumpSackTheme.colors.textSecondary,
            fontSize: DumpSackTheme.typography.fontSize.xs,
            fontWeight: DumpSackTheme.typography.fontWeight.bold,
          }}>
            {item.symbol.slice(0, 2)}
          </span>
        )}
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
          {item.balance.toFixed(4)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.xs, justifyContent: 'flex-end' }}>
          {item.usdValue && (
            <span style={{
              color: DumpSackTheme.colors.textSecondary,
              fontSize: DumpSackTheme.typography.fontSize.xs,
            }}>
              ${item.usdValue.toFixed(2)}
            </span>
          )}
          {item.change24h !== undefined && (
            <span style={{
              color: changeColor,
              fontSize: DumpSackTheme.typography.fontSize.xs,
              fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            }}>
              {changeSign}{item.change24h.toFixed(1)}%
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

export function TokenList({ tokens, loading = false, onTokenPress }: TokenListProps) {
  if (loading && tokens.length === 0) {
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

  if (tokens.length === 0) {
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
      {tokens.map((token) => (
        <TokenListItem key={token.mint} item={token} onPress={() => onTokenPress(token)} />
      ))}
    </div>
  );
}

