# DumpSack Wallet Extension

Chrome Manifest V3 extension providing browser wallet functionality for the DumpSack ecosystem.

## Architecture

- **Manifest V3**: Modern Chrome extension standard
- **Service Worker**: Background script handling wallet state and permissions
- **Content Script**: Injects Solana-compatible provider into web pages
- **Popup UI**: React-based interface for wallet management
- **PostMessage RPC**: Communication between page ↔ content ↔ background

## Features

- Solana-compatible provider injection (`window.dumpSack`)
- Connection management per origin
- Transaction signing (mock implementation)
- Message signing
- Permission-based access control
- Connected sites management
- Mobile wallet sync (placeholder)

## Setup

1. **Install dependencies:**
   ```bash
   cd extensions/chrome
   pnpm install
   ```

2. **Environment configuration:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Development:**
   ```bash
   pnpm dev
   ```
   This starts Vite dev server and watches for changes.

## Build

```bash
pnpm build
```

This creates a production build in the `dist/` directory.

## Loading in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist/` folder from the build output
5. The extension should now be loaded and active

## Development Notes

- **Hot Reload**: Vite provides hot module replacement for popup development
- **Background Script**: Service worker reloads automatically on rebuild
- **Content Script**: Requires extension reload for changes to take effect
- **TypeScript**: Full TypeScript support with shared types from `packages/shared-types`

## Testing

1. **Load the extension** as described above
2. **Test provider injection**: Visit any website and check `window.dumpSack` in console
3. **Test popup**: Click extension icon to open wallet interface
4. **Test connections**: Use a dApp that supports Solana wallets

## Integration Points

- **Mobile Sync**: Placeholder for encrypted backup sync with mobile app
- **Key Management**: Currently uses mock keys; integrate with actual wallet backend
- **Transaction Signing**: Mock implementation; replace with real cryptographic operations
- **Permission UI**: Currently auto-approves; implement proper permission dialogs

## File Structure

```
extensions/chrome/
├── src/
│   ├── App.tsx           # Popup React component
│   ├── main.tsx          # Popup entry point
│   ├── background.ts     # Service worker
│   └── content.ts        # Content script
├── manifest.json         # Extension manifest
├── vite.config.ts        # Vite configuration
├── package.json          # Dependencies
└── dist/                 # Build output
```