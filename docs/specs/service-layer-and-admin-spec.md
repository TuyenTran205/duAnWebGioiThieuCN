# ĐẶC TẢ KỸ THUẬT: TẦNG DỊCH VỤ (SERVICE LAYER) & KHU VỰC QUẢN TRỊ (ADMIN PORTAL)
**Tài liệu:** `docs/specs/service-layer-and-admin-spec.md`  
**Giai đoạn:** Giai đoạn 2 trong `docs/07-ROADMAP.md` (Tính năng F6 – F11 từ `docs/02-FEATURES.md`)  
**Tác giả:** Product Architect & UX Specifier (BA)  
**Trạng thái:** Hoàn thành — Sẵn sàng chuyển giao cho `senior-dev`  
**Phiên bản:** 1.0.0  

---

## 1. TỔNG QUAN VÀ KHẢO SÁT HIỆN TRẠNG CODEBASE

### 1.1 Mục tiêu phạm vi
Đặc tả kỹ thuật này thiết kế chi tiết việc triển khai:
1. **Phạm vi A — Tầng dịch vụ (Service Layer):** Đóng gói toàn bộ logic truy vấn Supabase tại thư mục `src/services/`. Loại bỏ hoàn toàn việc gọi `supabase.from()` trực tiếp trong các trang/component. Chuẩn hóa cơ chế dự phòng (fallback) sang `src/data/*.ts` khi cơ sở dữ liệu gặp sự cố hoặc rỗng.
2. **Phạm vi B — Khu vực Quản trị (Admin Portal):** Xây dựng hoàn chỉnh luồng đăng nhập bảo mật hai lớp (`/admin/login`), bảo vệ tuyến đường (`AdminRoute`), và bảng điều khiển quản trị (`/admin`) gồm 5 phân hệ: Hồ sơ cá nhân (F7), Quản lý dự án (F8), Quản lý tài liệu & Storage (F9), Duyệt đóng góp (F10), Kiểm duyệt lời nhắn (F11).
3. **Phạm vi sửa đổi tối thiểu trang công khai:** Chuyển `Home.tsx`, `Portfolio.tsx`, `Resources.tsx` sang tiêu thụ Tầng dịch vụ, sửa triệt để các lỗi kiểu dữ liệu (`any`), lỗi gộp id dự án sai, lỗi ném ngoại lệ khi định dạng ngày (`toISOString`), và xóa bỏ số điện thoại/email hardcode. Không thay đổi giao diện/layout của các trang công khai ở giai đoạn này.

### 1.2 Khảo sát kỹ thuật & Rào cản hiện hữu
- **Công nghệ nền tảng:** React 19.2.7, TypeScript ~6.0.2, Vite 8.1.1, React Router 7.18.1, Framer Motion 12.42.2, Supabase JS 2.110.9.
- **Xung đột giao diện:** Hiện tại `src/main.tsx` đang import toàn cục `bootstrap/dist/css/bootstrap.min.css` (233 KB). Chưa thể cài đặt Tailwind CSS ở giai đoạn này vì Tailwind preflight sẽ phá vỡ toàn bộ cấu trúc Bootstrap trên các trang công khai. Do đó, khu vực Admin được chỉ định sử dụng `@mui/material` và `@emotion/react` (Emotion chạy cách ly theo scoped classes, hoàn toàn sống chung an toàn với Bootstrap).
- **Phân tách mã nguồn (Code-splitting):** Toàn bộ phân hệ Admin và các thư viện phụ thuộc (`@mui/material`, `@emotion/react`, `@emotion/styled`) phải được tải trễ (lazy-loaded). Khách truy cập trang công khai (`/`, `/portfolio`, `/resources`) tuyệt đối không phải tải bất kỳ byte nào của MUI bundle.
- **Hiện trạng kiểm thử:** Dự án chưa cài đặt bất kỳ khung kiểm thử nào (`vitest`, `jest`, `@testing-library/react`). Giai đoạn này bắt buộc chỉ định bổ sung `vitest` và testing-library để phục vụ Subagent `auto-tester`.

### 1.3 CẢNH BÁO QUAN TRỌNG VỀ DỮ LIỆU VÀ QUYỀN TRUY CẬP SUPABASE
> [!CAUTION]
> **CẢNH BÁO MẤT QUYỀN ADMIN (CRITICAL CONFIGURATION NOTICE):**
> 1. Bảng `admin_users` trên Supabase hiện tại **CHƯA CÓ BẤT KỲ DÒNG NÀO** (kết quả kiểm tra thực tế trên SQL Editor). Nguyên nhân: lần chạy `0005_seed.sql` trước đây sử dụng placeholder email nên lệnh `insert into admin_users select id from auth.users where email = ...` không khớp được tài khoản nào và không chèn dữ liệu.
> 2. Tài khoản quản trị viên đã đăng ký trong Supabase Auth là:
>    - **Email:** `tranvantuyen.dev@gmail.com`
>    - **Auth UID:** xem tại Authentication → Users (bấm vào tài khoản để copy `User UID`).
> 3. Tệp `supabase/migrations/0005_seed.sql` đã được sửa: thay vì hardcode UUID (dễ gõ sai một ký tự), câu lệnh giờ tra UUID theo email trong `auth.users` bằng khối `DO ... RAISE EXCEPTION` — nếu không tìm thấy tài khoản, seed báo lỗi rõ ràng thay vì âm thầm không chèn dòng nào.
> 4. **Hành động bắt buộc:** Chạy câu lệnh sau trực tiếp trong SQL Editor của Supabase trước khi kiểm thử đăng nhập Admin (nếu đã chạy `0005_seed.sql` thì bỏ qua):
>    ```sql
>    insert into public.admin_users (user_id)
>    select id from auth.users where email = 'tranvantuyen.dev@gmail.com'
>    on conflict (user_id) do nothing;
>
>    -- Kiểm tra lại: phải trả về đúng 1 dòng
>    select * from public.admin_users;
>    ```
>    Nếu thiếu dòng này, hàm RPC `is_admin()` sẽ luôn trả về `false`, khiến người dùng bị kẹt vô tận ở trạng thái từ chối truy cập (Access Denied).

---

## 2. QUYẾT ĐỊNH KIẾN TRÚC BẮT BUỘC (ARCHITECTURAL DECISIONS)

### AD-1: Chuẩn hóa Tầng dịch vụ (Service Layer Architecture)
- **Vị trí:** Tất cả mã nguồn giao tiếp mạng với Supabase được gom vào thư mục `src/services/`.
- **Nguyên tắc:** Cấm tuyệt đối component/page gọi `supabase.from()`, `supabase.rpc()`, `supabase.storage` hoặc `supabase.auth` trực tiếp (ngoại trừ trong các file service).
- **Cơ chế phản hồi chuẩn (Standardized Service Response):**
  Mọi hàm đọc dữ liệu (query) trả về kiểu dữ liệu thống nhất:
  ```typescript
  export interface ServiceResponse<T> {
    data: T;
    error: string | null;
    source: 'db' | 'fallback';
  }
  ```
  Mọi hàm biến đổi dữ liệu (mutation: create, update, delete, review) trả về:
  ```typescript
  export interface MutationResponse<T = void> {
    data: T | null;
    error: string | null;
    success: boolean;
  }
  ```
