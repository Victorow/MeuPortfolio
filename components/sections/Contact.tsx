'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';
import { easeCine, lineReveal, stagger } from '@/lib/motion';

export default function Contact() {
  const t = useTranslations('contact');
  const container = stagger(0.1, 0.1);

  return (
    <section
      id="contact"
      data-snap
      className="section relative flex min-h-[100svh] flex-col justify-between px-6 py-24 md:px-12 md:py-32"
    >
      <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-ink-200">
        <span className="inline-block h-[1px] w-6 bg-ink-300/60" />
        {t('eyebrow')}
      </div>

      <motion.h2
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="font-display uppercase text-display-lg text-balance leading-[0.92]"
      >
        <span className="block overflow-hidden">
          <motion.span className="block gpu" variants={lineReveal}>{t('title1')}</motion.span>
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
      </motion.h2>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:items-end md:gap-12">
        <Reveal className="md:col-span-6">
          <p className="text-sm leading-relaxed text-ink-200">{t('caption')}</p>

          <a
            href={`mailto:${t('email')}`}
            className="group mt-10 flex flex-col gap-2"
          >
            <span className="text-[10px] uppercase tracking-[0.32em] text-ink-300">
              {t('emailLabel')}
            </span>
            <span className="flex items-center gap-4 font-display text-2xl uppercase tracking-tightest text-ink-50 transition-colors duration-500 ease-cine group-hover:text-white md:text-4xl">
              {t('email')}
              <motion.span
                aria-hidden
                className="inline-block h-[1px] w-10 bg-ink-300 transition-all duration-500 ease-cine group-hover:w-24 group-hover:bg-white"
                transition={{ ease: easeCine }}
              />
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.1} className="md:col-span-5 md:col-start-8">
          <dt className="text-[10px] uppercase tracking-[0.32em] text-ink-300">Channels</dt>
          <ul className="mt-6 flex flex-col divide-y divide-white/5 border-y border-white/5">
            {(['github', 'linkedin', 'x'] as const).map((k) => (
              <li key={k}>
                <a
                  href="#"
                  className="group flex items-center justify-between py-4 text-sm uppercase tracking-[0.2em] text-ink-100 transition-colors hover:text-white"
                >
                  <span>{t(`socials.${k}`)}</span>
                  <span className="inline-flex items-center gap-2 text-ink-300 transition-colors group-hover:text-white">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <Reveal delay={0.2} className="mt-20 border-t border-white/5 pt-10 text-center">
        <p className="font-display text-sm uppercase tracking-[0.32em] text-ink-200">
          {t('final')}
        </p>
      </Reveal>
    </section>
  );
}
