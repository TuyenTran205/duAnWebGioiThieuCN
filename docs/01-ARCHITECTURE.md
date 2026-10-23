# 01 — Kiến trúc hệ thống

## 1. Hiện trạng (đọc từ mã nguồn)

| Hạng mục | Hiện trạng | Nguồn |
|---|---|---|
| Framework | React 19.2, TypeScript 6.0, Vite 8, React Router 7 | `package.json` |
| UI | Bootstrap 5.3 + react-bootstrap, CSS tùy biến | `src/index.css` |
| Animation | framer-motion 12 (đã cài) | `package.json` |
| Backend | Supabase gọi thẳng từ trình duyệt bằng anon key | `src/lib/supabaseClient.ts` |
| Routing | `BrowserRouter`, 4 route: `/`, `/portfolio`, `/resources`, `/admin` | `src/App.tsx`, `src/main.tsx` |
| Nguồn dữ liệu | Supabase, lỗi/rỗng thì rơi về `src/data/*.ts` | `src/pages/*.tsx` |
| Deploy | Vercel (theo lời bạn). Repo **không có** `vercel.json` | thư mục gốc |
| Remote | `github.com/TuyenTran205/duAnWebGioiThieuCN` | `git remote -v` |
| Bundle build | JS 653 KB, CSS 233 KB (chưa nén) | `dist/assets` |

CSS 233 KB gần như toàn bộ là Bootstrap đầy đủ (`import 'bootstrap/dist/css/bootstrap.min.css'` ở `src/main.tsx:6`). Điều này có hệ quả ở mục 5.

## 2. Kiến trúc đề xuất

```
┌──────────────────────── Trình duyệt ─────────────────────────┐
│  SPA React (Vite build, file tĩnh)                            │
│   ├─ Trang công khai: Home (scrollytelling 3D), Resources...  │
│   ├─ Chunk lazy: three.js (chỉ Home), Admin (chỉ /admin)      │
│   └─ supabase-js (anon key; sau đăng nhập là JWT admin)       │
└───────────────┬───────────────────────────────┬───────────────┘
                │ file tĩnh                     │ HTTPS (REST/RPC/Auth/Storage)
                ▼                               ▼
        ┌──────────────┐              ┌──────────────────────────┐
        │   Vercel     │              │        Supabase          │
        │  (CDN tĩnh)  │              │  Postgres + RLS          │
        └──────────────┘              │  Hàm RPC (SECURITY DEF.) │
                                      │  Auth (1 tài khoản admin)│
                                      │  Storage (file admin)    │
                                      └──────────────────────────┘
```

Không có server tự viết. "Backend" gồm: schema Postgres, chính sách RLS, các hàm RPC, chính sách Storage. Toàn bộ là SQL chạy trong Supabase.

## 3. Quyết định kiến trúc và căn cứ

### 3.1 Giữ Supabase làm backend, không viết server riêng

