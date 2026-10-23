import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { AboutSection } from './components/AboutSection';
import { FooterSection } from './components/FooterSection';

export const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Track active section on scroll with dynamic mobile offset
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'projects', 'capabilities', 'about', 'contact'];
      const scrollPos = window.scrollY + (window.innerWidth < 768 ? 140 : 260);

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen theme-bg theme-text font-sans selection:bg-(--accent-primary) selection:text-white overflow-x-hidden">
      {/* Fixed Minimalist Lusion-Style Header */}
      <Header
        onNavigate={scrollToSection}
        activeSection={activeSection}
      />

      {/* Main Interactive Flow */}
      <main className="overflow-x-hidden">
        {/* Fullscreen 3D Shader Hero (Permanent Hyperwave Wireframe 1X) */}
        <HeroSection
          onExploreWork={() => scrollToSection('projects')}
          onContact={() => scrollToSection('contact')}
        />

        {/* Selected Works & Case Studies */}
        <ProjectsSection />

        {/* Core Capabilities & Engineering Matrix */}
        <CapabilitiesSection />

        {/* Biography & Design Philosophy */}
        <AboutSection />
      </main>

      {/* Footer & Direct Contact */}
      <FooterSection />
    </div>
  );
};

export default App;
