module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        asivo: {
          primary: '#2563EB',
          cyan: '#06B6D4',
          navy: '#0B1220',
          dark: '#111827',
          secondary: '#64748B',
          bg: '#FFFFFF',
          'bg-soft': '#F8FAFC',
          border: '#E2E8F0',
        },
      },
      animation: {
        'gradient': 'gradient 3s ease infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}