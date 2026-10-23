# ĐẶC TẢ KỸ THUẬT: CINEMATIC AEROSPACE 3D SCROLLYTELLING (CHUẨN AWWWARDS ENDUROSAT)
**Tài liệu:** `docs/specs/cinematic-aerospace-awwwards-spec.md`  
**Dự án:** `portfolio-web` (Trần Văn Tuyên — Professional Software Engineer & Business Analyst Portfolio)  
**Tác giả:** Product Architect & UX Specifier (`ba-spec`)  
**Tham chiếu tiêu chuẩn:** [EnduroSat Space Services](https://www.endurosat.com/space-service/) · Awwwards Site of the Day Benchmark  
**Trạng thái:** HOÀN THÀNH — Sẵn sàng chuyển giao cho `senior-dev`  
**Phiên bản:** 3.0.0 (Cinematic Aerospace Edition)  

---

## 1. TỔNG QUAN DỰ ÁN & TẦM NHÌN THIẾT KẾ (EXECUTIVE SUMMARY)

Trang web cá nhân chuyên nghiệp của kỹ sư Trần Văn Tuyên được định vị theo phong cách **Deep-Space Aerospace Engineering** (Kỹ nghệ Hàng không Vũ trụ Không gian sâu), lấy cảm hứng trực tiếp từ kiến trúc website đạt giải thưởng quốc tế của tập đoàn vệ tinh hàng đầu thế giới **EnduroSat**.

Nhằm đưa trải nghiệm từ mức mô hình thủ công lên đẳng cấp điện ảnh tiệm cận **Awwwards Site of the Day / Developer Award**, hệ thống 3D và giao diện tương tác cần được nâng cấp toàn diện dựa trên **5 trụ cột công nghệ cốt lõi**:

1. **3D Model GLB Tối ưu & Fallback Tự cung tự cấp:** Nạp mô hình 3D vệ tinh chuẩn công nghiệp định dạng `.glb` nén bằng Draco/Meshopt, đi kèm cơ chế tự phục hồi (Graceful Fallback) tự động chuyển sang mô hình PBR đa texture procedural khi mạng yếu hoặc offline, đảm bảo chi phí 0 VND và độ sẵn sàng 100%.
2. **Ánh sáng môi trường IBL & HDRI Chuẩn xác:** Khai thác `RGBELoader` và `PMREMGenerator` của Three.js để chiếu rọi vật liệu kim loại vàng MLI và titan bằng bản đồ bức xạ thực tế, kèm bộ sinh IBL Procedural toán học khi không có kết nối internet.
3. **Hiệu ứng Điện ảnh (Cinematic Tone Mapping & Unreal Bloom):** Kích hoạt tone mapping chuẩn điện ảnh `ACESFilmicToneMapping` và bộ lọc hậu kỳ `EffectComposer` với `UnrealBloomPass` được tinh chỉnh tỉ mỉ theo trường phái Anti-AI: vệt sáng lóe cực nhẹ tại các điểm phản quang kim loại và đèn beacon viễn trắc, tuyệt đối không gây mờ đục sương mù rẻ tiền.
4. **Scrollytelling Ghim Cảnh (Pinned Section) & Quán tính cuộn mượt (Smooth Inertia):** Khóa cứng khung nhìn vệ tinh tại vị trí trung tâm trong khi camera bay lượn và xoay quanh từng phân hệ kỹ thuật theo tiến độ cuộn; tích hợp cơ chế quán tính cuộn mượt triệt tiêu hiện tượng giật cục của chuột cơ học.
5. **Kỷ luật Typography Kỹ thuật số & Đường gióng 3D-to-2D (Leader Lines):** Toàn bộ số liệu viễn trắc đo đạc sử dụng `tabular-nums` chống giật layout; sử dụng thuật toán chiếu tọa độ $v.\text{project}(camera)$ để vẽ đường gióng kỹ thuật siêu mỏng 0.5px nối trực tiếp từ linh kiện vệ tinh trong không gian 3D ra các nhãn thông số HUD trên màn hình phẳng 2D.

---

## 2. KIẾN TRÚC HỆ THỐNG & PHÂN TÁCH MODULE (MODULE BREAKDOWN)

Cấu trúc thư mục mã nguồn 3D tại `src/three/` được mở rộng theo kiến trúc module hóa hướng đối tượng cao cấp, phân định rõ ràng trách nhiệm của từng thành phần:

```
src/
├── three/
│   ├── postprocessing.ts        # [MỚI] EffectComposer, RenderPass, UnrealBloomPass, ACESFilmic
│   ├── environment.ts           # [MỚI] RGBELoader, PMREMGenerator, Procedural HDR IBL fallback
│   ├── modelLoader.ts           # [MỚI] GLTFLoader + DRACOLoader, Satellite Subsystems, Procedural fallback
│   ├── leaderLines.ts           # [MỚI] 3D Vector3.project to 2D Screen, Dogleg Elbow line, Occlusion
│   ├── proceduralSatellite.ts   # [KẾ THỪA] Vệ tinh procedural 0 VND làm fallback tuyệt đối
│   ├── starfield.ts             # [KẾ THỪA] Bầu trời sao vi mô chiều sâu vũ trụ
│   ├── states.ts                # [NÂNG CẤP] Tọa độ 5 chương, Camera Orbit, Subsystem 3D Anchor Points
│   ├── capability.ts            # [KẾ THỪA] Phát hiện năng lực GPU, benchmark FPS, tự hạ cấp an toàn
│   ├── SceneManager.ts          # [NÂNG CẤP] Tích hợp pipeline hậu kỳ, IBL, Model Loader, Leader Lines
│   └── useThreeScene.ts         # [NÂNG CẤP] Hook React kết nối Scrollytelling, Smooth Scroll, HUD Overlay
├── components/
│   └── public/
│       ├── PinnedScrollytelling.tsx # [MỚI] Khung cuộn ghim cảnh (Sticky Section) 5 chương
│       └── LeaderLinesOverlay.tsx   # [MỚI] Lớp phủ SVG render đường gióng 0.5px và nhãn HUD
└── pages/
    └── Home.tsx                 # [NÂNG CẤP] Trình diễn Scrollytelling chuẩn điện ảnh EnduroSat
```

---

## 3. TRỤ CỘT 1: POSTPROCESSING PIPELINE & CINEMATIC TONE MAPPING
**Tệp:** `src/three/postprocessing.ts`

### 3.1 Cơ sở lý thuyết & Giải thuật toán học
Trong đồ họa thời gian thực, việc hiển thị trực tiếp dải màu động cao (HDR - High Dynamic Range) lên màn hình tiêu chuẩn SDR (Standard Dynamic Range) đòi hỏi một đường cong biến đổi (Tone Mapping Curve).

Trang web áp dụng chuẩn **ACES (Academy Color Encoding System) Filmic Tone Mapping**:
$$f(x) = \frac{x(a x + b)}{x(c x + d) + e}$$
với các hằng số tiêu chuẩn ngành điện ảnh Hollywood: $a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14$. Đường cong này mang lại độ tương phản sâu ở vùng tối (crushed blacks có kiểm soát) và vùng sáng bão hòa mượt mà ở các điểm bóng kim loại (specular highlights) mà không làm mất chi tiết.

### 3.2 Cấu hình Unreal Bloom Pass chống "AI Glow"
Hiệu ứng Bloom kiểu AI thường có bán kính lớn, ngưỡng kích hoạt thấp khiến toàn màn hình phủ một lớp sương mờ tím/hồng rẻ tiền. Chuẩn hàng không vũ trụ EnduroSat đòi hỏi Bloom phải hoạt động như thấu kính quang học máy quay vệ tinh:
- **Ngưỡng sáng (`threshold`):** $0.85$ (Chỉ những vật liệu có độ phản xạ cực đại, đèn LED viễn trắc màu lục hoặc phản quang mặt trời mới vượt ngưỡng).
- **Cường độ (`strength`):** $0.35 - 0.45$ (Đủ tạo quầng sáng sắc nét quanh điểm LED, không lấn sang vùng tối của không gian sâu).
- **Bán kính khuếch tán (`radius`):** $0.40$ (Tập trung, sắc cạnh).

### 3.3 TypeScript Interface & API Specification
```typescript
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface PostprocessingConfig {
  bloomThreshold?: number; // Mặc định: 0.85
  bloomStrength?: number;  // Mặc định: 0.40
  bloomRadius?: number;    // Mặc định: 0.40
  exposure?: number;       // Mặc định: 1.15
  enabled?: boolean;       // Mặc định: true (tự tắt trên thiết bị yếu)
}

export interface PostprocessingPipeline {
  composer: EffectComposer;
  renderPass: RenderPass;
  bloomPass: UnrealBloomPass;
  render: () => void;
  setSize: (width: number, height: number) => void;
  setExposure: (val: number) => void;
  setEnabled: (val: boolean) => void;
  dispose: () => void;
}

export function createPostprocessingPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  config?: PostprocessingConfig
): PostprocessingPipeline;
```

### 3.4 Quy tắc Quản lý Bộ nhớ & Tự thích ứng
- Khi màn hình thay đổi kích thước (`resize`), bắt buộc gọi đồng thời:
  `renderer.setSize(w, h, false)`, `composer.setSize(w, h)` và `bloomPass.setSize(w, h)`.
- Khi benchmark FPS phát hiện tốc độ khung hình rớt dưới 30 FPS trong 3 giây liên tiếp: Tự động tắt `bloomPass` hoặc bypass `EffectComposer` để chuyển thẳng về `renderer.render(scene, camera)`, giải phóng hoàn toàn GPU bandwidth.
- Hàm `dispose()` phải giải phóng toàn bộ Render Targets bên trong `EffectComposer` và các vật liệu nội bộ của `UnrealBloomPass`.

---

## 4. TRỤ CỘT 2: ÁNH SÁNG MÔI TRƯỜNG IBL & HDRI TOÁN HỌC
**Tệp:** `src/three/environment.ts`

### 4.1 Cơ sở lý thuyết IBL (Image-Based Lighting)
Mô hình vật liệu PBR (Physically Based Rendering) của vệ tinh (vàng MLI Foil, hợp kim titan Ti-6Al-4V, ô quang điện Silicon) chỉ thực sự tỏa sáng khi có ánh sáng môi trường đa hướng phản chiếu từ không gian vũ trụ.
- `RGBELoader` nạp dữ liệu bức xạ HDR ở định dạng tệp Radiance `.hdr`.
- `PMREMGenerator` (Prefiltered Mipmapped Radiance Environment Map) tiền xử lý bản đồ bức xạ thành các cấp độ nhám (roughness mipmaps) phục vụ phép tính phản xạ gương (Specular Reflection) và khuếch tán bán cầu (Diffuse Irradiance).

### 4.2 Cơ chế Fallback Tự cung tự cấp 0 VND (Procedural Cosmic IBL)
Để đảm bảo website **100% không bị vỡ giao diện** khi người dùng chạy offline, mạng chậm, hoặc file HDR bị lỗi CORS/404, hệ thống xây dựng bộ sinh môi trường Procedural HDR hoàn toàn bằng toán học:
- Tạo một `THREE.DataTexture` độ phân giải $512 \times 256$ dạng `FloatType` hoặc sinh thông qua `THREE.CubeCamera` kết hợp gradient bầu trời vũ trụ:
  * Nửa trên bán cầu: Không gian sâu thẳm màu đen huyền `#030305` điểm xuyết nguồn sáng mặt trời định hướng cực mạnh (màu trắng ấm `#FFFDF0`, cường độ $4.0$).
  * Đường chân trời quỹ đạo: Dải màu xanh thẫm quang quyển `#0D2040`.
  * Nửa dưới bán cầu: Phản xạ phản xạ địa cầu (Earth Albedo) màu xanh đại dương dịu `#1E3A8A` (cường độ $0.8$).
- Bản đồ procedural IBL này được nạp vào `scene.environment`, giúp vật liệu kim loại phản chiếu ánh sáng tự nhiên ngay lập tức với chi phí mạng **0 KB** và tải trang dưới **5 mili-giây**!

### 4.3 TypeScript Interface & API Specification
```typescript
import * as THREE from 'three';

export interface EnvironmentOptions {
  hdriUrl?: string;            // URL tệp .hdr (ví dụ: /assets/hdr/space_orbital_1k.hdr)
  ambientIntensity?: number;   // Mặc định: 1.0
  fallbackProcedural?: boolean;// Mặc định: true
}

export interface EnvironmentManager {
  envMap: THREE.Texture | null;
  loadHDRI: (url: string) => Promise<THREE.Texture>;
  applyProceduralIBL: () => THREE.Texture;
  setIntensity: (intensity: number) => void;
  dispose: () => void;
}

export function createEnvironmentManager(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  options?: EnvironmentOptions
): EnvironmentManager;
```

---

## 5. TRỤ CỘT 3: NẠP MÔ HÌNH 3D GLB & FALLBACK VỆ TINH PROCEDURAL
**Tệp:** `src/three/modelLoader.ts`

### 5.1 Kiến trúc nạp mô hình kết hợp (Hybrid Model Architecture)
Hệ thống sử dụng chiến lược tải thông minh:
1. **Pha 1 (Instant Display):** Khởi tạo ngay lập tức mô hình vệ tinh procedural tinh xảo (`src/three/proceduralSatellite.ts`) trong frame đầu tiên để người dùng không phải nhìn màn hình chờ trống rỗng.
2. **Pha 2 (Background Asset Fetch):** Sử dụng `GLTFLoader` tích hợp `DRACOLoader` tải mô hình vệ tinh `.glb` đã được tối ưu hóa trọng lượng (< 1.5MB).
   - Thiết lập bộ giải mã Draco qua CDN chính thức của Google:
     `dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')`.
     `dracoLoader.setDecoderConfig({ type: 'js' })` (đảm bảo tương thích hoàn hảo mọi môi trường không hỗ trợ WASM đa luồng).
3. **Pha 3 (Seamless Morph/Crossfade Transition):** Khi mô hình GLB tải xong, chuẩn hóa tâm hình học (BoundingBox Centering), gán vật liệu PBR đồng bộ với IBL, sao chép góc quay quán tính hiện tại từ procedural model sang GLB model và thế chỗ một cách mượt mà.
4. **Pha 4 (Graceful Fallback on Error):** Nếu mạng gặp sự cố (404, Offline, Timeout sau 4.0 giây), hệ thống tiếp tục giữ nguyên mô hình Procedural Satellite mà không phát sinh bất kỳ cảnh báo lỗi khó chịu nào cho người dùng.

### 5.2 Phân hệ Vệ tinh & Điểm neo kỹ thuật (Subsystem Anchor Map)
Dù là mô hình GLB hay mô hình Procedural, các phân hệ chính của vệ tinh đều được gán định danh thống nhất để liên kết với hệ thống đường gióng Leader Lines:

| Định danh Phân hệ | Tên tiếng Việt | Tọa độ Cục bộ $P_{local} (X, Y, Z)$ | Chức năng Kỹ thuật |
| :--- | :--- | :--- | :--- |
| `SUBSYS_ANTENNA` | Cụm Ăng-ten Parabol Viễn thông | `(0.0, 1.45, 0.40)` | Băng tần X/S-band Uplink & Downlink |
| `SUBSYS_SOLAR_LEFT` | Cánh Pin Quang điện Trái | `(-3.20, 0.0, 0.0)` | Mảng tế bào quang điện GaAs Triple-Junction |
| `SUBSYS_SOLAR_RIGHT` | Cánh Pin Quang điện Phải | `(3.20, 0.0, 0.0)` | Cung cấp nguồn điện 28V Bus công suất 120W |
| `SUBSYS_AVIONICS` | Khối Máy tính OBC & Thân Titan | `(0.0, 0.20, 0.72)` | Xử lý dữ liệu trung tâm & Điều khiển định hướng |
| `SUBSYS_SENSOR` | Ống kính Cảm biến Quang học Trái Đất | `(0.0, -0.40, 0.85)` | Quan sát quang học độ phân giải cao trạm TLU |
| `SUBSYS_PROPULSION` | Động cơ Đẩy RCS & Ion Thruster | `(0.0, -1.30, 0.0)` | Duy trì và hiệu chỉnh độ cao quỹ đạo LEO |

### 5.3 TypeScript Interface & API Specification
```typescript
import * as THREE from 'three';

export interface ModelLoadResult {
  group: THREE.Group;
  source: 'glb' | 'procedural';
  subsystems: Map<string, THREE.Object3D>;
  dispose: () => void;
}

export interface ModelLoaderOptions {
  glbPath?: string;
  dracoDecoderPath?: string;
  timeoutMs?: number; // Mặc định: 4000ms
  onProgress?: (ratio: number) => void;
}

export class SatelliteModelManager {
  private currentModel: ModelLoadResult | null = null;
  
  constructor(private scene: THREE.Scene, private options?: ModelLoaderOptions);
  public async loadModel(): Promise<ModelLoadResult>;
  public getSubsystemWorldPosition(subsystemId: string, targetVec: THREE.Vector3): boolean;
  public update(timeSec: number): void;
  public setRotation(rotX: number, rotY: number): void;
  public dispose(): void;
}
```

---

## 6. TRỤ CỘT 4: THUẬT TOÁN ĐƯỜNG GIÓNG 3D-TO-2D (LEADER LINES & HUD OVERLAY)
**Tệp:** `src/three/leaderLines.ts` & `src/components/public/LeaderLinesOverlay.tsx`

### 6.1 Cơ sở hình học & Giải thuật Chiếu Tọa độ (Mathematical Projection)
Để vẽ đường chỉ dẫn từ linh kiện vệ tinh trong không gian 3D ra nhãn mô tả 2D trên màn hình phẳng, hệ thống áp dụng chuỗi biến đổi hình học thuần túy:

#### Bước 1: Tính Tọa độ Thế giới (World Space Coordinates)
Điểm gắn linh kiện $P_{local}$ được nhân với Ma trận Thế giới của phân hệ:
$$P_{world} = M_{world} \cdot P_{local}$$

#### Bước 2: Chiếu qua Ma trận Camera (View & Projection Matrix)
Điểm thế giới được chiếu lên không gian Normalized Device Coordinates (NDC) qua camera:
$$P_{ndc} = P_{world} \cdot M_{view} \cdot M_{projection} \quad \Longleftrightarrow \quad P_{world}.\text{project}(camera)$$
Trong đó $P_{ndc} = (x_{ndc}, y_{ndc}, z_{ndc}) \in [-1, 1]^3$.

#### Bước 3: Kiểm tra Góc nhìn và Che khuất (Frustum & Depth Culling)
- Nếu $z_{ndc} > 1.0$: Điểm nằm ở phía sau mặt phẳng cắt của Camera (phía sau lưng người nhìn) $\rightarrow$ Không hiển thị (`visible = false`).
- Kiểm tra góc nghiêng mặt phẳng (Normal dot Product): Nếu vector pháp tuyến của bề mặt quay lệch quá $90^\circ$ so với vector hướng nhìn của Camera $\rightarrow$ Điểm đang bị thân vệ tinh che khuất $\rightarrow$ Làm mờ (`opacity = 0.15`) hoặc ẩn.

#### Bước 4: Chuyển đổi sang Tọa độ Điểm ảnh Màn hình (Screen Pixels)
Với khung nhìn có chiều rộng $W$ và chiều cao $H$:
$$X_{screen} = \frac{x_{ndc} + 1}{2} \cdot W$$
$$Y_{screen} = \frac{-y_{ndc} + 1}{2} \cdot H$$

#### Bước 5: Giải thuật Vẽ Đường Khuỷu Kỹ thuật (Dogleg Elbow Routing)
Một đường gióng kỹ thuật chuẩn hàng không vũ trụ không bao giờ nối chéo trực tiếp từ điểm đến chữ mà luôn gập một góc $45^\circ$ hoặc $90^\circ$ theo phong cách bản vẽ cơ khí CAD:
- **Điểm 1 (Gốc 3D trên vệ tinh):** $A = (X_{screen}, Y_{screen})$.
- **Điểm 2 (Khớp gập thứ nhất - Elbow 1):** $B = (X_{screen} + \Delta X_{offset}, Y_{screen} + \Delta Y_{offset})$.
- **Điểm 3 (Đoạn gióng ngang - Horizontal Shelf):** $C = (X_{label\_target}, Y_{screen} + \Delta Y_{offset})$.
- **Điểm 4 (Điểm neo nhãn HUD):** $D = (X_{label}, Y_{label})$.

Đường dẫn SVG tạo bởi lệnh Path:
$$d = \text{"M } X_A \text{ } Y_A \text{ L } X_B \text{ } Y_B \text{ L } X_C \text{ } Y_C \text{"}$$

Tại điểm gốc $A$, vẽ một điểm chấm tròn bán kính $2.5px$ kèm vòng tròn xung nhịp (radar ping ring) bán kính $5px$ siêu mỏng $0.5px$.

```
   (Vệ tinh 3D)
        ● Điểm A [Gốc 3D: P.project(camera)]
         \
          \ (Đường gập góc 45°)
           \
            ■───────────────● [Nhãn HUD 2D: Tabular Numbers]
           Điểm B          Điểm C   [BĂNG THÔNG // 100 MBPS]
        (Khớp khuỷu)   (Gióng ngang) [ĐIỆN ÁP // 28.4 VDC]
```

### 6.2 TypeScript Interface & Schema
```typescript
import * as THREE from 'three';

export interface LeaderAnchorPoint {
  id: string;
  subsystemId: string;
  labelTitle: string;
  labelValue: string;
  chapterIndex: number; // Chỉ hiển thị đường gióng tại chương tương ứng
  side: 'left' | 'right';
  localOffset: THREE.Vector3;
}

export interface ComputedLeaderLine {
  id: string;
  visible: boolean;
  opacity: number;
  startX: number;
  startY: number;
  elbowX: number;
  elbowY: number;
  endX: number;
  endY: number;
  labelTitle: string;
  labelValue: string;
}

export function project3DToScreen(
  worldPos: THREE.Vector3,
  camera: THREE.Camera,
  viewportWidth: number,
  viewportHeight: number
): { x: number; y: number; isBehind: boolean; ndcZ: number };

export function calculateLeaderLines(
  anchors: LeaderAnchorPoint[],
  modelManager: { getSubsystemWorldPosition: (id: string, out: THREE.Vector3) => boolean },
  camera: THREE.Camera,
  viewportWidth: number,
  viewportHeight: number,
  currentChapter: number
): ComputedLeaderLine[];
```

---

## 7. TRỤ CỘT 5: SCROLLYTELLING GHIM CẢNH & QUÁN TÍNH CUỘN MƯỢT
**Tệp:** `src/components/public/PinnedScrollytelling.tsx` & `src/pages/Home.tsx`

### 7.1 Cơ chế Ghim Cảnh (Pinned Section Mechanics)
Khác với phương pháp cuộn thông thường khiến mô hình 3D bị trôi tuột khỏi màn hình hoặc bị che khuất bởi các khối thẻ, kỹ thuật **Pinned Section** cố định viewport trong suốt hành trình khám phá:
- **Khung chứa tổng (Scroll Container):** Chiều cao được đặt bằng `h-[500vh]` (tương ứng với 5 chương nội dung, mỗi chương sở hữu $100vh$ hành trình cuộn).
- **Viewport cố định (Sticky Stage):** Sử dụng `sticky top-0 h-screen w-full overflow-hidden`.
  * Canvas WebGL 3D nằm toàn màn hình tại `z-0`.
  * Lớp phủ SVG Leader Lines nằm tại `z-10` trong suốt (`pointer-events-none`).
  * Cột thông tin viễn trắc và nội dung chương nằm thanh thoát ở nửa trái màn hình (`z-20`, chiếm $42 - 48\%$ bề ngang viewport).
  * Bộ phận vệ tinh 3D được camera xoay chiếu nằm uy nghi ở nửa phải màn hình ($52 - 58\%$ viewport).

### 7.2 Quán tính cuộn mượt (Smooth Inertia Physics)
Để loại bỏ hoàn toàn cảm giác giật khấc của con lăn chuột phần cứng:
- Sử dụng mô hình vật lý giảm chấn (Spring-Damper Physics) tích hợp qua Framer Motion:
  $$\text{Progress}_{\text{smoothed}} = \text{Spring}(\text{ScrollYProgress}, \{ \text{stiffness}: 100, \text{damping}: 30, \text{mass}: 0.2 \})$$
- Giá trị nội suy mượt mà này được truyền vào `SceneManager.setProgress(progress)`, đảm bảo camera bay lượn và xoay quỹ đạo quanh vệ tinh với độ êm ái tuyệt đối như cảnh quay điện ảnh của NASA.
- Đồng thời bổ sung cấu hình CSS chuẩn quốc tế:
  `html { scroll-behavior: smooth; }` và cơ chế fallback tức thì khi người dùng bật chế độ trợ năng `prefers-reduced-motion: reduce`.

### 7.3 Bảng phân cảnh 5 Chương & Quỹ đạo Camera (Camera Flight Matrix)

| Chương | Tiến độ Cuộn $p$ | Vị trí Camera $(X, Y, Z)$ | Điểm nhìn Camera Target | Trọng tâm Phân hệ Vệ tinh | Nhãn Telemetry HUD |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **01** | $0.00 \to 0.20$ | `(0.0, 0.5, 7.2)` | `(1.2, 0.0, 0.0)` | Toàn cảnh Vệ tinh Quỹ đạo LEO | `[01 // MISSION BRIEF · TLU_LEO]` |
| **02** | $0.20 \to 0.40$ | `(1.8, 0.8, 4.2)` | `(0.4, 0.2, 0.0)` | Khối Máy tính OBC & Avionics | `[02 // AVIONICS & COMPUTING]` |
| **03** | $0.40 \to 0.60$ | `(-2.8, 0.4, 4.8)` | `(-0.8, 0.0, 0.0)`| Cánh Pin Năng lượng Mặt trời | `[03 // SOLAR ARRAYS & EPS]` |
| **04** | $0.60 \to 0.80$ | `(1.2, 2.8, 5.0)` | `(0.0, 0.4, 0.0)` | Chảo Ăng-ten Viễn thông Cao tần | `[04 // COMMS & S-BAND DISH]` |
| **05** | $0.80 \to 1.00$ | `(0.0, 1.8, 7.8)` | `(0.0, -0.2, 0.0)`| Toàn cảnh Triển khai Trạm Mặt đất | `[05 // GROUND STATION DOWNLINK]` |

---

## 8. TIÊU CHUẨN ANTI-AI DESIGN & GIAO DIỆN HUD KỸ THUẬT SỐ

### 8.1 Bộ Quy tắc Nghiêm ngặt "Anti-AI Design" (Chuẩn Linear / Stripe / EnduroSat)

| Yếu tố Thiết kế | CẤM TUYỆT ĐỐI (Kiểu AI Rẻ tiền) | CHUẨN MỰC BẮT BUỘC (Aerospace High-End) |
| :--- | :--- | :--- |
| **Màu sắc nền & viền** | Gradient neon tím/hồng/xanh sặc sỡ phủ toàn bộ thẻ | Đơn sắc trung tính sâu thẳm: Nền `#030305`, thẻ kính bán mờ `rgba(8, 8, 12, 0.65)`, viền mỏng hairline `1px` hoặc `0.5px` (`rgba(255, 255, 255, 0.08)`). |
| **Bo góc (Border Radius)** | Bo góc tròn lố bịch `rounded-3xl`, `rounded-[32px]` | Bo góc kỹ thuật chuẩn mực: `rounded-none`, `rounded-sm (2px)`, tối đa `rounded (4px)`. |
| **Biểu tượng (Icons & Emoji)** | Nhét emoji bừa bãi vào nút (`🚀 Khám phá ngay!`, `✨ Xem dự án`) | Biểu tượng kỹ thuật đơn sắc viền mảnh từ `react-icons/fi` (Feather Icons) hoặc ký tự ASCII kỹ thuật `[+]`, `[//]`. Tuyệt đối không dùng emoji màu sắc trong UI. |
| **Thông báo & Hộp thoại** | Dùng popup alert mặc định của trình duyệt hoặc modal đóng hộp che kín 3D | Bố cục mở HUD Hàng không Vũ trụ. Thông báo viễn trắc dạng nhãn gắn trực tiếp vào layout với chữ in hoa Monospace. |
| **Hiển thị Số liệu** | Dùng font thường khiến các con số bị giật chiều rộng khi đếm | Áp dụng bắt buộc `tabular-nums` cho 100% số liệu đo đạc (tốc độ quỹ đạo, tọa độ, xung nhịp, thời gian UTC). |
| **Độ tương phản** | Chữ mờ nhạt không đọc được hoặc chữ phát sáng chói lọi | Đạt chuẩn WCAG AAA: Chữ chính trắng sáng `#F8FAFC`, chữ phụ `#94A3B8`. |

### 8.2 Kỷ luật Typography Kỹ thuật số (Digital HUD Typography)
- **Họ font Telemetry:** `JetBrains Mono`, `SF Mono`, `Fira Code`, `monospace`.
- **Đặc tính số:** `font-feature-settings: "tnum" 1, "zero" 1;` (`tabular-nums` và số 0 có gạch chéo chuẩn kỹ thuật).
- **Quy cách chữ Viễn trắc (Telemetry Labels):** Cỡ chữ `10px - 11px`, `text-transform: uppercase`, `letter-spacing: 0.08em - 0.12em`.
- **Đường kẻ vi mô Hairline:** Đường viền SVG `stroke-width: 0.5px` hoặc `1px`, sử dụng thuộc tính `vector-effect="non-scaling-stroke"` để giữ nguyên độ sắc nét siêu mảnh trên mọi tỉ lệ màn hình Retina / 4K.

### 8.3 Đặc tả 6 Trạng thái Tương tác Hoàn chỉnh (6 Interaction States)

1. **Default:** Viền `rgba(255, 255, 255, 0.08)`, chữ `#F8FAFC`, nền `rgba(8, 8, 12, 0.65)`, góc hộp có dấu cộng `+` vi mô mờ `30%`.
2. **Hover:** Viền sáng nhẹ lên `rgba(255, 255, 255, 0.22)`, dấu cộng `+` tại 4 góc chuyển sang màu cam điểm nhấn `#B3361C`, bóng đổ mờ cực nhẹ `box-shadow: 0 0 12px rgba(0, 0, 0, 0.5)`.
3. **Focus-Visible:** Viền kép (double border) sắc nét: Vòng trong màu cam điểm nhấn `#B3361C` dày `1px`, vòng ngoài `outline-offset: 2px` chuẩn trợ năng WCAG.
4. **Loading:** Vạch nhấp nháy quét radar quét ngang (Hairline Scanning Bar) mỏng `1px` chạy tuần hoàn, hiển thị thông điệp viễn trắc: `[ACQUIRING TELEMETRY // 48%]`.
5. **Validation Error / Warning:** Viền chuyển sang màu hổ phách cảnh báo `#F59E0B` hoặc đỏ cảnh báo `#EF4444`, đi kèm mã lỗi chuẩn hàng không: `[ERR_ERR_OBC_TIMEOUT // RETRYING]`.
6. **Success / Nominal:** Viền xanh ngọc danh định `rgba(16, 185, 129, 0.35)`, nhãn trạng thái `[SYS.STATUS // NOMINAL]`.

---

## 9. QUY ĐỊNH TÍNH AN TOÀN, HIỆU NĂNG & DỌN DẸP BỘ NHỚ (EDGE CASES & MEMORY INTEGRITY)

1. **Chống rò rỉ bộ nhớ WebGL (WebGL Leak Prevention):**
   - Mọi `Geometry`, `Material`, `Texture`, `RenderTarget` tạo mới đều phải được lưu trữ trong danh sách dọn dẹp và giải phóng tường minh (`dispose()`) khi unmount component.
   - Idempotent Cleanup: Hàm `dispose()` của `SceneManager`, `PostprocessingPipeline`, `EnvironmentManager` có cờ bảo vệ `if (this.isDestroyed) return;` chống gọi trùng lặp gây crash ứng dụng.
2. **Chống tắc nghẽn Main Thread:**
   - Thuật toán chuyển đổi tọa độ `project3DToScreen` chỉ tính toán cho tối đa 4 điểm neo tại mỗi thời điểm tương ứng với chương đang xem.
   - Thao tác kéo xoay vệ tinh (Pointer Drag) chỉ cập nhật góc quay mục tiêu `targetRotX`, `targetRotY`; việc xoay thực tế được thực hiện trong hàm `requestAnimationFrame` bằng phép nội suy Lerp:
     $$\text{currentRot} = \text{Lerp}(\text{currentRot}, \text{targetRot}, 0.06)$$
3. **Thích ứng thiết bị di động & Màn hình hẹp:**
   - Trên màn hình hẹp ($< 768px$): Camera tự động lùi xa thêm $1.8$ đơn vị trên trục Z để mô hình vệ tinh không che khuất chữ; nhãn Leader Lines tự động chuyển sang chế độ thu gọn (Compact Tooltip).
4. **Bảo tồn Trợ năng (A11y & Reduced Motion):**
   - Luôn duy trì nút bấm chuyển chế độ tĩnh (Fallback Static Mode) tại góc màn hình `bottom-4 right-4` để người dùng máy tính yếu hoặc người có thị giác nhạy cảm có thể tắt hoàn toàn WebGL chỉ với 1 cú click.

---

## 10. MA TRẬN KIỂM THỬ TỰ ĐỘNG DÀNH CHO `auto-tester` (TEST MATRIX)

Đội ngũ kiểm thử tự động `auto-tester` bắt buộc phải triển khai đầy đủ các ca kiểm thử sau tại thư mục `src/test/three/` và đạt tỉ lệ đỗ **100%**:

| ID Test Case | Tệp Kiểm thử Mục tiêu | Nội dung Kiểm định Chi tiết | Tiêu chí Đạt (Pass Criteria) |
| :--- | :--- | :--- | :--- |
| **TEST-POST-01** | `postprocessing.test.ts` | Khởi tạo pipeline hậu kỳ với Renderer giả lập | Tạo thành công `composer`, `renderPass`, `bloomPass` không ném ngoại lệ. |
| **TEST-POST-02** | `postprocessing.test.ts` | Gọi hàm `setSize(w, h)` khi thay đổi kích thước | Cập nhật chính xác kích thước của composer và bloom pass. |
| **TEST-POST-03** | `postprocessing.test.ts` | Gọi hàm `dispose()` dọn dẹp bộ nhớ | Giải phóng an toàn, cờ giải phóng được kích hoạt, không rò rỉ tài nguyên. |
| **TEST-ENV-01** | `environment.test.ts` | Sinh môi trường IBL Procedural khi không có tệp HDR | Trả về `THREE.Texture` hợp lệ nạp được vào `scene.environment`. |
| **TEST-ENV-02** | `environment.test.ts` | Xử lý lỗi nạp tệp HDR thất bại (mạng 404/Timeout) | Tự động chuyển đổi về Procedural IBL mà không gây crash hệ thống. |
| **TEST-MODEL-01** | `modelLoader.test.ts` | Nạp mô hình GLB thành công hoặc rơi về Procedural | Trả về `group` chứa đầy đủ cấu trúc vệ tinh và các điểm neo phân hệ. |
| **TEST-MODEL-02** | `modelLoader.test.ts` | Tra cứu tọa độ thế giới của từng phân hệ | `getSubsystemWorldPosition` trả về `true` và ghi tọa độ chuẩn vào vector. |
| **TEST-LEADER-01** | `leaderLines.test.ts` | Thuật toán chiếu `project3DToScreen` điểm phía trước | Chuyển đổi chính xác tọa độ thế giới sang tọa độ pixel màn hình $[0, W] \times [0, H]$. |
| **TEST-LEADER-02** | `leaderLines.test.ts` | Thuật toán nhận diện điểm nằm phía sau Camera | Phát hiện $z_{ndc} > 1.0$ và đánh dấu `isBehind = true`, ẩn đường gióng. |
| **TEST-LEADER-03** | `leaderLines.test.ts` | Tính toán tọa độ đường khuỷu Dogleg Elbow Line | Điểm khuỷu $B$ và điểm gióng ngang $C$ có tọa độ hợp lý, tạo chuỗi SVG Path đúng cú pháp `M... L... L...`. |
| **TEST-SCENE-01** | `SceneManager.test.ts` | Khởi tạo SceneManager tích hợp hậu kỳ và leader lines | Render loop hoạt động ổn định, hàm `dispose()` dọn dẹp 100% đối tượng con. |
| **TEST-UI-01** | `PinnedScrollytelling.test.tsx`| Render khung cuộn Pinned Section 5 chương | Hiển thị đầy đủ 5 tiêu đề chương, nhãn HUD và không phát sinh lỗi React warning. |

---

## 11. KẾ HOẠCH TRIỂN KHAI MÃ NGUỒN CỤ THỂ CHO `senior-dev` (EXECUTION PLAN)

`senior-dev` cần tiến hành hiện thực hóa mã nguồn theo 6 bước tuần tự, tuân thủ nghiêm ngặt các quy định đã đặc tả:

### Bước 1: Hiện thực hóa Module Hậu kỳ (`src/three/postprocessing.ts`)
- Nhập khẩu `EffectComposer`, `RenderPass`, `UnrealBloomPass` từ `three/examples/jsm/postprocessing/`.
- Cấu hình tone mapping `ACESFilmicToneMapping` và exposure $1.15$ trên renderer.
- Xây dựng cơ chế vô hiệu hóa an toàn cho môi trường JSDOM/Headless khi chạy unit test.

### Bước 2: Hiện thực hóa Module Ánh sáng Môi trường (`src/three/environment.ts`)
- Triển khai bộ sinh Procedural Cosmic IBL toán học làm nền tảng cốt lõi (chi phí 0 VND).
- Tích hợp `RGBELoader` và `PMREMGenerator` để sẵn sàng đón nhận tệp HDR ngoài khi có đường dẫn.

### Bước 3: Hiện thực hóa Module Quản lý Mô hình (`src/three/modelLoader.ts`)
- Kết nối `GLTFLoader` và `DRACOLoader`.
- Kết nối với `proceduralSatellite.ts` hiện có làm lớp bảo vệ dự phòng tuyệt đối.
- Cung cấp hàm tra cứu tọa độ các phân hệ: Ăng-ten, Cánh pin, Avionics, Cảm biến, Động cơ đẩy.

### Bước 4: Hiện thực hóa Thuật toán Đường gióng Kỹ thuật (`src/three/leaderLines.ts`)
- Cài đặt hàm toán học chiếu $P_{world} \to P_{ndc} \to P_{screen}$.
- Xây dựng thuật toán tính tọa độ các đoạn gấp khúc Dogleg Elbow và định dạng chuỗi SVG Path.

### Bước 5: Nâng cấp `SceneManager.ts` & `useThreeScene.ts`
- Tích hợp Postprocessing Pipeline, Environment Manager, Model Manager và tính toán Leader Lines vào vòng lặp Render.
- Truyền danh sách tọa độ 2D của các đường gióng ra ngoài cho React component tiêu thụ.

### Bước 6: Xây dựng Giao diện Pinned Scrollytelling & HUD Overlay (`src/pages/Home.tsx`)
- Tạo component `src/components/public/LeaderLinesOverlay.tsx` để render các đường gióng SVG siêu mảnh $0.5px$ và nhãn số liệu `tabular-nums`.
- Cấu hình khung cuộn Pinned Section $500vh$ kết hợp quán tính cuộn mượt mượt mà.
- Kiểm tra toàn bộ phong cách Anti-AI Design: Xóa sạch emoji thừa, áp dụng viền mỏng hairline, đảm bảo 100% hiển thị hoàn mỹ.