- **Lý do lựa chọn:**
  1. Cung cấp cờ `source: 'db' | 'fallback'` rõ ràng để UI biết khi nào cần hiển thị banner cảnh báo dự phòng nhẹ nhàng mà không cần suy diễn từ chuỗi lỗi.
  2. Tách biệt hoàn toàn logic cứu hộ dữ liệu (fallback recovery) ra khỏi giao diện. Nếu Supabase sập, mất mạng, hoặc bảng trống, tầng dịch vụ tự động trả về `src/data/*.ts` và đính kèm `source: 'fallback'`.
  3. Xóa bỏ hoàn toàn kiểu dữ liệu `any` ở ranh giới cơ sở dữ liệu.

### AD-2: Khu Admin sử dụng MUI độc lập (Emotion Scoped CSS)
- **Căn cứ:** Bootstrap 5 đang nạp toàn cục tại `src/main.tsx:6`. Việc cài Tailwind ở giai đoạn này gây xung đột nghiêm trọng với CSS Reset của Bootstrap.
- **Giải pháp:** Sử dụng MUI v6/v5 (`@mui/material`, `@emotion/react`, `@emotion/styled`). Emotion tự sinh tiền tố class ngẫu nhiên, không bị Bootstrap ghi đè style và không làm vỡ các trang công khai.
- **Tải lười (Lazy-loading):** Route `/admin/*` và toàn bộ thành phần MUI được bọc trong `React.lazy()` và `Suspense`. Bundle của trang chủ và trang công khai hoàn toàn sạch bóng MUI.

