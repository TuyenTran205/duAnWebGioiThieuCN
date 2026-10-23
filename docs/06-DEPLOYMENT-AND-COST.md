# 06 — Triển khai và chi phí

## 1. Hiện trạng và điều chưa biết

- Remote: `github.com/TuyenTran205/duAnWebGioiThieuCN`. [REPO]
- Bạn nói đang dùng Vercel. Repo **không có** `vercel.json` hay `.vercel`. [REPO] Vercel tự nhận Vite nên vẫn chạy, nhưng cấu hình mặc định chưa xử lý định tuyến phía client (mục 3).
- `robots.txt` và `sitemap.xml` trước đây ghi `https://tuyentran.dev` (domain không tồn tại). **Đã sửa thành `https://tranvantuyen.dev`** (xem mục 2).

## 2. Tên miền: `tranvantuyen.dev`

Chủ dự án xác nhận domain này. Dữ kiện tra cứu công khai ngày 2026-10-20 (RDAP và DNS):

| Mục | Giá trị | Ý nghĩa |
|---|---|---|
| Nhà đăng ký | Name.com, Inc. | Khớp với ưu đãi tên miền của GitHub Student Developer Pack [LẬP LUẬN — Name.com là đối tác của gói này; chủ dự án nói "free từ GitHub"] |
| Ngày đăng ký | 2026-07-29 | — |
| **Ngày hết hạn** | **2027-07-29** | Thời hạn 1 năm. Sau ngày này **phải gia hạn trả phí hoặc mất domain** |
| Máy chủ tên (NS) | `ns1psw / ns2nsy / ns3gmv / ns4sxy .name.com` | **DNS đang quản lý tại Name.com**, không phải tại Vercel |
| Bản ghi A (gốc) | `216.198.79.1` | Đã trỏ đi đâu đó; trông giống dải IP của Vercel [CẦN XÁC NHẬN trong Vercel → Project → Domains, mục trạng thái] |
| `tuyentran.dev` (domain cũ trong repo) | Không phân giải được | Không tồn tại như một site hoạt động: không nên để trong `robots.txt`/`sitemap.xml` |

**Hệ quả**

1. ~~Sửa `public/robots.txt` và `public/sitemap.xml`~~ **Đã làm**: dòng `Sitemap:` và 3 thẻ `<loc>` đã trỏ `https://tranvantuyen.dev/...`. Việc còn lại: thẻ canonical và OG trong `index.html` (mục 4) cũng phải dùng domain này khi được thêm.
2. Chọn tên miền chuẩn (canonical): `tranvantuyen.dev` hay `www.tranvantuyen.dev`. Chọn một, bản còn lại chuyển hướng 301 (cấu hình ở Vercel Domains). Hiện chưa biết `www` có được cấu hình không. [CẦN XÁC NHẬN]
3. **Hạn chót 2027-07-29.** Đặt nhắc lịch trước 30 ngày. Chi phí gia hạn `.dev` là khoản phát sinh duy nhất không thể tránh nếu muốn giữ domain, mức giá tại Name.com [CẦN XÁC NHẬN]. Đường lui miễn phí: `*.vercel.app`.
4. Domain nằm ở Name.com nên **bản ghi DNS sửa ở Name.com**, không sửa ở Vercel. Chỉ đổi NS sang Vercel nếu muốn Vercel quản lý DNS.
5. `.dev` nằm trong danh sách HSTS preload: trình duyệt **bắt buộc HTTPS**. Vercel cấp chứng chỉ tự động, nhưng nếu chứng chỉ chưa phát hành thì truy cập `http://` sẽ lỗi thay vì tự hạ cấp. [LẬP LUẬN]
6. Khi đổi domain về sau, chỉ phải sửa: `robots.txt`, `sitemap.xml`, thẻ canonical/OG, Site URL của Supabase (mục 5). Liên kết nội bộ dùng đường dẫn tương đối nên không bị ảnh hưởng.

## 3. Cấu hình Vercel

Tạo `vercel.json` ở thư mục gốc:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Lý do: dự án dùng `BrowserRouter` (`main.tsx`), nên các đường dẫn như `/resources` không tương ứng tệp thật. Nếu không có rewrite, tải trực tiếp hoặc làm mới `/resources` có thể trả 404. [LẬP LUẬN — Vercel với dự án Vite thường không tự thêm rewrite cho SPA; hãy thử mở thẳng `/resources` trên bản deploy hiện tại để xác nhận có đang lỗi không]

