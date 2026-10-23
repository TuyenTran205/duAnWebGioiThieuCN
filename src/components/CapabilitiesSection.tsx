import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { userProfile } from '../data/profile';
import { soundEngine } from '../lib/soundEngine';

interface PillarVisualProps {
  index: number;
  isHovered: boolean;
}

const PillarVisualCanvas: React.FC<PillarVisualProps> = ({ index, isHovered }) => {
  return (
    <div className="relative w-full h-44 sm:h-64 rounded-2xl overflow-hidden border theme-border bg-[#f2f4fa] flex items-center justify-center">
      {/* Background Architectural Grid Pattern */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(26, 47, 251, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 47, 251, 0.15) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Dynamic 3D Geometric Artwork per Pillar */}
      {index === 0 && (
        <svg
          viewBox="0 0 280 160"
          className={`w-56 sm:w-64 h-36 sm:h-40 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
            isHovered ? 'scale-115 rotate-6' : 'scale-100'
          }`}
          strokeWidth="1.3"
        >
          <polygon points="140,20 220,55 220,115 140,150 60,115 60,55" strokeDasharray="3 2" />
          <polygon points="140,40 195,65 195,105 140,130 85,105 85,65" />
          <line x1="140" y1="20" x2="140" y2="150" strokeOpacity="0.4" />
          <line x1="60" y1="55" x2="220" y2="115" strokeOpacity="0.4" />
          <line x1="60" y1="115" x2="220" y2="55" strokeOpacity="0.4" />
          <circle cx="140" cy="85" r="10" className="fill-[#1a2ffb]/20" />
          <circle cx="140" cy="85" r="3" className="fill-[#1a2ffb]" />
        </svg>
      )}

      {index === 1 && (
        <svg
          viewBox="0 0 280 160"
          className={`w-56 sm:w-64 h-36 sm:h-40 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
            isHovered ? 'scale-115' : 'scale-100'
          }`}
          strokeWidth="1.4"
        >
          <rect x="30" y="25" width="220" height="110" rx="10" strokeDasharray="4 3" />
          <rect x="50" y="45" width="80" height="35" rx="6" className="fill-white" />
          <rect x="150" y="45" width="80" height="35" rx="6" className="fill-white" />
          <rect x="50" y="90" width="180" height="30" rx="6" className="fill-[#1a2ffb]/10" />
          <circle cx="90" cy="62" r="4" className="fill-[#1a2ffb]" />
          <circle cx="190" cy="62" r="4" className="fill-[#1a2ffb]" />
          <path d="M 90,62 L 140,105 L 190,62" strokeWidth="1.2" strokeOpacity="0.5" />
        </svg>
      )}

      {index === 2 && (
        <svg
          viewBox="0 0 280 160"
          className={`w-56 sm:w-64 h-36 sm:h-40 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
            isHovered ? 'scale-115 -rotate-3' : 'scale-100'
          }`}
          strokeWidth="1.3"
        >
          <rect x="95" y="15" width="90" height="130" rx="14" strokeWidth="1.6" className="fill-white/60" />
          <circle cx="140" cy="132" r="3.5" className="fill-[#1a2ffb]" />
          <line x1="120" y1="24" x2="160" y2="24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="45" cy="50" r="6" className="fill-[#1a2ffb]/20" />
          <circle cx="45" cy="110" r="6" className="fill-[#1a2ffb]/20" />
          <circle cx="235" cy="50" r="6" className="fill-[#1a2ffb]/20" />
          <circle cx="235" cy="110" r="6" className="fill-[#1a2ffb]/20" />
          <path d="M 45,50 L 95,65 M 45,110 L 95,95 M 235,50 L 185,65 M 235,110 L 185,95" strokeDasharray="3 2" />
        </svg>
      )}

      {index === 3 && (
        <svg
          viewBox="0 0 280 160"
          className={`w-56 sm:w-64 h-36 sm:h-40 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
            isHovered ? 'scale-115 rotate-2' : 'scale-100'
          }`}
          strokeWidth="1.3"
        >
          <circle cx="140" cy="30" r="12" className="fill-white" />
          <circle cx="85" cy="80" r="10" className="fill-white" />
          <circle cx="195" cy="80" r="10" className="fill-white" />
          <circle cx="55" cy="130" r="8" className="fill-[#1a2ffb]/20" />
          <circle cx="115" cy="130" r="8" className="fill-[#1a2ffb]/20" />
          <circle cx="165" cy="130" r="8" className="fill-[#1a2ffb]/20" />
          <circle cx="225" cy="130" r="8" className="fill-[#1a2ffb]/20" />
          <path d="M 140,42 L 85,70 M 140,42 L 195,70 M 85,90 L 55,122 M 85,90 L 115,122 M 195,90 L 165,122 M 195,90 L 225,122" />
        </svg>
      )}

      <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 font-mono text-[9px] sm:text-[10px] theme-text-muted px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-sm border theme-border font-medium">
        VIEWPORT // 0{index + 1}
      </div>
      <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 font-mono text-[9px] sm:text-[10px] text-[#1a2ffb] font-bold flex items-center gap-1.5 bg-white/90 px-2.5 py-1 rounded-full border theme-border">
        <span className="w-1.5 h-1.5 rounded-full bg-[#1a2ffb] animate-ping" />
        <span>INTERACTIVE STACK</span>
      </div>
    </div>
  );
};

export const CapabilitiesSection: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const pillarDetails = [
    {
      dots: 'creative • webgl • 3d • glsl shaders • physics simulation',
      description: 'Làm chủ Three.js và tự viết Custom GLSL Shaders thời gian thực. Ứng dụng Simplex Noise 3D, hiệu ứng quang học Fresnel, ánh xạ môi trường và tối ưu hóa GPU pipeline đạt 60 FPS mượt mà.'
    },
    {
      dots: 'react 19 • typescript • tailwind css v4 • vite • web architecture',
      description: 'Xây dựng kiến trúc web hiện đại với React 19, Type-safe TypeScript và Tailwind CSS v4. Đảm bảo cấu trúc code sạch, component modular, responsive chuẩn công thái học và tải trang dưới 1 giây.'
    },
    {
      dots: 'flutter • dart • firebase • cloudflare workers ai • mobile ux',
      description: 'Phát triển ứng dụng di động đa nền tảng (iOS & Android) bằng Flutter. Tích hợp AI biên với Cloudflare Workers AI và đồng bộ dữ liệu thời gian thực qua Firebase Firestore.'
    },
    {
      dots: 'java • c++ • php • data structures • algorithms • database',
      description: 'Nền tảng khoa học máy tính chuẩn mực từ Khoa CNTT - Đại học Thủy lợi. Tư duy lập trình hướng đối tượng (OOP), tối ưu độ phức tạp thuật toán và thiết kế hệ thống CSDL quan hệ chặt chẽ.'
    }
  ];

  return (
    <section id="capabilities" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t theme-border overflow-hidden">
      {/* Section Header */}
      <div className="space-y-3 mb-10 sm:mb-16">
        <div className="font-mono text-xs text-[#5e6473] uppercase tracking-widest flex items-center gap-2">
          <span className="text-[#1a2ffb] font-bold">[02] TECHNICAL ARSENAL</span>
          <span>/</span>
          <span>NĂNG LỰC CÔNG NGHỆ</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0a0b0e]">
          Capabilities & Core Engineering.
        </h2>
        <p className="text-sm sm:text-base text-[#2f3441] max-w-2xl font-normal leading-relaxed text-pretty">
          Nền tảng kỹ thuật vững chắc từ ngành Công nghệ Thông tin Đại học Thủy lợi kết hợp cùng năng lực tự nghiên cứu và làm chủ các công nghệ đồ họa tương tác 3D WebGL hiện đại.
        </p>
      </div>

      {/* 3D Spatial Unfold Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" style={{ perspective: 1600 }}>
        {userProfile.skills.map((pillar, idx) => {
          const isHovered = hoveredIndex === idx;
          const meta = pillarDetails[idx];

          return (
            <motion.div
              key={pillar.category}
              initial={{
                opacity: 0,
                y: 45,
                rotateX: 16,
                scale: 0.94,
                filter: 'blur(4px)'
              }}
              whileInView={{
                opacity: 1,
                y: 0,
                rotateX: 0,
                scale: 1,
                filter: 'blur(0px)'
              }}
              viewport={{ once: false, amount: 0.15 }}
              transition={{
                duration: 0.75,
                ease: [0.16, 1, 0.3, 1],
                delay: idx * 0.1
              }}
              whileHover={{
                y: -8,
                scale: 1.015,
                boxShadow: '0 24px 48px -12px rgba(26, 47, 251, 0.16), 0 12px 24px -8px rgba(10, 11, 14, 0.08)',
                transition: { duration: 0.3, ease: 'easeOut' }
              }}
              style={{
                transformOrigin: '50% 100%',
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity, filter'
              }}
              onMouseEnter={() => {
                setHoveredIndex(idx);
                soundEngine.playHover();
              }}
              onMouseLeave={() => setHoveredIndex(null)}
              className="p-5 sm:p-9 rounded-3xl bg-white border border-[rgba(10,11,14,0.1)] hover:border-[#1a2ffb] transition-colors duration-300 space-y-5 sm:space-y-6 relative group shadow-sm flex flex-col justify-between cursor-default"
            >
              {/* Card Top: Lusion Dot-Separated Micro Categories & Header */}
              <div className="space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
                  <span className="text-[#1a2ffb] font-bold tracking-wider sm:tracking-widest uppercase truncate mr-2">
                    {meta.dots}
                  </span>
                  <span className="text-[#5e6473] font-semibold bg-[#f2f4fa] px-2 sm:px-2.5 py-0.5 rounded-full border theme-border shrink-0">
                    0{idx + 1}
                  </span>
                </div>

                <h3 className="text-xl sm:text-3xl font-extrabold text-[#0a0b0e] group-hover:text-[#1a2ffb] transition-colors tracking-tight">
                  {pillar.category}
                </h3>
              </div>

              {/* Card Center: Widescreen Visual Canvas */}
              <PillarVisualCanvas index={idx} isHovered={isHovered} />

              {/* Card Bottom: Description & Skill Pills */}
              <div className="space-y-4 pt-1">
                <p className="text-sm text-[#2f3441] leading-relaxed text-pretty font-normal">
                  {meta.description}
                </p>

                <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2 border-t border-[rgba(10,11,14,0.06)]">
                  {pillar.items.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#f2f4fa] border border-[rgba(10,11,14,0.08)] font-mono text-xs text-[#2f3441] group-hover:border-[#1a2ffb]/40 hover:bg-white hover:text-[#0a0b0e] transition-colors font-medium shadow-2xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
