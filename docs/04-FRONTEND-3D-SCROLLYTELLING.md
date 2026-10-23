# 04 — Frontend 3D Scrollytelling

## 1. Nguyên tắc

1. **3D phục vụ câu chuyện, không phải để trình diễn.** Mỗi chương có một ý cần truyền đạt; chuyển động của đối tượng 3D phải minh họa ý đó.
2. **Chữ luôn ở DOM.** Canvas chỉ vẽ nền/đối tượng. Truy cập được, chọn được, tìm kiếm được.
3. **Nội dung đầy đủ không phụ thuộc 3D.** Bản tĩnh (mục 6) có cùng nội dung và cùng liên kết.
4. **Chỉ tải three.js khi cần.** Chunk lazy, chỉ trang `/`.

## 2. Hai lớp chồng nhau

```
z-index 0   <canvas>  position: fixed; inset: 0; pointer-events: none
z-index 1   <main>    các <section> chương, cuộn bình thường, nền trong suốt
```

Chiều cao trang = tổng chiều cao các chương. Tiến độ cuộn `p ∈ [0,1]` điều khiển cảnh.

Lấy `p`: `useScroll()` của framer-motion đã cài (`package.json`), không thêm thư viện cuộn. [REPO]

Lenis (cuộn quán tính) **không** dùng ở bản đầu: nó thay đổi cảm giác cuộn gốc, dễ gây khó chịu và ảnh hưởng truy cập; chỉ cân nhắc sau khi dựng xong và đo thấy thực sự cần. [LẬP LUẬN]

## 3. Cảnh 3D: một đối tượng, nhiều trạng thái

Thay vì mỗi chương một bộ model riêng (tốn công, nặng, và dễ thành "trưng bày"), dùng **một đối tượng hình học trừu tượng duy nhất** biến đổi qua các chương.

Đề xuất: một lưới điểm/đường (như mạng lưới dữ liệu) tạo từ `Points` + `LineSegments`, hình học sinh bằng code.

| Chương | Ý truyền đạt | Trạng thái đối tượng | Nội dung DOM |
|---|---|---|---|
| 1. Giới thiệu | Tôi là ai | Lưới rời rạc, trôi chậm, thưa | Tên, vai trò, một câu bio |
| 2. Năng lực | Tôi biết gì | Các điểm gom thành cụm, mỗi cụm một nhóm kỹ năng (ngôn ngữ / mobile / AI) | Danh sách kỹ năng theo nhóm |
| 3. Dự án | Tôi đã làm gì | Ba cụm tách ra; cụm đang đọc sáng hơn, camera lướt tới | Ba dự án lần lượt, kèm liên kết |
| 4. Tài liệu | Tôi chia sẻ gì | Các cụm hội tụ thành một khối ngăn nắp | Tóm tắt kho tài liệu + liên kết `/resources` |
| 5. Liên hệ | Liên lạc | Đối tượng lắng xuống, tĩnh | Liên hệ (từ DB), nút liên kết |

Căn cứ chọn: dữ liệu thật của bạn là kỹ năng (8 mục), ba dự án, kho tài liệu — `src/data/profile.ts`, `projects.ts`, `documents.ts`. [REPO] Cảnh phản ánh đúng cấu trúc này thay vì cảnh ngoài lề (bàn làm việc, hologram) không liên quan nội dung.

Màu và chất liệu theo `05-DESIGN-SYSTEM.md`: tiết chế, không phát sáng neon, không bloom.

## 4. Cấu trúc mã

```
src/three/
  SceneManager.ts    # khởi tạo, vòng lặp, resize, dispose
  useThreeScene.ts   # hook: gắn vào <canvas>, nhận progress, dọn khi unmount
  states.ts          # định nghĩa trạng thái từng chương (vị trí điểm đích, camera)
  capability.ts      # quyết định chế độ: 'full' | 'lite' | 'static'
```

Cơ chế chuyển chương: nội suy tuyến tính giữa hai trạng thái liền kề theo `p`. Vị trí đích tính **một lần** khi khởi tạo (mảng `Float32Array`), mỗi khung hình chỉ nội suy trong GPU/shader hoặc vòng lặp đơn giản — không cấp phát đối tượng mới mỗi khung hình.

### Vòng đời (dễ rò rỉ nhất)

