import type { Config } from "tailwindcss";

export default {
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Clean light palette
        surface: {
          DEFAULT: '#fafafa',
          raised: '#ffffff',
          overlay: '#f4f4f5',
          hover: '#e4e4e7',
        },
        ink: {
          DEFAULT: '#18181b',
          muted: '#52525b',
          faint: '#a1a1aa',
        },
        // Category accent colors - distinctive, not pastels
        category: {
          bureau: '#f59e0b',      // Amber
          cashflow: '#10b981',    // Emerald
          device: '#8b5cf6',      // Violet
          loan: '#ec4899',        // Pink
          platform: '#06b6d4',    // Cyan
          user: '#f97316',        // Orange
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#60a5fa',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
