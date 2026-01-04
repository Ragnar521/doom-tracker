/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'doom-red': '#b91c1c',
        'doom-gold': '#d4af37',
        'doom-green': '#22c55e',
        'doom-bg': '#0a0a0a',
      },
      fontFamily: {
        doom: ['AmazDoom', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
    },
  },
  plugins: [],
}
