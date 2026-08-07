import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#05070d',
          900: '#0b0f1a',
          850: '#0f1524',
          800: '#141b2d',
          700: '#1c2438',
          600: '#2a3450',
          border: '#232c44'
        },
        accent: {
          400: '#5b9dff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: [typography]
};
