/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warrior: {
          black: '#0a0a0a',
          surface: '#1a1a1a',
          elevated: '#252525',
          gold: '#d4af37',
          goldMuted: '#a08628',
          red: '#8b0000',
          redBright: '#b91c1c',
          white: '#f5f5f5',
          muted: '#666666',
          subtle: '#333333',
        }
      },
      fontFamily: {
        warrior: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}
