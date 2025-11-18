# DumpSack UI Specification v1.2 - Implementation Status

## ✅ Completed

### 1. Design Tokens (Section 1)
- ✅ **Colors** - Updated `packages/shared-ui/theme.ts` with authoritative colors from spec
  - `background: '#0E3B2E'`
  - `backgroundElevated: '#0A2C22'`
  - `accent: '#1F6F2E'`
  - `accentSoft: '#214E33'`
  - `orange: '#FF6A1E'`
  - `textPrimary: '#F3EFD8'`
  - `textSecondary: '#A8B5A9'`
  - `textMuted: '#7B8C83'`
  - `border: '#143F33'`
  - `error: '#FF3B30'`
  - `success: '#45C16F'`
  - `warning: '#FFB52E'`

- ✅ **Typography** - Added spec-compliant typography tokens
  - `display: { fontSize: 32, fontWeight: '700' }`
  - `h1: { fontSize: 24, fontWeight: '700' }`
  - `h2: { fontSize: 20, fontWeight: '600' }`
  - `h3: { fontSize: 18, fontWeight: '500' }`
  - `body: { fontSize: 16, fontWeight: '400' }`
  - `small: { fontSize: 14, fontWeight: '400' }`
  - `micro: { fontSize: 12, fontWeight: '500' }`

- ✅ **Spacing** - Updated to match spec
  - `xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24`

- ✅ **Radii** - Updated to match spec
  - `xs: 8, sm: 10, md: 12, lg: 16, xl: 24, sheet: 28`

### 2. UI Components (Section 3)
- ✅ **DSButton** - `packages/shared-ui/components/DSButton.tsx`
  - Variants: primary, secondary, ghost, danger
  - fullWidth support
  - Press opacity: 0.9
  - Disabled opacity: 0.5

- ✅ **DSCard** - `packages/shared-ui/components/DSCard.tsx`
  - Background: backgroundElevated
  - Padding: spacing.lg
  - Optional title

- ✅ **DSInput** - `packages/shared-ui/components/DSInput.tsx`
  - Rounded, bordered
  - Left/right icon support
  - Placeholder uses textMuted
  - Focus state with orange border

- ✅ **DSHeader** - `packages/shared-ui/components/DSHeader.tsx`
  - Height: 56px
  - Structure: | Left Icon | Center Title | Right Icon(s) |

- ✅ **DSQuickAction** - `packages/shared-ui/components/DSQuickAction.tsx`
  - Size: 72×72
  - Background: backgroundElevated
  - Icon size: 28px
  - Label: small text

- ✅ **DSTokenRow** - `packages/shared-ui/components/DSTokenRow.tsx`
  - Token icon, name, balance, fiat value, chevron
  - Hover state

- ✅ **DSScreen** - `packages/shared-ui/components/DSScreen.tsx`
  - Wrapper with background color
  - Horizontal padding: spacing.lg

### 3. OAuth Callback Flow
- ✅ **auth-callback.html** - Dedicated OAuth callback page
- ✅ **auth-callback.ts** - Token extraction and session setup
- ✅ **Updated auth.ts** - Uses callback page as redirect URL
- ✅ **SignIn polling** - Checks chrome.storage for auth completion

