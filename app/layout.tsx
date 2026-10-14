import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Victor Augusto Ferreira dos Santos · FullStack Developer',
  description: 'Victor Augusto Ferreira dos Santos, full-stack developer in São José dos Campos, Brazil.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
