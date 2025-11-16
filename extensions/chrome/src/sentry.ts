// Optional Sentry init for the extension (background/popup)
// Import in background or popup entry if VITE_ENABLE_SENTRY=true
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/browser');
  const enabled = import.meta?.env?.VITE_ENABLE_SENTRY === 'true';
  if (enabled) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
} catch {
  // Sentry not installed or not needed
}