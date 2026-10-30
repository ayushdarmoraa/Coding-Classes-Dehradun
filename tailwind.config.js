/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-grid': 'var(--bg-grid)',
        panel: 'var(--panel)',
        ink: 'var(--ink)',
        'ink-2': 'var(--ink-2)',
        'ink-3': 'var(--ink-3)',
        brand: 'var(--brand)',
        'brand-dark': 'var(--brand-dark)',
        'brand-soft': 'var(--brand-soft)',
        success: 'var(--success)',
        error: 'var(--error)',
        whatsapp: 'var(--whatsapp)',
        'tint-blue': 'var(--tint-blue)',
        'tint-lavender': 'var(--tint-lavender)',
        'tint-mint': 'var(--tint-mint)',
        'tint-peach': 'var(--tint-peach)',
      },
      fontFamily: {
        sans: ['var(--font-figtree)', 'sans-serif'],
        display: ['var(--font-outfit)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      backgroundImage: {
        'grad-text': 'var(--grad-text)',
        'navy-grad': 'var(--navy-grad)',
        'violet-grad': 'var(--violet-grad)',
      },
      borderRadius: {
        'dca-sm': '12px',
        'dca-md': '20px',
        'dca-lg': '28px',
      },
      boxShadow: {
        'soft-blue': 'var(--shadow-soft-blue)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
    },
  },
  plugins: [],
};

export default config;
