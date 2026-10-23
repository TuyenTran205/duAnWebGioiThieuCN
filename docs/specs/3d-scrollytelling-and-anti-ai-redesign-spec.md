# ĐẶC TẢ KỸ THUẬT: 3D SCROLLYTELLING & ANTI-AI REDESIGN
**Tài liệu:** `docs/specs/3d-scrollytelling-and-anti-ai-redesign-spec.md`  
**Giai đoạn:** Giai đoạn 3 (F4, F5), Giai đoạn 4 (Anti-AI Redesign) và Giai đoạn 5 (3D Scrollytelling F1) theo `docs/07-ROADMAP.md`  
**Tác giả:** Product Architect & UX Specifier (BA)  
**Trạng thái:** Hoàn thành — Sẵn sàng chuyển giao cho `senior-dev`  
**Phiên bản:** 1.0.0  

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KỸ THUẬT

### 1.1 Mục tiêu phạm vi
Đặc tả kỹ thuật này định nghĩa toàn diện việc chuyển đổi kiến trúc giao diện người dùng và trải nghiệm scrollytelling 3D cho toàn bộ dự án `portfolio-web`:
1. **Kiến trúc 3D Scrollytelling (`src/three/`):** Xây dựng module Three.js tự sinh hình học bằng mã toán học thuần túy (Procedural Geometry), biến đổi một mạng lưới điểm và đường nối (`Points` + `LineSegments`) xuyên suốt 5 chương câu chuyện. Tích hợp cơ chế phát hiện năng lực phần cứng thích ứng (`full` ~4000 điểm, `lite` ~800 điểm, `static` không WebGL), đo FPS thời gian thực, quản lý vòng đời giải phóng bộ nhớ idempotent an toàn tuyệt đối với React 19 `StrictMode`.
2. **Kiến trúc DOM Scrollytelling (`src/pages/Home.tsx`):** Phân tầng 2 lớp độc lập: Lớp nền Canvas WebGL cố định (`fixed inset-0 pointer-events-none z-0`) và Lớp nội dung DOM thuần túy trong suốt (`relative z-10`). Văn bản tiếng Việt biên tập chuẩn mực, có thể bôi đen, sao chép, tìm kiếm tự nhiên, hỗ trợ trợ năng bàn phím (Skip to Content a11y) và công tắc chuyển đổi chế độ "Bản 3D / Bản tĩnh".
3. **Loại bỏ triệt để Bootstrap và Hiện thực Anti-AI Design:** 
   - Gỡ bỏ hoàn toàn việc import `bootstrap/dist/css/bootstrap.min.css` và toàn bộ các component `react-bootstrap` khỏi toàn bộ codebase (`src/main.tsx`, `NavigationBar.tsx`, `Footer.tsx`, `Home.tsx`, `Portfolio.tsx`, `Resources.tsx`).
   - Kích hoạt Tailwind CSS v4 qua `@tailwindcss/vite` và `@import "tailwindcss";`, thiết lập hệ thống CSS token đồng bộ với `src/theme/tokens.ts` (màu gạch TLU `#B3361C`, nền ấm `#F8F9FA` / `#09090B`, viền mỏng phẳng 1px, bo góc 2–4px, cấm bóng đổ, cấm gradient neon, cấm emoji rác, cấm huy hiệu pastel theo chỉ số lặp vô nghĩa).
   - Tích hợp 2 tính năng đóng góp cộng đồng tương tác cao:
     - **F4 — Đóng góp tài liệu (`/resources`):** Form modal nộp tài liệu liên kết ngoài, kiểm tra honeypot, gọi RPC `submit_document` kèm xử lý giới hạn tần suất 20 lần/giờ.
     - **F5 — Sổ lưu bút Guestbook (`/portfolio` hoặc `/resources`):** Gửi lời nhắn, đánh giá sao, gắn kèm dự án, gọi RPC `submit_guestbook` và hiển thị danh sách lời nhắn đã được phê duyệt (`is_approved = true`).
4. **Chuẩn hóa Kiểm thử Tự động (Test Matrix):** Xây dựng ma trận kiểm thử bao phủ 100% các giải thuật toán học lerp 3D, module capability detection, date utility an toàn, service mutation RPC và validation form.

---

## 2. KHẢO SÁT HIỆN TRẠNG & RÀO CẢN KỸ THUẬT

### 2.1 Hiện trạng phụ thuộc và cấu hình
- **Framework & Runtime:** React 19.2.7, Vite 8.1.1, TypeScript ~6.0.2, React Router 7.18.1, Framer Motion 12.42.2, Supabase JS 2.110.9, Three.js 0.180.0.
- **Nợ kỹ thuật CSS & Thư viện UI:**
  - `src/main.tsx:6` đang import `bootstrap/dist/css/bootstrap.min.css` gây phình bundle CSS tĩnh (233 KB).
  - `src/index.css` chứa nhiều selector Bootstrap đè lấn (`.custom-navbar`, `.btn-primary`, `.badge-pastel`, gradient neon xanh-tím `#0073ea → #a25ddc`).
  - `package.json` đã có sẵn `@tailwindcss/vite: ^4.3.3` và `tailwindcss: ^4.3.3`, nhưng `vite.config.ts` chưa đăng ký plugin `@tailwindcss/vite`!
  - `ThemeContext.tsx:24` đang set thuộc tính `data-bs-theme` thay vì chuẩn `data-theme` được quy định trong tài liệu kiến trúc.

### 2.2 Rào cản vòng đời WebGL trong React 19 StrictMode
- React 19 ở chế độ phát triển (`StrictMode`) thực hiện mount → unmount → remount component effect để phát hiện rò rỉ tài nguyên.
- Nếu module khởi tạo Three.js không idempotent, context WebGL2 sẽ bị mất (`WEBGL_lose_context`), bộ nhớ GPU không được giải phóng, gây hiện tượng màn hình đen hoặc tăng vọt số lượng WebGL Contexts (trình duyệt chỉ cho phép tối đa 8–16 contexts trước khi tự động crash context cũ nhất).
- **Quy tắc giải phóng bắt buộc:** `renderer.dispose()`, `renderer.forceContextLoss()`, `geometry.dispose()`, `material.dispose()`, `cancelAnimationFrame(rafId)`, dọn sạch các listener `resize` và `visibilitychange`.

---

## 3. KIẾN TRÚC PHÂN TẦNG 3D SCROLLYTELLING (`src/three/`)

Hệ thống 3D được cô lập hoàn toàn trong thư mục `src/three/`, không phụ thuộc trực tiếp vào JSX của các component cha, giao tiếp với React duy nhất thông qua ref canvas và biến tiến độ cuộn `progress ∈ [0, 1]`.

```
src/three/
├── capability.ts       # Nhận diện phần cứng: 'full' | 'lite' | 'static', benchmark FPS, localStorage
├── states.ts           # Mảng tọa độ Float32Array 5 chương, camera target, thuật toán Lerp
├── SceneManager.ts     # Khởi tạo Three.js, Points, Lines, render loop, resize & disposal
└── useThreeScene.ts    # React Hook liên kết Canvas DOM với SceneManager & useScroll
```

### 3.1 Module `src/three/capability.ts`: Phân loại năng lực & Fallback thích ứng

#### Nguyên tắc phân loại
Hệ thống chia làm 3 cấp độ thực thi:
1. `full`: Dành cho máy tính / thiết bị đồ họa tốt. Render ~4000 hạt điểm (`Points`) và lưới liên kết (`LineSegments`).
2. `lite`: Dành cho thiết bị tầm trung hoặc mobile. Giảm số điểm xuống ~800 hạt, tắt bớt các đoạn đường nối phức tạp, giới hạn pixel ratio ≤ 1.25.
3. `static`: Tắt hoàn toàn WebGL canvas. Không khởi tạo Three.js, không tạo render loop. Trang hiển thị nền màu trung tính ấm theo token CSS.

