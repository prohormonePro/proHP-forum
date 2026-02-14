/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        prohp: {
          50: '#E8F4FC',
          100: '#C5E4F8',
          200: '#8DC9F1',
          300: '#56AEE9',
          400: '#2E9FE1',
          500: '#229DD8',
          600: '#1A7BAA',
          700: '#155E83',
          800: '#10425C',
          900: '#0B2A3B',
          950: '#071A26',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Outfit"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
