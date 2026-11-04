// Tự bật nút "Slide bài giảng" và "Flashcard" cho mọi bài đã có file tương ứng:
//   slides/minna/NN.html      → slide.minna
//   flashcards/minna/NN.html  → flashcard.minna
// Chạy: node scripts/sync-slides.mjs  (ghi đè data/resources.json, giữ nguyên các mục khác)
// Workflow deploy-site.yml chạy script này trên main trước khi deploy.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const resPath = join(root, 'data', 'resources.json');

// Mỗi loại tài nguyên → thư mục chứa file NN.html. Thêm loại mới thì thêm một dòng ở đây.
const kinds = {
  slide: 'slides/minna',
  flashcard: 'flashcards/minna',
};

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
for (const [kind, dir] of Object.entries(kinds)) {
  const lessons = lessonsIn(dir);
  const before = JSON.stringify(data[kind]?.minna ?? []);
  data[kind] = { ...(data[kind] ?? {}), minna: lessons };
  if (JSON.stringify(lessons) !== before) {
    changed = true;
    console.log(`${kind}: cập nhật → [${lessons.join(', ')}]`);
  } else {
    console.log(`${kind}: không đổi (${lessons.length} bài).`);
  }
}

if (changed) writeFileSync(resPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
