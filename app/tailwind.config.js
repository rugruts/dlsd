const nativewind = require('nativewind/tailwind/native');
module.exports = {
  content: ['./**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // DumpSack UI Spec v1.2 colors
        background: '#0E3B2E',
        backgroundElevated: '#0A2C22',
        accent: '#1F6F2E',
        accentSoft: '#214E33',
        orange: '#FF6A1E',
        text: '#F3EFD8',
        textSecondary: '#A8B5A9',
        textMuted: '#7B8C83',
        border: '#143F33',
        error: '#FF3B30',
        success: '#45C16F',
        warning: '#FFB52E',
        // Legacy aliases used in existing components
        primary: '#1F6F2E', // accent
        secondary: '#FF6A1E',
        surface: '#0A2C22',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [nativewind],
};