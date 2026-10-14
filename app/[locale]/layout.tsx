import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import JourneyShell from '@/components/journey/JourneyShell';
import { SOCIAL } from '@/content/projects';
import '../globals.css';

const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const display = Space_Grotesk({ subsets: ['latin'], display: 'swap', weight: ['500', '700'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--font-mono' });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#030305'
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://victors.codes'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      images: [{ url: '/og/earth.png', width: 1200, height: 630 }]
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description'), images: ['/og/earth.png'] },
    icons: {
      icon: [
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico', sizes: 'any' }
      ]
    }
  };
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Victor Augusto Ferreira dos Santos',
    jobTitle: 'FullStack Developer',
    url: 'https://victors.codes',
    email: `mailto:${SOCIAL.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'São José dos Campos', addressRegion: 'SP', addressCountry: 'BR' },
    sameAs: [SOCIAL.github]
  };

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <body className="relative bg-bg text-fg antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <JourneyShell locale={locale}>{children}</JourneyShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
