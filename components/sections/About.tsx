import { useTranslations } from 'next-intl';
import Skills from './Skills';

/** Neptune chapter: About (top) + Skills (DOM source of truth for the constellation). */
export default function About() {
  const t = useTranslations('about');
  return (
    <div className="about">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-wider3 accent-text">{t('eyebrow')}</p>
      <h2 className="font-display text-display-md font-bold uppercase text-fg">{t('title')}</h2>
      <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-fg/78 md:text-[15px]">
        <p>{t('p1')}</p>
        <p>{t('p2')}</p>
        <p>{t('p3')}</p>
      </div>
      <Skills />
    </div>
  );
}
