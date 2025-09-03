/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { gold: '#C6A95D' },
      fontFamily: {
        display: ['Cinzel', 'ui-serif', 'serif'],
        medieval: ['"IM Fell English"', 'serif'],
      },
    },
  },
  plugins: [],
}
