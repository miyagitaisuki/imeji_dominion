# imeji_dominion

Trang học tiếng Nhật tĩnh: trang chủ, bài Minna no Nihongo và game nhập môn.

## Cấu trúc

```
index.html              Trang chủ, danh sách bài học
minna/NN.html          Trang bài Minna no Nihongo (dùng data/minna/NN.json)
nhap-mon/6.html        Game nhập môn (chưa dùng engine chung)
data/minna/NN.json     Nội dung bài: config + game1..game4
assets/js/engine.js    Engine game dùng chung cho các bài Minna
assets/js/loader.js    Tải JSON của bài rồi khởi động engine
assets/css/imeji-brand.css  Bộ quy chuẩn thương hiệu dùng chung 3 repo (không sửa riêng ở đây)
assets/css/lesson.css  CSS dùng chung cho các bài Minna
assets/css/tailwind.css  File Tailwind đã build (sinh ra, không sửa tay)
assets/css/tailwind.input.css  Đầu vào của Tailwind
tailwind.config.js     Cấu hình Tailwind (màu, font, các file quét class)
```

## Chạy local

Trang đọc JSON bằng `fetch`, nên phải mở qua máy chủ HTTP, không mở trực tiếp bằng `file://`.

```bash
npm install
npm run build:css
python -m http.server 8000
```

Sau đó mở http://localhost:8000.

## Sửa giao diện Tailwind

Sau khi thêm hoặc đổi class Tailwind trong HTML hoặc JS, chạy lại:

```bash
npm run build:css
```

Màu, font, bo góc và bóng lấy từ `assets/css/imeji-brand.css` (xem mục Bộ quy chuẩn thương hiệu); `tailwind.config.js` chỉ nối các giá trị đó vào Tailwind. Lớp chỉ dùng trong chuỗi ghép động (ví dụ `btn-${color}`) phải được ghi đầy đủ ở đâu đó trong file quét, nếu không Tailwind sẽ không sinh CSS cho nó.

## Bộ quy chuẩn thương hiệu

Màu, font, bo góc, bóng, nền chấm và thẻ kính mờ nằm trong `assets/css/imeji-brand.css`, **giống hệt nhau** ở 3 repo: imeji_newhorizon (website, giữ bản gốc), imeji_dominion (luyện tập) và eduscan (cổng học viên). Quy ước dùng ghi ở đầu file đó.

