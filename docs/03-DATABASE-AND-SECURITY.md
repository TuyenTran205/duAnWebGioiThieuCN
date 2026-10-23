# 03 — Cơ sở dữ liệu và bảo mật (project Supabase mới, tạo từ đầu)

Bản này thay bản trước. Lý do: project cũ đang **paused** (ảnh chụp dashboard của chủ dự án, 2026-10-20) và chủ dự án chọn **tạo project mới**, nên không còn phải tương thích với schema của code cũ.

## 0. Thứ tự làm việc

| Bước | Việc | Ghi chú |
|---|---|---|
| 0.1 | **Tải bản sao lưu project cũ** (nút "Download backups" trên trang project đang paused: database và storage objects) | Dashboard ghi dữ liệu còn nguyên và có thể resume đến **21/11/2027**, nên không gấp. Nhưng schema mới tạo từ đầu, nên tài liệu đã upload ở project cũ sẽ **không** tự sang. Chưa biết trong DB cũ có gì đáng giữ, hãy xem qua bản sao lưu |
| 0.2 | Tạo project mới | Chọn vùng gần Việt Nam (Singapore) [LẬP LUẬN: giảm độ trễ]. Đặt mật khẩu DB mạnh, lưu vào trình quản lý mật khẩu; ứng dụng không dùng mật khẩu này |
| 0.3 | Chạy SQL mục 2 → 5 trong SQL Editor, đúng thứ tự | Và lưu từng khối thành tệp trong `supabase/migrations/` (xem `01` mục 3.7) |
| 0.4 | Tắt đăng ký công khai; tạo tài khoản admin; thêm vào `admin_users` (mục 6) | |
| 0.5 | Cập nhật `.env` cục bộ và biến môi trường trên Vercel (mục 7) | |
| 0.6 | Chạy bộ kiểm thử mục 9 | Chỉ khi đạt mới viết code giao diện |
| 0.7 | Giữ nguyên project cũ cho tới khi mọi thứ ở project mới chạy ổn | Không xóa vội |

Gói miễn phí có giới hạn số project đang hoạt động [CẦN XÁC NHẬN]. Nếu dashboard từ chối tạo project mới vì giới hạn này, hãy sao lưu rồi xóa project cũ (thao tác không hoàn tác được, chỉ làm sau khi chắc chắn đã có bản sao lưu).

## 1. Nguyên tắc

| Nguyên tắc | Cách thực thi |
|---|---|
| Khóa `publishable` là công khai, ai cũng lấy được từ bundle | Coi mọi thao tác của `anon` là không tin cậy; quyền nằm ở lớp quyền bảng + RLS + RPC |
| Từ chối mặc định, hai lớp | Thu hồi sạch quyền bảng rồi chỉ cấp lại những gì cần (mục 4); bật RLS trên mọi bảng (mục 5). Lớp nào sót thì lớp kia vẫn chặn |
| Admin là danh sách rõ ràng, không phải "ai đăng nhập cũng được" | Bảng `admin_users` + hàm `is_admin()` |
| Viewer chỉ ghi qua cổng có kiểm soát | `anon` **không có quyền INSERT** trên bất kỳ bảng nào; chỉ gọi được hai hàm RPC |
| Kiểm tra ở tầng dữ liệu | `CHECK`, `NOT NULL`, kiểm tra trong RPC; không tin kiểm tra ở trình duyệt |

## 2. Bảng

Chạy khối này đầu tiên. Đây là project mới và trống nên không cần kiểm tra schema cũ.

```sql
-- supabase/migrations/0001_schema.sql

create domain public.doc_category as text
  check (value in ('Đại cương','Cơ sở khối ngành(IT)','Cơ sở ngành(IT)','Tự chọn(IT)'));

-- Hồ sơ: đúng 1 dòng (id luôn = 1). Thay phần SĐT/email đang hardcode ở Home.tsx.
create table public.profile (
  id int primary key default 1 check (id = 1),
  name text not null,
  university text not null,
  roles text[] not null default '{}',
  bio text not null,
  skills text[] not null default '{}',
  phone text,
  email text,
  social_links jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text not null,
  technologies text[] not null default '{}',
  project_type text not null,
  github_link text check (github_link is null or github_link ~ '^https://'),
  demo_link text check (demo_link is null or demo_link ~ '^https://'),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Tài liệu đã công khai (do admin thêm hoặc đã được duyệt).
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 255),
  category public.doc_category not null,
  format text not null check (char_length(format) <= 10),
  file_size text,
  url text not null check (url ~ '^https://'),
  storage_path text,                 -- null nếu là liên kết ngoài; dùng để xóa file khi xóa tài liệu
  contributor_name text,
  created_at timestamptz not null default now()
);

-- Hàng chờ đóng góp của người xem (chỉ nộp liên kết, không upload tệp).
create table public.document_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 255),
  category public.doc_category not null,
  description text check (description is null or char_length(description) <= 1000),
  link text not null check (link ~ '^https://\S+$' and char_length(link) <= 500),
  submitter_name text check (submitter_name is null or char_length(submitter_name) <= 100),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);
create index on public.document_submissions (status, created_at desc);

create table public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(author_name) between 2 and 100),
  message text not null check (char_length(message) between 5 and 1000),
  rating int check (rating between 1 and 5),
  project_id uuid references public.projects(id) on delete set null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
```

