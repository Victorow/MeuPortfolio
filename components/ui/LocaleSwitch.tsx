'use client';

import { useLocale } from 'next-intl';
import { useState } from 'react';
import type { Locale } from '@/i18n/routing';
import { beginLocaleTransition } from '@/lib/localeTransition';
import { useJourney } from '@/lib/journey/store';

const OPTIONS: { locale: Locale; label: string }[] = [
  { locale: 'pt-BR', label: 'PT' },
  { locale: 'en', label: 'EN' }
];

/**
 * Segmented PT | EN control; the active language is highlighted.
 * Static export has no middleware and the [locale] layout remounts on change,
 * so switching is a full navigation; the current chapter travels in the hash.
 */
export default function LocaleSwitch() {
  const locale = useLocale() as Locale;
  const [pending, setPending] = useState(false);

  const go = (next: Locale) => {
    if (pending || next === locale) return;
    setPending(true);
    const chapter = useJourney.getState().chapter;
    const target = `/${next}/${chapter !== 'earth' ? `#${chapter}` : ''}`;
    beginLocaleTransition(() => window.location.assign(target));
  };

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      className="flex h-9 items-center rounded-full border border-white/12 bg-black/30 p-[3px] font-mono text-[11px] uppercase tracking-wider2 backdrop-blur-md"
    >
      {OPTIONS.map((o) => {
        const active = o.locale === locale;
        return (
          <a
            key={o.locale}
            href={`/${o.locale}/`}
            hrefLang={o.locale}
            aria-current={active ? 'true' : undefined}
            aria-label={o.label}
            data-cursor="link"
            onClick={(e) => {
              e.preventDefault();
              go(o.locale);
            }}
            className={`flex h-full items-center rounded-full px-2.5 transition-colors duration-500 ${
              active ? 'bg-fg text-bg' : 'text-fg/60 hover:text-[var(--accent)]'
            }`}
          >
            {o.label}
          </a>
        );
      })}
    </div>
  );
}
