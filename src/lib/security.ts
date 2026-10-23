/**
 * Security & Sanitization Utilities
 * Protects against XSS, javascript: pseudo-protocols, dangerous injection vectors, and unsafe external links.
 */

const DANGEROUS_PATTERNS = [
  /<script/i,
  /<\/script>/i,
  /javascript:/i,
  /vbscript:/i,
  /data:/i,
  /eval\s*\(/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
];

/**
 * Validates whether a URL uses a safe protocol (https:, http:, mailto:) or valid anchor fragment.
 * Rejects javascript:, data:, vbscript:, eval, <script>, and malformed URIs.
 */
export const isSafeUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Reject strings matching known dangerous attack patterns
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false;
    }
  }

  // Allow anchor fragments within the same page (must only contain alphanumeric, underscores, hyphens)
  if (trimmed.startsWith('#')) {
    return /^#[a-zA-Z0-9_-]*$/.test(trimmed);
  }

  // Reject function invocations / code execution patterns
  if (/\b(eval|alert|prompt|confirm)\s*\(/.test(trimmed)) {
    return false;
  }

  try {
    // Relative paths starting with '/'
    if (trimmed.startsWith('/')) {
      const parsed = new URL(trimmed, 'https://tranvantuyen.dev');
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    }

    // Absolute URLs
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'mailto:';
  } catch {
    return false;
  }
};

/**
 * Returns a sanitized URL or the safe fallback if the input is unsafe.
 */
export const getSafeUrl = (url?: string | null, fallback: string = '#'): string => {
  if (!url) return fallback;
  return isSafeUrl(url) ? url : fallback;
};