So với bản trước, đã **bỏ**: bảng `submission_throttle`, hàm `client_hash`, `check_rate_limit`, `purge_throttle`, cột `client_hash`, `slug`, `is_featured`, `download_count`, và toàn bộ việc xử lý tên cột link không đồng nhất (`downloadurl`...). Cột link tài liệu giờ chỉ có một tên: `url`.

Cột `github_link`/`demo_link`/`url` bắt buộc bắt đầu `https://`. Giá trị placeholder `#` trong `src/data/projects.ts` sẽ không nhập được; dự án chưa có link thì để `null`.

## 3. Hàm

```sql
-- supabase/migrations/0002_functions.sql

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

-- Cổng nộp tài liệu cho người xem. Giới hạn toàn cục, không phụ thuộc IP (xem mục 8).
create or replace function public.submit_document(
  p_title text, p_category text, p_description text,
  p_link text, p_name text, p_honeypot text default ''
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if coalesce(p_honeypot, '') <> '' then raise exception 'rejected'; end if;
  if (select count(*) from public.document_submissions
       where created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited';
  end if;
  insert into public.document_submissions (title, category, description, link, submitter_name)
  values (p_title, p_category, nullif(p_description, ''), p_link, nullif(p_name, ''))
  returning id into v_id;     -- các CHECK của bảng từ chối dữ liệu sai
  return v_id;
end;
$$;

create or replace function public.submit_guestbook(
  p_name text, p_message text, p_rating int, p_project_id uuid default null,
  p_honeypot text default ''
) returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare v_id uuid;
begin
  if coalesce(p_honeypot, '') <> '' then raise exception 'rejected'; end if;
  if (select count(*) from public.guestbook_entries
       where is_approved = false and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited';
  end if;
  insert into public.guestbook_entries (author_name, message, rating, project_id)
  values (p_name, p_message, p_rating, p_project_id)
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.approve_submission(p_id uuid, p_notes text default null)
returns uuid
language plpgsql security definer
set search_path = ''
as $$
declare s public.document_submissions; v_doc uuid;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select * into s from public.document_submissions
   where id = p_id and status = 'pending' for update;
  if not found then raise exception 'not_pending'; end if;

  insert into public.documents (title, category, format, file_size, url, contributor_name)
  values (s.title, s.category, 'LINK', null, s.link, coalesce(s.submitter_name, 'Cộng đồng'))
  returning id into v_doc;

  update public.document_submissions
     set status = 'approved', reviewed_at = now(), reviewed_by = auth.uid(), admin_notes = p_notes
   where id = p_id;
  return v_doc;
end;
$$;

create or replace function public.reject_submission(p_id uuid, p_notes text default null)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.document_submissions
     set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), admin_notes = p_notes
   where id = p_id and status = 'pending';
  if not found then raise exception 'not_pending'; end if;
end;
$$;
```

`approve_submission` và `reject_submission` tự kiểm tra `is_admin()` bên trong dù đã giới hạn quyền thực thi: phòng thủ hai lớp, vì `authenticated` bao gồm cả tài khoản không phải admin.

## 4. Quyền (lớp thứ nhất)

