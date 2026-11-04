// Màu, font, bo góc, bóng lấy từ bộ quy chuẩn thương hiệu dùng chung (assets/css/imeji-brand.css).
// Màu đọc giá trị hex trực tiếp từ file đó để Tailwind 3 tạo được biến thể độ trong (VD bg-primary-50/30).
const fs = require('fs');
const path = require('path');

const brandCss = fs.readFileSync(path.join(__dirname, 'assets/css/imeji-brand.css'), 'utf8');
const token = (name) => {
  const m = brandCss.match(new RegExp(`--imeji-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`Thiếu --imeji-${name} trong imeji-brand.css`);
  return m[1];
};
const scale = (group) =>
  Object.fromEntries([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((s) => [s, token(`${group}-${s}`)]));

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
        sans: ['var(--imeji-font-sans)'],
        jp: ['var(--imeji-font-jp)'],
      },
      colors: {
        primary: scale('primary'),
        success: scale('success'),
        warning: scale('warning'),
        danger: scale('danger'),
        accent: scale('accent'),
        slate: { 500: token('slate-500') },
      },
      borderRadius: {
        lg: 'var(--imeji-radius-sm)',
        xl: 'var(--imeji-radius-md)',
        '2xl': 'var(--imeji-radius-lg)',
        '3xl': 'var(--imeji-radius-xl)',
      },
      boxShadow: {
        card: 'var(--imeji-shadow-card)',
        lift: 'var(--imeji-shadow-lift)',
        pop: 'var(--imeji-shadow-pop)',
      },
    },
  },
  plugins: [],
};
