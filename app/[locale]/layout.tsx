import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Locale segment: validates the locale only. Each branch renders its own <html>:
 * `(journey)/layout.tsx` for the 3D site and `classic/layout.tsx` for the classic page,
 * so the classic route never loads the WebGL shell, Tailwind globals or the custom cursor.
 */
export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  return children;
}
