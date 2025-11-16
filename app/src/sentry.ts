// Optional Sentry init for React Native (gated by env flags)
// Import this once near app startup if you set EXPO_PUBLIC_ENABLE_SENTRY=true
// Example: in App.tsx — import './src/sentry';
try {
  // Lazy require so dev builds without Sentry still work
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/react-native');
  const enabled = process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true';
  if (enabled) {
    Sentry.init({
      dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: true,
    });
  }
} catch {
  // Sentry not installed or not needed
}