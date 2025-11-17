# DumpSack Wallet - Verification Runbook

This document provides step-by-step instructions for verifying the Firebase → Supabase migration and testing all critical functionality.

## Prerequisites

Before starting verification, ensure you have:

1. **Supabase Project Setup**
   - Created a Supabase project at https://app.supabase.com
   - Obtained your project URL and anon key
   - Run the SQL setup script from `docs/supabase-setup.sql`
   - Configured Google OAuth provider in Supabase Auth settings

2. **Environment Variables**
   - Created `.env` files from `.env.example` templates
   - Filled in real Supabase credentials
   - Set appropriate auth redirect URLs for your platform

3. **Dependencies Installed**
   ```bash
   pnpm install
   ```

---

## Phase 1: Code Quality Checks

### 1.1 Install Dependencies

```bash
# From project root
pnpm install
```

**Expected**: All dependencies install without errors.

### 1.2 Type Checking

```bash
# Check all packages
pnpm -r run typecheck

# Or check individually
pnpm --filter @dumpsack/app typecheck
pnpm --filter @dumpsack/extension typecheck
pnpm --filter @dumpsack/shared-utils typecheck
```

**Expected**: 
- No Firebase-related type errors
- No Supabase-related type errors
- Pre-existing type errors are acceptable (documented separately)

### 1.3 Linting

```bash
# Lint all packages
pnpm -r run lint

# Or lint individually
pnpm --filter @dumpsack/app lint
pnpm --filter @dumpsack/extension lint
```

**Expected**: No new linting errors related to Firebase/Supabase migration.

### 1.4 Unit Tests

```bash
# Run all tests
pnpm -r run test

# Or run individually
pnpm --filter @dumpsack/app test
pnpm --filter @dumpsack/shared-utils test
```

**Expected**: All tests pass, especially:
- `packages/shared-utils/__tests__/solanaDerive.spec.ts` - BIP39 derivation tests
- `app/__tests__/alias.spec.ts` - Alias service tests
- `app/__tests__/backupCrypto.spec.ts` - Backup encryption tests

---

## Phase 2: Mobile App Verification

### 2.1 Build Android Preview

```bash
cd app
eas build --platform android --profile preview
```

**Expected**: Build completes successfully and generates APK.

### 2.2 Install and Launch

1. Download the APK from EAS build
2. Install on Android device or emulator
3. Launch the app

**Expected**: App launches without crashes.

### 2.3 Authentication Flow

#### Test 1: Google Sign-In

1. Tap "Sign in with Google"
2. Complete Google OAuth flow
3. Verify redirect back to app

**Expected**:
- ✅ Google OAuth popup appears
- ✅ User can select Google account
- ✅ Redirect back to app works
- ✅ Session is established
- ✅ User ID is displayed

#### Test 2: Email Magic Link

1. Tap "Sign in with Email"
2. Enter email address
3. Check email for magic link
4. Click magic link

**Expected**:
- ✅ Email is sent
- ✅ Magic link opens app
- ✅ Session is established

### 2.4 Alias Registration

1. After sign-in, navigate to alias registration
2. Enter a unique alias (e.g., `testuser123`)
3. Submit registration

**Expected**:
- ✅ Alias is registered successfully
- ✅ Alias becomes unavailable for other users
- ✅ Alias is visible in Supabase dashboard (`public.aliases` table)

**Verify in Supabase**:
```sql
SELECT * FROM public.aliases WHERE alias = 'testuser123';
```

### 2.5 Backup Upload

1. Navigate to Backup settings
2. Create a backup with passphrase `TestPass123!`
3. Upload to cloud

**Expected**:
- ✅ Backup is created successfully
- ✅ Backup is uploaded to Supabase Storage
- ✅ File is visible in Storage bucket `backups/<uid>/backup.json`

**Verify in Supabase**:
- Go to Storage → backups
- Find your user ID folder
- Verify `backup.json` exists

### 2.6 Backup Restore

#### Test 1: Correct Passphrase

1. Delete local wallet data (or use different device)
2. Sign in with same account
3. Restore from cloud backup
4. Enter passphrase `TestPass123!`

**Expected**:
- ✅ Backup is downloaded
- ✅ Decryption succeeds
- ✅ Wallet is restored

#### Test 2: Wrong Passphrase

1. Attempt to restore backup
2. Enter wrong passphrase `WrongPass123!`

**Expected**:
- ❌ Decryption fails with clear error message
- ❌ Wallet is NOT restored

### 2.7 Mnemonic Import

1. Navigate to Import Wallet
2. Enter a known test mnemonic (e.g., from Phantom wallet)
3. Import wallet

**Expected**:
- ✅ Mnemonic is validated
- ✅ Keypair is derived
- ✅ Public key matches Phantom's derivation for same mnemonic

**Test Vector**:
```
Mnemonic: "pill tomorrow foster begin walnut hammer ready consider wait window available push"
Expected Path: m/44'/501'/0'/0'
Expected Public Key: [Compare with Phantom]
```

---

## Phase 3: Chrome Extension Verification

