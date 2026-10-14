import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import JourneyShell from '@/components/journey/JourneyShell';
import SecurityMeta from '@/components/seo/SecurityMeta';
import { versionBootScript } from '@/lib/version';
import '../../globals.css';

const sans = Inter({ subsets: ['latin'], display: 'swap', variable: '--font-sans' });
const display = Space_Grotesk({ subsets: ['latin'], display: 'swap', weight: ['500', '700'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--font-mono' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#030305'
};

export default async function JourneyLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <SecurityMeta />
        <script dangerouslySetInnerHTML={{ __html: versionBootScript(locale) }} />
      </head>
      <body className="relative bg-bg text-fg antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <JourneyShell locale={locale}>{children}</JourneyShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
