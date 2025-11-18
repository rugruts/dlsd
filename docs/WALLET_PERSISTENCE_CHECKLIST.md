# Wallet Persistence - Implementation Checklist

## ✅ Code Changes Completed

- [x] Added retry logic to `saveWalletsToSupabase()` (5 attempts, 2.5s max)
- [x] Added retry logic to `restoreWalletsFromSupabase()` (5 attempts, 2.5s max)
- [x] Fixed `restoreFromSupabase()` to avoid race conditions
- [x] Updated OAuth sign-in handler in SignIn.tsx
- [x] Updated password sign-in handler in SignIn.tsx
- [x] Updated OTP sign-in handler in SignIn.tsx
- [x] Added detailed console logging throughout
- [x] TypeScript compilation successful (no errors)

---

## ✅ Database Setup

- [x] `user_wallets` table created in Supabase
- [x] RLS policies configured
- [x] user_id foreign key set up
- [x] wallets JSONB column configured

**Verify with:**
```sql
SELECT * FROM public.user_wallets LIMIT 1;
```

---

## 📋 Pre-Testing Checklist

Before testing, verify:

- [ ] Extension is built and loaded in Chrome
- [ ] Supabase credentials are correct
- [ ] `user_wallets` table exists in Supabase
- [ ] RLS policies are enabled
- [ ] Browser console is open (F12)
- [ ] You have a test email account ready

---

## 🧪 Testing Checklist

### Test 1: First Sign-In
- [ ] Sign in with email
- [ ] New wallet created
- [ ] Wallet appears in UI
- [ ] Console shows: "Wallets saved to Supabase successfully"
- [ ] Supabase table has new record

### Test 2: Same Email = Same Wallet
- [ ] Sign out
- [ ] Sign in with same email
- [ ] **SAME wallet address appears** ✅
- [ ] Console shows: "Successfully restored X wallet(s) from Supabase"

### Test 3: Different Browser
- [ ] Open extension in different browser
- [ ] Sign in with same email
- [ ] **SAME wallet address appears** ✅

### Test 4: After Clearing Storage
- [ ] Clear browser storage (DevTools → Application → Storage)
- [ ] Sign in with same email
- [ ] **SAME wallet address appears** ✅

### Test 5: Different Sign-In Methods
- [ ] Test with Google OAuth
- [ ] Test with Email OTP
- [ ] Test with Password
- [ ] All should restore same wallet ✅

### Test 6: Multiple Wallets
- [ ] Create first wallet
- [ ] Add second wallet
- [ ] Sign out
- [ ] Sign in again
- [ ] **Both wallets appear** ✅

---

## 🐛 Debugging

If tests fail, check:

1. **Console Logs**
   - Look for error messages
   - Check retry attempts
   - Verify session establishment

2. **Supabase Database**
   ```sql
   SELECT * FROM public.user_wallets 
   WHERE user_id = 'your-user-id';
   ```

3. **RLS Policies**
   - Verify policies allow SELECT, INSERT, UPDATE
   - Check user_id matches auth.uid()

4. **Network Requests**
   - DevTools → Network tab
   - Look for Supabase API calls
   - Check response status codes

---

## ✅ Final Verification

- [ ] All tests pass
- [ ] No console errors
- [ ] Wallets persist across sign-ins
- [ ] Wallets persist across devices
- [ ] Supabase table has correct data
- [ ] Ready for production deployment

---

## 📝 Notes

- Retry logic waits max 2.5 seconds for session
- Wallets are saved to Supabase immediately after creation
- Wallets are restored from Supabase immediately after sign-in
- All sign-in methods (OAuth, Password, OTP) use same flow
- Detailed logging helps with debugging

