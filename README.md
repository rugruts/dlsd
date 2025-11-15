# DumpSack Wallet

A native wallet for the Gorbagana blockchain, built as a monorepo with React Native (Expo) for mobile and React+Vite for Chrome extension.

## Structure

- `/app` - React Native Expo mobile app
- `/extensions/chrome` - Chrome MV3 extension
- `/packages/shared-types` - Shared TypeScript types
- `/packages/shared-utils` - Shared utility functions
- `/docs` - Documentation

## Setup

1. Install pnpm: `npm install -g pnpm`
2. Install dependencies: `pnpm install`
3. Set up environment variables (see Environment Configuration below)
4. Set up Firebase project and configure authentication

## Environment Configuration

DumpSack uses a centralized configuration system that supports development, staging, and production environments.

### Root Environment Variables (.env)

Copy `.env.example` to `.env` in the root directory and configure:

```bash
# Environment
NODE_ENV=development

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef123456

# RPC Configuration
EXPO_PUBLIC_GBA_RPC_PRIMARY=https://rpc.gorbagana.wtf/
EXPO_PUBLIC_GBA_RPC_FALLBACK=https://api.mainnet-beta.solana.com

# Swap Configuration
EXPO_PUBLIC_SWAP_AGGREGATOR_URL=https://api.jup.ag
EXPO_PUBLIC_SWAP_API_KEY=your_swap_api_key

# On-Ramp Providers
EXPO_PUBLIC_MOONPAY_ENABLED=false
EXPO_PUBLIC_RAMP_ENABLED=false
EXPO_PUBLIC_TRANSAK_ENABLED=false

# Feature Flags
EXPO_PUBLIC_ENABLE_THRONE_LINKS=true
EXPO_PUBLIC_ENABLE_RUG_RADAR=false
EXPO_PUBLIC_ENABLE_STAKING=false
EXPO_PUBLIC_ENABLE_SWAPS=true
EXPO_PUBLIC_ENABLE_ON_RAMP=false
EXPO_PUBLIC_ENABLE_BACKUP=true
EXPO_PUBLIC_ENABLE_BIOMETRICS=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Extension Environment Variables (extensions/chrome/.env)

Copy `extensions/chrome/.env.example` to `extensions/chrome/.env`:

```bash
# Environment
VITE_ENV=development

# Firebase (same as root)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id

# RPC (VITE_ prefix for Vite)
VITE_GBA_RPC_PRIMARY=https://rpc.gorbagana.wtf/
VITE_GBA_RPC_FALLBACK=https://api.mainnet-beta.solana.com

# Feature flags (VITE_ prefix)
VITE_ENABLE_THRONE_LINKS=true
VITE_ENABLE_SWAPS=true
VITE_ENABLE_BACKUP=true
# ... etc
```

### Environment-Specific Setup

#### Development
- Use `NODE_ENV=development` or `VITE_ENV=development`
- Features are enabled by default for testing
- Use development Firebase project

#### Staging
- Use `NODE_ENV=staging` or `VITE_ENV=staging`
- Mirror production configuration
- Use staging Firebase project

#### Production
- Use `NODE_ENV=production` or `VITE_ENV=production`
- All security features enabled
- Use production Firebase project

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication with desired providers
3. Set up Firestore database
4. Configure security rules (see docs/BACKEND_SYSTEM.md)
5. Get API keys from project settings

### Required Environment Variables

| Variable | Mobile (Expo) | Extension (Vite) | Description |
|----------|---------------|------------------|-------------|
| `FIREBASE_API_KEY` | `FIREBASE_API_KEY` | `VITE_FIREBASE_API_KEY` | Firebase API key |
| `GBA_RPC_PRIMARY` | `EXPO_PUBLIC_GBA_RPC_PRIMARY` | `VITE_GBA_RPC_PRIMARY` | Primary RPC endpoint |
| `ENABLE_SWAPS` | `EXPO_PUBLIC_ENABLE_SWAPS` | `VITE_ENABLE_SWAPS` | Enable swap features |

## Development

- Mobile: `cd app && pnpm start`
- Extension: `cd extensions/chrome && pnpm dev`

## Configuration Usage

The config system automatically loads environment variables and provides typed access:

```typescript
import { appConfig, isFeatureEnabled } from './packages/shared-utils';

// Get RPC configuration
const rpcUrl = appConfig.rpc.primary;

// Check feature flags
if (isFeatureEnabled('enableSwaps')) {
  // Enable swap functionality
}

// Environment detection
const isDev = appConfig.env === 'development';
```

See `app/services/configExamples.ts` and `extensions/chrome/src/services/configExamples.ts` for integration examples.