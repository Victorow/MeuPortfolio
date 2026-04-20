import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Inter, Space_Grotesk } from 'next/font/google';
import { routing } from '@/i18n/routing';
import SmoothScroll from '@/components/ui/SmoothScroll';
import SceneMount from '@/components/scene/SceneMount';
import LocaleSwitch from '@/components/ui/LocaleSwitch';
import SectionTracker from '@/components/ui/SectionTracker';
import SectionIndicator from '@/components/ui/SectionIndicator';
import ScrollSnap from '@/components/ui/ScrollSnap';
import LocaleTransition from '@/components/ui/LocaleTransition';
import '../globals.css';

const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans'
});

const display = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  variable: '--font-display'
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    metadataBase: new URL('https://example.dev'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website'
    },
    icons: { icon: '/favicon.ico' }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable}`}>
      <body className="relative bg-ink-950 text-ink-50 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SmoothScroll>
            <SceneMount />
            <SectionTracker />
            <ScrollSnap />
            <div className="vignette relative z-10">{children}</div>
            <div className="grain" aria-hidden />
            <SectionIndicator />
            <LocaleSwitch />
            <LocaleTransition locale={locale} />
          </SmoothScroll>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
