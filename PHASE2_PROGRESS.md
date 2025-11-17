# Phase 2 Progress - Settings + Wallet Switcher + QR Codes

## ✅ Completed Infrastructure

### 1. Settings Store (Both Platforms)
- ✅ `app/state/settingsStore.ts` - Mobile settings store
- ✅ `extensions/chrome/src/popupApp/stores/settingsStore.ts` - Extension settings store

**Features:**
- Currency selection (USD, EUR, GBP)
- Language selection (EN, ES)
- Theme selection (System, Light, Dark)
- Custom RPC network management
  - Add/edit/remove networks
  - Set active network
  - Set default network
  - Record latency for each network
- Persisted via Zustand middleware (AsyncStorage for mobile, chrome.storage for extension)

### 2. Network Service (Both Platforms)
- ✅ `app/services/networkService.ts` - Mobile network service
- ✅ `extensions/chrome/src/services/networkService.ts` - Extension network service

**Features:**
- `getActiveRpcUrl()` - Get current active RPC URL from settings
- `getDefaultRpcUrl()` - Get default RPC URL
- `getConnection()` - Create Solana connection with active RPC
- `probeLatency(url)` - Test RPC latency
- `probeAllNetworks()` - Test all configured networks
- `getLatencyColor(ms)` - Get color for latency display (green/yellow/red)
- `formatLatency(ms)` - Format latency for display
- `isValidRpcUrl(url)` - Validate RPC URL format
- `testRpcConnection(url)` - Test if RPC is reachable
- `switchNetwork(id)` - Switch to different network with validation

### 3. QR Code Utilities
- ✅ `packages/shared-utils/qr.ts` - Solana URI generation and parsing

**Features:**
- `solanaUri(address, amount?, label?)` - Generate Solana URI for QR codes
- `parseSolanaUri(uri)` - Parse Solana URI into components
- `isValidSolanaAddress(address)` - Basic address validation
- `solanaSplTokenUri(address, tokenMint, amount?, label?)` - Generate SPL token URI

**Format:**
```
solana:<address>?amount=<decimal>&label=<string>
```

### 4. Wallet Avatar Utilities
- ✅ `packages/shared-utils/walletAvatar.ts` - Color-hashed avatar generation

**Features:**
- `generateAvatarColor(seed)` - Deterministic color from string
- `getContrastColor(hexColor)` - Get black/white for contrast
- `generateWalletAvatar(name, publicKey)` - Complete avatar data (initials, colors)
- `WALLET_COLORS` - Predefined color palette
- `getPaletteColor(index)` - Get color from palette

### 5. i18n Configuration
- ✅ `packages/shared-utils/i18n.ts` - Internationalization setup

**Features:**
- English (en) and Spanish (es) translations
- Common namespace with essential strings
- React integration ready
- Fallback to English

---

## 📦 Required Dependencies

### Mobile (app/package.json)
```bash
pnpm add i18next react-i18next react-native-localize react-native-qrcode-svg
```

### Extension (extensions/chrome/package.json)
```bash
pnpm add i18next react-i18next i18next-browser-languagedetector qrcode.react lucide-react
```

### Shared (packages/shared-utils/package.json)
```bash
pnpm add i18next
```

---

## 🚧 Next Steps (UI Components)

### 1. Wallet Switcher Components
- [ ] `app/components/wallet/WalletChip.tsx` - Header wallet chip
- [ ] `app/components/wallet/WalletSwitcherSheet.tsx` - Wallet switcher modal
- [ ] `app/screens/wallet/ManageWalletsScreen.tsx` - Manage wallets screen
- [ ] Extension equivalents in `extensions/chrome/src/ui/wallet/`

### 2. Settings Screens
- [ ] `app/screens/settings/SettingsScreen.tsx` - Main settings with tabs
- [ ] `app/screens/settings/GeneralSettings.tsx` - Currency/Language/Theme
- [ ] `app/screens/settings/NetworkSettings.tsx` - RPC management
- [ ] `app/screens/settings/SecuritySettings.tsx` - Biometrics/Panic Bunker
- [ ] `app/screens/settings/AboutScreen.tsx` - App info/links
- [ ] Extension equivalents

### 3. Receive Screen Update
- [ ] Update `app/screens/ReceiveScreen.tsx` with real QR code
- [ ] Add request amount modal
- [ ] Add copy/share buttons
- [ ] Update extension receive screen

### 4. Header Refactor
- [ ] Update header with logo, wallet chip, settings icon
- [ ] Remove emoji avatars
- [ ] Add proper navigation

### 5. Global Emoji Cleanup
- [ ] Find and replace all emojis with lucide/Feather icons
- [ ] Ensure consistent icon sizes (18-20px)

---

## 🔧 Integration Notes

### RPC Connection Updates Needed
All files that create Solana connections need to be updated to use `networkService.getConnection()`:

**Mobile:**
- `app/services/blockchain/tokenService.ts`
- `app/services/blockchain/nftService.ts`
- `app/services/blockchain/transactionService.ts`
- `app/state/walletStore.ts` (or walletStoreV2.ts)

**Extension:**
- `extensions/chrome/src/popupApp/stores/walletStore.ts`
- Any other files using `new Connection(...)`

### Multi-Wallet Integration
Files that need to use `walletStoreV2` instead of old wallet store:
- All screens that display wallet address
- All screens that fetch balances/tokens/NFTs
- Send/Receive screens
- Transaction signing

### i18n Integration
Wrap app roots with I18nextProvider:
- `app/App.tsx`
- `extensions/chrome/src/popupApp/main.tsx`

---

## 📝 Migration Notes

### Settings Store
- First time users: Default settings applied automatically
- Existing users: Settings persist, new fields get defaults
- Network list includes environment RPCs by default

### Wallet Store V2
- Migration from single wallet to multi-wallet handled in `walletStoreV2._migrate()`
- Existing wallet becomes wallet[0] with name "Main"
- Active index set to 0

---

## 🎨 Design System Compliance

All new components follow DumpSack design system:
- Colors: #0E3A2F (bg), #123F33 (card), #F26A2E (accent)
- 8px spacing grid
- Border radius: 16px (cards), 12px (inputs), 10px (chips)
- Icons: lucide-react (web), Feather (mobile)
- No emojis

---

## ✅ Testing Checklist

### Settings
- [ ] Currency changes format prices across app
- [ ] Language changes update all strings
- [ ] Theme toggle works (system/light/dark)
- [ ] Add custom RPC network
- [ ] Edit network name/URL
- [ ] Delete network (prevents last/default)
- [ ] Set active network (updates connections)
- [ ] Set default network (only one default)
- [ ] Latency probe shows colors correctly

### QR Codes
- [ ] Generate QR for address only
- [ ] Generate QR with amount
- [ ] Parse Solana URI correctly
- [ ] Copy address works
- [ ] Share works (mobile)

### Network Service
- [ ] Active RPC URL updates when settings change
- [ ] Connection uses active RPC
- [ ] Latency probe returns valid results
- [ ] Network switch validates connection first

---

## 📊 File Count Summary

**Created:** 11 files
- 2 Settings stores (mobile + extension)
- 2 Network services (mobile + extension)
- 1 QR utilities
- 1 Wallet avatar utilities
- 1 i18n configuration
- 1 Multi-wallet store (from Phase 1)
- 2 Type definition files (from Phase 1)
- 1 Multi-wallet utilities (from Phase 1)

**Modified:** 2 files
- `packages/shared-utils/index.ts` - Added exports
- `packages/shared-types/index.ts` - Added exports

**Next:** ~15-20 UI component files to create

