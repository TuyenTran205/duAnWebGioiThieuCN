# ĐẶC TẢ KỸ THUẬT: ENDUROSAT AEROSPACE REDESIGN & PROCEDURAL SATELLITE 3D
**Tài liệu:** `docs/specs/endurosat-aerospace-redesign-spec.md`  
**Dự án:** `portfolio-web` (Trần Văn Tuyên — IT Portfolio & Resources)  
**Tác giả:** Product Architect & UX Specifier (`ba-spec`)  
**Tham chiếu chuẩn thiết kế:** [EnduroSat Space Services](https://www.endurosat.com/space-service/)  
**Trạng thái:** Hoàn thành — Sẵn sàng chuyển giao cho `senior-dev`  
**Phiên bản:** 2.0.0  

---

## 1. TỔNG QUAN & PHÂN TÍCH LỖI HIỆN TRẠNG (ROOT CAUSE ANALYSIS)

Dựa trên phản hồi người dùng thực tế và kiểm tra ảnh chụp màn hình (Image 5), giao diện hiện tại xuất hiện 3 lỗi thiết kế nghiêm trọng phá hỏng trải nghiệm người dùng:

### 1.1 Lỗi Font chữ Tiếng Việt nghiêm trọng ("Trầ `n Văn Tuyên")
- **Hiện tượng:** Tên chủ sở hữu trên màn hình hiển thị bị vỡ vụn thành `"Trầ `n Văn Tuyên"`, dấu huyền bị tách rời khỏi chữ "a", xuất hiện ký tự lạ (backtick / dấu cách thừa).
- **Nguyên nhân kỹ thuật:**
  - Trong `src/pages/Home.tsx`, tiêu đề chính sử dụng class `font-serif`.
  - Trong `src/index.css`, biến `--font-serif` được cấu hình là `'Newsreader', Georgia, Cambria, 'Times New Roman', serif`.
  - Tuy nhiên, trong `index.html`, Google Fonts chỉ tải `Inter` và `Plus Jakarta Sans`, hoàn toàn **không tải font Newsreader**!
  - Trình duyệt trên hệ điều hành Windows tự động rơi về font dự phòng `Georgia` hoặc `Times New Roman`. Bộ render chữ mặc định của Windows đối với hai font này khi gặp ký tự tiếng Việt Unicode tổ hợp/dựng sẵn (đặc biệt là chữ "ần") bị lỗi xử lý glyph, dẫn đến việc tách dấu huyền và chèn khoảng trắng lỗi.
- **Giải pháp dứt điểm:** Loại bỏ triệt để `font-serif` ra khỏi toàn bộ hệ thống tiêu đề tiếng Việt. Chuyển sang sans-serif công nghệ cao: font hiển thị `Plus Jakarta Sans` (weights: 600, 700, 800) kết hợp font nội dung `Inter` và font telemetry `JetBrains Mono` / `SF Mono`. Đảm bảo 100% hiển thị chuẩn mực `Trần Văn Tuyên` trên mọi hệ điều hành.

### 1.2 Cảnh 3D hiện tại phản cảm (Đám mây điểm đỏ và mạng nhện giăng mắc)
- **Hiện tượng:** Toàn màn hình bị phủ kín bởi một đám mây điểm đỏ hình vuông nhấp nháy cùng các đoạn thẳng đỏ nối chằng chịt, người dùng nhận xét trông giống "mạng nhện hoặc đàn kiến đỏ", không có điểm nhấn, gây rối mắt và tạo cảm giác nghiệp dư.
- **Nguyên nhân kỹ thuật:**
  - `SceneManager.ts` và `states.ts` đang sinh ngẫu nhiên 4000 điểm đỏ (`color: 0xB3361C, size: 0.07`) phân bố rải rác trong không gian và nối đường ngẫu nhiên bằng `generateLineIndices`.
  - Thiếu một **vật thể 3D trung tâm (Hero Subject)** để làm điểm neo thị giác (Visual Anchor).
- **Giải pháp chuyển đổi:** Dỡ bỏ hoàn toàn mạng nhện điểm đỏ ngẫu nhiên. Thay thế bằng **Vệ tinh quỹ đạo không gian (Orbital Satellite / Spacecraft)** lấy cảm hứng từ tàu vũ trụ nano của EnduroSat:
  - Dựng bằng thuật toán hình học toán học thuần túy (Procedural Three.js) với chi phí **0 VND**, dung lượng tải về **0 KB** (không dùng file `.gltf` nặng nề, không phụ thuộc mạng).
  - Vệ tinh sở hữu đầy đủ kết cấu hàng không vũ trụ: Thân khối titanium đa giác, lớp cách nhiệt mạ vàng (Gold MLI Foil), 2 cánh pin mặt trời (Solar Array Wings) vươn rộng với các ô quang điện xanh thẳm, chảo ăng-ten parabol viễn thông hướng tâm, cụm cảm biến quang học và vòng quỹ đạo không gian (Orbital Trajectory Rings) thanh mảnh.
  - Phía sau là bầu trời sao vi mô (Micro Starfield) sâu thẳm, tinh tế, tĩnh lặng với các điểm sao màu trắng bạc và xanh băng nhạt, độ trong suốt dịu mắt.

### 1.3 Bố cục thô thiển: Chiếc hộp xám che kín toàn màn hình (Suffocating Modal Box)
- **Hiện tượng:** Tại mỗi chương nội dung, trang web đặt một chiếc hộp đen xám đóng kín (`bg-white/95 dark:bg-zinc-950/95`) to đùng nằm chính giữa màn hình như một popup thông báo phiền toái. Chiếc hộp che kín 85% không gian 3D phía sau, triệt tiêu toàn bộ cảm giác chiều sâu không gian.
- **Giải pháp chuyển đổi:** Phá bỏ hoàn toàn chiếc hộp đóng kín! Chuyển sang **Bố cục mở HUD Hàng không Vũ trụ (Open Aerospace Telemetry Layout)** chuẩn EnduroSat:
  - Văn bản bố trí thoáng đạt trực tiếp trên nền không gian sâu thẳm.
  - Sử dụng bố cục bất đối xứng: Cột nội dung nằm thanh thoát ở nửa trái màn hình (40–48% viewport width), dành trọn nửa phải cho vệ tinh 3D tỏa sáng.
  - Tích hợp các chi tiết đồ họa vi mô: Đường lưới telemetry siêu mảnh 1px, ký tự dấu cộng góc (`+`), nhãn dữ liệu kỹ thuật dạng monospace (`[SYS.STATUS // NOMINAL]`, `[ORBIT // 550 KM LEO]`, `[COORDINATES // 21.004° N, 105.828° E]`).

---

## 2. CHUẨN THIẾT KẾ ENDUROSAT AEROSPACE (DEEP-SPACE ENGINEERING)

### 2.1 Bảng màu không gian sâu thẳm (Deep Space Palette)
Toàn bộ hệ thống giao diện lấy cảm hứng từ buồng điều khiển trạm mặt đất và không gian quỹ đạo thấp (LEO - Low Earth Orbit):

| Token Name | Mã Màu Hex | Ứng Dụng | Ý Nghĩa Kỹ Thuật |
| :--- | :--- | :--- | :--- |
| `--space-bg-dark` | `#030305` | Nền canvas WebGL & nền body tối | Chân không không gian sâu thẳm (Deep Vacuum) |
| `--space-surface-dark` | `rgba(8, 8, 12, 0.65)` | Nền thẻ HUD bán trong suốt | Kính lọc buồng lái phi thuyền |
| `--space-border-subtle` | `rgba(255, 255, 255, 0.08)` | Viền thẻ, đường kẻ phân chia 1px | Khung hợp kim nano |
| `--space-border-active` | `rgba(255, 255, 255, 0.22)` | Viền khi hover hoặc active | Tín hiệu phân tích mục tiêu |
| `--space-gold-mli` | `#D4AF37` / `#E5B83B` | Lớp cách nhiệt đa lớp (MLI Foil) | Phản xạ bức xạ nhiệt mặt trời |
| `--space-solar-blue` | `#0B1E36` / `#16325B` | Ô quang điện cánh pin mặt trời | Tấm Silicon tinh thể hấp thụ quang năng |
| `--space-solar-grid` | `#4CC9F0` | Đường mạch vi mô trên pin mặt trời | Dây dẫn điện áp nano |
| `--space-titanium` | `#71717A` / `#27272A` | Khung thân chính và giàn đỡ | Hợp kim siêu nhẹ Ti-6Al-4V |
| `--space-accent-tlu` | `#E04828` / `#B3361C` | Điểm nhấn thương hiệu TLU | Đèn beacon định vị & điểm nhấn dữ liệu |
| `--space-status-green` | `#10B981` | Đèn telemetry danh định | `[SYS.STATUS // NOMINAL]` |
| `--space-ink-primary` | `#F8FAFC` | Chữ tiêu đề & thông số chính | Độ tương phản đạt chuẩn WCAG AAA |
| `--space-ink-muted` | `#94A3B8` | Chữ thuyết minh, nhãn telemetry | Dễ đọc, không gây chói mắt |

### 2.2 Hệ thống Typography Kỹ thuật (Technical Typography Hierarchy)
- **Display & Headings:** `Plus Jakarta Sans`, font-weight `600` đến `800`, `letter-spacing: -0.03em`. Tuyệt đối không dùng font serif.
- **Body & Description:** `Inter`, font-weight `400` đến `500`, `line-height: 1.6`, `letter-spacing: -0.01em`.
- **Telemetry & Metadata:** `JetBrains Mono`, `SF Mono`, `monospace`, font-weight `500`, uppercase, `letter-spacing: 0.08em`, font-size `10px` đến `12px`.

---

## 3. KIẾN TRÚC MÔ HÌNH 3D PROCEDURAL SATELLITE (THREE.JS)

Toàn bộ mô hình vệ tinh được tạo bằng code TypeScript tại module `src/three/proceduralSatellite.ts`. Không sử dụng bất kỳ file 3D bên ngoài nào.

```
                    ┌──────────────────────────────┐
                    │      SatelliteGroup          │
                    │ (Quản lý User Drag & Orbit)  │
                    └──────────────┬───────────────┘
                                   │
      ┌────────────────────────────┼───────────────────────────┐
      │                            │                           │
┌─────┴──────────────────┐ ┌───────┴─────────────────┐ ┌───────┴─────────────────┐
│     Central Bus        │ │   Dual Solar Wings      │ │ High-Gain Dish Antenna  │
│  - Chassis Box         │ │  - Left Wing Truss      │ │  - Parabolic Dish       │
│  - Gold MLI Foil Layer │ │  - Right Wing Truss     │ │  - Feed Horn Rod        │
│  - Titanium Edge Rails │ │  - Solar Cells Subpanel │ │  - Transceiver Module   │
│  - Sensor / Camera Pod │ │  - Cyan Photonic Lines  │ │  - Gimbal Articulation  │
└────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
      │                            │                           │
┌─────┴──────────────────┐ ┌───────┴─────────────────┐ ┌───────┴─────────────────┐
│  Thruster Propulsion   │ │ Thin Orbital Trajectory │ │ Micro Starfield Cosmic  │
│  - RCS Nozzle Cluster  │ │  - 2 Inclined Rings     │ │  - 1000 Deep Stars      │
│  - Ion Drive Glow      │ │  - Telemetry Beacon Dot │ │  - Star Twinkle Drift   │
└────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

### 3.1 Cấu trúc hình học chi tiết của Vệ tinh (Geometry Specifications)

#### 1. Thân chính (Satellite Bus Chassis):
- **Khung chịu lực chính:** `THREE.BoxGeometry(1.6, 2.4, 1.4)`. Vật liệu: `MeshStandardMaterial` màu xám titan đậm (`#1E1E24`), kim loại hóa `metalness: 0.85`, độ nhám `roughness: 0.35`.
- **Lớp phủ cách nhiệt vàng (Gold MLI Foil Blanket):** Tạo các mảng hình học nổi `THREE.BoxGeometry(1.62, 1.4, 1.42)`. Vật liệu: `MeshStandardMaterial` màu vàng kim (`#D4AF37`), `metalness: 0.95`, `roughness: 0.25`, tạo độ bóng phản xạ ánh sáng mặt trời cực kỳ bắt mắt.
- **Thanh ray gia cố viền (Chassis Rail Wireframe):** Sử dụng `THREE.BoxGeometry` mảnh hoặc `LineSegments` viền quanh các cạnh vệ tinh để tạo chất kỹ thuật hàng không vũ trụ sắc nét.
- **Mô-đun cảm biến quang học (Optical Sensor Turret):** Ống trụ `THREE.CylinderGeometry(0.25, 0.25, 0.5, 16)` gắn ở vách trước, đầu ống có kính quang học phản quang màu xanh dương (`#38BDF8`, `roughness: 0.1`, `metalness: 0.9`).

#### 2. Cặp cánh pin mặt trời (Articulated Dual Solar Wings):
- **Trục nối (Truss Boom Arm):** Khung trụ titan mảnh `THREE.CylinderGeometry(0.06, 0.06, 1.2, 8)` vươn từ thân sang hai bên trái (X-) và phải (X+).
- **Mặt cánh quang điện (Solar Array Panels):** 
  - Mỗi bên gồm 2 tấm panel nối tiếp nhau: `THREE.BoxGeometry(2.2, 1.1, 0.05)`.
  - Mặt đón sáng: `MeshStandardMaterial` màu xanh thẫm quang điện (`#0A192F`), `metalness: 0.7`, `roughness: 0.2`.
  - Trên mặt cánh có các đường lưới chia ô quang điện (Procedural Grid Lines): Các đường mảnh màu cyan/gold chia mặt pin thành các ô chữ nhật $6 \times 3$ chân thực.
  - Mặt sau cánh: Hợp kim nhôm xám bạc chống nhiệt.

#### 3. Chảo ăng-ten parabol viễn thông (High-Gain Dish Antenna):
- **Chảo parabol:** Dựng bằng `THREE.SphereGeometry(0.65, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.45)` lật ngửa tạo lòng chảo, hoặc `THREE.ConeGeometry(0.65, 0.25, 16, 1, true)`. Vật liệu: Vàng kim MLI hoặc lưới carbon titan.
- **Cần tiếp sóng (Feed Horn Strut):** 3 thanh chống hội tụ tại một đỉnh trụ nhỏ chứa cảm biến phát sóng telemetry.
- **Đèn beacon thu phát sóng:** Một điểm cầu phát sáng nhấp nháy nhẹ chu kỳ 1.5s với ánh sáng xanh ngọc (`#10B981`) báo hiệu đường truyền thông suốt.

#### 4. Động cơ phản lực vi mô & Động cơ Ion (Propulsion & RCS Thrusters):
- Cụm 4 miệng phun phản lực vi mô (RCS thrusters) ở 4 góc đáy: `THREE.ConeGeometry(0.08, 0.18, 8)`.
- Miệng xả động cơ ion trung tâm ở đuôi: Khối trụ nón với vầng phát sáng xanh neon siêu nhẹ (`#00F0FF`, `emissiveIntensity: 0.6`).

#### 5. Vòng quỹ đạo không gian (Orbital Trajectory Rings):
- 2 vòng elip quỹ đạo mảnh bao quanh vệ tinh: `THREE.RingGeometry(4.5, 4.52, 64)` hoặc `THREE.BufferGeometry` vẽ đường tròn khép kín (`LineLoop`) nghiêng một góc $23.5^\circ$ và $45^\circ$.
- Màu sắc: Đường kẻ trắng mờ `rgba(255, 255, 255, 0.15)`.
- **Hạt tín hiệu quỹ đạo (Telemetry Beacon Pulse):** Một hạt sáng nhỏ (`THREE.Mesh` hoặc `THREE.Points`) chuyển động liên tục dọc theo vòng quỹ đạo với vận tốc tuần hoàn, tượng trưng cho tín hiệu định vị LEO thời gian thực.

#### 6. Bầu trời sao vi mô (Micro Starfield):
- 1200 hạt sao phân bố đều trong hình cầu bán kính từ $15$ đến $40$ đơn vị thế giới.
- Sử dụng `THREE.Points` với `BufferGeometry`. Kích thước hạt $0.025$ đến $0.04$ đơn vị.
- Màu sắc hạt sao: Phối ngẫu nhiên $80\%$ trắng bạc (`#FFFFFF`), $15\%$ xanh thiên thanh băng giá (`#93C5FD`), $5\%$ vàng ấm (`#FDE68A`).
- Độ mờ: `opacity: 0.65`, không nhấp nháy chói lóa mà giữ sự tĩnh lặng sâu thẳm của vũ trụ.

### 3.2 Thiết lập ánh sáng Hàng không Vũ trụ (Deep Space Lighting Rig)
Trong không gian vũ trụ thực tế, không có ánh sáng tán xạ của bầu khí quyển. Cảnh 3D sử dụng hệ thống 3 nguồn sáng tiêu chuẩn:
1. **Mặt trời trực tiếp (Key Sun Light):** `THREE.DirectionalLight(0xFFF9E6, 3.2)` chiếu chéo từ góc trên bên phải `position(8, 12, 10)`. Đem lại độ sáng sắc nét, bóng đổ dứt khoát trên các mảng vàng MLI và cánh pin mặt trời.
2. **Ánh sáng phản chiếu từ Trái Đất (Earth Albedo Fill Light):** `THREE.DirectionalLight(0x1E3A8A, 1.2)` chiếu hắt ngược từ dưới lên `position(-6, -8, -4)`. Tạo viền xanh lam huyền ảo đậm chất phim tài liệu không gian vũ trụ.
3. **Ánh sáng môi trường tối thiểu (Deep Space Ambient):** `THREE.AmbientLight(0x0C101C, 0.6)` đảm bảo các góc khuất không bị đen tuyệt đối, giữ trọn vẹn chi tiết cơ khí của vệ tinh.

---

## 4. TƯƠNG TÁC KÉO CHUỘT (DRAG-TO-ROTATE) & ĐỒNG BỘ CUỘN SCROLLYTELLING

### 4.1 Cơ chế kéo chuột / chạm màn hình tự do (Drag to Rotate)
Người dùng có thể tương tác trực tiếp với vật thể 3D ở bất kỳ vị trí nào trên màn hình:
- **Sự kiện chuột:** `mousedown`, `mousemove`, `mouseup`, `mouseleave`.
- **Sự kiện cảm ứng di động:** `touchstart`, `touchmove`, `touchend`.
- **Giải thuật xoay có lực quán tính (Inertia Damping):**
  - Khi bắt đầu bấm: Lưu tọa độ xuất phát $(x_0, y_0)$, đặt cờ `isDragging = true`.
  - Trong quá trình rê chuột: Tính delta $(\Delta x, \Delta y)$, cộng dồn vào góc xoay mục tiêu:
    $$\theta_{y,\text{target}} \mathrel{+}= \Delta x \times 0.0065$$
    $$\theta_{x,\text{target}} \mathrel{+}= \Delta y \times 0.0045 \quad (\text{kẹp trong khoảng } [-0.8, 0.8] \text{ rad để tránh lật ngược})$$
  - Trong vòng lặp render (`tick`): Áp dụng thuật toán Lerp làm mượt góc xoay hiện tại về góc xoay mục tiêu với hệ số cản `damping = 0.06`:
    $$\theta_{y,\text{current}} = \text{lerp}(\theta_{y,\text{current}}, \theta_{y,\text{target}}, 0.06)$$
    $$\theta_{x,\text{current}} = \text{lerp}(\theta_{x,\text{current}}, \theta_{x,\text{target}}, 0.06)$$
  - Khi người dùng buông chuột: Vệ tinh vẫn quay chậm theo quán tính rồi từ từ giữ nguyên tư thế góc nhìn người dùng đã chọn. Đồng thời có một chuyển động tự quay nhẹ nhàng chu kỳ dài (Orbital idle drift: $+0.0008\text{ rad/frame}$) tạo cảm giác vật thể đang bay lơ lửng trong không trọng lực.

### 4.2 Lộ trình Camera 5 Chương (5-Chapter Cinematic Camera Choreography)
Khi người dùng cuộn trang, biến số tiến độ cuộn $p \in [0, 1]$ sẽ điều khiển vị trí Camera và tâm nhìn (LookAt Target), lướt qua 5 góc máy điện ảnh đặc tả từng bộ phận của vệ tinh:

| Chương | Phạm vi Cuộn $p$ | Tên Chương & Ý Nghĩa | Vị trí Camera $(X, Y, Z)$ | Tâm nhìn Target $(X, Y, Z)$ | Góc Đặc Tả Vệ Tinh (Focus) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01** | $0.00 \to 0.15$ | **Khởi đầu // Mission Brief** | `(0.0, 0.5, 7.2)` | `(1.2, 0.0, 0.0)` | Toàn cảnh anh hùng (Hero View), vệ tinh lệch phải để nhường nửa trái cho tiêu đề |
| **02** | $0.20 \to 0.35$ | **Năng lực cốt lõi // Avionics** | `(1.8, 0.8, 4.2)` | `(0.4, 0.2, 0.0)` | Cận cảnh thân chính (Bus Chassis), cảm biến và hệ thống xử lý trung tâm |
| **03** | $0.40 \to 0.60$ | **Dự án thực tế // Solar Array** | `(-2.8, 0.4, 4.8)` | `(-0.8, 0.0, 0.0)` | Góc nghiêng đặc tả cánh pin mặt trời (Năng lượng và các khối giải pháp thực chiến) |
| **04** | $0.65 \to 0.80$ | **Đóng góp tri thức // Uplink Dish** | `(1.2, 2.8, 5.0)` | `(0.0, 0.4, 0.0)` | Góc nhìn từ trên cao xuống chảo ăng-ten parabol (Truyền tải và chia sẻ kho tài liệu) |
| **05** | $0.85 \to 1.00$ | **Kết nối & Hợp tác // Downlink** | `(0.0, 1.8, 7.8)` | `(0.0, -0.2, 0.0)` | Toàn cảnh quỹ đạo LEO, nhìn bao quát toàn bộ vòng quỹ đạo và tín hiệu liên lạc |

Thuật toán làm mượt Hermite Smoothstep ($3t^2 - 2t^3$) được áp dụng cho từng phân đoạn $[p_i, p_{i+1}]$ để đảm bảo chuyển động camera êm ái, hoàn toàn không bị giật khựng khi chuyển tiếp giữa các chương.

---

## 5. BỐ CỤC GIAO DIỆN MỞ HUD 5 CHƯƠNG (OPEN AEROSPACE HUD LAYOUT)

Xóa bỏ hoàn toàn lớp bao bọc `<div className="max-w-2xl bg-white/95 dark:bg-zinc-950/95 ...">`! Thay thế bằng cấu trúc DOM mở chuẩn HUD không gian:

### 5.1 Quy chuẩn cấu trúc mỗi Section
```html
<section id="chuong-X" className="min-h-screen relative flex items-center py-20 px-4 sm:px-8 lg:px-16" aria-label="Chương X">
  <!-- Dải nền gradient tinh tế bảo vệ độ tương phản văn bản mà không che nền 3D -->
  <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-linear-to-r from-zinc-950/90 via-zinc-950/60 to-transparent pointer-events-none" />

  <!-- Khối nội dung HUD mở rộng (Width 40-50% màn hình, lệch trái) -->
  <div className="relative z-10 w-full max-w-xl lg:max-w-2xl text-left pointer-events-auto">
    <!-- Header Telemetry nhãn Monospace -->
    <!-- Tiêu đề lớn Sans-serif (Plus Jakarta Sans) -->
    <!-- Nội dung thông số kỹ thuật dạng mở -->
    <!-- Nút bấm viền mảnh công nghệ cao -->
  </div>
</section>
```

### 5.2 Chi tiết thiết kế từng Chương

#### Chương 1: Khởi đầu // Mission Brief
- **Telemetry Badge:**
  `[01 // MISSION BRIEF · TLU_LEO] · [SYS.STATUS // NOMINAL] · [ORBIT // 550 KM]`
- **Tên cá nhân (Đã khắc phục lỗi font):**
  `<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-sans">`
  **Trần Văn Tuyên**
  `</h1>`
- **Sub-mission:**
  `Kỹ sư Phần mềm & Chuyên viên Phân tích Nghiệp vụ (Software Engineer & Aspiring Business Analyst)`
- **Tọa độ trạm mặt đất TLU:**
  `GROUND STATION: THUY LOI UNIVERSITY (21.004° N, 105.828° E)`
- **Các nhãn chuyên môn (Role Badges):**
  Huy hiệu viền 1px mỏng bán trong suốt: `[FULLSTACK DEV]`, `[BUSINESS ANALYST]`, `[AI & CLOUD EDGE]`.
- **Call to Action Buttons:**
  - Nút chính: Nền đỏ gạch TLU `#B3361C` / viền mỏng: `Xem Dự án Quỹ đạo ↓`
  - Nút phụ: Nền kính bán trong suốt viền 1px: `Kho Tài liệu TLU ↗`

#### Chương 2: Năng lực cốt lõi // Core Avionics & Architecture
- **Telemetry Badge:**
  `[02 // AVIONICS SUBSYSTEMS] · [ARCHITECTURE // DISTRIBUTED]`
- **Tiêu đề:**
  `Nền tảng Kỹ thuật & Kiến trúc Lõi`
- **Bảng thông số cấu hình 3 khối Subsystems (dạng thẻ kính HUD viền 1px mỏng):**
  - **Khối 01 — Flight Control & Core Logic:** `Java`, `C++`, `TypeScript`, `SQL Postgres`, `PHP`
  - **Khối 02 — User Interface & Telemetry Display:** `React`, `Tailwind CSS`, `Flutter`, `Firebase`
  - **Khối 03 — Autonomous Edge & Intelligence:** `Cloudflare Workers AI`, `Supabase RLS & Functions`
- **Chỉ số danh định:**
  Hiển thị thước đo hiệu năng: `[LATENCY // < 50ms]` · `[COVERAGE // 100% UNIT TESTED]`

#### Chương 3: Dự án thực tế // Solar Array Deployments
- **Telemetry Badge:**
  `[03 // MISSION PAYLOAD] · [DEPLOYED MODULES // PRODUCTION]`
- **Tiêu đề:**
  `Dự án & Giải pháp Thực chiến`
- **Danh sách 3 dự án tiêu biểu (Thẻ HUD mở, hover viền sáng):**
  Mỗi thẻ dự án thiết kế như một mô-đun thiết bị vệ tinh:
  - Tên dự án in đậm rõ nét + Nhãn loại dự án `[PRODUCTION]`, `[RESEARCH AI]`, `[ENTERPRISE]`.
  - Mô tả giải quyết bài toán người dùng thực.
  - Hàng công nghệ monospace `Java · React · Supabase · Cloudflare AI`.
  - Liên kết trực tiếp: `[VIEW SOURCE ↗]` và `[LIVE DEMO ↗]`.

#### Chương 4: Đóng góp tri thức // Knowledge Uplink
- **Telemetry Badge:**
  `[04 // KNOWLEDGE UPLINK] · [TLU STUDENT REPOSITORY // PUBLIC]`
- **Tiêu đề:**
  `Kho Tài liệu Kỹ thuật Đại học Thủy Lợi`
- **Thống kê dạng lưới telemetry 2x2:**
  - `4 Khối ngành CNTT`
  - `Hàng trăm đề cương & bài giảng số hóa`
  - `Mã nguồn đồ án mẫu có kiểm thử`
  - `Chia sẻ phi lợi nhuận 100%`
- **Nút hành động:** `Truy cập Trạm Dữ liệu TLU ↗`

#### Chương 5: Kết nối & Hợp tác // Downlink Ground Contact
- **Telemetry Badge:**
  `[05 // DOWNLINK RADAR] · [STATUS // LISTENING FOR CONTACT]`
- **Tiêu đề:**
  `Thiết lập Kết nối & Hợp tác`
- **Thông tin liên lạc trực tiếp:**
  - `Email: tranvantuyen.work@gmail.com` (hoặc email cấu hình trong `profile.ts`)
  - `GitHub: github.com/TuyenTran205`
  - `LinkedIn & Portfolio`
- **Trạng thái sẵn sàng:**
  `[READY FOR INTERNSHIP & FULLSTACK/BA COLLABORATION]`

---

## 6. DANH SÁCH FILE VÀ KẾ HOẠCH TRIỂN KHAI CHO `SENIOR-DEV`

`senior-dev` BẮT BUỘC thực hiện đúng danh sách các file sau:

### 6.1 Các file tạo mới (New Files)
1. `src/three/proceduralSatellite.ts`
   - Dựng toàn bộ cấu trúc 3D của Vệ tinh bằng Three.js thuần túy: Thân titan, Gold MLI foil, 2 cánh pin mặt trời, chảo ăng-ten parabol, cụm thruster, 2 vòng quỹ đạo không gian và đèn beacon.
   - Hàm xuất xưởng: `createProceduralSatellite(): { group: THREE.Group, update: (time: number) => void, dispose: () => void }`.
2. `src/three/starfield.ts`
   - Dựng bầu trời sao vi mô 3D 1200 hạt điểm sắc nét, tĩnh lặng, tinh tế.
   - Hàm xuất xưởng: `createStarfield(count: number): { points: THREE.Points, update: (time: number) => void, dispose: () => void }`.

### 6.2 Các file sửa đổi nâng cấp (Modified Files)
1. `index.html`
   - Cập nhật thẻ link Google Fonts để tải đầy đủ các trọng số của `Plus Jakarta Sans` (weights: 500, 600, 700, 800) và `Inter` (weights: 400, 500, 600, 700).
   - Đảm bảo không còn bất kỳ liên kết lỗi nào.
2. `src/index.css`
   - Xóa bỏ định nghĩa `--font-serif`.
   - Cấu hình `--font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;`.
   - Cấu hình `--font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;`.
   - Bổ sung các class tiện ích HUD: `.hud-corner-cross`, `.telemetry-badge`, `.grid-hairline`.
3. `src/three/states.ts`
   - Cập nhật 5 góc nhìn camera điện ảnh đặc tả từng phân đoạn của vệ tinh.
   - Tối ưu hóa giải thuật Hermite Lerp cho mượt mà tuyệt đối.
4. `src/three/SceneManager.ts`
   - Tích hợp `proceduralSatellite`, `starfield` và hệ thống chiếu sáng không gian vũ trụ.
   - Tích hợp bộ bắt sự kiện kéo chuột / chạm màn hình (Drag-to-Rotate) trên canvas với lực cản quán tính mượt mà.
   - Quản lý giải phóng tài nguyên idempotent an toàn chống tràn bộ nhớ GPU.
5. `src/three/useThreeScene.ts`
   - Bổ sung cấu hình truyền cờ tương tác và xử lý pointer-events.
6. `src/pages/Home.tsx`
   - Thay đổi toàn diện cấu trúc giao diện sang bố cục mở HUD Aerospace 5 chương.
   - Khắc phục triệt để lỗi font tiếng Việt "Trần Văn Tuyên".
   - Bỏ toàn bộ các hộp modal xám đen đóng kín giữa màn hình.
7. `src/test/three/states.test.ts` & `src/test/three/SceneManager.test.ts`
   - Cập nhật và bổ sung các test cases kiểm thử logic toán học mới.

---

## 7. TIÊU CHUẨN ANTI-AI DESIGN & RÀO CẢN KỸ THUẬT

1. **Tuyệt đối cấm Gradient neon AI lòe loẹt:** Cấm hoàn toàn gradient tím-hồng-xanh `from-purple-500 to-pink-500`. Toàn bộ dải màu tuân thủ thẩm mỹ hàng không vũ trụ hiện đại: Nền không gian `#030305`, hợp kim titan xám tối, mạ vàng MLI chân thực, điểm nhấn đỏ gạch TLU `#B3361C`.
2. **Tuyệt đối cấm bo góc quá đà:** Không dùng `rounded-3xl` hay `rounded-2xl` trên các khối dữ liệu kỹ thuật. Chỉ dùng bo góc tinh tế `rounded` (2px-4px) hoặc góc vuông kỹ thuật chuẩn HUD có đánh dấu góc `+`.
3. **Tuyệt đối cấm Emoji rác trong UI:** Cấm các emoji 🚀, ✨, 🔥, 💡 trên nút bấm hay tiêu đề. Thay thế 100% bằng ký hiệu kỹ thuật monospace `[01 // MISSION]`, `[SYS.STATUS // NOMINAL]`, `+`, `↗`, `↓` hoặc icon SVG sắc nét từ `react-icons/fi`.
4. **Không làm nghẽn hiệu năng (Zero-Asset Strategy):** Không tải file `.gltf` hay `.glb` dung lượng hàng chục megabyte từ bên thứ ba. Mô hình 3D được sinh hoàn toàn bằng thuật toán toán học trong thời gian thực, tải trang tức thì dưới 50ms, đạt 60 FPS ổn định trên cả máy tính và điện thoại.

---

## 8. DANH SÁCH MA TRẬN TEST (TEST MATRIX CHO `AUTO-TESTER`)

`auto-tester` BẮT BUỘC phải viết và đảm bảo vượt qua 100% các ca kiểm thử sau:

### 8.1 Unit Tests cho Procedural 3D & Math (`src/test/three/`)
- `procedural_satellite_create_and_dispose`: Tạo thực thể vệ tinh từ code toán học, xác minh đầy đủ các nhóm con (chassis, solar wings, dish antenna, orbital rings), sau đó gọi `dispose()` không ném lỗi và giải phóng toàn bộ geometries/materials.
- `starfield_particles_generation`: Xác minh starfield sinh đủ số lượng điểm sao theo tham số, tọa độ điểm nằm trong bán kính không gian hợp lệ, không chứa giá trị `NaN`.
- `satellite_drag_inertia_lerp`: Kiểm thử hàm tính toán góc quay delta chuột và giải thuật làm mượt quán tính (Lerp damping), đảm bảo góc quay bị kẹp (`clamped`) an toàn trên trục X.
- `states_5_chapters_camera_interpolation`: Kiểm thử 5 vị trí camera và target, xác nhận quá trình nội suy Hermite ở các mốc $p \in \{0, 0.25, 0.5, 0.75, 1.0\}$ luôn trả về vector hợp lệ, hữu hạn và không bị nhảy vọt đột ngột.
- `scene_manager_drag_events_lifecycle`: Khởi tạo `SceneManager` kèm bộ lắng nghe chuột/chạm, giả lập các thao tác kéo thả và giải phóng tài nguyên an toàn.

### 8.2 Component & Integration Tests (`src/test/pages/`)
- `home_vietnamese_font_title_clean`: Kiểm tra tiêu đề chính render chính xác chuỗi `Trần Văn Tuyên` với class sans-serif, không chứa class `font-serif`.
- `home_open_hud_layout_no_suffocating_box`: Xác minh trang Home không còn chứa class hộp modal kín (`bg-white/95 dark:bg-zinc-950/95 max-w-2xl p-6 sm:p-8 rounded border`), thay vào đó là cấu trúc HUD thoáng đạt.
- `home_telemetry_elements_render`: Kiểm tra sự hiện diện của các thẻ kỹ thuật `[01 // MISSION BRIEF]`, `[SYS.STATUS // NOMINAL]`, tọa độ `21.004° N, 105.828° E` và liên kết điều hướng a11y.
- `home_render_mode_switch_interactive`: Kiểm thử nút chuyển đổi "Xem bản tĩnh / Bật hiệu ứng 3D" hoạt động chuẩn xác, lưu trạng thái vào `localStorage`.

---

**XÁC NHẬN CHUYỂN GIAO:** Tài liệu đã hoàn thành. Chuyển giao ngay cho `senior-dev` để tiến hành lập trình toàn bộ mã nguồn.
