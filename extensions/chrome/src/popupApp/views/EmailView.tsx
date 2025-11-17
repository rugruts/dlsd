/**
 * Email OTP Entry View
 * First step of OTP authentication - user enters email
 */

import React, { useState } from 'react';
import { requestEmailOtp } from '@dumpsack/shared-utils';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { LOGO_PATH } from '../../utils/tokenIcons';

interface EmailViewProps {
  onSuccess: (email: string) => void;
  onGoogleSignIn: () => void;
  onBack: () => void;
}

export function EmailView({ onSuccess, onGoogleSignIn, onBack }: EmailViewProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await requestEmailOtp(email.trim());
      
      if (result.success) {
        // Store email and timestamp in chrome.storage for persistence
        chrome.storage.local.set({
          otpEmail: email.trim(),
          otpLastSentAt: Date.now(),
        });
        
        onSuccess(email.trim());
      } else {
        setError(result.error || 'Failed to send code');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
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
        Back
      </button>

      {/* Logo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: DumpSackTheme.spacing.lg,
        paddingBottom: DumpSackTheme.spacing.xl,
      }}>
        <img
          src={LOGO_PATH}
          alt="DumpSack Logo"
          style={{
            width: 80,
            height: 80,
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Title */}
      <div style={{ marginBottom: DumpSackTheme.spacing.xl, textAlign: 'center' }}>
        <h1 style={{
          fontSize: DumpSackTheme.typography.fontSize['2xl'],
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
          marginBottom: DumpSackTheme.spacing.sm,
        }}>
          Enter Your Email
        </h1>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          We'll send you a 6-digit code
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

      {/* Email Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: DumpSackTheme.spacing.lg }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={loading}
          autoFocus
          style={{
            width: '100%',
            padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
            backgroundColor: DumpSackTheme.colors.cardBackground,
            border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
            borderRadius: DumpSackTheme.borderRadius.md,
            color: DumpSackTheme.colors.text,
            fontSize: DumpSackTheme.typography.fontSize.base,
            marginBottom: DumpSackTheme.spacing.md,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = DumpSackTheme.colors.furGreen;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = DumpSackTheme.colors.border;
          }}
        />

        <button
          type="submit"
          disabled={loading || !email.trim()}
          style={{
            width: '100%',
            padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
            backgroundColor: DumpSackTheme.colors.buttonPrimary,
            border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.buttonPrimary}`,
            borderRadius: DumpSackTheme.borderRadius.md,
            color: DumpSackTheme.colors.boneWhite,
            fontSize: DumpSackTheme.typography.fontSize.base,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: (loading || !email.trim()) ? 'not-allowed' : 'pointer',
            opacity: (loading || !email.trim()) ? 0.5 : 1,
          }}
          className="ds-button-primary"
        >
          {loading ? 'Sending...' : 'Send Code'}
        </button>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: DumpSackTheme.spacing.md }}>
        <div style={{ flex: 1, height: 1, backgroundColor: `${DumpSackTheme.colors.textSecondary}40` }} />
        <span style={{
          padding: `0 ${DumpSackTheme.spacing.md}px`,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          Or
        </span>
        <div style={{ flex: 1, height: 1, backgroundColor: `${DumpSackTheme.colors.textSecondary}40` }} />
      </div>

      {/* Google Button */}
      <button
        onClick={onGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
          backgroundColor: DumpSackTheme.colors.boneWhite,
          border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.shadowBlack}20`,
          borderRadius: DumpSackTheme.borderRadius.md,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: DumpSackTheme.spacing.sm,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span style={{
          color: DumpSackTheme.colors.shadowBlack,
          fontSize: DumpSackTheme.typography.fontSize.sm,
          fontWeight: DumpSackTheme.typography.fontWeight.medium,
        }}>
          Continue with Google
        </span>
      </button>
    </div>
  );
}