#### Điều kiện rơi về chế độ `static`
Chế độ `static` được kích hoạt ngay lập tức khi thỏa mãn **bất kỳ một** điều kiện nào sau đây:
- Người dùng bấm nút "Xem bản tĩnh" (lưu giá trị `'static'` vào `localStorage.getItem('portfolio_render_mode')`).
- Hệ thống phát hiện thiết lập giảm chuyển động: `window.matchMedia('(prefers-reduced-motion: reduce)').matches === true`.
- Trình duyệt hoặc phần cứng không hỗ trợ WebGL: Khởi tạo thử canvas ảo `canvas.getContext('webgl2') || canvas.getContext('webgl')` trả về `null`.
- Đo FPS 2 giây đầu tiên trong quá trình chạy thực tế: nếu FPS trung bình rơi xuống dưới 28 FPS sau khi đã hạ xuống `lite`.

#### Định nghĩa TypeScript Interface & Hàm giải thuật
```typescript
// src/three/capability.ts

export type RenderMode = 'full' | 'lite' | 'static';

export interface DeviceCapability {
  mode: RenderMode;
  pointCount: number;
  maxPixelRatio: number;
  reason: string;
}

const STORAGE_KEY = 'portfolio_render_mode';

/**
 * Kiểm tra xem môi trường có hỗ trợ WebGL không (không rò rỉ context)
 */
export function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const supported = !!(gl && gl instanceof WebGLRenderingContext || (window.WebGL2RenderingContext && gl instanceof WebGL2RenderingContext));
    // Dọn dẹp context thử nghiệm
    if (gl) {
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();
    }
    return supported;
  } catch {
    return false;
  }
}

/**
 * Lấy tùy chọn ghi đè của người dùng từ localStorage an toàn
 */
export function getUserRenderOverride(): RenderMode | null {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val === 'full' || val === 'lite' || val === 'static') {
      return val;
    }
  } catch {
    // Tránh lỗi SecurityError trong iframe hoặc trình duyệt chặn storage
  }
  return null;
}

/**
 * Lưu ghi đè tùy chọn của người dùng
 */
export function setUserRenderOverride(mode: RenderMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Không ném lỗi
  }
}

/**
 * Đánh giá năng lực thiết bị ban đầu trước khi mount WebGL
 */
export function detectInitialCapability(): DeviceCapability {
  // 1. Kiểm tra ghi đè từ người dùng
  const userOverride = getUserRenderOverride();
  if (userOverride) {
    return {
      mode: userOverride,
      pointCount: userOverride === 'full' ? 4000 : userOverride === 'lite' ? 800 : 0,
      maxPixelRatio: userOverride === 'full' ? 1.5 : 1.0,
      reason: 'user_override',
    };
  }

  // 2. Kiểm tra giảm chuyển động (a11y)
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return {
      mode: 'static',
      pointCount: 0,
      maxPixelRatio: 1.0,
      reason: 'prefers_reduced_motion',
    };
  }

  // 3. Kiểm tra hỗ trợ WebGL
  if (!checkWebGLSupport()) {
    return {
      mode: 'static',
      pointCount: 0,
      maxPixelRatio: 1.0,
      reason: 'webgl_not_supported',
    };
  }

  // 4. Kiểm tra màn hình nhỏ / thiết bị di động
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || navigator.maxTouchPoints > 1);
  if (isMobile) {
    return {
      mode: 'lite',
      pointCount: 800,
      maxPixelRatio: 1.25,
      reason: 'mobile_device',
    };
  }

  // 5. Mặc định máy tính
  return {
    mode: 'full',
    pointCount: 4000,
    maxPixelRatio: 1.5,
    reason: 'desktop_default',
  };
}

/**
 * Class giám sát FPS trong 2 giây đầu tiên để tự động hạ cấp nếu giật lag
 */
export class FpsBenchmark {
  private frameCount = 0;
  private startTime = 0;
  private isFinished = false;

  constructor(
    private readonly onDowngrade: (targetMode: RenderMode) => void,
    private readonly currentMode: RenderMode
  ) {
    this.startTime = performance.now();
  }

  public tick(): void {
    if (this.isFinished || this.currentMode === 'static') return;

    this.frameCount++;
    const now = performance.now();
    const elapsed = now - this.startTime;

    // Đo trong 2000ms đầu tiên
    if (elapsed >= 2000) {
      this.isFinished = true;
      const fps = (this.frameCount * 1000) / elapsed;

      if (this.currentMode === 'full' && fps < 40) {
        this.onDowngrade('lite');
      } else if (this.currentMode === 'lite' && fps < 28) {
        this.onDowngrade('static');
      }
    }
  }
}
```

---

### 3.2 Module `src/three/states.ts`: Tính toán Tọa độ 5 Chương & Toán Nội suy Lerp

#### Cấu trúc 5 Chương của Cảnh 3D
Thay vì nạp các model 3D nặng nề (GLTF/GLB), toàn bộ cảnh sử dụng **một tập hợp điểm trừu tượng duy nhất** biến đổi trạng thái qua 5 chương nhằm minh họa hành trình chuyên môn của tác giả:

| Chương | Tiến độ `p` | Ý nghĩa chuyển tải | Trạng thái hình học đối tượng 3D | Vị trí Camera `(x, y, z)` |
|---|---|---|---|---|
| **Chương 1: Giới thiệu** | `[0.00, 0.20]` | Tôi là ai (Khởi đầu) | Mạng lưới các hạt điểm phân tán tự do, trôi bồng bềnh thưa thớt trong không gian hình hộp `[-6, 6] x [-4, 4] x [-4, 4]`. | `(0, 0, 10)` |
| **Chương 2: Năng lực** | `[0.20, 0.40]` | Tôi biết gì (Chuyên môn) | Các điểm gom tụ thành 3 cụm chuyên ngành rõ rệt: Ngôn ngữ lõi (Java/C++), Nền tảng ứng dụng (Flutter/Firebase), Trí tuệ nhân tạo & Web (Cloudflare Workers AI/React/TS). | `(2, 0.5, 9)` |
| **Chương 3: Dự án** | `[0.40, 0.60]` | Tôi đã làm gì (Sản phẩm) | Ba cụm tách biệt hẳn ra theo trục ngang ($X = -4, 0, +4$); camera trượt lướt qua các cụm, cụm tương ứng sáng lên. | `(0, 0, 8.5)` |
| **Chương 4: Tài liệu** | `[0.60, 0.80]` | Tôi chia sẻ gì (Tri thức) | Tất cả các điểm hội tụ vào một khối lưới ma trận hình hộp (Lattice Structure) ngăn nắp, thể hiện tri thức có tổ chức của kho tài liệu TLU. | `(3.5, 2.5, 7.5)` |
| **Chương 5: Liên hệ** | `[0.80, 1.00]` | Kết nối & Hợp tác | Đối tượng hạ thấp cao độ, lắng đọng xuống một mặt phẳng phẳng ($Y = -2.5$), giữ trạng thái tĩnh lặng, trang nhã. | `(0, 1, 6.5)` |

#### Giải thuật Toán học & Nội suy Tuyến tính
- Tọa độ điểm đích cho 5 chương được khởi tạo trước **một lần duy nhất** dưới dạng các mảng kiểu cố định `Float32Array(pointCount * 3)`.
- Khi cuộn trang, tiến độ $p \in [0, 1]$ được ánh xạ vào đoạn $[p_k, p_{k+1}]$ giữa hai chương liền kề.
- Tham số cục bộ:
  $$t = \frac{p - p_k}{p_{k+1} - p_k} \in [0, 1]$$
- Sử dụng hàm làm mịn mượt đường cong (Smoothstep / Hermite Interpolation) để triệt tiêu cảm giác giật cục tại ranh giới giữa các chương:
  $$t_{smooth} = t^2 \times (3 - 2t)$$