### AD-3: Ghi đè triệt để mặc định của MUI theo chuẩn Anti-AI (Strict Custom Theme)
Để loại bỏ hoàn toàn nhận diện "giao diện Google Material Design" hay "AI template", tệp `src/theme/muiTheme.ts` bắt buộc cấu hình qua `createTheme` với các ràng buộc bất khả biến:
1. `shape.borderRadius`: Cố định `4px` (hoặc `2px`). Tuyệt đối cấm bo góc lớn `rounded-2xl` (16px) hay `rounded-3xl` (24px).
2. `shadows`: Thay thế toàn bộ 25 cấp độ đổ bóng bằng `'none'`. Phân cách các khối giao diện hoàn toàn bằng đường viền mỏng phẳng `1px solid var(--admin-border)`.
3. `components.MuiButtonBase.defaultProps.disableRipple`: Bắt buộc đặt `true` (tắt hiệu ứng sóng nước Material).
4. `components.MuiButton.defaultProps.disableElevation`: Bắt buộc đặt `true`.
5. `components.MuiButton.styleOverrides`: `textTransform: 'none'`, độ dày chữ `fontWeight: 500`. Cấm chữ in hoa toàn bộ (`UPPERCASE`).
6. `typography.fontFamily`: Kế thừa font của hệ thống (`"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
7. **Bảng màu trung tính tinh tế:** Nền trắng/xám ấm sạch, viền xám mỏng, màu nhấn (Accent) là đỏ gạch trầm (`#B3361C`) hoặc Slate đen sâu (`#18181B`). Không dùng màu xanh tím gradient.

### AD-4: Route Guard hai lớp bảo mật (`AdminRoute`)
- **Tách biệt Route:**
  - Tuyến đăng nhập: `/admin/login`
  - Tuyến quản trị: `/admin` (Dashboard với các Tab quản lý chuyên biệt)
- **Xác thực hai lớp (Two-tier Verification):**
  1. *Lớp 1 (Phiên Auth):* Kiểm tra `supabase.auth.getSession()`. Nếu không có phiên, lập tức chuyển hướng về `/admin/login` kèm `state: { from: location }`.
  2. *Lớp 2 (Quyền Admin):* Gọi RPC `supabase.rpc('is_admin')`. Hàm này chạy với cờ `SECURITY DEFINER` kiểm tra bảng `admin_users`.
     - Nếu `is_admin() === false`: Người dùng đã đăng nhập tài khoản vãng lai nhưng không có quyền quản trị. Hủy phiên đăng nhập, hiển thị thông báo lỗi bảo mật *"Tài khoản không có quyền truy cập khu vực quản trị"*, và giữ ở trang đăng nhập.
     - Nếu `is_admin() === true`: Cho phép hiển thị Dashboard.
- **Tránh hiện tượng nháy giao diện (No UI Flash):** Trong thời gian `authLoading` hoặc đang chờ RPC `is_admin`, hiển thị màn hình chờ trung tính tối giản (Neutral Centered Spinner/Skeleton). Tuyệt đối không điều hướng vội vàng sang trang login khi chưa hoàn tất kiểm tra phiên.

### AD-5: Bảo vệ toàn vẹn dữ liệu Storage và Cơ sở dữ liệu (Atomic Deletion Guard)
- Khi quản trị viên xóa một tài liệu có `storage_path` (tệp lưu trữ vật lý trên Supabase Storage):
  1. Tầng dịch vụ bắt buộc gọi `supabase.storage.from('document_files').remove([storage_path])` trước.
  2. Nếu xóa file Storage thất bại (lỗi mạng, lỗi quyền, file không tìm thấy): **TUYỆT ĐỐI KHÔNG ĐƯỢC XÓA BẢN GHI TRONG DATABASE**. Phải ném ngoại lệ và dừng thao tác ngay lập tức:
     `"Lỗi xóa tệp vật lý từ Storage. Thao tác đã dừng để tránh tạo dữ liệu mồ côi."`
  3. Chỉ khi Storage xác nhận xóa thành công (hoặc `storage_path` là `null` đối với link ngoài) thì mới thực hiện `delete from documents where id = ...`.

### AD-6: Khắc phục triệt để các lỗi kỹ thuật hiện hữu (Bug Fixes)
- **Lỗi `toISOString`:** Tại `Resources.tsx:188`, thay thế `new Date(doc.created_at).toISOString()` bằng hàm tiện ích an toàn `formatDateSafe(dateString)`. Nếu chuỗi ngày không hợp lệ hoặc rỗng, trả về ký tự gạch ngang `"—"`, không để sập giao diện người dùng.
- **Lỗi gộp ID dự án:** Tại `Portfolio.tsx:54`, xóa bỏ logic so sánh giả định `dbProject.id` là số (`p.id === dbProject.id?.toString()`). Trong schema mới, `projects.id` là kiểu `uuid`. Tầng dịch vụ sẽ trả dữ liệu chuẩn, DB là nguồn sự thật duy nhất.
- **Xóa bỏ hardcode SĐT/Email:** Tại `Home.tsx:152-158`, thay đổi giá trị hardcode bằng dữ liệu động từ `profile.phone` và `profile.email` được cung cấp bởi `profileService`.

---

## 3. DATA SCHEMAS & BẢNG ÁNH XẠ DỊCH VỤ

### 3.1 Khai báo kiểu TypeScript (Entities & DTOs)

Tạo tệp `src/types/database.ts` khớp chính xác 100% với schema `supabase/migrations/0001_schema.sql`:

```typescript
// src/types/database.ts

export type DocCategory = 
  | 'Đại cương'
  | 'Cơ sở khối ngành(IT)'
  | 'Cơ sở ngành(IT)'
  | 'Tự chọn(IT)';

export interface ProfileRecord {
  id: 1;
  name: string;
  university: string;
  roles: string[];
  bio: string;
  skills: string[];
  phone: string | null;
  email: string | null;
  social_links: {
    github?: string;
    facebook?: string;
    linkedin?: string;
    [key: string]: string | undefined;
  };
  updated_at: string;
}

export interface ProjectRecord {
  id: string; // uuid
  title: string;
  description: string;
  technologies: string[];
  project_type: string;
  github_link: string | null;
  demo_link: string | null;
  sort_order: number;
  created_at: string;
}

export interface DocumentRecord {
  id: string; // uuid
  title: string;
  category: DocCategory;
  format: string; // PDF, ZIP, DOCX, LINK...
  file_size: string | null; // e.g. "4.5 MB"
  url: string; // Check ~ '^https://'
  storage_path: string | null; // null nếu là link ngoài
  contributor_name: string | null;
  created_at: string;
}

export interface DocumentSubmissionRecord {
  id: string; // uuid
  title: string;
  category: DocCategory;
  description: string | null;
  link: string; // Check ~ '^https://\S+$'
  submitter_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null; // uuid
}

export interface GuestbookEntryRecord {
  id: string; // uuid
  author_name: string;
  message: string;
  rating: number | null; // 1 to 5
  project_id: string | null; // uuid
  is_approved: boolean;
  created_at: string;
}

export interface AdminUserRecord {
  user_id: string; // uuid
  created_at: string;
}
```

### 3.2 Bảng ánh xạ Hàm dịch vụ ↔ Bảng / RPC ↔ Component sử dụng

| Tệp Dịch vụ | Tên Hàm | Thao tác DB / Storage / RPC | Vai trò & Quyền | Component / Trang sử dụng |
|---|---|---|---|---|
| `authService.ts` | `login(email, pass)` | `supabase.auth.signInWithPassword` | Khách vãng lai | `src/pages/admin/AdminLogin.tsx` |
| `authService.ts` | `logout()` | `supabase.auth.signOut` | Admin | `src/pages/admin/AdminLayout.tsx` |
| `authService.ts` | `getSession()` | `supabase.auth.getSession` | Mọi vai trò | `src/components/admin/AdminRoute.tsx` |
| `authService.ts` | `verifyAdminStatus()` | RPC `public.is_admin()` | Authenticated | `src/components/admin/AdminRoute.tsx` |
| `profileService.ts` | `getProfile()` | `SELECT * FROM profile WHERE id = 1` | Public (anon, auth) | `Home.tsx`, `AdminProfileTab.tsx` |
| `profileService.ts` | `updateProfile(data)` | `UPDATE profile WHERE id = 1` | Admin (`is_admin`) | `AdminProfileTab.tsx` |
| `projectService.ts` | `getProjects()` | `SELECT * FROM projects ORDER BY sort_order, created_at` | Public (anon, auth) | `Portfolio.tsx`, `AdminProjectsTab.tsx` |
| `projectService.ts` | `createProject(dto)` | `INSERT INTO projects` | Admin (`is_admin`) | `AdminProjectsTab.tsx` |
| `projectService.ts` | `updateProject(id, dto)` | `UPDATE projects WHERE id = id` | Admin (`is_admin`) | `AdminProjectsTab.tsx` |
| `projectService.ts` | `deleteProject(id)` | `DELETE FROM projects WHERE id = id` | Admin (`is_admin`) | `AdminProjectsTab.tsx` |
| `projectService.ts` | `reorderProjects(items)` | Batch `UPDATE projects SET sort_order` | Admin (`is_admin`) | `AdminProjectsTab.tsx` |
| `documentService.ts` | `getDocuments()` | `SELECT * FROM documents ORDER BY created_at DESC` | Public (anon, auth) | `Resources.tsx`, `AdminDocumentsTab.tsx` |
| `documentService.ts` | `uploadDocumentFile(file)` | `storage.from('document_files').upload` | Admin (`is_admin`) | `AdminDocumentsTab.tsx` |
| `documentService.ts` | `createDocument(dto)` | `INSERT INTO documents` | Admin (`is_admin`) | `AdminDocumentsTab.tsx` |
| `documentService.ts` | `updateDocument(id, dto)` | `UPDATE documents WHERE id = id` | Admin (`is_admin`) | `AdminDocumentsTab.tsx` |
| `documentService.ts` | `deleteDocument(id, path)` | 1. Storage remove (nếu có path)<br>2. `DELETE FROM documents` | Admin (`is_admin`) | `AdminDocumentsTab.tsx` |
| `submissionService.ts`| `getSubmissions(status)` | `SELECT * FROM document_submissions` | Admin (`is_admin`) | `AdminSubmissionsTab.tsx` |
| `submissionService.ts`| `approveSubmission(id, note)`| RPC `public.approve_submission(p_id, p_notes)` | Admin (`is_admin`) | `AdminSubmissionsTab.tsx` |
| `submissionService.ts`| `rejectSubmission(id, note)` | RPC `public.reject_submission(p_id, p_notes)` | Admin (`is_admin`) | `AdminSubmissionsTab.tsx` |
| `guestbookService.ts` | `getGuestbookEntries(all)` | `SELECT * FROM guestbook_entries` | Public (`is_approved=true`) / Admin (All) | `AdminGuestbookTab.tsx`, `Home.tsx` |
| `guestbookService.ts` | `approveGuestbookEntry(id)` | `UPDATE guestbook_entries SET is_approved=true` | Admin (`is_admin`) | `AdminGuestbookTab.tsx` |
| `guestbookService.ts` | `hideGuestbookEntry(id)` | `UPDATE guestbook_entries SET is_approved=false` | Admin (`is_admin`) | `AdminGuestbookTab.tsx` |
| `guestbookService.ts` | `deleteGuestbookEntry(id)` | `DELETE FROM guestbook_entries WHERE id = id` | Admin (`is_admin`) | `AdminGuestbookTab.tsx` |

---

## 4. QUY TẮC VALIDATION VÀ DATA SCHEMA CHI TIẾT

Mọi trường thông tin trong form nhập liệu của Admin đều phải có kiểm tra hợp lệ tại Client trước khi gửi tới Supabase. Khi phát hiện vi phạm, hiển thị thông báo lỗi inline trực tiếp dưới ô nhập liệu (`helperText` màu đỏ của TextField trong MUI). Cấm tuyệt đối sử dụng `window.alert()` hoặc trình duyệt popup mặc định.

### Bảng ma trận Validation và Thông báo lỗi Inline

| Phân hệ | Tên trường | Kiểu dữ liệu | Điều kiện hợp lệ | Thông báo lỗi tiếng Việt cụ thể (Inline) |
|---|---|---|---|---|
| **Auth** | `email` | Chuỗi | Bắt buộc, đúng định dạng RFC 5322 | "Vui lòng nhập địa chỉ email hợp lệ (ví dụ: name@example.com)" |
| **Auth** | `password` | Chuỗi | Bắt buộc, độ dài ≥ 6 ký tự | "Mật khẩu quản trị phải có độ dài tối thiểu 6 ký tự" |
| **Profile** | `name` | Chuỗi | Bắt buộc, độ dài 2 – 100 ký tự | "Họ và tên không được để trống (từ 2 đến 100 ký tự)" |
| **Profile** | `university` | Chuỗi | Bắt buộc, độ dài 2 – 150 ký tự | "Tên trường đại học không được để trống" |
| **Profile** | `roles` | Chuỗi / Mảng | Bắt buộc ít nhất 1 vai trò | "Vui lòng nhập ít nhất một vai trò (phân tách bằng dấu phẩy)" |
| **Profile** | `bio` | Chuỗi | Bắt buộc, độ dài 10 – 1000 ký tự | "Tiểu sử giới thiệu phải từ 10 đến 1000 ký tự" |
| **Profile** | `skills` | Chuỗi / Mảng | Bắt buộc ít nhất 1 kỹ năng | "Vui lòng nhập danh sách kỹ năng chuyên môn" |
| **Profile** | `phone` | Chuỗi | Tùy chọn; nếu nhập: 10 – 11 chữ số | "Số điện thoại không hợp lệ (phải từ 10 đến 11 chữ số)" |
| **Profile** | `email` | Chuỗi | Tùy chọn; nếu nhập: đúng định dạng email | "Địa chỉ email liên hệ không hợp lệ" |
| **Projects**| `title` | Chuỗi | Bắt buộc, độ dài 1 – 200 ký tự | "Tiêu đề dự án không được để trống (tối đa 200 ký tự)" |
| **Projects**| `project_type` | Chọn/Chuỗi | Bắt buộc chọn hoặc nhập loại dự án | "Vui lòng chọn loại hình dự án" |
| **Projects**| `description`| Chuỗi | Bắt buộc, độ dài 10 – 2000 ký tự | "Mô tả dự án phải có độ dài tối thiểu 10 ký tự" |
| **Projects**| `technologies`| Chuỗi / Mảng | Bắt buộc ít nhất 1 công nghệ | "Nhập các công nghệ sử dụng, phân tách bằng dấu phẩy" |
| **Projects**| `github_link`| Chuỗi | Tùy chọn; nếu nhập: `^https://\S+$` | "Liên kết GitHub phải là URL hợp lệ và bắt đầu bằng https://" |
| **Projects**| `demo_link` | Chuỗi | Tùy chọn; nếu nhập: `^https://\S+$` | "Liên kết Demo phải là URL hợp lệ và bắt đầu bằng https://" |
| **Projects**| `sort_order` | Số nguyên | Số nguyên ≥ 0 | "Thứ tự sắp xếp phải là số nguyên không âm" |
| **Documents**|`title` | Chuỗi | Bắt buộc, độ dài 3 – 255 ký tự | "Tiêu đề tài liệu phải từ 3 đến 255 ký tự" |
| **Documents**|`category` | Enum | Thuộc 4 danh mục cố định | "Vui lòng chọn đúng danh mục học phần quy định" |
| **Documents**|`format` | Chuỗi | Bắt buộc, độ dài ≤ 10 ký tự (PDF, ZIP...)| "Định dạng tệp không được vượt quá 10 ký tự" |
| **Documents**|`file_size` | Chuỗi | Tùy chọn, tối đa 20 ký tự (ví dụ: 4.5 MB) | "Dung lượng tệp không hợp lệ" |
| **Documents**|`url` | Chuỗi | Bắt buộc, bắt đầu bằng `https://` | "Đường dẫn tải tài liệu bắt buộc phải bắt đầu bằng https://" |
| **Documents**|`file` (upload)| File vật lý | Tối đa 10 MB (10,485,760 bytes) | "Tệp tải lên vượt quá dung lượng tối đa cho phép (10 MB)" |
| **Submission**|`admin_notes`| Chuỗi | Tùy chọn; khi từ chối khuyến nghị nhập | "Ghi chú lý do từ chối không quá 500 ký tự" |

---

## 5. ĐẶC TẢ USER FLOWS CHI TIẾT

### Flow 1: Đăng nhập Quản trị viên (`/admin/login`)
1. **Khởi tạo:** Người dùng mở `/admin/login`. Nếu đã có phiên Admin hợp lệ trong máy khách, tự động chuyển hướng ngay tới `/admin`.
2. **Nhập liệu:** Quản trị viên điền Email và Password.
3. **Thao tác gửi:** Bấm nút "Đăng nhập".
   - Nút đăng nhập chuyển sang trạng thái Loading (hiển thị spinner nhỏ 16px, `disabled = true` để chống bấm đúp).
   - Gọi `authService.login(email, password)`.
4. **Xử lý kết quả:**
   - *Trường hợp sai thông tin:* Supabase Auth trả về lỗi. Hệ thống hiển thị Alert lỗi inline phía trên form: `"Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại."` (thông báo an toàn, không tiết lộ sự tồn tại của email).
   - *Trường hợp thành công Auth:* Lấy session, gọi tiếp `authService.verifyAdminStatus()`.
     - Nếu `is_admin() === false`: Người dùng không có trong bảng `admin_users`. Lập tức gọi `authService.logout()`. Hiển thị thông báo inline: `"Tài khoản không có đặc quyền quản trị. Truy cập bị từ chối."`
     - Nếu `is_admin() === true`: Điều hướng tới URL trong `location.state?.from` hoặc mặc định về `/admin`.

### Flow 2: Bảo vệ Tuyến đường (`AdminRoute`) & Session Hydration
1. Component `AdminRoute` bọc lấy các route con bên trong `/admin`.
2. Khi người dùng tải lại trang (F5) hoặc truy cập trực tiếp:
   - State `status` ban đầu là `'checking'`.
   - `AdminRoute` render màn hình chờ toàn trang sạch sẽ với thanh tiến trình mỏng hoặc Spinner trung tính.
   - Gọi `supabase.auth.getSession()`.
   - Nếu không có session → Chuyển hướng tới `/admin/login` kèm state location hiện tại.
   - Nếu có session → Gọi `supabase.rpc('is_admin')`.
     - Nếu trả về `false` hoặc lỗi → Chuyển hướng tới `/admin/login` kèm thông báo không có quyền.
     - Nếu trả về `true` → Cập nhật state `status = 'authorized'`, hiển thị `AdminLayout` và nội dung trang quản trị.
   - Đăng ký lắng nghe sự kiện `supabase.auth.onAuthStateChange`. Nếu sự kiện là `SIGNED_OUT`, tự động đẩy về trang login.

### Flow 3: Đăng xuất Quản trị viên
1. Quản trị viên bấm nút "Đăng xuất" trên thanh điều hướng của `AdminLayout`.
2. Hệ thống gọi `authService.logout()`.
3. Xóa sạch cache trong máy khách và chuyển hướng về `/admin/login`.

### Flow 4: Quản lý Hồ sơ cá nhân (F7 — Tab "Hồ sơ cá nhân")
1. **Tải dữ liệu:** Tự động gọi `profileService.getProfile()` khi mở tab.
   - Hiển thị Skeleton form trong lúc tải.
   - Nếu lỗi kết nối, hiển thị Banner thông báo lỗi kèm nút "Tải lại".
2. **Hiển thị Form:** Form gồm: Họ tên, Trường đại học, Các vai trò (chuỗi phân cách bằng dấu phẩy), Tiểu sử (Bio), Danh sách kỹ năng (phân cách bằng dấu phẩy), Số điện thoại, Email liên hệ, Liên kết GitHub, Liên kết Facebook, Liên kết LinkedIn.
3. **Chỉnh sửa & Kiểm tra:**
   - Tự động trim khoảng trắng thừa ở các đầu chuỗi.
   - Tách chuỗi vai trò và kỹ năng thành mảng `string[]`.
   - Kiểm tra định dạng SĐT, Email và URL mạng xã hội theo Bảng Validation.
4. **Lưu cập nhật:**
   - Bấm nút "Lưu thay đổi". Nút chuyển sang trạng thái `disabled` kèm icon loading.
   - Gọi `profileService.updateProfile(updatedData)`.
   - *Thành công:* Hiển thị Toast thông báo xanh `"Cập nhật thông tin hồ sơ thành công"`. Dữ liệu mới lập tức có hiệu lực trên trang công khai khi người xem tải lại trang.
   - *Thất bại:* Giữ nguyên toàn bộ nội dung trong form, hiển thị Alert đỏ báo lỗi chi tiết.

### Flow 5: Quản lý Dự án (F8 — Tab "Dự án")
1. **Danh sách dự án:** Hiển thị dưới dạng bảng (Table) hoặc danh sách thẻ phẳng có viền 1px:
   - Các cột: Thứ tự (`sort_order`), Tiêu đề, Phân loại (`project_type`), Công nghệ, Liên kết (GitHub/Demo), Ngày tạo, Thao tác.
   - Kèm nút "Thêm dự án mới".
2. **Thêm mới dự án:**
   - Bấm "Thêm dự án mới" → Mở Modal hộp thoại (MUI Dialog phẳng, viền 1px, không đổ bóng).
   - Nhập tiêu đề, mô tả, phân loại, danh sách công nghệ, URL GitHub, URL Demo, thứ tự hiển thị.
   - Validate form inline. Bấm "Tạo dự án" → Gọi `projectService.createProject()`.
   - Thành công: Đóng modal, tải lại danh sách, báo toast thành công.
3. **Chỉnh sửa dự án:**
   - Bấm nút "Sửa" trên từng dòng → Mở Modal nạp sẵn dữ liệu hiện tại của dự án.
   - Chỉnh sửa thông tin → Bấm "Lưu thay đổi" → Gọi `projectService.updateProject(id, data)`.
4. **Xóa dự án:**
   - Bấm nút "Xóa" → Mở Modal xác nhận nguy hiểm:
     *"Bạn có chắc chắn muốn xóa dự án '[Tên dự án]' không? Thao tác này không thể hoàn tác."*
   - Hai nút: "Hủy bỏ" (màu xám) và "Xác nhận xóa" (màu đỏ gạch/danger, disable khi đang xóa).
   - Gọi `projectService.deleteProject(id)`. Thành công: làm mới danh sách.

### Flow 6: Quản lý Tài liệu & Storage (F9 — Tab "Tài liệu")
1. **Danh sách tài liệu:** Hiển thị bảng tài liệu đã duyệt trên hệ thống:
   - Tiêu đề, Danh mục, Định dạng, Dung lượng, Loại lưu trữ (Tệp tải lên / Liên kết ngoài), Ngày tạo, Thao tác (Sửa / Xóa).
2. **Thêm tài liệu mới (Hỗ trợ 2 chế độ):**
   - Bấm "Thêm tài liệu" → Mở Modal.
   - Chọn loại nguồn:
     - **Chế độ A — Tải tệp lên (Upload File):** Chọn tệp từ máy tính (giới hạn ≤ 10 MB). Hệ thống tự trích xuất dung lượng (ví dụ: `4.2 MB`) và định dạng (ví dụ: `PDF`). Sau khi bấm Lưu, tệp được tải lên bucket `document_files` qua `documentService.uploadDocumentFile(file)`. Nhận về URL công khai và `storage_path`, sau đó mới lưu bản ghi vào bảng `documents`.
     - **Chế độ B — Nhập liên kết ngoài (External Link):** Nhập trực tiếp URL Google Drive/OneDrive (`https://...`), định dạng (PDF/ZIP...), dung lượng ước tính. Cột `storage_path` đặt là `null`.
   - Validate thông tin inline.
3. **Xóa tài liệu (Cực kỳ quan trọng — Atomic Storage Deletion):**
   - Quản trị viên bấm "Xóa" trên dòng tài liệu.
   - Hiển thị Modal xác nhận xóa.
   - Khi bấm xác nhận:
     ```typescript
     // Nguyên tắc bắt buộc trong documentService.deleteDocument:
     if (doc.storage_path) {
       const { error: storageErr } = await supabase.storage.from('document_files').remove([doc.storage_path]);
       if (storageErr) {
         throw new Error(`Không thể xóa tệp vật lý từ Storage (${storageErr.message}). Thao tác xóa tài liệu đã bị hủy.`);
       }
     }
     // Chỉ xóa trong bảng documents khi storage đã xóa thành công
     const { error: dbErr } = await supabase.from('documents').delete().eq('id', doc.id);
     if (dbErr) throw dbErr;
     ```
   - Nếu xóa file trên Storage thất bại, bản ghi trong DB được giữ nguyên 100%, hiển thị thông báo lỗi rõ ràng cho quản trị viên.

### Flow 7: Duyệt Đóng góp từ Người xem (F10 — Tab "Đóng góp chờ duyệt")
1. **Hiển thị hàng chờ:** Liệt kê các bản ghi trong `document_submissions` có trạng thái `pending` theo thứ tự mới nhất lên đầu.
   - Hiển thị huy hiệu (Badge) đếm số lượng đóng góp đang chờ trên thanh tiêu đề của Tab.
   - Mỗi mục hiển thị: Tiêu đề, Học phần, Người đóng góp, Ngày gửi, Mô tả, Đường dẫn liên kết.
2. **Kiểm tra an toàn:** Quản trị viên bấm vào liên kết để mở tab mới kiểm tra nội dung (thuộc tính `target="_blank" rel="noopener noreferrer"`).
3. **Phê duyệt (Approve):**
   - Bấm nút "Phê duyệt" → Mở popover/dialog xác nhận kèm ô ghi chú nội bộ (tùy chọn).
   - Gọi RPC `submissionService.approveSubmission(id, adminNotes)`.
   - RPC trong database sẽ tự động chèn 1 bản ghi mới vào bảng `documents` với định dạng `LINK`, đồng thời cập nhật trạng thái submission sang `approved`.
   - Bản ghi vừa duyệt lập tức xuất hiện trên trang `/resources` của người xem mà không cần build lại ứng dụng.
4. **Từ chối (Reject):**
   - Bấm nút "Từ chối" → Mở Modal yêu cầu nhập lý do từ chối vào `admin_notes` (ví dụ: "Liên kết hỏng", "Tài liệu trùng lặp").
   - Gọi RPC `submissionService.rejectSubmission(id, adminNotes)`.
   - Cập nhật trạng thái submission sang `rejected`.

### Flow 8: Kiểm duyệt Lời nhắn Guestbook (F11 — Tab "Lời nhắn")
1. **Danh sách lời nhắn:** Hiển thị toàn bộ các mục trong `guestbook_entries`.
   - Phân loại rõ ràng: "Chờ duyệt (`is_approved = false`)" và "Đã hiển thị (`is_approved = true`)".
   - Hiển thị: Tên tác giả, Đánh giá sao (1-5), Dự án gắn kèm (nếu có), Nội dung lời nhắn (render dạng thuần text, cấm HTML), Thời gian gửi.
2. **Thao tác duyệt:** Bấm "Phê duyệt" → Gọi `guestbookService.approveGuestbookEntry(id)` → `is_approved` chuyển thành `true`, xuất hiện công khai trên trang web.
3. **Thao tác ẩn:** Đối với lời nhắn đã duyệt, có nút "Ẩn" → Gọi `guestbookService.hideGuestbookEntry(id)` → Chuyển `is_approved = false`.
4. **Thao tác xóa vĩnh viễn:** Có nút "Xóa" kèm dialog xác nhận xóa hẳn bản ghi rác/spam.

---

## 6. QUY ĐỊNH 6 TRẠNG THÁI GIAO DIỆN BẮT BUỘC (UI STATES MATRIX)

Mọi khối hiển thị dữ liệu hoặc thành phần tương tác trong khu vực Admin đều phải hiện thực đủ 6 trạng thái kỹ thuật sau:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   VÒNG ĐỜI TRẠNG THÁI GIAO DIỆN CHUẨN                   │
│                                                                        │
│   [ 1. DEFAULT ] ─────────(Hover chuột)─────────► [ 2. HOVER ]         │
│          │                                              │              │
│     (Nhấp phím Tab/Focus)                          (Click chuột)       │
│          ▼                                              ▼              │
│   [ 3. FOCUS ]                                   [ 4. LOADING ]        │
│          │                                              │              │
│     (Validate sai)                              (Phản hồi từ Server)   │
│          ▼                                              ▼              │
│   [ 5. VALIDATION ERROR ]                        [ 6. SUCCESS ]        │
└────────────────────────────────────────────────────────────────────────┘
```

1. **Default (Mặc định):** Màu sắc trung tính sạch, viền phẳng mỏng `1px solid var(--border-neutral)`, nền trắng hoặc nền tối tương ứng.
2. **Hover (Rê chuột):** Đổi màu viền đậm hơn hoặc nền đổi nhẹ 3-5%. **Cấm tuyệt đối:** Không nảy nút (transform translateY), không phóng to, không phát sáng neon.
3. **Focus (Tiêu điểm):** Viền nét mỏng 1px hoặc outline 2px màu Accent không bị nhòe (`outline: 2px solid var(--accent); outline-offset: 1px`). Dễ dàng điều hướng 100% bằng bàn phím.
4. **Loading (Đang tải / Đang gửi):**
   - Với khối dữ liệu bảng/danh sách: Hiển thị Skeleton đúng số hàng/cột tương đương, không gây co giật bố cục (layout shift).
   - Với nút bấm thao tác (Submit/Delete): Thêm spinner nhỏ (16px), chuyển nhãn thành "Đang xử lý...", vô hiệu hóa nút (`disabled = true`, `cursor: not-allowed`) để chống bấm đúp.
5. **Validation Error (Lỗi hợp lệ):** Viền đỏ nhẹ, văn bản trợ giúp inline màu đỏ (`#DC2626`) xuất hiện ngay bên dưới ô nhập. Không dùng popup trình duyệt.
6. **Success (Thành công):** Thông báo Toast mỏng hoặc Alert nhẹ nhàng xuất hiện ở góc màn hình, tự động ẩn sau 3.5 giây kèm thông điệp rõ ràng.

---

## 7. TIÊU CHUẨN THIẾT KẾ ANTI-AI CHO KHU ADMIN

Khu vực Admin được thiết kế theo phong cách các sản phẩm kỹ thuật hàng đầu thế giới (**Linear, Stripe, Vercel**), đặt tính hiệu năng, công năng và sự tinh gọn lên hàng đầu.

### 7.1 Hệ thống Token màu sắc (Design Tokens)

Tạo tệp `src/theme/tokens.ts`:
```typescript
// src/theme/tokens.ts

export const tokens = {
  light: {
    bg: '#F8F9FA',            // Nền trang tổng thể (trắng xám sạch)
    surface: '#FFFFFF',       // Nền bảng, thẻ, dialog
    surfaceSubtle: '#F1F3F5', // Nền header bảng, ô input read-only
    ink: '#18181B',           // Màu chữ chính (Charcoal sâu, không dùng #000)
    inkMuted: '#71717A',      // Màu chữ phụ, nhãn nhỏ
    border: '#E4E4E7',        // Đường kẻ viền 1px
    borderHover: '#A1A1AA',   // Viền khi hover
    accent: '#B3361C',        // Màu đỏ gạch đặc trưng của dự án (TLU vibe)
    accentHover: '#962D17',
    danger: '#DC2626',        // Đỏ ngữ nghĩa cho thao tác Xóa
    success: '#16A34A',       // Xanh lá ngữ nghĩa cho trạng thái Đã duyệt
    warning: '#D97706',       // Vàng cam cho trạng thái Chờ duyệt
  },
  dark: {
    bg: '#09090B',            // Nền tối gần đen ngả ấm
    surface: '#121215',       // Nền hộp, bảng
    surfaceSubtle: '#1C1C20',
    ink: '#F4F4F5',           // Chữ trắng ngà
    inkMuted: '#A1A1AA',
    border: '#27272A',
    borderHover: '#3F3F46',
    accent: '#D94B2E',
    accentHover: '#B3361C',
    danger: '#EF4444',
    success: '#22C55E',
    warning: '#F59E0B',
  }
};
```

### 7.2 Cấu hình Theme MUI (`src/theme/muiTheme.ts`)
```typescript
// src/theme/muiTheme.ts
import { createTheme } from '@mui/material/styles';
import { tokens } from './tokens';

export const getAdminTheme = (mode: 'light' | 'dark' = 'light') => {
  const t = tokens[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: t.accent,
        contrastText: '#FFFFFF',
      },
      error: {
        main: t.danger,
      },
      background: {
        default: t.bg,
        paper: t.surface,
      },
      text: {
        primary: t.ink,
        secondary: t.inkMuted,
      },
      divider: t.border,
    },
    shape: {
      borderRadius: 4, // Anti-AI: Cố định 4px, cấm bo góc lớn
    },
    shadows: Array(25).fill('none') as any, // Anti-AI: Xóa sạch bóng đổ
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      button: {
        textTransform: 'none', // Cấm chữ hoa toàn bộ
        fontWeight: 500,
      },
    },
    components: {
      MuiButtonBase: {
        defaultProps: {
          disableRipple: true, // Tắt sóng nước Material Design
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 4,
            padding: '6px 14px',
            fontSize: '0.875rem',
            transition: 'background-color 150ms ease, border-color 150ms ease',
          },
          outlined: {
            borderColor: t.border,
            color: t.ink,
            '&:hover': {
              borderColor: t.borderHover,
              backgroundColor: t.surfaceSubtle,
            },
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            backgroundColor: t.surface,
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: t.border,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: t.borderHover,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: t.accent,
              borderWidth: 1,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${t.border}`,
            backgroundImage: 'none',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: t.surfaceSubtle,
            '& .MuiTableCell-root': {
              fontWeight: 600,
              fontSize: '0.75rem',
              color: t.inkMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              borderBottom: `1px solid ${t.border}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${t.border}`,
            padding: '10px 16px',
            fontSize: '0.875rem',
          },
        },
      },
    },
  });
};
```

### 7.3 Danh mục cấm tuyệt đối (Strict Anti-AI Rules)
1. **CẤM GRADIENT:** Cấm hoàn toàn gradient tím hồng xanh (`linear-gradient(#6366f1, #a855f7)`) trên tiêu đề, nút bấm hay hình nền. Chỉ dùng màu phẳng (Flat solid colors).
2. **CẤM EMOJI TRONG UI:** Không đặt các emoji rác (🚀, ✨, 🔥, ⚡, 💡) trong tiêu đề trang, nhãn nút, bảng hay thông báo hệ thống. Biểu tượng phải là SVG đơn sắc từ thư viện `react-icons` (FiLock, FiLogOut, FiFolder, FiCheck, FiX, FiTrash2...).
3. **CẤM BO GÓC TRÒN QUÁ ĐÀ:** Cấm `rounded-3xl`, `rounded-full` (ngoại trừ ảnh đại diện hình tròn). Toàn bộ controls có `border-radius: 4px`.
4. **CẤM THẺ ĐỔ BÓNG NỔI (NO DROP SHADOW CARDS):** Tách biệt các thành phần bằng `1px border`.
5. **CẤM POPUP ALERT:** Cấm gọi `window.alert()`, `window.confirm()`. Dùng MUI Dialog với đầy đủ tiêu đề, mô tả và nút xác nhận rõ ràng.

---

## 8. KIẾN TRÚC FILE VÀ THƯ MỤC CẦN TẠO / SỬA

Tuân thủ nghiêm ngặt cấu trúc thư mục quy định tại `docs/01-ARCHITECTURE.md` mục 4:

```
src/
├── types/
│   ├── database.ts                  # [MỚI] Schema types Supabase 100% khớp migration
│   └── service.ts                   # [MỚI] Generic ServiceResponse & MutationResponse
├── lib/
│   └── supabaseClient.ts            # [SỬA] Đảm bảo export client đã typed
├── services/
│   ├── index.ts                     # [MỚI] Barrel export cho toàn bộ services
│   ├── authService.ts               # [MỚI] Đăng nhập, đăng xuất, kiểm tra quyền admin
│   ├── profileService.ts            # [MỚI] Đọc/sửa hồ sơ cá nhân + fallback
│   ├── projectService.ts            # [MỚI] CRUD dự án + fallback
│   ├── documentService.ts           # [MỚI] CRUD tài liệu, upload/xóa Storage + fallback
│   ├── submissionService.ts         # [MỚI] Lấy danh sách, duyệt/từ chối qua RPC
│   └── guestbookService.ts          # [MỚI] Quản lý lời nhắn, duyệt/ẩn/xóa
├── utils/
│   └── dateUtils.ts                 # [MỚI] formatDateSafe() phòng chống crash toISOString
├── theme/
│   ├── tokens.ts                    # [MỚI] Token màu phẳng trung tính (light/dark)
│   └── muiTheme.ts                  # [MỚI] createTheme ghi đè triệt để mặc định MUI
├── components/
│   └── admin/
│       ├── AdminRoute.tsx           # [MỚI] Route Guard 2 lớp bảo mật (Auth + RPC)
│       ├── AdminLayout.tsx          # [MỚI] Khung giao diện Admin (Header, Tabs, Logout)
│       ├── ConfirmDialog.tsx        # [MỚI] Modal xác nhận xóa chuẩn Anti-AI (thay window.confirm)
│       └── StatusBadge.tsx          # [MỚI] Huy hiệu trạng thái tối giản (Pending, Approved...)
├── pages/
│   ├── admin/
│   │   ├── AdminLogin.tsx           # [MỚI] Trang đăng nhập quản trị viên tối giản
│   │   ├── AdminDashboard.tsx       # [MỚI] Dashboard chứa 5 tab nghiệp vụ
│   │   ├── tabs/
│   │   │   ├── ProfileTab.tsx       # [MỚI] Phân hệ F7: Sửa thông tin hồ sơ
│   │   │   ├── ProjectsTab.tsx      # [MỚI] Phân hệ F8: Quản lý dự án (CRUD)
│   │   │   ├── DocumentsTab.tsx     # [MỚI] Phân hệ F9: Quản lý tài liệu & Storage
│   │   │   ├── SubmissionsTab.tsx   # [MỚI] Phân hệ F10: Hàng chờ duyệt đóng góp
│   │   │   └── GuestbookTab.tsx     # [MỚI] Phân hệ F11: Quản lý lời nhắn
│   │   └── index.ts                 # [MỚI] Export lười (lazy load)
│   ├── Admin.tsx                    # [XÓA/REPLACE] Tệp cũ 800 dòng bị thay thế hoàn toàn
│   ├── Home.tsx                     # [SỬA] Chuyển sang profileService, xóa SĐT/email hardcode
│   ├── Portfolio.tsx                # [SỬA] Chuyển sang projectService, sửa lỗi gộp ID/link
│   └── Resources.tsx                # [SỬA] Chuyển sang documentService, sửa lỗi url, sửa toISOString
└── App.tsx                          # [SỬA] Cấu hình định tuyến mới: /admin/login và /admin (lazy)
```

---

## 9. CHIẾN LƯỢC KIỂM THỬ VÀ TEST MATRIX (DÀNH CHO `AUTO-TESTER`)

### 9.1 Thiết lập Môi trường Test
Dự án hiện chưa có thư viện test. Subagent `senior-dev` cần cài đặt các gói sau vào `devDependencies`:
- `vitest`: Khung kiểm thử tốc độ cao tương thích Vite.
- `@testing-library/react` & `@testing-library/jest-dom`: Kiểm thử component và DOM.
- `jsdom`: Môi trường DOM giả lập cho Vitest.
Cấu hình thêm script trong `package.json`: `"test": "vitest run"`.

### 9.2 Chiến lược Mock Supabase Client
Tất cả các Unit Test và Component Test đều phải chạy độc lập mà không cần kết nối mạng thật đến Supabase. Tạo tệp hỗ trợ mock `src/test/mockSupabase.ts`:
```typescript
import { vi } from 'vitest';

export const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    single: vi.fn(),
  })),
  rpc: vi.fn(),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      remove: vi.fn(),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.storage/file.pdf' } })),
    })),
  },
};
```

### 9.3 Ma trận Test Cases chi tiết (Test Matrix)

| Nhóm Kiểm thử | Tên Test Case | Mục tiêu & Điều kiện kiểm tra | Kết quả kỳ vọng |
|---|---|---|---|
| **Unit: Utils** | `formatDateSafe_valid` | Truyền chuỗi `'2026-07-15T00:00:00Z'` | Trả về `'2026-07-15'` |
| **Unit: Utils** | `formatDateSafe_invalid`| Truyền chuỗi lỗi `'invalid-date-string'` | Trả về `'—'`, không ném lỗi `RangeError` |
| **Unit: Utils** | `formatDateSafe_null` | Truyền `null` hoặc `undefined` | Trả về `'—'` |
| **Unit: Service**| `auth_login_success` | Gọi `login()` với thông tin hợp lệ | Trả về session và không có error |
| **Unit: Service**| `auth_login_fail` | Gọi `login()` khi Supabase Auth báo lỗi | Trả về thông báo lỗi thân thiện |
| **Unit: Service**| `auth_isAdmin_true` | Mock `rpc('is_admin')` trả về `{ data: true }` | `verifyAdminStatus()` trả về `true` |
| **Unit: Service**| `auth_isAdmin_false`| Mock `rpc('is_admin')` trả về `{ data: false }`| `verifyAdminStatus()` trả về `false` |
| **Unit: Service**| `profile_get_db_success`| DB có dòng profile `id = 1` | Trả về dữ liệu từ DB, `source: 'db'` |
| **Unit: Service**| `profile_get_fallback` | DB bị lỗi hoặc rỗng | Trả về `mockProfile` từ `profile.ts`, `source: 'fallback'` |
| **Unit: Service**| `project_get_fallback` | DB rỗng | Trả về `mockProjects`, `source: 'fallback'` |
| **Unit: Service**| `doc_delete_storage_fail`| Storage xóa lỗi (`storageErr` tồn tại) | Ném lỗi, **KHÔNG** gọi `supabase.from('documents').delete()` |
| **Unit: Service**| `doc_delete_success` | Storage xóa thành công | Tiếp tục gọi DB delete thành công |
| **Unit: Service**| `submission_approve_rpc`| Gọi `approveSubmission(id, note)` | Gọi đúng `rpc('approve_submission', { p_id, p_notes })` |
| **Integration** | `AdminRoute_unauthenticated`| Không có phiên đăng nhập (`session = null`) | Chuyển hướng sang `/admin/login` |
| **Integration** | `AdminRoute_not_admin` | Có session nhưng `is_admin()` trả về `false` | Đăng xuất và giữ ở trang login, hiện lỗi |
| **Integration** | `AdminRoute_authorized` | Có session và `is_admin() === true` | Render đầy đủ Dashboard |
| **Integration** | `LoginForm_validation` | Bỏ trống email hoặc mật khẩu bấm Đăng nhập | Hiện lỗi inline, không gọi API |
| **Integration** | `LoginForm_loading_debounce`| Bấm Đăng nhập khi đang gửi | Nút bị disabled, không thể bấm đúp |
| **Integration** | `Document_Upload_Limit`| Chọn file kích thước 12 MB | Báo lỗi inline vượt quá 10 MB, chặn upload |
| **Integration** | `ConfirmDialog_interact`| Bấm nút Xóa trên danh sách | Mở Modal xác nhận, bấm Hủy thì đóng modal |

---

## 10. TIÊU CHÍ NGHIỆM THU CHI TIẾT (ACCEPTANCE CRITERIA)

Một bản triển khai chỉ được coi là đạt yêu cầu (PASSED) khi thỏa mãn 100% các tiêu chí sau:

- [ ] **AC-1 (Bảo mật Đăng nhập):** Truy cập `/admin` khi chưa đăng nhập sẽ lập tức bị chặn và chuyển về `/admin/login`. Đăng nhập bằng tài khoản không có trong `admin_users` sẽ bị từ chối truy cập. Tải lại trang (F5) khi đã đăng nhập không làm nháy trang login.
- [ ] **AC-2 (Toàn vẹn Tầng dịch vụ):** Không còn bất kỳ lệnh `supabase.from()` nào nằm trong các tệp `src/pages/` hoặc `src/components/`. Mọi tương tác mạng đều đi qua `src/services/`.
- [ ] **AC-3 (Cơ chế Dự phòng):** Khi cố tình làm sai URL Supabase hoặc ngắt mạng, các trang công khai (`/`, `/portfolio`, `/resources`) vẫn hiển thị đầy đủ dữ liệu mẫu từ `src/data/*.ts` kèm thông báo trạng thái dự phòng nhẹ nhàng.
- [ ] **AC-4 (Khắc phục lỗi trang công khai):** 
  - Tại `Home.tsx`: Đổi số điện thoại/email trong Admin Profile thì trang chủ đổi ngay sau khi tải lại, không còn giá trị hardcode.
  - Tại `Portfolio.tsx`: Dự án hiển thị đúng link GitHub từ Supabase, không bị logic gộp ID cũ ghi đè.
  - Tại `Resources.tsx`: Tài liệu có ngày tạo rỗng hoặc sai không làm sập ứng dụng (không ném lỗi `RangeError: Invalid time value`). Bấm tải tài liệu mở đúng cột `url`.
- [ ] **AC-5 (An toàn Storage khi Xóa):** Thử nghiệm xóa tài liệu có tệp Storage: nếu mô phỏng Storage xóa thất bại, bản ghi trong cơ sở dữ liệu phải được giữ nguyên vẹn.
- [ ] **AC-6 (Duyệt Đóng góp):** Quản trị viên duyệt một bản ghi đóng góp ở Tab Submissions → Dữ liệu lập tức xuất hiện trong bảng tài liệu công khai tại `/resources` mà không cần build lại dự án.
- [ ] **AC-7 (Chuẩn Anti-AI):** Toàn bộ giao diện Admin không chứa bất kỳ gradient neon nào, không có emoji rác trong nút bấm/tiêu đề, bo góc nút và ô nhập không vượt quá 4px, không có bóng đổ thẻ, không sử dụng `window.alert`/`window.confirm`.
- [ ] **AC-8 (Code-Splitting):** Khi kiểm tra `npm run build`, các chunk của MUI chỉ xuất hiện trong gói chunk của Admin, không làm tăng kích thước bundle của trang chủ.
- [ ] **AC-9 (Kiểm thử tự động):** Toàn bộ test suite do `auto-tester` xây dựng theo Test Matrix chạy qua lệnh `npm run test` đạt kết quả `100% PASSED`.