Tệp tĩnh thật (như `robots.txt`, `sitemap.xml`, `favicon.svg`) vẫn được phục vụ trước rewrite.

Cấu hình khác:

| Mục | Giá trị |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` (`tsc -b && vite build`, theo `package.json:8`) |
| Output | `dist` |
| Biến môi trường | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — đặt ở Project Settings → Environment Variables, **không** commit |

`.env` đã nằm trong `.gitignore`. [REPO] Thêm `.env.example` (không có giá trị thật) để người khác biết cần biến nào.

**Tuyệt đối không** đặt khóa `service_role` của Supabase vào bất kỳ biến `VITE_*` nào: mọi biến `VITE_*` bị đóng gói vào mã gửi cho trình duyệt.

## 4. Thẻ meta chia sẻ (OG)

Hiện thẻ OG được đặt bằng JS (`SEO.tsx`, react-helmet). Bot của mạng xã hội thường chỉ đọc HTML thô nên có thể không thấy. [LẬP LUẬN — kiểm tra bằng công cụ gỡ lỗi chia sẻ của từng nền tảng]

Biện pháp rẻ nhất, không cần SSR:

- Đặt thẻ `og:title`, `og:description`, `og:image`, `og:url`, `<link rel="canonical">` **trực tiếp trong `index.html`** cho trang chủ.
- Tạo ảnh `public/og-image.jpg` thật (hiện `SEO.tsx:17` trỏ tới tệp **không tồn tại**). [REPO] Dùng URL tuyệt đối (`https://<domain>/og-image.jpg`), vì nhiều nền tảng không chấp nhận đường dẫn tương đối.
- Giữ react-helmet cho tiêu đề tab theo từng trang.

Nếu sau này cần thẻ riêng cho `/resources`, `/portfolio`: cân nhắc tiền kết xuất. Ngoài phạm vi.

## 5. Cấu hình Supabase theo domain

Ở Authentication → URL Configuration: đặt **Site URL** và **Redirect URLs** là domain triển khai thật. Sai ở đây gây lỗi chuyển hướng sau đăng nhập. [CẦN XÁC NHẬN tên mục trong giao diện hiện tại]

Khi đổi domain (ví dụ ưu đãi hết hạn, chuyển sang `*.vercel.app`), cập nhật lại đúng mục này.

## 6. Chi phí

Mọi con số hạn mức dưới đây là **[CẦN XÁC NHẬN]**: nhà cung cấp thay đổi chính sách, tôi không đọc được dashboard của bạn. Mở trang Usage/Billing của từng dịch vụ để đối chiếu trước khi dựa vào.

| Hạng mục | Dịch vụ | Chi phí | Điều cần kiểm tra |
|---|---|---|---|
| Host frontend | Vercel Hobby | 0 | Điều khoản **phi thương mại** của gói Hobby; portfolio cá nhân thường phù hợp |
| Cơ sở dữ liệu | Supabase Free | 0 | Dung lượng DB; số dự án miễn phí cho phép |
| Lưu trữ tệp | Supabase Free | 0 | Dung lượng Storage (~1 GB), băng thông ra |
| Xác thực | Supabase Auth | 0 | Một tài khoản admin, không đáng kể |
| 3D | `three` (MIT) | 0 | — |
| Font | Tự lưu trữ (OFL) | 0 | Giấy phép từng font |
| Tên miền | Xem mục 2 | 0 hoặc có thời hạn | Ngày hết hạn ưu đãi |

**Điểm có thể phát sinh phí thật**
1. Băng thông Vercel nếu trang rất nhiều lượt truy cập — rất khó với portfolio cá nhân. Giảm rủi ro bằng cách giữ bundle nhỏ (mục tiêu ở `01` mục 5), nén ảnh.
2. Storage/băng thông Supabase nếu có nhiều tệp lớn. Giảm rủi ro bằng chính sách "nộp liên kết" ở `02` F4.
3. Hết hạn tên miền ưu đãi.

Không có hạng mục nào khác (không máy chủ, không dịch vụ email, không CAPTCHA trả phí).

