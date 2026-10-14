'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useJourney } from '@/lib/journey/store';
import { CHAPTERS, rangeOf } from '@/lib/journey/timeline';
import { goToChapter } from '@/lib/journey/navigate';

export default function ProgressRail() {
  const t = useTranslations('chapters');
  const fill = useRef<HTMLDivElement>(null);
  const chapter = useJourney((s) => s.chapter);

  useEffect(() => {
    return useJourney.subscribe(
      (s) => s.progress,
      (p) => {
        if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      }
    );
  }, []);

  return (
    <nav
      aria-label="Chapters"
      className="fixed right-4 top-1/2 z-[70] hidden -translate-y-1/2 flex-col items-center gap-3 md:right-[2.2vw] md:flex"
    >
      <div className="relative h-[34vh] w-px bg-white/10">
        <div ref={fill} className="absolute inset-0 origin-top bg-[var(--accent)]" style={{ transform: 'scaleY(0)' }} />
        {CHAPTERS.map((id) => (
          <button
            key={id}
            type="button"
            aria-label={t(id)}
            aria-current={chapter === id ? 'true' : undefined}
            data-cursor="link"
            onClick={() => goToChapter(id)}
            className="group absolute -left-[5px] h-[11px] w-[11px] -translate-y-1/2 rounded-full"
            style={{ top: `${rangeOf(id).start * 100}%` }}
          >
            <span
              className="block h-full w-full scale-[0.45] rounded-full border border-white/40 bg-bg transition-all duration-500 ease-cine group-hover:scale-100 group-hover:border-[var(--accent)]"
              style={chapter === id ? { transform: 'scale(1)', borderColor: 'var(--accent)', background: 'var(--accent)' } : undefined}
            />
          </button>
        ))}
      </div>
    </nav>
  );
}
