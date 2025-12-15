import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // BrainGauge color palette
        slate: {
          950: '#0f1419',
          900: '#151b23',
          850: '#1a2129',
          800: '#1f272f',
          750: '#242c35',
        },
        rose: {
          900: '#4a2b3a',
          800: '#6b3d52',
          700: '#8b4f6a',
          600: '#a86382',
          500: '#c2789a',
        },
        teal: {
          600: '#3d8b8b',
          500: '#4fa3a3',
          400: '#6bb8b8',
        },
        status: {
          stable: '#5a8a6f',
          watch: '#9a7d4f',
          concern: '#9a5a5a',
        },
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'count-up': 'countUp 600ms ease-out',
        'fill-bar': 'fillBar 800ms ease-out',
        'draw-line': 'drawLine 1000ms ease-out',
        'pulse-recording': 'pulseRecording 2000ms ease-in-out infinite',
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
        countUp: {
          '0%': { opacity: '0.5', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fillBar: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        pulseRecording: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
