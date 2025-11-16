# DumpSack v0.1.0 Ship Notes

1) Tag the baseline:
   git tag v0.1.0
   git push origin v0.1.0

2) CI is now gating lint + typecheck + extension build.

3) Optional Sentry:
   - Mobile: set EXPO_PUBLIC_ENABLE_SENTRY=true and EXPO_PUBLIC_SENTRY_DSN in .env
   - Extension: set VITE_ENABLE_SENTRY=true and VITE_SENTRY_DSN in extensions/chrome/.env
   Import app/src/sentry in App.tsx and extensions/chrome/src/sentry in bg/popup entry if enabled.

4) Health probe helpers:
   - App: import getAppHealth() from app/services/health
   - Extension: import extensionHealth() from extensions/chrome/src/health

5) Smoke tests:
   Run pnpm -r test (or add test scripts) to keep core flows green.