# Encrypted Cloud Backup System

This document describes the encrypted cloud backup system for DumpSack Wallet, enabling secure synchronization between mobile and Chrome extension.

## Overview

The backup system provides:
- **End-to-end encryption**: Keys never stored in plaintext
- **Cross-platform sync**: Mobile ↔ Extension
- **User-controlled**: Opt-in backup with clear consent
- **Secure derivation**: Keys derived from user secrets + entropy

## Architecture

### Crypto Model

```typescript
// Key derivation from user secret
const userSecret = BackupCrypto.generateUserSecret(firebaseUserId);
const salt = BackupCrypto.generateSalt();
const encryptionKey = await BackupCrypto.deriveBackupKey(userSecret, salt);

// AES-GCM encryption
const { encryptedData, iv } = await BackupCrypto.encryptData(encryptionKey, data);
const decryptedData = await BackupCrypto.decryptData(encryptionKey, encryptedData, iv);
```

### Firestore Schema

```typescript
// Collection: userWalletBackups
interface FirestoreBackupDocument {
  userId: string;           // Document ID
  encryptedBackup: string;  // Base64 encrypted payload
  updatedAt: Date;          // Last update timestamp
  version: number;          // Backup format version
}
```

## Mobile Integration

### Wallet Creation Flow

```typescript
// In wallet creation screen
import { backupIntegration } from '../services/backup/backupIntegration';

const handleWalletCreated = async (keyMaterial: BackupKeyMaterial) => {
  // Prompt user to enable backup
  const enabled = await backupIntegration.promptEnableBackup(keyMaterial);
  if (enabled) {
    // Backup is now active
  }
};
```

### Settings Integration

```typescript
// In settings screen
const backupStatus = await backupIntegration.getBackupStatus();

if (backupStatus.hasBackup) {
  // Show backup status and restore option
  const restored = await backupIntegration.restoreFromBackup();
}
```

## Extension Integration

### First-Time Setup

```typescript
// In extension auth flow
import { extensionBackupIntegration } from '../services/backupIntegration';

const handleUserAuthenticated = async (userId: string) => {
  extensionBackupIntegration.initializeForUser(userId);

  const setupResult = await extensionBackupIntegration.handleFirstTimeSetup();
  if (setupResult.restoredFromBackup) {
    // Initialize wallet with restored keys
    initializeWallet(setupResult.keyMaterial);
  } else {
    // Show wallet creation flow
  }
};
```

### Sync Changes

```typescript
// When wallet state changes in extension
const handleWalletUpdate = async (keyMaterial: BackupKeyMaterial) => {
  await extensionBackupIntegration.syncToBackup(keyMaterial);
};
```

## Security Considerations

### Key Handling
- **NEVER** store user secrets or derived keys in persistent storage
- **NEVER** log or expose encryption keys in any form
- Keys exist only in memory during encryption/decryption operations

### User Secrets
```typescript
// TODO: Implement proper secret derivation
static generateUserSecret(firebaseUserId: string): string {
  // WARNING: This is placeholder - implement secure derivation
  // Consider: Firebase UID + device fingerprint + user PIN
  return `backup_secret_${firebaseUserId}_additional_entropy`;
}
```

### Firebase Security Rules
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userWalletBackups/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## TODOs and Critical Security Items

### High Priority
1. **Implement proper user secret derivation**
   - Combine Firebase UID with device-specific entropy
   - Add user PIN/biometric confirmation
   - Location: `BackupCrypto.generateUserSecret()`

2. **Add Firebase initialization**
   - Initialize Firebase app in both mobile and extension
   - Configure Firestore security rules
   - Location: All backup service files

3. **Implement UI prompts**
   - Mobile: Backup enable/disable dialogs
   - Extension: Backup restoration prompts
   - Location: Integration files

4. **Add error handling and retry logic**
   - Network failures during backup operations
   - Decryption failures (wrong password/key)
   - Location: All backup service methods

### Medium Priority
5. **Add backup versioning**
   - Handle format changes over time
   - Migration logic for old backups
   - Location: Backup service classes

6. **Implement backup metadata**
   - Last backup date, size, device info
   - Location: Firestore document structure

7. **Add backup integrity verification**
   - Checksums for encrypted data
   - Tamper detection
   - Location: Crypto utilities

### Low Priority
8. **Add backup compression**
   - Reduce storage size for large key sets
   - Location: Before encryption

9. **Implement backup sharing**
   - QR codes for manual backup transfer
   - Location: Future feature

## Example Usage

### Mobile App - Enable Backup

```typescript
import { backupIntegration } from './services/backup/backupIntegration';

// After wallet creation
const keyMaterial = {
  publicKey: wallet.publicKey.toBase58(),
  privateKey: await wallet.exportPrivateKey(), // ENCRYPTED
};

const enabled = await backupIntegration.promptEnableBackup(keyMaterial);
```

### Extension - Restore Backup

```typescript
import { extensionBackupIntegration } from './services/backupIntegration';

// During auth
extensionBackupIntegration.initializeForUser(userId);
const { restoredFromBackup, keyMaterial } = await extensionBackupIntegration.handleFirstTimeSetup();

if (restoredFromBackup && keyMaterial) {
  // Initialize extension wallet
  await initializeWalletFromBackup(keyMaterial);
}
```

## Testing

### Unit Tests
- Crypto utilities (encryption/decryption)
- Key derivation functions
- Backup service methods

### Integration Tests
- Full backup/restore cycle
- Cross-platform synchronization
- Error scenarios (network failures, corrupted data)

### Security Testing
- Key exposure verification
- Encryption strength validation
- Access control testing

## Dependencies

- `firebase`: Firestore integration
- `@noble/hashes`: For PBKDF2 (if not using Web Crypto)
- `tweetnacl`: For additional crypto operations (optional)

## Migration Notes

When deploying to production:
1. Set up Firebase project with Firestore
2. Configure security rules
3. Initialize Firebase in both apps
4. Test backup/restore flow thoroughly
5. Implement proper user secret derivation
6. Add monitoring for backup operations