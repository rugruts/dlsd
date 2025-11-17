/**
 * Chrome Extension Authentication Service
 * Handles Google OAuth and email magic link authentication
 */

import { getSupabase } from '@dumpsack/shared-utils';
import { AuthState, AuthEvent, getAuthStateMachine } from '@dumpsack/shared-utils';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email?: string;
    provider?: string;
  };
}

/**
 * Sign in with Google OAuth
 * Opens OAuth flow in a new tab using PKCE
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const authMachine = getAuthStateMachine();
    authMachine.send(AuthEvent.SIGN_IN_START);

    const supabase = getSupabase();

    // Use the extension's URL as the redirect
    const redirectURL = chrome.runtime.getURL('popup.html');

    console.log('Extension Redirect URL:', redirectURL);

    // Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectURL,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      authMachine.send(AuthEvent.SIGN_IN_FAILURE, { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }

    // Open OAuth URL in a new tab
    if (data.url) {
      chrome.tabs.create({ url: data.url });

      // The user will complete OAuth in the new tab
      // The session will be automatically set by Supabase via PKCE
      authMachine.send(AuthEvent.SIGN_IN_SUCCESS, {
        userId: '',
        email: '',
        provider: 'google',
      });
    }

    return { success: true };
  } catch (error) {
    const authMachine = getAuthStateMachine();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    authMachine.send(AuthEvent.SIGN_IN_FAILURE, { error: errorMessage });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Sign in with email magic link
 */
export async function signInWithEmail(email: string): Promise<AuthResult> {
  try {
    const authMachine = getAuthStateMachine();
    authMachine.send(AuthEvent.SIGN_IN_START);

    const supabase = getSupabase();

    // Use the extension's URL as the redirect
    const redirectURL = chrome.runtime.getURL('popup.html');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectURL,
      },
    });

    if (error) {
      console.error('Email sign-in error:', error);
      authMachine.send(AuthEvent.SIGN_IN_FAILURE, { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }

    // Magic link sent successfully
    return {
      success: true,
    };
  } catch (error) {
    const authMachine = getAuthStateMachine();
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    authMachine.send(AuthEvent.SIGN_IN_FAILURE, { error: errorMessage });

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    
    const authMachine = getAuthStateMachine();
    authMachine.send(AuthEvent.SIGN_OUT);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  try {
    const supabase = getSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

