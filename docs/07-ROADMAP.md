# 07 — Lộ trình

Nguyên tắc: **mỗi giai đoạn tạo ra một bản chạy được và kiểm thử được**, và không phá bản đang deploy. Thứ tự đi từ nền móng (dữ liệu, bảo mật) tới bề mặt (giao diện, 3D), vì 3D đẹp trên nền dữ liệu hở là rủi ro lớn hơn 3D xấu trên nền an toàn.

Không đưa ước lượng thời gian: tôi không biết quỹ thời gian và tốc độ làm việc của bạn, nên chỉ có thứ tự và tiêu chí hoàn thành.

## Giai đoạn 0 — Xác nhận dữ kiện (trước mọi thứ)

| Việc | Đầu ra |
|---|---|
| Mở dashboard Supabase xem project cũ | **Đã xong**: project đang paused (ảnh chụp 2026-10-20). Chủ dự án chọn tạo project mới |
| Tải bản sao lưu project cũ (database + storage) từ trang project (`03` mục 0.1) | Có bản sao lưu để quyết định có gì cần chuyển sang |
| Repo công khai (đã xác minh, giữ nguyên). Tên miền, Tailwind + MUI và việc bỏ "đóng gói" đã chốt | Quyết định bằng chữ |
| Thử mở thẳng `/resources` trên bản deploy hiện tại | Biết có đang 404 không |

**Hoàn thành khi**: có bản sao lưu project cũ và biết kết quả thử `/resources`. Các giai đoạn sau điều chỉnh theo kết quả này.

## Giai đoạn 1 — Nền móng: bảo mật, dữ liệu, deploy

| Mã | Việc |
|---|---|
| 1.1 | Thêm `vercel.json` (rewrite SPA); deploy thử |
| 1.2 | Tạo project Supabase mới (`03` mục 0.2); tạo `supabase/migrations/` và lưu 5 tệp SQL `0001`–`0005` của `03` |
| 1.3 | Chạy 5 tệp SQL theo đúng thứ tự trong SQL Editor |
| 1.4 | Tắt đăng ký công khai; tạo tài khoản admin; chạy `0005` để thêm vào `admin_users` |
| 1.5 | Chạy bộ kiểm thử bảo mật `03` mục 9 |
| 1.6 | ~~Sửa `robots.txt`, `sitemap.xml` theo domain thật~~ (đã xong); thêm `.env.example` |
| 1.7 | Cập nhật `.env` cục bộ, biến môi trường Vercel và Site URL của Supabase (`03` mục 7); deploy lại |

**Hoàn thành khi**: mọi mục kiểm thử bảo mật `03` mục 9 đạt; site chạy với project mới (không còn banner "fallback mode"). Giữ project cũ cho tới khi xác nhận xong.

## Giai đoạn 2 — Tầng dịch vụ và Admin thật

| Mã | Việc | Tính năng |
|---|---|---|
| 2.1 | Tạo `src/services/*`; chuyển 3 trang sang dùng; bỏ `any` ở ranh giới DB; sửa `toISOString` ở `Resources.tsx:188` | F2, F3 |
| 2.2 | Đưa SĐT/email vào `profile`; bỏ hardcode ở `Home.tsx:152-158` | F7 |
| 2.3 | `AdminRoute`, `/admin/login`, kiểm tra `rpc('is_admin')`; tải lazy khu Admin | F6 |
| 2.4 | Admin: sửa hồ sơ; quản lý dự án (CRUD, thứ tự); quản lý tài liệu (xóa file thất bại thì không xóa bản ghi) | F7, F8, F9 |

**Hoàn thành khi**: nghiệm thu F6, F7, F8, F9 (`02`) đạt; đổi SĐT trong Admin thấy ngay trên trang công khai.

## Giai đoạn 3 — Đóng góp và kiểm duyệt

| Mã | Việc | Tính năng |
|---|---|---|
| 3.1 | Biểu mẫu nộp tài liệu (link), honeypot, đủ trạng thái giao diện | F4 |
| 3.2 | Lời nhắn: gửi + hiển thị đã duyệt | F5 |
| 3.3 | Admin: hàng chờ, duyệt, từ chối, đếm chờ duyệt | F10, F11 |
| 3.4 | Workflow keepalive | `06` mục 7 |

**Hoàn thành khi**: nghiệm thu F4, F5, F10, F11 đạt, bao gồm các ca tấn công (gọi REST thẳng, vượt tần suất, XSS).

## Giai đoạn 4 — Thiết kế lại giao diện

