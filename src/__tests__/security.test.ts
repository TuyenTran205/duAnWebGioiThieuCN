import { describe, it, expect } from 'vitest';
import { projectsData } from '../data/projects';
import { userProfile } from '../data/profile';
import { isSafeUrl, getSafeUrl } from '../lib/security';

describe('Kiểm tra Bảo mật Dữ liệu & XSS Sanitization', () => {
  it('Tất cả link dự án phải bắt đầu bằng https:// hoặc #', () => {
    projectsData.forEach((project) => {
      if (project.link && project.link !== '#') {
        expect(project.link).toMatch(/^https:\/\//);
      }
      if (project.github) {
        expect(project.github).toMatch(/^https:\/\//);
      }
    });
  });

  it('Tất cả link mạng xã hội của tác giả phải dùng giao thức https:// hoặc mailto:', () => {
    userProfile.socials.forEach((social) => {
      expect(social.href).toMatch(/^(https:\/\/|mailto:)/);
    });
  });

  it('Dữ liệu văn bản không được chứa thẻ script, eval hoặc sự kiện HTML nguy hiểm', () => {
    const dangerousPatterns = [
      /<script/i,
      /<\/script>/i,
      /javascript:/i,
      /vbscript:/i,
      /onload\s*=/i,
      /onerror\s*=/i,
      /onclick\s*=/i,
      /eval\s*\(/i,
      /<iframe/i,
      /<object/i,
    ];

    const checkString = (str: string, fieldName: string) => {
      dangerousPatterns.forEach((pattern) => {
        expect(
          str,
          `Trường ${fieldName} chứa ký tự độc hại khớp với ${pattern.toString()}: "${str}"`
        ).not.toMatch(pattern);
      });
    };

    checkString(userProfile.name, 'userProfile.name');
    checkString(userProfile.title, 'userProfile.title');
    checkString(userProfile.subTitle, 'userProfile.subTitle');
    checkString(userProfile.statement, 'userProfile.statement');
    checkString(userProfile.bio, 'userProfile.bio');
    checkString(userProfile.university, 'userProfile.university');
    checkString(userProfile.faculty, 'userProfile.faculty');
    checkString(userProfile.major, 'userProfile.major');

    projectsData.forEach((p, idx) => {
      checkString(p.title, `project[${idx}].title`);
      checkString(p.description, `project[${idx}].description`);
      checkString(p.longDescription, `project[${idx}].longDescription`);
      p.highlights.forEach((h, hIdx) => {
        checkString(h, `project[${idx}].highlights[${hIdx}]`);
      });
      p.technologies.forEach((t, tIdx) => {
        checkString(t, `project[${idx}].technologies[${tIdx}]`);
      });
    });
  });

  describe('Utility isSafeUrl - Phòng chống XSS Vectors toàn diện', () => {
    it('Chấp nhận các URL hợp lệ với giao thức https:, http:, mailto: và hash anchor hợp lệ', () => {
      expect(isSafeUrl('https://tranvantuyen.dev')).toBe(true);
      expect(isSafeUrl('https://github.com/TuyenTran205')).toBe(true);
      expect(isSafeUrl('https://www.linkedin.com')).toBe(true);
      expect(isSafeUrl('http://localhost:3000')).toBe(true);
      expect(isSafeUrl('http://localhost:5173')).toBe(true);
      expect(isSafeUrl('mailto:tranvantuyen.dev@gmail.com')).toBe(true);
      expect(isSafeUrl('#')).toBe(true);
      expect(isSafeUrl('#hero')).toBe(true);
      expect(isSafeUrl('#projects')).toBe(true);
      expect(isSafeUrl('#capabilities')).toBe(true);
      expect(isSafeUrl('#about')).toBe(true);
      expect(isSafeUrl('#contact')).toBe(true);
      expect(isSafeUrl('/favicon.svg')).toBe(true);
    });

    it('Chặn triệt để mã độc javascript: pseudo-protocol (bao gồm case-insensitive và whitespace)', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeUrl('JavaScript:alert(document.domain)')).toBe(false);
      expect(isSafeUrl('   javascript:alert(1)   ')).toBe(false);
      expect(isSafeUrl('javascript:void(0)')).toBe(false);
      expect(isSafeUrl('javascript:/*--></title></style></textarea></script></xmp><svg/onload=alert(1)>')).toBe(false);
    });

    it('Chặn triệt để mã độc data: URI (data:text/html, data:image/svg+xml, v.v.)', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(false);
      expect(isSafeUrl('DATA:text/html;charset=utf-8,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('data:image/svg+xml,<svg onload=alert(1)>')).toBe(false);
    });

    it('Chặn triệt để mã độc vbscript:', () => {
      expect(isSafeUrl('vbscript:msgbox(1)')).toBe(false);
      expect(isSafeUrl('VBSCRIPT:msgbox("XSS")')).toBe(false);
    });

    it('Chặn tiêm mã thực thi trực tiếp eval(), alert(), prompt(), confirm()', () => {
      expect(isSafeUrl('eval("alert(1)")')).toBe(false);
      expect(isSafeUrl('eval(location.hash)')).toBe(false);
      expect(isSafeUrl('alert("pwned")')).toBe(false);
      expect(isSafeUrl('prompt("credentials")')).toBe(false);
      expect(isSafeUrl('confirm("proceed?")')).toBe(false);
    });

    it('Chặn các chuỗi tiêm HTML Tag (<script>, <iframe>, <svg>, <img>)', () => {
      expect(isSafeUrl('<script>alert("xss")</script>')).toBe(false);
      expect(isSafeUrl('<script src="https://evil.com/malware.js"></script>')).toBe(false);
      expect(isSafeUrl('<svg/onload=alert(1)>')).toBe(false);
      expect(isSafeUrl('<img src=x onerror=alert(1)>')).toBe(false);
      expect(isSafeUrl('"><script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('#<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('#javascript:alert(1)')).toBe(false);
    });

    it('Xử lý an toàn các giá trị falsy, rỗng và khoảng trắng', () => {
      expect(isSafeUrl('')).toBe(false);
      expect(isSafeUrl('   ')).toBe(false);
      expect(isSafeUrl(null)).toBe(false);
      expect(isSafeUrl(undefined)).toBe(false);
      // @ts-expect-error test non-string type
      expect(isSafeUrl(12345)).toBe(false);
      // @ts-expect-error test non-string type
      expect(isSafeUrl({})).toBe(false);
    });
  });

  describe('Utility getSafeUrl', () => {
    it('Trả về URL nguyên vẹn khi là URL an toàn', () => {
      expect(getSafeUrl('https://tranvantuyen.dev')).toBe('https://tranvantuyen.dev');
      expect(getSafeUrl('https://github.com/TuyenTran205', '#')).toBe('https://github.com/TuyenTran205');
      expect(getSafeUrl('#hero', '#')).toBe('#hero');
    });

    it('Trả về giá trị fallback mặc định "#" khi URL không an toàn hoặc rỗng', () => {
      expect(getSafeUrl('javascript:alert(1)')).toBe('#');
      expect(getSafeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
      expect(getSafeUrl('<script>alert(1)</script>')).toBe('#');
      expect(getSafeUrl('')).toBe('#');
      expect(getSafeUrl(null)).toBe('#');
      expect(getSafeUrl(undefined)).toBe('#');
    });

    it('Trả về fallback tùy chỉnh khi được cung cấp', () => {
      expect(getSafeUrl('javascript:alert(1)', '#fallback')).toBe('#fallback');
      expect(getSafeUrl(null, 'https://tranvantuyen.dev')).toBe('https://tranvantuyen.dev');
      expect(getSafeUrl('', '#custom-anchor')).toBe('#custom-anchor');
    });
  });
});
