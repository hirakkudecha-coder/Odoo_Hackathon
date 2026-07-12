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
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          light: '#FFEDD5',
          dark: '#9A3412'
        },
        secondary: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7'
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
          dark: '#0F172A'
        },
        brandcard: {
          light: '#FFFFFF',
          dark: '#1E293B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 10px -1px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
