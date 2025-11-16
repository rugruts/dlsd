const nativewind = require("nativewind/tailwind/native");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './screens/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b35',
        secondary: '#f7931a',
        background: '#0f0f0f',
        surface: '#1a1a1a',
        text: '#ffffff',
        textSecondary: '#cccccc',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [nativewind],
};