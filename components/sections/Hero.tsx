'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { easeCine, lineReveal, stagger } from '@/lib/motion';

export default function Hero() {
  const t = useTranslations('hero');

  const container = stagger(0.15, 0.12);

  return (
    <section
      id="hero"
      data-snap
      className="section relative flex min-h-[100svh] w-full flex-col justify-between overflow-hidden px-6 pb-10 pt-28 md:px-12 md:pt-32"
    >
      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: easeCine, delay: 0.3 }}
        className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-ink-200"
      >
        <span className="flex items-center gap-2">
          <span className="inline-block h-[1px] w-6 bg-ink-300/60" />
          {t('eyebrow')}
        </span>
        <span className="hidden tabular-nums md:inline">N · 00° 00′ 00″   W · 00° 00′ 00″</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        variants={container}
        initial="hidden"
        animate="show"
        className="font-display uppercase text-display-xl text-balance leading-[0.9]"
        style={{ willChange: 'transform, opacity' }}
      >
        <span className="block overflow-hidden">
          <motion.span className="block gpu" variants={lineReveal}>
            {t('title1')}
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span className="block gpu text-ink-100" variants={lineReveal}>
            {t('title2')}
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span className="block gpu text-ink-300" variants={lineReveal}>
            {t('title3')}
          </motion.span>
        </span>
      </motion.h1>

      {/* Bottom row */}
      <div className="mt-16 grid grid-cols-1 gap-10 md:mt-0 md:grid-cols-12 md:items-end">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: easeCine, delay: 0.9 }}
          className="max-w-md text-balance text-sm leading-relaxed text-ink-200 md:col-span-5 md:col-start-1"
        >
          {t('subtitle')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: easeCine, delay: 1.05 }}
          className="flex items-center gap-8 text-[11px] uppercase tracking-[0.3em] text-ink-100 md:col-span-4 md:col-start-8 md:justify-end"
        >
          <a href="#projects" className="group relative inline-flex items-center gap-3 transition-colors hover:text-white">
            <span className="inline-block h-[1px] w-8 bg-ink-200 transition-all duration-500 ease-cine group-hover:w-12 group-hover:bg-white" />
            {t('ctaProjects')}
          </a>
          <a href="#about" className="group relative inline-flex items-center gap-3 text-ink-300 transition-colors hover:text-white">
            <span className="inline-block h-[1px] w-4 bg-ink-300 transition-all duration-500 ease-cine group-hover:w-8 group-hover:bg-white" />
            {t('ctaAbout')}
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: easeCine, delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-ink-300"
      >
        <span className="flex flex-col items-center gap-2">
          {t('scroll')}
          <span className="relative block h-10 w-[1px] overflow-hidden bg-ink-500/60">
            <motion.span
              className="absolute left-0 top-0 block h-4 w-full bg-ink-50"
              animate={{ y: ['-100%', '250%'] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </span>
      </motion.div>
    </section>
  );
}
