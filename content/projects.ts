import type { PlanetId } from './planets';

export type ProjectKey = 'oppyconnect' | 'linkbiz' | 'duo' | 'telegram' | 'vscode';
export type ProjectPlanet = Extract<PlanetId, 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'venus'>;

export type Project = {
  key: ProjectKey;
  index: string;
  planet: ProjectPlanet;
  kind: 'professional' | 'oss';
  stack: string[];
  /** Two-item stack summary for the classic ledger row. */
  ledger: string[];
  /** Shown in compact summaries (60 seconds mode). */
  featured?: boolean;
  /** schema.org type used in JSON-LD. */
  schemaType: 'SoftwareSourceCode' | 'CreativeWork';
  links: {
    repo?: string;
    live?: string;
    /** App Store */
    store?: string;
    /** Google Play */
    playStore?: string;
    marketplace?: string;
  };
};

/** Links marked TODO-VICTOR are hidden in the UI until replaced. */
export const TODO = 'TODO-VICTOR';

export const projects: Project[] = [
  {
    key: 'oppyconnect',
    index: '01',
    planet: 'mars',
    kind: 'professional',
    stack: ['React Native', 'Capacitor', 'Node.js', 'PostgreSQL', 'AWS'],
    ledger: ['React Native', 'AWS'],
    featured: true,
    schemaType: 'CreativeWork',
    links: {
      store: 'https://apps.apple.com/ec/app/oppyconnect/id6767213224',
      playStore: 'https://play.google.com/store/apps/details?id=com.linkbiz.oppyconnect'
    }
  },
  {
    key: 'linkbiz',
    index: '02',
    planet: 'jupiter',
    kind: 'professional',
    stack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    ledger: ['React', 'Node.js'],
    schemaType: 'CreativeWork',
    links: { live: 'https://linkbiz.ai' }
  },
  {
    key: 'duo',
    index: '03',
    planet: 'saturn',
    kind: 'oss',
    stack: ['TypeScript', 'MCP', 'Node.js', 'Tailscale'],
    ledger: ['TypeScript', 'MCP'],
    featured: true,
    schemaType: 'SoftwareSourceCode',
    links: { repo: 'https://github.com/Victorow/A2A-and-cache-semantic-for-claude' }
  },
  {
    key: 'telegram',
    index: '04',
    planet: 'uranus',
    kind: 'oss',
    stack: ['Node.js', 'Rust', 'Telegram Bot API'],
    ledger: ['Node.js', 'Rust'],
    featured: true,
    schemaType: 'SoftwareSourceCode',
    links: { repo: 'https://github.com/Victorow/claude-telegram-bridge' }
  },
  {
    key: 'vscode',
    index: '05',
    planet: 'venus',
    kind: 'oss',
    stack: ['TypeScript', 'VS Code API'],
    ledger: ['TypeScript'],
    schemaType: 'SoftwareSourceCode',
    links: { marketplace: TODO }
  }
];

export const projectByPlanet = (planet: ProjectPlanet) => projects.find((p) => p.planet === planet)!;

export type OtherProjectKey = 'mcpDevflow' | 'focuspt' | 'radar';
export const otherProjects: { key: OtherProjectKey; url: string }[] = [
  { key: 'mcpDevflow', url: 'https://github.com/Victorow/mcp-devflow' },
  { key: 'focuspt', url: 'https://alexandre-site-ten.vercel.app' },
  { key: 'radar', url: 'https://github.com/Victorow/radar-de-vagas' }
];

export const SOCIAL = {
  email: 'victoroow@gmail.com',
  github: 'https://github.com/Victorow',
  linkedin: 'https://www.linkedin.com/in/victoraugustoferreiradossantos',
  cv: '/cv/Victor-Augusto-Ferreira-dos-Santos.pdf'
};
