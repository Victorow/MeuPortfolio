import type { ReactNode } from 'react';

/** External link: new tab, never leaks the opener or the referrer. */
export default function Ext({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
