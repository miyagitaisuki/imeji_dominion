/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './minna/**/*.html',
    './nhap-mon/**/*.html',
    './assets/js/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
      },
      colors: {
        leaf: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        jpblue: {
          800: '#1e293b',
          900: '#0f172a',
        },
        jpRed: '#e63946',
        jpDark: '#1d3557',
        jpLight: '#f1faee',
        jpBlue: '#457b9d',
        jpCyan: '#a8dadc',
      },
    },
  },
  plugins: [],
};
