/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          950: '#07070f',
          900: '#0f0f1a',
          800: '#1a1a2e',
          700: '#252540',
          600: '#2d2d50',
          border: '#3a3a5c',
        },
        violet: {
          accent: '#7c6bff',
          hover: '#6a59f0',
          muted: '#4a3fb0',
          glow: '#9d8fff33',
        },
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
