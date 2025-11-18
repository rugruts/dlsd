/**
 * Chrome Extension Authentication Service
 * Handles Google OAuth and email magic link authentication
 */

import { getSupabase } from '@dumpsack/shared-utils';
import { AuthEvent, getAuthStateMachine } from '@dumpsack/shared-utils';

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
 * Opens OAuth flow in a new tab that redirects to our callback page
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const authMachine = getAuthStateMachine();
    authMachine.send(AuthEvent.SIGN_IN_START);

    const supabase = getSupabase();

    // Use the extension's auth callback page as the redirect
    const redirectURL = chrome.runtime.getURL('auth-callback.html');

    console.log('Extension OAuth Redirect URL:', redirectURL);

    // Clear any previous auth state
    await chrome.storage.local.remove(['authSuccess', 'authError', 'authTimestamp']);

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
      await chrome.tabs.create({ url: data.url });

      // Return success - the callback page will handle the rest
      // We'll check for completion in the SignIn component
      return { success: true };
    }

    return {
      success: false,
      error: 'No OAuth URL generated',
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
 * Check if OAuth callback was successful
 * Called by the SignIn component to check if auth completed
 */
export async function checkAuthCallback(): Promise<AuthResult | null> {
  try {
    const result = await chrome.storage.local.get(['authSuccess', 'authError', 'userId', 'userEmail']);

    if (result.authSuccess) {
      // Clear the flag
      await chrome.storage.local.remove(['authSuccess', 'authError']);

      return {
        success: true,
        user: {
          id: String(result.userId || ''),
          email: result.userEmail ? String(result.userEmail) : undefined,
          provider: 'google',
        },
      };
    }

    if (result.authError) {
      // Clear the flag
      await chrome.storage.local.remove(['authSuccess', 'authError']);

      return {
        success: false,
        error: String(result.authError || 'Unknown error'),
      };
    }

    return null;
  } catch (error) {
    console.error('Error checking auth callback:', error);
    return null;
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

