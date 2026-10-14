import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { alternatesFor } from './alternates';
import { SITE_URL, FULL_NAME, absoluteUrl, ogImage, pagePath, type PageKind } from './site';

const OG_LOCALE: Record<string, string> = { 'pt-BR': 'pt_BR', en: 'en_US' };

/** Page metadata shared by the 3D home and the classic page. Classic is canonical for both (D3). */
export async function buildMetadata(locale: string, page: PageKind): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('title');
  const description = t('description');
  const url = absoluteUrl(pagePath(locale, page));
  const images = [
    { url: ogImage(locale), width: 1200, height: 630, alt: t('ogAlt'), type: 'image/png' },
    { url: ogImage(locale, true), width: 1080, height: 1080, alt: t('ogAlt'), type: 'image/png' }
  ];

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: t('siteName'),
    authors: [{ name: FULL_NAME, url: `${SITE_URL}/` }],
    creator: FULL_NAME,
    alternates: alternatesFor(locale),
    robots: { index: true, follow: true },
    referrer: 'strict-origin-when-cross-origin',
    formatDetection: { telephone: false, address: false, email: false },
    manifest: '/manifest.webmanifest',
    openGraph: {
      type: 'profile',
      url,
      siteName: t('siteName'),
      title,
      description,
      locale: OG_LOCALE[locale] ?? 'pt_BR',
      alternateLocale: Object.entries(OG_LOCALE)
        .filter(([l]) => l !== locale)
        .map(([, v]) => v),
      firstName: 'Victor Augusto',
      lastName: 'Ferreira dos Santos',
      images
    },
    twitter: { card: 'summary_large_image', title, description, images: [{ url: ogImage(locale), alt: t('ogAlt') }] },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' }
      ],
      apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }]
    }
  };
}
