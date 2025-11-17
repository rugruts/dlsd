/**
 * Email OTP and Password Authentication Adapter
 * Provides dual-mode authentication: OTP (6-digit code) and traditional password
 */

import { getSupabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

export interface OtpRequestResult {
  success: boolean;
  error?: string;
}

export interface OtpVerifyResult {
  success: boolean;
  session?: Session;
  error?: string;
}

export interface PasswordSignInResult {
  success: boolean;
  session?: Session;
  error?: string;
}

export interface PasswordUpdateResult {
  success: boolean;
  error?: string;
}

/**
 * Request an email OTP code
 * Sends a 6-digit code to the user's email
 *
 * @param email - User's email address
 * @param createUser - Whether to create a new user if they don't exist (default: false for sign-in)
 * @returns Promise with success status
 */
export async function requestEmailOtp(
  email: string,
  createUser: boolean = false
): Promise<OtpRequestResult> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: createUser,
        emailRedirectTo: undefined, // No email links
      },
    });

    if (error) {
      console.error('OTP request error:', error);
      return {
        success: false,
        error: normalizeAuthError(error.message),
      };
    }

    return { success: true };
  } catch (error) {
    console.error('OTP request exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP',
    };
  }
}

/**
 * Verify an email OTP code for sign-in
 * Validates the 6-digit code and creates a session
 *
 * @param email - User's email address
 * @param token - 6-digit OTP code
 * @returns Promise with session if successful
 */
export async function verifyEmailOtpSignIn(
  email: string,
  token: string
): Promise<OtpVerifyResult> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });

    if (error) {
      console.error('OTP verification error:', error);
      return {
        success: false,
        error: normalizeAuthError(error.message),
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: 'No session created',
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    console.error('OTP verification exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP',
    };
  }
}

/**
 * Legacy alias for verifyEmailOtpSignIn
 * @deprecated Use verifyEmailOtpSignIn instead
 */
export async function verifyEmailOtp(email: string, code: string): Promise<OtpVerifyResult> {
  return verifyEmailOtpSignIn(email, code);
}

/**
 * Sign in with email and password
 * Traditional password-based authentication
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns Promise with session if successful
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<PasswordSignInResult> {
  try {
    const supabase = getSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      console.error('Password sign-in error:', error);
      return {
        success: false,
        error: normalizeAuthError(error.message),
      };
    }

    if (!data.session) {
      return {
        success: false,
        error: 'No session created',
      };
    }

    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    console.error('Password sign-in exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sign in',
    };
  }
}

/**
 * Set a new password for the current user
 * Used for password reset flow after OTP verification
 *
 * @param password - New password
 * @returns Promise with success status
 */
export async function setNewPassword(password: string): Promise<PasswordUpdateResult> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error('Password update error:', error);
      return {
        success: false,
        error: normalizeAuthError(error.message),
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Password update exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update password',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Sign out exception:', error);
    throw error;
  }
}

/**
 * Normalize Supabase auth errors to standard error codes
 * Maps various error messages to consistent error types
 */
function normalizeAuthError(message: string): string {
  const lowerMessage = message.toLowerCase();

  // Invalid credentials (password sign-in)
  if (
    lowerMessage.includes('invalid login credentials') ||
    lowerMessage.includes('invalid email or password') ||
    lowerMessage.includes('email not confirmed')
  ) {
    return 'invalid_credentials';
  }

  // Invalid or expired OTP code
  if (
    lowerMessage.includes('otp_expired') ||
    lowerMessage.includes('expired') ||
    lowerMessage.includes('token has expired') ||
    lowerMessage.includes('invalid') ||
    lowerMessage.includes('incorrect')
  ) {
    return 'invalid_or_expired_code';
  }

  // Rate limiting
  if (
    lowerMessage.includes('email_rate_limit') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests')
  ) {
    return 'rate_limited';
  }

  // Network errors
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('fetch')
  ) {
    return 'network_error';
  }

  // User not found
  if (lowerMessage.includes('user not found')) {
    return 'user_not_found';
  }

  // Weak password
  if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
    return 'weak_password';
  }

  // Return original message if no mapping found
  return message;
}

/**
 * Legacy error mapper for backward compatibility
 * @deprecated Use normalizeAuthError instead
 */
function mapSupabaseError(message: string): string {
  const normalized = normalizeAuthError(message);

  // Map normalized codes to user-friendly messages
  switch (normalized) {
    case 'invalid_or_expired_code':
      return 'Code expired or invalid. Please request a new one.';
    case 'rate_limited':
      return 'Too many attempts. Please wait a minute and try again.';
    case 'network_error':
      return 'Network error. Please check your connection.';
    case 'invalid_credentials':
      return 'Invalid email or password.';
    default:
      return normalized;
  }
}

