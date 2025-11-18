/**
 * DumpSack Wallet - Backup View
 * Backup and restore wallet with DumpSack theme
 */

import React, { useState } from 'react';

import { DumpSackTheme } from '@dumpsack/shared-ui';

import { backupIntegration } from '../../services/backupIntegration';

interface BackupProps {
  enabled: boolean;
}

export function Backup({ enabled }: BackupProps) {
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (!enabled) {
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
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
          marginTop: DumpSackTheme.spacing.lg,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Backup Coming Soon
        </h2>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          This feature is currently disabled
        </p>
      </div>
    );
  }

  const handleBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!passphrase || passphrase.length < 8) {
        throw new Error('Passphrase must be at least 8 characters');
      }

      // Create backup using backupIntegration service
      await backupIntegration.createBackup(passphrase);
      setMessage('Backup created successfully! Your wallet is now backed up to Supabase.');
      setPassphrase('');
    } catch (error) {
      const err = error as Error;
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (!passphrase || passphrase.length < 8) {
        throw new Error('Passphrase must be at least 8 characters');
      }

      // Restore backup using backupIntegration service
      const restored = await backupIntegration.restoreBackup(passphrase);

      if (restored) {
        setMessage('Wallet restored successfully! Please reload the extension.');
      } else {
        setMessage('No backup found or incorrect passphrase.');
      }

      setPassphrase('');
    } catch (error) {
      const err = error as Error;
      setMessage(`Error: ${err.message}`);
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
        color: DumpSackTheme.colors.text,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        Backup & Restore
      </h1>

      {message && (
        <div style={{
          padding: DumpSackTheme.spacing.md,
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: message.startsWith('Error')
            ? `${DumpSackTheme.colors.error}20`
            : `${DumpSackTheme.colors.success}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${
            message.startsWith('Error') ? DumpSackTheme.colors.error : DumpSackTheme.colors.success
          }`,
          marginBottom: DumpSackTheme.spacing.md,
        }}>
          <p style={{
            fontSize: DumpSackTheme.typography.fontSize.sm,
            color: message.startsWith('Error') ? DumpSackTheme.colors.error : DumpSackTheme.colors.success,
          }}>
            {message}
          </p>
        </div>
      )}

      {/* Backup Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
        }}>
          Create Backup
        </h2>
        <form onSubmit={handleBackup} style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: DumpSackTheme.typography.fontSize.sm,
              color: DumpSackTheme.colors.textSecondary,
              marginBottom: DumpSackTheme.spacing.sm,
            }}>
              Backup Passphrase
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter a strong passphrase"
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
            type="submit"
            disabled={loading || !passphrase}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.buttonPrimary,
              border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.buttonPrimary}`,
              color: DumpSackTheme.colors.boneWhite,
              fontSize: DumpSackTheme.typography.fontSize.base,
              fontWeight: DumpSackTheme.typography.fontWeight.semibold,
              cursor: (loading || !passphrase) ? 'not-allowed' : 'pointer',
              opacity: (loading || !passphrase) ? 0.5 : 1,
            }}
            className="ds-button-primary"
          >
            {loading ? 'Creating...' : 'Create Backup'}
          </button>
        </form>
      </div>

      <div style={{ borderTop: `1px solid ${DumpSackTheme.colors.border}`, margin: `${DumpSackTheme.spacing.lg}px 0` }}></div>

      {/* Restore Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
        <h2 style={{
          fontSize: DumpSackTheme.typography.fontSize.lg,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.text,
        }}>
          Restore from Backup
        </h2>
        <form onSubmit={handleRestore} style={{ display: 'flex', flexDirection: 'column', gap: DumpSackTheme.spacing.md }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: DumpSackTheme.typography.fontSize.sm,
              color: DumpSackTheme.colors.textSecondary,
              marginBottom: DumpSackTheme.spacing.sm,
            }}>
              Backup Passphrase
            </label>
            <input
              type="password"
              placeholder="Enter your backup passphrase"
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
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
              borderRadius: DumpSackTheme.borderRadius.md,
              backgroundColor: DumpSackTheme.colors.success,
              border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.success}`,
              color: DumpSackTheme.colors.boneWhite,
              fontSize: DumpSackTheme.typography.fontSize.base,
              fontWeight: DumpSackTheme.typography.fontWeight.semibold,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? 'Restoring...' : 'Restore Wallet'}
          </button>
        </form>
      </div>

      {/* Warning */}
      <div style={{
        padding: DumpSackTheme.spacing.md,
        borderRadius: DumpSackTheme.borderRadius.md,
        backgroundColor: `${DumpSackTheme.colors.warning}20`,
        border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.warning}`,
        marginTop: DumpSackTheme.spacing.md,
      }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
          color: DumpSackTheme.colors.warning,
          marginBottom: DumpSackTheme.spacing.xs,
        }}>
          ⚠️ Important
        </p>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Keep your backup passphrase safe. You'll need it to restore your wallet.
          Never share it with anyone.
        </p>
      </div>
    </div>
  );
}

