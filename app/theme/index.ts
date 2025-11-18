export const theme = {
  colors: {
    // DumpSack UI Spec v1.2 colors
    background: '#0E3B2E',
    backgroundElevated: '#0A2C22',
    accent: '#1F6F2E',
    accentSoft: '#214E33',
    orange: '#FF6A1E',
    textPrimary: '#F3EFD8',
    textSecondary: '#A8B5A9',
    textMuted: '#7B8C83',
    border: '#143F33',
    error: '#FF3B30',
    success: '#45C16F',
    warning: '#FFB52E',
    overlay: 'rgba(0,0,0,0.4)',
    // Legacy aliases
    primary: '#1F6F2E',
    secondary: '#FF6A1E',
    backgroundAlt: '#0A2C22',
    surface: '#0A2C22',
    text: '#F3EFD8',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  typography: {
    display: { fontSize: 32, fontWeight: '700' },
    h1: { fontSize: 24, fontWeight: '700' },
    h2: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    small: { fontSize: 14, fontWeight: '400' },
    micro: { fontSize: 12, fontWeight: '500' },
  },
};

export type Theme = typeof theme;