- Tọa độ tức thời của hạt thứ $i$ ($0 \le i < N$) tại mỗi trục:
  $$x_i(p) = (1 - t_{smooth}) \cdot x_{i, k} + t_{smooth} \cdot x_{i, k+1} + \delta x_{drift}(time)$$
  *Trong đó:* $\delta x_{drift} = \sin(time \cdot 0.5 + i) \times 0.04$ là dao động sóng vi mô tự nhiên (tự động tắt khi ở bản tĩnh hoặc khi tab ẩn).

#### Định nghĩa TypeScript Implementation
```typescript
// src/three/states.ts
import * as THREE from 'three';

export interface ChapterState {
  positions: Float32Array; // N * 3
  lineIndices: Uint16Array | Uint32Array;
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
}

export interface InterpolatedFrame {
  positions: Float32Array;
  cameraPosition: THREE.Vector3;
  cameraTarget: THREE.Vector3;
}

/**
 * Sinh tọa độ ngẫu nhiên có kiểm soát trong khối hộp
 */
function generateFloatingGrid(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  return pos;
}

/**
 * Sinh 3 cụm kỹ năng theo phân phối cụm cầu
 */
function generateSkillClusters(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  const clusterCenters = [
    new THREE.Vector3(-3.5, 0.5, 0),  // Cụm 1: Core Langs
    new THREE.Vector3(0, -0.5, 1),     // Cụm 2: Mobile / App
    new THREE.Vector3(3.5, 1.0, -0.5), // Cụm 3: AI & Web
  ];

  for (let i = 0; i < count; i++) {
    const center = clusterCenters[i % 3];
    // Bán kính ngẫu nhiên theo phân phối tiệm cận Gauss
    const radius = Math.pow(Math.random(), 2) * 1.8;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    pos[i * 3 + 0] = center.x + radius * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = center.y + radius * Math.sin(phi) * Math.sin(theta);
    pos[i * 3 + 2] = center.z + radius * Math.cos(phi);
  }
  return pos;
}

/**
 * Sinh 3 cụm dự án tách biệt trên trục ngang
 */
function generateProjectClusters(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  const centers = [
    new THREE.Vector3(-4.5, 0, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(4.5, 0, 0),
  ];

  for (let i = 0; i < count; i++) {
    const center = centers[i % 3];
    const r = Math.random() * 1.4;
    const angle = Math.random() * Math.PI * 2;

    pos[i * 3 + 0] = center.x + r * Math.cos(angle);
    pos[i * 3 + 1] = center.y + (Math.random() - 0.5) * 2.2;
    pos[i * 3 + 2] = center.z + r * Math.sin(angle);
  }
  return pos;
}

/**
 * Sinh khối ma trận tri thức Lattice (Khối hộp có trật tự)
 */
function generateLatticeBlock(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  const dimX = Math.round(Math.cbrt(count));
  const dimY = dimX;
  const dimZ = Math.ceil(count / (dimX * dimY));

  const stepX = 6 / dimX;
  const stepY = 4 / dimY;
  const stepZ = 4 / dimZ;

  let idx = 0;
  for (let x = 0; x < dimX && idx < count; x++) {
    for (let y = 0; y < dimY && idx < count; y++) {
      for (let z = 0; z < dimZ && idx < count; z++) {
        pos[idx * 3 + 0] = -3 + x * stepX + (Math.random() - 0.5) * 0.1;
        pos[idx * 3 + 1] = -2 + y * stepY + (Math.random() - 0.5) * 0.1;
        pos[idx * 3 + 2] = -2 + z * stepZ + (Math.random() - 0.5) * 0.1;
        idx++;
      }
    }
  }
  return pos;
}

/**
 * Sinh mặt phẳng tĩnh lắng đọng tại đáy Y = -2.5
 */
function generateGroundPlane(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3 + 0] = (Math.random() - 0.5) * 14;
    pos[i * 3 + 1] = -2.5 + (Math.random() - 0.5) * 0.2;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  return pos;
}

/**
 * Sinh danh sách đường nối (LineIndices) giữa các cặp điểm gần nhau
 */
function generateLineIndices(positions: Float32Array, count: number, maxLines: number): Uint16Array {
  const indices: number[] = [];
  const maxDistSq = 1.2 * 1.2;
  const stride = Math.max(1, Math.floor(count / 600));

  for (let i = 0; i < count && indices.length < maxLines * 2; i += stride) {
    const x1 = positions[i * 3 + 0];
    const y1 = positions[i * 3 + 1];
    const z1 = positions[i * 3 + 2];

    for (let j = i + 1; j < count && indices.length < maxLines * 2; j += stride) {
      const dx = x1 - positions[j * 3 + 0];
      const dy = y1 - positions[j * 3 + 1];
      const dz = z1 - positions[j * 3 + 2];
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < maxDistSq) {
        indices.push(i, j);
      }
    }
  }

  return new Uint16Array(indices);
}

/**
 * Khởi tạo dữ liệu 5 chương tính toán trước một lần duy nhất
 */
export function initializeChapterStates(count: number): ChapterState[] {
  const c1Pos = generateFloatingGrid(count);
  const c2Pos = generateSkillClusters(count);
  const c3Pos = generateProjectClusters(count);
  const c4Pos = generateLatticeBlock(count);
  const c5Pos = generateGroundPlane(count);

  const maxLines = Math.floor(count * 0.75);

  return [
    {
      positions: c1Pos,
      lineIndices: generateLineIndices(c1Pos, count, maxLines),
      cameraPosition: new THREE.Vector3(0, 0, 10),
      cameraTarget: new THREE.Vector3(0, 0, 0),
    },
    {
      positions: c2Pos,
      lineIndices: generateLineIndices(c2Pos, count, maxLines),
      cameraPosition: new THREE.Vector3(2, 0.5, 9),
      cameraTarget: new THREE.Vector3(0.5, 0, 0),
    },
    {
      positions: c3Pos,
      lineIndices: generateLineIndices(c3Pos, count, maxLines),
      cameraPosition: new THREE.Vector3(0, 0, 8.5),
      cameraTarget: new THREE.Vector3(0, 0, 0),
    },
    {
      positions: c4Pos,
      lineIndices: generateLineIndices(c4Pos, count, maxLines),
      cameraPosition: new THREE.Vector3(3.5, 2.5, 7.5),
      cameraTarget: new THREE.Vector3(0, 0, 0),
    },
    {
      positions: c5Pos,
      lineIndices: generateLineIndices(c5Pos, count, maxLines),
      cameraPosition: new THREE.Vector3(0, 1, 6.5),
      cameraTarget: new THREE.Vector3(0, -1.5, 0),
    },
  ];
}

/**
 * Hàm nội suy tuyến tính có làm mịn Hermite giữa các chương theo progress p
 */
export function interpolateStates(
  chapters: ChapterState[],
  progress: number,
  outputPositions: Float32Array,
  timeSec: number = 0
): { cameraPos: THREE.Vector3; cameraTarget: THREE.Vector3 } {
  const clampedP = Math.max(0, Math.min(1, progress));
  const chapterCount = chapters.length;
  const segmentLength = 1 / (chapterCount - 1);

  const rawIndex = clampedP / segmentLength;
  const currentChapter = Math.min(chapterCount - 2, Math.floor(rawIndex));
  const nextChapter = currentChapter + 1;

  const localT = (clampedP - currentChapter * segmentLength) / segmentLength;
  // Hermite smoothstep
  const smoothT = localT * localT * (3 - 2 * localT);

  const fromPos = chapters[currentChapter].positions;
  const toPos = chapters[nextChapter].positions;
  const pointCount = outputPositions.length / 3;

  const driftAmp = 0.035;

  for (let i = 0; i < pointCount; i++) {
    const i3 = i * 3;
    const wave = Math.sin(timeSec * 0.8 + i) * driftAmp;

    outputPositions[i3 + 0] = (1 - smoothT) * fromPos[i3 + 0] + smoothT * toPos[i3 + 0] + wave;
    outputPositions[i3 + 1] = (1 - smoothT) * fromPos[i3 + 1] + smoothT * toPos[i3 + 1] + (Math.cos(timeSec * 0.6 + i) * driftAmp);
    outputPositions[i3 + 2] = (1 - smoothT) * fromPos[i3 + 2] + smoothT * toPos[i3 + 2];
  }

  const cameraPos = new THREE.Vector3().lerpVectors(
    chapters[currentChapter].cameraPosition,
    chapters[nextChapter].cameraPosition,
    smoothT
  );

  const cameraTarget = new THREE.Vector3().lerpVectors(
    chapters[currentChapter].cameraTarget,
    chapters[nextChapter].cameraTarget,
    smoothT
  );

  return { cameraPos, cameraTarget };
}
```

