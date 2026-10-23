export interface Project {
  id: string;
  code: string;
  title: string;
  category: string;
  tags: string[];
  description: string;
  longDescription: string;
  technologies: string[];
  highlights: string[];
  link: string;
  github?: string;
  year: string;
  status: 'Completed' | 'In Development' | 'Experimental';
}

export const projectsData: Project[] = [
  {
    id: '1',
    code: 'EXP-01',
    title: '3D Interactive Portfolio & Shader Engine',
    category: '3D WebGL & Creative Dev',
    tags: ['web', '3d', 'glsl-shader', 'three.js'],
    description: 'Không gian số tương tác 3D với Custom GLSL Simplex Noise Shader mô phỏng chất lỏng hữu cơ và tương tác vật lý chuột thời gian thực.',
    longDescription: 'Xây dựng hoàn toàn bằng Three.js với Vertex & Fragment Shaders viết tay (GLSL). Tích hợp thuật toán Simplex Noise 3D biến dạng bề mặt theo tọa độ chuột và gia tốc cuộn trang, xử lý Fresnel glow phản chiếu ánh sáng và kiểm soát hiệu năng ổn định 60fps trên mọi thiết bị.',
    technologies: ['Three.js', 'WebGL', 'GLSL Shaders', 'React 19', 'TypeScript', 'Tailwind CSS v4'],
    highlights: ['Simplex Noise 3D Deformation', 'Fresnel & Chromatic Dispersion', 'GPU Performance Optimization', '60 FPS Smooth Render'],
    link: '#',
    github: 'https://github.com/TuyenTran205/duAnWebGioiThieuCN',
    year: '2026',
    status: 'Completed'
  },
  {
    id: '2',
    code: 'APP-02',
    title: 'Health Tracker AI Application',
    category: 'Mobile AI & HealthTech',
    tags: ['mobile', 'flutter', 'cloudflare-ai', 'healthtech'],
    description: 'Ứng dụng di động theo dõi và phân tích sức khỏe cá nhân tích hợp trí tuệ nhân tạo Cloudflare Workers AI.',
    longDescription: 'Ứng dụng mobile xây dựng trên nền tảng Flutter đa nền tảng, kết nối với Cloudflare Workers AI để phân tích dữ liệu sinh trắc học và đưa ra khuyến nghị dinh dưỡng, luyện tập thông minh theo thời gian thực.',
    technologies: ['Flutter', 'Dart', 'Cloudflare Workers AI', 'REST API', 'Provider / Riverpod'],
    highlights: ['Trợ lý phân tích sức khỏe AI thời gian thực', 'Biểu đồ trực quan hóa dữ liệu sinh học', 'Kiến trúc BLoC/Provider tối ưu', 'Đa nền tảng iOS & Android'],
    link: 'https://github.com/Tqh2410/g9-personal-health-tracker/tree/feature/trang-chu',
    github: 'https://github.com/Tqh2410/g9-personal-health-tracker/tree/feature/trang-chu',
    year: '2025 - 2026',
    status: 'In Development'
  },
  {
    id: '3',
    code: 'APP-03',
    title: 'Expense Tracker Mobile System',
    category: 'Mobile Finance & Cloud',
    tags: ['mobile', 'flutter', 'firebase', 'fintech'],
    description: 'Hệ thống quản lý tài chính cá nhân & nhóm với đồng bộ dữ liệu đám mây thời gian thực trên Firebase.',
    longDescription: 'Dự án phối hợp nhóm phát triển ứng dụng quản lý thu chi, lập ngân sách chi tiêu và báo cáo tài chính trực quan. Hỗ trợ phân quyền nhóm, kiểm soát dòng tiền và thông báo ngân sách.',
    technologies: ['Flutter', 'Firebase Firestore', 'Firebase Auth', 'Cloud Functions', 'Chart Visualization'],
    highlights: ['Đồng bộ đám mây thời gian thực với Firestore', 'Phân bổ ngân sách & cảnh báo chi tiêu', 'Báo cáo thống kê biểu đồ động', 'Bảo mật xác thực đa tầng'],
    link: 'https://github.com/TuyenTran205/Expense-Tracker-App',
    github: 'https://github.com/TuyenTran205/Expense-Tracker-App',
    year: '2025',
    status: 'Completed'
  },
  {
    id: '4',
    code: 'HUB-04',
    title: 'TLU Document & Academic Hub',
    category: 'Full-stack Web & Academic',
    tags: ['web', 'react', 'typescript', 'education'],
    description: 'Cổng thông tin chia sẻ tài liệu học tập và hồ sơ sinh viên Khoa CNTT - Đại học Thủy lợi.',
    longDescription: 'Nền tảng web hỗ trợ tra cứu, tìm kiếm và lưu trữ tài liệu môn học, đồ án và tài nguyên học thuật dành cho sinh viên Đại học Thủy Lợi. Tối ưu giao diện nhanh gọn, trực quan và tiện dụng.',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Supabase'],
    highlights: ['Tra cứu tài liệu theo học kỳ & môn học', 'Xem trước tài liệu PDF trực tuyến', 'Giao diện tối giản chuẩn công thái học', 'Hệ thống đánh dấu tài liệu yêu thích'],
    link: 'https://github.com/TuyenTran205/duAnWebGioiThieuCN',
    github: 'https://github.com/TuyenTran205/duAnWebGioiThieuCN',
    year: '2025',
    status: 'Completed'
  }
];
