# DAC TA KY THUAT: LENOVO IDEAPAD GAMING 3 SCROLLYTELLING & HARDWARE ARCHITECTURE 3D
**Tai lieu:** `docs/specs/lenovo-laptop-scrollytelling-spec.md`  
**Du an:** `portfolio-web` (Tran Van Tuyen - Software Developer & Business Analyst)  
**Vai tro:** Product Architect & UX Specifier (`ba-spec`)  
**Tham chieu tieu chuan:** Anti-AI Design System (`docs/05-DESIGN-SYSTEM.md`), Apple/Lenovo Hardware Showcase  
**Trang thai:** Hoan thanh - San sang chuyen giao cho `senior-dev`  
**Phien ban:** 3.0.0  

---

## 1. EXECUTIVE SUMMARY & KIEN TRUC CHUYEN DOI (MODEL-SWAP ARCHITECTURE)

### 1.1 Boi canh & Ly do chuyen doi
Trang chu ca nhan cua Tran Van Tuyen da hoan thanh giai doan thu nghiem voi chu de Hang khong Vu tru (EnduroSat Satellite). Mac du trai nghiem 3D da van hanh on dinh, chu de ve tinh khong phan anh truc dien nang luc cot loi cua mot Ky su Phan mem va Chuyen vien Phan tich Nghiep vu (BA). 

Chiec laptop **Lenovo IdeaPad Gaming 3** (trang bi vi xu ly Intel Core i7 10th Gen, card do hoa roi NVIDIA GeForce GTX, bo nho kenh doi va he thong tan nhiet kep Dual-Fan) la co cong cu lam viec, lap trinh va nghien cuu thuc te cua Tran Van Tuyen trong suot qua trinh hoc tap tai Dai hoc Thuy Loi.

