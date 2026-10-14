'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import gsap from 'gsap';
import { useJourney } from '@/lib/journey/store';
import { goToChapter } from '@/lib/journey/navigate';
import { useReducedMotion } from '@/lib/device';

export default function Hero() {
  const t = useTranslations('hero');
  const ready = useJourney((s) => s.ready);
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready || !root.current) return;
    const ctx = gsap.context(() => {
      const words = root.current!.querySelectorAll('[data-word]');
      const rest = root.current!.querySelectorAll('[data-rest]');
      if (reduced) {
        gsap.set([words, rest], { opacity: 1, y: 0, filter: 'blur(0px)' });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(words, { y: 60, opacity: 0, filter: 'blur(10px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1, stagger: 0.09 }, 0.1)
        .fromTo(rest, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 }, 0.55);
    }, root);
    return () => ctx.revert();
  }, [ready, reduced]);

  return (
    <div ref={root} className="hero relative">
      <p data-rest className="mb-5 font-mono text-[11px] uppercase tracking-wider3 text-fg/60 opacity-0">
        {t('eyebrow')}
      </p>
      <h1 className="font-display text-[clamp(3rem,8.2vw,8.2rem)] font-bold uppercase leading-[0.88] tracking-tightest text-fg">
        <span className="block overflow-hidden">
          <span data-word className="inline-block opacity-0">
            {t('name1')}
          </span>
        </span>
        <span className="block overflow-hidden">
          <span data-word className="inline-block opacity-0 accent-text">
            {t('name2')}
          </span>
        </span>
      </h1>
      <p data-rest className="mt-7 max-w-[46ch] text-balance text-[15px] leading-relaxed text-fg/80 opacity-0 md:text-[17px]">
        {t('subtitle')}
      </p>
      <div data-rest className="mt-9 flex flex-wrap items-center gap-3 opacity-0">
        <button
          type="button"
          data-cursor="link"
          onClick={() => goToChapter('mars')}
          className="rounded-full bg-fg px-6 py-3 font-mono text-[12px] uppercase tracking-wider2 text-bg transition-colors duration-500 hover:bg-[var(--accent)]"
        >
          {t('ctaProjects')}
        </button>
        <button
          type="button"
          data-cursor="link"
          onClick={() => goToChapter('deep')}
          className="rounded-full border border-white/20 px-6 py-3 font-mono text-[12px] uppercase tracking-wider2 text-fg transition-colors duration-500 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {t('ctaContact')}
        </button>
      </div>
      <div data-rest className="mt-14 flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider3 text-fg/40 opacity-0">
        <span className="block h-8 w-px bg-gradient-to-b from-fg/60 to-transparent" />
        {t('scroll')}
      </div>
    </div>
  );
}