---

### 3.3 Module `src/three/SceneManager.ts`: Khởi tạo, Render Loop, Tạm dừng & Dọn dẹp Idempotent

#### Trách nhiệm của SceneManager
- Khởi tạo `THREE.WebGLRenderer`, `THREE.PerspectiveCamera`, `THREE.Scene`.
- Sử dụng màu và chất liệu Anti-AI: Điểm màu gạch TLU `#B3361C` (hoặc ngà xám `#A1A1AA` tùy theme) và đường nối mờ đục tối giản `opacity: 0.15`.
- **Cấm hoàn toàn các shader bloom, phát sáng neon, glow hậu kỳ.**
- Lắng nghe sự kiện tab ẩn/hiện (`document.addEventListener('visibilitychange')`): Khi `document.hidden === true`, lập tức dừng `requestAnimationFrame` để tiết kiệm pin thiết bị người dùng.
- Vòng đời Idempotent: Giải phóng triệt để tài nguyên khi unmount.

#### Mã nguồn chi tiết
```typescript
// src/three/SceneManager.ts
import * as THREE from 'three';
import { initializeChapterStates, interpolateStates, type ChapterState } from './states';
import { FpsBenchmark, type RenderMode } from './capability';

export interface SceneManagerOptions {
  canvas: HTMLCanvasElement;
  pointCount: number;
  maxPixelRatio: number;
  isDarkTheme?: boolean;
  onDowngrade?: (mode: RenderMode) => void;
}

export class SceneManager {
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private pointsMesh: THREE.Points | null = null;
  private linesMesh: THREE.LineSegments | null = null;
  private pointsGeometry: THREE.BufferGeometry | null = null;
  private linesGeometry: THREE.BufferGeometry | null = null;

  private currentPositions: Float32Array;
  private chapterStates: ChapterState[] = [];
  private progress: number = 0;
  private rafId: number = 0;
  private isDestroyed: boolean = false;
  private isPaused: boolean = false;

  private benchmark: FpsBenchmark | null = null;
  private onResizeHandler: () => void;
  private onVisibilityChangeHandler: () => void;

  constructor(private readonly options: SceneManagerOptions) {
    const { canvas, pointCount, maxPixelRatio, isDarkTheme, onDowngrade } = options;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / Math.max(canvas.clientHeight, 1),
      0.1,
      100
    );

    // 1. Tạo WebGL Renderer an toàn
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // 2. Chuẩn bị buffer & states
    this.currentPositions = new Float32Array(pointCount * 3);
    this.chapterStates = initializeChapterStates(pointCount);

    // 3. Khởi tạo Points và Lines
    this.initMeshes(isDarkTheme);

    // 4. Benchmark FPS thích ứng
    if (onDowngrade) {
      this.benchmark = new FpsBenchmark(onDowngrade, pointCount > 1000 ? 'full' : 'lite');
    }

    // 5. Đăng ký listener an toàn
    this.onResizeHandler = this.handleResize.bind(this);
    this.onVisibilityChangeHandler = this.handleVisibilityChange.bind(this);
    window.addEventListener('resize', this.onResizeHandler);
    document.addEventListener('visibilitychange', this.onVisibilityChangeHandler);

    // 6. Bắt đầu vòng lặp render
    this.startLoop();
  }

  private initMeshes(isDarkTheme: boolean = false): void {
    const pointColor = isDarkTheme ? 0xD94B2E : 0xB3361C; // Accent TLU
    const lineColor = isDarkTheme ? 0x71717A : 0xA1A1AA;  // Muted Gray

    // Điểm (Points)
    this.pointsGeometry = new THREE.BufferGeometry();
    this.pointsGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.currentPositions, 3)
    );

    const pointsMaterial = new THREE.PointsMaterial({
      color: pointColor,
      size: 0.07,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
    });

    this.pointsMesh = new THREE.Points(this.pointsGeometry, pointsMaterial);
    this.scene.add(this.pointsMesh);

    // Đường nối (Lines) - lấy indices từ chương 1 làm khung ban đầu
    if (this.chapterStates.length > 0 && this.chapterStates[0].lineIndices.length > 0) {
      this.linesGeometry = new THREE.BufferGeometry();
      this.linesGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(this.currentPositions, 3)
      );
      this.linesGeometry.setIndex(new THREE.BufferAttribute(this.chapterStates[0].lineIndices, 1));

      const linesMaterial = new THREE.LineBasicMaterial({
        color: lineColor,
        transparent: true,
        opacity: 0.18,
      });

      this.linesMesh = new THREE.LineSegments(this.linesGeometry, linesMaterial);
      this.scene.add(this.linesMesh);
    }
  }

  public setProgress(p: number): void {
    this.progress = Math.max(0, Math.min(1, p));
  }

  public setTheme(isDark: boolean): void {
    if (this.pointsMesh) {
      (this.pointsMesh.material as THREE.PointsMaterial).color.setHex(isDark ? 0xD94B2E : 0xB3361C);
    }
    if (this.linesMesh) {
      (this.linesMesh.material as THREE.LineBasicMaterial).color.setHex(isDark ? 0x71717A : 0xA1A1AA);
    }
  }

  private handleResize(): void {
    if (this.isDestroyed || !this.renderer || !this.options.canvas) return;
    const width = this.options.canvas.clientWidth;
    const height = this.options.canvas.clientHeight;

    this.camera.aspect = width / Math.max(height, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private handleVisibilityChange(): void {
    if (document.hidden) {
      this.isPaused = true;
      cancelAnimationFrame(this.rafId);
    } else {
      if (this.isPaused && !this.isDestroyed) {
        this.isPaused = false;
        this.startLoop();
      }
    }
  }

  private startLoop(): void {
    const loop = (timestamp: number) => {
      if (this.isDestroyed || this.isPaused || !this.renderer) return;

      const timeSec = timestamp * 0.001;

      // 1. Tính toán nội suy vị trí hạt & camera
      const { cameraPos, cameraTarget } = interpolateStates(
        this.chapterStates,
        this.progress,
        this.currentPositions,
        timeSec
      );

      // 2. Cập nhật camera
      this.camera.position.copy(cameraPos);
      this.camera.lookAt(cameraTarget);

      // 3. Đẩy buffer tọa độ mới vào GPU
      if (this.pointsGeometry) {
        this.pointsGeometry.attributes.position.needsUpdate = true;
      }
      if (this.linesGeometry) {
        this.linesGeometry.attributes.position.needsUpdate = true;
      }

      // 4. Render
      this.renderer.render(this.scene, this.camera);

      // 5. Ghi nhận benchmark FPS 2 giây đầu
      if (this.benchmark) {
        this.benchmark.tick();
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  /**
   * Giải phóng bộ nhớ Idempotent tuyệt đối
   */
  public dispose(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    cancelAnimationFrame(this.rafId);

    window.removeEventListener('resize', this.onResizeHandler);
    document.removeEventListener('visibilitychange', this.onVisibilityChangeHandler);

    // Dọn dẹp Mesh, Geometry, Material
    if (this.pointsMesh) {
      this.scene.remove(this.pointsMesh);
      this.pointsGeometry?.dispose();
      (this.pointsMesh.material as THREE.Material).dispose();
      this.pointsMesh = null;
    }

    if (this.linesMesh) {
      this.scene.remove(this.linesMesh);
      this.linesGeometry?.dispose();
      (this.linesMesh.material as THREE.Material).dispose();
      this.linesMesh = null;
    }

    // Giải phóng Renderer và Context WebGL
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        // Không xóa canvas nếu do React quản lý, chỉ giải phóng context
      }
      this.renderer = null;
    }
  }
}
```

