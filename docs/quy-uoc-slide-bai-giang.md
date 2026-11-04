# Quy ước slide bài giảng

Slide bài giảng là một **deck HTML** mở trực tiếp trên trình duyệt, cùng giao diện với trang luyện tập (nền mây, thẻ kính, màu và font của `imeji-brand.css`), mở cho mọi người xem, không cần đăng nhập.
Người soạn **chỉ viết nội dung** bằng các thành phần có sẵn. Không viết CSS hay JavaScript riêng.

| Thứ | Vị trí |
|---|---|
| Bài mẫu, đủ mọi thành phần (sao chép để bắt đầu) | `slides/minna/_mau.html` |
| Style chung (không sửa riêng cho từng bài) | `assets/css/slides.css` |
| Điều khiển: phím, vuốt, tiến độ, furigana | `assets/js/slides.js` |
| Slide của từng bài | `slides/minna/NN.html` (NN không đệm số 0: `22.html`) |
| Bật nút Slide trong cửa sổ "Học bài này" | `data/resources.json` |

## 1. Thêm slide cho một bài (ví dụ bài 22)

1. Sao chép `slides/minna/_mau.html` thành `slides/minna/22.html`.
2. Ở thẻ `<body>` đổi 3 thuộc tính:
   `data-lesson="22"`, `data-title="Minna no Nihongo – Bài 22"`, `data-game="../../minna/22.html"` (nút "Game học tập" ở góc trên; bỏ thuộc tính này nếu bài chưa có game).
   Đổi luôn thẻ `<title>`. Không đổi các đường dẫn tới `assets/`.
3. Thay các `<section class="slide">` bằng nội dung bài (mục 3, 4).
4. Mở `data/resources.json`, thêm số bài vào `"slide": { "minna": [22] }`. Đến lúc này nút **Slide bài giảng** mới sáng lên.
5. Chạy `npm run validate`, rồi `python3 -m http.server 8000` và xem tại `http://localhost:8000/slides/minna/22.html`.

## 2. Cách trình chiếu (người xem)

| Thao tác | Kết quả |
|---|---|
| → / Space / Enter / PageDown | Hiện ý kế tiếp, hết ý thì sang slide sau |
| ← / Backspace / PageUp | Slide trước |
| Home / End | Slide đầu / cuối |
| F | Toàn màn hình |
| Vuốt trái, phải (điện thoại) | Tiếp, lùi |
| `…/22.html#5` | Mở thẳng slide 5 (dùng để gửi link cho học viên) |
| Ctrl+P | In hoặc lưu PDF, mỗi slide một trang, hiện đủ mọi ý |

## 3. Cấu trúc một bài giảng

Mỗi file là một dãy `<section class="slide">`. Gợi ý **10 đến 16 slide**:

1. **Mở đầu** (`slide--title`): tên bài, tên mẫu câu chính, giáo viên.
2. **Mục tiêu**: 2–4 ý "Học xong bạn có thể…" (`s-list`, hiện dần).
3. **Từ vựng**: 4–8 từ mỗi slide (`s-vocab`). Bài nhiều từ thì chia nhiều slide theo nhóm nghĩa.
4. **Mỗi mẫu ngữ pháp 1–3 slide**: công thức (`s-pattern`) → ví dụ (`s-example`) → bảng chia (`s-table`) → lưu ý (`s-note`).
5. **Hội thoại** (`s-dialog`): đoạn hội thoại chính của bài, mỗi slide 2–4 lượt lời.
6. **Luyện nhanh**: 1–3 câu hỏi nhỏ, đáp án hiện sau khi bấm tiếp.
7. **Kết** (`slide--end`): tóm tắt 3 ý, nút sang game và về danh sách bài.

### Quy tắc nội dung
- **Một slide, một ý.** Chữ ít, chữ lớn; học viên xem trên điện thoại.
- Không quá 6 dòng chữ hoặc 8 ô từ vựng trên một slide. Nhiều hơn thì tách slide.
- Mẫu câu và ví dụ **luôn có nghĩa tiếng Việt** ngay bên dưới.
- Chỉ dùng từ vựng và ngữ pháp đã học đến bài này. Chữ Hán đã học thì có furigana (mục 5).
- Dùng hiện dần (`s-reveal`) cho danh sách ý, ví dụ và đáp án luyện nhanh, để giáo viên dẫn dắt.
- Dùng đúng màu theo ý nghĩa: ghi chú mẹo (xanh dương), đúng (xanh lá), chú ý (vàng), lỗi sai (đỏ).

## 4. Thành phần có sẵn

Mọi thành phần đều nằm trong `<section class="slide">`. Xem kết quả thật ở `slides/minna/_mau.html`.

