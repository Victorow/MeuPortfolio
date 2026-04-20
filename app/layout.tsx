import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Victor — FullStack Developer',
  description: 'Engineering systems at stellar scale.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
