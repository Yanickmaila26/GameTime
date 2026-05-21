/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        basketball: {
          light: '#FFB74D',
          DEFAULT: '#F57C00',
          dark: '#E65100',
          glow: 'rgba(245, 124, 0, 0.15)',
        },
        electric: {
          light: '#64B5F6',
          DEFAULT: '#1976D2',
          dark: '#0D47A1',
          glow: 'rgba(25, 118, 210, 0.15)',
        },
        darkbg: {
          DEFAULT: '#050505',
          card: '#0d0d0d',
          lighter: '#161616',
          border: '#222222',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(245, 124, 0, 0.2), 0 0 10px rgba(245, 124, 0, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(245, 124, 0, 0.6), 0 0 25px rgba(245, 124, 0, 0.3)' }
        }
      }
    },
  },
  plugins: [],
}
