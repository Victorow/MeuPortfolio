'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from './SectionHeader';

export default function About() {
  const t = useTranslations('about');
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section
      id="about"
      ref={ref}
      data-snap
      className="section relative min-h-[100svh] px-6 py-24 md:px-12 md:py-40"
    >
      <SectionHeader eyebrow={t('eyebrow')} title={t('title')} />

      <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
        <motion.div style={{ y }} className="gpu md:col-span-7 md:col-start-1">
          <Reveal>
            <p className="text-xl leading-[1.45] text-ink-50 md:text-2xl text-balance">
              {t('p1')}
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <p className="max-w-2xl text-base leading-relaxed text-ink-200">{t('p2')}</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-6">
            <p className="max-w-2xl text-base leading-relaxed text-ink-200">{t('p3')}</p>
          </Reveal>
        </motion.div>

        <div className="md:col-span-4 md:col-start-9">
          <Reveal delay={0.15}>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_60%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-ink-200">
                  <span className="block h-1 w-1 rounded-full bg-ink-100" />
                  Vector · 01
                </div>
                <div>
                  <div className="font-display text-5xl leading-none text-ink-50 tracking-tightest">
                    ∞
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.25em] text-ink-200">
                    <span>Lat</span><span className="text-ink-100 tabular-nums">00.00° N</span>
                    <span>Lng</span><span className="text-ink-100 tabular-nums">00.00° W</span>
                    <span>Sys</span><span className="text-ink-100">Stable</span>
                    <span>Signal</span><span className="text-ink-100">Nominal</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
