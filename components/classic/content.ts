import { getTranslations } from 'next-intl/server';
import { projects, otherProjects, SOCIAL, TODO, type ProjectKey } from '@/content/projects';
import { SKILL_CLUSTER_IDS, DAILY_SKILLS, skillsDailyFirst, type SkillClusterId } from '@/content/skills';
import { FAQ_KEYS } from '@/content/faq';
import { formatUpdated } from '@/lib/seo/format';

export type ClassicLink = { href: string; label: string };
export type ClassicProject = {
  key: ProjectKey;
  index: string;
  title: string;
  kind: string;
  summary: string;
  ledger: string;
  stack: string[];
  problem: string;
  solution: string;
  impact: string;
  links: ClassicLink[];
};

/** Everything both classic designs render, resolved once on the server from content/* and messages/*. */
export async function getClassicContent(locale: string, updated: string) {
  const t = await getTranslations({ locale, namespace: 'classic' });
  const tp = await getTranslations({ locale, namespace: 'projects' });
  const ts = await getTranslations({ locale, namespace: 'skills' });
  const ta = await getTranslations({ locale, namespace: 'about' });
  const tc = await getTranslations({ locale, namespace: 'contact' });
  const tf = await getTranslations({ locale, namespace: 'faq' });

  const linkLabel = { repo: tp('labels.repo'), live: '', store: tp('labels.store'), playStore: tp('labels.playStore'), marketplace: tp('labels.marketplace') };

  const projectList: ClassicProject[] = projects.map((p) => {
    const links: ClassicLink[] = [];
    const add = (href: string | undefined, label: string) => {
      if (href && href !== TODO) links.push({ href, label: `${label} ↗` });
    };
    add(p.links.store, linkLabel.store);
    add(p.links.playStore, linkLabel.playStore);
    add(p.links.live, p.links.live ? new URL(p.links.live).hostname : '');
    add(p.links.repo, linkLabel.repo);
    add(p.links.marketplace, linkLabel.marketplace);
    return {
      key: p.key,
      index: p.index,
      title: tp(`items.${p.key}.title`),
      kind: t(`projects.kinds.${p.key}`),
      summary: tp(`items.${p.key}.summary`),
      ledger: p.ledger.join(' · '),
      stack: p.stack,
      problem: tp(`items.${p.key}.problem`),
      solution: tp(`items.${p.key}.solution`),
      impact: tp(`items.${p.key}.impact`),
      links
    };
  });

  const pull = t.raw('about.pull') as string;
  const pullMatch = /^(.*)<b>(.*)<\/b>(.*)$/s.exec(pull);

  const date = formatUpdated(updated, locale);
  const otherLocale = locale === 'en' ? 'pt-BR' : 'en';

  return {
    locale,
    otherLocale,
    updated,
    updatedLabel: date,
    links: {
      cv: SOCIAL.cv,
      email: SOCIAL.email,
      github: SOCIAL.github,
      linkedin: SOCIAL.linkedin !== TODO ? SOCIAL.linkedin : undefined,
      home3d: `/${locale}/`,
      self: `/${locale}/classic/`,
      other: `/${otherLocale}/classic/`
    },
    labels: {
      skip: t('skip'),
      lang: t('nav.lang'),
      problem: tp('labels.problem'),
      solution: tp('labels.solution'),
      impact: tp('labels.impact'),
      switchLabel: t('switch.label'),
      switchA: t('switch.a'),
      switchB: t('switch.b')
    },
    nav: {
      label: t('nav.label'),
      projects: t('nav.projects'),
      about: t('nav.about'),
      skills: t('nav.skills'),
      faq: t('nav.faq'),
      faqB: t('nav.faqB'),
      contact: t('nav.contact'),
      version3d: t('nav.version3d'),
      version3dTitle: t('nav.version3dTitle'),
      aboutAside: t('nav.aboutAside'),
      skillsAside: t('nav.skillsAside', { count: SKILL_CLUSTER_IDS.length }),
      contactAside: t('nav.contactAside')
    },
    hero: {
      role: t('hero.role'),
      city: t('hero.city'),
      line1: t('hero.line1'),
      line2: t('hero.line2'),
      line3: t('hero.line3'),
      intro: (await getTranslations({ locale, namespace: 'hero' }))('subtitle'),
      cv: t('hero.cv'),
      contact: t('hero.contact'),
      github: t('hero.github'),
      linkedin: t('hero.linkedin')
    },
    facts: {
      label: t('facts.label'),
      rows: (['role', 'city', 'education', 'focus', 'languages'] as const).map((k) => ({ dt: t(`facts.${k}.dt`), dd: t(`facts.${k}.dd`) })),
      updated: { dt: t('facts.updated.dt'), dd: date }
    },
    projects: {
      title: t('projects.title'),
      titleB: t('projects.titleB'),
      aside: t('projects.aside'),
      asideB: t('projects.asideB'),
      othersLabel: t('projects.others'),
      list: projectList,
      others: otherProjects.map((o) => ({ href: o.url, label: ts(`others.${o.key}`).split(' — ')[0] }))
    },
    about: {
      title: t('about.title'),
      aside: t('about.aside'),
      pull: pullMatch ? { before: pullMatch[1], strong: pullMatch[2], after: pullMatch[3] } : { before: pull, strong: '', after: '' },
      timeline: (['now', 'before', 'education'] as const).map((k) => ({
        key: k,
        when: t(`about.timeline.${k}.when`),
        title: t(`about.timeline.${k}.title`),
        text: t(`about.timeline.${k}.text`)
      })),
      paragraphs: [ta('p1'), t('about.p2'), t('about.p3')]
    },
    skills: {
      title: t('skills.title'),
      aside: t('skills.aside'),
      rows: SKILL_CLUSTER_IDS.map((id: SkillClusterId) => ({
        id,
        label: ts(`clusters.${id}`),
        items: skillsDailyFirst(id).map((name) => ({ name, daily: DAILY_SKILLS.has(name) }))
      }))
    },
    faq: {
      title: t('faq.title'),
      titleB: t('faq.titleB'),
      aside: t('faq.aside'),
      items: FAQ_KEYS.map((k) => ({ key: k, q: tf(`items.${k}.q`), a: tf(`items.${k}.a`) }))
    },
    contact: {
      label: t('contact.label'),
      title1: tc('title1'),
      title2: tc('title2'),
      title3: tc('title3')
    },
    footer: {
      rights: t('footer.rights', { year: new Date().getFullYear() }),
      privacy: t('footer.privacy'),
      updated: t('footer.updated', { date })
    }
  };
}

export type ClassicContent = Awaited<ReturnType<typeof getClassicContent>>;