- Căn cứ: code đã dùng `@supabase/supabase-js` và `.env` đã có `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. [REPO]
- Không có thao tác nào cần giữ bí mật ở phía server: không thanh toán, không gọi API trả phí bằng khóa riêng. [LẬP LUẬN] Khi không có bí mật cần giấu, RLS + RPC đủ để thực thi nghiệp vụ.
- Server riêng thêm một nơi deploy, một bề mặt tấn công, và chi phí duy trì mà không đổi lại được gì.

### 3.2 Không dùng Supabase Edge Functions ở giai đoạn đầu

- Rate-limit, validate, kiểm duyệt đều làm được trong Postgres (xem `03`).
- Edge Functions cần Supabase CLI để deploy và có hạn mức gọi riêng [CẦN XÁC NHẬN].
- Điều kiện để quay lại dùng: khi cần gọi API bên ngoài kèm khóa bí mật (ví dụ gửi email). Chưa có yêu cầu này.

### 3.3 Không dùng Vercel Serverless Functions

- Cùng lý do 3.2. Ngoài ra Vercel Hobby giới hạn mục đích thương mại và có hạn mức thực thi [CẦN XÁC NHẬN], thêm ràng buộc không cần thiết.

### 3.4 Three.js dùng trực tiếp, không dùng `@react-three/fiber`

| Tiêu chí | `three` trực tiếp | `@react-three/fiber` |
|---|---|---|
| Tương thích React 19 | Không liên quan (không dùng reconciler) | Cần bản v9 trở lên [CẦN XÁC NHẬN theo changelog] |
| Số dependency thêm | 1 | 2–3 (fiber, drei...) |
| Kiểm soát vòng lặp render, dispose | Toàn bộ | Qua abstraction |
| Chi phí | Phải tự quản lý vòng đời | Ít code boilerplate hơn |

Chọn `three` trực tiếp vì phạm vi chỉ có **một cảnh, một đối tượng chính** (xem `04`), boilerplate tự quản lý không lớn, và tránh rủi ro tương thích với React 19 vốn còn mới. [LẬP LUẬN] Nếu về sau số cảnh tăng nhiều, đánh giá lại.

### 3.5 Giữ route riêng cho Resources và Admin

Scrollytelling phù hợp với câu chuyện (giới thiệu, hành trình, dự án). Không phù hợp với công cụ tra cứu như bảng tài liệu có tìm kiếm và lọc ở `src/pages/Resources.tsx`, nơi người dùng cần trang ổn định. Vì vậy:

| Route | Loại | Ghi chú |
|---|---|---|
| `/` | Scrollytelling 3D | Có chương tóm tắt dự án và tài liệu, dẫn sang route chi tiết |
| `/portfolio` | Trang thường | Giữ cho SEO và liên kết trực tiếp |
| `/resources` | Trang thường | Tra cứu + nộp đóng góp |
| `/admin/login`, `/admin` | Trang thường | Có Route Guard, tải lazy |

### 3.6 Hai vai trò, chỉ Admin có tài khoản

- **Viewer**: không đăng nhập. Mọi hành động ghi đều qua RPC có kiểm soát.
- **Admin**: một tài khoản trong Supabase Auth, được khai báo trong bảng `admin_users`.
- Không có tài khoản Viewer: không cần email xác minh, không quản lý mật khẩu người lạ, không phát sinh chi phí gửi email, giảm bề mặt tấn công. [LẬP LUẬN] Yêu cầu "2 role" được thỏa mãn bằng cách phân biệt khách ẩn danh và admin.

### 3.7 Backend không cần đóng gói

Chủ dự án hỏi backend có cần "đóng gói" (đóng gói build, container hóa) không. Kết luận: **không**, vì dự án không có tiến trình server nào do mình chạy.

- Frontend: Vercel chạy `npm run build` rồi phục vụ thư mục `dist` tĩnh. Không có gì để tự đóng gói.
- Backend: Supabase là dịch vụ có người vận hành sẵn. Phần "backend" của dự án chỉ là các tệp SQL (schema, RLS, hàm RPC) chạy trong SQL Editor. Không có image, không có runtime riêng.
- Docker/container chỉ cần khi tự chạy một tiến trình server (Node, Python...). Kiến trúc này đã loại trừ điều đó ở mục 3.1–3.3.

Điều nên làm thay cho "đóng gói": lưu các tệp SQL vào repo (`supabase/migrations/`, đánh số theo thứ tự chạy) để tái tạo được DB và xem được lịch sử thay đổi. Tạo thư mục này ở giai đoạn 1 (`07`).

## 4. Cấu trúc thư mục đề xuất

```
src/
├─ app/                  # App.tsx, routes, providers
├─ pages/
│   ├─ Home/             # Scrollytelling: các chương + điều phối
│   ├─ Portfolio.tsx
│   ├─ Resources.tsx
│   └─ admin/            # Login, Dashboard, các tab (lazy)
├─ three/                # Cảnh 3D, tách hẳn khỏi React UI
│   ├─ SceneManager.ts
│   ├─ useThreeScene.ts
│   └─ capability.ts     # phát hiện WebGL / thiết bị yếu
├─ services/             # Mọi truy cập Supabase đi qua đây
│   ├─ profileService.ts
│   ├─ projectService.ts
│   ├─ documentService.ts
│   ├─ submissionService.ts
│   └─ guestbookService.ts
├─ components/           # UI dùng chung
├─ styles/               # tokens.ts (gốc màu/chữ); theme/muiTheme.ts; CSS Tailwind ở src/index.css (xem mục 5)
├─ data/                 # Dữ liệu dự phòng khi DB lỗi (giữ nguyên)
└─ lib/supabaseClient.ts
```

Lý do tách `services/`: hiện mỗi trang gọi `supabase.from(...)` trực tiếp (`Home.tsx:17`, `Portfolio.tsx:44`, `Resources.tsx:48`, `Admin.tsx` nhiều chỗ). Gom về một tầng giúp thay đổi schema chỉ sửa một nơi, và tách được logic fallback lặp lại ở ba trang.

## 5. Quyết định UI: Tailwind CSS + MUI thay Bootstrap

Đây là quyết định của chủ dự án. Phần này ghi cách cho hai thư viện sống chung và các rủi ro đã biết, không bàn lại việc chọn.

Bootstrap hiện chiếm phần lớn 233 KB CSS (`main.tsx:6` nạp toàn bộ) và là nguồn của vẻ "template quen mắt"; `index.css` đã phải dùng `!important` khắp nơi để chống lại mặc định của nó. [REPO]

### 5.1 Phân vai

| Khu vực | Công cụ chính | Lý do |
|---|---|---|
| Trang công khai (`/`, `/portfolio`, `/resources`) | Tailwind | Cần kiểm soát thẩm mỹ cao nhất; CSS sinh ra chỉ gồm lớp đã dùng |
| Thành phần tương tác phức tạp ở trang công khai (hộp thoại nộp đóng góp, ô chọn, thông báo) | MUI, nạp lazy, đã áp theme | Tránh tự viết bẫy focus, bàn phím, ARIA |
| Admin | MUI (Table, Dialog, Tabs, TextField...) + Tailwind cho bố cục | Admin gồm 4 tab form, bảng, modal (`Admin.tsx`), đúng loại thành phần MUI làm tốt [REPO] |

### 5.2 Rủi ro đã biết và cách chặn

| # | Rủi ro | Cách chặn |
|---|---|---|
| 1 | MUI mặc định là Material Design, rất dễ nhận ra. Dùng nguyên vỏ sẽ thành giao diện template, trái yêu cầu "không AI hóa". Tailwind mặc định (palette indigo/violet, `rounded-xl`, `shadow-lg`) cũng có vẻ quen. | Bắt buộc `createTheme` và `@theme` ghi đè mặc định; danh sách cấm cụ thể ở `05` mục 5 (quy tắc 9, 10) |
| 2 | Bundle JS tăng (MUI + Emotion chạy lúc runtime) | Import theo từng thành phần (`@mui/material/Button`), không dùng `@mui/icons-material` (đã có `react-icons`), tách chunk Admin và hộp thoại bằng lazy. Mục tiêu: route `/` không chứa MUI cho tới khi mở hộp thoại. Đo bằng build, không đoán. |
| 3 | Thứ tự CSS: Tailwind v4 dùng CSS layers, Emotion chèn `<style>` lúc chạy; MUI có thể đè hoặc bị đè | Khai báo thứ tự layer tường minh (`theme, base, mui, components, utilities`) và bật chế độ CSS layer của MUI. [CẦN XÁC NHẬN cách bật theo tài liệu của phiên bản MUI được cài] |
| 4 | Hai cơ chế chế độ tối | Dùng **một** thuộc tính `data-theme` trên `<html>`: Tailwind khai báo `@custom-variant dark` theo thuộc tính đó; MUI cấu hình bộ chọn color scheme theo cùng thuộc tính. Sửa `ThemeContext.tsx:24` (đang đặt `data-bs-theme`). [CẦN XÁC NHẬN tùy chọn MUI theo phiên bản] |
| 5 | Tương thích React 19, Vite 8, plugin Tailwind | Sau khi cài chạy `npm ls` và `npm run build`; nếu cảnh báo peer dependency thì dừng và xử lý trước khi viết giao diện. [CẦN XÁC NHẬN] |
| 6 | Emotion tạo style lúc chạy, chậm khi cập nhật theo từng khung hình | Không dùng thành phần MUI trong vòng lặp cảnh 3D hoặc phần phản hồi theo cuộn (xem `04`) |
| 7 | Hai hệ CSS cùng tồn tại trên một trang trong lúc chuyển đổi (Bootstrap reset đụng Tailwind preflight) | Không chạy song song trên production. Làm trên một nhánh riêng, xem thử qua bản preview của Vercel, gộp khi toàn bộ trang đã chuyển và đã gỡ Bootstrap (xem `07` giai đoạn 3) |

### 5.3 Gói dự kiến

Thêm: `tailwindcss`, `@tailwindcss/vite`, `@mui/material`, `@emotion/react`, `@emotion/styled`.
Gỡ: `bootstrap`, `react-bootstrap`. Xem lại `@types/react-router-dom` (v5, đi cùng router v7, `package.json:27`).
Giữ: `react-icons`, `framer-motion`.

Không ghi số phiên bản ở đây: chốt khi cài và kiểm tra theo mục 5.2 dòng 5.

### 5.4 Mục tiêu đo được

CSS của trang công khai dưới 40 KB chưa nén (so với 233 KB hiện nay). JS của route `/` ở trạng thái chưa mở hộp thoại không chứa MUI. [LẬP LUẬN — ước lượng, đo lại sau build]

## 6. Nợ kỹ thuật phát hiện được (cần xử lý trong quá trình làm)

| # | Vấn đề | Vị trí | Hệ quả |
|---|---|---|---|
| 1 | SĐT và email hardcode trong JSX | `src/pages/Home.tsx:152-158` | Đổi liên hệ phải build lại |
| 2 | `/admin` không có Route Guard | `src/App.tsx:15`, `src/pages/Admin.tsx:392` | Bảo vệ duy nhất là RLS ở DB; UI chỉ ẩn bằng `opacity: 0.25` |
| 3 | Class Bootstrap không tồn tại: `px-2.5`, `py-1.5` | `Resources.tsx:178,183`, `Portfolio.tsx:127` | Class bị bỏ qua, padding không như dự định |
| 4 | Class kiểu Tailwind `hover:text-white` | `Footer.tsx:19,28,37` | Dự án không dùng Tailwind, hover không hoạt động |
| 5 | Ảnh OG mặc định `/og-image.jpg` không tồn tại | `SEO.tsx:17`; `public/` chỉ có `favicon.svg`, `icons.svg`, `robots.txt`, `sitemap.xml` | Chia sẻ link không có ảnh xem trước |
| 6 | Thẻ meta OG đặt bằng JS (react-helmet) | `SEO.tsx` | Bot mạng xã hội thường không chạy JS [LẬP LUẬN], xem trước link có thể trống. Cần thẻ tĩnh trong `index.html` |
| 7 | `new Date(doc.created_at).toISOString()` | `Resources.tsx:188` | Ném `RangeError` nếu `created_at` thiếu hoặc sai định dạng, làm sập cả bảng |
| 8 | Gradient chữ tím–xanh ở tiêu đề | `index.css:74,122,146`; `Portfolio.tsx:90`; `Resources.tsx:92`; `Admin.tsx:466` | Vi phạm yêu cầu "không AI hóa" |
| 9 | Kiểu `any` trong khối catch và dữ liệu Supabase | `Home.tsx:30`, `Portfolio.tsx:53`, `Admin.tsx` nhiều nơi | Mất kiểm tra kiểu tại ranh giới DB |
| 10 | `@types/react-router-dom` v5 cùng `react-router-dom` v7 | `package.json:27` | v7 đã tự đi kèm kiểu [CẦN XÁC NHẬN], gói v5 có thể thừa hoặc gây nhiễu |
| 11 | Không có `vercel.json`, dùng `BrowserRouter` | thư mục gốc | Mở trực tiếp `/portfolio` hoặc `/resources` có thể trả 404 trên host tĩnh [CẦN XÁC NHẬN bằng cách thử trên bản deploy hiện tại] |
| 12 | Link LinkedIn trỏ trang chủ chung | `Footer.tsx:25` | Không dẫn tới hồ sơ thật |
| 13 | `README.md` là bản mẫu của Vite | `README.md` | Không mô tả dự án |

## 7. Ranh giới của kiến trúc này

- **Không phù hợp** nếu sau này cần: tài khoản người dùng thường, bình luận thời gian thực với nhiều người, thanh toán. Khi đó phải đánh giá lại (bổ sung Auth cho Viewer, thêm kiểm duyệt tự động).
- **SEO**: SPA không SSR. Với portfolio cá nhân mục tiêu chính là người nhận link trực tiếp, mức này chấp nhận được. Nếu cần xếp hạng tìm kiếm cho nội dung tài liệu, cần tiền kết xuất (prerender) các trang công khai. Chưa nằm trong phạm vi.
