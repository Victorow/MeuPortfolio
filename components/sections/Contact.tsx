import { useTranslations } from 'next-intl';
import { SOCIAL, TODO } from '@/content/projects';

export default function Contact() {
  const t = useTranslations('contact');
  return (
    <div className="contact mx-auto flex max-w-[900px] flex-col items-center text-center">
      <p className="mb-5 font-mono text-[11px] uppercase tracking-wider3 accent-text">{t('eyebrow')}</p>
      <h2 className="font-display text-display-lg font-bold uppercase text-fg">
        <span className="block">{t('title1')}</span>
        <span className="block">{t('title2')}</span>
        <span className="block accent-text">{t('title3')}</span>
      </h2>
      <p className="mt-6 max-w-[48ch] text-balance text-[15px] leading-relaxed text-fg/75">{t('caption')}</p>

      <a
        href={`mailto:${SOCIAL.email}`}
        data-cursor="link"
        data-cursor-label="✉"
        aria-label={t('emailLabel')}
        className="u-link mt-9 font-display text-[clamp(1.4rem,4vw,3.2rem)] font-bold tracking-tightest text-fg"
      >
        {SOCIAL.email}
      </a>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 font-mono text-[12px] uppercase tracking-wider2">
        <a href={SOCIAL.cv} download data-cursor="link" className="rounded-full bg-fg px-5 py-2.5 text-bg transition-colors duration-500 hover:bg-[var(--accent)]">
          {t('cv')}
        </a>
        <a href={SOCIAL.github} target="_blank" rel="noreferrer noopener" data-cursor="link" className="u-link text-fg">
          {t('socials.github')} ↗
        </a>
        {SOCIAL.linkedin !== TODO && (
          <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer noopener" data-cursor="link" className="u-link text-fg">
            {t('socials.linkedin')} ↗
          </a>
        )}
      </div>

      <p className="mt-14 font-mono text-[10px] uppercase tracking-wider3 text-fg/40">{t('final')}</p>
    </div>
  );
}
