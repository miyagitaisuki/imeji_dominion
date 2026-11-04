// Sinh assets/js/icons.js từ gói lucide (cùng bộ và cùng phiên bản icon với website và eduscan).
// Chạy: npm run build:icons. Thêm icon: thêm tên (theo https://lucide.dev/icons) vào danh sách dưới rồi chạy lại.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "..");
const lucideDir = path.join(path.dirname(require.resolve("lucide/package.json")), "dist", "esm", "icons");
const version = require("lucide/package.json").version;
const out = path.join(root, "assets", "js", "icons.js");
const names = [
  "arrow-left", "arrow-right", "book", "book-open", "chart-line", "check", "circle-check", "cloud", "eye", "eye-off",
  "graduation-cap", "hand", "house", "lightbulb", "list-checks", "log-in", "message-circle", "phone", "rotate-ccw",
  "search", "sprout", "target", "triangle-alert", "trophy", "volume-2", "volume-x", "x", "gamepad-2", "map-pin",
  "languages", "pen-line", "puzzle", "messages-square", "repeat", "chevron-right",
  "presentation", "layers", "maximize", "chevron-left",
];

const attrs = (o) => Object.entries(o).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ");
const icons = {};
for (const n of names) {
  const node = (await import(path.join(lucideDir, `${n}.js`))).default;
  if (!Array.isArray(node)) throw new Error(`Không đọc được icon ${n}`);
  icons[n] = node.map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join("");
}

const body = `// Icon lucide v${version} (ISC license, https://lucide.dev), cùng bộ icon với website và eduscan.
// File sinh tự động bằng scripts/gen-icons.mjs (npm run build:icons), không sửa tay.
// Dùng trong HTML: <i data-icon="house" class="w-4 h-4"></i> (tự đổi thành SVG, kể cả phần tử thêm sau).
// Dùng trong JS: imejiIcon('house', 'w-4 h-4') trả về chuỗi SVG.
(function () {
  var ICONS = ${JSON.stringify(icons, null, 2)};

  function imejiIcon(name, cls) {
    var paths = ICONS[name];
    if (!paths) return '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"' +
      ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="' + (cls || 'w-4 h-4') + ' shrink-0">' + paths + '</svg>';
  }

  function hydrate(root) {
    var list = (root.querySelectorAll ? root.querySelectorAll('i[data-icon]') : []);
    for (var i = 0; i < list.length; i++) {
      var el = list[i];
      var tmp = document.createElement('span');
      tmp.innerHTML = imejiIcon(el.getAttribute('data-icon'), el.getAttribute('class'));
      if (tmp.firstChild) el.replaceWith(tmp.firstChild);
    }
  }

  window.imejiIcon = imejiIcon;
  function start() {
    hydrate(document);
    new MutationObserver(function (records) {
      for (var r = 0; r < records.length; r++) {
        var added = records[r].addedNodes;
        for (var j = 0; j < added.length; j++) {
          var n = added[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('i[data-icon]')) hydrate(n.parentNode || document);
          else hydrate(n);
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
`;
fs.writeFileSync(out, body);
console.log(`Đã sinh ${path.relative(root, out)} (${names.length} icon)`);