```html
<!-- Khung bài -->
<section class="slide slide--title">…</section>   <!-- mở đầu: nền tối, chữ giữa -->
<section class="slide">…</section>                <!-- nội dung -->
<section class="slide slide--end">…</section>     <!-- kết -->

<!-- Tiêu đề -->
<span class="s-eyebrow">Ngữ pháp</span>   <!-- nhãn nhỏ trên tiêu đề -->
<h1>…</h1> (chỉ ở slide mở đầu)   <h2>…</h2>   <p class="s-lead">câu dẫn</p>   <p class="s-meta">chú thích nhỏ</p>

<!-- Danh sách (thêm class s-reveal vào li để hiện dần) -->
<ul class="s-list"><li class="s-reveal">…</li></ul>

<!-- Từ vựng -->
<div class="s-vocab">
  <div class="s-word"><span class="s-word__jp">{思|おも}います</span><span class="s-word__read">おもいます</span><span class="s-word__mean">nghĩ</span></div>
</div>

<!-- Mẫu câu và ví dụ -->
<div class="s-pattern"><mark>Thể thường</mark> ＋ と {思|おも}います<small>Tôi nghĩ rằng…</small></div>
<div class="s-example s-reveal"><p class="s-example__jp">…</p><p class="s-example__vi">…</p></div>

<!-- Hội thoại: thêm s-line--right cho người nói thứ hai -->
<div class="s-dialog">
  <div class="s-line"><span class="s-line__who">ミラー</span><div class="s-line__bubble"><p class="s-line__jp">…</p><p class="s-line__vi">…</p></div></div>
</div>

<!-- Ghi chú: s-note--tip | ok | warn | bad -->
<div class="s-note s-note--warn"><span class="s-note__label">Chú ý</span><p>…</p></div>

<!-- Bảng -->
<table class="s-table"><thead><tr><th>…</th></tr></thead><tbody><tr><td class="jp">…</td></tr></tbody></table>

<!-- Thẻ và lưới: s-grid--2 hoặc s-grid--3; thẻ màu: s-card--primary | success | warning | danger | accent -->
<div class="s-grid s-grid--2"><div class="s-card s-card--primary">…</div><div class="s-card s-reveal">…</div></div>

<!-- Nút (thường ở slide kết) -->
<div class="s-actions"><a class="s-btn" href="../../minna/22.html">Làm game luyện tập</a><a class="s-btn s-btn--ghost" href="../../index.html">Danh sách bài</a></div>
```

Chữ Nhật dùng class `jp` (hoặc đã nằm trong thành phần có sẵn như `s-word__jp`, `s-example__jp`).
Icon dùng như các trang khác: `<i data-icon="gamepad-2" class="w-5 h-5"></i>` (xem README, mục icon).

## 5. Furigana

Viết `{漢字|よみ}` ngay trong chữ, ví dụ `{思|おも}います`. Khi mở trang, `slides.js` đổi thành chữ nhỏ phía trên, **cùng quy ước với `data/minna/NN.json`**. Không viết thẻ `<ruby>` bằng tay.

## 6. Điều không làm

- Không thêm `<style>`, thuộc tính `style="…"` có màu, hay file CSS riêng cho từng bài. Thiếu thành phần thì báo để thêm vào `slides.css` dùng chung.
- Không dùng tên màu thô (`blue-600`, `#2563eb`…). Màu đã nằm trong các thành phần.
- Không nhúng thư viện hay font ngoài. Không đổi đường dẫn tới `assets/`.
- Không dùng emoji trên nút, tiêu đề, nhãn. (Chỉ ✓ ✗ trong ví dụ đúng/sai.)
- Không sửa `assets/css/imeji-brand.css`.
- Không đặt ảnh nặng. Ảnh minh họa để trong `slides/minna/img/NN/`, mỗi ảnh dưới 300KB, có `alt`.

## 7. Kiểm tra trước khi nộp

`npm run validate` kiểm tra: mọi bài trong `data/resources.json` có đủ file, file slide dùng đúng `slides.css` và `slides.js`, có ít nhất một `<section class="slide">`, không có CSS tại chỗ, thuộc tính `data-lesson` khớp tên file. Phải ra **0 lỗi**.

Tự rà thêm:
- [ ] Chơi qua toàn bộ deck bằng phím → trên máy tính, và bằng vuốt trên điện thoại (hoặc thu nhỏ cửa sổ).
- [ ] Mỗi slide đọc được trong dưới 30 giây, không bị tràn chữ.
- [ ] Mọi chữ Hán có furigana (`{漢字|よみ}`), không còn dấu `{ }` hiện ra.
- [ ] Ví dụ nào cũng có nghĩa tiếng Việt, nội dung khớp với phần game của bài.

## 8. Câu lệnh mẫu giao cho AI soạn slide

```text
Trong repo miyagitaisuki/imeji_dominion, soạn slide bài giảng cho Minna no Nihongo bài 22
theo đúng docs/quy-uoc-slide-bai-giang.md (đọc toàn bộ trước khi làm) và bắt đầu từ slides/minna/_mau.html.

Nội dung bài 22:
- Từ mới: <dán danh sách từ vựng, kèm nghĩa>
- Ngữ pháp: <liệt kê các mẫu câu>
- Hội thoại chính: <dán hội thoại hoặc gửi ảnh trang sách>

Yêu cầu:
1. Tạo slides/minna/22.html, 12 đến 16 slide, theo cấu trúc ở mục 3 của tài liệu.
2. Chỉ dùng thành phần có sẵn, không viết CSS/JS riêng.
3. Thêm 22 vào "slide" trong data/resources.json.
4. Chạy npm run validate đến 0 lỗi; mở thử bằng python3 -m http.server, chụp ảnh các slide gửi tôi (cả bản điện thoại).
5. Tạo PR (chưa merge) và liệt kê những chỗ còn phân vân để giáo viên duyệt.
```
