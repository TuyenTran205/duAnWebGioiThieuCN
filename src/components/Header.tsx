import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userProfile } from '../data/profile';
import { soundEngine } from '../lib/soundEngine';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activeSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const navItems = [
    { id: 'projects', label: 'Dự án' },
    { id: 'capabilities', label: 'Năng lực' },
    { id: 'about', label: 'Giới thiệu' },
    { id: 'contact', label: 'Liên hệ' }
  ];

  // Close mobile drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (id: string) => {
    soundEngine.playClick();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleToggleSound = () => {
    const next = soundEngine.toggle();
    setSoundEnabled(next);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 theme-surface backdrop-blur-xl border-b theme-border transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hero');
            }}
            onMouseEnter={() => soundEngine.playHover()}
            data-cursor="HOME"
            className="group flex items-center gap-2"
          >
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-(--accent-primary) animate-pulse" />
            <span className="text-base sm:text-xl font-extrabold tracking-tight theme-text uppercase group-hover:text-(--accent-primary) transition-colors truncate max-w-[190px] sm:max-w-none">
              {userProfile.name}
            </span>
          </a>
        </div>

        {/* Desktop Navigation - Only Tab Names without Numbers */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                onMouseEnter={() => soundEngine.playHover()}
                className={`font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer relative py-1 ${
                  isActive
                    ? 'theme-text font-bold'
                    : 'theme-text-muted hover:theme-text font-medium'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--accent-primary) rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls: Sound Wave + CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Lusion-style Sound Wave Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundEnabled ? 'Tắt âm thanh tương tác' : 'Bật âm thanh tương tác (Lusion Audio)'}
            aria-pressed={soundEnabled}
            data-cursor={soundEnabled ? 'MUTE' : 'SOUND ON'}
            className="h-8 sm:h-9 px-2.5 sm:px-3 rounded-full border theme-border theme-surface-solid flex items-center gap-1.5 sm:gap-2 font-mono text-[10px] sm:text-[11px] theme-text cursor-pointer hover:border-(--accent-primary) transition-colors"
          >
            <span className="flex items-end gap-0.5 h-3">
              <span
                className={`w-0.5 h-3 bg-(--accent-primary) origin-bottom transition-transform ${
                  soundEnabled ? 'sound-bar-active' : 'scale-y-30 opacity-40'
                }`}
              />
              <span
                className={`w-0.5 h-3 bg-(--accent-primary) origin-bottom transition-transform [animation-delay:150ms] ${
                  soundEnabled ? 'sound-bar-active' : 'scale-y-50 opacity-40'
                }`}
              />
              <span
                className={`w-0.5 h-3 bg-(--accent-primary) origin-bottom transition-transform [animation-delay:300ms] ${
                  soundEnabled ? 'sound-bar-active' : 'scale-y-25 opacity-40'
                }`}
              />
            </span>
            <span>{soundEnabled ? 'SFX ON' : 'SFX'}</span>
          </button>

          {/* Desktop CTA Button */}
          <button
            type="button"
            onClick={() => handleNavClick('contact')}
            onMouseEnter={() => soundEngine.playHover()}
            data-cursor="LET'S TALK"
            className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full font-mono text-xs uppercase tracking-wider theme-pill hover:opacity-90 transition-all font-semibold cursor-pointer"
          >
            <span>Let's Talk</span>
            <span>↗</span>
          </button>

          {/* Mobile Hamburger / Close Button (Optimized 44px Touch Target) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 rounded-xl border theme-border theme-surface-solid theme-text cursor-pointer focus:outline-none"
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu điều hướng'}
            aria-expanded={mobileMenuOpen}
          >
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-transform duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-opacity duration-200 ${
                mobileMenuOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-5 h-0.5 bg-current rounded-full transition-transform duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b theme-border theme-surface-solid/98 backdrop-blur-2xl shadow-xl overflow-hidden"
          >
            <div className="px-5 py-6 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full py-3 px-3.5 rounded-xl text-left font-mono text-sm uppercase tracking-wider transition-all flex items-center justify-between ${
                        isActive
                          ? 'bg-[#1a2ffb]/10 text-[#1a2ffb] font-bold border border-[#1a2ffb]/20'
                          : 'theme-text hover:bg-[#f2f4fa] font-medium'
                      }`}
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span className="w-2 h-2 rounded-full bg-[#1a2ffb]" />
                      ) : (
                        <span className="theme-text-muted text-xs">→</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Mobile CTA */}
              <div className="pt-3 border-t theme-border space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleNavClick('contact')}
                  className="w-full py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider theme-pill font-semibold text-center flex items-center justify-center gap-2 shadow-md active:scale-98 transition-transform"
                >
                  <span>Liên hệ hợp tác</span>
                  <span>↗</span>
                </button>

                <div className="pt-2 text-center">
                  <p className="font-mono text-[11px] theme-text-muted">
                    {userProfile.title} · {userProfile.university}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