---

### 3.4 Hook `src/three/useThreeScene.ts`: Kết nối Framer Motion & React Canvas

Hook này đảm bảo việc khởi tạo và giải phóng `SceneManager` an toàn với React 19 `StrictMode`.

```typescript
// src/three/useThreeScene.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { useScroll } from 'framer-motion';
import { SceneManager } from './SceneManager';
import { detectInitialCapability, setUserRenderOverride, type RenderMode } from './capability';

export function useThreeScene(isDarkTheme: boolean = false) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const managerRef = useRef<SceneManager | null>(null);

  const [capability, setCapability] = useState(() => detectInitialCapability());
  const { scrollYProgress } = useScroll();

  // Đổi chế độ render có lưu vết
  const changeRenderMode = useCallback((newMode: RenderMode) => {
    setUserRenderOverride(newMode);
    setCapability(detectInitialCapability());
  }, []);

  // Lắng nghe cuộn từ Framer Motion và cập nhật SceneManager
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latestProgress) => {
      if (managerRef.current) {
        managerRef.current.setProgress(latestProgress);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  // Cập nhật Theme khi đổi sáng/tối
  useEffect(() => {
    if (managerRef.current) {
      managerRef.current.setTheme(isDarkTheme);
    }
  }, [isDarkTheme]);

  // Vòng đời SceneManager
  useEffect(() => {
    if (capability.mode === 'static' || !canvasRef.current) {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
      return;
    }

    // Khởi tạo Scene
    const manager = new SceneManager({
      canvas: canvasRef.current,
      pointCount: capability.pointCount,
      maxPixelRatio: capability.maxPixelRatio,
      isDarkTheme,
      onDowngrade: (downgradeMode) => {
        changeRenderMode(downgradeMode);
      },
    });

    managerRef.current = manager;

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, [capability.mode, capability.pointCount, capability.maxPixelRatio, changeRenderMode]);

  return {
    canvasRef,
    renderMode: capability.mode,
    changeRenderMode,
  };
}
```

---

## 4. KIẾN TRÚC DOM SCROLLYTELLING TẠI `src/pages/Home.tsx`

### 4.1 Cấu trúc 2 Layer Chồng nhau
Tuân thủ nguyên tắc: Canvas chỉ vẽ đối tượng nền trừu tượng trang trí (`aria-hidden="true"`), toàn bộ câu chuyện và nội dung kỹ thuật nằm 100% trong DOM chuẩn.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CẤU TRÚC LAYER TRANG CHỦ                        │
│                                                                        │
│   z-index 0: <canvas ref={canvasRef}                                  │
│              className="fixed inset-0 w-full h-full                   │
│                         pointer-events-none z-0" aria-hidden="true" /> │
│                                                                        │
│   z-index 10: <main id="main-content" className="relative z-10 ...">   │
│      ├── Chương 1: Giới thiệu (min-h-screen)                           │
│      ├── Chương 2: Kỹ năng chuyên môn (min-h-screen)                   │
│      ├── Chương 3: Dự án tiêu biểu (min-h-screen)                      │
│      ├── Chương 4: Kho tài liệu đại học (min-h-screen)                 │
│      └── Chương 5: Kết nối & Sổ lưu bút (min-h-screen)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Chi tiết 5 Chương Nội dung Chuẩn Biên tập Kỹ thuật (Editorial Vietnamese)

Toàn bộ nội dung giao diện được viết bằng giọng văn trung thực, có quan điểm rõ ràng, loại bỏ hoàn toàn các câu sáo rỗng ("Welcome to my space", "Featured projects", "A showcase of..."):

1. **Chương 1 — Giới thiệu:**
   - Tiêu đề chính: `Trần Văn Tuyên` (Font Newsreader hoặc Serif có dấu tiếng Việt hoàn chỉnh).
   - Định danh: `Sinh viên Công nghệ Thông tin — Đại học Thủy Lợi (TLU)`.
   - Lời ngỏ: *"Định hướng trở thành Kỹ sư phần mềm và Chuyên viên phân tích nghiệp vụ (BA). Yêu thích việc xây dựng các hệ thống web tinh gọn, ứng dụng di động thực dụng và khai thác các mô hình trí tuệ nhân tạo trên Cloudflare Workers."*
   - Nút hành động: "Xem dự án đã thực hiện" (cuộn tới Chương 3) và "Tra cứu tài liệu TLU" (dẫn tới `/resources`).
2. **Chương 2 — Năng lực chuyên môn:**
   - Tiêu đề: `Nền tảng & Kỹ năng kỹ thuật`.
   - Trình bày dạng danh sách phẳng có đường kẻ phân cách 1px, không dùng huy hiệu pastel theo chỉ số lặp:
     - *Ngôn ngữ & Nền tảng lõi:* Java, C++, TypeScript, SQL Postgres.
     - *Ứng dụng & Giao diện:* React, Tailwind CSS, Flutter, Firebase.
     - *Điện toán biên & Trí tuệ nhân tạo:* Cloudflare Workers AI, Supabase Edge/RPC.
3. **Chương 3 — Dự án chọn lọc:**
   - Tiêu đề: `Dự án & Sản phẩm thực chiến`.
   - Trích xuất 3 dự án tiêu biểu từ database (qua `projectService.getProjects()`):
     - Tiêu đề dự án thật, tóm tắt bài toán kỹ thuật giải quyết, công nghệ sử dụng (danh sách text phân cách bởi dấu chấm giữa `·`).
     - Liên kết mã nguồn GitHub và bản Demo trực tiếp (nếu có `#` hiển thị nhãn "Chưa công khai" thay vì nút chết).
   - Nút dẫn sang trang đầy đủ: "Xem toàn bộ dự án tại Portfolio →".
4. **Chương 4 — Đóng góp tri thức & Tài liệu học tập:**
   - Tiêu đề: `Kho tài liệu sinh viên TLU`.
   - Tóm tắt: *"Tổng hợp giáo trình, đề cương ôn tập, slide bài giảng và mã nguồn bài tập lớn thuộc 4 khối học phần CNTT tại Đại học Thủy Lợi. Được phân loại ngăn nắp và chia sẻ phi lợi nhuận cho cộng đồng sinh viên."*
   - Thống kê ngắn gọn và liên kết chuyển trang: "Truy cập kho tài liệu chuyên sâu →".
5. **Chương 5 — Kết nối & Thông tin liên hệ:**
   - Tiêu đề: `Liên hệ & Hợp tác`.
   - Dữ liệu động từ `profileService.getProfile()` (SĐT, Email, GitHub, LinkedIn, Facebook). Tuyệt đối không hardcode.
   - Nút hành động: "Gửi lời nhắn tại Sổ lưu bút" và sao chép nhanh email.

### 4.3 Trợ năng Tiếp cận (a11y) & Bộ chuyển đổi Bản tĩnh
- **Skip to Content:** Đầu trang có thẻ liên kết:
  ```html
  <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-accent text-white rounded text-sm font-medium">
    Bỏ qua hiệu ứng tới nội dung chính
  </a>
  ```
