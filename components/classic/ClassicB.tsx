import type { ClassicContent } from './content';
import Ext from './Ext';
import VersionLink from './VersionLink';
import { LangLinks } from './ClassicA';
import NavSpy from './NavSpy';

/** Design B, "Dossiê": fixed identity column on the left, oversized section titles on the right. Dark first. */
export default function ClassicB({ c }: { c: ClassicContent }) {
  const nav = [
    { id: 'projetos', n: '01', label: c.nav.projects, aside: String(c.projects.list.length).padStart(2, '0') },
    { id: 'sobre', n: '02', label: c.nav.about, aside: c.nav.aboutAside },
    { id: 'stack', n: '03', label: c.skills.title, aside: c.nav.skillsAside },
    { id: 'faq', n: '04', label: c.nav.faqB, aside: String(c.faq.items.length).padStart(2, '0') },
    { id: 'contato', n: '05', label: c.nav.contact, aside: c.nav.contactAside }
  ];

  return (
    <div className="cb" data-variant="b">
      <a className="skip" href="#conteudo">
        {c.labels.skip}
      </a>
      <div className="shell">
        <aside className="side">
          <div className="id">
            <div className="eyebrow mono">
              <span>{c.hero.role}</span>
              <span>{c.hero.city}</span>
            </div>
            <h1>
              {c.hero.line1}
              <br /> <span className="l2">{c.hero.line2}</span> <span className="l3">{c.hero.line3}</span>
            </h1>
            <p className="bio">{c.hero.intro}</p>
            <NavSpy label={c.nav.label} items={nav} />
            <div className="mobile-only">
              <a className="btn primary" href={c.links.cv} download>
                {c.hero.cv}
              </a>
              <a className="btn" href="#contato">
                {c.hero.contact}
              </a>
              <VersionLink className="btn" href={c.links.home3d} version="3d" title={c.nav.version3dTitle}>
                {c.nav.version3d}
              </VersionLink>
              <span className="lang mono" role="group" aria-label={c.labels.lang}>
                <LangLinks c={c} />
              </span>
            </div>
          </div>
          <div className="foot">
            <div className="row">
              <a className="btn primary" href={c.links.cv} download>
                {c.hero.cv}
              </a>
              {c.links.linkedin && (
                <Ext className="btn" href={c.links.linkedin}>
                  {c.hero.linkedin}
                </Ext>
              )}
              <Ext className="btn" href={c.links.github}>
                {c.hero.github}
              </Ext>
            </div>
            <div className="meta mono">
              <span className="lang" role="group" aria-label={c.labels.lang}>
                <LangLinks c={c} />
              </span>
              <span>
                <VersionLink href={c.links.home3d} version="3d" title={c.nav.version3dTitle}>
                  {c.nav.version3d}
                </VersionLink>
              </span>
              <span>victors.codes</span>
            </div>
          </div>
        </aside>

        <main className="main" id="conteudo">
          <section id="projetos" aria-labelledby="hb-projetos">
            <div className="sec">
              <h2 id="hb-projetos">
                <span className="n">01</span>
                {c.projects.titleB}
              </h2>
              <span className="aside">{c.projects.asideB}</span>
            </div>

            {c.projects.list.map((p, i) => (
              <div className="proj" key={p.key} data-project={p.key}>
                <details open={i === 0}>
                  <summary>
                    <div>
                      <div className="k">
                        <span className="idx">{p.index}</span>
                        <span className="kind">{p.kind}</span>
                      </div>
                      <h3>{p.title}</h3>
                      <p className="lead">{p.summary}</p>
                      <div className="stack">
                        {p.stack.map((s) => (
                          <span key={s}>{s}</span>
                        ))}
                      </div>
                    </div>
                    <span className="plus" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="body">
                    <div>
                      <h4>{c.labels.problem}</h4>
                      <p>{p.problem}</p>
                    </div>
                    <div>
                      <h4>{c.labels.solution}</h4>
                      <p>{p.solution}</p>
                    </div>
                    <div>
                      <h4>{c.labels.impact}</h4>
                      <p>{p.impact}</p>
                    </div>
                    {p.links.length > 0 && (
                      <div className="links">
                        {p.links.map((l) => (
                          <Ext key={l.href} href={l.href}>
                            {l.label}
                          </Ext>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            ))}

            <div className="others">
              <span className="mono">{c.projects.othersLabel}</span>
              {c.projects.others.map((o) => (
                <Ext key={o.href} href={o.href}>
                  {o.label}
                </Ext>
              ))}
            </div>
          </section>

          <section id="sobre" aria-labelledby="hb-sobre">
            <div className="sec">
              <h2 id="hb-sobre">
                <span className="n">02</span>
                {c.about.title}
              </h2>
              <span className="aside">{c.about.aside}</span>
            </div>
            <div className="about">
              <div>
                <p className="pull">
                  {c.about.pull.before}
                  <b>{c.about.pull.strong}</b>
                  {c.about.pull.after}
                </p>
                <ol className="tl">
                  {c.about.timeline.map((e) => (
                    <li key={e.key}>
                      <span className={`w${e.key === 'now' ? ' now' : ''}`}>{e.when}</span>
                      <div>
                        <b>{e.title}</b>
                        <span>{e.text}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="text">
                {c.about.paragraphs.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </div>
          </section>

          <section id="stack" aria-labelledby="hb-stack">
            <div className="sec">
              <h2 id="hb-stack">
                <span className="n">03</span>
                {c.skills.title}
              </h2>
              <span className="aside">{c.skills.aside}</span>
            </div>
            <div className="matrix">
              {c.skills.rows.map((r) => (
                <div className="row" key={r.id}>
                  <span className="cat">{r.label}</span>
                  <div className="items">
                    {r.items.map((s) => (
                      <span key={s.name} className={s.daily ? 'hi' : undefined}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="faq" aria-labelledby="hb-faq">
            <div className="sec">
              <h2 id="hb-faq">
                <span className="n">04</span>
                {c.faq.titleB}
              </h2>
              <span className="aside">{c.faq.aside}</span>
            </div>
            <div className="faq">
              {c.faq.items.map((f) => (
                <details key={f.key}>
                  <summary>
                    <h3>{f.q}</h3> <span aria-hidden="true">+</span>
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="contact" id="contato" aria-labelledby="hb-contato">
            <div className="mono">05 · {c.contact.label}</div>
            <h2 className="big" id="hb-contato">
              {c.contact.title1}
              <br /> {c.contact.title2} <span className="b">{c.contact.title3}</span>
            </h2>
            <a className="email" href={`mailto:${c.links.email}`}>
              {c.links.email}
            </a>
            <div className="row">
              <a className="btn primary" href={c.links.cv} download>
                {c.hero.cv}
              </a>
              {c.links.linkedin && (
                <Ext className="btn" href={c.links.linkedin}>
                  {c.hero.linkedin}
                </Ext>
              )}
              <Ext className="btn" href={c.links.github}>
                {c.hero.github}
              </Ext>
            </div>
            <footer className="pagefoot mono">
              <span>{c.footer.rights}</span>
              <span>{c.footer.privacy}</span>
              <time dateTime={c.updated}>{c.footer.updated}</time>
            </footer>
          </section>
        </main>
      </div>
    </div>
  );
}
