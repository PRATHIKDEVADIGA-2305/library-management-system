/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
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
          950: '#082f49',
        },
        library: {
          50: '#f4f7f6',
          100: '#e5eeec',
          200: '#cbe0dc',
          300: '#a3c7c0',
          400: '#75a69e',
          500: '#578c84',
          600: '#43716a',
          700: '#385c57',
          800: '#2f4c48',
          900: '#29413e',
          950: '#152523',
        }
      }
    },
  },
  plugins: [],
}
