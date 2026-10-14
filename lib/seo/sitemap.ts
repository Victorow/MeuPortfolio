import { LOCALES, DEFAULT_LOCALE, absoluteUrl, pagePath, type PageKind } from './site';

export type SitemapEntry = { loc: string; lastmod: string; alternates: { hreflang: string; href: string }[] };

const PAGES: PageKind[] = ['classic', 'home'];

/** 4 URLs (classic + 3D, pt-BR + en), each with its hreflang cluster and x-default. */
export function sitemapEntries(lastmod: string): SitemapEntry[] {
  return PAGES.flatMap((page) =>
    LOCALES.map((locale) => ({
      loc: absoluteUrl(pagePath(locale, page)),
      lastmod,
      alternates: [
        ...LOCALES.map((l) => ({ hreflang: l, href: absoluteUrl(pagePath(l, page)) })),
        { hreflang: 'x-default', href: absoluteUrl(pagePath(DEFAULT_LOCALE, page)) }
      ]
    }))
  );
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function sitemapXml(lastmod: string): string {
  const urls = sitemapEntries(lastmod)
    .map((e) => {
      const links = e.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}"/>`).join('\n');
      return `  <url>\n    <loc>${esc(e.loc)}</loc>\n    <lastmod>${esc(e.lastmod)}</lastmod>\n${links}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}
