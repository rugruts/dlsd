# Wallet Persistence - Code Changes Detail

## 1. walletStoreV2.ts - Retry Logic for Session

### saveWalletsToSupabase() - BEFORE
```typescript
async function saveWalletsToSupabase(wallets: any[]): Promise<void> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn('No authenticated user, skipping...');
    return;
  }
  // Save to Supabase...
}
```

### saveWalletsToSupabase() - AFTER
```typescript
async function saveWalletsToSupabase(wallets: any[]): Promise<void> {
  const supabase = getSupabase();
  
  // Retry logic: Wait up to 2.5 seconds for session
  let user = null;
  let retries = 0;
  const maxRetries = 5;
  
  while (!user && retries < maxRetries) {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      user = currentUser;
      break;
    }
    retries++;
    if (retries < maxRetries) {
      console.log(`Waiting for user session... (attempt ${retries}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  if (!user) {
    console.warn('No authenticated user after retries, skipping...');
    return;
  }
  // Save to Supabase...
}
```

---

## 2. walletStoreV2.ts - restoreFromSupabase()

### BEFORE
```typescript
restoreFromSupabase: async () => {
  const restoredWallets = await restoreWalletsFromSupabase();
  if (restoredWallets && restoredWallets.length > 0) {
    await chrome.storage.local.remove(['dumpsack-wallet-v2']);
    set({ wallets: restoredWallets, activeIndex: 0 });
    return true;
  }
  return false;
}
```

### AFTER
```typescript
restoreFromSupabase: async () => {
  const restoredWallets = await restoreWalletsFromSupabase();
  if (restoredWallets && restoredWallets.length > 0) {
    set({ wallets: restoredWallets, activeIndex: 0 });
    await new Promise(resolve => setTimeout(resolve, 100));
    return true;
  }
  return false;
}
```

**Key Change**: Removed `chrome.storage.local.remove()` to avoid race conditions with Zustand's persist middleware.

---

## 3. SignIn.tsx - OAuth Handler

### BEFORE
```typescript
if (result.success) {
  const restored = await restoreFromSupabase();
  if (!restored && wallets.length === 0) {
    const mnemonic = bip39.generateMnemonic(wordlist);
    await importFromMnemonic(mnemonic);
  }
  window.location.reload();
}
```

### AFTER
```typescript
if (result.success) {
  console.log('OAuth authentication successful, restoring wallets...');
  const restored = await restoreFromSupabase();
  const currentWallets = useWalletStore.getState().wallets;
  
  if (!restored && currentWallets.length === 0) {
    const mnemonic = bip39.generateMnemonic(wordlist);
    await importFromMnemonic(mnemonic);
  }
  window.location.reload();
}
```

**Key Changes**:
- Get fresh wallet state from store: `useWalletStore.getState().wallets`
- Added detailed logging
- Same pattern applied to password and OTP handlers

---

## Summary of Fixes

| Issue | Fix |
|-------|-----|
| Session not ready | Added retry logic (5 attempts, 2.5s max) |
| Race condition | Removed storage clearing, let Zustand handle it |
| Wrong wallet state | Get fresh state from store after restoration |
| Silent failures | Added detailed console logging |
| Multiple sign-in methods | Updated OAuth, Password, and OTP handlers |

All changes are backward compatible and don't break existing functionality.

