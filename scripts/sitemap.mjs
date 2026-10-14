// Writes public/sitemap.xml: 4 URLs (classic + 3D in pt-BR and en) with hreflang alternates and lastmod of the last commit.
import { loadTs, lastModified, writePublic } from './lib/ts.mjs';

const { sitemapXml } = loadTs('lib/seo/sitemap.ts');
writePublic('sitemap.xml', sitemapXml(lastModified()));
