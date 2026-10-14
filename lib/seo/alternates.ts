import { LOCALES, DEFAULT_LOCALE, absoluteUrl, pagePath, type PageKind, type SiteLocale } from './site';

/**
 * The classic page is the canonical document for both the 3D home and itself (decision D3):
 * it is the faster, fully readable version. hreflang always points at canonical URLs.
 */
export function canonicalFor(locale: SiteLocale | string): string {
  return absoluteUrl(pagePath(locale, 'classic'));
}

/** hreflang map (pt-BR, en, x-default → pt-BR) for a page kind. */
export function languagesFor(page: PageKind = 'classic'): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[l] = absoluteUrl(pagePath(l, page));
  map['x-default'] = absoluteUrl(pagePath(DEFAULT_LOCALE, page));
  return map;
}

/** Shape accepted by Next's `Metadata['alternates']`. */
export function alternatesFor(locale: SiteLocale | string) {
  return { canonical: canonicalFor(locale), languages: languagesFor('classic') };
}
