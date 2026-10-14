'use client';

import { useTranslations } from 'next-intl';
import { useJourney } from '@/lib/journey/store';
import { writeSoundPref } from '@/lib/audio';

export default function SoundToggle() {
  const t = useTranslations('header');
  const on = useJourney((s) => s.soundOn);
  const set = useJourney((s) => s.setSoundOn);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? t('soundOn') : t('soundOff')}
      data-cursor="link"
      onClick={() => {
        set(!on);
        writeSoundPref(!on);
      }}
      className="flex h-9 items-center gap-[3px] rounded-full border border-white/12 bg-black/30 px-3 backdrop-blur-md transition-colors duration-500 hover:border-[var(--accent)]"
    >
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="block w-[2px] rounded-full bg-fg/80 transition-all duration-500"
          style={{
            height: on ? `${[8, 14, 10, 6][i]}px` : '3px',
            animation: on ? `bar${i} ${0.9 + i * 0.17}s ease-in-out infinite alternate` : 'none'
          }}
        />
      ))}
      <style jsx>{`
        @keyframes bar0 { from { height: 4px } to { height: 12px } }
        @keyframes bar1 { from { height: 6px } to { height: 15px } }
        @keyframes bar2 { from { height: 5px } to { height: 11px } }
        @keyframes bar3 { from { height: 3px } to { height: 9px } }
      `}</style>
    </button>
  );
}
