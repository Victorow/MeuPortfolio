export type ProjectKey = 'auth' | 'analytics' | 'ai';

export type Project = {
  key: ProjectKey;
  index: string;
  stack: string[];
  links: {
    live?: string;
    repo?: string;
    caseStudy?: string;
  };
};

export const projects: Project[] = [
  {
    key: 'auth',
    index: '01',
    stack: ['TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Kafka', 'Terraform'],
    links: { caseStudy: '#', repo: '#' }
  },
  {
    key: 'analytics',
    index: '02',
    stack: ['Go', 'ClickHouse', 'Kafka', 'Next.js', 'gRPC', 'Kubernetes'],
    links: { caseStudy: '#', live: '#' }
  },
  {
    key: 'ai',
    index: '03',
    stack: ['Python', 'FastAPI', 'LangGraph', 'Postgres', 'Next.js', 'AWS'],
    links: { caseStudy: '#', repo: '#' }
  }
];

export const expertiseKeys = [
  'backend',
  'frontend',
  'apis',
  'auth',
  'db',
  'cloud',
  'automation',
  'ai',
  'performance',
  'security'
] as const;

export type ExpertiseKey = (typeof expertiseKeys)[number];
