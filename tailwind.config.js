/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        // Luxury Obsidian & Ink Palette
        ink: {
          950: '#030712',
          900: '#090D16',
          850: '#0E1424',
          800: '#141D32',
          700: '#1F2B48',
          600: '#334155',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        obsidian: {
          950: '#030712',
          900: '#070A11',
          850: '#0E1424',
          800: '#141D32',
          700: '#1F2B48',
          600: '#334155',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Primary Electric Indigo
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          accent: '#06B6D4', // Luminous Cyan
          emerald: '#10B981', // Crisp Success
          amber: '#F59E0B',
          rose: '#F43F5E',
        },
        asivo: {
          primary: '#4F46E5',
          cyan: '#06B6D4',
          navy: '#090D16',
          dark: '#030712',
          secondary: '#64748B',
          bg: '#FFFFFF',
          'bg-soft': '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-subtle': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(79, 70, 229, 0.35)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.35)',
        'elevated-sm': '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
        'elevated-md': '0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.05)',
        'elevated-lg': '0 24px 48px -12px rgba(15, 23, 42, 0.12), 0 8px 18px -4px rgba(15, 23, 42, 0.06)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}