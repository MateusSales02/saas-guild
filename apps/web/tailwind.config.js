/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Ouro da guilda: única cor de destaque do sistema
        gold: {
          DEFAULT: '#C6A95D',
          50: '#faf6ea',
          100: '#f3ead0',
          200: '#e8d7a6',
          300: '#dcc27c',
          400: '#d1b56a',
          500: '#C6A95D',
          600: '#a98c45',
          700: '#8a7238',
          800: '#6b582c',
          900: '#4d3f20',
        },
        // Obsidiana: superfícies (do fundo para cima)
        ink: {
          950: '#07080b',
          900: '#0b0d12',
          850: '#0f1218',
          800: '#141821',
          750: '#191e29',
          700: '#202634',
          600: '#2b3242',
          500: '#3a4256',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cinzel', 'ui-serif', 'Georgia', 'serif'],
        medieval: ['"IM Fell English"', 'serif'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 20px 40px -24px rgba(0,0,0,0.8)',
        gold: '0 0 0 1px rgba(198,169,93,0.35), 0 8px 24px -8px rgba(198,169,93,0.35)',
        pop: '0 24px 64px -16px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0', transform: 'translateY(4px)' }, to: { opacity: '1', transform: 'none' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
}