### 4. Input Text Visibility
- ✅ **CSS fixes** - Input text now bright white (#F3EFD8)
- ✅ **Placeholder styling** - Muted gray (#7B8C83)

## 🚧 In Progress / TODO

### 5. Screen Refactoring (Section 4)

#### 4.1 Home Screen - NEEDS REFACTORING
**Current:** Mixed inline styles, not following spec layout
**Required:**
```
1. Top App Bar (DSHeader)
   - Left: DumpSack icon
   - Center: Network badge (GOR / SOL)
   - Right: Settings icon

2. Account Strip
   - Avatar (initials)
   - Name: "Main"
   - Address short: X5g...wz3
   - Chevron → Account switcher

3. Balance Card
   - 0.0000 GOR (display font)
   - $0.00 (secondary)
   - 24h change pill

4. Quick Actions (non-scrollable)
   - Receive, Send, Swap, Backup
   - Use DSQuickAction component

5. Token List (scrollable)
   - Use DSTokenRow component

6. Bottom Tab Bar (fixed)
```

**Files to update:**
- `extensions/chrome/src/popupApp/views/Dashboard.tsx`
- `app/screens/HomeScreen.tsx`

#### 4.2 Receive Screen - NEEDS REFACTORING
**Required:**
- DSHeader: "Receive Tokens"
- Account selector
- Large QR Code
- Full address field with copy button
- "Request amount" button

**Files to update:**
- `extensions/chrome/src/popupApp/views/Receive.tsx`
- `app/screens/ReceiveScreen.tsx`

#### 4.3 Send Screen - NEEDS REFACTORING
**Required:**
- DSHeader: "Send Tokens"
- Token selector (modal)
- Address input + "Paste" button
- Amount input + "Use Max" button
- Fee preview card
- "Review" button (primary)

**Files to update:**
- `extensions/chrome/src/popupApp/views/Send.tsx`
- `app/screens/SendScreen.tsx`

#### 4.4 Swap Screen - NEEDS REFACTORING
**Required:**
- DSHeader: "Swap"
- "You Pay" card (input + token selector)
- Arrow button (swap tokens)
- "You Receive" card (readonly)
- Provider row (Jupiter / Gorbagana AMM)
- Price impact row
- Fee row
- "Review Swap" button

**Files to update:**
- `extensions/chrome/src/popupApp/views/Swap.tsx`
- `app/screens/SwapScreen.tsx`

### 6. Missing Components

#### DSTabBar (Section 3.5) - NOT CREATED
**Spec:**
- Height: 64px
- Background: backgroundElevated
- Icons: 24px
- Label: 12px
- Tabs: Home, Tokens, NFTs, Settings

**Create:**
- `packages/shared-ui/components/DSTabBar.tsx`

#### DSNFTRow (Section 3.8) - NOT CREATED
**Spec:**
- Thumbnail, Name, Collection, Chevron

**Create:**
- `packages/shared-ui/components/DSNFTRow.tsx`

#### DSToast (Section 3.9) - NOT CREATED
**Spec:**
- Colors: success, error, warning
- Duration: 2800ms
- Placement: top or bottom

**Create:**
- `packages/shared-ui/components/DSToast.tsx`

### 7. Extension Layout Constraints (Section 2.2)

#### Fixed Width: 360px - NOT ENFORCED
**Current:** Extension uses default popup width
**Required:** Set fixed width in CSS

**Update:**
- `extensions/chrome/src/main.css` - Add `#root { width: 360px; }`

#### Bottom Navigation Fixed - NOT IMPLEMENTED
**Current:** No bottom navigation in extension
**Required:** Add DSTabBar at bottom, always visible

### 8. Settings Screen (Section 4.8) - NOT IMPLEMENTED
**Required sections:**
- General (Currency, Language, Network)
- Security (Biometric, Auto-lock)
- Backup (Export/Import)
- About (Version, Links)

### 9. Staking Screens (Section 4.9) - NOT IMPLEMENTED
**Required:**
- Staking Home (Staked Balance, Rewards, Validators list)
- Validator Details (Name, Commission, APY, Stake/Unstake)

### 10. NFT Screens (Section 4.6, 4.7) - NOT IMPLEMENTED
**Required:**
- NFTs Screen (Grid of thumbnails)
- NFT Details (Large image, Name, Collection, Send button, Attributes)

## 📋 Implementation Priority

### Phase 1: Core Components (DONE ✅)
1. ✅ Design tokens
2. ✅ DSButton, DSCard, DSInput, DSHeader
3. ✅ DSQuickAction, DSTokenRow, DSScreen

### Phase 2: Navigation & Layout (NEXT)
1. ⏳ Create DSTabBar component
2. ⏳ Set extension fixed width (360px)
3. ⏳ Add bottom navigation to extension
4. ⏳ Refactor Home screen layout

### Phase 3: Screen Refactoring
1. ⏳ Refactor Receive screen
2. ⏳ Refactor Send screen
3. ⏳ Refactor Swap screen
4. ⏳ Implement Settings screen

### Phase 4: Advanced Features
1. ⏳ Create DSToast component
2. ⏳ Create DSNFTRow component
3. ⏳ Implement NFT screens
4. ⏳ Implement Staking screens

## 🎯 Next Steps

1. **Create DSTabBar** - Bottom navigation component
2. **Set Extension Width** - Add `width: 360px` to root
3. **Refactor Dashboard** - Use new components, follow spec layout
4. **Test OAuth Flow** - Verify Google sign-in works with callback page
5. **Continue screen refactoring** - One screen at a time

## 📝 Notes

- All new components are exported from `packages/shared-ui/index.ts`
- Theme is backward compatible (legacy aliases included)
- Extension builds successfully
- OAuth callback flow is fully implemented and ready to test

