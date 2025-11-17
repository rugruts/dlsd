/**
 * Wallet Avatar Utilities
 * Generate color-hashed avatars for wallets
 */

/**
 * Generate a deterministic color from a string (wallet name or public key)
 * Returns a hex color code
 */
export function generateAvatarColor(seed: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Generate HSL color with good saturation and lightness for dark theme
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = 45 + (Math.abs(hash >> 8) % 15); // 45-60%

  return hslToHex(hue, saturation, lightness);
}

/**
 * Convert HSL to Hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastColor(hexColor: string): '#000000' | '#FFFFFF' {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Generate avatar data for a wallet
 */
export function generateWalletAvatar(name: string, publicKey: string): {
  initials: string;
  backgroundColor: string;
  textColor: string;
} {
  // Get initials from name
  const words = name.trim().split(/\s+/);
  let initials: string;
  
  if (words.length === 1) {
    initials = words[0].substring(0, 2).toUpperCase();
  } else {
    initials = (words[0][0] + words[1][0]).toUpperCase();
  }
  
  // Generate color from public key for consistency
  const backgroundColor = generateAvatarColor(publicKey);
  const textColor = getContrastColor(backgroundColor);
  
  return {
    initials,
    backgroundColor,
    textColor,
  };
}

/**
 * Predefined color palette for wallets (optional, for manual selection)
 */
export const WALLET_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#FFA07A', // Orange
  '#98D8C8', // Mint
  '#F7DC6F', // Yellow
  '#BB8FCE', // Purple
  '#85C1E2', // Sky Blue
  '#F8B739', // Gold
  '#52B788', // Green
];

/**
 * Get a color from the predefined palette by index
 */
export function getPaletteColor(index: number): string {
  return WALLET_COLORS[index % WALLET_COLORS.length];
}

