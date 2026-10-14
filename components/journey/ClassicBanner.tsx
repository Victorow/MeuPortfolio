'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { hasWebGL } from '@/lib/device';
import { writeVersionPref } from '@/lib/version';

/** One-line strip offered when the 3D cannot run well here: no WebGL, or the visitor prefers reduced motion. */
export default function ClassicBanner({ reduced }: { reduced: boolean }) {
  const t = useTranslations('banner');
  const locale = useLocale();
  const [noWebGL, setNoWebGL] = useState(false);

  useEffect(() => setNoWebGL(!hasWebGL()), []);

  if (!noWebGL && !reduced) return null;

  return (
    <div
      role="note"
      data-classic-banner
      className="fixed inset-x-0 z-[79] flex justify-center px-4"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4.25rem)' }}
    >
      <p className="max-w-full text-center sm:truncate border border-white/15 bg-[#030305]/90 px-4 py-2 font-mono text-[11px] uppercase tracking-wider2 text-fg/75">
        {t('text')}{' '}
        <a
          href={`/${locale}/classic/`}
          data-cursor="link"
          onClick={() => writeVersionPref('classic')}
          className="text-fg underline decoration-[var(--accent)] underline-offset-4 hover:text-[var(--accent)]"
        >
          {t('cta')}
        </a>
      </p>
    </div>
  );
}
