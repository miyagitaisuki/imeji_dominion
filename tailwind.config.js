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
        sans: ['Inter', 'sans-serif'],
        jp: ['Noto Sans JP', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa',
          500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
        },
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
