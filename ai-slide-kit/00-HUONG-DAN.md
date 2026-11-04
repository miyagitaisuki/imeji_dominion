# Bộ công cụ nạp AI để soạn slide bài giảng IMEJI日本語教室

Bộ này giúp **bất kỳ mô hình AI nào** (ChatGPT, Gemini, Claude, Copilot…) soạn ra file slide đúng giao diện của hệ sinh thái IMEJI: nền mây, thẻ kính, màu và font thương hiệu, có điều khiển bằng phím và vuốt, furigana tự động.

## Có những gì

| File / thư mục | Dùng để |
|---|---|
| `01-PROMPT-he-thong.md` | **Quan trọng nhất.** Toàn bộ quy tắc, danh mục thành phần, bài mẫu HTML, danh sách tự kiểm. Nạp vào AI làm chỉ dẫn. |
| `02-MAU-YEU-CAU.md` | Mẫu tin nhắn điền số bài, từ vựng, ngữ pháp, hội thoại. |
| `03-TAT-CA-TRONG-1-FILE.md` | Gộp 01 + 02 thành một file, để dán vào các giao diện chat chỉ nhận chữ. |
| `bai-mau.html` | Bài mẫu HTML (đã nằm trong 01; để AI đọc riêng nếu cần). |
| `xem-thu/` | Thư mục **xem thử không cần cài gì**: lưu file AI trả về vào `xem-thu/slides/minna/` rồi mở bằng trình duyệt. |

## Cách dùng (3 bước)

**Bước 1. Nạp bộ quy tắc cho AI**
- ChatGPT / Gemini / Claude có nhận file: tạo cuộc trò chuyện mới, đính kèm `01-PROMPT-he-thong.md` (hoặc dán nội dung vào ô chat) và nói: *"Đây là bộ quy tắc soạn slide. Tôi sẽ gửi nội dung bài, bạn xuất file HTML theo đúng quy tắc."*
- Giao diện chỉ dán được chữ: dán nguyên `03-TAT-CA-TRONG-1-FILE.md`, điền phần "MẪU YÊU CẦU" ở cuối.
- Dùng lâu dài: đặt `01-PROMPT-he-thong.md` vào **Project / Custom GPT / Gem / Instructions** của công cụ, các bài sau chỉ gửi mẫu yêu cầu.

**Bước 2. Gửi nội dung từng bài**
Điền `02-MAU-YEU-CAU.md` (số bài, từ mới, ngữ pháp, hội thoại; có thể gửi ảnh trang sách). AI trả về **một khối mã HTML**.

**Bước 3. Lưu và xem thử**
1. Sao chép khối mã, lưu thành `xem-thu/slides/minna/22.html` (đúng số bài), mã hóa UTF-8.
2. Mở file bằng Chrome/Edge/Safari. Bấm ← → hoặc vuốt để chuyển slide, F để toàn màn hình. Cần có mạng để tải font.
3. Có lỗi hiển thị hoặc nội dung sai: dán lại cho AI kèm mô tả, ví dụ *"Slide 5 tràn chữ, tách làm hai"*, *"Câu ví dụ 3 sai ngữ pháp, sửa lại"*.
4. Chú ý các dòng `<!-- CẦN DUYỆT: … -->` trong file: đó là chỗ AI không chắc, thầy kiểm tra rồi xóa dòng.

## Đưa slide vào trang web thật

Slide đã duyệt cần đặt vào dự án imeji_dominion:
1. Chép file vào `slides/minna/22.html` trong repo.
2. Thêm số bài vào `data/resources.json`: `"slide": { "minna": [22] }`.
3. Chạy `npm run validate` (phải 0 lỗi) rồi gộp (merge) vào nhánh main.

Cách nhanh: mở một phiên Claude Code trên repo imeji_dominion, dán file HTML và nói *"đặt vào slides/minna/22.html, bật trong data/resources.json, chạy validate, tạo PR"*.

## Mẹo để AI soạn tốt

- Gửi **ảnh trang từ vựng và mẫu câu** của sách để AI không tự đoán nội dung giáo trình.
- Soạn **mỗi bài một cuộc trò chuyện** để nội dung các bài không lẫn nhau.
- Mô hình yếu hay quên quy tắc ở bài dài: nhắc lại *"giữ đúng bộ quy tắc, chỉ dùng class có sẵn, không viết CSS"*.
- AI có thể sai ngữ pháp tiếng Nhật hoặc sai furigana. **Luôn rà lại** trước khi đăng, nhất là phần giải thích và câu ví dụ.

## Vì sao có thư mục xem-thu

File slide gọi CSS, JS, logo và ảnh nền bằng đường dẫn `../../assets/…`. Thư mục `xem-thu/` dựng sẵn đúng cấu trúc đó nên file lưu vào mở được ngay trên máy, không cần máy chủ.

---
*Bộ này sinh tự động từ repo imeji_dominion bằng `npm run build:ai-kit` (nguồn: docs/quy-uoc-slide-bai-giang.md và slides/minna/_mau.html). Quy ước đổi thì chạy lại lệnh để bộ công cụ cập nhật.*
