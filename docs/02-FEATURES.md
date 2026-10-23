# 02 — Đặc tả tính năng

Mỗi tính năng gồm: vai trò, luồng, quy tắc, tiêu chí nghiệm thu (kiểm thử được). Mã tính năng dùng ở `07-ROADMAP.md`.

## Ma trận quyền

| Mã | Chức năng | Viewer | Admin |
|---|---|---|---|
| F1 | Xem trang giới thiệu scrollytelling | Có | Có |
| F2 | Xem dự án | Có | Có |
| F3 | Tra cứu, lọc, tải tài liệu | Có | Có |
| F4 | Nộp tài liệu (link) → chờ duyệt | Có | Không cần, thêm thẳng |
| F5 | Gửi lời nhắn (guestbook) → chờ duyệt | Có | Không cần |
| F6 | Đăng nhập | Không áp dụng | Có |
| F7 | Sửa hồ sơ (bio, kỹ năng, liên hệ) | Không | Có |
| F8 | Quản lý dự án (thêm, sửa, xóa, sắp xếp) | Không | Có |
| F9 | Quản lý tài liệu (thêm, sửa, xóa kèm file) | Không | Có |
| F10 | Duyệt / từ chối đóng góp | Không | Có |
| F11 | Duyệt / ẩn lời nhắn | Không | Có |

"Không" nghĩa là bị chặn ở tầng DB (RLS/RPC), không chỉ ẩn nút trên giao diện.

---

## F1 — Trang giới thiệu scrollytelling

**Mô tả**: Một trang dài chia thành các chương. Một đối tượng 3D cố định phía sau biến đổi theo tiến độ cuộn. Chi tiết kỹ thuật ở `04`.

**Nguồn nội dung**: bảng `profile` và `projects`. Khi DB lỗi hoặc rỗng, dùng `src/data/*.ts`, giữ hành vi hiện tại ở `Home.tsx:25-33`.

**Quy tắc**
- Toàn bộ chữ nằm trong DOM, không vẽ chữ vào canvas. Lý do: truy cập được, chọn/sao chép được, công cụ tìm kiếm đọc được.
- Nếu không có WebGL, hoặc người dùng bật giảm chuyển động, hoặc thiết bị yếu: hiển thị bản tĩnh với cùng nội dung (xem `04` mục 6).
- Có nút bỏ qua hiệu ứng ("Xem bản tĩnh") luôn hiển thị.

**Nghiệm thu**
- [ ] Tắt JavaScript canvas (mô phỏng không WebGL): mọi chữ và liên kết vẫn đọc và bấm được.
- [ ] Bật `prefers-reduced-motion`: không có chuyển động camera, nội dung đầy đủ.
- [ ] Điều hướng bằng bàn phím tới được mọi liên kết, thấy rõ viền focus.
- [ ] Rời trang rồi quay lại 10 lần: số WebGL context đang mở không tăng (kiểm tra bằng tiện ích `WEBGL_lose_context` hoặc trình theo dõi bộ nhớ của DevTools).

---

## F2 — Xem dự án

**Nguồn**: bảng `projects`. Sắp xếp theo `sort_order` rồi `created_at`.

**Quy tắc**
- Sửa lại lỗi gộp hiện tại ở `Portfolio.tsx:53-59` (link từ file local đè link DB). Sau khi chuẩn hóa DB, DB là nguồn sự thật duy nhất, file local chỉ là dự phòng.
- Link ngoài mở tab mới với `rel="noopener noreferrer"`.
- Dự án chưa có link (`#`) hiển thị "Chưa công khai", không phải nút bấm vô nghĩa.

**Nghiệm thu**
- [ ] Đổi link dự án trong Admin, tải lại trang công khai: link mới xuất hiện, không bị file local ghi đè.
- [ ] Dự án thiếu `github_link` không hiện nút chết.

---

## F3 — Tra cứu và tải tài liệu

**Nguồn**: bảng `documents` (chỉ chứa tài liệu đã duyệt).

**Quy tắc**
- Giữ tìm kiếm theo tiêu đề và lọc theo 4 học phần như `Resources.tsx:72-76`.
- Hiển thị ngày bằng hàm an toàn: thiếu hoặc sai ngày thì hiện "—", không ném lỗi (sửa lỗi `Resources.tsx:188`).
- Tài liệu nộp bằng link ngoài có nhãn rõ "Liên kết ngoài" và `rel="noopener noreferrer"`.
- Không có bộ đếm lượt tải ở bản đầu. Lý do: cần hàm RPC ghi công khai, dễ bị bơm số, giá trị thấp. [LẬP LUẬN]

**Nghiệm thu**
- [ ] Dòng có `created_at` rỗng không làm sập bảng.
- [ ] Lọc + tìm kiếm kết hợp cho kết quả đúng; không kết quả thì có thông báo.
- [ ] Trên màn hình 360 px bảng cuộn ngang được, không vỡ bố cục.

---

## F4 — Nộp tài liệu (Viewer)

**Phạm vi bản đầu**: chỉ nộp **liên kết** (Google Drive, OneDrive...). Không upload file. Lý do ở `03` mục 6.

**Luồng**
1. Viewer bấm "Đóng góp tài liệu" ở `/resources`, mở biểu mẫu.
2. Nhập: tiêu đề, học phần, mô tả ngắn, liên kết, tên hiển thị (tùy chọn).
3. Trình duyệt kiểm tra sơ bộ; ô ẩn (honeypot) để trống.
4. Gọi RPC `submit_document`. DB kiểm tra lại toàn bộ, kiểm tra tần suất, ghi với trạng thái `pending`.
5. Viewer thấy: "Đã nhận, sẽ hiển thị sau khi được duyệt".

