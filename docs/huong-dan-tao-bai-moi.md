# Hướng dẫn tạo bài luyện tập mới (Minna no Nihongo)

Tài liệu này dành cho người (hoặc AI như Claude) soạn thêm bài cho trang luyện tập, ví dụ Minna bài 22–50.

**Số bài và tên file lấy theo đầu vào của người nhập** (bảng từ vựng, mẫu câu, số bài ghi trong yêu cầu). Ví dụ đầu vào ghi "bài 26" thì tạo `data/minna/26.json`, `minna/26.html`, `lessonNo: 26`, `jlpt: "N4"`, `storagePrefix: "mnn_l26"`, không mặc định theo số bài trong ví dụ của tài liệu này. Nếu bảng nguồn ghi một số bài mà yêu cầu ghi số khác, hỏi lại người nhập trước khi soạn, và ghi rõ trong PR.

Mỗi bài có sẵn **4 trò chơi** và chế độ **Ôn từ hay sai**, tất cả chạy bằng engine chung `assets/js/engine.js`.
Người soạn **chỉ cần viết dữ liệu JSON**, không phải sửa giao diện hay code trò chơi.

Phần cuối có [câu lệnh mẫu](#câu-lệnh-mẫu-để-giao-cho-ai) để giao cho AI soạn một bài hoàn chỉnh.

---

## 1. Các file cần tạo hoặc sửa (ví dụ bài 22)

| Bước | File | Việc cần làm |
|---|---|---|
| 1 | `data/minna/22.json` | Tạo mới: toàn bộ nội dung bài (mục 2–4) |
| 2 | `minna/22.html` | Chép từ `minna/21.html`, chỉ đổi 2 chỗ: `<title>` và `data-lesson="../data/minna/22.json"` |
| 3 | `index.html` | Trong `availableLessons.minna`, thêm số bài vừa làm. Nếu các bài trước đã liên tiếp, đổi `length` (ví dụ `length: 22`). Nếu chưa liên tiếp (ví dụ đã có 1–21 rồi làm 26), dùng mảng tường minh: `[...Array.from({ length: 21 }, (_, i) => i + 1), 26]`. Không đặt `length` lớn hơn số bài đã có, nếu không các bài chưa làm sẽ hiện "Học bài này" và trỏ tới trang không tồn tại. |
| 4 | — | Chạy `npm run validate`, sửa hết lỗi; mở trang qua máy chủ local và chơi thử cả 4 trò (mục 6) |

Không cần sửa `engine.js`, `lesson.css`, `tailwind.css`, và **không sửa** `assets/css/imeji-brand.css`.
Tên bài và mô tả trên trang chủ đã có sẵn trong mảng `minnaLessons` của `index.html` (bài 1–50), chỉ sửa khi muốn đổi mô tả.

## 2. Khung file JSON

```json
{
  "config": { "lessonNo": 22, "title": "Minna no Nihongo – Bài 22", "jlpt": "N5", "storagePrefix": "mnn_l22" },
  "game1": [ ... ],
  "game2": [ ... ],
  "game3": [ ... ],
  "game4": [ ... ]
}
```

- `lessonNo` và `storagePrefix` phải khớp tên file (`22.json` → `22`, `mnn_l22`). Script kiểm tra sẽ báo lỗi nếu lệch.
- `jlpt`: bài 1–25 là `"N5"`, bài 26–50 là `"N4"`.
- `storagePrefix` là khóa lưu điểm cao và câu hay sai trong trình duyệt. **Không đổi** sau khi bài đã lên mạng, nếu không người học sẽ mất tiến độ.

### Số câu và độ khó (theo các bài 10–21)

| Trò | Mảng | Số câu | easy / medium / hard | Tiền tố id |
|---|---|---|---|---|
| 1. Từ vựng | `game1` | 35 | 14 / 14 / 7 | `l22_v001`… |
| 2. Ngữ pháp | `game2` | 30 | 12 / 12 / 6 | `l22_g001`… |
| 3. Xếp câu | `game3` | 20 | 8 / 8 / 4 | `l22_s001`… |
| 4. Hội thoại | `game4` | 20 | 8 / 8 / 4 | `l22_c001`… |

- `id` không được trùng trong cả bài. Đánh số 3 chữ số liên tục.
- `level` chỉ nhận `easy`, `medium`, `hard`. Người học lọc theo độ khó, nên mỗi mức cần đủ câu để chơi một lượt 10 câu.
  - **easy**: từ hoặc mẫu chính của bài, ngữ cảnh rõ.
  - **medium**: cần phân biệt với từ hoặc mẫu gần nghĩa.
  - **hard**: kết hợp với bài trước, câu dài hơn, bẫy hay nhầm.

## 3. Quy ước chữ viết (bắt buộc)

- **Furigana**: viết `{漢字|よみ}`, ví dụ `{思|おも}います`, `{交通|こうつう}`. Engine tự hiện chữ nhỏ phía trên.
- **Trường kana thuần** (`answer`, `distractors`, `text`, `questionAudioText`, các phần tử trong `acceptableOrders`) chỉ chứa kana và dấu câu. Không có `{ } |`, không có HTML.
  Lý do: các trường này dùng để so đáp án và cho giọng đọc tiếng Nhật.
- **Trường hiển thị** (`kanji`, `distractorsKanji`, `sentence`, `question`, `blocks[].kanji`, `options[].kanji`) được dùng furigana.
- Chỉ dùng từ vựng, chữ Hán và ngữ pháp **đã học đến bài này**. Chữ Hán chưa học thì viết bằng kana.
- Cách chữ theo kiểu Minna: tách cụm bằng một dấu cách (`あしたは あめが ふる`), dấu câu Nhật `。、「」`.
- Tiếng Việt viết tự nhiên, có dấu đầy đủ, không dịch word-by-word.

## 4. Từng trò chơi

Mỗi câu của cả 4 trò đều có `explanation` gồm 3 câu tiếng Việt ngắn (1 câu mỗi ý):

```json
"explanation": {
  "correct": "Vì sao đáp án đúng.",
  "pitfalls": "Vì sao từng lựa chọn sai là sai (nêu nghĩa của chúng).",
  "tip": "Mẹo nhớ hoặc cấu trúc tổng quát."
}
```

Người học xem phần này khi bấm **Giải thích** sau khi trả lời, và khi làm sai thì thẻ "Từ/Cấu trúc cần nhớ" hiện ra.

### Trò 1 – Từ vựng (`game1`): đọc mô tả tiếng Việt, chọn từ tiếng Nhật đúng

```json
{
  "id": "l21_v001", "level": "easy",
  "context": "Sau khi xem xét một vấn đề, bạn hình thành nhận định riêng trong đầu, chưa nhất thiết nói ra.",
  "answer": "おもいます",
  "kanji": "{思|おも}います",
  "distractors": ["いいます", "ききます", "はなします"],
  "distractorsKanji": ["{言|い}います", "ききます", "はなします"],
  "explanation": { "correct": "...", "pitfalls": "...", "tip": "..." }
}
```

- `context` mô tả **tình huống** dùng từ, không phải bản dịch một chữ. Không để lộ đáp án trong câu mô tả.
- Đúng **3** `distractors`, cùng loại từ với đáp án (động từ với động từ, cùng thể ます…). Nên là từ dễ nhầm: gần nghĩa, gần âm, cùng chủ đề.
- `distractorsKanji` cùng thứ tự với `distractors`.
- Phủ hết danh sách từ mới của bài trước, rồi mới thêm từ ôn của bài cũ.

### Trò 2 – Ngữ pháp (`game2`): điền vào chỗ trống

```json
{
  "id": "l21_g001", "level": "easy",
  "sentence": "あしたは あめが ふる ＿ {思|おも}います。",
  "translation": "Tôi nghĩ ngày mai trời sẽ mưa.",
  "options": [ { "text": "を", "kanji": "を" }, { "text": "と", "kanji": "と" }, { "text": "で", "kanji": "で" }, { "text": "に", "kanji": "に" } ],
  "correctIndex": 1,
  "explanation": { ... }
}
```

- `sentence` có **đúng một** dấu `＿` (gạch dưới toàn khổ, U+FF3F).
- Nên dùng **4** lựa chọn (tối thiểu 3). Chỉ đúng một lựa chọn hợp ngữ pháp **và** hợp nghĩa với `translation`.
- `correctIndex` tính từ 0. Engine tự xáo thứ tự khi hiển thị, nên đặt đáp án ở vị trí nào cũng được.
- Ô trống có thể là trợ từ, đuôi động từ (`～て`, `～ない`…), hoặc cả cụm mẫu câu. Tập trung vào điểm ngữ pháp **của bài này**.

### Trò 3 – Xếp câu (`game3`): chạm các khối từ theo đúng thứ tự

```json
{
  "id": "l21_s001", "level": "easy",
  "vietnamese": "Tôi nghĩ thiết kế này đẹp.",
  "blocks": [
    { "text": "きれいだと", "kanji": "きれいだと" },
    { "text": "おもいます", "kanji": "{思|おも}います" },
    { "text": "このデザインは", "kanji": "このデザインは" },
    { "text": "ふべんだと", "kanji": "{不便|ふべん}だと" }
  ],
  "acceptableOrders": [ ["このデザインは", "きれいだと", "おもいます"] ],
  "explanation": { ... }
}
```

- Mỗi khối là một cụm có nghĩa (danh từ + trợ từ, động từ đã chia…). 3–6 khối là vừa trên điện thoại.
- Thêm **1–2 khối gây nhiễu** không thuộc câu đúng (như `ふべんだと`). Khối gây nhiễu phải sai về nghĩa hoặc ngữ pháp, không phải một cách nói khác cũng đúng.
- `acceptableOrders` ghi theo `text` (kana). Nếu tiếng Nhật cho phép nhiều thứ tự tự nhiên (ví dụ đảo trạng ngữ thời gian), liệt kê **tất cả** các thứ tự đúng, nếu không người học làm đúng vẫn bị chấm sai.
- Engine tự xáo thứ tự khối, không cần xáo trong JSON.

### Trò 4 – Hội thoại (`game4`): chọn câu đáp tự nhiên

```json
{
  "id": "l21_c001", "level": "easy",
  "speaker": "👤 ミラーさん",
  "question": "「この まちの {交通|こうつう}について どう {思|おも}いますか。」",
  "questionAudioText": "このまちのこうつうについてどうおもいますか",
  "options": [
    { "text": "バスで きました。", "kanji": "バスで きました。" },
    { "text": "とても べんりだと おもいます。", "kanji": "とても べんりだと {思|おも}います。" },
    { "text": "きのう この まちへ きました。", "kanji": "きのう この まちへ きました。" }
  ],
  "correctIndex": 1,
  "explanation": { ... }
}
```

- `speaker`: một emoji, một dấu cách, rồi tên nhân vật Minna (ミラーさん, 山田さん, 木村さん, 店員…). Emoji hiện trong ô hình đại diện.
- `question` để trong 「」. `questionAudioText` là bản kana liền, dùng cho nút loa.
- **3** lựa chọn. Lựa chọn sai nên đúng ngữ pháp nhưng **lạc đề** hoặc sai ngữ cảnh (trả lời câu hỏi khác, sai kính ngữ, sai thì), không phải câu vô nghĩa.
- Ưu tiên tình huống đời thường của người Việt ở Nhật: cửa hàng, công ty, trường, ga tàu, bệnh viện.

## 5. Chất lượng nội dung: tự kiểm trước khi nộp

- [ ] Mỗi câu chỉ có **một** đáp án đúng. Đọc lại các lựa chọn sai xem có cái nào cũng chấp nhận được không.
- [ ] Không dùng từ hoặc ngữ pháp của bài sau.
- [ ] Furigana đủ cho mọi chữ Hán; trường kana thuần không có `{}`.
- [ ] Phần giải thích nói được **vì sao lựa chọn sai là sai**, không chỉ nhắc lại đáp án.
- [ ] Không có hai câu gần như giống hệt nhau (cùng câu, chỉ đổi một chữ).
- [ ] Đủ số câu và đúng tỉ lệ độ khó ở bảng mục 2.

## 6. Kiểm tra và chạy thử

```bash
npm install
npm run validate
```

`validate` kiểm tra: JSON hợp lệ, `lessonNo`/`storagePrefix` khớp tên file, id không trùng, `level` hợp lệ, đủ 3 `distractors`, có `＿` ở trò 2,
`acceptableOrders` chỉ dùng khối có thật, `correctIndex` hợp lệ, trường kana không có markup. Phải ra **0 lỗi**.
(Dòng cảnh báo "màu thô" trong `index.html` là lỗi cũ, không liên quan đến bài mới.)

Chạy thử (trang đọc JSON bằng `fetch`, nên không mở trực tiếp bằng `file://`):

```bash
python3 -m http.server 8000
```

Mở `http://localhost:8000/minna/22.html`, chơi mỗi trò ít nhất một lượt ở từng độ khó, cố ý trả lời sai vài câu để xem phần giải thích và chế độ **Ôn từ hay sai**.

Slide bài giảng của bài (nếu có) soạn riêng theo [quy-uoc-slide-bai-giang.md](quy-uoc-slide-bai-giang.md).

## 7. Nếu muốn thêm một **loại** trò chơi mới (trò 5)

Đây là việc sửa code, không chỉ soạn dữ liệu. Các chỗ cần đụng trong `assets/js/engine.js`:

1. `loader.js`: gán thêm `window.GAME5_DATA = data.game5`.
2. `showMainMenu()`: thêm một mục vào mảng thẻ trò chơi (`tone`, `icon`, `tag`, `title`, `desc`). Thêm màu `.game-card--g5` trong `assets/css/lesson.css`. Icon lấy từ lucide: thêm tên vào `scripts/gen-icons.mjs` rồi chạy `npm run build:icons`.
3. `startGame()` / `renderQuestion()`: thêm nhánh cho trò 5 và hàm `renderGame5(q, container)`. Dùng lại các class sẵn có: `q-card` (khung câu hỏi), `btn-3d btn-gray` (ô đáp án), `selected`, `btn-option-correct`, `btn-option-wrong`, `is-dim`.
4. `handleActionButton()`: thêm cách chấm cho trò 5, và trong `markOptionResults()` nếu trò có ô đáp án.
5. `scripts/validate-lessons.mjs`: thêm quy tắc kiểm tra cho `game5`; cập nhật README và tài liệu này.
6. Thêm hoặc đổi class Tailwind thì chạy `npm run build:css`.

Màu chỉ dùng tên theo ý nghĩa (`primary`, `success`, `warning`, `danger`, `accent`, `slate`), không dùng `blue-600`, `bg-[#...]`. Emoji chỉ dùng cho phần vui của game (🔥 ❤️ ⭐, ô hình người nói), không dùng trên nút hay tiêu đề.

---

## Câu lệnh mẫu để giao cho AI

Chép nguyên khối dưới, đổi số bài và danh sách từ/ngữ pháp:

```text
Trong repo miyagitaisuki/imeji_dominion, soạn bài luyện tập Minna no Nihongo bài 22
theo đúng tài liệu docs/huong-dan-tao-bai-moi.md (đọc toàn bộ trước khi làm).

Nội dung bài 22:
- Từ mới: <dán danh sách từ vựng bài 22, kèm nghĩa>
- Ngữ pháp: <liệt kê các mẫu, ví dụ: mệnh đề bổ nghĩa danh từ; ～時間/約束/用事 があります>
- Hội thoại chính: <tóm tắt tình huống của bài>

Yêu cầu:
1. Tạo data/minna/22.json: game1 35 câu, game2 30, game3 20, game4 20, đúng tỉ lệ easy/medium/hard trong tài liệu.
2. Tạo minna/22.html từ minna/21.html (chỉ đổi <title> và data-lesson).
3. Mở bài 22 trong availableLessons của index.html.
4. Chạy npm run validate đến khi 0 lỗi, rồi tự rà danh sách kiểm ở mục 5 và sửa.
5. Chạy thử bằng python3 -m http.server, chơi mỗi trò một lượt, chụp màn hình gửi tôi.
6. Commit lên nhánh riêng, tạo PR, báo lại các chỗ còn phân vân về nội dung để giáo viên duyệt.
```

Soạn nhiều bài một lúc thì nên làm **mỗi bài một PR** để giáo viên dễ duyệt nội dung.
