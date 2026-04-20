import type { IconType } from 'react-icons';
import {
  SiTypescript,
  SiNodedotjs,
  SiPostgresql,
  SiRedis,
  SiApachekafka,
  SiTerraform,
  SiGo,
  SiClickhouse,
  SiNextdotjs,
  SiKubernetes,
  SiPython,
  SiFastapi,
  SiAmazon,
  SiReact,
  SiTailwindcss,
  SiFramer,
  SiThreedotjs
} from 'react-icons/si';
import { TbApi, TbAtom } from 'react-icons/tb';

const MAP: Record<string, IconType> = {
  TypeScript: SiTypescript,
  'Node.js': SiNodedotjs,
  PostgreSQL: SiPostgresql,
  Postgres: SiPostgresql,
  Redis: SiRedis,
  Kafka: SiApachekafka,
  Terraform: SiTerraform,
  Go: SiGo,
  ClickHouse: SiClickhouse,
  'Next.js': SiNextdotjs,
  gRPC: TbApi,
  Kubernetes: SiKubernetes,
  Python: SiPython,
  FastAPI: SiFastapi,
  LangGraph: TbAtom,
  AWS: SiAmazon,
  React: SiReact,
  'Tailwind CSS': SiTailwindcss,
  'Framer Motion': SiFramer,
  'Three.js': SiThreedotjs
};

export function getTechIcon(name: string): IconType | null {
  return MAP[name] ?? null;
}
