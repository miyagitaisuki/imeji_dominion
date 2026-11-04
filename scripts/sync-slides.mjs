// Tự bật nút "Slide bài giảng" cho mọi bài đã có file slides/minna/NN.html.
// Chạy: node scripts/sync-slides.mjs  (ghi đè data/resources.json, giữ nguyên các mục khác)
// Workflow deploy-site.yml chạy script này trên main trước khi deploy.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const slideDir = join(root, 'slides', 'minna');
const resPath = join(root, 'data', 'resources.json');

// Chỉ tính file dạng NN.html (không đệm số 0). Bỏ qua _mau.html và mọi file khác.
const lessons = readdirSync(slideDir)
  .map((f) => /^(\d+)\.html$/.exec(f))
  .filter(Boolean)
  .map((m) => Number(m[1]))
  .sort((a, b) => a - b);

const raw = readFileSync(resPath, 'utf8');
const data = JSON.parse(raw);
const before = JSON.stringify(data.slide?.minna ?? []);
data.slide = { ...(data.slide ?? {}), minna: lessons };

if (JSON.stringify(lessons) === before) {
  console.log(`Slide: không đổi (${lessons.length} bài).`);
} else {
  writeFileSync(resPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Slide: đã cập nhật data/resources.json → [${lessons.join(', ')}]`);
}
