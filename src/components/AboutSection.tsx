import React from 'react';
import { motion } from 'framer-motion';

export const AboutSection: React.FC = () => {
  const milestones = [
    { label: 'NĂM SINH', value: '2005', sub: 'HÀ NỘI, VN' },
    { label: 'TRƯỜNG', value: 'TLU', sub: 'ĐH Thủy Lợi' },
    { label: 'CHUYÊN NGÀNH', value: 'IT', sub: 'Công nghệ Thông tin' }
  ];

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto border-t theme-border overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start" style={{ perspective: 1400 }}>
        {/* Left Column: Heading & Philosophy with 3D Slide & Elevation */}
        <motion.div
          initial={{ opacity: 0, x: -60, y: 30, scale: 0.94 }}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 space-y-6"
        >
          <div className="font-mono text-xs theme-text-muted uppercase tracking-widest flex items-center gap-2">
            <span className="text-[var(--accent-primary)] font-semibold">[03] BIOGRAPHY & PHILOSOPHY</span>
            <span>/</span>
            <span>VỀ TÔI</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight theme-text leading-tight">
            Pure Digital Aesthetics.
          </h2>

          <div className="p-7 rounded-3xl bg-white border border-[rgba(10,11,14,0.1)] space-y-4 font-mono text-xs shadow-sm">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-bold uppercase tracking-wider">
              <span>✦</span>
              <span>TURNING IDEAS INTO REALITY</span>
            </div>
            <p className="leading-relaxed theme-text-secondary text-pretty text-sm font-normal">
              Tôi tin rằng sự quyến rũ đích thực của một sản phẩm kỹ thuật số đến từ tư duy thẩm mỹ sắc sảo của con người và kỹ nghệ code thuần chất lượng cao: từng công thức Shader toán học được cân chỉnh tỉ mỉ, độ nảy của con trỏ chuột, và thứ bậc typography không thể bị thay thế bởi những mẫu sinh tự động rập khuôn.
            </p>
          </div>
        </motion.div>

        {/* Right Column: Detailed Narrative */}
        <motion.div
          initial={{ opacity: 0, x: 60, y: 30, scale: 0.94 }}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
          className="lg:col-span-7 space-y-8 theme-text-secondary font-normal leading-relaxed text-base"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-bold theme-text">
              Trần Văn Tuyên — Sinh năm 2005 · Hà Nội, Việt Nam
            </h3>
            <p className="text-pretty">
              Hiện là sinh viên chuyên ngành <strong className="theme-text font-semibold">Công nghệ Thông tin tại Đại học Thủy lợi (TLU)</strong>. Xuất phát điểm từ nền tảng khoa học máy tính với các ngôn ngữ nền móng như Java, C++, PHP và hệ quản trị cơ sở dữ liệu, tôi đã mở rộng niềm đam mê sang kỹ thuật đồ họa máy tính 3D thời gian thực với WebGL, Three.js và GLSL.
            </p>
            <p className="text-pretty">
              Không dừng lại ở việc tạo ra các giao diện tĩnh truyền thống, tôi định vị bản thân là một <strong className="theme-text font-semibold">Creative Developer</strong> — người đứng ở giao lộ giữa kỹ sư phần mềm chuẩn mực và nhà thiết kế thị giác số. Mỗi dự án là một sự kết hợp giữa hiệu năng tối ưu (60 FPS mượt mà) và trải nghiệm tương tác đáng nhớ.
            </p>
          </div>

          {/* Academic & Milestones Grid with Staggered 3D Card Flip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t theme-border font-mono text-xs" style={{ perspective: 1000 }}>
            {milestones.map((m, idx) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 35, rotateY: 30, scale: 0.88 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.25 }}
                transition={{
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                  delay: 0.2 + idx * 0.12
                }}
                whileHover={{
                  y: -6,
                  scale: 1.04,
                  boxShadow: '0 16px 32px -8px rgba(26, 47, 251, 0.14)'
                }}
                className="p-5 rounded-2xl bg-white border border-[rgba(10,11,14,0.1)] hover:border-[#1a2ffb] transition-all shadow-xs cursor-default"
              >
                <span className="theme-text-muted block mb-1 text-[11px] font-semibold">{m.label}</span>
                <span className="theme-text text-xl font-extrabold tabular-nums block">{m.value}</span>
                <span className="text-[#1a2ffb] text-[10px] block mt-1 font-medium">{m.sub}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
