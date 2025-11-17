/**
 * DumpSack Wallet - Panic Mode
 * Emergency wallet wipe with DumpSack theme
 */

import React, { useState } from 'react';
import { DumpSackTheme } from '@dumpsack/shared-ui';

export function Panic() {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePanic = async () => {
    if (confirmText !== 'DELETE') return;

    setLoading(true);

    try {
      // Clear all wallet data from chrome storage
      await chrome.storage.local.clear();

      // Clear session storage
      await chrome.storage.session.clear();

      alert('Wallet data has been wiped. Please close and reopen the extension.');
      window.close();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: DumpSackTheme.spacing.lg,
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100%',
    }}>
      <h1 style={{
        fontSize: DumpSackTheme.typography.fontSize.xl,
        fontWeight: DumpSackTheme.typography.fontWeight.bold,
        color: DumpSackTheme.colors.error,
        marginBottom: DumpSackTheme.spacing.lg,
        display: 'flex',
        alignItems: 'center',
        gap: DumpSackTheme.spacing.sm,
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        Panic Mode
      </h1>

      <div style={{
        padding: DumpSackTheme.spacing.lg,
        borderRadius: DumpSackTheme.borderRadius.md,
        backgroundColor: `${DumpSackTheme.colors.error}20`,
        border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.error}`,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.error,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          ⚠️ DANGER ZONE
        </p>
        <div style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          color: DumpSackTheme.colors.textSecondary,
          display: 'flex',
          flexDirection: 'column',
          gap: DumpSackTheme.spacing.sm,
        }}>
          <p>
            This will immediately and permanently delete all wallet data from this browser,
            including:
          </p>
          <ul style={{
            listStyleType: 'disc',
            listStylePosition: 'inside',
            marginLeft: DumpSackTheme.spacing.sm,
            display: 'flex',
            flexDirection: 'column',
            gap: DumpSackTheme.spacing.xs,
          }}>
            <li>Private keys</li>
            <li>Wallet addresses</li>
            <li>Transaction history</li>
            <li>Settings and preferences</li>
          </ul>
          <p style={{
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            color: DumpSackTheme.colors.error,
          }}>
            This action CANNOT be undone unless you have a backup!
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: DumpSackTheme.colors.textSecondary,
            marginBottom: DumpSackTheme.spacing.sm,
          }}>
            Type <span style={{ fontFamily: 'monospace', fontWeight: DumpSackTheme.typography.fontWeight.bold }}>DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
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

        <button
          onClick={handlePanic}
          disabled={loading || confirmText !== 'DELETE'}
          style={{
            width: '100%',
            padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
            borderRadius: DumpSackTheme.borderRadius.md,
            backgroundColor: DumpSackTheme.colors.error,
            border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.error}`,
            color: DumpSackTheme.colors.boneWhite,
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: (loading || confirmText !== 'DELETE') ? 'not-allowed' : 'pointer',
            opacity: (loading || confirmText !== 'DELETE') ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: DumpSackTheme.spacing.sm,
          }}
          className="ds-button-danger"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {loading ? 'Wiping...' : 'Wipe Wallet Data'}
        </button>
      </div>

      <div style={{
        padding: DumpSackTheme.spacing.md,
        borderRadius: DumpSackTheme.borderRadius.md,
        backgroundColor: `${DumpSackTheme.colors.info}20`,
        border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.info}`,
        marginTop: DumpSackTheme.spacing.lg,
      }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.info,
          marginBottom: DumpSackTheme.spacing.xs,
        }}>
          💡 Before you panic
        </p>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Make sure you have a backup of your wallet. You can create one in the Backup section.
        </p>
      </div>
    </div>
  );
}

