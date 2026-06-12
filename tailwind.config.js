/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We will force 'dark' on the html/body element
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'ui-serif', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        oled: {
          950: '#000000',
          900: '#050505',
          800: '#0a0a0a',
          700: '#121212',
          600: '#1a1a1a',
          500: '#262626',
        },
        gold: {
          50: '#fbf8eb',
          100: '#f5eecf',
          200: '#ebd99d',
          300: '#dfbe64',
          400: '#d5a33c',
          500: '#c5862c',
          600: '#aa6721',
          700: '#8c4e1d',
          800: '#733e1c',
          900: '#61341c',
          950: '#c5a059', // Custom highlight gold
        },
        leather: {
          brown: '#2d1b10',
          red: '#3d1212',
          blue: '#132237',
          green: '#122c1e',
          black: '#171717',
          teal: '#0a2e2b',
          purple: '#271536',
        },
        paper: {
          dark: '#1c1c1c',
          darker: '#161616',
          ruled: '#272727',
          amber: '#262118',
        }
      },
      boxShadow: {
        'book': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
        'book-spine': 'inset -10px 0 20px -5px rgba(0, 0, 0, 0.8), 5px 0 15px -3px rgba(0, 0, 0, 0.5)',
        'book-spine-right': 'inset 10px 0 20px -5px rgba(0, 0, 0, 0.8), -5px 0 15px -3px rgba(0, 0, 0, 0.5)',
        'page-left': 'inset -15px 0 30px -5px rgba(0,0,0,0.5), 10px 5px 15px rgba(0,0,0,0.3)',
        'page-right': 'inset 15px 0 30px -5px rgba(0,0,0,0.5), -10px 5px 15px rgba(0,0,0,0.3)',
      },
      aspectRatio: {
        'a4': '1 / 1.4142',
      }
    },
  },
  plugins: [],
}