```sql
-- supabase/migrations/0003_grants.sql
-- Chỉ chạy trên project MỚI/TRỐNG: lệnh đầu thu hồi toàn bộ quyền bảng mặc định.

revoke all on all tables in schema public from anon, authenticated;

grant select on public.profile, public.projects, public.documents, public.guestbook_entries
  to anon, authenticated;
grant insert, update, delete on public.profile, public.projects, public.documents, public.guestbook_entries
  to authenticated;
grant select, update, delete on public.document_submissions to authenticated;
-- admin_users: không cấp cho ai. anon không có quyền gì trên document_submissions.

revoke all on function public.is_admin()                       from public, anon;
revoke all on function public.approve_submission(uuid, text)   from public, anon;
revoke all on function public.reject_submission(uuid, text)    from public, anon;
revoke all on function public.submit_document(text,text,text,text,text,text) from public;
revoke all on function public.submit_guestbook(text,text,int,uuid,text)      from public;

grant execute on function public.is_admin()                     to authenticated;
grant execute on function public.approve_submission(uuid, text) to authenticated;
grant execute on function public.reject_submission(uuid, text)  to authenticated;
grant execute on function public.submit_document(text,text,text,text,text,text) to anon, authenticated;
grant execute on function public.submit_guestbook(text,text,int,uuid,text)      to anon, authenticated;
```

Cấp quyền tường minh như trên đúng cả khi Supabase đã thay đổi mặc định cấp quyền cho bảng mới [CẦN XÁC NHẬN chính sách mặc định hiện tại]. Nếu sau này thêm bảng, phải cấp quyền thủ công cho bảng đó.

## 5. RLS (lớp thứ hai) và Storage

```sql
-- supabase/migrations/0004_rls.sql

alter table public.profile              enable row level security;
alter table public.projects             enable row level security;
alter table public.documents            enable row level security;
alter table public.document_submissions enable row level security;
alter table public.guestbook_entries    enable row level security;
alter table public.admin_users          enable row level security;
-- admin_users và document_submissions: anon không có policy nào => không đọc, không ghi.

-- Đọc công khai
create policy "public read" on public.profile   for select using (true);
create policy "public read" on public.projects  for select using (true);
create policy "public read" on public.documents for select using (true);
create policy "public read approved" on public.guestbook_entries
  for select using (is_approved = true);

-- Admin: toàn quyền
create policy "admin all" on public.profile   for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.projects  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.documents for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.guestbook_entries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "admin all" on public.document_submissions for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Storage: bucket công khai (đọc qua URL công khai), chỉ admin ghi
insert into storage.buckets (id, name, public, file_size_limit)
values ('document_files', 'document_files', true, 10485760)   -- 10 MB
on conflict (id) do nothing;

create policy "admin storage select" on storage.objects for select to authenticated
  using (bucket_id = 'document_files' and public.is_admin());
create policy "admin storage insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'document_files' and public.is_admin());
create policy "admin storage update" on storage.objects for update to authenticated
  using (bucket_id = 'document_files' and public.is_admin());
create policy "admin storage delete" on storage.objects for delete to authenticated
  using (bucket_id = 'document_files' and public.is_admin());
```

[CẦN XÁC NHẬN] cấu trúc bảng `storage.buckets` (các cột `public`, `file_size_limit`). Nếu lệnh `insert` lỗi, tạo bucket bằng giao diện Storage rồi chỉ chạy các `create policy` phía dưới.

**Vì sao viewer không upload tệp**: RPC không chặn được việc tải thẳng lên Storage, nên mở upload ẩn danh là mở đường làm đầy dung lượng miễn phí bằng tệp rác. Viewer chỉ nộp **liên kết** (Google Drive...). Mở upload là một tính năng riêng, cần gia cố riêng, không có trong bản đầu.

`profile` chứa SĐT/email sẽ đọc được công khai. Không đổi so với hiện nay (đang in sẵn ở `Home.tsx:152-158`), nhưng nếu muốn hạn chế thu thập tự động, chỉ hiển thị email kèm biểu mẫu liên hệ.

## 6. Admin và dữ liệu khởi tạo

1. Authentication → Users → Add user (email + mật khẩu mạnh, tự xác nhận email).
2. **Tắt đăng ký công khai**: Authentication → Sign In / Providers → tắt "Allow new users to sign up". [CẦN XÁC NHẬN tên mục trong giao diện hiện tại]
3. Chạy (thay email):

