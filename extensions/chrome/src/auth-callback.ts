/**
 * OAuth Callback Handler for Chrome Extension
 * 
 * This page handles the OAuth redirect from Supabase after Google sign-in.
 * It extracts the tokens from the URL hash and stores them, then redirects
 * back to the extension popup.
 */

import { getSupabase } from '@dumpsack/shared-utils';

interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  provider_token?: string;
  provider_refresh_token?: string;
  token_type?: string;
}

function updateStatus(message: string, type: 'loading' | 'success' | 'error' = 'loading') {
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.className = 'status';
    if (type === 'success') statusEl.classList.add('success');
    if (type === 'error') statusEl.classList.add('error');
  }
}

function parseHashParams(): OAuthTokens | null {
  const hash = window.location.hash.substring(1); // Remove the '#'
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: params.get('expires_at') ? parseInt(params.get('expires_at')!) : undefined,
    expires_in: params.get('expires_in') ? parseInt(params.get('expires_in')!) : undefined,
    provider_token: params.get('provider_token') || undefined,
    provider_refresh_token: params.get('provider_refresh_token') || undefined,
    token_type: params.get('token_type') || 'bearer',
  };
}

async function handleOAuthCallback() {
  try {
    updateStatus('Extracting authentication tokens...', 'loading');

    // Parse tokens from URL hash
    const tokens = parseHashParams();

    if (!tokens) {
      throw new Error('No authentication tokens found in URL');
    }

    console.log('OAuth tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });

    updateStatus('Setting up your session...', 'loading');

    // Get Supabase client
    const supabase = getSupabase();

    // Set the session using the tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('Failed to create session');
    }

    console.log('Session created successfully:', {
      userId: data.user?.id,
      email: data.user?.email,
      provider: data.user?.app_metadata?.provider,
    });

    updateStatus('Authentication successful! Redirecting...', 'success');

    // Store success flag in chrome.storage
    await chrome.storage.local.set({
      authSuccess: true,
      authTimestamp: Date.now(),
      userId: data.user?.id,
      userEmail: data.user?.email,
    });

    // Wait a moment for user to see success message
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Close this tab and open the extension popup
    const popupUrl = chrome.runtime.getURL('popup.html');
    
    // Try to update an existing extension tab, or create a new one
    const tabs = await chrome.tabs.query({ url: popupUrl });
    if (tabs.length > 0 && tabs[0].id) {
      // Reload existing popup tab
      await chrome.tabs.reload(tabs[0].id);
      await chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      // Open new popup tab
      await chrome.tabs.create({ url: popupUrl });
    }

    // Close this callback tab after a short delay
    setTimeout(() => {
      window.close();
    }, 500);

  } catch (error) {
    console.error('OAuth callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    updateStatus(`Authentication failed: ${errorMessage}`, 'error');

    // Store error in chrome.storage
    await chrome.storage.local.set({
      authError: errorMessage,
      authTimestamp: Date.now(),
    });

    // Show retry button
    const container = document.querySelector('.container');
    if (container) {
      const button = document.createElement('button');
      button.className = 'button';
      button.textContent = 'Return to Extension';
      button.onclick = () => {
        chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
        window.close();
      };
      container.appendChild(button);
    }
  }
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', handleOAuthCallback);
} else {
  handleOAuthCallback();
}