- Màu theo ý nghĩa: `primary` (thương hiệu, #2563eb), `success`, `warning`, `danger`, `accent`, cùng `slate` cho trung tính. Không dùng tên màu thô như `blue-600`, `emerald-500`, `bg-[#...]`.
- Font: Be Vietnam Pro, chữ Nhật dùng Noto Sans JP (`font-jp`).
- Muốn đổi: sửa bản gốc ở imeji_newhorizon, chép y nguyên sang 2 repo kia, rồi chạy `npm run brand:check` để so với bản gốc trên GitHub.

`npm run validate` cũng báo lỗi nếu HTML/JS dùng màu thô.

## Thêm hoặc sửa bài Minna

Mỗi bài có một file `data/minna/NN.json`:

```json
{
  "config": { "lessonNo": 21, "title": "Minna no Nihongo – Bài 21", "jlpt": "N5", "storagePrefix": "mnn_l21" },
  "game1": [ { "id": "l21_v001", "level": "easy", "context": "...", "answer": "おもいます", "distractors": ["いいます", "ききます", "はなします"], "distractorsKanji": [], "kanji": "...", "explanation": { "correct": "...", "pitfalls": "...", "tip": "..." } } ],
  "game2": [ { "id": "l21_g001", "level": "easy", "sentence": "... ＿ ...", "options": [ { "text": "を", "kanji": "を" } ], "correctIndex": 1, "translation": "...", "explanation": { } } ],
  "game3": [ { "id": "l21_s001", "level": "easy", "vietnamese": "...", "blocks": [ { "text": "...", "kanji": "..." } ], "acceptableOrders": [ ["..."] ], "explanation": { } } ],
  "game4": [ { "id": "l21_c001", "level": "easy", "question": "...", "questionAudioText": "...", "speaker": "...", "options": [ { "text": "...", "kanji": "..." } ], "correctIndex": 1, "explanation": { } } ]
}
```

Quy ước furigana:

- Viết `{漢字|かんじ}` để hiện furigana ruby, ví dụ `{食|た}べます`.
- Các trường `answer`, `text`, `distractors`, `questionAudioText`, `acceptableOrders` là chữ kana thuần, không dùng `{}` hay HTML.
- Các trường `kanji`, `sentence`, `question` là chữ hiển thị, có thể dùng `{漢字|よみ}`.
- `game1` cần đúng 3 `distractors`.

Khi thêm bài mới: tạo `data/minna/NN.json`, tạo `minna/NN.html` (copy từ một bài đã có, chỉ đổi `data-lesson` và `<title>`), rồi thêm bài vào `index.html`.

## Trạng thái các trang

Tất cả 21 bài Minna (`minna/1`–`21`) dùng engine chung `assets/js/engine.js` và dữ liệu `data/minna/NN.json`. Mỗi trang chỉ là khung HTML mỏng (~8KB) trỏ tới file JSON của bài. Khóa lưu tiến độ trong trình duyệt (`mnn_lNN_highscore`, `mnn_lNN_mistakes`) giữ nguyên nên người học không mất điểm cao và danh sách câu hay sai.

Ngoại lệ: `nhap-mon/6` là game nối Romaji ⇄ Hiragana, khác hẳn kiểu bài của Minna nên giữ riêng.

## Kiểm tra dữ liệu bài học

```bash
npm run validate          # VERBOSE=1 để xem cả cảnh báo
```

Kiểm tra mọi `data/minna/NN.json`: JSON hợp lệ, `lessonNo` và `storagePrefix` khớp tên file, id duy nhất trong cả bài, `level` hợp lệ, đủ 3 `distractors` ở game 1, có chỗ trống `＿` ở game 2, `acceptableOrders` ở game 3 chỉ dùng các khối có thật, `correctIndex` đúng ở game 2 và 4, trường kana thuần không chứa `{}`, `|` hay HTML. Nên chạy trước khi commit bài mới hoặc sửa nội dung bài.

## Điều hướng

- Menu mỗi bài có nút **← Danh sách bài** (`../index.html`) và **🏠 Trang chủ Thầy Quang** (`https://imejiquynhon.com/`, hằng số `SITE_HOME_URL` trong `engine.js`).
- Trang chủ (`index.html`) và `nhap-mon/6` cũng có nút về trang chủ imejiquynhon.com.

## Báo kết quả ra ngoài (để ghi điểm)

Khi người học hoàn thành một lượt (màn hình tổng kết), engine phát sự kiện `mnn:lesson-complete`:

- `window.dispatchEvent(new CustomEvent('mnn:lesson-complete', { detail }))` để trang tự lắng nghe;
- `window.parent.postMessage(detail, '*')` khi bài được nhúng trong iframe (ví dụ trong eduscan).

`detail` gồm: `type` (`"mnn:lesson-complete"`), `lessonNo`, `jlpt`, `storagePrefix`, `game` (1 từ vựng, 2 ngữ pháp, 3 xếp câu, 4 hội thoại), `practice` (`true` khi ôn câu sai/điểm yếu), `difficulty`, `total`, `correct`, `accuracy` (%), `score`, `maxStreak`, `finishedAt` (ISO). Không có thông tin cá nhân. **Bên nhận phải kiểm tra `event.origin`** vì nguồn gửi là `'*'`. Lượt chơi bị dừng giữa chừng (hết tim, thoát) không phát sự kiện.
