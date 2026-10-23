# THÔNG BÁO LƯU TRỮ VÀ TÌNH TRẠNG TÀI LIỆU (ARCHIVE NOTICE)

**Cập nhật ngày:** 23/10/2026  
**Dự án:** `portfolio-web` (Portfolio Cá Nhân Trần Văn Tuyên — Creative Developer)

---

## 1. Mục đích
Tài liệu này xác định tính pháp lý và hiệu lực của các tài liệu kỹ thuật, đặc tả kiến trúc trong thư mục `docs/` và `docs/specs/`.

## 2. Phân loại hiệu lực tài liệu

### A. Tài liệu Hiện hành (Active & Authoritative) - BẮT BUỘC TUÂN THỦ
- `docs/specs/clean-security-deployment-spec.md`: Đặc tả kỹ thuật thanh lọc codebase, kiểm thử bảo mật & triển khai production domain `tranvantuyen.dev`. Đây là văn bản kiến trúc duy nhất có hiệu lực thi công và nghiệm thu ở thời điểm hiện tại.

### B. Tài liệu Nền tảng Tham chiếu (Historical Reference)
- `docs/specs/3d-scrollytelling-and-anti-ai-redesign-spec.md`: Tài liệu ghi lại triết lý Anti-AI Design, Organic Sphere 3D Wireframe Mesh (Three.js + GLSL Simplex Noise) và hệ thống âm thanh Procedural Web Audio Synthesizer.

### C. Tài liệu Đã được Thay thế (Superseded & Archived)
Các tài liệu sau đây phản ánh các giai đoạn kiến trúc thử nghiệm trước đó và đã được thay thế hoàn toàn bởi kiến trúc Single Page Application 3D hiện hành:
1. `docs/01-ARCHITECTURE.md` đến `docs/07-ROADMAP.md` và `docs/README.md`: Mô hình 2-tier có backend Supabase và Admin Portal cũ (không còn dùng).
2. `docs/specs/lenovo-laptop-scrollytelling-spec.md`: Thiết kế mô hình laptop GLTF (đã thay bằng procedural wireframe mesh).
3. `docs/specs/cinematic-aerospace-awwwards-spec.md`: Thiết kế không gian hàng không vũ trụ (đã thay thế).
4. `docs/specs/endurosat-aerospace-redesign-spec.md`: Thiết kế vệ tinh 3D satellite.glb (đã thay thế).
5. `docs/specs/endurosat-visual-perfection-spec.md`: Bản tinh chỉnh vệ tinh (đã thay thế).
6. `docs/specs/service-layer-and-admin-spec.md`: Tầng service và quản trị Supabase (đã lược bỏ để chuyển sang static SPA tối ưu).
