import { projects, otherProjects, SOCIAL, TODO } from '@/content/projects';
import { SKILL_CLUSTER_IDS, SKILL_CLUSTERS } from '@/content/skills';
import { FAQ_KEYS } from '@/content/faq';
import { FULL_NAME, absoluteUrl, pagePath } from './site';

type Messages = any;

const live = (u?: string) => (u && u !== TODO ? u : undefined);

function projectLinks(p: (typeof projects)[number]): string[] {
  return [live(p.links.repo), live(p.links.live), live(p.links.store), live(p.links.playStore), live(p.links.marketplace)].filter(Boolean) as string[];
}

/** llms.txt: short Markdown index (https://llmstxt.org). English first, Portuguese summary second. */
export function llmsTxt(en: Messages, pt: Messages, updated: string): string {
  const lines = [
    `# ${FULL_NAME}`,
    '',
    `> ${en.faq.items.who.a}`,
    '',
    `Portuguese: ${pt.faq.items.who.a}`,
    '',
    `Last updated: ${updated}`,
    '',
    '## Pages',
    '',
    `- [Classic portfolio (English)](${absoluteUrl(pagePath('en', 'classic'))}): fast, text-first version with projects, skills and FAQ`,
    `- [Portfólio clássico (português)](${absoluteUrl(pagePath('pt-BR', 'classic'))}): versão leve com projetos, skills e FAQ`,
    `- [3D portfolio (English)](${absoluteUrl(pagePath('en', 'home'))}): scroll journey through the solar system`,
    `- [Portfólio 3D (português)](${absoluteUrl(pagePath('pt-BR', 'home'))})`,
    `- [Resume PDF](${absoluteUrl(SOCIAL.cv)})`,
    `- [Full facts for LLMs](${absoluteUrl('/llms-full.txt')})`,
    '',
    '## Projects',
    '',
    ...projects.map((p) => {
      const link = projectLinks(p)[0];
      const it = en.projects.items[p.key];
      return `- ${link ? `[${it.title}](${link})` : it.title}: ${it.summary}`;
    }),
    '',
    '## Profiles',
    '',
    `- [GitHub](${SOCIAL.github})`,
    ...(live(SOCIAL.linkedin) ? [`- [LinkedIn](${SOCIAL.linkedin})`] : []),
    `- E-mail: ${SOCIAL.email}`,
    ''
  ];
  return lines.join('\n');
}

function fullSection(m: Messages, lang: 'en' | 'pt-BR'): string[] {
  const c = m.classic;
  const facts = ['role', 'city', 'education', 'focus', 'languages'].map((k) => `- ${c.facts[k].dt}: ${c.facts[k].dd}`);
  return [
    `## ${lang === 'en' ? 'English' : 'Português'}`,
    '',
    m.faq.items.who.a,
    '',
    `### ${c.facts.label}`,
    '',
    `- Name: ${FULL_NAME}`,
    ...facts,
    `- E-mail: ${SOCIAL.email}`,
    '',
    `### ${c.projects.titleB}`,
    '',
    ...projects.flatMap((p) => {
      const it = m.projects.items[p.key];
      const L = m.projects.labels;
      return [
        `#### ${it.title} (${c.projects.kinds[p.key]})`,
        '',
        it.summary,
        '',
        `- ${L.problem}: ${it.problem}`,
        `- ${L.solution}: ${it.solution}`,
        `- ${L.impact}: ${it.impact}`,
        `- ${L.stack}: ${p.stack.join(', ')}`,
        ...projectLinks(p).map((u) => `- ${u}`),
        ''
      ];
    }),
    `### ${m.skills.othersTitle}`,
    '',
    ...otherProjects.map((o) => `- ${m.skills.others[o.key]} (${o.url})`),
    '',
    `### ${c.skills.title}`,
    '',
    '| Area | Technologies |',
    '| --- | --- |',
    ...SKILL_CLUSTER_IDS.map((id) => `| ${m.skills.clusters[id]} | ${SKILL_CLUSTERS[id].join(', ')} |`),
    '',
    `### ${c.faq.title}`,
    '',
    ...FAQ_KEYS.flatMap((k) => [`**${m.faq.items[k].q}**`, '', m.faq.items[k].a, '']),
    `### ${c.about.title}`,
    '',
    m.about.p1,
    '',
    c.about.p2,
    ''
  ];
}

/** llms-full.txt: every fact on the site, both languages. */
export function llmsFullTxt(en: Messages, pt: Messages, updated: string): string {
  return [`# ${FULL_NAME}`, '', `Last updated: ${updated}. Source: ${absoluteUrl('/')}`, '', ...fullSection(en, 'en'), ...fullSection(pt, 'pt-BR')].join('\n');
}
