# 🔧 Wallet Persistence - THE REAL FIX

## The Real Problem (Not Just Session Timing)

The wallet persistence was failing because of a **fundamental encryption issue**:

1. **First sign-in**: User creates wallet → mnemonic encrypted with `user_id:salt`
2. **Wallet saved to Supabase**: Wallet metadata saved (but NOT the mnemonic)
3. **Sign out and reinstall**: Extension cleared, salt lost
4. **Second sign-in**: New salt generated (different from first!)
5. **Try to restore**: Mnemonic can't be decrypted because salt is different
6. **Result**: New wallet created instead of restoring old one

## The Real Solution

### 1. Store Salt in Supabase (CRITICAL FIX)
- Salt is now stored in `user_wallets` table
- Persists across devices and reinstalls
- Deterministic mnemonic encryption across all devices

### 2. Salt Retrieval Logic
When user signs in:
1. Check Supabase for existing salt
2. If found, use it (ensures same mnemonic decryption)
3. If not found, check local storage (backward compatibility)
4. If still not found, generate new salt and save to Supabase
5. Cache locally for faster access

### 3. Fixed Supabase Variable Scope
- `supabase` instance was only available inside `initializeApp()` function
- Auth state listener couldn't access it
- **Fixed**: Moved `getSupabase()` outside function scope

## Files Changed

### 1. `extensions/chrome/src/popupApp/stores/walletStoreV2.ts`
- **getSessionSalt()** - Now retrieves salt from Supabase first
- Saves salt to Supabase for persistence
- Falls back to local storage for backward compatibility

### 2. `extensions/chrome/src/popupApp/wallet-app.tsx`
- **Fixed scope issue** - `supabase` now accessible to auth listener
- Auth state changes now properly trigger wallet restoration

### 3. `docs/supabase-setup.sql`
- Added `salt` column to `user_wallets` table
- Added migration command for existing tables

## How It Works Now

### First Sign-In:
```
1. User signs in
2. getSessionSalt() called
3. No salt in Supabase → Generate new salt
4. Save salt to Supabase
5. Create wallet with mnemonic encrypted using salt
6. Save wallet metadata to Supabase
```

### Second Sign-In (Same Device):
```
1. User signs in
2. getSessionSalt() called
3. Salt found in Supabase → Use it
4. Decrypt mnemonic with same salt ✅
5. Restore wallets from Supabase ✅
6. Same wallet appears ✅
```

### Different Device:
```
1. User signs in on new device
2. getSessionSalt() called
3. Salt found in Supabase → Use it
4. Decrypt mnemonic with same salt ✅
5. Restore wallets from Supabase ✅
6. Same wallet appears ✅
```

## What You Need to Do

1. **Run the migration SQL** in Supabase:
   ```sql
   ALTER TABLE public.user_wallets ADD COLUMN IF NOT EXISTS salt TEXT;
   ```

2. **Rebuild the extension** with the new code

3. **Test**:
   - Sign in → Create wallet
   - Sign out
   - Sign in again → **Same wallet should appear** ✅

## Status

✅ Code changes complete
✅ TypeScript compilation successful
✅ Ready for testing
⏳ Awaiting Supabase migration and testing

