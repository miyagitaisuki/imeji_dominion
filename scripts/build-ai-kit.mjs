// Đóng gói bộ công cụ để nạp vào AI khác (ChatGPT, Gemini, Claude...) sinh slide bài giảng.
// Chạy: npm run build:ai-kit  -> tạo thư mục ai-slide-kit/. Nội dung quy tắc lấy từ docs/quy-uoc-slide-bai-giang.md
// (mục 3-6) và bài mẫu slides/minna/_mau.html, nên sửa quy ước xong chỉ cần chạy lại để bộ công cụ không lệch.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "ai-slide-kit");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(out, p)), { recursive: true }); fs.writeFileSync(path.join(out, p), s); };
const copy = (from, to) => { fs.mkdirSync(path.dirname(path.join(out, to)), { recursive: true }); fs.copyFileSync(path.join(root, from), path.join(out, to)); };

fs.rmSync(out, { recursive: true, force: true });

// Lấy các mục 3-6 của tài liệu quy ước (bỏ phần thao tác trong repo và câu lệnh mẫu)
const doc = read("docs/quy-uoc-slide-bai-giang.md");
const sections = doc.split(/\n(?=## )/).filter((s) => /^## [3-6]\./.test(s));
const rules = sections
  .join("\n")
  .replace("Xem kết quả thật ở `slides/minna/_mau.html`.", "Xem kết quả thật ở BÀI MẪU bên dưới.")
  .replace(" (xem README, mục icon)", " (chỉ dùng các icon: gamepad-2, arrow-left, arrow-right, chevron-right, presentation, layers)")
  .replace("Thiếu thành phần thì báo để thêm vào `slides.css` dùng chung.", "Thiếu thành phần thì dùng thành phần gần nhất và ghi `<!-- CẦN THÊM THÀNH PHẦN: … -->` để người quản trị bổ sung vào bộ khung.")
  .trim();
const template = read("slides/minna/_mau.html");

const system = `# VAI TRÒ

Bạn là trợ lý soạn **slide bài giảng tiếng Nhật** cho lớp IMEJI日本語教室 (lớp học tiếng Nhật thầy Quang, giáo trình Minna no Nihongo, học viên Việt Nam).
Bạn xuất ra **một file HTML hoàn chỉnh** theo đúng khung dưới đây. Không tự thiết kế giao diện.

# HỢP ĐỒNG ĐẦU RA (bắt buộc)

1. Trả lời **chỉ gồm một khối mã HTML duy nhất** (\`\`\`html … \`\`\`) chứa toàn bộ file, không giải thích thêm trước hoặc sau khối mã.
2. Giữ **nguyên** phần \`<head>\`, hai thẻ \`<script>\` cuối file và mọi đường dẫn (\`../../assets/...\`) như trong BÀI MẪU. Chỉ đổi: \`<title>\`, và ba thuộc tính trên \`<body>\`: \`data-lesson\`, \`data-title\`, \`data-game\`.
3. Thân bài là dãy \`<section class="slide">…</section>\`. Chỉ dùng **các class có trong tài liệu dưới đây**. Không viết \`<style>\`, không viết thuộc tính \`style\` có màu, không thêm file CSS/JS/font/thư viện ngoài, không dùng thẻ \`<ruby>\` (furigana viết \`{漢字|よみ}\`).
4. Điều gì không chắc về nội dung tiếng Nhật (cách chia, nghĩa, chữ Hán đã học chưa), ghi chú bằng **bình luận HTML ngay trước slide đó**: \`<!-- CẦN DUYỆT: … -->\` để giáo viên kiểm tra. Không bịa nghĩa hay ví dụ khi tài liệu đầu vào không có; dùng ví dụ đơn giản, chắc chắn đúng.
5. Ngôn ngữ giải thích: tiếng Việt có dấu đầy đủ. Mọi câu ví dụ tiếng Nhật đều có nghĩa tiếng Việt kèm theo.

# QUY TẮC SOẠN (lấy từ tài liệu quy ước của dự án)

${rules}

# BÀI MẪU (khung HTML phải giữ đúng; thay nội dung bên trong)

Dưới đây là bài mẫu hoàn chỉnh về mẫu câu ～と思います (bài 21). Dùng nó làm khung: giữ cấu trúc, đổi nội dung theo bài được yêu cầu.

\`\`\`html
${template.trim()}
\`\`\`

# TRƯỚC KHI TRẢ LỜI, TỰ KIỂM

- [ ] Một khối mã HTML duy nhất, không lời giải thích bên ngoài.
- [ ] \`<head>\`, \`<script>\`, đường dẫn giữ nguyên; \`data-lesson\`, \`data-title\`, \`data-game\`, \`<title>\` đã đổi đúng số bài.
- [ ] 12 đến 16 slide, theo cấu trúc: mở đầu → mục tiêu → từ vựng → ngữ pháp (công thức, ví dụ, bảng, lưu ý) → hội thoại → luyện nhanh → kết.
- [ ] Mỗi slide một ý, không quá 6 dòng chữ hoặc 8 ô từ vựng. Danh sách và ví dụ dùng \`s-reveal\` để hiện dần.
- [ ] Mọi chữ Hán có furigana \`{漢字|よみ}\`; không còn ký tự \`{ }\` lẻ; không có \`<ruby>\`, \`<style>\`, màu tùy ý.
- [ ] Chỉ dùng từ vựng và ngữ pháp đã học đến bài này; chỗ chưa chắc có \`<!-- CẦN DUYỆT -->\`.
`;

const request = `# MẪU YÊU CẦU (điền vào rồi gửi cùng bộ công cụ)

Soạn slide bài giảng Minna no Nihongo **bài <SỐ BÀI>** theo đúng bộ quy tắc đã nạp.

- Số bài: <SỐ BÀI>   (ví dụ 22)
- Tên hiển thị: Minna no Nihongo – Bài <SỐ BÀI>
- Đường dẫn game: ../../minna/<SỐ BÀI>.html

**Từ mới của bài:**
<dán danh sách từ vựng, kèm chữ Hán, cách đọc, nghĩa tiếng Việt. Hoặc gửi ảnh trang sách>

**Ngữ pháp của bài:**
<liệt kê các mẫu câu, kèm giải thích ngắn nếu có>

**Hội thoại chính của bài:**
<dán hội thoại (tiếng Nhật + tiếng Việt), hoặc gửi ảnh trang sách>

**Yêu cầu thêm (tùy chọn):**
- Số slide: 14
- Nhấn mạnh: <ví dụ: phân biệt hai mẫu A và B; nhiều ví dụ đời sống ở công ty>
- Độ khó: người mới học, N5

Trả lời đúng theo HỢP ĐỒNG ĐẦU RA: một khối mã HTML duy nhất.
`;

const guide = `# Bộ công cụ nạp AI để soạn slide bài giảng IMEJI日本語教室

Bộ này giúp **bất kỳ mô hình AI nào** (ChatGPT, Gemini, Claude, Copilot…) soạn ra file slide đúng giao diện của hệ sinh thái IMEJI: nền mây, thẻ kính, màu và font thương hiệu, có điều khiển bằng phím và vuốt, furigana tự động.

## Có những gì

| File / thư mục | Dùng để |
|---|---|
| \`01-PROMPT-he-thong.md\` | **Quan trọng nhất.** Toàn bộ quy tắc, danh mục thành phần, bài mẫu HTML, danh sách tự kiểm. Nạp vào AI làm chỉ dẫn. |
| \`02-MAU-YEU-CAU.md\` | Mẫu tin nhắn điền số bài, từ vựng, ngữ pháp, hội thoại. |
| \`03-TAT-CA-TRONG-1-FILE.md\` | Gộp 01 + 02 thành một file, để dán vào các giao diện chat chỉ nhận chữ. |
| \`bai-mau.html\` | Bài mẫu HTML (đã nằm trong 01; để AI đọc riêng nếu cần). |
| \`xem-thu/\` | Thư mục **xem thử không cần cài gì**: lưu file AI trả về vào \`xem-thu/slides/minna/\` rồi mở bằng trình duyệt. |

## Cách dùng (3 bước)

**Bước 1. Nạp bộ quy tắc cho AI**
- ChatGPT / Gemini / Claude có nhận file: tạo cuộc trò chuyện mới, đính kèm \`01-PROMPT-he-thong.md\` (hoặc dán nội dung vào ô chat) và nói: *"Đây là bộ quy tắc soạn slide. Tôi sẽ gửi nội dung bài, bạn xuất file HTML theo đúng quy tắc."*
- Giao diện chỉ dán được chữ: dán nguyên \`03-TAT-CA-TRONG-1-FILE.md\`, điền phần "MẪU YÊU CẦU" ở cuối.
- Dùng lâu dài: đặt \`01-PROMPT-he-thong.md\` vào **Project / Custom GPT / Gem / Instructions** của công cụ, các bài sau chỉ gửi mẫu yêu cầu.

**Bước 2. Gửi nội dung từng bài**
Điền \`02-MAU-YEU-CAU.md\` (số bài, từ mới, ngữ pháp, hội thoại; có thể gửi ảnh trang sách). AI trả về **một khối mã HTML**.

**Bước 3. Lưu và xem thử**
1. Sao chép khối mã, lưu thành \`xem-thu/slides/minna/22.html\` (đúng số bài), mã hóa UTF-8.
2. Mở file bằng Chrome/Edge/Safari. Bấm ← → hoặc vuốt để chuyển slide, F để toàn màn hình. Cần có mạng để tải font.
3. Có lỗi hiển thị hoặc nội dung sai: dán lại cho AI kèm mô tả, ví dụ *"Slide 5 tràn chữ, tách làm hai"*, *"Câu ví dụ 3 sai ngữ pháp, sửa lại"*.
4. Chú ý các dòng \`<!-- CẦN DUYỆT: … -->\` trong file: đó là chỗ AI không chắc, thầy kiểm tra rồi xóa dòng.

## Đưa slide vào trang web thật

Slide đã duyệt cần đặt vào dự án imeji_dominion:
1. Chép file vào \`slides/minna/22.html\` trong repo.
2. Thêm số bài vào \`data/resources.json\`: \`"slide": { "minna": [22] }\`.
3. Chạy \`npm run validate\` (phải 0 lỗi) rồi gộp (merge) vào nhánh main.

Cách nhanh: mở một phiên Claude Code trên repo imeji_dominion, dán file HTML và nói *"đặt vào slides/minna/22.html, bật trong data/resources.json, chạy validate, tạo PR"*.

## Mẹo để AI soạn tốt

- Gửi **ảnh trang từ vựng và mẫu câu** của sách để AI không tự đoán nội dung giáo trình.
- Soạn **mỗi bài một cuộc trò chuyện** để nội dung các bài không lẫn nhau.
- Mô hình yếu hay quên quy tắc ở bài dài: nhắc lại *"giữ đúng bộ quy tắc, chỉ dùng class có sẵn, không viết CSS"*.
- AI có thể sai ngữ pháp tiếng Nhật hoặc sai furigana. **Luôn rà lại** trước khi đăng, nhất là phần giải thích và câu ví dụ.

## Vì sao có thư mục xem-thu

File slide gọi CSS, JS, logo và ảnh nền bằng đường dẫn \`../../assets/…\`. Thư mục \`xem-thu/\` dựng sẵn đúng cấu trúc đó nên file lưu vào mở được ngay trên máy, không cần máy chủ.

---
*Bộ này sinh tự động từ repo imeji_dominion bằng \`npm run build:ai-kit\` (nguồn: docs/quy-uoc-slide-bai-giang.md và slides/minna/_mau.html). Quy ước đổi thì chạy lại lệnh để bộ công cụ cập nhật.*
`;

write("00-HUONG-DAN.md", guide);
write("01-PROMPT-he-thong.md", system);
write("02-MAU-YEU-CAU.md", request);
write("03-TAT-CA-TRONG-1-FILE.md", `${system}\n\n---\n\n${request}`);
write("bai-mau.html", template);

// Thư mục xem thử: cùng cấu trúc đường dẫn như trong repo
copy("slides/minna/_mau.html", "xem-thu/slides/minna/_mau.html");
for (const f of ["assets/css/imeji-brand.css", "assets/css/slides.css", "assets/js/slides.js", "assets/js/icons.js", "assets/img/logo.png", "assets/img/clouds.jpg"]) copy(f, `xem-thu/${f}`);
write("xem-thu/index.html", `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Xem thử slide</title></head>
<body style="font-family:system-ui,sans-serif;max-width:560px;margin:40px auto;padding:0 16px;line-height:1.7">
<h1>Xem thử slide</h1>
<p>Lưu file HTML do AI soạn vào <code>slides/minna/</code> trong thư mục này (ví dụ <code>22.html</code>), rồi mở file đó bằng trình duyệt.</p>
<p><a href="slides/minna/_mau.html">Mở bài mẫu</a></p>
</body></html>
`);

const count = (d) => fs.readdirSync(d, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? count(path.join(d, e.name)) : 1), 0);
console.log(`Đã tạo ai-slide-kit/ (${count(out)} file). Quy tắc lấy ${sections.length} mục từ docs/quy-uoc-slide-bai-giang.md.`);
