'use client';

import type { ReactNode } from 'react';
import { writeVersionPref, type SiteVersion } from '@/lib/version';

/** Plain <a> (full navigation, works without JS) that remembers the chosen version on click. */
export default function VersionLink({
  href,
  version,
  className,
  title,
  children
}: {
  href: string;
  version: SiteVersion;
  className?: string;
  title?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className} title={title} data-version-link={version} onClick={() => writeVersionPref(version === 'classic' ? 'classic' : null)}>
      {children}
    </a>
  );
}
