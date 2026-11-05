---
description: Soạn slide bài giảng Minna theo docs/quy-uoc-slide-bai-giang.md
argument-hint: [số bài, ví dụ 30]
---

Đọc toàn bộ file `docs/quy-uoc-slide-bai-giang.md` và làm đúng theo đó.

Số bài cần soạn: $ARGUMENTS (nếu trống thì hỏi lại người dùng trước khi làm).

Việc cần làm:
1. Lấy nội dung bài giảng từ yêu cầu của người dùng. Nếu chưa có, hỏi trước khi soạn.
2. Tạo `slides/minna/NN.html` theo quy ước, lấy `slides/minna/_mau.html` làm mẫu cấu trúc. Chỉ dùng `assets/css/slides.css` và `assets/js/slides.js`, không viết `<style>` riêng, không dùng màu thô.
3. Chạy `npm run validate` cho đến khi 0 lỗi.
4. Báo lại cho người dùng: file đã tạo, kết quả kiểm tra. Chạy `node scripts/sync-slides.mjs` để tự cập nhật `data/resources.json` (mục `slide.minna`); không sửa file này bằng tay. Nút slide của bài chỉ hiện trên `main` sau khi file được merge. Không commit hay tạo PR nếu người dùng không yêu cầu.
