import { getSupabase } from './supabase';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

/**
 * Supabase authentication adapter
 * Provides unified auth methods for both mobile and extension
 */

export interface AuthUser {
  id: string;
  email?: string;
  provider?: string;
}

export type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void;

/**
 * Sign in with Google OAuth
 * @param redirectTo - Optional redirect URL after authentication
 * @param usePKCE - Use PKCE flow (recommended for Chrome extensions)
 */
export async function signInWithGoogle(
  redirectTo?: string,
  usePKCE: boolean = false
): Promise<{ url?: string; error?: Error }> {
  const supabase = getSupabase();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || undefined,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      ...(usePKCE && { flowType: 'pkce' }),
    },
  });

  if (error) {
    return { error: new Error(`Google sign-in failed: ${error.message}`) };
  }

  return { url: data.url };
}

/**
 * Sign in with email magic link
 * @param email - User's email address
 * @param redirectTo - Redirect URL after authentication
 */
export async function signInWithEmailMagicLink(
  email: string,
  redirectTo: string
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    throw new Error(`Email sign-in failed: ${error.message}`);
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
}

/**
 * Get current authenticated user
 * @returns Current user or null if not authenticated
 */
export async function currentUser(): Promise<AuthUser | null> {
  const supabase = getSupabase();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    provider: user.app_metadata?.provider,
  };
}

/**
 * Get current session
 * @returns Current session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Listen to auth state changes
 * @param callback - Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: AuthStateChangeCallback
): () => void {
  const supabase = getSupabase();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(event, session);
    }
  );

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const supabase = getSupabase();

  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    throw new Error(`Session refresh failed: ${error.message}`);
  }

  return session;
}

/**
 * Set session from external source (useful for deep linking)
 * @param accessToken - Access token
 * @param refreshToken - Refresh token
 */
export async function setSession(
  accessToken: string,
  refreshToken: string
): Promise<Session | null> {
  const supabase = getSupabase();

  const { data: { session }, error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    throw new Error(`Set session failed: ${error.message}`);
  }

  return session;
}

