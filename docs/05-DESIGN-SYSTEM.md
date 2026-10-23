# 05 — Hệ thống thiết kế: giao diện không "AI hóa"

## 1. "AI hóa" nghĩa là gì ở đây

Giao diện "AI hóa" không phải do một yếu tố đơn lẻ, mà do **tổ hợp lựa chọn mặc định giống nhau** xuất hiện ở hàng loạt sản phẩm tạo tự động. Dấu hiệu nhận ra là sự thiếu quyết định có chủ đích: mọi thứ đều "an toàn", không có quan điểm.

Phần dưới liệt kê các dấu hiệu cụ thể, **đối chiếu với chính repo hiện tại** để thấy rõ cần bỏ gì.

## 2. Kiểm kê hiện trạng

| Dấu hiệu | Có trong repo? | Vị trí |
|---|---|---|
| Chữ gradient xanh–tím | Có | `index.css:74,122,146`; `Portfolio.tsx:90`; `Resources.tsx:92`; `Admin.tsx:466` |
| Nút gradient `#0073ea → #a25ddc` | Có | `index.css:74`, `.btn-primary` ở `index.css:221` |
| Huy hiệu pastel nhiều màu theo chu kỳ | Có | `.badge-pastel` + mảng màu xoay vòng ở `Home.tsx:81,122`, `Portfolio.tsx:138` |
| Màu huy hiệu gán **theo chỉ số** (không mang nghĩa) | Có | `badgeColors[idx % ...]` |
| Mọi thẻ nâng lên khi hover | Có | `.card:hover` `index.css:179` |
| Mọi nút nhấc lên 2 px khi hover | Có | `.btn:hover` `index.css:205` |
| Bo góc lớn đồng loạt (12–16 px), nền mờ kính | Có | `--bs-border-radius*`, `.custom-navbar` backdrop-filter |
| Nhãn nhỏ viết hoa giãn chữ phía trên tiêu đề | Có | `.hero-subtitle` ("WELCOME TO MY SPACE", "MY WORK", "ACADEMIC SHARE") |
| Văn bản giữa trang căn giữa toàn bộ | Có | `Home.tsx` |
| Đổ bóng mềm lớn dưới mọi thẻ | Có | `--card-shadow` |
| Sao chép lời chào chung chung | Có | "Welcome to My Space" |

Bản 2.0/3.0 của tôi đề xuất "Electric Cyan", "holographic pods", "nền kính mờ", "đối tượng phát sáng": **cùng một họ dấu hiệu**. Đã loại bỏ.

## 3. Hướng thẩm mỹ đề xuất: biên tập, tiết chế

Một cách nghĩ: giao diện như **một ấn phẩm kỹ thuật được biên tập**, không phải bảng điều khiển sản phẩm SaaS. Cụ thể:

- **Bố cục**: lưới có chủ đích, căn lề trái là chính; bất đối xứng được phép. Căn giữa chỉ dùng cho khoảnh khắc nhấn mạnh.
- **Chữ làm nhân vật chính.** Kích cỡ tương phản mạnh giữa tiêu đề lớn và chữ thường. Chữ tạo cấu trúc, không dựa vào hộp và bóng đổ.
- **Màu ít, mang nghĩa.** Một màu nhấn duy nhất, dùng khi có ý nghĩa (liên kết, trạng thái đang đọc).
- **Đường kẻ và khoảng trắng** thay cho thẻ có bóng. Danh sách có đường phân cách thay cho lưới thẻ giống nhau.
- **Chuyển động có lý do**: chỉ khi giúp hiểu (chuyển chương, thay đổi trạng thái), không chuyển động trang trí.

Đây là **đề xuất có căn cứ thẩm mỹ, không phải đúng duy nhất.** Bạn nên xem phiên bản dựng thử rồi điều chỉnh; tài liệu này cố định các quy tắc, không cố định mọi lựa chọn trực quan.

## 4. Token

Gốc là một tệp `src/styles/tokens.ts`. Từ đó có hai nơi dùng: khối `@theme` của Tailwind trong `src/index.css`, và `createTheme` của MUI trong `src/theme/muiTheme.ts`.

