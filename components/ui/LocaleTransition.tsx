'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocaleTransitionPending, setLocaleTransitionPending } from '@/lib/localeTransition';
import { easeCine } from '@/lib/motion';

/**
 * Cinematic crossfade / wipe overlay that plays whenever the locale changes.
 *   1. When the user triggers a locale change, pending = true → overlay slides in.
 *   2. Next.js App Router soft-navigates (no reload), layout re-streams with
 *      the new messages.
 *   3. Once this component receives a new `locale` prop, it clears pending and
 *      the overlay slides out to reveal the translated content.
 *
 * Also fades the page content briefly on locale swap via a keyed child using
 * `data-locale-key` on the page root.
 */
export default function LocaleTransition({ locale }: { locale: string }) {
  const pending = useLocaleTransitionPending();
  const [lastLocale, setLastLocale] = useState(locale);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (locale !== lastLocale) {
      setLastLocale(locale);
      setLocaleTransitionPending(false);
      // Brief flash to mark the transition end
      setFlash(true);
      const id = window.setTimeout(() => setFlash(false), 700);
      return () => window.clearTimeout(id);
    }
  }, [locale, lastLocale]);

  const active = pending || flash;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="locale-overlay"
          className="pointer-events-none fixed inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: easeCine }}
        >
          {/* Dark veil */}
          <motion.div
            className="absolute inset-0 bg-ink-950/85 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: easeCine }}
          />
          {/* Bottom-up sweeping panel */}
          <motion.div
            className="absolute inset-x-0 bottom-0 h-full bg-black"
            initial={{ y: '100%' }}
            animate={{ y: pending ? '0%' : '-100%' }}
            exit={{ y: '-110%' }}
            transition={{ duration: 0.9, ease: easeCine }}
          />
          {/* Label */}
          <div className="relative flex h-full items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: easeCine, delay: 0.15 }}
              className="flex items-center gap-3 font-display text-xs uppercase tracking-[0.4em] text-ink-100"
            >
              <span className="inline-block h-[1px] w-10 bg-ink-300" />
              {lastLocale === 'pt-BR' ? 'PT · BR' : 'EN · US'}
              <span className="inline-block h-[1px] w-10 bg-ink-300" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
