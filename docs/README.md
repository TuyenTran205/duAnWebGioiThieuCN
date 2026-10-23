# Bộ tài liệu thiết kế lại `portfolio-web`

Phiên bản bộ tài liệu: 4.0 — lập ngày 2026-10-20.
Thay thế `PROJECT_RESTRUCTURE_SPEC.md` (bản 3.0), xem mục "Thay đổi so với bản 3.0" bên dưới.

## Mục tiêu

1. Thêm backend để người xem đóng góp nội dung (tài liệu, lời nhắn), có kiểm duyệt.
2. Chuyển giao diện sang hướng 3D Interactive Scrollytelling.
3. Hai vai trò: **Viewer** (không đăng nhập) và **Admin** (đăng nhập, chỉnh sửa nội dung Viewer nhìn thấy).
4. Giao diện không mang dấu hiệu "AI làm".
5. Chi phí vận hành gần như bằng 0, giữ Vercel làm nơi host.

## Danh mục tài liệu

| File | Nội dung | Đọc khi |
|---|---|---|
| [01-ARCHITECTURE.md](01-ARCHITECTURE.md) | Kiến trúc tổng thể, lựa chọn công nghệ và lý do, nợ kỹ thuật hiện có | Bắt đầu |
| [02-FEATURES.md](02-FEATURES.md) | Đặc tả từng tính năng theo vai trò, luồng nghiệp vụ, tiêu chí nghiệm thu | Trước khi code từng tính năng |
| [03-DATABASE-AND-SECURITY.md](03-DATABASE-AND-SECURITY.md) | Schema, RLS, hàm RPC, Storage, mô hình đe dọa | Trước khi chạy SQL |
| [04-FRONTEND-3D-SCROLLYTELLING.md](04-FRONTEND-3D-SCROLLYTELLING.md) | Kịch bản cuộn, cấu trúc cảnh 3D, hiệu năng, fallback | Trước khi dựng 3D |
| [05-DESIGN-SYSTEM.md](05-DESIGN-SYSTEM.md) | Quy tắc giao diện "không AI hóa", token màu/chữ, danh sách cấm | Trước khi viết CSS |
| [06-DEPLOYMENT-AND-COST.md](06-DEPLOYMENT-AND-COST.md) | Vercel, Supabase, tên miền, chi phí, chống ngủ đông | Trước khi deploy |
| [07-ROADMAP.md](07-ROADMAP.md) | Các giai đoạn, đầu việc, tiêu chí nghiệm thu từng giai đoạn | Lập kế hoạch |

## Quy ước đánh dấu độ tin cậy

Mỗi khẳng định trong bộ tài liệu thuộc một trong ba loại:

- **[REPO]** — đọc trực tiếp từ mã nguồn, có kèm đường dẫn và số dòng.
- **[LẬP LUẬN]** — suy ra từ [REPO] hoặc từ nguyên lý kỹ thuật phổ biến, có nêu căn cứ.
- **[CẦN XÁC NHẬN]** — phụ thuộc vào thông tin bên ngoài repo (hạn mức nhà cung cấp, trạng thái DB thật, quyền sở hữu domain). Phải kiểm tra trước khi dựa vào.

## Giả định cần bạn xác nhận

Các điểm dưới đây tôi không thể tự kiểm chứng. Tài liệu được viết để vẫn đúng dù bạn trả lời theo hướng nào, nhưng kết quả triển khai có thể khác.

1. **"Đóng gói" — ĐÃ GIẢI QUYẾT, BỎ.** Chủ dự án hỏi backend có cần đóng gói không, không cần thì bỏ. Kết luận ở `01` mục 3.7: không cần, vì không có server tự chạy. Thay bằng việc lưu SQL vào `supabase/migrations/`. Yêu cầu gốc "BE để đóng góp" vẫn giữ nguyên, nên F4, F5, F10, F11 và giai đoạn 3 được khôi phục. **Nếu tôi hiểu sai, nói lại để chỉnh.**
2. **Tên miền — ĐÃ XÁC NHẬN**: `tranvantuyen.dev` (Name.com, hết hạn 2027-07-29, DNS tại Name.com). Chi tiết ở `06` mục 2. `public/robots.txt` và `public/sitemap.xml` trước đây ghi `tuyentran.dev` (không phân giải được), **đã sửa** sang `tranvantuyen.dev`.
3. **Giao diện — ĐÃ CHỐT**: Tailwind CSS + MUI thay Bootstrap. Xem `01` mục 5.
4. **Supabase — ĐÃ CHỐT: TẠO PROJECT MỚI, schema từ đầu.** Project cũ đang **paused** (ảnh chụp dashboard của chủ dự án, 2026-10-20; còn resume được đến 21/11/2027). Trước đó host cũ (`jcrn…supabase.co`, nằm trong `.env` và `dist/assets`) không phân giải DNS từ máy tôi, khớp với việc bị paused. Bản `03` được viết lại cho project trống, không còn tương thích với tên cột của code cũ. Dữ liệu và tài liệu đã upload ở project cũ **không tự sang**: cần tải bản sao lưu từ trang project (`03` mục 0).
5. **Hạn mức Supabase/Vercel**: không truy cập được dashboard của bạn. Mọi con số đều là [CẦN XÁC NHẬN].
6. **Repo — ĐÃ XÁC MINH LÀ CÔNG KHAI** (GitHub API trả `private: false`, 2026-10-20). Chọn **giữ công khai**: portfolio tự liên kết tới repo này như một dự án (`src/data/projects.ts:33`), chuyển riêng tư sẽ làm nút "View Details" của chính bạn thành link chết với người xem; Actions miễn phí cho repo công khai [CẦN XÁC NHẬN]. Lịch sử Git còn chứa `.env` của project **cũ** (khóa publishable, không phải secret); project mới dùng khóa khác nên không ảnh hưởng, xem `03` mục 7.

## Thay đổi so với bản 3.0

Bản 3.0 có 4 điểm tôi xác định là sai hoặc yếu khi rà lại, đã sửa trong bộ này:

1. **Rate-limit bị vô hiệu hóa được.** Bản 3.0 cho phép `anon` INSERT trực tiếp vào bảng submissions đồng thời có hàm throttle. Kẻ xấu gọi thẳng REST API sẽ bỏ qua hàm throttle. Bản 4.0 không cấp quyền INSERT trực tiếp, chỉ cho phép qua RPC.
2. **Mọi `authenticated` đều là admin.** Policy cũ dùng `auth.role() = 'authenticated'`. Nếu lỡ bật đăng ký công khai, ai đăng ký cũng thành admin. Bản 4.0 dùng bảng `admin_users` + hàm `is_admin()`.
3. **Hướng thẩm mỹ cũ là hướng bị cấm.** Bản 3.0 đề xuất "holographic pods", "Electric Cyan", nền kính mờ — đúng các dấu hiệu "AI làm". Bản 4.0 thay bằng hướng tiết chế, xem `05`.
4. **Upload ẩn danh mở sẵn.** Rủi ro lấp đầy 1 GB Storage miễn phí bằng file rác. Bản 4.0 mặc định Viewer chỉ nộp **link**, mở upload trực tiếp là bước tùy chọn sau khi đã gia cố.
