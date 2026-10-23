import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const projectRoot = path.resolve(process.cwd());

describe('Kiểm thử Tính tương thích Di động & Trải nghiệm Responsive (Mobile UX Suite)', () => {
  const headerPath = path.join(projectRoot, 'src/components/Header.tsx');
  const heroPath = path.join(projectRoot, 'src/components/HeroSection.tsx');
  const projectsPath = path.join(projectRoot, 'src/components/ProjectsSection.tsx');
  const capabilitiesPath = path.join(projectRoot, 'src/components/CapabilitiesSection.tsx');
  const aboutPath = path.join(projectRoot, 'src/components/AboutSection.tsx');
  const footerPath = path.join(projectRoot, 'src/components/FooterSection.tsx');
  const cssPath = path.join(projectRoot, 'src/index.css');

  describe('Header & Điều hướng Di động', () => {
    it('Header phải có Drawer navigation, nút menu hamburger tối ưu cảm ứng và AnimatePresence', () => {
      const code = fs.readFileSync(headerPath, 'utf-8');
      expect(code).toContain('mobileMenuOpen');
      expect(code).toContain('md:hidden');
      expect(code).toContain('aria-label');
      expect(code).toContain('AnimatePresence');
      expect(code).toContain('h-16 sm:h-20');
    });
  });

  describe('Hero Section trên Màn hình Nhỏ', () => {
    it('HeroSection phải có kích thước chữ co giãn linh hoạt và nút bấm CTA full-width trên di động', () => {
      const code = fs.readFileSync(heroPath, 'utf-8');
      expect(code).toContain('text-3xl');
      expect(code).toContain('sm:text-6xl');
      expect(code).toContain('w-full sm:w-auto');
      expect(code).toContain('flex-col sm:flex-row');
    });
  });

  describe('Dự án (ProjectsSection) & Thanh lọc Thẻ', () => {
    it('ProjectsSection phải hỗ trợ cuộn ngang thanh lọc tags mượt mà không thanh cuộn thô trên mobile', () => {
      const code = fs.readFileSync(projectsPath, 'utf-8');
      expect(code).toContain('overflow-x-auto');
      expect(code).toContain('whitespace-nowrap');
      expect(code).toContain('w-full sm:w-auto');
    });

    it('3D Card Tilt phải tối ưu hóa, không làm giật thanh cuộn dọc trên thiết bị cảm ứng', () => {
      const code = fs.readFileSync(projectsPath, 'utf-8');
      expect(code).toContain('hover: hover');
    });
  });

  describe('Năng lực (CapabilitiesSection) & Giới thiệu (AboutSection)', () => {
    it('CapabilitiesSection và AboutSection phải có bố cục lưới 1 cột chuyển 2-3 cột trên màn hình lớn', () => {
      const capCode = fs.readFileSync(capabilitiesPath, 'utf-8');
      expect(capCode).toContain('grid-cols-1 md:grid-cols-2');

      const aboutCode = fs.readFileSync(aboutPath, 'utf-8');
      expect(aboutCode).toContain('grid-cols-1 lg:grid-cols-12');
    });
  });

  describe('Footer & Nút hành động trực tiếp', () => {
    it('FooterSection phải có bố cục nút gửi email và copy co giãn theo chiều rộng màn hình điện thoại', () => {
      const code = fs.readFileSync(footerPath, 'utf-8');
      expect(code).toContain('flex-col xs:flex-row');
      expect(code).toContain('grid-cols-1 md:grid-cols-3');
    });
  });

  describe('Tối ưu hóa Cảm ứng CSS (Touch & Ergonomics)', () => {
    it('index.css phải triệt tiêu độ trễ chạm 300ms và ẩn thanh cuộn ngang khi lướt tags', () => {
      const css = fs.readFileSync(cssPath, 'utf-8');
      expect(css).toContain('touch-action: manipulation');
      expect(css).toContain('-webkit-tap-highlight-color: transparent');
      expect(css).toContain('.no-scrollbar');
    });
  });
});

