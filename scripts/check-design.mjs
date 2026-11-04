// Quy ước giao diện theo bộ quy chuẩn thương hiệu (assets/css/imeji-brand.css):
// không dùng tên màu thô của Tailwind (blue, emerald, amber, rose, sky, purple...) hay mã màu tùy ý bg-[#...]
// trong HTML/JS; dùng primary, success, warning, danger, accent, slate.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = ["index.html", "assets/js/engine.js", "assets/js/loader.js"]
  .concat(fs.readdirSync(path.join(root, "minna")).map((f) => `minna/${f}`))
  .concat(fs.readdirSync(path.join(root, "nhap-mon")).map((f) => `nhap-mon/${f}`));
const raw = /\b(?:bg|text|border|ring|from|via|to|shadow|fill|stroke|divide|outline|placeholder|decoration|caret)(?:-[trblxy])?-(?:blue|emerald|amber|rose|red|indigo|purple|green|orange|teal|pink|sky|violet|yellow|cyan|lime|fuchsia|gray)-\d|\b(?:bg|text|border|from|via|to)-\[#/;

const bad = files.flatMap((f) =>
  fs.readFileSync(path.join(root, f), "utf8").split("\n").flatMap((line, i) => (raw.test(line) ? [`${f}:${i + 1}: ${line.trim().slice(0, 100)}`] : []))
);
if (bad.length) {
  console.error(`Dùng màu thô thay vì màu ngữ nghĩa (${bad.length} chỗ):\n${bad.join("\n")}`);
  process.exit(1);
}
console.log("Giao diện: không có màu thô.");
