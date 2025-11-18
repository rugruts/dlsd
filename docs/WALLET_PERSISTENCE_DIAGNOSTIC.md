# Wallet Persistence Diagnostic Guide

## Step 1: Check Browser Console Logs

Open the extension popup and check the browser console (F12 → Console tab).

### Expected Logs on First Sign-In:
```
User authenticated, restoring wallets from Supabase...
Waiting for user session to restore wallets... (attempt 1/5)
Attempting to restore wallets for user: [user-id]
No wallets found in Supabase for user: [user-id]
Waiting for user session... (attempt 1/5)
Saving wallets for user: [user-id]
Wallets saved to Supabase successfully for user: [user-id]
```

### Expected Logs on Subsequent Sign-In:
```
User authenticated, restoring wallets from Supabase...
Attempting to restore wallets for user: [user-id]
Successfully restored 1 wallet(s) from Supabase
Wallet restoration result: true
Current wallets after restoration: 1
Setting isAuthenticated to: true
```

**Note:** The retry logic waits up to 2.5 seconds (5 retries × 500ms) for the Supabase session to be established before saving/restoring wallets.

---

## Step 2: Check Supabase Database

1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Run this query:

```sql
SELECT 
  user_id,
  wallets,
  updated_at
FROM public.user_wallets
ORDER BY updated_at DESC
LIMIT 10;
```

### Expected Result:
- Should see your user_id
- Should see wallets array with wallet objects
- Should see recent updated_at timestamp

---

## Step 3: Check RLS Policies

1. Go to Supabase Dashboard
2. Click "Authentication" → "Policies"
3. Look for `user_wallets` table
4. Verify these policies exist:
   - "Users can read own wallets"
   - "Users can insert own wallets"
   - "Users can update own wallets"

---

## Step 4: Manual Test Query

In Supabase SQL Editor, run:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'user_wallets'
);

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_wallets';

-- Check your wallets
SELECT * FROM public.user_wallets 
WHERE user_id = auth.uid();
```

---

## Troubleshooting

### Issue: "No wallets found in Supabase" on every sign-in

**Possible Causes:**
1. Wallets not being saved to Supabase
2. RLS policies blocking INSERT
3. Wrong user_id being used

**Debug Steps:**
1. Check console for "Wallets saved to Supabase successfully"
2. Check Supabase table for any records
3. Verify RLS policies allow INSERT

### Issue: "Failed to save wallets to Supabase"

**Possible Causes:**
1. Supabase connection error
2. RLS policy blocking INSERT
3. Table doesn't exist

**Debug Steps:**
1. Check error message in console
2. Verify table exists in Supabase
3. Check RLS policies

### Issue: Different wallet each time

**Possible Causes:**
1. Wallets not being saved
2. Wallets not being restored
3. New wallet being created instead of restored

**Debug Steps:**
1. Check console logs for save/restore messages
2. Check Supabase database for wallet records
3. Verify restoration logic is working

