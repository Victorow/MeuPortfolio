'use client';

import { useTranslations } from 'next-intl';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import SectionHeader from './SectionHeader';
import Reveal from '@/components/ui/Reveal';
import { projects, type Project } from '@/content/projects';
import { getTechIcon } from '@/lib/techIcons';

function ProjectPanel({ project }: { project: Project }) {
  const tItems = useTranslations(`projects.items.${project.key}`);
  const tLabels = useTranslations('projects.labels');
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.3, 1, 1, 0.3]);

  return (
    <motion.article
      ref={ref}
      data-snap
      style={{ opacity }}
      className="relative grid min-h-[100svh] grid-cols-1 gap-10 border-t border-white/5 py-20 md:grid-cols-12 md:gap-12 md:py-32"
    >
      {/* Index column */}
      <div className="flex items-start gap-6 md:col-span-3">
        <span className="font-display text-xs uppercase tracking-[0.3em] text-ink-300">
          {project.index}
        </span>
        <span className="mt-[7px] inline-block h-[1px] w-12 bg-ink-500" />
      </div>

      {/* Main */}
      <div className="md:col-span-6">
        <motion.div style={{ y }} className="gpu">
          <Reveal>
            <h3 className="font-display uppercase text-display-md text-ink-50 text-balance">
              {tItems('title')}
            </h3>
          </Reveal>

          <Reveal delay={0.05} className="mt-6">
            <p className="max-w-xl text-base leading-relaxed text-ink-100">{tItems('summary')}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <Reveal delay={0.1}>
              <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-300">
                {tLabels('problem')}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-ink-200">{tItems('problem')}</dd>
            </Reveal>
            <Reveal delay={0.15}>
              <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-300">
                {tLabels('solution')}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-ink-200">{tItems('solution')}</dd>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mt-10">
            <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-300">
              {tLabels('architecture')}
            </dt>
            <dd className="mt-3 text-sm leading-relaxed text-ink-200">{tItems('architecture')}</dd>
          </Reveal>
        </motion.div>
      </div>

      {/* Meta */}
      <div className="md:col-span-3">
        <Reveal delay={0.1}>
          <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-300">{tLabels('stack')}</dt>
          <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2">
            {project.stack.map((s) => {
              const Icon = getTechIcon(s);
              return (
                <li
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-ink-100"
                >
                  {Icon && <Icon aria-hidden className="h-3 w-3 text-ink-200" />}
                  {s}
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.2} className="mt-8">
          <dt className="text-[10px] uppercase tracking-[0.3em] text-ink-300">{tLabels('links')}</dt>
          <ul className="mt-4 flex flex-col gap-2 text-sm text-ink-100">
            {project.links.caseStudy && (
              <li>
                <a href={project.links.caseStudy} className="group inline-flex items-center gap-2 transition-colors hover:text-white">
                  <span className="h-[1px] w-5 bg-ink-300 transition-all duration-500 ease-cine group-hover:w-8 group-hover:bg-white" />
                  {tLabels('caseStudy')}
                </a>
              </li>
            )}
            {project.links.live && (
              <li>
                <a href={project.links.live} className="group inline-flex items-center gap-2 transition-colors hover:text-white">
                  <span className="h-[1px] w-5 bg-ink-300 transition-all duration-500 ease-cine group-hover:w-8 group-hover:bg-white" />
                  {tLabels('liveDemo')}
                </a>
              </li>
            )}
            {project.links.repo && (
              <li>
                <a href={project.links.repo} className="group inline-flex items-center gap-2 transition-colors hover:text-white">
                  <span className="h-[1px] w-5 bg-ink-300 transition-all duration-500 ease-cine group-hover:w-8 group-hover:bg-white" />
                  {tLabels('repository')}
                </a>
              </li>
            )}
          </ul>
        </Reveal>
      </div>

      {/* Giant index ghost */}
      <motion.span
        aria-hidden
        style={{ y: useTransform(scrollYProgress, [0, 1], [40, -40]) }}
        className="pointer-events-none absolute -right-4 top-10 hidden select-none font-display text-[22vw] leading-none tracking-tightest text-white/[0.025] md:block"
      >
        {project.index}
      </motion.span>
    </motion.article>
  );
}

export default function Projects() {
  const t = useTranslations('projects');

  return (
    <section id="projects" data-snap className="section relative px-6 py-24 md:px-12 md:py-40">
      <SectionHeader eyebrow={t('eyebrow')} title={t('title')} caption={t('caption')} />
      <div className="mx-auto">
        {projects.map((p) => (
          <ProjectPanel key={p.key} project={p} />
        ))}
      </div>
    </section>
  );
}
