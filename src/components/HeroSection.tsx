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
            className="relative w-full min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden theme-bg lusion-grain"
        >
            {/* 3D WebGL Background Canvas with Permanent Hyperwave Wireframe Mesh */}
            <div className="absolute inset-0 z-0">
                <OrganicSphereCanvas />
            </div>

            {/* Main Content Hero */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 w-full pointer-events-none">
                <div className="max-w-3xl space-y-6 pointer-events-auto">
                    {/* Badge & Metadata Tag */}
                    <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full border theme-border theme-surface backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                        <span className="font-mono text-[11px] theme-text tracking-wider uppercase font-medium">
                            {userProfile.title}
                        </span>
                        <span className="theme-text-muted">/</span>
                        <span className="font-mono text-[11px] theme-text-secondary">ĐẠI HỌC THỦY LỢI (TLU)</span>
                    </div>

                    {/* Core Statement (Lusion Inspired Bold Editorial) */}
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight theme-text leading-[1.04] text-pretty">
                        Crafting 3D Shaders & Code into Immersive Digital Realms.
                    </h1>

                    {/* Subtext introducing Tran Van Tuyen */}
                    <p className="text-base sm:text-lg theme-text-secondary leading-relaxed max-w-2xl font-normal text-pretty">
                        Tôi là <strong className="theme-text font-semibold">{userProfile.name}</strong> (2005) — Sinh
                        viên Khoa Công nghệ Thông tin, Đại học Thủy lợi. Chuyên sâu về{" "}
                        <span className="theme-text font-medium">Three.js, WebGL & GLSL Shaders</span> kết hợp cùng phát
                        triển ứng dụng Full-stack & Mobile, kiến tạo sản phẩm với hiệu năng cao chuẩn mực và phong cách
                        thiết kế thuần nhất.
                    </p>

                    {/* Interactive Action CTAs */}
                    <div className="pt-4 flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={() => {
                                soundEngine.playClick();
                                onExploreWork();
                            }}
                            onMouseEnter={() => soundEngine.playHover()}
                            className="px-6 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider theme-pill font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg cursor-pointer"
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
                            className="px-6 py-3.5 rounded-full font-mono text-xs uppercase tracking-wider theme-surface hover:theme-surface-solid theme-text border theme-border backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
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
