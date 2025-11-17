# Firebase Backend Data Layer

This document describes the Firebase Auth and Firestore backend implementation for DumpSack Wallet.

## Architecture

### Firestore Collections

```typescript
// users/{uid}
interface UserProfile {
  uid: string;
  alias?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
}

// aliases/{alias}
interface AliasDocument {
  alias: string; // Document ID
  userId: string;
  resolvedAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

// throneLinks/{id}
interface ThroneLink {
  id: string; // Document ID
  ownerUserId: string;
  type: 'token' | 'nft' | 'bundle';
  payload: ThroneLinkPayload;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}
```

### Firebase Configuration

```typescript
// packages/shared-utils/index.ts
export class FirebaseConfig {
  getConfig() {
    return {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      // ... other config
    };
  }

  async initializeFirebase() {
    const { initializeApp } = await import('firebase/app');
    return initializeApp(this.getConfig());
  }
}
```

## Service Usage Examples

### User Profile Management

```typescript
import { userService } from '../services/backend/userService';

// Get user profile
const profile = await userService.getUserProfile(userId);

// Update user preferences
await userService.updateUserPreferences(userId, {
  theme: 'dark',
  biometricsEnabled: true,
});

// Set user alias
await userService.setUserAlias(userId, 'myalias');
```

### Alias Management

```typescript
import { aliasService } from '../services/backend/aliasService';

// Register new alias
await aliasService.registerAlias('myalias', walletAddress, userId);

// Resolve alias to address
const address = await aliasService.resolveAlias('@myalias');

// Check availability
const available = await aliasService.isAliasAvailable('newalias');
```

### Throne Links

```typescript
import { throneLinkService } from '../services/backend/throneLinkService';

// Create token throne link
const linkId = await throneLinkService.createThroneLink(
  userId,
  'token',
  {
    tokenMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    amount: '1000000', // 1 USDC
  },
  24 // expires in 24 hours
);

// Get throne link
const throneLink = await throneLinkService.getThroneLink(linkId);

// Mark as used
await throneLinkService.markThroneLinkUsed(linkId, recipientUserId);
```

## Authentication Integration

### Supabase Auth Setup

```typescript
// In auth service
import { SupabaseAuth } from '@dumpsack/shared-utils';

// Sign in with Google
await SupabaseAuth.signInWithGoogle('https://your-app.com/callback');

// Sign in with Email Magic Link
await SupabaseAuth.signInWithEmailMagicLink('user@example.com', 'https://your-app.com/callback');

// Get current session
const session = await SupabaseAuth.getSession();
const userId = session?.user.id;

// Get current user
const user = await SupabaseAuth.currentUser();

// Listen to auth state changes
const unsubscribe = SupabaseAuth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event, session);
});
```

### User Profile Creation

```typescript
// After Supabase auth signup
const session = await SupabaseAuth.getSession();
const userId = session?.user.id;

// Create initial user profile
await userService.upsertUserProfile(userId, {
  preferences: {
    theme: 'system',
    language: 'en',
    biometricsEnabled: false,
    notificationsEnabled: true,
  },
});
```

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Aliases are publicly readable but only owner can modify
    match /aliases/{alias} {
      allow read: if true;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/aliases/$(alias)).data.userId == request.auth.uid;
    }

    // Throne links: owner can read/write, others can read if not expired
    match /throneLinks/{linkId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        resource.data.ownerUserId == request.auth.uid;
    }
  }
}
```

## TODOs and Critical Implementation Notes

### High Priority
1. **Environment Variables Setup**
   - Set up Firebase project and get API keys
   - Configure environment variables in both mobile and extension
   - Location: `.env` files and CI/CD pipelines

2. **Firebase Initialization**
   - Ensure Firebase is initialized once per platform
   - Handle initialization errors gracefully
   - Location: App startup code

3. **Error Handling**
   - Implement comprehensive error handling for network failures
   - Add retry logic for Firestore operations
   - Location: All service methods

4. **Data Validation**
   - Validate user inputs before Firestore operations
   - Sanitize data to prevent injection attacks
   - Location: Service input validation

### Medium Priority
5. **Offline Support**
   - Implement Firestore offline persistence
   - Handle sync conflicts
   - Location: Firebase configuration

6. **Throne Link Security**
   - Add proper authorization for throne link usage
   - Implement rate limiting
   - Location: `markThroneLinkUsed` method

7. **Alias Search Optimization**
   - Implement proper search indexing (consider Algolia)
   - Current implementation is inefficient for large datasets
   - Location: `searchAliases` method

### Low Priority
8. **Data Migration**
   - Plan for schema changes and data migrations
   - Version throne link payloads
   - Location: Future schema updates

9. **Analytics Integration**
   - Track user behavior and throne link usage
   - Implement Firebase Analytics
   - Location: User interaction points

10. **Backup and Recovery**
    - Implement automated backups of critical data
    - Plan for disaster recovery
    - Location: Admin operations

## Testing Strategy

### Unit Tests
- Service method functionality
- Data validation
- Error handling

### Integration Tests
- Firebase Auth flow
- Firestore CRUD operations
- Cross-platform data sync

### End-to-End Tests
- Complete user registration flow
- Alias creation and resolution
- Throne link creation and usage

## Performance Considerations

- **Firestore Queries**: Use compound queries and proper indexing
- **Real-time Updates**: Implement listeners for live data where needed
- **Caching**: Cache frequently accessed data (user profiles, aliases)
- **Pagination**: Implement pagination for large result sets

## Monitoring and Maintenance

- **Firebase Console**: Monitor usage and performance
- **Error Tracking**: Implement error reporting (Sentry, Crashlytics)
- **Data Cleanup**: Regular cleanup of expired throne links
- **Backup Strategy**: Regular Firestore exports for disaster recovery

## Migration to Production

1. Create Firebase project
2. Set up authentication providers
3. Deploy Firestore security rules
4. Configure environment variables
5. Test all flows thoroughly
6. Implement monitoring and alerting
7. Plan data migration from development