/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // Orange-500 matching the screenshot
          hover: '#ea580c',   // Orange-600
          light: '#ffedd5',   // Orange-100
          dark: '#c2410c'     // Orange-700
        },
        secondary: {
          DEFAULT: '#0EA5E9',
          hover: '#0284C7',
          light: '#E0F2FE'
        },
        success: {
          DEFAULT: '#22C55E',
          light: '#DCFCE7'
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7'
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2'
        },
        brandbg: {
          light: '#F8FAFC',
          dark: '#0a0a0a' // Deeper black matching the screenshot background
        },
        brandcard: {
          light: '#FFFFFF',
          dark: '#171717' // Slightly elevated dark grey matching the screenshot cards
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 10px -1px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
