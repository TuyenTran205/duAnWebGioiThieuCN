import React from "react";
import { OrganicSphereCanvas } from "./OrganicSphereCanvas";
import { userProfile } from "../data/profile";
import { soundEngine } from "../lib/soundEngine";

interface HeroSectionProps {
  onExploreWork: () => void;
  onContact: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreWork, onContact }) => {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-center pt-20 sm:pt-24 pb-12 sm:pb-16 overflow-hidden theme-bg lusion-grain"
    >
      {/* 3D WebGL Background Canvas with Permanent Hyperwave Wireframe Mesh */}
      <div className="absolute inset-0 z-0">
        <OrganicSphereCanvas />
      </div>

      {/* Main Content Hero */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full pointer-events-none">
        <div className="max-w-3xl space-y-5 sm:space-y-6 pointer-events-auto">
          {/* Badge & Metadata Tag */}
          <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-1.5 rounded-full border theme-border theme-surface backdrop-blur-md max-w-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0 animate-ping" />
            <span className="font-mono text-[10px] sm:text-[11px] theme-text tracking-wider uppercase font-semibold">
              {userProfile.title}
            </span>
            <span className="theme-text-muted hidden xs:inline">/</span>
            <span className="font-mono text-[10px] sm:text-[11px] theme-text-secondary truncate">
              ĐẠI HỌC THỦY LỢI (TLU)
            </span>
          </div>

          {/* Core Statement (Lusion Inspired Bold Editorial) */}
          <h1 className="text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight theme-text leading-[1.08] sm:leading-[1.04] text-pretty">
            Crafting 3D Shaders & Code into Immersive Digital Realms.
          </h1>

          {/* Subtext introducing Tran Van Tuyen */}
          <p className="text-sm sm:text-lg theme-text-secondary leading-relaxed max-w-2xl font-normal text-pretty">
            Tôi là <strong className="theme-text font-semibold">{userProfile.name}</strong> (2005) — Sinh
            viên Khoa Công nghệ Thông tin, Đại học Thủy lợi. Chuyên sâu về{" "}
            <span className="theme-text font-medium">Three.js, WebGL & GLSL Shaders</span> kết hợp cùng phát
            triển ứng dụng Full-stack & Mobile, kiến tạo sản phẩm với hiệu năng cao chuẩn mực và phong cách
            thiết kế thuần nhất.
          </p>

          {/* Interactive Action CTAs */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onExploreWork();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider theme-pill font-semibold hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <span>Xem các dự án tiêu biểu</span>
              <span>↓</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onContact();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider theme-surface hover:theme-surface-solid theme-text border theme-border backdrop-blur-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <span>Liên hệ kết nối</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
