import { useTranslations } from 'next-intl';
import { TODO, type Project } from '@/content/projects';
import { getTechIcon } from '@/lib/techIcons';

const LINK_ORDER: (keyof Project['links'])[] = ['repo', 'live', 'store', 'marketplace'];

export default function ProjectChapter({ project }: { project: Project }) {
  const t = useTranslations('projects');
  const ti = useTranslations(`projects.items.${project.key}`);
  const links = LINK_ORDER.filter((k) => project.links[k] && project.links[k] !== TODO);

  return (
    <article className="project">
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wider2 text-fg/55">
        <span className="tabular-nums">
          <span className="accent-text">{project.index}</span> / 05
        </span>
        <span className="h-px w-5 bg-fg/25" />
        <span>{t(`kind.${project.kind}`)}</span>
      </div>

      <h2 className="font-display text-display-md font-bold uppercase text-fg">{ti('title')}</h2>
      <p className="mt-4 max-w-[52ch] text-balance text-[15px] leading-relaxed text-fg/85 md:text-[16px]">{ti('summary')}</p>

      <dl className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <dt className="mb-1.5 font-mono text-[10px] uppercase tracking-wider3 accent-text">{t('labels.problem')}</dt>
          <dd className="text-[13.5px] leading-relaxed text-fg/70">{ti('problem')}</dd>
        </div>
        <div>
          <dt className="mb-1.5 font-mono text-[10px] uppercase tracking-wider3 accent-text">{t('labels.solution')}</dt>
          <dd className="text-[13.5px] leading-relaxed text-fg/70">{ti('solution')}</dd>
        </div>
      </dl>

      <p className="mt-5 border-l border-[var(--accent)] pl-3 text-[13.5px] leading-relaxed text-fg/80">
        <span className="mr-2 font-mono text-[10px] uppercase tracking-wider3 text-fg/45">{t('labels.impact')}</span>
        {ti('impact')}
      </p>

      <ul className="mt-6 flex flex-wrap gap-2" aria-label={t('labels.stack')}>
        {project.stack.map((s) => {
          const Icon = getTechIcon(s);
          return (
            <li key={s} className="chip">
              {Icon ? <Icon size={12} aria-hidden /> : null}
              {s}
            </li>
          );
        })}
      </ul>

      {links.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
          {links.map((k) => (
            <a
              key={k}
              href={project.links[k]}
              target="_blank"
              rel="noreferrer noopener"
              data-cursor="link"
              data-cursor-label="↗"
              className="u-link font-mono text-[12px] uppercase tracking-wider2 text-fg"
            >
              {t(`labels.${k}`)} ↗
            </a>
          ))}
        </div>
      )}
    </article>
  );
}
