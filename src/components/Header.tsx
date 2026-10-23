import React, { useState } from 'react';
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
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('hero');
            }}
            onMouseEnter={() => soundEngine.playHover()}
            data-cursor="HOME"
            className="group flex items-center"
          >
            <span className="text-lg sm:text-xl font-extrabold tracking-tight theme-text uppercase group-hover:text-[var(--accent-primary)] transition-colors">
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
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls: Sound Wave + CTA */}
        <div className="flex items-center gap-3">
          {/* Lusion-style Sound Wave Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            title={soundEnabled ? 'Tắt âm thanh tương tác' : 'Bật âm thanh tương tác (Lusion Audio)'}
            aria-pressed={soundEnabled}
            data-cursor={soundEnabled ? 'MUTE' : 'SOUND ON'}
            className="h-9 px-3 rounded-full border theme-border theme-surface-solid flex items-center gap-2 font-mono text-[11px] theme-text cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
          >
            <span className="flex items-end gap-0.5 h-3">
              <span
                className={`w-0.5 h-3 bg-[var(--accent-primary)] origin-bottom transition-transform ${
                  soundEnabled ? 'sound-bar-active' : 'scale-y-30 opacity-40'
                }`}
              />
              <span
                className={`w-0.5 h-3 bg-[var(--accent-primary)] origin-bottom transition-transform [animation-delay:150ms] ${
                  soundEnabled ? 'sound-bar-active' : 'scale-y-50 opacity-40'
                }`}
              />
              <span
                className={`w-0.5 h-3 bg-[var(--accent-primary)] origin-bottom transition-transform [animation-delay:300ms] ${
                  soundEnabled ? 'sound-bar-active' : 'scale-y-25 opacity-40'
                }`}
              />
            </span>
            <span className="hidden sm:inline">{soundEnabled ? 'SFX ON' : 'SFX'}</span>
          </button>

          {/* CTA Button */}
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2 theme-text cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <span className={`w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`w-6 h-0.5 bg-current transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`w-6 h-0.5 bg-current transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu - Only Tab Names without Numbers */}
      {mobileMenuOpen && (
        <div className="md:hidden theme-surface-solid border-b theme-border px-6 py-6 space-y-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="w-full py-2.5 text-left font-mono text-sm uppercase tracking-wider theme-text hover:text-[var(--accent-primary)] transition-colors"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="pt-2 border-t theme-border">
            <button
              type="button"
              onClick={() => handleNavClick('contact')}
              className="w-full py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider theme-pill font-semibold text-center"
            >
              Liên hệ hợp tác ↗
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
