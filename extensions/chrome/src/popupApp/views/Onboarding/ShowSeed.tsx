/**
 * Show Seed Screen - Onboarding Flow
 * Display the 12-word recovery phrase
 */

import React, { useState } from 'react';
import { DumpSackTheme, DSButton } from '@dumpsack/shared-ui';

interface ShowSeedProps {
  mnemonic: string;
  onContinue: () => void;
  onBack: () => void;
}

export function ShowSeed({ mnemonic, onContinue, onBack }: ShowSeedProps) {
  const [copied, setCopied] = useState(false);
  const words = mnemonic.split(' ');

  const handleCopy = () => {
    navigator.clipboard.writeText(mnemonic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      backgroundColor: DumpSackTheme.colors.background,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: DumpSackTheme.spacing.lg,
    }}>
      {/* Header */}
      <h1 style={{
        fontSize: DumpSackTheme.typography.fontSize.xl,
        fontWeight: DumpSackTheme.typography.fontWeight.bold,
        color: DumpSackTheme.colors.text,
        marginBottom: DumpSackTheme.spacing.md,
      }}>
        Your Secret Phrase
      </h1>

      {/* Warning */}
      <div style={{
        backgroundColor: `${DumpSackTheme.colors.eyebrowOrange}20`,
        border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.eyebrowOrange}`,
        borderRadius: DumpSackTheme.borderRadius.md,
        padding: DumpSackTheme.spacing.md,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.xs,
          color: DumpSackTheme.colors.eyebrowOrange,
          fontWeight: DumpSackTheme.typography.fontWeight.semibold,
        }}>
          ⚠️ Never share this phrase. Anyone with it can access your funds.
        </p>
      </div>

      {/* Seed Words Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: DumpSackTheme.spacing.md,
        marginBottom: DumpSackTheme.spacing.lg,
        flex: 1,
      }}>
        {words.map((word, index) => (
          <div
            key={index}
            style={{
              backgroundColor: DumpSackTheme.colors.surface,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
              borderRadius: DumpSackTheme.borderRadius.md,
              padding: DumpSackTheme.spacing.md,
              display: 'flex',
              alignItems: 'center',
              gap: DumpSackTheme.spacing.sm,
            }}
          >
            <span style={{
              fontSize: DumpSackTheme.typography.fontSize.xs,
              color: DumpSackTheme.colors.textSecondary,
              fontWeight: DumpSackTheme.typography.fontWeight.bold,
              minWidth: 20,
            }}>
              {index + 1}.
            </span>
            <span style={{
              fontSize: DumpSackTheme.typography.fontSize.base,
              color: DumpSackTheme.colors.text,
              fontFamily: 'monospace',
            }}>
              {word}
            </span>
          </div>
        ))}
      </div>

      {/* Copy Button */}
      <DSButton
        variant="secondary"
        fullWidth
        onClick={handleCopy}
        style={{ marginBottom: DumpSackTheme.spacing.md }}
      >
        {copied ? '✓ Copied!' : 'Copy Phrase'}
      </DSButton>

      {/* Continue Button */}
      <DSButton
        variant="primary"
        fullWidth
        onClick={onContinue}
        style={{ marginBottom: DumpSackTheme.spacing.md }}
      >
        I've Saved My Phrase
      </DSButton>

      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: DumpSackTheme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: DumpSackTheme.typography.fontSize.sm,
          padding: DumpSackTheme.spacing.md,
        }}
      >
        Back
      </button>
    </div>
  );
}

