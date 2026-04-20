import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['pt-BR', 'en'],
  defaultLocale: 'pt-BR',
  // Static export (GitHub Pages) has no runtime middleware — every page must
  // be a real file. `always` keeps the locale in the URL (/pt-BR/, /en/) so
  // the router can match statically without server-side rewrites.
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
