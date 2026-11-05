---
description: Soạn bài luyện tập game Minna theo docs/huong-dan-tao-bai-moi.md
argument-hint: [số bài, ví dụ 30]
---

Đọc toàn bộ file `docs/huong-dan-tao-bai-moi.md` và làm đúng theo đó.

Số bài cần soạn: $ARGUMENTS (nếu trống thì hỏi lại người dùng trước khi làm).

Việc cần làm:
1. Lấy nội dung bài (từ vựng, mẫu câu, hội thoại) từ yêu cầu của người dùng. Nếu chưa có, hỏi trước khi soạn.
2. Tạo `data/minna/NN.json` đủ game1 (35), game2 (30), game3 (20), game4 (20), đúng tỉ lệ easy/medium/hard, đúng quy ước furigana và giải thích.
3. Tạo `minna/NN.html` bằng cách sao chép từ bài gần nhất đã có, chỉ đổi `<title>` và `data-lesson`.
4. Đăng ký bài trong `data/resources.json` (mục `game.minna`) để nút "Học bài này" mở được.
5. Chạy `npm run validate` cho đến khi 0 lỗi.
6. Chạy thử trang bằng `python3 -m http.server` và kiểm tra không có lỗi JS.
7. Báo lại cho người dùng: file đã tạo, kết quả kiểm tra, các chỗ còn phân vân về nội dung. Không commit hay tạo PR nếu người dùng không yêu cầu.