```ts
// Khi unmount phải gọi đủ:
geometry.dispose(); material.dispose(); texture?.dispose();
renderer.dispose();
renderer.forceContextLoss();       // giải phóng WebGL context
cancelAnimationFrame(rafId);
window.removeEventListener('resize', onResize);
```

React 19 `StrictMode` (đang bật ở `main.tsx:11`) gắn rồi gỡ rồi gắn lại effect ở môi trường dev. Hook phải **idempotent**: gắn lần hai không được thấy canvas đã bị hủy.

## 5. Hiệu năng

| Biện pháp | Mục đích |
|---|---|
| `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))` | Tránh render quá độ phân giải trên màn hình mật độ cao |
| Dừng vòng lặp khi tab ẩn (`document.hidden`) | Không đốt pin |
| Dừng vòng lặp khi chương 3D ngoài tầm nhìn / tab không focus | Như trên |
| Số điểm theo chế độ: full ~4000, lite ~800 | Điều chỉnh theo thiết bị |
| Không dùng đổ bóng, hậu xử lý (bloom, SSAO) | Chi phí cao, và là dấu hiệu thẩm mỹ cần tránh |
| Đo FPS 2 giây đầu; dưới ngưỡng thì hạ `full → lite → static` | Thích ứng thật, không đoán theo model máy |

Con số 4000 và 800 là **điểm khởi đầu để đo**, không phải kết luận. [CẦN XÁC NHẬN bằng đo trên máy yếu thật]

Mục tiêu đo (xem nghiệm thu): ổn định từ 50 khung/giây trên máy tính xách tay phổ thông; trên điện thoại tầm trung không rớt dưới 30.

## 6. Chế độ tĩnh (bắt buộc)

Chọn `static` khi **một trong** các điều kiện:

- `matchMedia('(prefers-reduced-motion: reduce)').matches`
- Không tạo được WebGL context (`canvas.getContext('webgl2')` trả `null`)
- FPS đo được dưới ngưỡng sau khi đã hạ xuống `lite`
- Người dùng bấm "Xem bản tĩnh" (lưu lựa chọn vào `localStorage`, bọc `try/catch`)

Bản tĩnh: không canvas. Nền một ảnh/CSS đơn giản cùng bảng màu; các chương hiện lần lượt, hiệu ứng xuất hiện nhẹ (tắt hoàn toàn nếu giảm chuyển động).

**Không** dùng `hardwareConcurrency <= 4` làm điều kiện cứng như bản 2.0/3.0: giá trị này không phản ánh GPU, nhiều máy 4 nhân chạy WebGL tốt, và Safari không công bố giá trị chính xác. Dùng đo FPS thực tế thay thế. [LẬP LUẬN]

## 7. Truy cập (a11y)

- Mọi chữ ở DOM, thứ tự đọc đúng thứ tự chương.
- Canvas có `aria-hidden="true"` (trang trí).
- Viền focus rõ trên liên kết/nút.
- Độ tương phản chữ/nền tối thiểu 4.5:1 ở mọi vị trí cuộn, kể cả khi đối tượng 3D nằm sau chữ. Kiểm tra bằng cách đặt lớp nền mờ có kiểm soát sau khối chữ, không phụ thuộc vị trí điểm sáng ngẫu nhiên.
- Có "Bỏ qua tới nội dung" ở đầu trang.

## 8. Tích hợp với React Router

- Chỉ khởi tạo cảnh khi route là `/`; rời route thì dispose hoàn toàn.
- Lazy import cả hook lẫn three: `const Scene = lazy(() => import('./Scene'))`, bọc `Suspense` với khung chờ nhẹ.
- Cuộn về đầu khi chuyển route (hiện chưa có xử lý này trong `Layout.tsx`).

## 9. Nghiệm thu giai đoạn 3D

- [ ] Bundle của route `/` khi chưa vào chế độ 3D không chứa three (kiểm tra bằng `vite build` + phân tích chunk).
- [ ] 10 lần vào/ra route `/`: số WebGL context không tăng, bộ nhớ không tăng liên tục.
- [ ] Ba chế độ `full / lite / static` đều hiển thị đủ nội dung và liên kết.
- [ ] Giảm chuyển động bật → không có chuyển động camera.
- [ ] Tab ẩn → vòng lặp dừng (CPU/GPU về nền).
- [ ] Kích thước cửa sổ đổi → không méo, không tràn.
- [ ] Đạt Lighthouse Accessibility ≥ 95 trên `/` ở chế độ tĩnh. [mục tiêu, đo thực tế]
