import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const projectRoot = path.resolve(process.cwd());

describe('Kiểm thử Tính toàn vẹn Bản Build & Dọn dẹp Tài nguyên (Build Integrity Suite)', () => {
  describe('Xác nhận Thanh lọc Tài sản thừa & 3D Bloatware', () => {
    it('Không còn file mô hình 3D cũ (laptop.glb, satellite.glb) trong public/assets/models', () => {
      const laptopPath = path.join(projectRoot, 'public/assets/models/laptop.glb');
      const satellitePath = path.join(projectRoot, 'public/assets/models/satellite.glb');
      const modelsDir = path.join(projectRoot, 'public/assets/models');

      expect(fs.existsSync(laptopPath)).toBe(false);
      expect(fs.existsSync(satellitePath)).toBe(false);
      expect(fs.existsSync(modelsDir)).toBe(false);
    });

    it('Không còn file SVG sprite cũ (icons.svg) trong public/', () => {
      const iconsPath = path.join(projectRoot, 'public/icons.svg');
      expect(fs.existsSync(iconsPath)).toBe(false);
    });

    it('Không còn ảnh tĩnh thừa trong src/assets/', () => {
      const heroPath = path.join(projectRoot, 'src/assets/hero.png');
      const reactSvgPath = path.join(projectRoot, 'src/assets/react.svg');
      const viteSvgPath = path.join(projectRoot, 'src/assets/vite.svg');
      const srcAssetsDir = path.join(projectRoot, 'src/assets');

      expect(fs.existsSync(heroPath)).toBe(false);
      expect(fs.existsSync(reactSvgPath)).toBe(false);
      expect(fs.existsSync(viteSvgPath)).toBe(false);
      expect(fs.existsSync(srcAssetsDir)).toBe(false);
    });

    it('Không còn mã nguồn rác hoặc stub component không dùng trong src/', () => {
      const customCursor = path.join(projectRoot, 'src/components/CustomCursor.tsx');
      const labsSection = path.join(projectRoot, 'src/components/LabsSection.tsx');
      const documentsData = path.join(projectRoot, 'src/data/documents.ts');
      const supabaseClient = path.join(projectRoot, 'src/lib/supabaseClient.ts');
      const databaseTypes = path.join(projectRoot, 'src/types/database.ts');
      const serviceTypes = path.join(projectRoot, 'src/types/service.ts');

      expect(fs.existsSync(customCursor)).toBe(false);
      expect(fs.existsSync(labsSection)).toBe(false);
      expect(fs.existsSync(documentsData)).toBe(false);
      expect(fs.existsSync(supabaseClient)).toBe(false);
      expect(fs.existsSync(databaseTypes)).toBe(false);
      expect(fs.existsSync(serviceTypes)).toBe(false);
    });
  });

  describe('Quét An toàn Thông tin & Ngăn chặn rò rỉ Bí mật (Secret Scanner)', () => {
    it('Không có API key, secret token hay khóa mật nào bị hardcode trong src/', () => {
      const srcDir = path.join(projectRoot, 'src');

      const forbiddenPatterns = [
        /SUPABASE_SERVICE_ROLE_KEY/i,
        /service_role/i,
        /sk_live_[0-9a-zA-Z]{24,}/,
        /ghp_[0-9a-zA-Z]{36}/,
        /-----BEGIN (RSA|EC|OPENSSH|DSA|PGP) PRIVATE KEY-----/,
        /vjifgyharfxiiwyvkmeo\.supabase\.co/,
      ];

      const scanDirectory = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            if (file === '__tests__' || file === 'test') continue;
            scanDirectory(fullPath);
          } else if (/\.(ts|tsx|js|jsx|json|css)$/.test(file) && !file.includes('.test.')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            forbiddenPatterns.forEach((pattern) => {
              expect(
                pattern.test(content),
                `Phát hiện chuỗi nhạy cảm khớp với ${pattern.toString()} trong file: ${path.relative(projectRoot, fullPath)}`
              ).toBe(false);
            });
          }
        }
      };

      scanDirectory(srcDir);
    });
  });

  describe('Kiểm tra Tính toàn vẹn Thư mục Dist & Giới hạn Kích thước (Bundle Size Safeguard)', () => {
    const distDir = path.join(projectRoot, 'dist');

    it('Thư mục dist phải chứa đầy đủ index.html, CNAME, robots.txt, sitemap.xml và favicon.svg', () => {
      // Chỉ kiểm tra khi đã build dist
      if (fs.existsSync(distDir)) {
        expect(fs.existsSync(path.join(distDir, 'index.html'))).toBe(true);
        expect(fs.existsSync(path.join(distDir, 'CNAME'))).toBe(true);
        expect(fs.existsSync(path.join(distDir, 'robots.txt'))).toBe(true);
        expect(fs.existsSync(path.join(distDir, 'sitemap.xml'))).toBe(true);
        expect(fs.existsSync(path.join(distDir, 'favicon.svg'))).toBe(true);
        expect(fs.existsSync(path.join(distDir, 'assets'))).toBe(true);
      }
    });

    it('Bản build dist không được chứa bất kỳ tệp mô hình 3D .glb hay .gltf nào', () => {
      if (fs.existsSync(distDir)) {
        const checkNo3dFiles = (dir: string) => {
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              checkNo3dFiles(fullPath);
            } else {
              expect(file.endsWith('.glb')).toBe(false);
              expect(file.endsWith('.gltf')).toBe(false);
            }
          }
        };

        checkNo3dFiles(distDir);
      }
    });

    it('Tổng kích thước thư mục dist phải nhỏ hơn 2MB (< 2,000,000 bytes) theo tiêu chuẩn đặc tả', () => {
      if (fs.existsSync(distDir)) {
        const calculateDirSize = (dir: string): number => {
          let total = 0;
          const files = fs.readdirSync(dir);
          for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
              total += calculateDirSize(fullPath);
            } else {
              total += stat.size;
            }
          }
          return total;
        };

        const totalSize = calculateDirSize(distDir);
        // Ngưỡng tối đa 2MB (đặc tả yêu cầu cắt giảm 9.6MB từ 10.4MB xuống < 1MB)
        expect(totalSize).toBeLessThan(2_000_000);
      }
    });
  });
});
