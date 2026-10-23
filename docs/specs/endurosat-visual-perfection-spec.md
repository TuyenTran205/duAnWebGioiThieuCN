# ĐẶC TẢ KỸ THUẬT: ENDUROSAT VISUAL PERFECTION & ANTI-AI 3D SCROLLYTELLING
**Tài liệu:** `docs/specs/endurosat-visual-perfection-spec.md`  
**Dự án:** `portfolio-web` (Trần Văn Tuyên — IT Portfolio & Resources)  
**Tác giả:** Product Architect & UX Specifier (`ba-spec`)  
**Tham chiếu chuẩn thiết kế:** [EnduroSat Space Services](https://www.endurosat.com/space-service/) | Chuẩn giao diện trang lớn Linear / Stripe / Vercel  
**Trạng thái:** Hoàn thành — Sẵn sàng chuyển giao cho `senior-dev`  
**Phiên bản:** 3.0.0  

---

## 1. TỔNG QUAN & PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Người dùng phản hồi trực tiếp kèm ảnh chụp thực tế tại `http://localhost:5173`:
> *"hiện tại lỗi tùm lum, màu sắc, rồi chữ đè chữ, di chuyển mượt hơn nhưng vẫn không ưng được tôi muốn làm như trang web thật"*

Qua quá trình rà soát mã nguồn hình học 3D và bố cục DOM, đội ngũ kiến trúc đã xác định chính xác 4 nhóm lỗi cốt tử phá hỏng trải nghiệm người dùng:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ KHẢO SÁT LỖI GIAO DIỆN HIỆN TRẠNG                                                           │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. DẢI TRẮNG RÁCH MÉP & SƯƠNG MÙ CẮT ĐÔI MÀN HÌNH:                                          │
│    - Dải gradient 'bg-linear-to-r from-zinc-50/90' cắt thô ngang 50% màn hình.            │
│    - Canvas WebGL có 'alpha: true' làm lộ màu nền xám nhạt '#F8F9FA' của Layout.            │
│    - Thiếu nền Deep Space thuần nhất khiến các vì sao và ánh sáng 3D bị hòa trộn đục ngầu.   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. LỖI CHỮ ĐÈ CHỮ (TEXT & HUD COLLISION):                                                   │
│    - Các hộp HUD leader line có 'side: left' được tính tọa độ endX = w * 0.32 (300-450px).  │
│    - Cột văn bản giới thiệu nằm từ lề trái đến 600px.                                       │
│    - Hai khối chữ giao nhau 100%, hộp viễn trắc đè thẳng lên tiêu đề 'Trần Văn Tuyên'.      │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. VỆ TINH 3D BỊ CHÌM, KHUẤT VÀ NẰM SAI VỊ TRÍ:                                             │
│    - Camera nhìn lệch sang phải (target.x = 1.2) trong khi vật thể đặt tại x = 0.           │
│    - Kết quả: Vệ tinh bị chiếu về nửa BÊN TRÁI màn hình, lọt thỏm ngay sau lưng khối chữ!   │
│    - Thiếu Rim Lighting sắc nét làm nổi bật vật liệu titan và màng vàng phản quang MLI.     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. CỤM NÚT ĐIỀU HƯỚNG GÓC PHẢI DƯỚI RỐI MẮT:                                                │
│    - Nút bấm to dày, icon xoay vô tận gây xao nhãng, che khuất tầm nhìn mô hình 3D.         │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. CHUẨN THIẾT KẾ ENDUROSAT & ANTI-AI DESIGN

Tuân thủ nghiêm ngặt chuẩn mực thiết kế cao cấp của các tập đoàn công nghệ vũ trụ và phần mềm hàng đầu (EnduroSat, Linear, Vercel, Stripe):

### 2.1 Bố cục Bất đối xứng Điện ảnh (Cinematic Asymmetric Split Layout)
- **Left Stage (0% - 46% Viewport Width):** Cột nội dung văn bản mở, thoáng đạt. Không sử dụng khung hộp đóng kín màu xám che màn hình. Văn bản hiển thị trực tiếp với độ tương phản chuẩn WCAG AAA.
- **Center Safe Gutter (46% - 54% Viewport Width):** Vùng đệm ranh giới an toàn tuyệt đối. Không đặt văn bản, không đặt nhãn HUD.
- **Right Stage (54% - 100% Viewport Width):** Không gian hiển thị Vệ tinh 3D Hero. Tâm vệ tinh được căn chỉnh quang học rơi vào khoảng **64% - 72% chiều rộng màn hình**.

### 2.2 Quy tắc Nền Full-Bleed Vũ trụ (Zero-Bleed Deep Space)
- Vùng trải nghiệm 3D Scrollytelling tại `Home.tsx` phải có nền không gian sâu thẳm độc lập (`#030305` — Deep Space Vacuum).
- WebGL Renderer được cấu hình `clearColor: 0x030305, alpha: false` (hoặc nền canvas bọc ngoài màu đen thuần `#030305`), triệt tiêu hoàn toàn hiện tượng dải trắng hay rách mép do màu theme sáng của `Layout.tsx` rò rỉ.
- Loại bỏ hoàn toàn dải sương mù đục ngầu `bg-linear-to-r from-zinc-50/90...`. Thay thế bằng kỹ thuật mặt nạ bảo vệ tương phản (Contrast Shield Mask) siêu mỏng, chuyển sắc tinh tế từ `rgba(3, 3, 5, 0.75)` sang `transparent` chỉ giới hạn trong phạm vi cột văn bản.

### 2.3 Nguyên tắc Anti-AI nghiêm ngặt
- **Không màu Gradient Neon:** Cấm màu tím, hồng, xanh neon kiểu AI. Bảng màu tuân theo chuẩn kỹ thuật hàng không: Đen chân không (`#030305`), Trắng bạc titan (`#F8FAFC`), Xám kim loại (`#71717A`), Vàng bọc cách nhiệt MLI (`#D4AF37`), Xanh thẫm quang điện (`#0A192F`), Điểm nhấn đỏ đất TLU (`#B3361C`).
- **Viền siêu mỏng Hairline:** Đường gióng kỹ thuật và viền thẻ HUD dày đúng `0.5px` đến `1px` sắc bén (`border-zinc-800/80` hoặc `rgba(255,255,255,0.12)`).
- **Không bo góc lố:** Bo góc `rounded-none` hoặc tối đa `rounded-sm (2px)` mang tính chất khí tài quân sự / hàng không vũ trụ.
- **Typography kỹ thuật số:** 100% chữ số viễn trắc (tốc độ, độ cao, tọa độ) sử dụng `tabular-nums` trên font `font-mono` (`JetBrains Mono` / `SF Mono`).

---

## 3. GIẢI THUẬT TOÁN HỌC CHỐNG VA CHẠM LEADER LINES (COLLISION-FREE TELEMETRY HUD)

### 3.1 Mô hình phân vùng màn hình (Screen Space Zoning)

```
0px                  w * 0.46               w * 0.54                      w (Viewport Width)
┌───────────────────────┬──────────────────────┬───────────────────────────────┐
│     LEFT STAGE        │   SAFE BUFFER ZONE   │         RIGHT STAGE           │
│  (VĂN BẢN NỘI DUNG)   │     (VÙNG CẤM HUD)   │      (VỆ TINH 3D HERO)        │
│                       │                      │                               │
│ - Tên: Trần Văn Tuyên │    KHÔNG CÓ HUD      │    [+] COMMUNICATION LINK     │
│ - Đại học Thủy Lợi   │    KHÔNG CÓ TEXT     │        2.24 GHz S-BAND        │
│ - Kỹ năng / Dự án     │                      │               │               │
│ - Nút điều hướng      │  Ranh giới an toàn   │        ───────┘ Dogleg        │
│                       │  ngăn va chạm        │               ● SUBSYS_ANTENNA│
│                       │                      │        [VỆ TINH 3D TOÀ THÀNH] │
└───────────────────────┴──────────────────────┴───────────────────────────────┘
```

### 3.2 Quy tắc định tuyến đường gióng và nhãn HUD
1. **Quy tắc 1: Cấm hoàn toàn nhãn HUD nằm ở Nửa Trái Màn Hình Desktop (`side === 'left'` bị cấm trôi vào Left Stage):**
   - Mọi Leader Anchor Point thuộc Vệ tinh được neo và định vị ở **Nửa Phải Màn Hình**.
   - Điểm kết thúc của đường gióng kỹ thuật (`endX`) đối với các nhãn HUD nằm bên phải được ghim vào khoảng không gian mở từ `w * 0.72` đến `w * 0.94`.
2. **Quy tắc 2: Xử lý các phân hệ bên trái của Vệ tinh (như Cánh pin mặt trời trái - Port Solar Wing):**
   - Không được bắn đường gióng sang tận lề trái màn hình.
   - Đường gióng sang trái của vệ tinh phải kết thúc trong **Khoang Đệm Kỹ Thuật (Technical Stash Pocket)** nằm giữa mép phải cột văn bản (`w * 0.48`) và thân vệ tinh (`proj.x - 20px`), HOẶC định tuyến thẳng đứng lên phía trên/dưới góc nhìn của vệ tinh (`elbowY = proj.y - 60px`, `endX = proj.x + 80px`).
   - Tọa độ `endX` của bất kỳ đường gióng nào hướng về bên trái phải thỏa mãn điều kiện toán học:
     $$\text{endX} \ge \max(w \times 0.48, \text{textColumnRightEdge} + 24\text{px})$$
   - Nếu điều kiện trên không thỏa mãn do màn hình hẹp, tự động lật `side = 'right'` để chuyển toàn bộ nhãn HUD sang nửa phải vệ tinh.
3. **Quy tắc 3: Ngưỡng thích ứng Màn hình Di động (Mobile Viewport < 768px):**
   - Trên thiết bị di động, vệ tinh được đẩy xuống 45% phía dưới màn hình, chữ ở 55% phía trên.
   - Toàn bộ Leader Lines chuyển sang chế độ hiển thị tối giản (tối đa 1 nhãn trọng tâm nhất cho từng chương, đường gióng ngắn $\le 60\text{px}$) hoặc ẩn đường gióng để ưu tiên trải nghiệm cuộn mượt mà không rối mắt.

### 3.3 Danh mục Anchor Points Chuẩn Hóa (`DEFAULT_LEADER_ANCHORS`)

| Chapter | Subsystem ID | Label Title | Label Value | Side | Chiếu màn hình |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Ch. 0: Khởi đầu** | `SUBSYS_ANTENNA` | `S-BAND TELEMETRY` | `2.24 GHz // CARRIER LOCK` | `right` | Nửa phải, góc trên |
| **Ch. 0: Khởi đầu** | `SUBSYS_AVIONICS` | `MISSION OBC` | `NOMINAL // RISC-V CORE` | `right` | Nửa phải, ngang thân |
| **Ch. 1: Nền tảng** | `SUBSYS_AVIONICS` | `CORE ARCHITECTURE` | `DISTRIBUTED // FAULT-TOLERANT` | `right` | Nửa phải, ngang thân |
| **Ch. 1: Nền tảng** | `SUBSYS_SENSOR` | `OPTICAL SENSOR` | `HIGH-RES MULTISPECTRAL // TLU` | `right` | Nửa phải, góc dưới |
| **Ch. 2: Dự án** | `SUBSYS_SOLAR_RIGHT`| `ELECTRICAL POWER` | `28.4 VDC BUS // 98.4% EFF` | `right` | Mút cánh pin phải |
| **Ch. 2: Dự án** | `SUBSYS_SOLAR_LEFT` | `GAAS SOLAR ARRAY` | `TRIPLE-JUNCTION // 60W PEAK` | `right` | Hướng lên trên/phải |
| **Ch. 3: Tài liệu** | `SUBSYS_ANTENNA` | `KNOWLEDGE UPLINK` | `100 MBPS DOWNLINK // TLU FEED` | `right` | Chảo ăng-ten trên |
| **Ch. 3: Tài liệu** | `SUBSYS_PROPULSION` | `ORBIT CONTROL` | `MICRO-ION THRUSTER // 4-AXIS` | `right` | Miệng phụt đáy phải |
| **Ch. 4: Liên hệ** | `SUBSYS_ANTENNA` | `GROUND DOWNLINK` | `ACTIVE // TLU HANOI (21.004° N)` | `right` | Chảo ăng-ten trên |
| **Ch. 4: Liên hệ** | `SUBSYS_AVIONICS` | `DISPATCH READY` | `STANDBY // LISTENING FOR COMMS`| `right` | Nửa phải, ngang thân |

---

## 4. NÂNG CẤP ĐỒ HỌA 3D VỆ TINH HERO & ÁNH SÁNG ĐIỆN ẢNH (ENDUROSAT REALISM)

### 4.1 Hiệu chỉnh Camera & Định vị Vệ tinh ở Nửa Phải Màn hình
Hiện tượng vệ tinh bị chữ đè lên trong phiên bản cũ là do Camera nhìn lệch sang phải (`cameraTarget.x = 1.2`), dẫn đến vật thể ở gốc `(0, 0, 0)` bị đẩy về nửa trái màn hình!

**Bảng Tọa độ Điện ảnh Mới (EnduroSat Viewport Rig):**

| Chương | `cameraPosition` $(X, Y, Z)$ | `cameraTarget` $(X, Y, Z)$ | Hiệu ứng thị giác thị sai |
| :--- | :--- | :--- | :--- |
| **Chương 1** | `(1.6, 0.4, 7.5)` | `(1.6, 0.0, 0.0)` | Vệ tinh nằm chính xác tại **68% chiều rộng màn hình**, góc nhìn toàn cảnh oai vệ |
| **Chương 2** | `(2.2, 0.6, 4.6)` | `(1.4, 0.1, 0.0)` | Zoom cận cảnh khối thân Avionics và cảm biến quang học |
| **Chương 3** | `(0.8, 0.2, 5.8)` | `(1.5, 0.0, 0.0)` | Góc nhìn xiên tôn vinh sải cánh pin mặt trời quang điện vươn dài |
| **Chương 4** | `(1.8, 2.2, 5.2)` | `(1.6, 0.4, 0.0)` | Góc nhìn từ trên cao xuống chảo ăng-ten viễn thông cao tần |
| **Chương 5** | `(1.4, 1.2, 7.8)` | `(1.4, -0.1, 0.0)` | Toàn cảnh vệ tinh quay mặt về Trái Đất sẵn sàng kết nối |

*Lưu ý Responsive:* Trên màn hình Desktop ($\ge 1024\text{px}$), vị trí vệ tinh được định vị ổn định ở nửa phải ($X \approx 1.5 - 1.8$). Khi màn hình di động ($< 768\text{px}$), camera tự động lùi về trung tâm `cameraPosition.x = 0`, `cameraTarget.x = 0`, `cameraPosition.y = -0.8`, `cameraPosition.z += 2.2` để vệ tinh nằm gọn ở nửa dưới màn hình mà không che lấp chữ phía trên.

### 4.2 Hệ thống Chiếu sáng Không gian 4 Nguồn (4-Point Space Lighting)
Thay thế hệ thống đèn phẳng đơn điệu bằng 4 nguồn sáng không gian chuẩn vật lý:
1. **Key Sun Light (Mặt trời chiếu trực tiếp):**
   - Loại: `THREE.DirectionalLight(0xFFFAF0, 4.0)`
   - Tọa độ: `(12, 14, 10)` — Chiếu chéo góc tạo bóng đổ sắc bén và điểm lóa chói chang trên kim loại.
2. **Earth Albedo Fill Light (Phản quang khí quyển Trái Đất):**
   - Loại: `THREE.DirectionalLight(0x1D4ED8, 1.4)`
   - Tọa độ: `(-8, -10, -5)` — Ánh sáng xanh lam thẫm dịu mát hắt từ bên dưới mô phỏng phản xạ bề mặt đại dương Trái Đất.
3. **High-Contrast Rim Light (Đèn viền kim loại đối lập):**
   - Loại: `THREE.DirectionalLight(0xE0F2FE, 3.5)`
   - Tọa độ: `(-12, 6, -10)` — Chiếu ngược từ phía sau lưng vệ tinh, tạo đường viền sáng bạc sắc sảo (Edge Silhouette) tách biệt hoàn toàn mô hình khỏi nền đen vô tận của vũ trụ.
4. **Deep Space Ambient & IBL:**
   - Cường độ: `0.35`, màu `#0B1120`. Tạo độ sâu cho các vùng khuất sáng mà không làm biến dạng màu sắc vật liệu.

### 4.3 Tinh chỉnh Vật liệu PBR Mô hình Vệ tinh
- **Màng bọc cách nhiệt Mạ vàng (Gold MLI Foil Blanket):**
  - Màu sắc: `#D4AF37`
  - `metalness: 0.94`, `roughness: 0.22`
  - Tích hợp thêm các mặt cắt đa giác hình học tạo nếp gấp quang học phản chiếu ánh mặt trời lấp lánh như vệ tinh thực thụ.
- **Khung chính Titanium:**
  - Màu sắc: `#1F242D`, `metalness: 0.88`, `roughness: 0.32`.
- **Cánh pin Mặt trời (Solar Cells):**
  - Màu nền: `#071326` (Xanh không gian sâu).
  - Lưới mạch nano quang điện: Màu xanh cyan `#38BDF8` viền hairline siêu mảnh `0.5px`, phản xạ bóng bẩy khi xoay.

---

## 5. TINH GỌN THANH ĐIỀU KHIỂN VI MÔ (AEROSPACE MICRO DOCK)

Thay thế cụm nút bấm to dày hiện tại ở góc phải dưới bằng **Thanh Trạng thái Viễn trắc Vi mô (Minimal Aerospace Micro Dock)**:
- **Kích thước & Bố cục:** Chiều cao thanh chỉ $32\text{px}$, viền hairline $0.5\text{px}$ (`border-zinc-800`), nền kính bán mờ `bg-zinc-950/85 backdrop-blur-md`.
- **Trạng thái hiển thị:**
  - Đèn tín hiệu xanh danh định nhỏ $4\text{px}$ nhấp nháy: `[SYS.3D // ACTIVE]`.
  - Nút bấm chuyển chế độ tĩnh (Static Mode) thiết kế phẳng, font chữ vi mô $10\text{px}$ monospace: `[RENDER: 3D DYNAMIC]` $\leftrightarrow$ `[RENDER: STATIC]`.
  - Chỉ dẫn tương tác xoay vệ tinh (`DRAG TO ROTATE 3D SATELLITE ↺`): Tự động hiển thị tinh tế trong 4 giây đầu tiên khi tải trang rồi tự mờ dần (Fade out to opacity 0.4), chỉ sáng lên khi người dùng di chuột tới, không gây nhiễu loạn thị giác.

---

## 6. DANH MỤC TỆP TIN CẦN CẬP NHẬT & KIẾN TRÚC MÃ NGUỒN

| STT | Đường dẫn tệp tin | Trách nhiệm kiến trúc |
| :--- | :--- | :--- |
| 1 | `src/components/public/PinnedScrollytelling.tsx` | - Xóa bỏ triệt để dải sương mù đục `bg-linear-to-r from-zinc-50/90...`.<br>- Bổ sung lớp che chắn tương phản chuyên dụng (Contrast Shield).<br>- Điều chỉnh giới hạn cột văn bản bên trái sang $0\% - 46\%$ viewport width.<br>- Đồng bộ lớp nền vũ trụ trong suốt với canvas WebGL. |
| 2 | `src/three/leaderLines.ts` | - Cập nhật `DEFAULT_LEADER_ANCHORS`: chuyển toàn bộ nhãn sang `side: 'right'` hoặc neo an toàn trên thân vệ tinh.<br>- Cập nhật hàm `calculateLeaderLines`: áp dụng thuật toán Safe-Zone Exclusion, cấm `endX` xâm phạm vào vùng văn bản bên trái ($X < \text{safeLeftBound}$).<br>- Đảm bảo tương thích ngược 100% với các test suite hiện tại. |
| 3 | `src/components/public/LeaderLinesOverlay.tsx` | - Định vị hộp HUD vi mô sắc nét, căn lề thông minh theo `side`.<br>- Tinh chỉnh kích thước hộp HUD theo chuẩn Anti-AI (hairline border $0.5\text{px}$, không shadow lòe loẹt, typography $9\text{px} - 10\text{px}$). |
| 4 | `src/three/states.ts` | - Cập nhật ma trận tọa độ `cameraPosition` và `cameraTarget` của 5 chương theo Bảng Tọa độ Điện ảnh Mới.<br>- Đảm bảo tâm vệ tinh luôn nằm ở $64\% - 72\%$ chiều rộng màn hình desktop. |
| 5 | `src/three/SceneManager.ts` | - Bổ sung nguồn sáng thứ 4 `Rim Light` công suất cao cho vật liệu phản quang kim loại.<br>- Cấu hình WebGL Renderer với màu nền Deep Space thuần `#030305`.<br>- Tinh chỉnh độ nhạy xoay chuột mượt mà hơn. |
| 6 | `src/pages/Home.tsx` | - Tinh gọn cụm nút điều khiển góc phải dưới thành Minimal Aerospace Micro Dock.<br>- Đảm bảo canvas WebGL bao phủ toàn màn hình không có bất kỳ khoảng hở dải trắng nào. |
| 7 | `src/three/proceduralSatellite.ts` | - Nâng cấp vật liệu PBR mạ vàng MLI Foil và cánh pin mặt trời.<br>- Tinh chỉnh cấu trúc hình học sắc sảo hơn. |

---

## 7. TEST MATRIX NGHIỆM THU (DÀNH CHO AUTO-TESTER & QA-INSPECTOR)

Đội ngũ `auto-tester` và `qa-inspector` bắt buộc phải đối chiếu và kiểm thử 100% các tiêu chí dưới đây:

### 7.1 Unit & Mathematical Tests (`src/test/three/leaderLines.test.ts`)
- **TEST-LEADER-COLLISION-01:** Xác minh toàn bộ các điểm kết thúc `endX` của Leader Lines trong tất cả 5 chương đều nằm ngoài vùng cấm văn bản ($\text{endX} \ge \text{safeLeftThreshold}$ hoặc nằm bên phải tọa độ $X$ của thân vệ tinh).
- **TEST-LEADER-ROUTING-02:** Kiểm tra đường gióng Dogleg Elbow SVG path sinh ra đúng cú pháp `M sx sy L bx by L cx cy` với tọa độ hợp lệ, không có giá trị `NaN` hoặc tọa độ âm ngoài màn hình.
- **TEST-LEADER-VISIBILITY-03:** Đảm bảo khi cuộn qua các chương khác nhau, chỉ các nhãn thuộc chương hiện tại (và lân cận $\pm 0.5$) có `opacity > 0` và các nhãn không liên quan có `visible === false`.

### 7.2 Component & Integration Tests (`src/test/components/PinnedScrollytelling.test.tsx`)
- **TEST-UI-NO-WHITE-SEAM-01:** Kiểm tra không còn tồn tại class `from-zinc-50/90` hoặc bất kỳ dải gradient xám đục nào cắt đôi màn hình trong container của `PinnedScrollytelling`.
- **TEST-UI-LAYOUT-SPLIT-02:** Xác minh cột nội dung văn bản (5 chương) có class giới hạn độ rộng phù hợp (không chiếm toàn bộ màn hình, không đè lên vùng hiển thị vệ tinh 3D).
- **TEST-UI-HUD-RENDER-03:** Render `LeaderLinesOverlay` với các nhãn HUD mới, kiểm tra các nhãn hiển thị đúng định dạng monospace vi mô, có tiền tố `[+]` và không bị vỡ bố cục.

### 7.3 Visual & Functional QA Inspection
- **QA-VISUAL-01 (Màu sắc & Dải biên):** Trên cả chế độ Dark và Light, không xuất hiện dải trắng rách mép ở lề trái màn hình; không có mảng xám đục cắt đôi màn hình; nền chuyển tiếp không gian vũ trụ đen sâu `#030305` mượt mà.
- **QA-VISUAL-02 (Không va chạm chữ):** Toàn bộ tiêu đề "Trần Văn Tuyên", "Đại học Thủy Lợi", vai trò, giới thiệu và nút bấm ở nửa trái hoàn toàn sạch sẽ, không bị bất kỳ đường gióng hay hộp HUD nào đè lên.
- **QA-VISUAL-03 (Vị trí Vệ tinh):** Vệ tinh 3D hiển thị rõ nét, hoành tráng ở nửa phải màn hình (Right Hero Stage), vật liệu vàng MLI và titan sáng bóng dưới ánh sáng Rim Light sắc nét.
- **QA-VISUAL-04 (Micro Dock):** Cụm điều khiển góc phải dưới tinh tế, mỏng nhẹ, không che khuất mô hình 3D, thao tác bật/tắt 3D hoạt động hoàn hảo.
- **QA-REGRESSION-05:** 100% test suite hiện tại (`npm run test`) tiếp tục `PASSED`, không phát sinh cảnh báo typecheck (`npm run build`).

---
*Tài liệu đặc tả đã sẵn sàng. Chuyển giao toàn quyền thực thi cho `senior-dev`.*
