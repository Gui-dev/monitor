import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        card: '#12121a',
        accent: '#f0b429',
        'accent-hover': '#d9a020',
        'text-primary': '#e0e0e0',
        'text-muted': '#6b7280',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        border: '#1e1e2e',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(240, 180, 41, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(240, 180, 41, 0.4)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
