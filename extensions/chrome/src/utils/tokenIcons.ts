/**
 * DumpSack Wallet - Token Icon Utility
 * Maps token symbols to their official icon paths
 */

export const tokenIcons: Record<string, string> = {
  GOR: '/assets/tokens/gor.png',
  SOL: '/assets/tokens/sol.png',
  USDC: '/assets/tokens/usdc.png',
  default: '/assets/tokens/default.png',
};

/**
 * Get the icon path for a token symbol
 * @param symbol - Token symbol (e.g., 'GOR', 'SOL', 'USDC')
 * @returns Path to the token icon
 */
export function getTokenIcon(symbol: string): string {
  const upperSymbol = symbol.toUpperCase();
  return tokenIcons[upperSymbol] || tokenIcons.default;
}

/**
 * Get the logo path
 */
export const LOGO_PATH = '/assets/logo.png';

/**
 * Get provider icons
 */
export const providerIcons = {
  jupiter: '/assets/jup.jpg',
  moonpay: '/assets/moonpay.png',
};