## 7. Chống Supabase "ngủ đông"

> **Đã xảy ra rồi.** Ngày 2026-10-20 dashboard cho thấy project Supabase cũ của dự án **đang paused** (ảnh chụp của chủ dự án; resume được đến 21/11/2027). Nghĩa là bản đang chạy trên `tranvantuyen.dev` hiện hiển thị dữ liệu dự phòng tĩnh kèm banner "Running in fallback mode" (`Home.tsx:59`) mà bạn có thể chưa để ý. Project mới (`03`) sẽ gặp lại tình huống này nếu không có keepalive.

Dashboard còn ghi: nâng cấp Pro để tránh bị pause. Trong phạm vi chi phí bằng 0, dùng keepalive bên dưới thay thế. Chưa kiểm chứng keepalive có đủ để tránh pause hay không; theo dõi tuần đầu rồi quyết định. [CẦN XÁC NHẬN]

Gói miễn phí của Supabase có thể **tạm dừng dự án khi không có hoạt động** trong một khoảng thời gian (thường nêu là 7 ngày). [CẦN XÁC NHẬN thời hạn hiện tại]. Portfolio ít truy cập dễ rơi vào tình huống này; khi đó mọi truy vấn lỗi.

Phòng thủ nhiều lớp:

| Lớp | Cách | Ghi chú |
|---|---|---|
| 1. Dữ liệu dự phòng | Giữ `src/data/*.ts` và logic rơi-về hiện có | Trang không trắng khi DB chết. Gom thành `services/` để nhất quán (xem `01`) |
| 2. Giữ hoạt động | GitHub Actions chạy mỗi ngày, gọi một truy vấn nhẹ tới Supabase | Xem bên dưới |
| 3. Quy trình khôi phục | Ghi chú: vào dashboard → Restore | Dùng khi sự cố đã xảy ra |

Mẫu workflow (đặt ở `.github/workflows/keepalive.yml`):

```yaml
name: keepalive
on:
  schedule:
    - cron: '0 3 * * *'
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Query Supabase
        run: |
          curl -fsS "${{ secrets.SUPABASE_URL }}/rest/v1/profile?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

Lưu ý, theo dữ kiện cần xác nhận:
- GitHub Actions có thể **tắt lịch chạy tự động** nếu repo không hoạt động trong thời gian dài (đối với repo công khai). [CẦN XÁC NHẬN] Đẩy một commit thỉnh thoảng hoặc kiểm tra tab Actions.
- Hạn mức phút Actions khác nhau giữa repo công khai và riêng tư. Công việc này chỉ mất vài giây mỗi ngày nên không đáng kể. [CẦN XÁC NHẬN]
- Hàm throttle đã bỏ khỏi thiết kế (`03` mục 8, giới hạn toàn cục tính thẳng từ bảng đóng góp), nên workflow chỉ cần một truy vấn đọc.

## 8. Sao lưu

Gói miễn phí có thể không có sao lưu tự động đáng tin. [CẦN XÁC NHẬN] Đề xuất đơn giản: xuất định kỳ `profile`, `projects`, `documents` thành CSV/JSON (dashboard hoặc `pg_dump`) và giữ trong repo riêng tư. Dữ liệu ít nên việc này rẻ và đáng làm trước mỗi lần chạy migration lớn.

## 9. Danh sách kiểm tra trước go-live

- [ ] Domain thật đã xác định; `robots.txt`, `sitemap.xml`, thẻ OG dùng đúng domain.
- [ ] `vercel.json` có rewrite; mở thẳng `/resources`, `/portfolio`, `/admin/login` đều chạy.
- [ ] Biến môi trường đặt trên Vercel; không có khóa nhạy cảm trong repo (`git log -p -S` tìm thử các chuỗi khóa).
- [ ] Đăng ký công khai của Supabase Auth đã tắt.
- [ ] Toàn bộ kiểm thử bảo mật ở `03` mục 9 đã chạy và đạt.
- [ ] Site URL / Redirect URL của Supabase đúng.
- [ ] Workflow keepalive chạy thử thủ công thành công.
- [ ] Đã xuất bản sao lưu dữ liệu.
- [ ] Chia sẻ thử link trên ít nhất một nền tảng để kiểm tra xem trước.
