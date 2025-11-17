# DumpSack Extension Test Pages

This directory contains test pages for manually testing the DumpSack Chrome extension.

## Test Pages

### `approval.html` - Approval UI Test

Tests that all sensitive actions require explicit user approval through the extension's approval UI.

**What it tests:**
- ✅ Connect wallet (requires approval)
- ✅ Sign message (requires approval)
- ✅ Sign transaction (requires approval)
- ✅ Disconnect wallet
- ✅ Get public key (after connection)

**How to use:**

1. Build the extension:
   ```bash
   cd extensions/chrome
   pnpm build
   ```

2. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extensions/chrome/dist` directory

3. Open the test page:
   - Open `approval.html` in Chrome (double-click or drag into browser)
   - Or serve it locally: `python -m http.server 8000` and visit `http://localhost:8000/approval.html`

4. Test the approval flow:
   - Click "Connect Wallet" - an approval popup should appear
   - Approve or reject the connection
   - Try signing a message - another approval popup should appear
   - Verify that no action completes without explicit approval

**Expected behavior:**
- ❌ No auto-approval - every sensitive action must show an approval UI
- ✅ Approval popup opens in a new window
- ✅ User can approve or reject each action
- ✅ Rejected actions throw an error
- ✅ Approved actions complete successfully

## Security Requirements

The extension MUST enforce approval UI for:
1. **connect()** - Connecting to a dApp
2. **signMessage()** - Signing arbitrary messages
3. **signTransaction()** - Signing Solana transactions
4. **signAllTransactions()** - Signing multiple transactions

The extension MUST NOT:
- Auto-approve any sensitive action
- Allow dApps to bypass the approval UI
- Store approval decisions permanently (each action requires fresh approval)

## Troubleshooting

**Extension not detected:**
- Make sure the extension is loaded in `chrome://extensions`
- Check that the extension is enabled
- Reload the test page

**Approval UI not appearing:**
- Check the browser console for errors
- Verify the extension's background script is running
- Check that popup blockers are disabled

**Actions failing:**
- Make sure you're connected first (click "Connect Wallet")
- Check the extension's console for errors (inspect the background page)
- Verify the extension has the correct permissions in `manifest.json`

