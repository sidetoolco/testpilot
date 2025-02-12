/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00A67E',
          50: '#E3F9F3',
          100: '#B3EEE1',
          200: '#80E2CE',
          300: '#4DD6BB',
          400: '#00A67E',
          500: '#008F6B',
          600: '#007857',
          700: '#006144',
          800: '#004A30',
          900: '#00331D',
        },
      },
      screens: {
        'custom-hide': { 'max': '1099px' }, // Define un punto de quiebre personalizado
      },
    },
  },
  plugins: [],
}