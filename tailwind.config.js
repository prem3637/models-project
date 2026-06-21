/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  important: '#root', // To ensure Tailwind utility classes can override MUI defaults easily if needed
  theme: {
    extend: {
      colors: {
        slate: {
          50: 'var(--color-slate-50)',
          100: 'var(--color-slate-100)',
          150: 'var(--color-slate-150)',
          200: 'var(--color-slate-200)',
          300: 'var(--color-slate-300)',
        },
        navy: {
          50: '#faf6f0',
          100: '#f2eae1',
          200: '#e4d5c5',
          300: '#d3bea8',
          400: '#bfa487',
          500: '#ab8e6d',
          600: '#8d7151',
          700: '#70593f',
          800: '#54422f',
          900: '#392c1f',
          950: '#050508', // Luxury deep obsidian black background with a tiny violet tint
          card: '#0f0b18', // Sleek elevated dark purple cards
          border: '#22163b', // Subtle amethyst border
        },
        dark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#454545',
          900: '#3d3d3d',
          950: '#0f0f10', // Deep black for layout
        },
        accent: {
          50: 'var(--color-accent-50)',
          100: 'var(--color-accent-100)',
          200: 'var(--color-accent-200)',
          300: 'var(--color-accent-300)',
          400: 'var(--color-accent-400)',
          500: 'var(--color-accent-500)',
          600: 'var(--color-accent-600)',
          700: 'var(--color-accent-700)',
          800: 'var(--color-accent-800)',
          900: 'var(--color-accent-900)',
          950: 'var(--color-accent-950)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
