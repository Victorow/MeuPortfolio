import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono, Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import SecurityMeta from '@/components/seo/SecurityMeta';
import { DESIGN_BOOT_SCRIPT } from '@/lib/classic/design';
import '../../classic.css';

// Design A (default, preloaded)
const aDisplay = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap', variable: '--fa-display' });
const aBody = Instrument_Sans({ subsets: ['latin'], display: 'swap', variable: '--fa-body' });
const aMono = IBM_Plex_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--fa-mono' });
// Design B (loaded on demand when B is shown)
const bDisplay = Space_Grotesk({ subsets: ['latin'], display: 'swap', weight: ['500', '700'], variable: '--fb-display', preload: false });
const bBody = Inter({ subsets: ['latin'], display: 'swap', variable: '--fb-body', preload: false });
const bMono = JetBrains_Mono({ subsets: ['latin'], display: 'swap', weight: ['400', '500'], variable: '--fb-mono', preload: false });

const fontVars = [aDisplay, aBody, aMono, bDisplay, bBody, bMono].map((f) => f.variable).join(' ');

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0e' }
  ]
};

/** Classic route: no WebGL shell, no preloader, no sound, no custom cursor. Works with JS disabled. */
export default async function ClassicLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} data-design="a" className={fontVars} suppressHydrationWarning>
      <head>
        <SecurityMeta />
        <script dangerouslySetInnerHTML={{ __html: DESIGN_BOOT_SCRIPT }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={{ classic: messages.classic }}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
