export type SkillClusterId = 'languages' | 'frameworks' | 'databases' | 'cloud' | 'ai' | 'methods';

export const SKILL_CLUSTER_IDS: SkillClusterId[] = ['languages', 'frameworks', 'databases', 'cloud', 'ai', 'methods'];

export const SKILL_CLUSTERS: Record<SkillClusterId, string[]> = {
  languages: ['Java', 'Kotlin', 'Python', 'JavaScript', 'TypeScript'],
  frameworks: ['Spring Boot', 'NestJS', 'React', 'React Native', 'Capacitor', 'Angular', 'Flutter', 'Node.js'],
  databases: ['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Supabase'],
  cloud: ['AWS', 'Azure', 'VPS', 'Docker', 'CI/CD', 'GitHub Actions', 'Linux', 'Redes', 'Cibersegurança'],
  ai: ['MCP', 'REST APIs', 'Web Scraping', 'IA generativa'],
  methods: ['Scrum', 'Jira', 'Git', 'GitHub', 'Postman']
};

export const ALL_SKILLS: { name: string; cluster: SkillClusterId }[] = SKILL_CLUSTER_IDS.flatMap((cluster) =>
  SKILL_CLUSTERS[cluster].map((name) => ({ name, cluster }))
);
