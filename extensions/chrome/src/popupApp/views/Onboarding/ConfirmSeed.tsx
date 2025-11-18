/**
 * Confirm Seed Screen - Onboarding Flow
 * Verify the user has saved their recovery phrase
 */

import React, { useState, useMemo } from 'react';
import { DumpSackTheme, DSButton } from '@dumpsack/shared-ui';

interface ConfirmSeedProps {
  mnemonic: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmSeed({ mnemonic, onConfirm, onBack }: ConfirmSeedProps) {
  const words = mnemonic.split(' ');
  const [inputs, setInputs] = useState<string[]>(Array(12).fill(''));
  
  // Randomly select 3 words to verify
  const indicesToVerify = useMemo(() => {
    const indices: number[] = [];
    while (indices.length < 3) {
      const idx = Math.floor(Math.random() * 12);
      if (!indices.includes(idx)) indices.push(idx);
    }
    return indices.sort((a, b) => a - b);
  }, []);

  const isValid = indicesToVerify.every(idx => inputs[idx] === words[idx]);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value.toLowerCase().trim();
    setInputs(newInputs);
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
        Verify Your Phrase
      </h1>

      <p style={{
        fontSize: DumpSackTheme.typography.fontSize.sm,
        color: DumpSackTheme.colors.textSecondary,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        Enter the words at positions {indicesToVerify.map(i => i + 1).join(', ')}
      </p>

      {/* Input Fields */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: DumpSackTheme.spacing.md,
        flex: 1,
        marginBottom: DumpSackTheme.spacing.lg,
      }}>
        {indicesToVerify.map((idx) => (
          <div key={idx}>
            <label style={{
              display: 'block',
              fontSize: DumpSackTheme.typography.fontSize.sm,
              color: DumpSackTheme.colors.textSecondary,
              marginBottom: DumpSackTheme.spacing.xs,
            }}>
              Word #{idx + 1}
            </label>
            <input
              type="text"
              value={inputs[idx]}
              onChange={(e) => handleInputChange(idx, e.target.value)}
              placeholder="Enter word"
              style={{
                width: '100%',
                padding: `${DumpSackTheme.spacing.md}px`,
                borderRadius: DumpSackTheme.borderRadius.md,
                backgroundColor: DumpSackTheme.colors.inputBackground,
                border: `${DumpSackTheme.borderWidth.normal}px solid ${
                  inputs[idx] && inputs[idx] !== words[idx]
                    ? DumpSackTheme.colors.error
                    : DumpSackTheme.colors.inputBorder
                }`,
                color: DumpSackTheme.colors.inputText,
                fontSize: DumpSackTheme.typography.fontSize.base,
                outline: 'none',
              }}
            />
            {inputs[idx] && inputs[idx] !== words[idx] && (
              <p style={{
                fontSize: DumpSackTheme.typography.fontSize.xs,
                color: DumpSackTheme.colors.error,
                marginTop: DumpSackTheme.spacing.xs,
              }}>
                Incorrect word
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Confirm Button */}
      <DSButton
        variant="primary"
        fullWidth
        onClick={onConfirm}
        disabled={!isValid}
        style={{ marginBottom: DumpSackTheme.spacing.md }}
      >
        Confirm & Continue
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

