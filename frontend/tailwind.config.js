/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tv: {
          bg: '#0a0a0e',
          card: 'rgba(25, 25, 35, 0.45)',
          focus: '#3b82f6', // Sony Bravia inspired glow blue / active state
          text: '#f3f4f6',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'gradient-flow': 'gradient 15s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-breathe': 'glow 4s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        glow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.2))' },
          '50%': { filter: 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6))' },
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
