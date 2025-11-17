/**
 * DumpSack Wallet - Dashboard View
 * Main dashboard with wallet overview
 */

import React, { useEffect, useState } from 'react';
import { useWalletStore } from '../stores/walletStoreV2';
import { getSupabase } from '../../../../../packages/shared-utils/supabase';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { appConfig } from '../../../../../packages/shared-utils';
import { AppHeader } from '../components/AppHeader';

export function Dashboard() {
  const { wallets, activeIndex } = useWalletStore();
  const activeWallet = wallets[activeIndex] || null;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get user email from Supabase
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });

    // Fetch balance if wallet exists
    if (activeWallet) {
      loadBalance();
    }
  }, [activeWallet]);

  const loadBalance = async () => {
    if (!activeWallet) return;

    setLoading(true);
    try {
      const connection = new Connection(appConfig.rpc.primary, 'confirmed');
      const pubkey = new PublicKey(activeWallet.publicKey);
      const lamports = await connection.getBalance(pubkey);
      const bal = lamports / LAMPORTS_PER_SOL;
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadBalance();
  };

  const copyAddress = () => {
    if (activeWallet) {
      navigator.clipboard.writeText(activeWallet.publicKey);
      alert('Address copied to clipboard!');
    }
  };

  return (
    <div style={{
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* App Header with Wallet Chip and Settings */}
      <AppHeader />

      {/* Main Content */}
      <div style={{
        padding: DumpSackTheme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        gap: DumpSackTheme.spacing.lg,
        flex: 1,
      }}>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{
            fontSize: DumpSackTheme.typography.fontSize.xl,
            fontWeight: DumpSackTheme.typography.fontWeight.bold,
            color: DumpSackTheme.colors.text,
          }}>
            Dashboard
          </h1>
          <button
            onClick={handleRefresh}
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
            title="Refresh balance"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'block' }}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

      {/* User Info */}
      {userEmail && (
        <div style={{
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: DumpSackTheme.colors.surface,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
          padding: DumpSackTheme.spacing.md,
        }}>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.xs,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.xs,
          }}>
            Signed in as
          </p>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            fontWeight: DumpSackTheme.typography.fontWeight.medium,
            color: DumpSackTheme.colors.text,
          }}>
            {userEmail}
          </p>
        </div>
      )}

      {/* Wallet Address */}
      <div style={{
        borderRadius: DumpSackTheme.borderRadius.md,
        backgroundColor: DumpSackTheme.colors.surface,
        border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
        padding: DumpSackTheme.spacing.md,
      }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          color: DumpSackTheme.colors.textSecondary,
          marginBottom: DumpSackTheme.spacing.xs,
        }}>
          Wallet Address
        </p>
        {activeWallet ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: DumpSackTheme.spacing.sm }}>
            <p style={{
              fontFamily: 'monospace',
              fontSize: DumpSackTheme.typography.fontSize.sm,
              color: DumpSackTheme.colors.text,
              wordBreak: 'break-all',
              flex: 1,
            }}>
              {activeWallet.publicKey}
            </p>
            <button
              onClick={copyAddress}
              style={{
                padding: `${DumpSackTheme.spacing.xs}px ${DumpSackTheme.spacing.sm}px`,
                borderRadius: DumpSackTheme.borderRadius.sm,
                backgroundColor: DumpSackTheme.colors.surface,
                border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
                color: DumpSackTheme.colors.text,
                cursor: 'pointer',
                fontSize: DumpSackTheme.typography.fontSize.xs,
              }}
              title="Copy address"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        ) : (
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textMuted,
          }}>
            No wallet connected
          </p>
        )}
      </div>

      {/* Balance */}
      <div style={{
        borderRadius: DumpSackTheme.borderRadius.md,
        background: `linear-gradient(135deg, ${DumpSackTheme.colors.furGreen}40, ${DumpSackTheme.colors.eyebrowOrange}40)`,
        border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.furGreen}`,
        padding: DumpSackTheme.spacing.lg,
      }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          GOR Balance
        </p>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize['3xl'],
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
        }}>
          {loading ? (
            <span style={{ opacity: 0.5 }}>...</span>
          ) : (
            <span>{balance.toFixed(4)} GOR</span>
          )}
        </p>
        {activeWallet && (
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.xs,
            color: DumpSackTheme.colors.textMuted,
            marginTop: DumpSackTheme.spacing.sm,
          }}>
            ≈ ${(balance * 0.1).toFixed(2)} USD
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: DumpSackTheme.spacing.sm,
      }}>
        <a
          href="#/send"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DumpSackTheme.spacing.sm,
            padding: DumpSackTheme.spacing.lg,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.surface,
            border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
            textDecoration: 'none',
            color: DumpSackTheme.colors.text,
            transition: 'all 0.2s ease',
          }}
          className="ds-quick-action"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.eyebrowOrange} strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span style={{ fontSize: DumpSackTheme.typography.fontSize.sm, fontWeight: DumpSackTheme.typography.fontWeight.medium }}>Send</span>
        </a>
        <a
          href="#/receive"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DumpSackTheme.spacing.sm,
            padding: DumpSackTheme.spacing.lg,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.surface,
            border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
            textDecoration: 'none',
            color: DumpSackTheme.colors.text,
            transition: 'all 0.2s ease',
          }}
          className="ds-quick-action"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.furGreen} strokeWidth="2">
            <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
            <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
          </svg>
          <span style={{ fontSize: DumpSackTheme.typography.fontSize.sm, fontWeight: DumpSackTheme.typography.fontWeight.medium }}>Receive</span>
        </a>
        <a
          href="#/swap"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DumpSackTheme.spacing.sm,
            padding: DumpSackTheme.spacing.lg,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.surface,
            border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
            textDecoration: 'none',
            color: DumpSackTheme.colors.text,
            transition: 'all 0.2s ease',
          }}
          className="ds-quick-action"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.info} strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          <span style={{ fontSize: DumpSackTheme.typography.fontSize.sm, fontWeight: DumpSackTheme.typography.fontWeight.medium }}>Swap</span>
        </a>
        <a
          href="#/backup"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: DumpSackTheme.spacing.sm,
            padding: DumpSackTheme.spacing.lg,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.surface,
            border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
            textDecoration: 'none',
            color: DumpSackTheme.colors.text,
            transition: 'all 0.2s ease',
          }}
          className="ds-quick-action"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.success} strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span style={{ fontSize: DumpSackTheme.typography.fontSize.sm, fontWeight: DumpSackTheme.typography.fontWeight.medium }}>Backup</span>
        </a>
      </div>

      {/* Setup Wallet CTA */}
      {!activeWallet && (
        <div style={{
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: `${DumpSackTheme.colors.warning}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.warning}`,
          padding: DumpSackTheme.spacing.lg,
        }}>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            color: DumpSackTheme.colors.warning,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            ⚠️ No Wallet Found
          </p>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.xs,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.md,
          }}>
            Create a new wallet or import an existing one to get started.
          </p>
          <a
            href="#/settings"
            style={{
              display: 'inline-block',
              padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.lg}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: `${DumpSackTheme.colors.warning}30`,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.warning}`,
              color: DumpSackTheme.colors.warning,
              fontSize: DumpSackTheme.typography.fontSize.sm,
              fontWeight: DumpSackTheme.typography.fontWeight.semibold,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Go to Settings
          </a>
        </div>
      )}
      </div>
    </div>
  );
}