Vì sao gốc là TS chứ không phải biến CSS: hàm tính màu của MUI (`alpha`, `darken`...) cần giá trị màu thật, không an toàn khi đưa chuỗi `var(--...)` vào palette [CẦN XÁC NHẬN theo tài liệu MUI], nên MUI không đọc ngược từ CSS được. Hai nơi phải khớp nhau; thêm một script nhỏ so sánh chúng, chạy trước build.

Giá trị dưới là **điểm khởi đầu**; cần kiểm tra độ tương phản thật bằng công cụ trước khi chốt.

### Màu (chế độ sáng — mặc định)

| Token | Giá trị gợi ý | Dùng cho |
|---|---|---|
| `--bg` | `#F6F4EF` (trắng ngả ấm) | Nền trang |
| `--surface` | `#FFFFFF` | Bảng, biểu mẫu |
| `--ink` | `#16150F` | Chữ chính |
| `--ink-muted` | `#5A574D` | Chữ phụ |
| `--rule` | `#D9D5C9` | Đường kẻ |
| `--accent` | `#B3361C` (đỏ gạch) | Liên kết, trạng thái tiêu điểm — **một màu duy nhất** |
| `--success` / `--danger` | màu ngữ nghĩa riêng, chỉ trong thông báo | Trạng thái hệ thống |

### Màu (chế độ tối)

Đảo nền/chữ, giữ nguyên tinh thần: nền gần đen ngả ấm (không xanh tím), chữ ngà. Màu nhấn điều chỉnh sáng hơn cho đủ tương phản.

### Chữ

| Vai trò | Gợi ý | Lưu ý |
|---|---|---|
| Tiêu đề | Một họ chữ có cá tính (serif hiện đại hoặc grotesque đặc trưng) | Phải hỗ trợ tiếng Việt đầy đủ dấu — **kiểm tra bằng chuỗi "Trần Văn Tuyên", "Ặ Ế Ữ"** |
| Nội dung | Sans dễ đọc | Cùng yêu cầu dấu tiếng Việt |
| Số liệu/mã | Monospace | Chỉ dùng khi có nội dung kỹ thuật thật |

Repo hiện dùng Inter + Plus Jakarta Sans (`index.html:11`). Plus Jakarta Sans và Inter là cặp rất phổ biến, thành phần của vẻ "quen mắt". Đổi là quyết định thẩm mỹ của bạn.

**Tự lưu trữ font** (`.woff2` trong `public/fonts`) thay vì tải từ Google Fonts: nhanh hơn (không thêm bắt tay kết nối), không phụ thuộc dịch vụ ngoài, tránh vấn đề riêng tư. Kiểm tra giấy phép từng font (thường OFL) trước khi đóng gói. [CẦN XÁC NHẬN theo từng font]

### Khoảng cách, bo góc, đổ bóng

- Thang khoảng cách: 4 / 8 / 16 / 24 / 40 / 64 px.
- Bo góc: **2–4 px** cho thành phần tương tác; không bo `pill` cho huy hiệu.
- Đổ bóng: **không dùng** cho thẻ. Phân tách bằng đường kẻ 1 px.

## 5. Quy tắc cụ thể

