/**
 * DumpSack Wallet Official Brand Theme
 * Version: 1.2 (Authoritative)
 *
 * Based on DumpSack UI Specification v1.2
 * "Oscar-the-Grouch fintech wallet with Phantom-level polish"
 * Trashpunk green aesthetic with bold, degen-friendly design
 */

export const DumpSackTheme = {
  colors: {
    // Brand Colors (from UI Spec v1.2)
    background: '#0E3B2E',            // primary green
    backgroundElevated: '#0A2C22',    // darker panels
    accent: '#1F6F2E',                // bright green
    accentSoft: '#214E33',            // subtler accent
    orange: '#FF6A1E',                // highlight color (actions, warnings)

    // Text Colors
    textPrimary: '#F3EFD8',           // soft paper yellow
    textSecondary: '#A8B5A9',         // desaturated green-beige
    textMuted: '#7B8C83',             // muted text

    // Borders
    border: '#143F33',

    // Feedback Colors
    error: '#FF3B30',
    success: '#45C16F',
    warning: '#FFB52E',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',

    // Legacy aliases for backward compatibility
    primaryGreen: '#0E3B2E',
    furGreen: '#1F6F2E',
    eyebrowOrange: '#FF6A1E',
    boneWhite: '#F3EFD8',
    shadowBlack: '#050505',
    surface: '#0A2C22',
    card: '#0A2C22',
    cardBackground: '#0A2C22',
    text: '#F3EFD8',
    primary: '#FF6A1E',
    secondary: '#1F6F2E',
    info: '#3498DB',
    overlayLight: 'rgba(0, 0, 0, 0.2)',

    // Button states
    buttonPrimary: '#FF6A1E',
    buttonPrimaryHover: '#E65A0E',
    buttonPrimaryActive: '#CC4F08',
    buttonSecondary: '#1F6F2E',
    buttonSecondaryHover: '#2A8F3E',
    buttonSecondaryActive: '#165020',
    buttonDanger: '#FF3B30',
    buttonDangerHover: '#E6342A',

    // Input states
    inputBackground: '#0A2C22',
    inputBorder: '#143F33',
    inputBorderFocus: '#FF6A1E',
    inputText: '#F3EFD8',
    inputPlaceholder: '#7B8C83',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  borderRadius: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 24,
    sheet: 28,
    full: 9999,
  },
  
  borderWidth: {
    thin: 1,
    normal: 2,
    thick: 3,
    heavy: 4,
  },

  typography: {
    display: { fontSize: 32, fontWeight: '700' },
    h1:      { fontSize: 24, fontWeight: '700' },
    h2:      { fontSize: 20, fontWeight: '600' },
    h3:      { fontSize: 18, fontWeight: '500' },
    body:    { fontSize: 16, fontWeight: '400' },
    small:   { fontSize: 14, fontWeight: '400' },
    micro:   { fontSize: 12, fontWeight: '500' },

    // Legacy structure for backward compatibility
    fontFamily: {
      primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Menlo, Monaco, "Courier New", monospace',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(5, 5, 5, 0.3)',
    md: '0 4px 6px -1px rgba(5, 5, 5, 0.4)',
    lg: '0 10px 15px -3px rgba(5, 5, 5, 0.5)',
    xl: '0 20px 25px -5px rgba(5, 5, 5, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(5, 5, 5, 0.3)',
  },
  
  animation: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 350,
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
} as const;

export type DumpSackThemeType = typeof DumpSackTheme;

// CSS Variables for web (extension)
export const cssVariables = `
  --ds-bg: ${DumpSackTheme.colors.background};
  --ds-surface: ${DumpSackTheme.colors.surface};
  --ds-card: ${DumpSackTheme.colors.card};
  --ds-border: ${DumpSackTheme.colors.border};
  --ds-green: ${DumpSackTheme.colors.furGreen};
  --ds-orange: ${DumpSackTheme.colors.eyebrowOrange};
  --ds-text: ${DumpSackTheme.colors.text};
  --ds-text-secondary: ${DumpSackTheme.colors.textSecondary};
  --ds-text-muted: ${DumpSackTheme.colors.textMuted};
  --ds-primary: ${DumpSackTheme.colors.primary};
  --ds-secondary: ${DumpSackTheme.colors.secondary};
  --ds-success: ${DumpSackTheme.colors.success};
  --ds-warning: ${DumpSackTheme.colors.warning};
  --ds-error: ${DumpSackTheme.colors.error};
  --ds-info: ${DumpSackTheme.colors.info};
`;

