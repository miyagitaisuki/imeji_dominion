// Tự bật nút "Slide bài giảng" và "Flashcard" cho mọi bài đã có file tương ứng:
//   slides/minna/NN.html        → slide.minna
//   slides/nhap-mon/NN.html     → slide["nhap-mon"]
//   flashcards/minna/NN.html    → flashcard.minna
//   flashcards/nhap-mon/NN.html → flashcard["nhap-mon"]
// Chạy: node scripts/sync-slides.mjs  (ghi đè data/resources.json, giữ nguyên các mục khác)
// Workflow deploy-site.yml chạy script này trên main trước khi deploy.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const resPath = join(root, 'data', 'resources.json');

// Loại tài nguyên → thư mục gốc. Nhóm bài (minna, nhap-mon) là thư mục con bên trong.
// Thêm loại hoặc nhóm mới thì thêm một dòng ở đây.
const kinds = {
  slide: 'slides',
  flashcard: 'flashcards',
};
const groups = ['minna', 'nhap-mon'];

// Chỉ tính file dạng NN.html (không đệm số 0). Bỏ qua _mau.html và mọi file khác.
function lessonsIn(dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  return readdirSync(abs)
    .map((f) => /^(\d+)\.html$/.exec(f))
    .filter(Boolean)
    .map((m) => Number(m[1]))
    .sort((a, b) => a - b);
}

const data = JSON.parse(readFileSync(resPath, 'utf8'));
let changed = false;
for (const [kind, base] of Object.entries(kinds)) {
  const next = { ...(data[kind] ?? {}) };
  for (const group of groups) {
    const lessons = lessonsIn(join(base, group));
    const before = JSON.stringify(next[group] ?? []);
    next[group] = lessons;
    if (JSON.stringify(lessons) !== before) {
      changed = true;
      console.log(`${kind}/${group}: cập nhật → [${lessons.join(', ')}]`);
    } else {
      console.log(`${kind}/${group}: không đổi (${lessons.length} bài).`);
    }
  }
  data[kind] = next;
}

if (changed) writeFileSync(resPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
