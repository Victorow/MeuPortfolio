/**
 * Content-Security-Policy delivered via <meta http-equiv> (GitHub Pages cannot set headers).
 *
 * script-src needs 'unsafe-inline': a Next.js static export inlines the RSC payload and bootstrap
 * scripts (self.__next_f.push(...)) into every page and there is no server to mint nonces or hashes
 * per build. Every other directive is strict: no third-party origins at all (fonts are self-hosted
 * by next/font, textures are local, no analytics). JSON-LD is type=application/ld+json and is never
 * executed. frame-ancestors is ignored in <meta>, so it is omitted (GitHub Pages sends X-Frame-Options).
 *
 * Emitted only in production builds: `next dev` relies on eval() for React Refresh.
 */
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests'
].join('; ');

export const CSP_ENABLED = process.env.NODE_ENV === 'production';