Viec chuyen doi sang mo hinh 3D Laptop Lenovo IdeaPad Gaming 3 mang lai:
1. **Tinh chan thuc & Ca nhan hoa cao:** Bieu trung truc tiep cho moi truong ky thuat, suc manh tinh toan va do ben bi ma tac gia su dung de tao ra cac san pham phan mem.
2. **Kich ban ke chuyen dong nhat:** Tu khau mo nap may (Khoi dong du an), kham pha thiet ke cong nghiep (Ky nang lap trinh), boc tach phan cung X-Ray (Cau truc he thong va Co so du lieu), soi can canh chip ban dan CPU/GPU (Giai thuat va Hieu nang cao), den lap rap hoan thien & bang thong so ky thuat (Ho so nang luc va Thong tin lien he).
3. **Thong nhat Anti-AI Design System:** Loai bo hoan toan khong gian vu tru vien tuong; thiet lap phong cach **Studio Tech Dark (#0A0B0E)** toi gian, sac net, vien sieu mong 1px, mau nhan do gach ky thuat `#B3361C` / Lenovo Legion Red `#E11D48`.

---

### 1.2 Phan tich Tai nguyen 3D: `public/assets/models/laptop.glb`
Tep mo hinh 3D da san sang tai `public/assets/models/laptop.glb` (Dung luong: 5.21 MB). Ket qua khao sat cau truc ky thuat:
- **Tong so Nodes:** 45 nodes.
- **Tong so Meshes:** 24 meshes (`Object_0` den `Object_23`).
- **Tong so Materials:** 12 materials, trong do co 5 textures nhung san:
  - `intel-10th-i7` (Material index 10, Mesh 22, Node 42): Decal / Tem vi xu ly Intel Core i7 10th Gen.
  - `Nvidia-GEFORCE-GTX` (Material index 9, Mesh 21, Node 40): Decal / Tem card do hoa NVIDIA GeForce GTX.
  - `Vneshniy-vid-Klaviatura-1` (Material index 11, Mesh 23, Node 44): Texture mat ban phim Gaming Layout TrueStrike.
  - `.003` (Material index 7, Mesh 15, Node 31): Texture tam nen man hinh 15.6 inch IPS.
  - `Material.001` (Material index 6, Mesh 13, Node 28): Texture cum trackpad va cum phan cung trung tam.
- **Phan cap Hinge (Ban le) & Man hinh:**
  - Node 29 (`_12`) quan ly cum man hinh gom: Node 30 (Vien man hinh Bezel), Node 31 (Tam nen LCD Display), Node 32 (Webcam Privacy Shutter tai dinh man hinh).
  - Node 33 (`path3439.001_13`): Logo Lenovo kim loai tren nắp lưng man hinh.
  - Node 36 (`path3439_14`): Logo Lenovo kim loai tren chieu nghi tay (Palmrest).
  - Node 4, 5: Cum ban le kep va khe thoat gio phia sau (Rear Dual Exhausts).
  - Node 7, 9, 11, 13, 18, 20, 22, 24: Cum cong ket noi I/O canh trai (USB-A, Type-C, HDMI, RJ45 Gigabit Ethernet, Audio combo).
  - Node 26, 37, 38: Cum cong ket noi canh phai va khe tan nhiet phu.

---

### 1.3 Chien luoc Chuan hoa Toa do & Ti le (Normalization Strategy)
Model goc trong file GLB co kich thuoc bao (Bounding Box) khoang:
- Truc X (Chieu rong): ~78.0 units (tu -39.1 den +38.8).
- Truc Y (Chieu cao mo nap): ~48.0 units (tu 0.0 den +48.0).
- Truc Z (Chieu sau): ~50.0 units (tu -24.6 den +25.2).

Neu de nguyen kich thuoc nay, camera Three.js se bi chìm ben trong model hoac phai keo camera ra xa Z = 80-100, gay sai lech ty le chieu sang va do sau leader lines.
**Quy chuan Chuan hoa trong `modelLoader.ts`:**
1. **Can tam (Center to Origin):** Tinh Bounding Box cua toan bo model, lay vector tam `center = bbox.getCenter()`, sau do dich chuyen toan bo geometry hoac scene: `gltf.scene.position.sub(center)`.
2. **Co dan chuan hoa (Scale Normalization):**
   - Dat kich thuoc muc tieu `TARGET_SIZE = 4.5` units (chieu dai toi da theo truc X hoac Z).
   - Tinh he so ty le: `scaleFactor = TARGET_SIZE / Math.max(bboxSize.x, bboxSize.y, bboxSize.z)` (khoang `4.5 / 78.0 = 0.0577`).
   - Ap dung `gltf.scene.scale.setScalar(scaleFactor)`.
3. **He truc toa do sau chuan hoa:**
   - Truc X: [-2.25, +2.25] (Trai sang phai).
   - Truc Y: [-0.60, +1.40] (Day may len dinh man hinh khi mo).
   - Truc Z: [-1.45, +1.45] (Khe tan nhiet sau toi mep truoc chieu nghi tay).
4. **Co che Du phong Tuc thi (Instant Fallback):**
   - Khi dang tai file `laptop.glb` qua mang (hoac khi gap loi mang 404/timeout 4000ms), ung dung lap tuc dung mo hinh Procedural Laptop khung go hop kim kim loai 0 KB (Base chassis + Open Lid panel) de nguoi dung khong bao gio phai nhin man hinh trong. Khi GLB tai xong, he thong hoan doi muot ma (crossfade swap).

---

## 2. KICH BAN CHI TIET 5 CHUONG SCROLLYTELLING

Trai nghiem Scrollytelling duoc chia lam 5 chuong tren container cuon 500vh (moi chuong chiem 100vh):

```
Progress: 0.00          0.25          0.50          0.75          1.00
           |-------------|-------------|-------------|-------------|
Chương:    Chương 1      Chương 2      Chương 3      Chương 4      Chương 5
Chủ đề:    Product Hero  Reveal Design Exploded X-Ray Silicon Core  Reassembly & Specs
Camera:    Toàn cảnh 3/4 Cận cảnh phím Oblique Top-Down Macro Chip   Chính diện hoàn mỹ
Nắp máy:   Hé mở 5°-15°  Mở 115°       Mở 115°       Mở 115°       Mở 115°
Vỏ ngoài:  Nguyên khối   Nguyên khối   X-Ray mờ 25%  Thấu thị chip Hoàn chỉnh kim loại
```

---

### CHUONG 1: PRODUCT HERO · LENOVO IDEAPAD GAMING 3
- **Thoi diem:** `progress ∈ [0.00, 0.20]`, tam diem tai `p = 0.00`.
- **Code dinh danh:** `[01 // PRODUCT HERO · LENOVO IDEAPAD GAMING 3]`
- **Y nghia noi dung:** Dinh danh chiec may tram ca nhan dong hanh cung Tran Van Tuyen; the hien phong cach thiet ke cong nghiep hien dai, tram tinh va ben bi.
- **Trang thai Mo hinh 3D:**
  - Nap may: O trang thai he mo nhe 10° - 15° hoac dong kin, tao cam giac bi an san sang danh thuc.
  - Vi tri: Dat tai Right Stage (toa do X khoang +0.8 de khong de len chu ben trai).
  - Xoay tu do: Tich hop idle float drift nhe (quay cham 0.0006 rad/frame theo truc Y). Nguoi dung co the keo chuot (Drag-to-Rotate) de ngam mat lung logo Lenovo.
  - Vat lieu: Kim loai son tinh dien mau Den Bong Dem (Onyx Black / Shadow Black) sang mo, chong bam van tay.
- **Toa do Camera & Target (Desktop):**
  - `cameraPosition: Vector3(-1.8, 1.2, 5.5)`
  - `cameraTarget: Vector3(0.5, 0.2, 0.0)`
- **Noi dung DOM (Left Stage - 46% width):**
  - Nhãn Telemetry: `[HARDWARE PLATFORM // WORKSTATION GRADE]`
  - Tieu de lon: **Lenovo IdeaPad Gaming 3**
  - Phụ de: **Cong cu lap trinh & Nen tang xu ly du lieu cua Tran Van Tuyen**
  - Bio: "Sinh vien CNTT Dai hoc Thuy Loi. Toi uu hoa trai nghiem so va kien truc phan mem tren nen tang phan cung hieu nang cao."
  - Metric row:
    - `CPU: Intel Core i7 10th Gen (8C/16T)`
    - `GPU: NVIDIA GeForce GTX (Turing)`
    - `DISP: 15.6" FHD IPS 120Hz`

---

### CHUONG 2: REVEAL DESIGN · CHASSIS, KEYBOARD & I/O
- **Thoi diem:** `progress ∈ [0.20, 0.40]`, tam diem tai `p = 0.25`.
- **Code dinh danh:** `[02 // INDUSTRIAL DESIGN · CHASSIS & I/O PORTS]`
- **Y nghia noi dung:** Kham pha cong thai hoc, chat luong hoan thien va kha nang giao tiep ngoai vi; tuong ung voi ky nang lap trinh da dang (Ngon ngu loi, Mobile App, Web Cloud).
- **Trang thai Mo hinh 3D:**
  - Nap may: Mo dan tu 15° len **115°** (Goc mo hoan hao de quan sat ban phim va man hinh) dong bo theo toc do cuon chuot tu `p = 0.18` den `p = 0.28`.
  - Camera: Luot thap xuong va tien gan vao cum ban phim TrueStrike va cac cong ket noi.
  - Vung chieu sang: Den Spot Light chieu ro ban phim layout gaming (hanh trinh phim 1.5mm) va cac cong ket noi canh trai.
- **Toa do Camera & Target (Desktop):**
  - `cameraPosition: Vector3(-2.1, 1.5, 3.8)`
  - `cameraTarget: Vector3(0.4, 0.4, 0.1)`
- **Noi dung DOM (Left Stage - 46% width):**
  - Nhan Telemetry: `[CHASSIS ENGINEERING // ERGONOMIC MASTERY]`
  - Tieu de lon: **Nen tang Ky thuat & Cong nghe**
  - Thuyet minh: "Moi dong code chat luong deu can mot cong cu nhap lieu chuan xac. Ban phim TrueStrike hanh trinh 1.5mm voi layout day du giup toi uu hoa toc do go code va giam thieu sai sot."
  - Danh sach nhom ky nang (Anti-AI Text List co duong ke 1px):
    - Ngon ngu loi: Java, C++, TypeScript, Dart
    - Di dong & Nen tang: Flutter, Android SDK, React Native
    - Backend & Cloud: Node.js, Cloudflare Workers, Supabase, PostgreSQL

---

### CHUONG 3: EXPLODED VIEW & X-RAY ARCHITECTURE
- **Thoi diem:** `progress ∈ [0.40, 0.60]`, tam diem tai `p = 0.50`.
- **Code dinh danh:** `[03 // INTERNAL ARCHITECTURE · DUAL-FAN THERMAL]`
- **Y nghia noi dung:** Boc tach tung lop vo may de nhin thau he thong tan nhiet kep, ong dong va bo mach chu; tuong ung voi cac du an thuc chien quy mo lon can he thong chiu tai ben bi.
- **Trang thai Mo hinh 3D:**
  - Hieu ung Boc tach (Exploded View): Mat vo C (Palmrest deck) va nap lung duoc nang nhe len truc Y (`deltaY = +0.65 units`), lam lo ro bo mach chu (Motherboard) ben trong.
  - Che do X-Ray Holographic: Vat lieu vo may chuyen sang `transparent = true`, `opacity = 0.22`, viền wireframe sang bac sieu manh 0.5px.
  - Lo ro: Cum 2 quat tan nhiet (Dual Cooling Fans), 2 ong dan nhiet bang dong (Copper Heatpipes), 2 khe cam RAM sooc-ket DDR4, va thanh pin 45Wh phia duoi.
- **Toa do Camera & Target (Desktop):**
  - `cameraPosition: Vector3(-1.4, 3.2, 3.4)` (Goc nhin cao Top-Down Oblique goc 50°).
  - `cameraTarget: Vector3(0.3, 0.1, -0.1)`
- **Noi dung DOM (Left Stage - 46% width):**
  - Nhan Telemetry: `[SYSTEM ARCHITECTURE // THERMAL INTEGRITY]`
  - Tieu de lon: **Du an Thuc chien & Kien truc He thong**
  - Thuyet minh: "Kha nang duy tri hieu nang on dinh duoi tai nang la yeu to quyet dinh. Cac du an cua toi deu duoc thiet ke voi tu duy toi uu tai nguyen, san sang mo rong va chiu tai cao."
  - Danh sach 3 du an noi bat (Lay tu `projectService` voi link truc tiep):
    - EcoTracker: Ung dung theo doi dau chan carbon (Flutter + Workers AI)
    - TLU EduPortal: Cong thong tin hoc tap tich hop lich thi va diem
    - AeroSpace Telemetry: Bieu do giam sat vieng trac thoi gian thuc

---

### CHUONG 4: SILICON SILHOUETTE · INTEL I7 & NVIDIA GTX
- **Thoi diem:** `progress ∈ [0.60, 0.80]`, tam diem tai `p = 0.75`.
- **Code dinh danh:** `[04 // SILICON CORE · COMPUTE & GRAPHICS ACCELERATION]`
- **Y nghia noi dung:** Soi can canh bo vi xu ly trung tam va chip do hoa; tuong trung cho nang luc phan tich du lieu, thuat toan va chia se tai lieu hoc thuat chuyen sau.
- **Trang thai Mo hinh 3D:**
  - Camera Macro: Camera zoom can canh vao khu vuc chip silicon trung tam tren bo mach.
  - Vung chieu sang: Diem sang hoi tu chieu thang vao 2 tem/chip Node 42 (`intel-10th-i7`) va Node 40 (`Nvidia-GEFORCE-GTX`).
  - Leader lines: Duong giong ky thuat mo ta chi tiet kien truc vi xu ly, so luong nhan/luong, xung nhip turbo va kien truc Turing GPU.
- **Toa do Camera & Target (Desktop):**
  - `cameraPosition: Vector3(-1.6, 1.8, 2.6)`
  - `cameraTarget: Vector3(-0.6, 0.3, 0.5)`
- **Noi dung DOM (Left Stage - 46% width):**
  - Nhan Telemetry: `[COMPUTE ACCELERATION // LOGIC & INTELLIGENCE]`
  - Tieu de lon: **Kho Tai lieu & Nghien cuu Thuat toan**
  - Thuyet minh: "Suc manh tinh toan cua CPU da nhan va GPU cho phep huan luyen mo hinh may hoc nho va xu ly du lieu phuc tap truc tiep tren thiet bi ca nhan. Toi tong hop toan bo kien thuc vao kho tai lieu mo."
  - Thong ke kho tai lieu:
    - 45+ Bo de thi & Bai giang chuyen sau Dai hoc Thuy Loi
    - 12 Chuyen de Thuat toan & Toi uu hoa Co so du lieu
    - Lien ket nhanh toi trang `/resources`

---

### CHUONG 5: REASSEMBLY & FULL HARDWARE SPECS
- **Thoi diem:** `progress ∈ [0.80, 1.00]`, tam diem tai `p = 1.00`.
- **Code dinh danh:** `[05 // BENCHMARK DISPATCH · SPECS & CONTACT]`
- **Y nghia noi dung:** Cac bo phan tu dong thu hoi va lap rap hoan thien; man hinh bat sang bieu thi san sang tiep nhan co hoi viec lam va hop tac du an moi.
- **Trang thai Mo hinh 3D:**
  - Reassembly: Cac bo phan vo may tro ve vi tri hoan hao ban dau, dong nap vo kin khit, tat che do X-Ray, tra lai ve dep kim loai den tuyen sang trong.
  - Man hinh (Node 31): Sang ruc nhe nho shader emissive hien thi logo/giao dien ca nhan Tran Van Tuyen.
  - Toa do: Can doi giua man hinh voi goc quay 3/4 sang trong nhat.
- **Toa do Camera & Target (Desktop):**
  - `cameraPosition: Vector3(-1.5, 1.4, 4.8)`
  - `cameraTarget: Vector3(0.3, 0.3, 0.0)`
- **Noi dung DOM (Left Stage - 46% width):**
  - Nhan Telemetry: `[SYSTEM STATUS // DISPATCH READY · READY FOR HIRE]`
  - Tieu de lon: **Lien he & Hop tac Ky thuat**
  - Bang Thong so Phan cung Chuan (Hardware Specs Specsheet):
    - `PROCESSOR`: Intel Core i7-10750H @ 2.60GHz - 5.00GHz Turbo (6 Cores / 12 Threads)
    - `GRAPHICS`: NVIDIA GeForce GTX 1650 Ti 4GB GDDR6
    - `MEMORY`: 16GB Dual-Channel DDR4 2933MHz
    - `STORAGE`: 512GB NVMe M.2 PCIe Gen3 SSD
    - `DISPLAY`: 15.6" Full HD (1920x1080) 120Hz IPS Anti-Glare
    - `OS`: Linux Fedora / Windows 11 Pro Dev Environment
  - Nut hanh dong:
    - Tuyen dung / Gui Email truc tiep: `tuyen.tran@example.com`
    - Tai CV PDF chuyen nghiep
    - Lien ket GitHub & LinkedIn

---

## 3. HE THONG LEADER LINES / HUD TELEMETRY MOI

### 3.1 Dinh nghia cac Anchor Points tren Mo hinh Laptop
Dua tren ket qua phan tich toan hoc cac mesh trong `public/assets/models/laptop.glb`, he thong anchor points moi duoc thiet lap nhu sau:

| Subsystem ID | Ten Linh Kien | Node / Mesh Nguon | Toa do Local Chuan hoa `[X, Y, Z]` | Chu thich Thong so HUD |
| :--- | :--- | :--- | :--- | :--- |
| `SUBSYS_CPU` | Chip CPU Intel Core i7 | Node 42 (`intel-10th-i7_16`) | `[-0.92, 0.12, 0.65]` | `INTEL CORE I7 // 10TH GEN · 5.0 GHz TURBO` |
| `SUBSYS_GPU` | Chip GPU NVIDIA GeForce | Node 40 (`Nvidia-GEFORCE-GTX_15`) | `[-0.72, 0.12, 0.68]` | `NVIDIA GEFORCE // TURING ARCH · 4GB GDDR6` |
| `SUBSYS_COOLING` | He thong tan nhiet kep | Node 4, 5 (Rear Exhausts) | `[0.00, 0.10, -0.48]` | `DUAL-FAN THERMAL // COPPER HEATPIPES · 4 EXHAUSTS` |
| `SUBSYS_KEYBOARD` | Ban phim TrueStrike | Node 44 (`Vneshniy-vid-Klaviatura-1`) | `[-0.56, 0.11, 0.50]` | `TRUESTRIKE GAMING // 1.5MM TRAVEL · BLUE BACKLIT` |
| `SUBSYS_DISPLAY` | Man hinh 120Hz IPS | Node 31 (`.003` Screen Panel) | `[0.00, 0.82, -0.62]` | `15.6" FHD IPS // 120Hz REFRESH · ANTI-GLARE` |
| `SUBSYS_WEBCAM` | Webcam Privacy Shutter | Node 32 (`Object_32` Top Center) | `[0.00, 1.38, -0.68]` | `720P PRIVACY SHUTTER // DUAL NOISE-CANCEL MICS` |
| `SUBSYS_IO_LEFT` | Cong giao tiep canh trai | Node 7, 9, 11 (Left Ports) | `[-1.08, 0.08, -0.18]` | `I/O EXPANSION // USB-C · HDMI 2.0 · RJ-45 GBE` |
| `SUBSYS_TRACKPAD` | Ban di chuot Precision | Node 16 (`Object_16` Trackpad) | `[-0.24, 0.09, 0.52]` | `PRECISION MYLAR TOUCHPAD // WINDOWS GESTURES` |

---

### 3.2 Giai thuat Chieu 3D-sang-2D & Safe-Zone Exclusion
He thong su dung ham `calculateLeaderLines` trong `src/three/leaderLines.ts` voi cac quy tac bat buoc:
1. **Frustum & Behind-Camera Culling:**
   - Diem 3D duoc chieu qua ma tran View-Projection: `worldPos.project(camera)`.
   - Neu `ndcZ > 1.0` hoac `ndcZ < -1.0` (diem nam sau lung camera hoac vuot qua mat phang xa), lap tuc an duong gióng (`visible = false`).
2. **Safe-Zone Exclusion (Vung an toan tuyet doi):**
   - Cot van ban ben trai chiem 0% den 46% chieu rong man hinh (`width * 0.46`).
   - Bat buoc toan bo diem cuoi cua nhan HUD (`endX`) phai nam ngoai vung nay: `endX >= Math.max(width * 0.48, 480px)` tren Desktop de **loai bo 100% nguy co de chu len noi dung doc**.
   - Tren man hinh di dong (`width < 768px`), he thong tu dong an cac duong gióng phuc tap hoac chuyen thanh huy hieu ngan gon o chan trang.
3. **Duong gap khuc Dogleg Elbow SVG (A -> B -> C):**
   - Doan 1: Tu diem neo 3D tren laptop noi cheo toi diem khuyu `(elbowX, elbowY)`.
   - Doan 2: Tu khuyu chay ngang 100% sang phai toi mep duoi cua khung chu thich HUD.
   - Do day duong line: `0.75px` den `1px`, mau xam kim loai `rgba(255, 255, 255, 0.25)` hoac do gach `rgba(179, 54, 28, 0.6)`.

---

### 3.3 Hardware Telemetry Bar (Thay the Telemetry Vu tru cu)
Doi voi thanh trang thai HUD dinh man hinh (`PinnedScrollytelling.tsx`):
- **Thay the:**
  - `VEL: 7.66 KM/S` -> `CPU FREQ: 4.80 GHz` (Nhay nhe theo progress).
  - `ALT: 550.0 KM` -> `GPU TEMP: 62°C`
  - `GS: TLU HANOI` -> `PROFILE: PERFORMANCE MODE`
- **Chi bao chuong:**
  - `[01 // LNV_HERO]` -> `[02 // LNV_DESIGN]` -> `[03 // LNV_XRAY]` -> `[04 // LNV_SILICON]` -> `[05 // LNV_SPECS]`

---

## 4. STUDIO LIGHTING & POSTPROCESSING SPECIFICATIONS

### 4.1 Mau nen & Khong gian Studio Tech Dark
- **Mau nen WebGL & Body:** `#0A0B0E` (Studio Tech Dark - Den khoang xam kim loai cao cap).
- Khac biet voi mau den vu tru `#030305`: Mau `#0A0B0E` giu sac do trung tinh sang hon mot nhip tinh te, triet tieu hoan toan cam giac chan khong ngoai trai dat, tao ra cam giac buong thu nghiem phan cung (Hardware Cleanroom Lab).
- **Loai bo Starfield:** Go bo hoan toan khoi tao `starfield.ts` khoi canh; thay vao do la nen phang dong nhat ket hop luoi san studio nhe (hoac Ambient Studio Drop Shadow) phia duoi chan may tai `Y = -0.30`.

---

### 4.2 He thong Chieu sang Studio 3 diem (Three-Point Studio Lighting)
Khac voi anh sang don le trong vu tru (Mat troi chieu mot phia), san pham cong nghe cao can anh sang studio da nguon de lam noi bat chat lieu nhua cao cap, kim loai phay xuoc va cac khe gio tinh xao:

1. **Key Light (Den chinh cong nghe):**
   - Loai: `THREE.DirectionalLight`
   - Mau sac: `#FFFFFF` (Trang trung tinh 5500K)
   - Cuong do: `2.2`
   - Vi tri: `Vector3(6.0, 8.0, 5.0)`
   - Tac dung: Tao vung sang ro net tren mat ban phim va khung man hinh.
2. **Fill Light (Den phu chong toi):**
   - Loai: `THREE.DirectionalLight`
   - Mau sac: `#94A3B8` (Xam xanh thep lanh)
   - Cuong do: `0.85`
   - Vi tri: `Vector3(-6.0, 3.0, 4.0)`
   - Tac dung: Xoa bong toi gac mat trai, giup nhin ro cum cong ket noi I/O.
3. **Rim / Contour Light (Den vien kien tao duong net):**
   - Loai: `THREE.DirectionalLight`
   - Mau sac: `#E2E8F0` (Anh bac sang lanh) ket hop phu mau do Legion Red `#E11D48` o goc doi xung
   - Cuong do: `2.6`
   - Vi tri: `Vector3(-4.0, 6.0, -7.0)`
   - Tac dung: Bắt sang vao vien lung may, logo Lenovo phan chieu kim loai va mep sau cua ban le, tao chieu sau tach biet vat the khoi nen toi.
4. **Studio Ambient Light:**
   - Loai: `THREE.AmbientLight`
   - Mau sac: `#12141A`
   - Cuong do: `0.55`
   - Tac dung: Giu cho toan bo vung toi khong bao gio bi den tuyen mat chi tiet.

---

### 4.3 Post-processing & Tone Mapping Pipeline
- **Tone Mapping:** `THREE.ACESFilmicToneMapping` voi `toneMappingExposure = 1.05`.
- **UnrealBloomPass:**
  - `bloomThreshold: 0.92` (Chi kich hoat o nhung diem sang cuc manh nhu den led nguon, led ban phim va tia sang rim light).
  - `bloomStrength: 0.20` (Tiet che, khong gay loe sang neon re tien).
  - `bloomRadius: 0.25`
- **Tu dong ha cap tren thiet bi yeu:** Tich hop san trong `capability.ts` va `postprocessing.ts`, tu dong tat bloom va ha ty le pixel xuong `1.0` khi FPS do duoc < 45 khung/giay.

---

## 5. KE HOACH SUA DOI CAC FILE MA NGUON

### 5.1 Danh sach cac File can Sua doi / Tao moi

| STT | Duong dan File | Hanh dong | Muc dich & Noi dung thay doi |
| :--- | :--- | :--- | :--- |
| 1 | `src/three/states.ts` | Sua doi | Cap nhat 5 chapter states: cameraPosition, cameraTarget moi, them tham so lidAngle, xRayFactor, explodedFactor cho tung chuong. |
| 2 | `src/three/leaderLines.ts` | Sua doi | Thay toan bo anchor points cu thanh 8 anchor points phan cung Laptop Lenovo (CPU, GPU, Cooling, Keyboard, Display...). |
| 3 | `src/three/modelLoader.ts` | Sua doi | Nang cap `LaptopModelManager`: ho tro doc file `laptop.glb`, chuan hoa scale, map dung 45 nodes, ho tro xoay nắp máy (Hinge) va hieu ung X-Ray. Co procedural laptop fallback. |
| 4 | `src/three/SceneManager.ts` | Sua doi | Chuyen doi mau nen thanh `#0A0B0E`, cap nhat Studio Lighting 3 diem, ket noi logic xoay nap may va exploded view theo progress cuon, loai bo starfield. |
| 5 | `src/three/proceduralLaptop.ts` | Tao moi | Module tao mo hinh laptop hop kim toi gian bang Three.js thuan lam fallback 0 KB khi GLB dang tai hoac offline. |
| 6 | `src/components/public/PinnedScrollytelling.tsx` | Sua doi | Thay the metadata 5 chuong, cap nhat Telemetry Bar sang thong so may tinh (CPU FREQ, GPU TEMP), cap nhat van ban noi dung huong ve chiec laptop dong hanh. |
| 7 | `src/pages/Home.tsx` | Sua doi | Chuyen doi mau nen toan trang `#0A0B0E`, doi dong chu huong dan thanh `DRAG TO ROTATE 3D LAPTOP ↺`. |
| 8 | `src/data/profile.ts` | Cap nhat | Bo sung thong tin ve he thong phan cung Lenovo IdeaPad Gaming 3 vao bio va profile. |

---

### 5.2 Chi tiet thiet ke Kien truc `LaptopModelManager` (`src/three/modelLoader.ts`)

```ts
export interface LaptopModelSubsystems {
  lidGroup: THREE.Object3D | null;        // Cum nap man hinh (Node 29)
  screenPanel: THREE.Mesh | null;         // Tam nen LCD (Node 31)
  keyboardMesh: THREE.Mesh | null;        // Ban phim TrueStrike (Node 44)
  cpuNode: THREE.Object3D | null;         // Tem / Chip Intel i7 (Node 42)
  gpuNode: THREE.Object3D | null;         // Tem / Chip Nvidia GTX (Node 40)
  coolingExhaust: THREE.Object3D | null;  // Khe thoat nhiet sau (Node 4, 5)
  leftPorts: THREE.Object3D | null;       // Cong I/O ben trai (Node 7, 9, 11)
  chassisBody: THREE.Object3D | null;     // Vo C & Vo D (Node 14, 15)
}

export class LaptopModelManager {
  // 1. Co che khoi tao tuc thi voi Procedural Laptop Fallback
  // 2. Nap public/assets/models/laptop.glb bat dong bo qua GLTFLoader + DRACOLoader
  // 3. Chuan hoa Scale = TARGET_SIZE / maxDim (scale ~0.0577) va can tam Origin
  // 4. Phuong thuc setLidAngle(radians: number): Xoay cum nap man hinh quanh truc ban le X
  // 5. Phuong thuc setExplodedFactor(factor: number): Nang vo C len Y + 0.65 de lo noi that
  // 6. Phuong thuc setXRayMode(enabled: boolean, opacity: number): Doi vat lieu sang glass/wireframe
  // 7. Phuong thuc getSubsystemWorldPosition(subsystemId, outVec): Cung cap toa do chuan xac cho Leader Lines
}
```

---

## 6. DANH SACH TEST MATRIX CHO AUTO-TESTER (PHASE 3)

Doi ngu `auto-tester` (Subagent 3) bat buoc phai viet va thuc thi thanh cong 100% cac test case duoi day truoc khi chuyen giao cho `qa-inspector`:

### 6.1 Unit Tests cho `src/three/states.ts` (`src/test/three/states.test.ts`)
- **TEST-STATE-01:** Khoi tao du 5 chuong laptop voi day du toa do `cameraPosition`, `cameraTarget`, `lidAngle`, `explodedFactor`.
- **TEST-STATE-02:** Ham `interpolateStates` tra ve toa do hop le, khong xuat hien `NaN` o tat ca cac moc cuon `p = 0.0, 0.25, 0.50, 0.75, 1.0`.
- **TEST-STATE-03:** Xu ly bien an toan khi `p < 0`, `p > 1`, hoac `p = NaN` (tu dong kep ve dải `[0.0, 1.0]`).
- **TEST-STATE-04:** Kiem tra goc mo nap may `lidAngle` tang muot tu 0 rad (dong) toi ~2.0 rad (mo 115°) trong khoang `p ∈ [0.15, 0.35]`.

---

### 6.2 Unit Tests cho `src/three/leaderLines.ts` (`src/test/three/leaderLines.test.ts`)
- **TEST-LEADER-01:** Chieu dung toa do 3D cua cac chip CPU, GPU, Cooling Fans len toa do pixel 2D man hinh khi o phia truoc camera.
- **TEST-LEADER-02:** Phat hien va gan co `isBehind = true` khi linh kien bi quay ra sau camera hoac khuat tam nhin.
- **TEST-LEADER-03:** Sinh chuoi SVG Dogleg Path hop le theo dung cu phap `M x y L x y L x y`.
- **TEST-LEADER-04 (Safe-Zone Exclusion):** Toan bo diem cuoi `endX` tren desktop luon nam ben phai nguong `safeLeftThreshold >= width * 0.46`, dam bao 0% de len van ban cot trai.

---

### 6.3 Unit Tests cho `src/three/modelLoader.ts` (`src/test/three/modelLoader.test.ts`)
- **TEST-MODEL-01:** Khoi tao thanh cong instance mo hinh du phong (procedural laptop) ngay tuc thi voi day du 8 subsystem anchors.
- **TEST-MODEL-02:** Truy van dung toa do the gioi (World Position) cua `SUBSYS_CPU`, `SUBSYS_GPU`, `SUBSYS_COOLING`, `SUBSYS_KEYBOARD`.
- **TEST-MODEL-03:** Xoay nap man hinh bang `setLidAngle` lam thay doi toa do Node man hinh tren truc Y va Z dung quy dao cung tron.
- **TEST-MODEL-04:** Giai phong bo nho an toan (Idempotent Dispose), khong de lai memory leak tren WebGL context.

---

### 6.4 Component & Anti-AI UI Tests (`src/test/components/PinnedScrollytelling.test.tsx`)
- **TEST-UI-01:** Render du 5 chuong noi dung voi dung ma dinh danh (`[01 // PRODUCT HERO]`, `[02 // INDUSTRIAL DESIGN]`, v.v.).
- **TEST-UI-02:** Khong chua bat ky emoji nao trong toan bo nut bam, tieu de va the noi dung.
- **TEST-UI-03:** Khong chua bat ky lop gradient tim/hong (`bg-linear-to-*` mau tim/xanh AI) tren toan bo giao dien.
- **TEST-UI-04:** Toan bo duong vien card deu dat chuan hairline border `0.5px` hoac `1px`, border radius `0px` hoac toi da `4px`.
- **TEST-UI-05:** Tich hop dung lien ket skip-to-content dat chuan Accessibility WCAG AAA.

---

## 7. QUY TRINH BAN GIAO CHO SENIOR-DEV (NEXT STEPS)

Sau khi tai lieu dac ta ky thuat nay duoc phe duyet, Tech Lead / Orchestrator se lap tuc chuyen giao cho **Subagent 2 (`senior-dev`)** voi chi thi:
1. Doc ky file `docs/specs/lenovo-laptop-scrollytelling-spec.md`.
2. Tien hanh tai cau truc cac file trong `src/three/` va `src/components/public/PinnedScrollytelling.tsx` theo dung dac ta tren.
3. Kiem tra va dam bao ung dung chay nuot ma o 60fps, background studio mau `#0A0B0E`, va khong co bat ky loi typecheck nao truoc khi chuyen giao cho `auto-tester`.