```sql
-- supabase/migrations/0005_seed.sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'EMAIL_ADMIN_CUA_BAN';

insert into public.profile (id, name, university, roles, bio, skills, phone, email, social_links)
values (
  1, 'Trần Văn Tuyên', 'Thuy Loi University (TLU)',
  array['IT Student','Aspiring Business Analyst','Machine Learning Enthusiast'],
  'A passionate IT student at Thuy Loi University, focused on software development, business analysis, and machine learning solutions.',
  array['Java','C++','PHP','Flutter','Firebase','Cloudflare Workers AI','React','TypeScript'],
  '0376354782', 'tranvantuyen2110.work@gmail.com',
  '{"github":"https://github.com/TuyenTran205","facebook":"https://web.facebook.com/t.v.tuyen21"}'::jsonb
);

insert into public.projects (title, description, technologies, project_type, github_link, sort_order) values
  ('Health Tracker', 'An AI-powered health monitoring and tracking application.',
   array['Flutter','Cloudflare Workers AI'], 'AI Application',
   'https://github.com/Tqh2410/g9-personal-health-tracker/tree/feature/trang-chu', 1),
  ('Expense Tracker', 'A mobile application for managing personal and team financial expenses.',
   array['Flutter','Firebase'], 'Team Project (Mobile App)',
   'https://github.com/TuyenTran205/Expense-Tracker-App', 2),
  ('Personal Portfolio & Document Hub', 'A web application showcase for student profiles and academic resource sharing.',
   array['React','TypeScript','Tailwind CSS','MUI','Vite'], 'Web Development',
   'https://github.com/TuyenTran205/duAnWebGioiThieuCN', 3);
```

Dữ liệu lấy nguyên từ `src/data/profile.ts`, `projects.ts` và `Home.tsx` trong repo [REPO]. Chưa seed `documents`: 5 tài liệu mẫu trong `src/data/documents.ts` đều có `downloadUrl: '#'` (liên kết giả), không nên đưa vào DB thật. Tài liệu thật sẽ thêm qua Admin hoặc khôi phục từ bản sao lưu project cũ.

Phần công nghệ của dự án thứ ba đã đổi sang `Tailwind CSS`, `MUI` theo quyết định đổi thư viện giao diện (`01` mục 5).

## 7. Khóa và biến môi trường

Vào Project Settings → API Keys, lấy **Project URL** và khóa **publishable** (không lấy `secret`/`service_role`).

| Nơi | Việc |
|---|---|
| `.env` cục bộ | Thay `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` bằng giá trị project mới. `.env` đã trong `.gitignore` [REPO]; không commit |
| Vercel → Project → Environment Variables | Cập nhật cùng hai biến, cho cả Production và Preview, rồi deploy lại (biến `VITE_*` được đóng gói lúc build nên phải build lại mới có hiệu lực) |
| GitHub Secrets (cho keepalive, `06` mục 7) | `SUPABASE_URL`, `SUPABASE_ANON_KEY` giá trị mới |
| Supabase → Authentication → URL Configuration | Site URL = `https://tranvantuyen.dev`; Redirect URLs gồm domain này và URL preview của Vercel nếu dùng |

Giữ tên biến `VITE_SUPABASE_ANON_KEY` để khỏi sửa `src/lib/supabaseClient.ts`, dù khóa giờ có tên "publishable".

**Về khóa cũ trong lịch sử Git**: commit `1c51bd7` chứa `.env` cũ và đang công khai, nhưng khóa đó là của project cũ đã paused (`sb_publishable_...`, khóa công khai) nên không còn là vấn đề; không cần viết lại lịch sử (thao tác `push --force` có hại, lợi ích bằng không). Điều kiện: `.env` của project mới **không được** commit.

## 8. Chống lạm dụng: giới hạn toàn cục, và đánh đổi

Bản trước giới hạn theo máy khách bằng cách băm IP từ header `x-forwarded-for`. Điều đó phụ thuộc vào việc hàm SQL đọc được header này, mà tôi không kiểm chứng được. Bản này dùng **giới hạn toàn cục**: tối đa 20 lượt nộp chờ duyệt mỗi giờ cho cả hệ thống, cộng ô honeypot (ô ẩn mà người thật không điền).

| | Giới hạn toàn cục (bản này) | Theo IP (bản trước) |
|---|---|---|
| Phụ thuộc điều chưa kiểm chứng | Không | Có (đọc được IP trong SQL) |
| Số bảng/hàm | 0 thêm | 1 bảng + 3 hàm |
| Chặn bơm hàng loạt | Có | Có |
| Điểm yếu | Kẻ xấu có thể nộp đủ 20 lượt để **chặn người thật nộp trong giờ đó** (từ chối dịch vụ ở kênh đóng góp) | Kẻ xấu đổi IP vẫn né được |
| Kẻ xấu có thể đăng nội dung lên trang công khai không? | **Không** (mọi thứ ở `pending`, admin duyệt) | Không |

