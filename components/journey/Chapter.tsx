'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { ChapterId } from '@/content/planets';
import { chapterHeightVh } from '@/lib/journey/timeline';
import { useReducedMotion } from '@/lib/device';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

type Props = {
  id: ChapterId;
  children: ReactNode;
  /** Horizontal alignment of the content column. */
  align?: 'left' | 'right' | 'center';
  /**
   * pinned: content is sticky for one screen, then the chapter's extra height is the
   * camera travel to the next planet (content fades out during it).
   * flow: content taller than a screen scrolls naturally while the camera holds.
   */
  layout?: 'pinned' | 'flow';
  className?: string;
};

export default function Chapter({ id, children, align = 'left', layout = 'pinned', className = '' }: Props) {
  const section = useRef<HTMLElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const sec = section.current;
    const el = inner.current;
    if (!sec || !el) return;
    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(el, { opacity: 1, y: 0 });
        return;
      }
      // Arrive: fade in while the section top travels from 55% to 5% of the viewport.
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top 55%', end: 'top 5%', scrub: true } }
      );
      if (layout === 'pinned') {
        // Leave: fade out as the camera travel begins (chapter is 140vh: hold ≈ first 77vh).
        // 'bottom 85%' ≈ 55vh scrolled into the chapter, 'bottom 60%' ≈ 80vh.
        gsap.fromTo(
          el,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -30,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: sec, start: 'bottom 85%', end: 'bottom 60%', scrub: true }
          }
        );
      }
    }, sec);
    return () => ctx.revert();
  }, [reduced, layout]);

  const alignCls =
    align === 'right' ? 'md:ml-auto md:mr-[6vw]' : align === 'center' ? 'mx-auto text-center' : 'md:ml-[6vw]';

  if (layout === 'flow') {
    return (
      <section
        ref={section}
        id={id}
        data-chapter={id}
        data-layout="flow"
        className={`chapter relative ${className}`}
        style={{ minHeight: `${chapterHeightVh(id)}vh` }}
      >
        <div className="flex w-full items-start py-[14vh]">
          <div ref={inner} className={`chapter-content relative w-full px-5 md:w-[50%] md:px-0 ${alignCls}`}>
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={section}
      id={id}
      data-chapter={id}
      data-layout="pinned"
      className={`chapter relative ${className}`}
      style={{ height: `${chapterHeightVh(id)}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] w-full items-center">
        <div ref={inner} className={`chapter-content relative w-full px-5 md:w-[46%] md:px-0 ${alignCls}`}>
          {children}
        </div>
      </div>
    </section>
  );
}
