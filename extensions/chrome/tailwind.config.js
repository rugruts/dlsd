/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./options.html",
    "./approval.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DumpSack Brand Colors
        primary: '#FF6A1E',           // Orange
        secondary: '#1F6F2E',         // Green
        background: '#0E3B2E',        // Dark forest green
        surface: '#124A38',           // Card background
        card: '#124A38',
        border: '#0A2C22',
        green: '#1F6F2E',
        orange: '#FF6A1E',
        text: '#F3EFD8',              // Bone white
        textSecondary: '#B8B5A0',
        textMuted: '#7A7866',
        success: '#2ECC71',
        warning: '#F39C12',
        error: '#E74C3C',
        info: '#3498DB',
      },
    },
  },
  plugins: [],
}

