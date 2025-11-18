# Wallet Persistence Fix - Email Account Linking

## Problem
When signing in with the same email (e.g., teomatra@gmail.com) from different browsers or after clearing storage, users would get different wallets instead of their original wallets. This was because:

1. Wallets were stored **only locally** in `chrome.storage.local`
2. They were **NOT linked to the user's email account** in Supabase
3. When the app reloaded, Zustand's persist middleware loaded old wallets from local storage instead of fetching fresh wallets from Supabase

## Root Cause (Multiple Issues)

1. **Zustand persist middleware race condition** - Loaded old wallets from local storage BEFORE Supabase restoration
2. **Session timing issue** - User not authenticated when trying to save/restore wallets to Supabase
3. **No retry logic** - Failed silently when Supabase session wasn't ready yet
4. **Improper state management** - Clearing local storage and updating state created race conditions with Zustand's persist middleware

## Solution
Implemented a **complete wallet persistence system** with proper session handling:

1. **Retry logic for session establishment** - Wait up to 2.5 seconds for Supabase session to be ready
2. **Supabase as source of truth** - Wallets are saved to Supabase when created/added
3. **Proper sign-in flow** - Restore from Supabase IMMEDIATELY after authentication
4. **Zustand sync** - Properly update store state to sync with persist middleware

## Implementation Details

### 1. New Supabase Table: `user_wallets`
```sql
CREATE TABLE public.user_wallets (
  user_id UUID PRIMARY KEY,
  wallets JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

- Stores wallet metadata (index, publicKey, name, hidden status)
- One record per user
- Row-level security ensures users can only access their own wallets

### 2. Updated Wallet Store (`walletStoreV2.ts`)

**New Functions with Retry Logic:**
- `saveWalletsToSupabase(wallets)` - Saves wallet list to Supabase
  - Retries up to 5 times (2.5 seconds) to wait for user session
  - Logs each retry attempt
  - Handles "No authenticated user" gracefully

- `restoreWalletsFromSupabase()` - Retrieves wallets from Supabase
  - Retries up to 5 times (2.5 seconds) to wait for user session
  - Returns null if no wallets found (expected for new users)
  - Handles RLS policy errors gracefully

**Modified Functions:**
- `importFromMnemonic()` - Saves wallets to Supabase after creation
- `addWallet()` - Saves updated wallet list to Supabase
- `restoreFromSupabase()` - Properly updates store state and syncs with Zustand persist middleware

### 3. Updated App Initialization (`wallet-app.tsx`)

**Key Change:** Restore wallets from Supabase on app load BEFORE checking authentication

```typescript
const initializeApp = async () => {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    // User is authenticated - restore wallets from Supabase
    const restored = await restoreFromSupabase();
    const currentWallets = useWalletStore.getState().wallets;
    const hasWallet = currentWallets.length > 0;
    setIsAuthenticated(true && hasWallet);
  }
};
```

### 4. Updated Sign-In Flow (`SignIn.tsx`)

All sign-in methods (OAuth, Password, OTP) now follow this sequence:
1. User authenticates with Supabase
2. **Immediately call `restoreFromSupabase()`** with retry logic
3. Get fresh wallet state from store: `useWalletStore.getState().wallets`
4. Only create new wallet if restoration failed AND no wallets exist
5. Save new wallet to Supabase (with retry logic)
6. Reload app to show authenticated state

This ensures:
- Wallets are restored from Supabase BEFORE checking local state
- No duplicate wallets are created
- Session is properly established before saving/restoring

## How It Works Now

### First Time Sign-In
1. User signs in with email
2. App checks Supabase for wallets (none found)
3. New wallet is created and saved to Supabase
4. User sees their wallet

### Subsequent Sign-Ins (Same Email)
1. User signs in with email
2. App restores wallets from Supabase
3. Local storage is cleared and updated with Supabase data
4. User sees their original wallets ✅

### Different Device/Browser
1. User signs in with email on different device
2. App restores wallets from Supabase
3. User sees their original wallets (not new ones) ✅

### After Clearing Browser Storage
1. User clears browser storage
2. Signs in with email
3. App restores wallets from Supabase
4. User sees their original wallets ✅

## Database Setup

Run the SQL in `docs/supabase-setup.sql` to create the `user_wallets` table with proper RLS policies.

## Testing

To verify the fix works:

1. Sign in with email (e.g., teomatra@gmail.com)
2. Note the wallet address (e.g., HBJB4PSRYMqChDRWgj8ZiaLWuSue1UmaXUcBauBJBR6i)
3. Sign out
4. Uninstall and reinstall the extension (or clear browser storage)
5. Sign in again with the same email
6. **Expected**: Same wallet address appears ✅

## Files Modified

- `extensions/chrome/src/popupApp/stores/walletStoreV2.ts` - Added Supabase sync with logging
- `extensions/chrome/src/popupApp/views/SignIn.tsx` - Updated all sign-in handlers
- `extensions/chrome/src/popupApp/wallet-app.tsx` - Added app-level wallet restoration
- `docs/supabase-setup.sql` - Added user_wallets table

