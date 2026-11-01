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

Đổi màu hoặc font chung thì sửa `tailwind.config.js`. Lớp chỉ dùng trong chuỗi ghép động (ví dụ `btn-${color}`) phải được ghi đầy đủ ở đâu đó trong file quét, nếu không Tailwind sẽ không sinh CSS cho nó.

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

Đã dùng engine và dữ liệu JSON chung: `minna/3`, `9`, `11`–`21`.

Chưa chuyển, vì engine khác nhau (cần quyết định trước khi gộp):

- `minna/1`, `2`, `4`, `6`: engine cũ hơn, khác vài tính năng.
- `minna/5`: không có vùng dữ liệu theo mẫu, cấu trúc khác.
- `minna/7`, `8`, `10`: engine khác hẳn.
- `nhap-mon/6`: game nối chữ nhập môn, không dùng engine Minna.
