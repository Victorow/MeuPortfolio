'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; n: string; label: string; aside: string };

/** Design B section index; highlights the section in view. Plain anchors without JS. */
export default function NavSpy({ label, items }: { label: string; items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) if (en.isIntersecting) setActive(en.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      <ol className="nav">
        {items.map((it) => (
          <li key={it.id}>
            <a className={active === it.id ? 'on' : undefined} href={`#${it.id}`} aria-current={active === it.id ? 'location' : undefined}>
              <span className="n">{it.n}</span>
              {it.label}
              <span className="c">{it.aside}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
