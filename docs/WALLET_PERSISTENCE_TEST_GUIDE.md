# Wallet Persistence - Testing Guide

## Quick Test (5 minutes)

### Test 1: First Sign-In Creates Wallet
1. Open extension popup
2. Click "Sign in with Google" or enter email for OTP
3. Complete authentication
4. **Expected**: New wallet created and displayed
5. **Note the wallet address** (e.g., `HBJB4PSRYMqChDRWgj8ZiaLWuSue1UmaXUcBauBJBR6i`)

### Test 2: Same Email = Same Wallet
1. Sign out (click profile → Sign out)
2. Sign in again with **same email**
3. **Expected**: **SAME wallet address appears** ✅
4. If different wallet appears, persistence is broken ❌

### Test 3: Different Device/Browser
1. Open extension in **different browser** (Chrome, Firefox, Edge, etc.)
2. Sign in with **same email**
3. **Expected**: **SAME wallet address appears** ✅

### Test 4: After Clearing Storage
1. Open DevTools (F12)
2. Go to Application → Storage → Chrome Storage
3. Delete `dumpsack-wallet-v2` entry
4. Sign in with **same email**
5. **Expected**: **SAME wallet address appears** ✅

---

## Console Logging (For Debugging)

Open DevTools (F12 → Console) and look for these logs:

### On First Sign-In:
```
OAuth authentication successful, restoring wallets...
Waiting for user session to restore wallets... (attempt 1/5)
Attempting to restore wallets for user: [user-id]
No wallets found in Supabase for user: [user-id]
No wallets found, creating new wallet...
Waiting for user session... (attempt 1/5)
Saving wallets for user: [user-id]
Wallets saved to Supabase successfully for user: [user-id]
New wallet created successfully
Authentication complete, reloading...
```

### On Subsequent Sign-In:
```
OAuth authentication successful, restoring wallets...
Attempting to restore wallets for user: [user-id]
Successfully restored 1 wallet(s) from Supabase
Wallet restoration result: true
Current wallets after restoration: 1
Authentication complete, reloading...
```

---

## Supabase Database Check

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Run this query:

```sql
SELECT user_id, wallets, updated_at 
FROM public.user_wallets 
ORDER BY updated_at DESC 
LIMIT 5;
```

**Expected**: Should see your user_id with wallet data

---

## Troubleshooting

### Issue: Different wallet each time
- Check console logs for errors
- Verify Supabase table exists
- Check RLS policies are enabled

### Issue: "No authenticated user" in logs
- Session not ready when saving/restoring
- Retry logic should handle this (up to 2.5 seconds)
- If still failing, check Supabase auth configuration

### Issue: Wallets not saving to Supabase
- Check browser console for error messages
- Verify RLS policies allow INSERT
- Check user_id is being passed correctly