| Mã | Việc |
|---|---|
| 4.0 | Tạo nhánh riêng. Cài Tailwind + MUI, chạy `npm ls` và `npm run build` kiểm tra tương thích React 19 / Vite 8 (`01` mục 5.2 dòng 5). Có vấn đề thì dừng xử lý tại đây |
| 4.1 | Tạo `src/styles/tokens.ts`, khối `@theme` Tailwind, `muiTheme.ts` (đã ghi đè mặc định Material); thống nhất `data-theme`; chọn và tự lưu trữ font; kiểm tra dấu tiếng Việt |
| 4.2 | Dựng lại từng trang theo `05`. Không chạy Bootstrap song song trên production: kiểm tra qua bản preview của Vercel, gộp nhánh khi mọi trang đã chuyển, rồi gỡ `bootstrap` và `react-bootstrap` |
| 4.3 | Viết lại toàn bộ chữ giao diện (giọng riêng, một ngôn ngữ chính) |
| 4.4 | Sửa nợ kỹ thuật còn lại (`01` mục 6: `Footer`, class không tồn tại, OG, link LinkedIn, README) |

Admin dùng MUI làm chính (bảng, hộp thoại, tab, ô nhập), chuyển cùng đợt để không còn Bootstrap.

**Hoàn thành khi**: danh sách kiểm tra `05` mục 8 đạt cho mọi trang công khai; CSS công khai đạt mục tiêu kích thước.

## Giai đoạn 5 — Scrollytelling 3D

| Mã | Việc |
|---|---|
| 5.1 | Dựng bản tĩnh của `/` theo cấu trúc chương **trước** (DOM hoàn chỉnh, nội dung thật) |
| 5.2 | `SceneManager`, `useThreeScene`, dispose đúng; chỉ một đối tượng, một trạng thái |
| 5.3 | Các trạng thái chương + nội suy theo cuộn |
| 5.4 | `capability.ts`: ba chế độ, đo FPS, nút "Xem bản tĩnh" |
| 5.5 | Thẻ OG tĩnh trong `index.html`, ảnh OG thật |

Làm bản tĩnh trước cho đảm bảo nội dung và truy cập hoàn chỉnh dù 3D có chưa xong hay hỏng.

**Hoàn thành khi**: nghiệm thu `04` mục 9 đạt.

## Giai đoạn 6 — Go-live

Thực hiện danh sách kiểm tra `06` mục 9. Sau go-live, theo dõi tuần đầu: Usage của Supabase, lỗi trong console, đóng góp rác đến hàng chờ.

## Rủi ro và quyết định mở

| # | Rủi ro / câu hỏi | Ảnh hưởng | Cách xử lý |
|---|---|---|---|
| R1 | Cú pháp SQL ở `03` có thể không chạy đúng trên Supabase hiện tại (tôi chưa chạy thử trên project thật: cấu trúc `storage.buckets`, tên mục Auth, mặc định cấp quyền bảng) | Một khối SQL báo lỗi giữa chừng | Chạy từng tệp `0001`–`0005` riêng, đọc lỗi, sửa tệp rồi chạy lại; project mới còn trống nên chạy lại an toàn |
| R2 | Giới hạn toàn cục có thể bị kẻ xấu dùng để chặn kênh đóng góp trong 1 giờ | Người thật tạm thời không nộp được; không có nội dung độc nào lên trang công khai | Chấp nhận (`03` mục 8); nâng cấp lên giới hạn theo IP nếu thực tế bị lạm dụng |
| R7 | Dữ liệu/tài liệu ở project cũ không tự sang project mới | Mất nội dung nếu không sao lưu | Tải sao lưu trước (`03` mục 0.1); chưa xóa project cũ |
| R3 | Ưu đãi tên miền hết hạn | Mất domain | Dùng `*.vercel.app` làm đường lui (`06` mục 2) |
| R4 | Dự án Supabase bị dừng | Mất tính năng động | Dữ liệu dự phòng + keepalive |
| R5 | Cảnh 3D chạy kém trên máy yếu | Trải nghiệm xấu | Ba chế độ + bản tĩnh bắt buộc |
| R6 | Phạm vi nở dần (nhiều chương, nhiều tính năng) | Không bao giờ xong | Giữ một đối tượng 3D, năm chương; thêm tính năng sau khi go-live |
| Q1 | ~~"Đóng gói"~~ | Đã giải quyết: backend không cần đóng gói (`01` mục 3.7) | Bỏ |
| Q2 | Ngôn ngữ chính của giao diện? | Viết lại chữ giao diện | Hỏi ở `05` mục 7 |
| Q3 | Có muốn Viewer upload tệp (không chỉ link)? | Rủi ro Storage, công việc thêm | Mặc định không ở bản đầu |

## Ngoài phạm vi (cố ý)

Tài khoản người xem thường, bình luận thời gian thực, thông báo email/Telegram, SSR/tiền kết xuất, bộ đếm lượt tải, đa ngôn ngữ, phân tích truy cập. Mỗi mục có thể thêm sau; bản đầu tập trung vào những gì bạn yêu cầu.