Chấp nhận đánh đổi này vì lưu lượng của một portfolio cá nhân thấp và mức thiệt hại tối đa chỉ là hàng chờ bị đầy tạm thời; kẻ xấu không phá hay công khai được gì. Nếu thực tế bị lạm dụng, nâng cấp lên giới hạn theo IP là một thay đổi riêng, làm sau.

## 9. Kiểm thử bảo mật (bắt buộc đạt trước khi viết giao diện)

Đặt `URL` và `KEY` (khóa publishable). Mọi lệnh dưới đây chạy **không đăng nhập**:

```bash
H=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json")

# Đọc công khai: phải trả dữ liệu
curl -s "$URL/rest/v1/profile?select=name" "${H[@]}"
curl -s "$URL/rest/v1/projects?select=title&order=sort_order" "${H[@]}"

# Phải BỊ TỪ CHỐI (lỗi quyền, không trả dữ liệu)
curl -s "$URL/rest/v1/document_submissions?select=*" "${H[@]}"
curl -s "$URL/rest/v1/admin_users?select=*" "${H[@]}"
curl -s -X POST "$URL/rest/v1/documents" "${H[@]}" \
  -d '{"title":"x x x","category":"Đại cương","format":"PDF","url":"https://a.b"}'
curl -s -X PATCH "$URL/rest/v1/profile?id=eq.1" "${H[@]}" -d '{"name":"hack"}'
curl -s -X POST "$URL/rest/v1/rpc/approve_submission" "${H[@]}" \
  -d '{"p_id":"00000000-0000-0000-0000-000000000000"}'
```

| Kiểm tra | Kỳ vọng |
|---|---|
| `anon` đọc `document_submissions`, `admin_users` | Từ chối |
| `anon` ghi trực tiếp vào mọi bảng | Từ chối |
| `anon` gọi `approve_submission`, `reject_submission` | Từ chối |
| `anon` gọi `submit_document` hợp lệ | Thành công, bản ghi ở `pending` |
| `submit_document` với liên kết `http://...` hoặc `javascript:...` | Lỗi vi phạm ràng buộc |
| `submit_document` với `p_honeypot` khác rỗng | Lỗi `rejected` |
| Gọi `submit_document` lần thứ 21 trong 1 giờ | Lỗi `rate_limited` |
| Sau khi nộp, `anon` đọc `documents` | **Không** thấy bản nộp |
| Tài khoản đã đăng nhập nhưng **không** trong `admin_users`: ghi bất kỳ bảng nào, gọi `approve_submission` | Từ chối / `forbidden` |
| Admin: `approve_submission` một bản `pending` | Tạo dòng ở `documents`; gọi lần hai báo `not_pending` |
| Admin upload vào `document_files`; `anon` upload vào bucket này | Admin được; `anon` bị từ chối |
| `.env` chứa khóa `secret`/`service_role`? | Phải **không** |

Mã lỗi/thông điệp cụ thể thay đổi theo phiên bản PostgREST [CẦN XÁC NHẬN]; tiêu chí là "bị từ chối, không có dữ liệu ghi/đọc ngoài ý muốn", không phải khớp chữ.

## 10. Mô hình đe dọa (rút gọn)

| Mối đe dọa | Biện pháp | Rủi ro còn lại |
|---|---|---|
| Spam đóng góp | RPC + giới hạn toàn cục + honeypot + `CHECK` + mọi thứ ở `pending` | Chặn tạm thời kênh đóng góp (mục 8) |
| Gọi thẳng REST bỏ qua giao diện | Không cấp quyền ghi cho `anon`; RLS | Không đáng kể |
| Leo quyền admin | `admin_users`, tắt đăng ký, kiểm tra trong hàm | Lộ mật khẩu admin; bật xác thực hai bước nếu có [CẦN XÁC NHẬN] |
| Liên kết độc | Chỉ `https://`; admin tự mở kiểm tra trước khi duyệt; nhãn "liên kết ngoài"; `rel="noopener noreferrer"` | Admin duyệt nhầm |
| XSS qua nội dung nhập | React thoát mặc định; cấm `dangerouslySetInnerHTML` | Không đáng kể nếu giữ quy tắc |
| Lộ khóa | Chỉ dùng khóa publishable ở client; không bao giờ để `secret` vào biến `VITE_*` | Biến `VITE_*` luôn nằm trong bundle |
| Dự án bị tạm dừng lại | Dữ liệu dự phòng + keepalive (`06` mục 7); dashboard ghi nâng cấp Pro mới tránh được | Mất tính năng động tạm thời |
