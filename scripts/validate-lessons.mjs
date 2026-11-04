// Kiểm tra dữ liệu bài học data/minna/NN.json theo schema chung (xem README) và các quy tắc của engine.
// Chạy: npm run validate  (thoát mã 1 nếu có lỗi)
import fs from 'node:fs';
import path from 'node:path';

const dir = path.resolve(import.meta.dirname, '..', 'data', 'minna');
const LEVELS = ['easy', 'medium', 'hard'];
const HAS_MARKUP = /[{}|<>]/; // trường kana thuần: không furigana {漢字|よみ}, không HTML

let errors = 0;
let warnings = 0;

function check(file) {
  const problems = [];
  const warns = [];
  const err = (m) => problems.push(m);
  const warn = (m) => warns.push(m);

  let d;
  try {
    d = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  } catch (e) {
    err(`JSON không hợp lệ: ${e.message}`);
    return report(file, problems, warns);
  }

  const m = /^(\d{2})\.json$/.exec(file);
  const c = d.config ?? {};
  if (!m) err('Tên file phải dạng NN.json (2 chữ số)');
  else {
    if (c.lessonNo !== Number(m[1])) err(`config.lessonNo (${c.lessonNo}) không khớp tên file`);
    if (c.storagePrefix !== `mnn_l${m[1]}`) err(`config.storagePrefix phải là "mnn_l${m[1]}" (giữ nguyên để không mất tiến độ đã lưu), đang là "${c.storagePrefix}"`);
  }
  if (!c.title) err('Thiếu config.title');
  if (!['N5', 'N4', 'N3', 'N2', 'N1'].includes(c.jlpt)) err(`config.jlpt sai: ${c.jlpt}`);

  const games = { game1: d.game1, game2: d.game2, game3: d.game3, game4: d.game4 };
  for (const [k, v] of Object.entries(games)) if (!Array.isArray(v) || v.length === 0) err(`Thiếu hoặc rỗng: ${k}`);
  if (problems.length && Object.values(games).some((v) => !Array.isArray(v))) return report(file, problems, warns);

  const ids = new Set();
  const common = (q, tag) => {
    const at = `${tag} ${q.id ?? '(không id)'}`;
    if (!q.id) err(`${at}: thiếu id`);
    else if (ids.has(q.id)) err(`${at}: trùng id`);
    else ids.add(q.id);
    if (!LEVELS.includes(q.level)) err(`${at}: level sai "${q.level}"`);
    const e = q.explanation ?? {};
    if (!e.correct || !e.pitfalls || !e.tip) warn(`${at}: thiếu explanation.correct/pitfalls/tip`);
    return at;
  };
  const kana = (v, at, field) => {
    if (typeof v !== 'string' || !v) err(`${at}: ${field} rỗng`);
    else if (HAS_MARKUP.test(v)) err(`${at}: ${field} phải là kana thuần, đang có ký tự {}|<>: "${v}"`);
  };
  const balanced = (v, at, field) => {
    if (typeof v !== 'string') return;
    const open = (v.match(/\{/g) ?? []).length;
    const close = (v.match(/\}/g) ?? []).length;
    if (open !== close) err(`${at}: ${field} có ngoặc furigana {} không khớp: "${v}"`);
  };

  for (const q of d.game1) {
    const at = common(q, 'game1');
    kana(q.answer, at, 'answer');
    if (!Array.isArray(q.distractors) || q.distractors.length !== 3) err(`${at}: cần đúng 3 distractors`);
    else q.distractors.forEach((x) => kana(x, at, 'distractors'));
    if (q.distractorsKanji?.length && q.distractorsKanji.length !== q.distractors?.length) warn(`${at}: distractorsKanji khác số lượng distractors`);
    balanced(q.kanji, at, 'kanji');
    q.distractorsKanji?.forEach((x) => balanced(x, at, 'distractorsKanji'));
  }
  for (const q of d.game2) {
    const at = common(q, 'game2');
    if (!/＿/.test(q.sentence ?? '')) err(`${at}: sentence thiếu chỗ trống ＿`);
    if (!Array.isArray(q.options) || !q.options[q.correctIndex]) err(`${at}: correctIndex sai`);
    else q.options.forEach((o) => balanced(o.kanji, at, 'options.kanji'));
    balanced(q.sentence, at, 'sentence');
  }
  for (const q of d.game3) {
    const at = common(q, 'game3');
    if (!q.vietnamese) err(`${at}: thiếu vietnamese`);
    const texts = (q.blocks ?? []).map((b) => b.text);
    if (texts.length < 2) err(`${at}: cần ít nhất 2 khối`);
    texts.forEach((t) => kana(t, at, 'blocks.text'));
    if (!Array.isArray(q.acceptableOrders) || q.acceptableOrders.length === 0) err(`${at}: thiếu acceptableOrders`);
    else
      q.acceptableOrders.forEach((o) => {
        for (const t of o) if (!texts.includes(t)) err(`${at}: acceptableOrders có khối không tồn tại "${t}"`);
      });
  }
  for (const q of d.game4) {
    const at = common(q, 'game4');
    if (!q.question) err(`${at}: thiếu question`);
    if (!Array.isArray(q.options) || !q.options[q.correctIndex]) err(`${at}: correctIndex sai`);
    if (q.questionAudioText != null) kana(q.questionAudioText, at, 'questionAudioText');
    balanced(q.question, at, 'question');
  }
  return report(file, problems, warns);
}

