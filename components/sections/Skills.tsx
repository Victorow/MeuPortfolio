'use client';

import { useTranslations } from 'next-intl';
import { SKILL_CLUSTER_IDS, SKILL_CLUSTERS } from '@/content/skills';
import { otherProjects } from '@/content/projects';
import { getTechIcon } from '@/lib/techIcons';
import { useJourney } from '@/lib/journey/store';

export default function Skills() {
  const t = useTranslations('skills');
  const hovered = useJourney((s) => s.hoveredSkill);
  const setHovered = useJourney((s) => s.setHoveredSkill);

  return (
    <section className="mt-10" aria-labelledby="skills-title">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-wider3 accent-text">{t('eyebrow')}</p>
      <h3 id="skills-title" className="font-display text-[clamp(1.4rem,2.6vw,2rem)] font-bold uppercase tracking-tightest text-fg">
        {t('title')}
      </h3>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SKILL_CLUSTER_IDS.map((cid) => (
          <div key={cid}>
            <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider2 text-fg/45">{t(`clusters.${cid}`)}</h4>
            <ul className="flex flex-wrap gap-1.5" onMouseLeave={() => setHovered(null)}>
              {SKILL_CLUSTERS[cid].map((s) => {
                const Icon = getTechIcon(s);
                return (
                  <li
                    key={s}
                    className="chip"
                    data-skill={s}
                    data-hot={hovered === s}
                    onMouseEnter={() => setHovered(s)}
                    onFocus={() => setHovered(s)}
                    tabIndex={0}
                  >
                    {Icon ? <Icon size={11} aria-hidden /> : null}
                    {s}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <h4 className="mt-8 mb-2 font-mono text-[10px] uppercase tracking-wider2 text-fg/45">{t('othersTitle')}</h4>
      <ul className="space-y-1.5 text-[13px] text-fg/75">
        {otherProjects.map((p) => (
          <li key={p.key}>
            <a href={p.url} target="_blank" rel="noreferrer noopener" data-cursor="link" className="u-link">
              {t(`others.${p.key}`)} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
