import { describe, it, expect } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const projectRoot = path.resolve(process.cwd());

describe('Kiểm thử Cấu hình Triển khai & Security Headers (Deployment Suite)', () => {
  const vercelJsonPath = path.join(projectRoot, 'vercel.json');
  const cnamePath = path.join(projectRoot, 'public/CNAME');
  const sitemapPath = path.join(projectRoot, 'public/sitemap.xml');
  const robotsPath = path.join(projectRoot, 'public/robots.txt');
  const indexPath = path.join(projectRoot, 'index.html');

  describe('Cấu hình vercel.json & Ma trận 9 Security Headers', () => {
    it('Tệp vercel.json phải tồn tại và đúng định dạng JSON hợp lệ', () => {
      expect(fs.existsSync(vercelJsonPath)).toBe(true);
      const raw = fs.readFileSync(vercelJsonPath, 'utf-8');
      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it('vercel.json phải cấu hình cleanUrls, trailingSlash và rewrites cho SPA', () => {
      const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      expect(config.cleanUrls).toBe(true);
      expect(config.trailingSlash).toBe(false);
      expect(config.rewrites).toEqual([
        {
          source: '/(.*)',
          destination: '/index.html',
        },
      ]);
    });

    it('vercel.json phải có đầy đủ 9 Security Headers cho toàn bộ route /(.*)', () => {
      const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      const globalRouteHeaders = config.headers?.find(
        (h: { source: string }) => h.source === '/(.*)'
      );

      expect(globalRouteHeaders).toBeDefined();
      const headerMap = new Map<string, string>();
      globalRouteHeaders.headers.forEach((h: { key: string; value: string }) => {
        headerMap.set(h.key, h.value);
      });

      const requiredHeaders = [
        'Content-Security-Policy',
        'Strict-Transport-Security',
        'X-Content-Type-Options',
        'X-Frame-Options',
        'X-XSS-Protection',
        'Referrer-Policy',
        'Permissions-Policy',
        'Cross-Origin-Opener-Policy',
        'Cross-Origin-Resource-Policy',
      ];

      requiredHeaders.forEach((headerKey) => {
        expect(
          headerMap.has(headerKey),
          `Thiếu Security Header thiết yếu: ${headerKey}`
        ).toBe(true);
      });

      // Kiểm tra giá trị các Header quan trọng
      expect(headerMap.get('X-Frame-Options')).toBe('DENY');
      expect(headerMap.get('X-Content-Type-Options')).toBe('nosniff');
      expect(headerMap.get('X-XSS-Protection')).toBe('1; mode=block');
      expect(headerMap.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(headerMap.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(headerMap.get('Cross-Origin-Resource-Policy')).toBe('same-origin');

      // HSTS: max-age ít nhất 1 năm (31536000) và chứa includeSubDomains + preload
      const hsts = headerMap.get('Strict-Transport-Security') || '';
      expect(hsts).toContain('max-age=');
      expect(hsts).toContain('includeSubDomains');
      expect(hsts).toContain('preload');

      // Permissions-Policy: hạn chế các phần cứng nhạy cảm
      const permPolicy = headerMap.get('Permissions-Policy') || '';
      expect(permPolicy).toContain('camera=()');
      expect(permPolicy).toContain('microphone=()');
      expect(permPolicy).toContain('geolocation=()');
      expect(permPolicy).toContain('payment=()');
    });

    it('Chính sách CSP phải nghiêm ngặt: không có unsafe-eval, chặn frame-ancestors và object-src', () => {
      const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      const globalRouteHeaders = config.headers?.find(
        (h: { source: string }) => h.source === '/(.*)'
      );
      const csp = globalRouteHeaders?.headers?.find(
        (h: { key: string }) => h.key === 'Content-Security-Policy'
      )?.value as string;

      expect(csp).toBeDefined();

      // Tuyệt đối không được chứa 'unsafe-eval'
      expect(csp).not.toContain("'unsafe-eval'");

      // Các chỉ thị bảo mật cốt lõi
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("script-src 'self'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("base-uri 'self'");
      expect(csp).toContain("form-action 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain('upgrade-insecure-requests');

      // Cho phép Google Fonts theo đặc tả
      expect(csp).toContain('https://fonts.googleapis.com');
      expect(csp).toContain('https://fonts.gstatic.com');
    });

    it('vercel.json phải cấu hình Caching Strategy tối ưu cho assets và static files', () => {
      const config = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      const assetCache = config.headers?.find(
        (h: { source: string }) => h.source === '/assets/(.*)'
      );
      expect(assetCache).toBeDefined();
      const assetCacheControl = assetCache?.headers?.find(
        (h: { key: string }) => h.key === 'Cache-Control'
      )?.value;
      expect(assetCacheControl).toContain('immutable');
      expect(assetCacheControl).toContain('max-age=31536000');

      const staticFilesCache = config.headers?.find((h: { source: string }) =>
        h.source.includes('robots.txt')
      );
      expect(staticFilesCache).toBeDefined();
    });
  });

  describe('Kiểm tra Tính toàn vẹn Domain tranvantuyen.dev (CNAME, SEO & Metadata)', () => {
    it('public/CNAME phải tồn tại và trỏ chính xác về tranvantuyen.dev', () => {
      expect(fs.existsSync(cnamePath)).toBe(true);
      const cnameContent = fs.readFileSync(cnamePath, 'utf-8').trim();
      expect(cnameContent).toBe('tranvantuyen.dev');
    });

    it('public/sitemap.xml phải chứa URL chính xác https://tranvantuyen.dev/ và không có URL rác', () => {
      expect(fs.existsSync(sitemapPath)).toBe(true);
      const sitemap = fs.readFileSync(sitemapPath, 'utf-8');

      expect(sitemap).toContain('<loc>https://tranvantuyen.dev/</loc>');
      expect(sitemap).not.toContain('/portfolio');
      expect(sitemap).not.toContain('/resources');
      expect(sitemap).not.toContain('/admin');
    });

    it('public/robots.txt phải cho phép bot truy cập sạch và khai báo sitemap đúng domain', () => {
      expect(fs.existsSync(robotsPath)).toBe(true);
      const robots = fs.readFileSync(robotsPath, 'utf-8');

      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');
      expect(robots).toContain('Sitemap: https://tranvantuyen.dev/sitemap.xml');
      expect(robots).not.toContain('Disallow: /admin');
    });

    it('index.html phải có đủ các thẻ Meta bảo mật, Canonical, OpenGraph và Twitter Cards', () => {
      expect(fs.existsSync(indexPath)).toBe(true);
      const html = fs.readFileSync(indexPath, 'utf-8');

      // Canonical link
      expect(html).toContain('<link rel="canonical" href="https://tranvantuyen.dev/" />');

      // Meta Viewport & Charset
      expect(html).toContain('<meta charset="UTF-8" />');
      expect(html).toContain('name="viewport" content="width=device-width, initial-scale=1.0"');

      // Open Graph Tags
      expect(html).toContain('property="og:url" content="https://tranvantuyen.dev/"');
      expect(html).toContain('property="og:type" content="website"');
      expect(html).toContain('property="og:title"');
      expect(html).toContain('property="og:description"');
      expect(html).toContain('property="og:image" content="https://tranvantuyen.dev/favicon.svg"');

      // Twitter Cards
      expect(html).toContain('property="twitter:card" content="summary_large_image"');
      expect(html).toContain('property="twitter:url" content="https://tranvantuyen.dev/"');
      expect(html).toContain('property="twitter:title"');
      expect(html).toContain('property="twitter:description"');

      // Google Fonts Preconnect
      expect(html).toContain('rel="preconnect" href="https://fonts.googleapis.com"');
      expect(html).toContain('rel="preconnect" href="https://fonts.gstatic.com" crossorigin');
    });
  });
});
