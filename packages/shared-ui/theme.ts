/**
 * DumpSack Wallet Official Brand Theme
 * 
 * Based on the DumpSack mascot (green furry grumpy face with orange eyebrows)
 * Dark, high-contrast memecoin aesthetic with sharp, thick outlines
 */

export const DumpSackTheme = {
  colors: {
    // Primary brand colors from mascot
    primaryGreen: '#0E3B2E',      // Background - dark forest green
    furGreen: '#1F6F2E',          // Accent - vibrant fur green
    eyebrowOrange: '#FF6A1E',     // Accent - signature orange
    boneWhite: '#F3EFD8',         // Text / icons - off-white
    shadowBlack: '#050505',       // Depth, outlines - near black
    
    // Semantic colors
    background: '#0E3B2E',
    surface: '#124A38',           // Slightly lighter than background for cards
    card: '#124A38',
    border: '#0A2C22',            // Darker green for borders
    
    // Text colors
    text: '#F3EFD8',
    textSecondary: '#B8B5A0',     // Muted bone white
    textMuted: '#7A7866',
    
    // Accent colors
    primary: '#FF6A1E',           // Orange for primary actions
    secondary: '#1F6F2E',         // Green for secondary actions
    accent: '#FF6A1E',
    
    // Status colors (trash punk themed)
    success: '#2ECC71',           // Bright green
    warning: '#F39C12',           // Amber
    error: '#E74C3C',             // Red
    info: '#3498DB',              // Blue
    
    // Transparent overlays
    overlay: 'rgba(5, 5, 5, 0.8)',
    overlayLight: 'rgba(5, 5, 5, 0.4)',
    
    // Button states
    buttonPrimary: '#FF6A1E',
    buttonPrimaryHover: '#E65A0E',
    buttonPrimaryActive: '#CC4F08',
    buttonSecondary: '#1F6F2E',
    buttonSecondaryHover: '#2A8F3E',
    buttonSecondaryActive: '#165020',
    buttonDanger: '#E74C3C',
    buttonDangerHover: '#C0392B',
    
    // Input states
    inputBackground: '#0A2C22',
    inputBorder: '#1F6F2E',
    inputBorderFocus: '#FF6A1E',
    inputText: '#F3EFD8',
    inputPlaceholder: '#7A7866',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    full: 9999,
  },
  
  borderWidth: {
    thin: 1,
    normal: 2,
    thick: 3,
    heavy: 4,
  },
  
  typography: {
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

