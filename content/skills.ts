export type SkillClusterId = 'languages' | 'frameworks' | 'databases' | 'cloud' | 'ai' | 'methods';

export const SKILL_CLUSTER_IDS: SkillClusterId[] = ['languages', 'frameworks', 'databases', 'cloud', 'ai', 'methods'];

export const SKILL_CLUSTERS: Record<SkillClusterId, string[]> = {
  languages: ['TypeScript', 'JavaScript', 'Python', 'Ruby', 'Java', 'Kotlin'],
  frameworks: [
    'Node.js',
    'NestJS',
    'Fastify',
    'FastAPI',
    'Ruby on Rails',
    'Spring Boot',
    'React',
    'Vue.js',
    'Angular',
    'Vite',
    'Tailwind CSS',
    'React Native',
    'Expo',
    'Capacitor',
    'Flutter'
  ],
  databases: ['PostgreSQL', 'Supabase', 'MariaDB', 'MySQL', 'MongoDB', 'Redis'],
  cloud: ['AWS', 'Azure', 'Docker', 'CI/CD', 'GitHub Actions'],
  ai: ['Agentes de IA', 'IA generativa', 'LLMs', 'RAG', 'Embeddings', 'MCP', 'Pydantic AI', 'pgvector', 'REST APIs'],
  methods: ['Vitest', 'Playwright', 'pytest', 'RSpec', 'Git', 'GitHub', 'Scrum']
};

export const ALL_SKILLS: { name: string; cluster: SkillClusterId }[] = SKILL_CLUSTER_IDS.flatMap((cluster) =>
  SKILL_CLUSTERS[cluster].map((name) => ({ name, cluster }))
);

/** Skills used every day; underlined in the classic stack matrix. */
export const DAILY_SKILLS = new Set(['TypeScript', 'JavaScript', 'Python', 'React', 'React Native', 'Node.js', 'PostgreSQL', 'AWS', 'Agentes de IA', 'MCP', 'Git', 'GitHub']);

/** Cluster items with daily-use skills first (stable order otherwise). */
export function skillsDailyFirst(cluster: SkillClusterId): string[] {
  const items = SKILL_CLUSTERS[cluster];
  return [...[...DAILY_SKILLS].filter((s) => items.includes(s)), ...items.filter((s) => !DAILY_SKILLS.has(s))];
}