function report(file, problems, warns) {
  errors += problems.length;
  warnings += warns.length;
  const tag = problems.length ? 'LỖI' : warns.length ? 'cảnh báo' : 'ok';
  console.log(`${file}: ${tag}${problems.length || warns.length ? ` (${problems.length} lỗi, ${warns.length} cảnh báo)` : ''}`);
  problems.slice(0, 15).forEach((p) => console.log(`  ✗ ${p}`));
  if (problems.length > 15) console.log(`  ... và ${problems.length - 15} lỗi nữa`);
  if (process.env.VERBOSE) warns.forEach((w) => console.log(`  ! ${w}`));
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
files.forEach(check);

// Slide bài giảng và tài nguyên theo bài (xem docs/quy-uoc-slide-bai-giang.md)
function checkSlides() {
  const root = path.resolve(import.meta.dirname, '..');
  const problems = [];
  const err = (m) => problems.push(m);
  let res = { slide: { minna: [] }, flashcard: { minna: [] } };
  try {
    res = JSON.parse(fs.readFileSync(path.join(root, 'data', 'resources.json'), 'utf8'));
  } catch (e) {
    err(`data/resources.json không đọc được: ${e.message}`);
  }
  const groups = ['minna', 'nhap-mon'];
  for (const g of groups) {
    for (const id of res.slide?.[g] ?? []) {
      if (!fs.existsSync(path.join(root, 'slides', g, `${id}.html`))) err(`resources.json: có slide ${g} ${id} nhưng thiếu slides/${g}/${id}.html`);
    }
    for (const id of res.flashcard?.[g] ?? []) {
      if (!fs.existsSync(path.join(root, 'flashcards', g, `${id}.html`))) err(`resources.json: có flashcard ${g} ${id} nhưng thiếu flashcards/${g}/${id}.html`);
    }
  }
  const decks = [];
  for (const g of groups) {
    const sdir = path.join(root, 'slides', g);
    if (!fs.existsSync(sdir)) continue;
    for (const f of fs.readdirSync(sdir).filter((f) => f.endsWith('.html')).sort()) decks.push([g, f]);
  }
  for (const [g, f] of decks) {
    const at = `slides/${g}/${f}`;
    const h = fs.readFileSync(path.join(root, 'slides', g, f), 'utf8');
    if (!/assets\/css\/slides\.css/.test(h) || !/assets\/js\/slides\.js/.test(h)) err(`${at}: phải dùng assets/css/slides.css và assets/js/slides.js`);
    if (!/<section class="slide[ "]/.test(h)) err(`${at}: cần ít nhất một <section class="slide">`);
    if (/<style[\s>]/i.test(h)) err(`${at}: không dùng <style> riêng, dùng thành phần có sẵn trong slides.css`);
    if (/style="[^"]*(?:color|background|#[0-9a-f]{3})/i.test(h)) err(`${at}: không dùng style có màu`);
    if (/<ruby/.test(h.replace(/<!--[\s\S]*?-->/g, ''))) err(`${at}: furigana viết dạng {漢字|よみ}, không viết <ruby> bằng tay`);
    const m = /^(\d+)\.html$/.exec(f);
    if (m) {
      const dl = new RegExp(`data-lesson="${m[1]}"`).test(h);
      if (!dl) err(`${at}: data-lesson phải là ${m[1]}`);
    } else if (!f.startsWith('_')) err(`${at}: tên file phải dạng NN.html (hoặc bắt đầu bằng _ nếu là bài mẫu)`);
  }
  errors += problems.length;
  console.log(`slides + resources: ${problems.length ? "LỖI" : "ok"} (${decks.length} file slide)`);
  problems.forEach((p) => console.log(`  ✗ ${p}`));
}
checkSlides();
console.log(`\n${files.length} bài, ${errors} lỗi, ${warnings} cảnh báo.${warnings ? ' (VERBOSE=1 để xem cảnh báo)' : ''}`);
process.exit(errors ? 1 : 0);
