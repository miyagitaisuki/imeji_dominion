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
assets/js/icons.js     Icon lucide nhúng sẵn (sinh bằng npm run build:icons, không sửa tay)
assets/css/imeji-brand.css  Bộ quy chuẩn thương hiệu dùng chung 3 repo (không sửa riêng ở đây)
assets/css/lesson.css  CSS dùng chung cho các bài Minna
assets/css/tailwind.css  File Tailwind đã build (sinh ra, không sửa tay)
assets/css/tailwind.input.css  Đầu vào của Tailwind
slides/minna/NN.html    Slide bài giảng Minna (deck HTML), _mau.html là bài mẫu
slides/nhap-mon/NN.html Slide bài giảng nhập môn (cùng cấu trúc, tự bật qua data/resources.json)
assets/js/slides.js    Điều khiển deck slide (phím, vuốt, tiến độ, furigana)
assets/css/slides.css  Style chung của deck slide
tailwind.config.js     Cấu hình Tailwind (màu, font, các file quét class)
```

## Từ vựng N2 (Anki)

```
n2/index.html          Trang N2: danh sách 32 bài, flashcard, trắc nghiệm (route bằng #/3, #/3/flash, #/3/quiz)
data/n2/NN.json        50 từ mỗi bài, data/n2/index.json là mục lục (sinh tự động, không sửa tay)
assets/js/n2.js        Logic trang N2
assets/css/n2.css      CSS riêng, không cần build Tailwind
assets/n2/media/       mp3 và jpg của bộ thẻ (tên file giữ nguyên như trong Anki)
scripts/import-anki.py Đọc file .apkg rồi sinh data/n2 (và chép media nếu thêm --media)
```

Cập nhật dữ liệu hoặc media từ bộ Anki mới:

```bash
pip install zstandard
python3 scripts/import-anki.py N2.apkg --media
```

Nếu thiếu file mp3 thì nút 🔊 dùng giọng đọc tiếng Nhật của trình duyệt; thiếu ảnh thì thẻ tự ẩn ảnh.

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

Icon dùng bộ lucide như website và eduscan, nhúng sẵn trong `assets/js/icons.js` (không tải CDN). Trong HTML viết `<i data-icon="house" class="w-4 h-4"></i>`, trong JS gọi `imejiIcon('house', 'w-4 h-4')`. Thêm icon mới: thêm tên vào danh sách trong `scripts/gen-icons.mjs` rồi chạy `npm run build:icons`. Emoji chỉ dùng cho phần vui của game (🔥 ❤️ ⭐, 🎉, ô minh họa từng game), không dùng trên nút, tab, tiêu đề.

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

Hướng dẫn chi tiết (số câu, độ khó, quy tắc soạn từng trò, câu lệnh mẫu giao cho AI): [docs/huong-dan-tao-bai-moi.md](docs/huong-dan-tao-bai-moi.md).

Khi thêm bài mới: tạo `data/minna/NN.json`, tạo `minna/NN.html` (copy từ một bài đã có, chỉ đổi `data-lesson` và `<title>`), rồi thêm số bài vào `availableLessons` trong `index.html` (thanh tiến độ chỉ tính các bài có trong danh sách này).

## Slide bài giảng và flashcard

Bấm **Học bài này** trên thẻ bài Minna mở cửa sổ chọn 3 cách học: **Slide bài giảng**, **Flashcard**, **Game học tập** (4 trò chơi như trước). Slide và flashcard chưa có thì hiện "Sắp có".

- Slide là một deck trình chiếu HTML, đặt ở `slides/minna/NN.html` (NN là số bài, không đệm số 0, ví dụ `slides/minna/22.html`), dùng chung `assets/css/slides.css` và `assets/js/slides.js` để giống hệt giao diện luyện tập. Mở cho mọi người xem, không cần đăng nhập. **Quy ước soạn: [docs/quy-uoc-slide-bai-giang.md](docs/quy-uoc-slide-bai-giang.md); bài mẫu đủ thành phần: `slides/minna/_mau.html`.**
- Flashcard đặt ở `flashcards/minna/NN.html` (định dạng sẽ chốt khi có nội dung). Có file là tự bật, không cần sửa `data/resources.json`.
- Nút cho một bài tự bật khi file `slides/minna/NN.html` (hoặc `flashcards/minna/NN.html`) có trên `main`: `scripts/sync-slides.mjs` chạy trong deploy và ghi số bài vào `data/resources.json`. Muốn đẩy file lên trước rồi bật sau thì đợi duyệt xong mới merge vào `main`.
- Bài nhập môn (`nhap-mon/6`) chỉ có game nên vẫn bấm thẳng vào bài.

## Trạng thái các trang

Tất cả 21 bài Minna (`minna/1`–`21`) dùng engine chung `assets/js/engine.js` và dữ liệu `data/minna/NN.json`. Mỗi trang chỉ là khung HTML mỏng (~8KB) trỏ tới file JSON của bài. Khóa lưu tiến độ trong trình duyệt (`mnn_lNN_highscore`, `mnn_lNN_mistakes`) giữ nguyên nên người học không mất điểm cao và danh sách câu hay sai.

Ngoại lệ: `nhap-mon/6` là game nối Romaji ⇄ Hiragana, khác hẳn kiểu bài của Minna nên giữ riêng.

## Kiểm tra dữ liệu bài học

```bash
npm run validate          # VERBOSE=1 để xem cả cảnh báo
```

Kiểm tra mọi `data/minna/NN.json`: JSON hợp lệ, `lessonNo` và `storagePrefix` khớp tên file, id duy nhất trong cả bài, `level` hợp lệ, đủ 3 `distractors` ở game 1, có chỗ trống `＿` ở game 2, `acceptableOrders` ở game 3 chỉ dùng các khối có thật, `correctIndex` đúng ở game 2 và 4, trường kana thuần không chứa `{}`, `|` hay HTML. Nên chạy trước khi commit bài mới hoặc sửa nội dung bài.

## Điều hướng

- Trang chủ luyện tập, menu mỗi bài và `nhap-mon/6` có **thanh chuyển 3 app** dùng chung với website và eduscan: Trang chủ (`https://imejiquynhon.com/`) · Luyện tập (mục đang chọn) · Học viên (`https://app.imejiquynhon.com/`). Kiểu dáng là `.imeji-switch` trong `imeji-brand.css`.
- Menu mỗi bài có thêm nút **← Danh sách bài** (`../index.html`). Khi bài được nhúng trong trang khác (iframe, VD cổng học viên) thì ẩn phần điều hướng này.

## Báo kết quả ra ngoài (để ghi điểm)

Khi người học hoàn thành một lượt (màn hình tổng kết), engine phát sự kiện `mnn:lesson-complete`:

- `window.dispatchEvent(new CustomEvent('mnn:lesson-complete', { detail }))` để trang tự lắng nghe;
- `window.parent.postMessage(detail, '*')` khi bài được nhúng trong iframe (ví dụ trong eduscan).

`detail` gồm: `type` (`"mnn:lesson-complete"`), `lessonNo`, `jlpt`, `storagePrefix`, `game` (1 từ vựng, 2 ngữ pháp, 3 xếp câu, 4 hội thoại), `practice` (`true` khi ôn câu sai/điểm yếu), `difficulty`, `total`, `correct`, `accuracy` (%), `score`, `maxStreak`, `finishedAt` (ISO). Không có thông tin cá nhân. **Bên nhận phải kiểm tra `event.origin`** vì nguồn gửi là `'*'`. Lượt chơi bị dừng giữa chừng (hết tim, thoát) không phát sự kiện.
