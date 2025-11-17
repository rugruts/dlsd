/**
 * DumpSack Wallet Sign In Screen
 * Dual-mode authentication: OTP (Code) and Password
 */

import React, { useState } from 'react';
import { signInWithGoogle } from '../../services/auth';
import { requestEmailOtp, signInWithPassword } from '@dumpsack/shared-utils';
import { DumpSackTheme } from '@dumpsack/shared-ui';
import { LOGO_PATH } from '../../utils/tokenIcons';
import { OtpView } from './OtpView';
import { useWalletStore } from '../stores/walletStoreV2';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

type AuthMode = 'initial' | 'otp' | 'password-forgot';
type SignInTab = 'code' | 'password';

export function SignIn() {
  const [mode, setMode] = useState<AuthMode>('initial');
  const [activeTab, setActiveTab] = useState<SignInTab>('code');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { importFromMnemonic, wallets } = useWalletStore();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithGoogle();
      if (result.success) {
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
        // Reload to show authenticated state
        window.location.reload();
      } else {
        setError(result.error || 'Failed to sign in with Google');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await requestEmailOtp(email.trim(), false);
      
      if (result.success) {
        // Store email and timestamp
        chrome.storage.local.set({
          otpEmail: email.trim(),
          otpLastSentAt: Date.now(),
        });
        setMode('otp');
      } else {
        setError(mapErrorToMessage(result.error || 'Failed to send code'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await signInWithPassword(email.trim(), password);

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
        // Session is set, reload to show authenticated state
        window.location.reload();
      } else {
        setError(mapErrorToMessage(result.error || 'Failed to sign in'));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSuccess = (session: any) => {
    // Session is set, reload to show authenticated state
    window.location.reload();
  };

  const mapErrorToMessage = (error: string): string => {
    switch (error) {
      case 'invalid_credentials':
        return 'Invalid email or password';
      case 'invalid_or_expired_code':
        return 'Code expired or invalid';
      case 'rate_limited':
        return 'Too many attempts. Please wait and try again.';
      case 'network_error':
        return 'Network error. Please check your connection.';
      case 'user_not_found':
        return 'No account found with this email';
      default:
        return error;
    }
  };

  // Show OTP verification screen
  if (mode === 'otp') {
    return (
      <OtpView
        email={email}
        mode="login"
        onSuccess={handleOtpSuccess}
        onBack={() => setMode('initial')}
      />
    );
  }

  // Show forgot password flow (will implement later)
  if (mode === 'password-forgot') {
    // TODO: Implement ForgotPasswordEmailView
    return null;
  }

  // Initial sign-in screen with tabs
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: DumpSackTheme.colors.background,
      padding: DumpSackTheme.spacing.lg,
    }}>
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
      <div style={{ marginBottom: DumpSackTheme.spacing.lg, textAlign: 'center' }}>
        <h1 style={{
          fontSize: DumpSackTheme.typography.fontSize['2xl'],
          fontWeight: DumpSackTheme.typography.fontWeight.bold,
          color: DumpSackTheme.colors.text,
          marginBottom: DumpSackTheme.spacing.xs,
        }}>
          Welcome to DumpSack
        </h1>
        <p style={{
          fontSize: DumpSackTheme.typography.fontSize.sm,
          color: DumpSackTheme.colors.textSecondary,
        }}>
          {activeTab === 'code'
            ? "We'll email you a code to sign in."
            : "Use your password or switch to code."}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: DumpSackTheme.spacing.xs,
        marginBottom: DumpSackTheme.spacing.lg,
        backgroundColor: DumpSackTheme.colors.cardBackground,
        padding: DumpSackTheme.spacing.xs,
        borderRadius: DumpSackTheme.borderRadius.md,
      }}>
        <button
          onClick={() => {
            setActiveTab('code');
            setError('');
          }}
          style={{
            flex: 1,
            padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
            backgroundColor: activeTab === 'code' ? DumpSackTheme.colors.furGreen : 'transparent',
            border: 'none',
            borderRadius: DumpSackTheme.borderRadius.sm,
            color: activeTab === 'code' ? DumpSackTheme.colors.boneWhite : DumpSackTheme.colors.textSecondary,
            fontSize: DumpSackTheme.typography.fontSize.sm,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Code
        </button>
        <button
          onClick={() => {
            setActiveTab('password');
            setError('');
          }}
          style={{
            flex: 1,
            padding: `${DumpSackTheme.spacing.sm}px ${DumpSackTheme.spacing.md}px`,
            backgroundColor: activeTab === 'password' ? DumpSackTheme.colors.furGreen : 'transparent',
            border: 'none',
            borderRadius: DumpSackTheme.borderRadius.sm,
            color: activeTab === 'password' ? DumpSackTheme.colors.boneWhite : DumpSackTheme.colors.textSecondary,
            fontSize: DumpSackTheme.typography.fontSize.sm,
            fontWeight: DumpSackTheme.typography.fontWeight.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Password
        </button>
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

      {/* Code Tab Content */}
      {activeTab === 'code' && (
        <form onSubmit={handleCodeSignIn} style={{ marginBottom: DumpSackTheme.spacing.lg }}>
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
      )}

      {/* Password Tab Content */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSignIn} style={{ marginBottom: DumpSackTheme.spacing.lg }}>
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

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={loading}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
              backgroundColor: DumpSackTheme.colors.cardBackground,
              border: `${DumpSackTheme.borderWidth.normal}px solid ${DumpSackTheme.colors.border}`,
              borderRadius: DumpSackTheme.borderRadius.md,
              color: DumpSackTheme.colors.text,
              fontSize: DumpSackTheme.typography.fontSize.base,
              marginBottom: DumpSackTheme.spacing.sm,
              outline: 'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = DumpSackTheme.colors.furGreen;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = DumpSackTheme.colors.border;
            }}
          />

          <div style={{ textAlign: 'right', marginBottom: DumpSackTheme.spacing.md }}>
            <button
              type="button"
              onClick={() => setMode('password-forgot')}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: DumpSackTheme.colors.furGreen,
                fontSize: DumpSackTheme.typography.fontSize.sm,
                fontWeight: DumpSackTheme.typography.fontWeight.medium,
                cursor: loading ? 'not-allowed' : 'pointer',
                textDecoration: 'underline',
                padding: DumpSackTheme.spacing.xs,
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            style={{
              width: '100%',
              padding: `${DumpSackTheme.spacing.md}px ${DumpSackTheme.spacing.lg}px`,
              backgroundColor: DumpSackTheme.colors.buttonPrimary,
              border: `${DumpSackTheme.borderWidth.thick}px solid ${DumpSackTheme.colors.buttonPrimary}`,
              borderRadius: DumpSackTheme.borderRadius.md,
              color: DumpSackTheme.colors.boneWhite,
              fontSize: DumpSackTheme.typography.fontSize.base,
              fontWeight: DumpSackTheme.typography.fontWeight.semibold,
              cursor: (loading || !email.trim() || !password) ? 'not-allowed' : 'pointer',
              opacity: (loading || !email.trim() || !password) ? 0.5 : 1,
            }}
            className="ds-button-primary"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}

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
        onClick={handleGoogleSignIn}
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