- **Nút chuyển đổi chế độ hiển thị:** Đặt cố định ở góc dưới bên phải hoặc thanh điều hướng:
  ```html
  <button onClick={() => changeRenderMode(renderMode === 'static' ? 'full' : 'static')} className="...">
    {renderMode === 'static' ? 'Bật hiệu ứng 3D' : 'Xem bản tĩnh'}
  </button>
  ```
- **Bản tĩnh:** Khi `renderMode === 'static'`, canvas hoàn toàn không xuất hiện trong DOM, các chương hiển thị trên nền ấm sạch sẽ, đảm bảo đạt điểm số Lighthouse Accessibility ≥ 98.

---

## 5. LOẠI BỎ TOÀN BỘ BOOTSTRAP & REDESIGN ANTI-AI

Tuân thủ nghiêm ngặt tinh thần của `docs/05-DESIGN-SYSTEM.md`: Giao diện như một ấn phẩm kỹ thuật được biên tập kỹ lưỡng, sắc sảo, tối giản và có chủ đích.

### 5.1 Cấu hình Tailwind v4 & Hệ thống Tokens (`src/index.css`)

#### Kích hoạt `@tailwindcss/vite`
Tệp `vite.config.ts` bắt buộc bổ sung plugin:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

#### Tệp `src/index.css` mới
Xóa bỏ hoàn toàn toàn bộ nội dung cũ của Bootstrap. Thay thế bằng cấu hình Tailwind v4 chuẩn token:
```css
@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

@theme {
  --color-accent: #B3361C;
  --color-accent-hover: #962D17;
  --color-accent-dark: #D94B2E;

  --color-bg-light: #F8F9FA;
  --color-bg-dark: #09090B;

  --color-surface-light: #FFFFFF;
  --color-surface-dark: #121215;

  --color-surface-subtle-light: #F1F3F5;
  --color-surface-subtle-dark: #1C1C20;

  --color-ink-light: #18181B;
  --color-ink-dark: #F4F4F5;

  --color-ink-muted-light: #71717A;
  --color-ink-muted-dark: #A1A1AA;

  --color-border-light: #E4E4E7;
  --color-border-dark: #27272A;

  --color-border-hover-light: #A1A1AA;
  --color-border-hover-dark: #3F3F46;

  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif: 'Newsreader', Georgia, Cambria, 'Times New Roman', serif;
}

/* Base Resets */
:root {
  color-scheme: light;
}

[data-theme="dark"] {
  color-scheme: dark;
}

body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  font-family: var(--font-sans);
  background-color: var(--color-bg-light);
  color: var(--color-ink-light);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

[data-theme="dark"] body {
  background-color: var(--color-bg-dark);
  color: var(--color-ink-dark);
}

/* Anti-AI Design Resets: Cấm gradient chữ, cấm box shadow mờ */
h1, h2, h3, h4, h5, h6 {
  font-feature-settings: "cv02", "cv03", "cv04", "cv11";
  letter-spacing: -0.02em;
}
```

### 5.2 Xóa bỏ hoàn toàn Bootstrap và `react-bootstrap`
1. Tại `src/main.tsx`: Xóa dòng `import 'bootstrap/dist/css/bootstrap.min.css';`.
2. Tại `src/components/NavigationBar.tsx`: Viết lại 100% bằng thẻ `<nav>`, `<header>` và Tailwind CSS, không dùng bất kỳ component nào từ `react-bootstrap`.
3. Tại `src/components/Footer.tsx`: Viết lại 100% bằng Tailwind CSS.
4. Tại `src/pages/Home.tsx`, `Portfolio.tsx`, `Resources.tsx`: Xóa sạch import `Container`, `Row`, `Col`, `Card`, `Badge`, `Spinner`, `Alert`, `Table`, `Form`, `Button` từ `react-bootstrap`.

### 5.3 Redesign `NavigationBar.tsx` & `Footer.tsx`
- **NavigationBar:**
  - Cố định trên cùng: `sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm`.
  - Thương hiệu bên trái: `Trần Văn Tuyên` (Font SemiBold, 15px).
  - Điều hướng bên phải: `Trang chủ`, `Dự án`, `Kho tài liệu`, nút gạt sáng/tối tối giản (`FiSun` / `FiMoon`), và link nhỏ ẩn danh `Quản trị` (`opacity-30 hover:opacity-100`).
  - Hỗ trợ menu mobile toggle tinh gọn, viền kẻ 1px, không đổ bóng.
- **Footer:**
  - Chân trang viền kẻ mỏng trên: `border-t border-zinc-200 dark:border-zinc-800 py-6 text-xs text-zinc-500 dark:text-zinc-400`.
  - Bản quyền rõ ràng: `© 2026 Trần Văn Tuyên. Đại học Thủy Lợi (TLU).`
  - Các liên kết ngoài chuẩn URL: GitHub (`https://github.com/TuyenTran205`), LinkedIn, Facebook.

### 5.4 Redesign `src/pages/Portfolio.tsx` kèm Sổ lưu bút Guestbook (F5)

