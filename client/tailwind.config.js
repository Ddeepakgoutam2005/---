/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'civic-blue': {
          DEFAULT: '#0F213A', // Deep navy
          light: '#1E3A5F',
          dark: '#050B14',
        },
        'civic-teal': {
          DEFAULT: '#2C7A7B', // Muted teal
          light: '#4FD1C5',
          dark: '#234E52',
        },
        'civic-amber': {
          DEFAULT: '#D97706', // Subtle amber
          light: '#F59E0B',
          dark: '#B45309',
        },
        'civic-green': {
          DEFAULT: '#059669', // Muted green for success
        },
        'civic-red': {
          DEFAULT: '#DC2626', // Muted red for broken
        },
        'civic-gray': {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