### 3.1 Build Extension

```bash
cd extensions/chrome
pnpm build
```

**Expected**: Build completes successfully, `dist/` folder is created.

### 3.2 Load Extension

1. Open Chrome
2. Navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `extensions/chrome/dist` folder

**Expected**: Extension loads without errors.

### 3.3 Extension Approval UI Test

1. Open `extensions/chrome/test/approval.html` in Chrome
2. Click "Connect Wallet"

**Expected**:
- ✅ Approval popup window opens
- ✅ User must explicitly approve connection
- ✅ No auto-approval

3. Click "Sign Message"

**Expected**:
- ✅ Approval popup opens for signature
- ✅ User must explicitly approve
- ✅ Signature is returned after approval

4. Reject an action

**Expected**:
- ❌ Action is rejected
- ❌ Error is thrown to dApp

### 3.4 Extension Authentication

1. Click extension icon
2. Sign in with Google or Email

**Expected**:
- ✅ Auth flow works
- ✅ Session is established
- ✅ Wallet is initialized

---

## Phase 4: Cross-Platform Sync

### 4.1 Backup from Mobile, Restore on Extension

1. Create backup on mobile app with passphrase `SyncTest123!`
2. Upload to cloud
3. Sign in to extension with same account
4. Restore from cloud with passphrase `SyncTest123!`

**Expected**:
- ✅ Backup is downloaded on extension
- ✅ Decryption succeeds
- ✅ Same wallet is restored
- ✅ Public keys match between mobile and extension

### 4.2 Backup from Extension, Restore on Mobile

1. Create backup on extension with passphrase `SyncTest456!`
2. Upload to cloud
3. Sign in to mobile app with same account
4. Restore from cloud with passphrase `SyncTest456!`

**Expected**:
- ✅ Backup is downloaded on mobile
- ✅ Decryption succeeds
- ✅ Same wallet is restored
- ✅ Public keys match between extension and mobile

---

## Phase 5: Security Verification

### 5.1 Supabase RLS Policies

**Test 1: Alias Privacy**
```sql
-- As user A, try to delete user B's alias
DELETE FROM public.aliases WHERE owner_uid = '<user_b_uid>';
```
**Expected**: ❌ Permission denied (RLS blocks)

**Test 2: Backup Privacy**
- Sign in as User A
- Try to access User B's backup at `backups/<user_b_uid>/backup.json`

**Expected**: ❌ Access denied (RLS blocks)

### 5.2 Passphrase Requirement

1. Attempt to restore backup without passphrase

**Expected**: ❌ Error: "Passphrase is required"

2. Attempt to create backup without passphrase

**Expected**: ❌ Error: "Passphrase is required"

### 5.3 BIP39 Derivation Consistency

1. Import same mnemonic on mobile and extension
2. Compare derived public keys

**Expected**: ✅ Public keys match exactly

---

## Phase 6: Cleanup Verification

### 6.1 No Firebase References

```bash
# Search for Firebase references
grep -r "firebase\|Firestore\|getAnalytics" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v "node_modules" | grep -v ".git"
```

**Expected**: No results (or only in comments/docs)

### 6.2 No Firebase Dependencies

```bash
# Check package.json files
grep -r "firebase" package.json app/package.json extensions/chrome/package.json packages/*/package.json
```

**Expected**: No results

---

## Troubleshooting

### Issue: "Supabase client not initialized"

**Solution**: Check that environment variables are set correctly:
```bash
# Mobile
echo $EXPO_PUBLIC_SB_URL
echo $EXPO_PUBLIC_SB_ANON_KEY

# Extension
echo $VITE_SB_URL
echo $VITE_SB_ANON_KEY
```

### Issue: "Auth redirect not working"

**Solution**: 
1. Check `EXPO_PUBLIC_AUTH_REDIRECT` or `VITE_AUTH_REDIRECT` is set
2. Verify redirect URL is whitelisted in Supabase Auth settings
3. For iOS, use `dumpsack://auth/callback`
4. For Android/Web, use `https://dumpsack.xyz/auth/callback`

### Issue: "Backup decryption fails"

**Solution**:
1. Verify passphrase is correct
2. Check that backup was created with same passphrase
3. Ensure backup file is not corrupted

---

## Sign-Off Checklist

- [ ] All code quality checks pass (typecheck, lint, tests)
- [ ] Mobile app builds successfully
- [ ] Extension builds successfully
- [ ] Google sign-in works on mobile
- [ ] Email magic link works on mobile
- [ ] Alias registration works
- [ ] Backup upload works
- [ ] Backup restore works with correct passphrase
- [ ] Backup restore fails with wrong passphrase
- [ ] Mnemonic import matches Phantom derivation
- [ ] Extension approval UI enforces user consent
- [ ] Cross-platform sync works (mobile ↔ extension)
- [ ] Supabase RLS policies enforce privacy
- [ ] No Firebase references remain in code
- [ ] No Firebase dependencies remain in package.json

---

**Migration Status**: ✅ COMPLETE

**Date**: [Fill in date]

**Verified By**: [Fill in name]