#### Giao diện Portfolio
- Tiêu đề trang: `Dự án Phần mềm & Sản phẩm` (Font chữ lớn, đen sâu, không gradient tím xanh).
- Danh sách dự án hiển thị dạng lưới phẳng 2 hoặc 3 cột (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
- Thẻ dự án:
  - Viền mỏng: `border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded p-5 flex flex-col justify-between`.
  - Nhãn phân loại: Đơn sắc tối giản (ví dụ: `text-xs uppercase tracking-wider text-accent font-mono`).
  - Danh sách công nghệ: Chuỗi chữ trơn phân cách bằng dấu chấm giữa `TypeScript · React · Tailwind · Supabase`. Cấm tuyệt đối mảng huy hiệu pastel xoay vòng 7 màu!
  - Nút xem mã nguồn: `border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 py-2 px-3 text-sm text-center rounded`.

#### Phân hệ Sổ lưu bút Guestbook (F5) tại Portfolio
Phía dưới danh sách dự án, bố trí phân hệ **Sổ lưu bút cộng đồng**:
1. **Hiển thị danh sách lời nhắn:**
   - Đọc từ `guestbookService.getGuestbookEntries(false)` (chỉ lấy các mục `is_approved === true`).
   - Hiển thị: Tên tác giả, Đánh giá sao (1–5 sao tối giản `★`), Dự án liên quan (nếu có), Thời gian, và Nội dung lời nhắn (render dạng văn bản thuần `div.textContent`, cấm tuyệt đối `dangerouslySetInnerHTML` phòng chống XSS).
2. **Form gửi lời nhắn (Giao diện chuẩn 6 trạng thái):**
   - Ô nhập: Tên người gửi (bắt buộc, 2–50 ký tự), Đánh giá số sao (tùy chọn 1–5), Dự án liên quan (chọn từ dropdown), Nội dung lời nhắn (bắt buộc, 5–1000 ký tự).
   - Ô ẩn Honeypot (`honeypot`): Ẩn hoàn toàn với người dùng bằng style `position: absolute; left: -9999px; opacity: 0;`. Nếu bot điền giá trị vào ô này, RPC sẽ hủy bỏ ngay lập tức.
   - Nút gửi "Gửi lời nhắn": Có trạng thái loading spinner, disable khi đang gửi, thông báo thành công: *"Cảm ơn bạn đã để lại lời nhắn! Lời nhắn sẽ hiển thị sau khi được quản trị viên duyệt."*

### 5.5 Redesign `src/pages/Resources.tsx` kèm Form Đóng góp Tài liệu (F4)

#### Giao diện Resources
- Tiêu đề trang: `Kho Tài Liệu Học Tập TLU` (Không dùng nhãn "Resource Hub" hay "Academic Share").
- Bộ lọc và tìm kiếm:
  - Ô tìm kiếm theo tên môn học / tài liệu (`input` viền 1px, focus đổi màu accent).
  - Thanh chọn 4 danh mục học phần chuẩn: `Tất cả`, `Đại cương`, `Cơ sở khối ngành(IT)`, `Cơ sở ngành(IT)`, `Tự chọn(IT)`.
  - Nút bấm "Đóng góp tài liệu +" nổi bật viền đỏ gạch TLU.
- Bảng hiển thị tài liệu:
  - Bảng phẳng mỏng `w-full border-collapse text-sm`. Header xám nhẹ `bg-zinc-100 dark:bg-zinc-800/50`.
  - Các cột: Tiêu đề tài liệu, Học phần, Định dạng (PDF, DOCX, ZIP, LINK), Dung lượng, Ngày tải lên (định dạng an toàn qua `formatDateSafe`), Hành động (Tải xuống / Mở liên kết ngoài có icon `FiExternalLink`).
  - Hỗ trợ cuộn ngang mượt mà trên màn hình điện thoại 360px (`overflow-x-auto`).

#### Modal Đóng góp Tài liệu (F4)
Khi bấm "Đóng góp tài liệu", mở Modal phẳng (viền 1px, nền trắng/tối, không bóng đổ):
- **Trường dữ liệu:**
  1. *Tiêu đề tài liệu:* Bắt buộc, 3–255 ký tự.
  2. *Học phần:* Dropdown chọn 1 trong 4 danh mục quy định.
  3. *Liên kết tài liệu:* Bắt buộc URL hợp lệ, phải bắt đầu bằng `https://`.
  4. *Tên người đóng góp:* Tùy chọn, tối đa 100 ký tự (mặc định nếu trống là "Cộng đồng").
  5. *Mô tả ngắn:* Tùy chọn, tối đa 1000 ký tự.
  6. *Ô bẫy bot (Honeypot):* Input ẩn `name="website_url"` để trống.
- **Xử lý gọi API:**
  - Gọi `submissionService.submitDocument(dto)`.
  - Bắt lỗi `rate_limited` từ RPC DB: Hiển thị thông báo *"Hệ thống đã nhận quá 20 lượt đóng góp trong 1 giờ qua. Vui lòng thử lại sau ít phút."*
  - Thành công: Đóng modal, hiển thị thông báo cảm ơn, tài liệu được đưa vào hàng chờ duyệt của Admin (F10).

---

### 5.6 Nâng cấp Tầng Dịch vụ (`src/services/`)

Cập nhật các hàm nộp dữ liệu công khai vào `submissionService.ts` và `guestbookService.ts`:

```typescript
// Bổ sung vào src/services/submissionService.ts

export interface SubmitDocumentDTO {
  title: string;
  category: DocCategory;
  description?: string;
  link: string;
  name?: string;
  honeypot?: string;
}

export async function submitDocument(
  dto: SubmitDocumentDTO
): Promise<MutationResponse<string>> {
  try {
    const { data, error } = await supabase.rpc('submit_document', {
      p_title: dto.title.trim(),
      p_category: dto.category,
      p_description: dto.description?.trim() || '',
      p_link: dto.link.trim(),
      p_name: dto.name?.trim() || '',
      p_honeypot: dto.honeypot || '',
    });

    if (error) {
      if (error.message.includes('rate_limited')) {
        return {
          data: null,
          error: 'Hệ thống đã nhận quá 20 lượt đóng góp trong 1 giờ qua. Vui lòng thử lại sau ít phút.',
          success: false,
        };
      }
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data as string,
      error: null,
      success: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi gửi đóng góp tài liệu';
    return {
      data: null,
      error: message,
      success: false,
    };
  }
}
```

```typescript
// Bổ sung vào src/services/guestbookService.ts

export interface SubmitGuestbookDTO {
  name: string;
  message: string;
  rating?: number | null;
  projectId?: string | null;
  honeypot?: string;
}

export async function submitGuestbook(
  dto: SubmitGuestbookDTO
): Promise<MutationResponse<string>> {
  try {
    const { data, error } = await supabase.rpc('submit_guestbook', {
      p_name: dto.name.trim(),
      p_message: dto.message.trim(),
      p_rating: dto.rating || null,
      p_project_id: dto.projectId || null,
      p_honeypot: dto.honeypot || '',
    });

    if (error) {
      if (error.message.includes('rate_limited')) {
        return {
          data: null,
          error: 'Hệ thống đang tạm khóa gửi lời nhắn do có quá nhiều lượt gửi gần đây. Vui lòng thử lại sau.',
          success: false,
        };
      }
      return {
        data: null,
        error: error.message,
        success: false,
      };
    }

    return {
      data: data as string,
      error: null,
      success: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Lỗi khi gửi lời nhắn';
    return {
      data: null,
      error: message,
      success: false,
    };
  }
}
```

---

## 6. QUY ĐỊNH 6 TRẠNG THÁI GIAO DIỆN & TIÊU CHUẨN ANTI-AI BẤT KHẢ BIẾN

### 6.1 Ma trận 6 Trạng thái Kỹ thuật
Mọi form nhập liệu và nút bấm tương tác ở trang công khai đều phải xử lý đầy đủ:

1. **Default:** Viền mỏng 1px phẳng `border-zinc-300 dark:border-zinc-700`, nền trắng hoặc tối tương ứng.
2. **Hover:** Đổi màu viền sang `border-zinc-400 dark:border-zinc-500`. Không phóng to, không nảy nút.
3. **Focus:** Viền sắc nét `outline: 2px solid var(--color-accent); outline-offset: 1px`.
4. **Loading:** Spinner nhỏ 16px, nút bấm bị `disabled = true`, con trỏ chuột `cursor: not-allowed` chống bấm đúp (double-click debounce).
5. **Validation Error:** Viền đỏ `border-red-500`, thông báo lỗi tiếng Việt cụ thể xuất hiện ngay bên dưới ô nhập (inline helper text). Cấm dùng `window.alert()`.
6. **Success:** Đóng modal hoặc làm sạch form, hiển thị thông báo xác nhận thành công thanh lịch, tự ẩn sau 4 giây.

### 6.2 Danh mục Răn cấm Anti-AI (Strict Rules)
1. **CẤM GRADIENT NEON:** Cấm các chuỗi `linear-gradient(135deg, #6366f1, #a855f7)` hoặc `#0073ea → #a25ddc` trên tiêu đề, nút bấm hay nền. Chỉ dùng màu phẳng (Flat solid colors).
2. **CẤM BO GÓC TRÒN LỚN:** Cấm `rounded-2xl`, `rounded-3xl`, `rounded-full` (ngoại trừ avatar tròn). Toàn bộ nút, ô nhập, thẻ chỉ dùng `rounded` (2–4px).
3. **CẤM EMOJI RÁC TRONG UI:** Tuyệt đối cấm các emoji (🚀, ✨, 🔥, ⚡, 💡) trong tiêu đề, thẻ hay nút bấm. Biểu tượng phải là SVG đơn sắc từ `react-icons/fi`.
4. **CẤM HUY HIỆU PASTEL THEO CHỈ SỐ MẢNG:** Loại bỏ triệt để `badgeColors[idx % 5]`. Công nghệ và kỹ năng hiển thị là văn bản phân cách bởi dấu chấm giữa.
5. **CẤM SHADOW NỔI CỦA THẺ:** Loại bỏ `box-shadow: 0 10px 30px...`. Phân tách khối bằng đường viền phẳng 1px.

---

## 7. MA TRẬN KIỂM THỬ CHI TIẾT (TEST MATRIX CHO `AUTO-TESTER`)

Subagent `auto-tester` bắt buộc phải tạo các tệp test trong `src/test/` và chạy lệnh `npm run test` đạt kết quả `100% PASSED`.

| Nhóm Kiểm thử | Tệp Kiểm thử | Tên Test Case | Điều kiện thực hiện | Kết quả kỳ vọng |
|---|---|---|---|---|
| **Capability** | `src/test/three/capability.test.ts` | `capability_prefers_reduced_motion` | Mock `matchMedia` trả về `matches: true` | `detectInitialCapability().mode === 'static'` |
| **Capability** | `src/test/three/capability.test.ts` | `capability_user_override_static` | Đặt `localStorage.setItem('portfolio_render_mode', 'static')` | Trả về `mode: 'static'`, `reason: 'user_override'` |
| **Capability** | `src/test/three/capability.test.ts` | `capability_user_override_full` | Đặt `localStorage.setItem('portfolio_render_mode', 'full')` | Trả về `mode: 'full'`, `pointCount: 4000` |
| **Capability** | `src/test/three/capability.test.ts` | `capability_mobile_detect` | Giả lập `window.innerWidth = 500` | Trả về `mode: 'lite'`, `pointCount: 800` |
| **Capability** | `src/test/three/capability.test.ts` | `fps_benchmark_downgrade_lite` | Chạy 2000ms với FPS < 40 trên bản `full` | Gọi callback hạ cấp sang `'lite'` |
| **States & Lerp**| `src/test/three/states.test.ts` | `states_init_lengths` | Khởi tạo với `count = 100` | 5 chương đều có `positions.length === 300` |
| **States & Lerp**| `src/test/three/states.test.ts` | `states_interpolate_no_nan` | Gọi `interpolateStates` với $p \in \{0, 0.25, 0.5, 0.75, 1.0\}$ | Mảng output không chứa `NaN` hoặc `Infinity` |
| **States & Lerp**| `src/test/three/states.test.ts` | `states_interpolate_clamp` | Truyền $p = -0.5$ hoặc $p = 1.5$ | Tự động clamp trong khoảng an toàn $[0, 1]$ |
| **SceneManager**| `src/test/three/SceneManager.test.ts`| `scene_lifecycle_dispose` | Khởi tạo `SceneManager` rồi gọi `dispose()` | Không ném ngoại lệ, các mesh được dọn sạch |
| **Service Layer**| `src/test/services/publicServices.test.ts`| `submit_document_success` | Mock `rpc('submit_document')` trả về UUID | `success: true`, trả về ID tài liệu |
| **Service Layer**| `src/test/services/publicServices.test.ts`| `submit_document_rate_limit`| Mock `rpc` trả về lỗi `'rate_limited'` | Bắt lỗi trả về thông báo tiếng Việt thân thiện |
| **Service Layer**| `src/test/services/publicServices.test.ts`| `submit_guestbook_success` | Mock `rpc('submit_guestbook')` trả về UUID | `success: true`, trả về ID lời nhắn |
| **Validation** | `src/test/utils/validation.test.ts` | `document_form_validation` | URL thiếu `https://` hoặc tiêu đề < 3 ký tự | Trả về lỗi validation tương ứng |
| **Validation** | `src/test/utils/validation.test.ts` | `guestbook_form_validation`| Tin nhắn < 5 ký tự | Báo lỗi độ dài tin nhắn không hợp lệ |

---

## 8. KẾ HOẠCH TRIỂN KHAI THEO FILE CHO `SENIOR-DEV`

Danh sách các file cần tạo mới, sửa đổi hoặc xóa bỏ:

```
src/
├── three/                                   # [MỚI] Module 3D Scrollytelling
│   ├── capability.ts                        # Nhận diện thiết bị, WebGL check, benchmark FPS, localStorage
│   ├── states.ts                            # Mảng Float32Array 5 chương, toán Hermite Lerp
│   ├── SceneManager.ts                      # Three.js lifecycle, renderer, points, lines, disposal
│   └── useThreeScene.ts                     # React Hook kết nối Canvas với SceneManager
├── components/
│   ├── NavigationBar.tsx                    # [SỬA] Viết lại bằng Tailwind v4 thuần, gỡ react-bootstrap
│   ├── Footer.tsx                           # [SỬA] Viết lại bằng Tailwind v4 thuần, link thật
│   ├── Layout.tsx                           # [SỬA] Bỏ class bootstrap, thêm cuộn đầu trang khi đổi route
│   └── public/                              # [MỚI]
│       ├── DocumentSubmissionModal.tsx      # Modal nộp tài liệu F4 (honeypot, inline validation)
│       └── GuestbookFormModal.tsx           # Form gửi lời nhắn F5 (honeypot, rating)
├── pages/
│   ├── Home.tsx                             # [SỬA] Kiến trúc 2-layer scrollytelling, DOM tiếng Việt
│   ├── Portfolio.tsx                        # [SỬA] Redesign Anti-AI, danh sách guestbook F5
│   └── Resources.tsx                        # [SỬA] Redesign Anti-AI, bảng tài liệu, nút mở modal F4
├── services/
│   ├── submissionService.ts                 # [SỬA] Thêm hàm submitDocument(dto)
│   └── guestbookService.ts                  # [SỬA] Thêm hàm submitGuestbook(dto)
├── context/
│   └── ThemeContext.tsx                     # [SỬA] Đặt cả data-theme và data-bs-theme
├── test/
│   ├── three/                               # [MỚI] Unit tests cho module Three.js
│   │   ├── capability.test.ts
│   │   ├── states.test.ts
│   │   └── SceneManager.test.ts
│   └── services/
│       └── publicServices.test.ts           # [MỚI] Test submitDocument & submitGuestbook
├── index.css                                # [SỬA] Thay bằng Tailwind v4 CSS Tokens, xóa Bootstrap
├── main.tsx                                 # [SỬA] Xóa import bootstrap.min.css
└── vite.config.ts                           # [SỬA] Bổ sung plugin @tailwindcss/vite
```

---

## 9. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

Dự án chỉ được nghiệm thu khi đạt 100% các tiêu chí:

- [ ] **AC-1 (3D Scrollytelling & 5 Chương):** Trang chủ `/` hiển thị đối tượng 3D biến đổi mượt mà qua 5 trạng thái theo tiến độ cuộn trang. Khi cuộn tới chương nào, đối tượng biến đổi tương ứng không giật cục.
- [ ] **AC-2 (Chế độ Tĩnh Bắt buộc):** Khi người dùng chọn "Xem bản tĩnh" hoặc bật `prefers-reduced-motion`, WebGL canvas không được nạp, toàn bộ chữ và liên kết vẫn đọc và bấm được bình thường.
- [ ] **AC-3 (Giải phóng WebGL Idempotent):** Rời khỏi trang chủ `/` sang trang `/portfolio` hoặc `/resources` rồi quay lại 10 lần liên tục: Số WebGL Contexts không bị tăng thêm, không xảy ra rò rỉ bộ nhớ.
- [ ] **AC-4 (Xóa bỏ 100% Bootstrap):** Không còn bất kỳ file CSS Bootstrap hay component `react-bootstrap` nào tồn tại trong bundle trang chủ. Kích thước CSS trang công khai dưới 40 KB.
- [ ] **AC-5 (Chuẩn Anti-AI Design):** Toàn bộ giao diện loại bỏ sạch sẽ gradient neon tím hồng, không có emoji rác trong tiêu đề/nút, bo góc mỏng 2–4px, không đổ bóng thẻ mờ, màu đỏ gạch TLU `#B3361C` làm màu nhấn duy nhất.
- [ ] **AC-6 (Nộp Tài liệu F4):** Người dùng có thể nộp tài liệu từ `/resources`, form có bẫy bot honeypot, báo lỗi nếu nộp quá 20 lần/giờ, dữ liệu ghi vào bảng `document_submissions` ở trạng thái `pending`.
- [ ] **AC-7 (Sổ lưu bút F5):** Người dùng có thể gửi lời nhắn từ `/portfolio`, danh sách chỉ hiển thị lời nhắn đã duyệt (`is_approved = true`), chống XSS an toàn 100%.
- [ ] **AC-8 (Test Suite):** Chạy `npm run test` đạt kết quả `100% PASSED` trên toàn bộ các bài test mới.
