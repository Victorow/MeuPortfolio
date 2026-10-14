import { useTranslations } from 'next-intl';

/** Thin kinetic text band between chapters. Pure CSS animation; paused on reduced motion. */
export default function Marquee() {
  const t = useTranslations();
  const text = t('marquee');
  const row = Array.from({ length: 6 }, () => text).join('');
  return (
    <div aria-hidden className="pointer-events-none relative z-10 -my-[2.5rem] h-[5rem] w-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 flex w-max items-center animate-marquee will-change-transform">
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider3 text-fg/30">{row}</span>
        <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider3 text-fg/30">{row}</span>
      </div>
    </div>
  );
}
