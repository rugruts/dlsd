# 🚀 Immediate Action Plan - Wallet Persistence Fix

## What Was Wrong
Wallets weren't persisting because the **encryption salt was lost** when you reinstalled the extension. Each time you signed in, a new salt was generated, making it impossible to decrypt the old mnemonic.

## What I Fixed

### Code Changes (DONE ✅)
1. **Fixed Supabase scope issue** in `wallet-app.tsx`
   - Auth listener can now access Supabase instance
   
2. **Store salt in Supabase** in `walletStoreV2.ts`
   - Salt now persists across devices and reinstalls
   - Mnemonic can be decrypted consistently
   
3. **Updated database schema** in `supabase-setup.sql`
   - Added `salt` column to `user_wallets` table

## What You Need to Do

### Step 1: Update Supabase (5 minutes)
Go to Supabase Dashboard → SQL Editor and run:

```sql
ALTER TABLE public.user_wallets ADD COLUMN IF NOT EXISTS salt TEXT;
```

### Step 2: Rebuild Extension (2 minutes)
```bash
cd extensions/chrome
npm run build
```

### Step 3: Test (5 minutes)
1. Open extension
2. Sign in with your email
3. Create/view wallet → **Note the address**
4. Sign out
5. Sign in again → **Same wallet should appear** ✅

## Expected Results

### Before Fix:
- Sign in → Wallet A
- Sign out → Sign in → Wallet B (different!)
- Sign out → Sign in → Wallet C (different again!)

### After Fix:
- Sign in → Wallet A
- Sign out → Sign in → Wallet A ✅
- Sign out → Sign in → Wallet A ✅
- Different device → Sign in → Wallet A ✅

## If It Still Doesn't Work

Check:
1. **Console logs** (F12 → Console)
   - Look for "Using existing salt from Supabase"
   - Look for "Successfully restored X wallet(s)"
   
2. **Supabase table** (SQL Editor)
   ```sql
   SELECT user_id, salt, wallets FROM public.user_wallets LIMIT 1;
   ```
   - Should see your user_id with salt and wallets

3. **RLS policies** - Verify they allow SELECT, INSERT, UPDATE

## Files Modified
- `extensions/chrome/src/popupApp/stores/walletStoreV2.ts` - Salt persistence
- `extensions/chrome/src/popupApp/wallet-app.tsx` - Fixed scope
- `docs/supabase-setup.sql` - Added salt column

## Status
✅ Code ready
⏳ Awaiting Supabase migration
⏳ Awaiting testing

