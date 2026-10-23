import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { projectsData, type Project } from '../data/projects';
import { soundEngine } from '../lib/soundEngine';
import { getSafeUrl, isSafeUrl } from '../lib/security';

// Individual 3D Interactive Tilt Project Card
interface ProjectCardProps {
  project: Project;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ProjectCardItem: React.FC<ProjectCardProps> = ({
  project,
  index,
  isExpanded,
  onToggleExpand
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: false, amount: 0.18 });
  const [rotateX, setRotateX] = useState<number>(0);
  const [rotateY, setRotateY] = useState<number>(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Direction: odd items come from Left, even items come from Right
  const isFromLeft = index % 2 === 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable 3D tilt tracking on non-hover touch devices to ensure smooth touch scrolling
    if (window.matchMedia && !window.matchMedia('(hover: hover)').matches) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Calculate normalized rotation (-8deg to +8deg)
    const normX = (x / rect.width - 0.5) * 2;
    const normY = (y / rect.height - 0.5) * 2;

    setRotateX(-normY * 8);
    setRotateY(normX * 8);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    soundEngine.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const renderSchematic = () => {
    return (
      <div className="relative w-full h-40 sm:h-52 rounded-2xl overflow-hidden border theme-border bg-[#f2f4fa] flex items-center justify-center">
        {/* Architectural Grid pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(26, 47, 251, 0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 47, 251, 0.15) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />

        {/* Dynamic Project SVGs with 3D hover parallax */}
        {project.id === '1' && (
          <svg
            viewBox="0 0 240 140"
            className={`w-44 sm:w-48 h-28 sm:h-32 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
              isHovered ? 'scale-115 rotate-6' : 'scale-100'
            }`}
            strokeWidth="1.3"
          >
            <circle cx="120" cy="70" r="46" strokeDasharray="4 3" />
            <ellipse cx="120" cy="70" rx="46" ry="18" />
            <ellipse cx="120" cy="70" rx="18" ry="46" />
            <circle cx="120" cy="70" r="6" className="fill-[#1a2ffb]" />
            <path d="M 80,70 Q 120,30 160,70" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        )}
        {project.id === '2' && (
          <svg
            viewBox="0 0 240 140"
            className={`w-44 sm:w-48 h-28 sm:h-32 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
              isHovered ? 'scale-115' : 'scale-100'
            }`}
            strokeWidth="1.5"
          >
            <polyline points="20,90 60,90 78,42 98,112 118,28 138,98 156,70 220,70" />
            <circle cx="118" cy="28" r="5" className="fill-[#1a2ffb]" />
            <rect x="20" y="18" width="200" height="104" rx="10" strokeOpacity="0.3" />
          </svg>
        )}
        {project.id === '3' && (
          <svg
            viewBox="0 0 240 140"
            className={`w-44 sm:w-48 h-28 sm:h-32 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
              isHovered ? 'scale-115 -rotate-3' : 'scale-100'
            }`}
            strokeWidth="1.4"
          >
            <rect x="42" y="76" width="24" height="42" rx="3" />
            <rect x="82" y="52" width="24" height="66" rx="3" />
            <rect x="122" y="32" width="24" height="86" rx="3" className="fill-[#1a2ffb]/15" />
            <rect x="162" y="44" width="24" height="74" rx="3" />
            <path d="M40 68 L94 42 L134 24 L174 36" strokeDasharray="3 3" />
          </svg>
        )}
        {project.id === '4' && (
          <svg
            viewBox="0 0 240 140"
            className={`w-44 sm:w-48 h-28 sm:h-32 stroke-[#1a2ffb] fill-none transition-transform duration-700 ease-out ${
              isHovered ? 'scale-115 rotate-1' : 'scale-100'
            }`}
            strokeWidth="1.3"
          >
            {/* Outer Court Boundary */}
            <rect x="24" y="20" width="192" height="100" rx="8" />
            {/* Center Half-Court Line */}
            <line x1="120" y1="20" x2="120" y2="120" strokeDasharray="4 3" />
            {/* Center Circle & Spot */}
            <circle cx="120" cy="70" r="22" strokeDasharray="3 2" />
            <circle cx="120" cy="70" r="3" className="fill-[#1a2ffb]" />
            {/* Left Court Key / Box */}
            <rect x="24" y="42" width="36" height="56" rx="4" />
            {/* Right Court Key / Box */}
            <rect x="180" y="42" width="36" height="56" rx="4" />
            {/* Real-time active reserved slot indicators */}
            <circle cx="160" cy="54" r="5" className="fill-[#1a2ffb]/20" />
            <circle cx="160" cy="54" r="2.5" className="fill-[#1a2ffb]" />
            <circle cx="80" cy="86" r="5" className="fill-[#1a2ffb]/20" />
            <circle cx="80" cy="86" r="2.5" className="fill-[#1a2ffb]" />
          </svg>
        )}

        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 font-mono text-[9px] sm:text-[10px] theme-text-muted px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-sm border theme-border font-medium">
          SCHEMATIC // 0{project.id}
        </div>
        <div className="absolute top-2.5 sm:top-3 right-2.5 sm:right-3 font-mono text-[9px] sm:text-[10px] text-[#1a2ffb] font-bold flex items-center gap-1.5 bg-white/90 px-2 py-0.5 rounded-full border theme-border">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1a2ffb] animate-ping" />
          <span>3D ARCHITECTURE</span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={cardRef}
      style={{ perspective: 1400 }}
      className="w-full my-4 sm:my-6"
    >
      <motion.div
        initial={{
          opacity: 0,
          x: isFromLeft ? -50 : 50,
          y: 40,
          scale: 0.96
        }}
        animate={
          isInView
            ? {
                opacity: 1,
                x: 0,
                y: isHovered ? -6 : 0,
                rotateY: rotateY,
                rotateX: rotateX,
                scale: isHovered ? 1.012 : 1.0
              }
            : {
                opacity: 0,
                x: isFromLeft ? -50 : 50,
                y: 40,
                scale: 0.96
              }
        }
        transition={{
          duration: 0.75,
          ease: [0.16, 1, 0.3, 1]
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: isHovered
            ? '0 24px 48px -12px rgba(26, 47, 251, 0.18), 0 12px 24px -8px rgba(10, 11, 14, 0.1)'
            : '0 8px 24px -4px rgba(10, 11, 14, 0.05)'
        }}
        className={`relative rounded-3xl bg-white border transition-colors duration-300 overflow-hidden ${
          isExpanded || isHovered
            ? 'border-[#1a2ffb]'
            : 'border-[rgba(10,11,14,0.1)]'
        }`}
      >
        {/* Dynamic Light Glare Reflection following Cursor */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${glarePos.x}% ${glarePos.y}%, rgba(26, 47, 251, 0.08), transparent 70%)`
            }}
          />
        )}

        {/* Card Header Row */}
        <div
          onClick={() => {
            soundEngine.playClick();
            onToggleExpand();
          }}
          className="p-5 sm:p-9 cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center"
        >
          {/* Left Visual Schematic Preview (4 cols on desktop) */}
          <div className="lg:col-span-4" style={{ transform: 'translateZ(25px)' }}>
            {renderSchematic()}
          </div>

          {/* Right Project Info (8 cols on desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-between gap-4" style={{ transform: 'translateZ(35px)' }}>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="font-mono text-xs text-[#1a2ffb] font-bold tracking-widest px-2.5 py-1 rounded-md bg-[#1a2ffb]/10">
                  {project.code}
                </span>
                <span className="theme-text-muted font-mono text-xs">·</span>
                <span className="font-mono text-[11px] sm:text-xs theme-text-secondary uppercase tracking-wider font-semibold">
                  {project.category}
                </span>
                <span className="theme-text-muted font-mono text-xs">·</span>
                <span className="font-mono text-xs theme-text-muted tabular-nums">
                  {project.year}
                </span>
              </div>

              <h3 className="text-xl sm:text-3xl font-extrabold text-[#0a0b0e] group-hover:text-[#1a2ffb] transition-colors tracking-tight">
                {project.title}
              </h3>

              <p className="text-sm sm:text-base text-[#2f3441] max-w-2xl font-normal leading-relaxed text-pretty">
                {project.description}
              </p>
            </div>

            {/* Tags & Expand Indicator */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 sm:gap-4 border-t border-[rgba(10,11,14,0.06)]">
              <div className="flex flex-wrap gap-1.5 sm:gap-2 font-mono text-[11px]">
                {project.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#f2f4fa] border border-[rgba(10,11,14,0.08)] text-[#2f3441] font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <div className="inline-flex items-center gap-2 font-mono text-xs text-[#0a0b0e] font-semibold w-full sm:w-auto justify-end pt-1 sm:pt-0">
                <span className="text-[11px] sm:text-xs">
                  {isExpanded ? 'Thu gọn chi tiết' : 'Khám phá chi tiết 3D'}
                </span>
                <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[rgba(10,11,14,0.18)] flex items-center justify-center bg-white text-[#1a2ffb] font-bold shadow-sm group-hover:border-[#1a2ffb] transition-all">
                  {isExpanded ? '−' : '+'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Technical Detail Drawer */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="px-5 sm:px-9 pb-7 sm:pb-9 pt-5 sm:pt-6 border-t border-[rgba(10,11,14,0.08)] bg-[#f7f9fc] space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#5e6473] font-bold">
                  Kiến trúc kỹ thuật & Giải pháp
                </h4>
                <p className="text-sm text-[#2f3441] leading-relaxed text-pretty font-normal">
                  {project.longDescription}
                </p>

                <div className="space-y-2 pt-2">
                  <h5 className="font-mono text-xs text-[#5e6473] uppercase font-bold">
                    Điểm nổi bật kỹ thuật:
                  </h5>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0a0b0e] font-mono">
                    {project.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-[#1a2ffb] font-bold shrink-0">▹</span>
                        <span className="font-medium">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-5 border-t md:border-t-0 md:border-l border-[rgba(10,11,14,0.1)] pt-5 md:pt-0 md:pl-8">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#5e6473] font-bold">
                  Công nghệ cốt lõi
                </h4>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[rgba(10,11,14,0.12)] text-[#0a0b0e] font-medium shadow-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="pt-2 space-y-2">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[#5e6473] font-bold">
                    Mã nguồn & Liên kết
                  </h4>
                  {project.github && isSafeUrl(project.github) && (
                    <a
                      href={getSafeUrl(project.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-mono text-xs bg-[#0a0b0e] text-white hover:bg-[#1a2ffb] active:scale-98 px-5 py-3 rounded-xl transition-all w-full justify-center font-semibold shadow-md"
                    >
                      <span>Xem mã nguồn GitHub</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export const ProjectsSection: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [expandedProject, setExpandedProject] = useState<string | null>('1');

  const tags = ['ALL', '3D & GLSL', 'MOBILE APP', 'FULL-STACK'];

  const filteredProjects = projectsData.filter((p) => {
    if (selectedTag === 'ALL') return true;
    if (selectedTag === '3D & GLSL') return p.tags.includes('3d') || p.tags.includes('glsl-shader');
    if (selectedTag === 'MOBILE APP') return p.tags.includes('mobile');
    if (selectedTag === 'FULL-STACK') return p.tags.includes('web') && !p.tags.includes('3d');
    return true;
  });

  return (
    <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto border-t theme-border overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-16">
        <div className="space-y-3">
          <div className="font-mono text-xs text-[#5e6473] uppercase tracking-widest flex items-center gap-2">
            <span className="text-[#1a2ffb] font-bold">[01] 3D INTERACTIVE SHOWCASE</span>
            <span>/</span>
            <span>DỰ ÁN TIÊU BIỂU</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#0a0b0e]">
            Featured Projects & Case Studies.
          </h2>
          <p className="text-xs sm:text-sm font-mono text-[#5e6473] flex items-center gap-2">
            <span>✦</span>
            <span>CUỘN ĐỂ KHÁM PHÁ CHI TIẾT 3D TIÊU BIỂU</span>
          </p>
        </div>

        {/* Filter Tags - Mobile Horizontal Scrollbar with Touch Friendly Targets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap font-mono text-xs">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setSelectedTag(tag);
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className={`px-3.5 sm:px-4 py-2 rounded-full transition-all cursor-pointer font-medium whitespace-nowrap shrink-0 active:scale-95 ${
                selectedTag === tag
                  ? 'bg-[#0a0b0e] text-white shadow-md'
                  : 'bg-white text-[#2f3441] hover:text-[#0a0b0e] border border-[rgba(10,11,14,0.1)] shadow-xs'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Projects 3D Animated Column Container */}
      <div className="space-y-2">
        {filteredProjects.map((project, index) => (
          <ProjectCardItem
            key={project.id}
            project={project}
            index={index}
            isExpanded={expandedProject === project.id}
            onToggleExpand={() =>
              setExpandedProject(expandedProject === project.id ? null : project.id)
            }
          />
        ))}
      </div>
    </section>
  );
};
