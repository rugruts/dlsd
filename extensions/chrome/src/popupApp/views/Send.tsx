/**
 * DumpSack Wallet - Send View
 * Send tokens with DumpSack theme
 */

import React, { useState } from 'react';
import { useWalletStore } from '../stores/walletStore';
import { DumpSackTheme } from '@dumpsack/shared-ui';

export function Send() {
  const { publicKey, balance } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement actual transaction sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(`Successfully sent ${amount} GOR to ${recipient.slice(0, 8)}...`);
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
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
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.textSecondary} strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
        <p style={{
          marginTop: DumpSackTheme.spacing.md,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Connect a wallet to send tokens
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
        Send Tokens
      </h1>

      {success && (
        <div style={{
          padding: DumpSackTheme.spacing.md,
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: `${DumpSackTheme.colors.success}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.success}`,
          marginBottom: DumpSackTheme.spacing.md,
        }}>
          <p style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.success }}>
            {success}
          </p>
        </div>
      )}

      {error && (
        <div style={{
          padding: DumpSackTheme.spacing.md,
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: `${DumpSackTheme.colors.error}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.error}`,
          marginBottom: DumpSackTheme.spacing.md,
        }}>
          <p style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.error }}>
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter wallet address"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.inputBackground,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.inputBorder}`,
              color: DumpSackTheme.colors.inputText,
              fontSize: DumpSackTheme.typography.fontSize.base,
              outline: 'none',
              opacity: loading ? 0.5 : 1,
            }}
            className="ds-input"
          />
        </div>

        <div>
          <label style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            <span>Amount (GOR)</span>
            <span>Balance: {balance.toFixed(4)}</span>
          </label>
          <input
            type="number"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.inputBackground,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.inputBorder}`,
              color: DumpSackTheme.colors.inputText,
              fontSize: DumpSackTheme.typography.fontSize.base,
              outline: 'none',
              opacity: loading ? 0.5 : 1,
            }}
            className="ds-input"
          />
          <button
            type="button"
            onClick={() => setAmount(balance.toString())}
            style={{
              marginTop: DumpSackTheme.spacing.sm,
              fontSize: DumpSackTheme.typography.fontSize.xs,
              color: DumpSackTheme.colors.primary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Use Max
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !recipient || !amount || parseFloat(amount) <= 0}
          style={{
            width: '100%',
            padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.buttonPrimary,
            border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.buttonPrimary}`,
            color: DumpSackTheme.colors.boneWhite,
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: (loading || !recipient || !amount || parseFloat(amount) <= 0) ? 'not-allowed' : 'pointer',
            opacity: (loading || !recipient || !amount || parseFloat(amount) <= 0) ? 0.5 : 1,
          }}
          className="ds-button-primary"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

