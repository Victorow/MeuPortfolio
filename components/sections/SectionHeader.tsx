'use client';

import Reveal from '@/components/ui/Reveal';
import { fadeUp } from '@/lib/motion';

export default function SectionHeader({
  eyebrow,
  title,
  caption,
  id
}: {
  eyebrow: string;
  title: string;
  caption?: string;
  id?: string;
}) {
  return (
    <header id={id} className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
      <Reveal variants={fadeUp} className="flex flex-col gap-6">
        <span className="text-[10px] uppercase tracking-[0.32em] text-ink-200">{eyebrow}</span>
        <h2 className="font-display uppercase text-display-md text-ink-50 text-balance">
          {title}
        </h2>
      </Reveal>
      {caption && (
        <Reveal variants={fadeUp} delay={0.15} className="max-w-sm">
          <p className="text-sm leading-relaxed text-ink-200">{caption}</p>
        </Reveal>
      )}
    </header>
  );
}
