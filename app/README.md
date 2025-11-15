# DumpSack Wallet App

React Native Expo app for iOS and Android with navigation, NativeWind styling, and Zustand state management.

## Setup

1. Install dependencies: `pnpm install`
2. Copy `.env.example` to `.env` and configure
3. Run: `pnpm start`

## Development

- iOS: `pnpm ios`
- Android: `pnpm android`
- Web: `pnpm web`

## Structure

- `/navigation`: RootNavigator, AuthStack, MainTabs
- `/screens`: Placeholder screens for onboarding, auth, and main features
- `/state`: Zustand stores for wallet, session, and UI
- `/components`: Reusable components like Button and Layout
- `/theme`: Theme configuration