**Quy tắc**
- Liên kết phải bắt đầu `https://`.
- Giới hạn độ dài: tiêu đề 3–255, mô tả tối đa 1000, tên tối đa 100.
- Tối đa 20 lượt nộp mỗi giờ **cho cả hệ thống** (không theo từng người; xem `03` mục 8 về đánh đổi).
- Viewer **không** đọc được bất kỳ đóng góp nào (kể cả của chính mình).

**Trạng thái giao diện (bắt buộc đủ)**: nhàn rỗi → đang gửi → thành công → lỗi kiểm tra từng ô → lỗi quá tần suất ("Thử lại sau ít phút") → lỗi mạng (có nút thử lại).

**Nghiệm thu**
- [ ] Gọi thẳng REST `POST /rest/v1/document_submissions` bằng khóa publishable: bị từ chối.
- [ ] Nộp lần thứ 21 trong 1 giờ: bị từ chối với thông báo quá tần suất.
- [ ] Điền ô honeypot: bị từ chối.
- [ ] Sau khi nộp, tài liệu **không** xuất hiện ở `/resources`.
- [ ] Liên kết `http://` hoặc `javascript:` bị từ chối ở DB.

---

## F5 — Lời nhắn (Guestbook)

**Luồng**: giống F4, RPC `submit_guestbook`. Trường: tên, nội dung (5–1000 ký tự), điểm 1–5 (tùy chọn), dự án liên quan (tùy chọn).

**Hiển thị**: chỉ các mục `is_approved = true`, tối đa N mục mới nhất. Nội dung luôn hiển thị dạng **văn bản thuần** (React tự thoát ký tự); cấm `dangerouslySetInnerHTML`.

**Nghiệm thu**
- [ ] Nội dung chứa `<script>` hiển thị nguyên văn, không thực thi.
- [ ] Mục chưa duyệt không xuất hiện công khai.

---

## F6 — Đăng nhập Admin

**Luồng**
1. `/admin/login`: email + mật khẩu qua Supabase Auth.
2. Thành công → chuyển về trang đã định tới (`state.from`) hoặc `/admin`.
3. `/admin` bọc bởi `AdminRoute`: chưa có phiên → về `/admin/login`.

**Quy tắc**
- Tắt đăng ký công khai trong cấu hình Auth.
- Phiên hợp lệ chưa đủ làm Admin: tài khoản phải có trong `admin_users` (hàm `is_admin()`). Giao diện kiểm tra bằng cách gọi `rpc('is_admin')` (chỉ `authenticated` gọi được); DB kiểm tra lại ở mọi thao tác ghi.
- Đang kiểm tra phiên: hiện trạng thái chờ, không nháy qua trang đăng nhập.
- Thông báo lỗi đăng nhập không tiết lộ email có tồn tại hay không.

**Nghiệm thu**
- [ ] Chưa đăng nhập, mở `/admin`: chuyển về login.
- [ ] Tạo thử tài khoản thứ hai không có trong `admin_users`: đăng nhập được nhưng mọi thao tác ghi bị DB từ chối.
- [ ] Tải lại trang khi đã đăng nhập: không nháy trang login.

---

## F7 — Sửa hồ sơ

**Trường**: tên, trường đại học, danh sách vai trò, bio, kỹ năng, **SĐT, email**, liên kết mạng xã hội.

**Quy tắc**
- Thay thế phần hardcode `Home.tsx:152-158`.
- Kỹ năng/vai trò nhập dạng danh sách, tách bằng dấu phẩy, bỏ trống và trùng.
- Lưu thành công có xác nhận; thất bại giữ nguyên dữ liệu đang nhập.

**Nghiệm thu**
- [ ] Đổi SĐT trong Admin → trang công khai đổi ngay sau khi tải lại, không cần build.

---

## F8 — Quản lý dự án

Thêm, sửa, xóa, đổi thứ tự (`sort_order`), đánh dấu nổi bật (`is_featured`). Xóa cần xác nhận. Thay cho tab "Add Project" hiện chỉ có thêm (`Admin.tsx:610`).

## F9 — Quản lý tài liệu

Thêm (upload file hoặc dán link), sửa tiêu đề/học phần, xóa. Xóa phải xóa cả file trong Storage; nếu xóa file thất bại thì **không** xóa bản ghi DB và báo lỗi (hiện `Admin.tsx:334-337` bỏ qua lỗi này và vẫn xóa bản ghi, để lại file mồ côi).

## F10 — Duyệt đóng góp

**Luồng**: tab "Đóng góp" liệt kê `pending` mới nhất trước, kèm số lượng chờ duyệt (dấu hiệu thay cho thông báo ngoài). Mỗi mục:
- Mở liên kết trong tab mới để kiểm tra nội dung (bắt buộc làm thủ công, hệ thống không quét virus).
- **Duyệt** → RPC `approve_submission`: tạo bản ghi `documents`, đổi trạng thái, ghi `reviewed_by`, `reviewed_at`.
- **Từ chối** → RPC `reject_submission` kèm ghi chú.

**Nghiệm thu**
- [ ] Duyệt xong, tài liệu hiện ở `/resources` mà không cần tải lại bản build.
- [ ] Duyệt hai lần cùng một mục: lần hai bị từ chối (đã không còn `pending`).
- [ ] Người không phải admin gọi `approve_submission`: bị từ chối.

## F11 — Duyệt lời nhắn

Danh sách chưa duyệt, nút Duyệt / Xóa. Lời nhắn đã duyệt có thể ẩn lại.
