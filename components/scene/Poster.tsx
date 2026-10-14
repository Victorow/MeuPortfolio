'use client';

import { useJourney } from '@/lib/journey/store';
import { CHAPTERS } from '@/lib/journey/timeline';

/** No-WebGL fallback: static chapter posters crossfading with the active chapter. */
export default function Poster() {
  const chapter = useJourney((s) => s.chapter);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-[#030305]">
      {CHAPTERS.map((c) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={c}
          src={`/posters/${c}.jpg`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: c === chapter ? 1 : 0 }}
          loading={c === 'earth' ? 'eager' : 'lazy'}
        />
      ))}
    </div>
  );
}
