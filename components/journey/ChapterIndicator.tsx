'use client';

import { useTranslations } from 'next-intl';
import { useJourney } from '@/lib/journey/store';
import { CHAPTERS, chapterIndex } from '@/lib/journey/timeline';

export default function ChapterIndicator() {
  const t = useTranslations('chapters');
  const chapter = useJourney((s) => s.chapter);
  const n = chapterIndex(chapter) + 1;
  return (
    <div
      data-chapter-indicator
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 left-5 z-[70] flex items-baseline gap-3 rounded-full bg-bg/70 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider2 backdrop-blur-md md:bottom-7 md:left-[3vw]"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <span className="tabular-nums text-fg">
        {String(n).padStart(2, '0')} <span className="text-fg/35">/ {String(CHAPTERS.length).padStart(2, '0')}</span>
      </span>
      <span className="hidden h-px w-6 bg-[var(--accent)] sm:block" />
      <span key={chapter} className="accent-text animate-[fadeUp_0.6s_cubic-bezier(0.22,1,0.36,1)]">
        {t(chapter)}
      </span>
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
