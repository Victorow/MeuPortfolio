/** Single source of truth for absolute URLs and identity used by metadata, JSON-LD, sitemap and llms.txt. */
export const SITE_URL = 'https://victors.codes';
export const FULL_NAME = 'Victor Augusto Ferreira dos Santos';
export const SHORT_NAME = 'Victor Augusto';
export const LOCALES = ['pt-BR', 'en'] as const;
export type SiteLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: SiteLocale = 'pt-BR';

export type PageKind = 'home' | 'classic';

/** Path (with trailing slash, matching `trailingSlash: true`) of a page in a locale. */
export function pagePath(locale: SiteLocale | string, page: PageKind): string {
  return page === 'classic' ? `/${locale}/classic/` : `/${locale}/`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/** OG images live in public/og and are produced by scripts/og.mjs. */
export function ogImage(locale: SiteLocale | string, square = false): string {
  return square ? `/og/og-square-${locale}.png` : `/og/og-${locale}.png`;
}
