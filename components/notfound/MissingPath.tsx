'use client';

import { useEffect, useState } from 'react';

/** Shows the requested path once on the client (the 404 HTML is shared by every missing URL). Rendered as text, never HTML. */
export default function MissingPath({ template, fallback }: { template: string; fallback: string }) {
  const [path, setPath] = useState<string | null>(null);
  useEffect(() => {
    const p = window.location.pathname;
    setPath(p.length > 80 ? `${p.slice(0, 77)}...` : p);
  }, []);
  return <>{path ? template.replace('{path}', path) : fallback}</>;
}
