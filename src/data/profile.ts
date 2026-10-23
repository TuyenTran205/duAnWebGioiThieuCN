export interface Profile {
    name: string;
    birthYear: number;
    title: string;
    subTitle: string;
    university: string;
    faculty: string;
    major: string;
    location: string;
    status: string;
    roles: string[];
    bio: string;
    statement: string;
    skills: {
        category: string;
        items: string[];
    }[];
    hardware: {
        model: string;
        cpu: string;
        gpu: string;
        ram: string;
        storage: string;
        display: string;
    };
    socials: {
        label: string;
        href: string;
        icon: string;
    }[];
}

export const userProfile: Profile = {
    name: "Trần Văn Tuyên",
    birthYear: 2005,
    title: "Creative Developer & 3D Web Designer",
    subTitle: "Web Developer / Front-end Specialist",
    university: "Đại học Thủy lợi (Thuy Loi University - TLU)",
    faculty: "Khoa Công nghệ Thông tin",
    major: "Công nghệ Thông tin (Information Technology)",
    location: "Hà Nội, Việt Nam",
    status: "Available for work & Creative Projects",
    roles: ["Creative Developer", "3D Web Designer", "Full-stack Web Developer", "Mobile Flutter Engineer"],
    statement: "Weaving Code, 3D Shaders & Motion into Immersive Web Experiences.",
    bio: "Sinh năm 2005, sinh viên ngành Công nghệ Thông tin tại Đại học Thủy Lợi (TLU). Tôi đam mê kiến tạo các không gian số tương tác cao, kết hợp giữa tư duy khoa học máy tính chuẩn mực với nghệ thuật đồ họa WebGL/GLSL 3D. Nói không với thiết kế rập khuôn, hướng đến trải nghiệm thị giác thuần chất và hiệu năng 60fps tối đa.",
    skills: [
        {
            category: "3D & Creative Tech",
            items: ["Three.js", "WebGL", "GLSL Custom Shaders", "Simplex Noise Physics", "Interactive 3D Canvas"],
        },
        {
            category: "Modern Web Engineering",
            items: ["React 19", "TypeScript", "Tailwind CSS v4", "Vite", "Framer Motion", "RESTful APIs"],
        },
        {
            category: "Mobile & Cloud AI",
            items: ["Flutter", "Firebase", "Cloudflare Workers AI", "Mobile UI/UX"],
        },
        {
            category: "Core Computer Science",
            items: ["Java", "C++", "PHP", "Cấu trúc dữ liệu & Giải thuật", "Hệ quản trị CSDL", "OOP"],
        },
    ],
    hardware: {
        model: "Lenovo IdeaPad Gaming 3 (15IMH05)",
        cpu: "Intel Core i7-10750H (6C/12T · 5.0 GHz Turbo)",
        gpu: "NVIDIA GeForce GTX 1650 4GB GDDR6",
        ram: "16GB Dual-Channel DDR4 2933MHz",
        storage: "512GB NVMe M.2 PCIe Gen3 SSD",
        display: '15.6" Full HD (1920x1080) 120Hz IPS Anti-Glare',
    },
    socials: [
        { label: "GitHub", href: "https://github.com/TuyenTran205", icon: "github" },
        { label: "Email", href: "mailto:tranvantuyen.dev@gmail.com", icon: "mail" },
        { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin" },
    ],
};
