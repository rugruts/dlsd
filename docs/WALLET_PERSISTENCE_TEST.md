# Wallet Persistence Testing Guide

## Prerequisites
- Supabase `user_wallets` table created (run `docs/supabase-setup.sql`)
- Extension built and loaded in Chrome
- Browser console open (F12 → Console tab)

## Test 1: First Sign-In Creates Wallet

**Steps:**
1. Open extension popup
2. Sign in with email (e.g., teomatra@gmail.com)
3. Note the wallet address displayed

**Expected Result:**
- ✅ New wallet is created
- ✅ Wallet address is displayed
- ✅ Console shows: "Wallets saved to Supabase successfully"

**Console Output:**
```
Attempting to restore wallets for user: [user-id]
No wallets found in Supabase for user: [user-id]
Wallets saved to Supabase successfully
```

---

## Test 2: Same Email = Same Wallet

**Steps:**
1. Sign out (Settings → Sign Out)
2. Sign in again with the same email
3. Check the wallet address

**Expected Result:**
- ✅ Same wallet address appears (not a new one)
- ✅ Console shows: "Successfully restored X wallet(s) from Supabase"

**Console Output:**
```
User authenticated, restoring wallets from Supabase...
Attempting to restore wallets for user: [user-id]
Successfully restored 1 wallet(s) from Supabase
```

---

## Test 3: Different Device/Browser

**Steps:**
1. Open extension in a different browser (or incognito window)
2. Sign in with the same email
3. Check the wallet address

**Expected Result:**
- ✅ Same wallet address appears
- ✅ Wallets are restored from Supabase

---

## Test 4: After Clearing Browser Storage

**Steps:**
1. Clear browser storage (DevTools → Application → Storage → Clear All)
2. Sign in with the same email
3. Check the wallet address

**Expected Result:**
- ✅ Same wallet address appears
- ✅ Wallets are restored from Supabase

---

## Debugging

### Check Supabase Database
1. Go to Supabase dashboard
2. Navigate to SQL Editor
3. Run: `SELECT * FROM public.user_wallets WHERE user_id = '[your-user-id]';`
4. Verify wallets are stored correctly

### Check Browser Console
- Look for "Wallets saved to Supabase successfully" messages
- Look for "Successfully restored X wallet(s) from Supabase" messages
- Check for any error messages

### Common Issues

**Issue: "No wallets found in Supabase"**
- First sign-in? This is expected - wallet will be created
- Subsequent sign-in? Check if wallet was saved to Supabase

**Issue: Different wallet appears each time**
- Check browser console for errors
- Verify Supabase table exists and has data
- Check RLS policies are correct

**Issue: "Failed to save wallets to Supabase"**
- Check Supabase connection
- Verify RLS policies allow INSERT/UPDATE
- Check user is authenticated