1. **Cấm** `background-clip: text` với gradient.
2. **Cấm** gradient trên nút, thẻ, nền. Nếu cần chiều sâu, dùng một mảng màu phẳng.
3. **Cấm** emoji trong nút, tiêu đề, nhãn.
4. **Huy hiệu**: màu chỉ gán khi có nghĩa (ví dụ định dạng tệp PDF/ZIP). Kỹ năng và công nghệ hiển thị là văn bản trơn phân cách bằng dấu chấm giữa hoặc danh sách, không phải đám huy hiệu nhiều màu.
5. **Hover**: đổi màu hoặc gạch chân. Không nâng, không phóng to. Không hiệu ứng hover trên thứ không bấm được.
6. **Nhãn nhỏ viết hoa giãn chữ trên tiêu đề**: dùng khi thật sự cần phân loại; bỏ những câu rỗng như "Welcome to My Space".
7. **Văn bản mẫu**: viết lại toàn bộ chữ giao diện bằng giọng cụ thể của bạn. Ví dụ "Sinh viên CNTT, Đại học Thủy Lợi. Đang làm app theo dõi sức khỏe bằng Flutter và Cloudflare Workers AI." thay cho câu chung chung.
8. **Ảnh/biểu tượng**: dùng ảnh thật (ảnh dự án, ảnh chụp màn hình) thay vì biểu tượng minh họa chung. Hiện `src/assets/hero.png` tồn tại nhưng không được dùng trong code [REPO]; xem lại nó có phù hợp không.
9. **Tailwind không để lộ mặc định.** Xóa palette mặc định trong `@theme` (dạng `--color-*: initial;`) rồi chỉ khai báo màu từ token [CẦN XÁC NHẬN cú pháp theo phiên bản Tailwind được cài]. Cấm trong mã giao diện: `bg-gradient-*`, `shadow-lg|xl|2xl`, `rounded-xl|2xl|3xl|full` (trừ ảnh đại diện tròn nếu có), `backdrop-blur-*`. Kiểm tra bằng tìm kiếm văn bản trong CI.
10. **MUI không để lộ vẻ Material.** Mọi thành phần MUI đi qua `createTheme` với: `shape.borderRadius` 2–4; `shadows` toàn `'none'`; `MuiButtonBase.defaultProps.disableRipple = true`; `MuiButton` có `textTransform: 'none'` và `disableElevation`; `typography.fontFamily` là font của dự án; màu lấy từ token. Dấu hiệu lộ vẻ mặc định: nút viết hoa toàn bộ, gợn sóng khi bấm, bóng nâng, ô nhập có nhãn nổi màu xanh/tím.
11. **Kiểm tra bằng mắt.** Nếu người xem nhìn ra "đây là Material UI" hoặc "đây là mẫu Tailwind" thì chưa đạt, bất kể mã đúng quy tắc.

## 6. Trạng thái bắt buộc cho mọi thành phần dữ liệu

Mỗi vùng dữ liệu động phải có đủ:

| Trạng thái | Yêu cầu |
|---|---|
| Đang tải | Khung xương (skeleton) cùng kích thước với nội dung thật, không nhảy bố cục khi tải xong |
| Rỗng | Câu giải thích và, nếu có, hành động tiếp theo |
| Lỗi | Nêu lỗi bằng ngôn ngữ thường, có nút thử lại; **không** hiển thị thông báo kỹ thuật thô |
| Dự phòng | Khi dùng dữ liệu tĩnh vì DB lỗi, báo nhẹ nhàng (hiện là banner vàng "Running in fallback mode", chữ thuộc về nhà phát triển, không phải người dùng) |

## 7. Ngôn ngữ

Trang hiện lẫn tiếng Anh và tiếng Việt (nhãn tiếng Anh, tiêu đề tài liệu tiếng Việt, placeholder tìm kiếm tiếng Việt). Cần quyết định **một** ngôn ngữ chính cho giao diện. Gợi ý: tiếng Việt, vì người đọc chính là sinh viên TLU (kho tài liệu) và nhà tuyển dụng trong nước; có thể thêm bản tiếng Anh sau. Đây là quyết định của bạn, cần xác nhận.

## 8. Danh sách kiểm tra trước khi coi một trang là xong

- [ ] Không còn gradient, bóng đổ thẻ, huy hiệu pastel theo chỉ số.
- [ ] Chỉ có một màu nhấn trong toàn trang.
- [ ] Độ tương phản chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1 (kiểm tra cả hai chế độ sáng/tối).
- [ ] Ba trạng thái tải/rỗng/lỗi đều có.
- [ ] Dấu tiếng Việt hiển thị đúng ở mọi font trong hệ.
- [ ] Mục tiêu bấm tối thiểu 44×44 px trên mobile.
- [ ] Bàn phím: tab đúng thứ tự, viền focus nhìn thấy.
- [ ] Không có chữ mẫu kiểu "Welcome to...", "Featured Projects", "A showcase of...".
- [ ] Thử ở 360 px, 768 px, 1280 px, không cuộn ngang ngoài ý muốn.
- [ ] Hỏi người ngoài xem 5 giây: họ nói được đây là web của *ai*, *làm gì* không?
