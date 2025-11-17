/**
 * OTP Verification View
 * Reusable OTP verification screen with 6-digit input
 * Supports login, signup, and recovery modes
 */

import React, { useState, useEffect, useRef } from 'react';
import { verifyEmailOtpSignIn, requestEmailOtp } from '@dumpsack/shared-utils';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { useWalletStore } from '../stores/walletStoreV2';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export type OtpMode = 'login' | 'signup' | 'recovery';

interface OtpViewProps {
  email: string;
  mode: OtpMode;
  onSuccess: (session: any) => void;
  onBack: () => void;
}

const RESEND_COOLDOWN = 60; // 60 seconds
const OTP_LENGTH = 6; // 6-digit codes configured in Supabase

export function OtpView({ email, mode, onSuccess, onBack }: OtpViewProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { importFromMnemonic, wallets } = useWalletStore();

  // Initialize cooldown from storage
  useEffect(() => {
    chrome.storage.local.get(['otpLastSentAt'], (result) => {
      if (result.otpLastSentAt) {
        const elapsed = Math.floor((Date.now() - result.otpLastSentAt) / 1000);
        const remaining = Math.max(0, RESEND_COOLDOWN - elapsed);
        setResendCooldown(remaining);
      }
    });
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError('');

    // Auto-advance to next input
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (newDigits.every(d => d) && newDigits.join('').length === OTP_LENGTH) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Backspace: clear current and move to previous
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];

      if (digits[index]) {
        // Clear current digit
        newDigits[index] = '';
        setDigits(newDigits);
      } else if (index > 0) {
        // Move to previous and clear it
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
    // Arrow keys navigation
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const cleaned = pasted.replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (cleaned.length > 0) {
      const newDigits = cleaned.split('').concat(Array(OTP_LENGTH).fill('')).slice(0, OTP_LENGTH);
      setDigits(newDigits);

      // Focus the next empty input or last input
      const nextIndex = Math.min(cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      // Auto-submit if all digits pasted
      if (cleaned.length === OTP_LENGTH) {
        handleVerify(cleaned);
      }
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const finalCode = codeToVerify || digits.join('');

    if (finalCode.length !== OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyEmailOtpSignIn(email, finalCode);

      if (result.success && result.session) {
        // Create wallet if user doesn't have one
        if (wallets.length === 0) {
          try {
            const mnemonic = bip39.generateMnemonic(wordlist);
            await importFromMnemonic(mnemonic);
          } catch (walletError) {
            console.error('Failed to create wallet:', walletError);
            setError('Authentication successful but failed to create wallet. Please try again.');
            setLoading(false);
            return;
          }
        }

        // Clear OTP data from storage
        chrome.storage.local.remove(['otpEmail', 'otpLastSentAt']);
        onSuccess(result.session);
      } else {
        // Map error codes to user-friendly messages
        const errorMessage = mapErrorToMessage(result.error || 'Invalid code');
        setError(errorMessage);

        // Clear digits on error
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setLoading(true);
    setError('');

    try {
      // For signup mode, allow user creation
      const createUser = mode === 'signup';
      const result = await requestEmailOtp(email, createUser);

      if (result.success) {
        const now = Date.now();
        chrome.storage.local.set({ otpLastSentAt: now });
        setResendCooldown(RESEND_COOLDOWN);
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        const errorMessage = mapErrorToMessage(result.error || 'Failed to resend code');
        setError(errorMessage);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Map error codes to user-friendly messages
  const mapErrorToMessage = (error: string): string => {
    switch (error) {
      case 'invalid_or_expired_code':
        return 'Code expired or invalid. Please request a new one.';
      case 'rate_limited':
        return 'Too many attempts. Please wait and try again.';
      case 'network_error':
        return 'Network error. Please check your connection.';
      case 'invalid_credentials':
        return 'Invalid code. Please try again.';
      default:
        return error;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: DumpSackTheme.colors.background,
      padding: DumpSackTheme.spacing.lg,
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          alignSelf: 'flex-start',
          background: 'none',
          border: 'none',
          color: DumpSackTheme.colors.textSecondary,
          fontSize: DumpSackTheme.typography.fontSize.base,
          cursor: 'pointer',
          padding: DumpSackTheme.spacing.sm,
          marginBottom: DumpSackTheme.spacing.md,
          display: 'flex',
          alignItems: 'center',
          gap: DumpSackTheme.spacing.xs,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Change Email
      </button>

      {/* Title */}
      <div style={{ marginBottom: DumpSackTheme.spacing.xl, marginTop: DumpSackTheme.spacing.xl, textAlign: 'center' }}>
        <div style={{
          width: 64,
          height: 64,
          backgroundColor: DumpSackTheme.colors.furGreen,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          marginBottom: DumpSackTheme.spacing.lg,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={DumpSackTheme.colors.boneWhite} strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        
        <h1 style={{
          fontSize: DumpSackTheme.typography.fontSize['2xl'],
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Enter Verification Code
        </h1>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          We sent a {OTP_LENGTH}-digit code to<br />
          <strong style={{ color: DumpSackTheme.colors.text }}>{email}</strong>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          marginBottom: DumpSackTheme.spacing.md,
          padding: DumpSackTheme.spacing.md,
          borderRadius: DumpSackTheme.borderRadius.md,
          backgroundColor: `${DumpSackTheme.colors.error}20`,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.error}`,
        }}>
          <p style={{ fontSize: DumpSackTheme.typography.fontSize.sm, color: DumpSackTheme.colors.error }}>
            {error}
          </p>
        </div>
      )}

      {/* OTP Input - 6 separate boxes */}
      <div style={{ marginBottom: DumpSackTheme.spacing.lg }}>
        <div style={{
          display: 'flex',
          gap: DumpSackTheme.spacing.sm,
          justifyContent: 'center',
          marginBottom: DumpSackTheme.spacing.md,
        }}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={loading}
              maxLength={1}
              style={{
                width: 45,
                height: 56,
                padding: 0,
                backgroundColor: DumpSackTheme.colors.cardBackground,
                border: `${DumpSackTheme.borderWidth.thick}px solid ${
                  error ? DumpSackTheme.colors.error :
                  digit ? DumpSackTheme.colors.furGreen :
                  DumpSackTheme.colors.border
                }`,
                borderRadius: DumpSackTheme.borderRadius.md,
                color: DumpSackTheme.colors.text,
                fontSize: DumpSackTheme.typography.fontSize['2xl'],
                fontWeight: DumpSackTheme.typography.fontWeight.bold,
                textAlign: 'center',
                outline: 'none',
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = DumpSackTheme.colors.furGreen;
                }
                e.target.select();
              }}
              onBlur={(e) => {
                if (!error && !digit) {
                  e.target.style.borderColor = DumpSackTheme.colors.border;
                }
              }}
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify()}
          disabled={loading || digits.some(d => !d)}
          style={{
            width: '100%',
            padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
            backgroundColor: DumpSackTheme.colors.buttonPrimary,
            border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.buttonPrimary}`,
            borderRadius: DumpSackTheme.borderRadius.md,
            color: DumpSackTheme.colors.boneWhite,
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: (loading || digits.some(d => !d)) ? 'not-allowed' : 'pointer',
            opacity: (loading || digits.some(d => !d)) ? 0.5 : 1,
          }}
          className="ds-button-primary"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>
      </div>

      {/* Resend Button */}
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Didn't receive the code?
        </p>
        <button
          onClick={handleResend}
          disabled={loading || resendCooldown > 0}
          style={{
            background: 'none',
            border: 'none',
            color: resendCooldown > 0 ? DumpSackTheme.colors.textSecondary : DumpSackTheme.colors.furGreen,
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: (loading || resendCooldown > 0) ? 'not-allowed' : 'pointer',
            textDecoration: 'underline',
            padding: DumpSackTheme.spacing.sm,
          }}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
        </button>
      </div>
    </div>
  );
}

