# OAuth Callback Setup for Chrome Extension

## Overview

The Chrome extension now has a proper OAuth callback flow for Google Sign-In. Instead of redirecting to `localhost:3000`, it uses a dedicated callback page within the extension.

## How It Works

### 1. **User Clicks "Sign in with Google"**
   - The `signInWithGoogle()` function in `src/services/auth.ts` initiates the OAuth flow
   - It generates a redirect URL pointing to `chrome-extension://YOUR_EXTENSION_ID/auth-callback.html`
   - Opens Google's OAuth page in a new tab

### 2. **User Authorizes on Google**
   - User logs in and grants permissions
   - Google redirects back to `chrome-extension://YOUR_EXTENSION_ID/auth-callback.html#access_token=...&refresh_token=...`

### 3. **Callback Page Processes Tokens**
   - The `auth-callback.html` page loads
   - The `auth-callback.ts` script extracts tokens from the URL hash
   - Calls `supabase.auth.setSession()` to establish the session
   - Stores success/error state in `chrome.storage.local`
   - Redirects back to the extension popup

### 4. **Extension Popup Detects Completion**
   - The `SignIn` component polls `chrome.storage.local` every second while loading
   - When it detects `authSuccess`, it creates a wallet (if needed) and reloads
   - If it detects `authError`, it displays the error message

## Files Created/Modified

### New Files
- `extensions/chrome/auth-callback.html` - OAuth callback page HTML
- `extensions/chrome/src/auth-callback.ts` - OAuth callback handler script
- `extensions/chrome/src/auth-callback.css` - Callback page styles

### Modified Files
- `extensions/chrome/src/services/auth.ts`
  - Updated `signInWithGoogle()` to use `auth-callback.html` as redirect
  - Added `checkAuthCallback()` function to poll for completion
  
- `extensions/chrome/src/popupApp/views/SignIn.tsx`
  - Added `useEffect` hook to poll for auth completion
  - Updated `handleGoogleSignIn()` to keep loading state during OAuth flow
  
- `extensions/chrome/vite.config.ts`
  - Added `auth-callback` to build inputs
  
- `extensions/chrome/manifest.json`
  - Added `auth-callback.html` to `web_accessible_resources`

- `extensions/chrome/src/main.css`
  - Added input text color styles for better readability

## Supabase Configuration

### Required Redirect URLs

In your Supabase project dashboard, go to **Authentication > URL Configuration** and add:

**Development:**
```
chrome-extension://YOUR_DEV_EXTENSION_ID/auth-callback.html
```

**Production:**
```
chrome-extension://YOUR_PROD_EXTENSION_ID/auth-callback.html
```

### Finding Your Extension ID

1. Go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Find "DumpSack Wallet"
4. Copy the ID (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### Google OAuth Setup

Make sure you have:
1. Enabled Google OAuth provider in Supabase
2. Configured Google Cloud Console OAuth credentials
3. Added your extension ID to authorized redirect URIs in Google Cloud Console

## Testing

1. **Build the extension:**
   ```bash
   cd extensions/chrome
   pnpm build
   ```

2. **Load in Chrome:**
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `extensions/chrome/dist`

3. **Test OAuth flow:**
   - Open the extension popup
   - Click "Sign in with Google"
   - A new tab opens with Google's OAuth page
   - After authorizing, you'll see the callback page with a spinner
   - The callback page will close automatically
   - The extension popup will reload with your authenticated state

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the extension ID in Supabase matches your actual extension ID
- Check that the redirect URL format is exactly: `chrome-extension://ID/auth-callback.html`

### Callback page shows error
- Check the browser console for detailed error messages
- Verify Supabase credentials in `.env` file
- Ensure Google OAuth is properly configured

### Extension doesn't detect auth completion
- Check `chrome.storage.local` in DevTools (Application > Storage > Local Storage)
- Look for `authSuccess`, `authError`, `userId`, `userEmail` keys
- Verify the polling interval is running (check console logs)

### Input text not visible
- The CSS now forces input text to be bright (#F3EFD8) and placeholders to be muted (#7A7866)
- If still not visible, check browser zoom level and display settings

## Security Notes

- OAuth tokens are never exposed to external websites
- All communication happens within the extension context
- Tokens are stored securely in `chrome.storage.local`
- The callback page validates tokens before storing them
- Session is established using Supabase's secure `setSession()` method

