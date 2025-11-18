/**
 * DumpSack Wallet - Tokens View
 * Token list with balances
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DSScreen, DumpSackTheme, DSHeader, type Token } from '@dumpsack/shared-ui';
import { useWalletStore } from '../stores/walletStoreV2';
import { BottomNav } from '../components/BottomNav';
import { TokenList } from '../components/home/TokenList';
import { getTokenIcon } from '../../utils/tokenIcons';
import { getUiTokenList } from '../../services/tokenService';

export function Tokens() {
  const navigate = useNavigate();
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets.find(w => w.index === activeIndex);
  const publicKey = activeWallet?.publicKey;
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadTokens();
    }
  }, [publicKey]);

  const loadTokens = async () => {
    setLoading(true);
    try {
      // Mock tokens for now
      setTokens([
        { symbol: 'GOR', name: 'Gorbagana', balance: 10.5, usdValue: 1.05 },
        { symbol: 'USDC', name: 'USD Coin', balance: 100.0, usdValue: 100.0 },
        { symbol: 'SOL', name: 'Solana', balance: 2.5, usdValue: 250.0 },
      ]);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textMuted,
          marginTop: DumpSackTheme.spacing.lg,
        }}>
          Connect a wallet to view tokens
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: DumpSackTheme.spacing.lg }}>
        <h1 style={{
          fontSize: DumpSackTheme.typography.fontSize.xl,
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
        }}>
          Tokens
        </h1>
        <button
          onClick={loadTokens}
          disabled={loading}
          style={{
            padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.md}px`,
            borderRadius: DumpSackTheme.borderRadius.sm,
            backgroundColor: DumpSackTheme.colors.surface,
            border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
            color: DumpSackTheme.colors.text,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
          title="Refresh tokens"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'block' }}>
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', paddingTop: DumpSackTheme.spacing.xxl, paddingBottom: DumpSackTheme.spacing.xxl }}>
          <div style={{
            width: 32,
            height: 32,
            border: `2px solid ${DumpSackTheme.colors.border}`,
            borderTopColor: DumpSackTheme.colors.eyebrowOrange,
            borderRadius: '50%',
            margin: '0 auto',
            marginBottom: DumpSackTheme.spacing.sm,
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textMuted,
          }}>
            Loading tokens...
          </p>
        </div>
      ) : tokens.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: DumpSackTheme.spacing.xxl, paddingBottom: DumpSackTheme.spacing.xxl }}>
          <svg width="96" height="96" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textMuted} strokeWidth="1.5" style={{ margin: '0 auto' }}>
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textMuted,
            marginTop: DumpSackTheme.spacing.sm,
          }}>
            No tokens found
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.sm }}>
          {tokens.map((token) => (
            <div
              key={token.symbol}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: DumpSackTheme.spacing.md,
                padding: DumpSackTheme.spacing.md,
                borderRadius: DumpSackTheme.borderRadius.md,
                backgroundColor: DumpSackTheme.colors.surface,
                border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="ds-token-item"
            >
              <img
                src={getTokenIcon(token.symbol)}
                alt={token.symbol}
                style={{
                  width: 40,
                  height: 40,
                  objectFit: 'contain',
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: DumpSackTheme.typography.fontSize.base,
                  fontWeight: DumpSackTheme.typography.fontWeight.medium,
                  color: DumpSackTheme.colors.text,
                }}>
                  {token.symbol}
                </p>
                <p style={{
                  fontSize: DumpSackTheme.typography.fontSize.xs,
                  color: DumpSackTheme.colors.textMuted,
                }}>
                  {token.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: DumpSackTheme.typography.fontSize.base,
                  fontWeight: DumpSackTheme.typography.fontWeight.medium,
                  color: DumpSackTheme.colors.text,
                }}>
                  {token.balance.toFixed(2)}
                </p>
                <p style={{
                  fontSize: DumpSackTheme.typography.fontSize.xs,
                  color: DumpSackTheme.colors.textMuted,
                }}>
                  ${token.usdValue.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

