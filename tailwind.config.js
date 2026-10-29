/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: "#2f7bf0",
        "brand-dark": "#1d5fd1",
        "brand-soft": "#e6f0ff",
        ink: "#0f1b33",
        "ink-2": "#4b5b78",
        "ink-3": "#7c8aa5",
        panel: "#f6f9ff",
        "tint-blue": "#dcebff",
        "tint-lavender": "#e6deff",
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      borderRadius: {
        "dca-sm": "0.75rem",
        "dca-lg": "1.5rem",
      },
      backgroundImage: {
        "navy-grad": "linear-gradient(135deg, #0a1a38, #173f7a)",
        "brand-soft-grad": "linear-gradient(135deg, #f3f8ff, #ffffff)",
      },
      boxShadow: {
        "soft-blue": "0 20px 50px rgba(30, 70, 160, 0.12)",
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
};

export default config;
