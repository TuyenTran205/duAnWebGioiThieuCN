import React, { useState } from "react";
import { motion } from "framer-motion";
import { userProfile } from "../data/profile";
import { soundEngine } from "../lib/soundEngine";
import { getSafeUrl } from "../lib/security";

export const FooterSection: React.FC = () => {
    const [copied, setCopied] = useState(false);
    const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
    const email = "tranvantuyen.dev@gmail.com";

    const handleCopyEmail = () => {
        soundEngine.playClick();
        navigator.clipboard.writeText(email);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setSpotlight({ x, y });
    };

    return (
        <footer
            id="contact"
            className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t theme-border overflow-hidden"
        >
            <div className="space-y-10 sm:space-y-16" style={{ perspective: 1200 }}>
                {/* Call to action heading with Lusion radial spotlight hover & 3D Levitation */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: false, amount: 0.18 }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                    onMouseMove={handleMouseMove}
                    className="relative p-6 sm:p-14 rounded-3xl border border-[rgba(10,11,14,0.1)] bg-white overflow-hidden space-y-4 sm:space-y-6 shadow-sm"
                    style={{
                        backgroundImage: `radial-gradient(640px circle at ${spotlight.x}% ${spotlight.y}%, rgba(26, 47, 251, 0.12), transparent 70%)`,
                    }}
                >
                    <div className="font-mono text-xs theme-text-muted uppercase tracking-widest flex items-center gap-2">
                        <span className="text-[#1a2ffb] font-bold">[04] GET IN TOUCH</span>
                        <span>/</span>
                        <span>LIÊN HỆ HỢP TÁC</span>
                    </div>

                    <h2 className="text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-[#0a0b0e] hover:text-[#1a2ffb] transition-colors duration-500 leading-tight">
                        LET'S CRAFT SOMETHING UNFORGETTABLE.
                    </h2>

                    <p className="text-sm sm:text-lg text-[#2f3441] max-w-2xl font-normal text-pretty leading-relaxed">
                        Bạn đang tìm kiếm một Creative Developer sẵn sàng biến các ý tưởng thiết kế phức tạp thành hiện
                        thực 3D tương tác mượt mà? Hãy gửi tin nhắn ngay hôm nay.
                    </p>
                </motion.div>

                {/* Contact Grid with Staggered 3D Cascade */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {/* Email Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.18 }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(10,11,14,0.1)] space-y-4 shadow-sm flex flex-col justify-between"
                    >
                        <div className="space-y-2">
                            <span className="font-mono text-xs text-[#5e6473] uppercase tracking-wider block font-semibold">
                                Direct Contact (Email)
                            </span>
                            <p className="font-mono text-sm sm:text-base text-[#0a0b0e] font-bold break-all">{email}</p>
                        </div>
                        <div className="pt-2 flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 sm:gap-3">
                            <a
                                href={getSafeUrl(`mailto:${email}`)}
                                className="px-5 py-3 rounded-xl font-mono text-xs bg-[#0a0b0e] text-white hover:bg-[#1a2ffb] active:scale-98 transition-all font-semibold text-center shadow-sm"
                            >
                                Gửi Email Ngay ↗
                            </a>
                            <button
                                type="button"
                                onClick={handleCopyEmail}
                                className="px-4 py-3 rounded-xl font-mono text-xs bg-[#f2f4fa] border border-[rgba(10,11,14,0.08)] text-[#0a0b0e] hover:border-[#1a2ffb] active:scale-98 transition-all cursor-pointer font-medium text-center"
                            >
                                {copied ? "Đã sao chép! ✓" : "Sao chép"}
                            </button>
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.18 }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(10,11,14,0.1)] space-y-4 shadow-sm"
                    >
                        <span className="font-mono text-xs text-[#5e6473] uppercase tracking-wider block font-semibold">
                            Digital Footprint
                        </span>
                        <div className="space-y-2 font-mono text-sm">
                            <a
                                href={getSafeUrl("https://github.com/TuyenTran205")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-[#2f3441] hover:text-[#1a2ffb] p-3 rounded-xl hover:bg-[#f2f4fa] active:scale-98 transition-all font-medium"
                            >
                                <span>GitHub (TuyenTran205)</span>
                                <span>↗</span>
                            </a>
                            <a
                                href={getSafeUrl("https://github.com/TuyenTran205/duAnWebGioiThieuCN")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between text-[#2f3441] hover:text-[#1a2ffb] p-3 rounded-xl hover:bg-[#f2f4fa] active:scale-98 transition-all font-medium"
                            >
                                <span>Repository Hub</span>
                                <span>↗</span>
                            </a>
                        </div>
                    </motion.div>

                    {/* Location & Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.96 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.18 }}
                        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        whileHover={{ y: -6, scale: 1.02 }}
                        className="p-6 sm:p-8 rounded-3xl bg-white border border-[rgba(10,11,14,0.1)] space-y-4 shadow-sm"
                    >
                        <span className="font-mono text-xs text-[#5e6473] uppercase tracking-wider block font-semibold">
                            Base Location & Status
                        </span>
                        <div className="font-mono text-sm text-[#0a0b0e] space-y-1">
                            <p className="font-bold">Hà Nội, Việt Nam</p>
                            <p className="text-[#5e6473] text-xs">GMT+7 (Indochina Time)</p>
                        </div>
                        <div className="pt-2 flex items-center gap-2 font-mono text-xs text-emerald-600 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Sẵn sàng cho dự án & vị trí mới</span>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Meta bottom */}
                <div className="pt-8 sm:pt-12 border-t border-[rgba(10,11,14,0.08)] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 font-mono text-xs text-[#5e6473] text-center sm:text-left">
                    <p>
                        © {new Date().getFullYear()} {userProfile.name} · All rights reserved.
                    </p>
                    <p className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs">
                        <span>BUILT WITH REACT, THREE.JS & CUSTOM GLSL</span>
                        <span>·</span>
                        <span>AGENT</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};
