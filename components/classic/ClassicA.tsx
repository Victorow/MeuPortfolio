import type { ClassicContent } from './content';
import Ext from './Ext';
import VersionLink from './VersionLink';

/** Design A, "Papel": printed editorial. White paper, black ink, one electric blue, 12-column hairline grid. */
export default function ClassicA({ c }: { c: ClassicContent }) {
  return (
    <div className="ca" data-variant="a">
      <a className="skip" href="#conteudo">
        {c.labels.skip}
      </a>
      <div className="page">
        <header className="top">
          <a className="brand" href="#top">
            Victor Augusto<i>.</i>
          </a>
          <nav aria-label={c.nav.label}>
            <a href="#projetos">{c.nav.projects}</a>
            <a href="#sobre">{c.nav.about}</a>
            <a href="#skills">{c.nav.skills}</a>
            <a href="#faq">{c.nav.faq}</a>
            <a href="#contato">{c.nav.contact}</a>
            <VersionLink className="sw" href={c.links.home3d} version="3d" title={c.nav.version3dTitle}>
              {c.nav.version3d}
            </VersionLink>
            <span className="lang" role="group" aria-label={c.labels.lang}>
              <LangLinks c={c} />
            </span>
          </nav>
        </header>

        <main id="conteudo">
          <section className="hero" id="top">
            <div>
              <div className="eyebrow mono">
                <span>{c.hero.role}</span>
                <span>{c.hero.city}</span>
              </div>
              <h1>
                {c.hero.line1}
                <br /> {c.hero.line2}
                <br /> <span className="line2">{c.hero.line3}</span>
              </h1>
              <p className="intro">{c.hero.intro}</p>
              <div className="cta">
                <a className="btn primary" href={c.links.cv} download>
                  {c.hero.cv}
                </a>
                <a className="btn" href="#contato">
                  {c.hero.contact}
                </a>
                <Ext className="btn" href={c.links.github}>
                  {c.hero.github}
                </Ext>
              </div>
            </div>
            <aside className="facts" aria-label={c.facts.label}>
              <div className="mono label">{c.facts.label}</div>
              <dl>
                {c.facts.rows.map((r) => (
                  <Row key={r.dt} dt={r.dt} dd={r.dd} />
                ))}
                <dt>{c.facts.updated.dt}</dt>
                <dd>
                  <time dateTime={c.updated}>{c.facts.updated.dd}</time>
                </dd>
              </dl>
            </aside>
          </section>

          <section id="projetos" aria-labelledby="h-projetos">
            <div className="sec-head">
              <span className="num">01</span>
              <h2 id="h-projetos">{c.projects.title}</h2>
              <span className="aside">{c.projects.aside}</span>
            </div>
            <ol className="ledger">
              {c.projects.list.map((p, i) => (
                <li key={p.key} data-project={p.key}>
                  <details open={i === 0}>
                    <summary>
                      <span className="idx">{p.index}</span>
                      <div className="name">
                        <h3>{p.title}</h3>
                        <small>{p.kind}</small>
                      </div>
                      <span className="desc">{p.summary}</span>
                      <span className="meta">
                        {p.ledger}{' '}
                        <span className="plus" aria-hidden="true">
                          +
                        </span>
                      </span>
                    </summary>
                    <div className="body">
                      <div />
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
                      <div className="stack">
                        {p.stack.map((s) => (
                          <span key={s} className="tag">
                            {s}
                          </span>
                        ))}
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
                </li>
              ))}
            </ol>
            <p className="mono others">
              {c.projects.othersLabel}
              {c.projects.others.map((o) => (
                <span key={o.href}>
                  {' · '}
                  <Ext href={o.href}>{o.label}</Ext>
                </span>
              ))}
            </p>
          </section>

          <section id="sobre" aria-labelledby="h-sobre">
            <div className="sec-head">
              <span className="num">02</span>
              <h2 id="h-sobre">{c.about.title}</h2>
              <span className="aside">{c.about.aside}</span>
            </div>
            <div className="about">
              <div>
                <p className="pull">
                  {c.about.pull.before}
                  <b>{c.about.pull.strong}</b>
                  {c.about.pull.after}
                </p>
                <ol className="timeline">
                  {c.about.timeline.map((e) => (
                    <li key={e.key}>
                      <span className={`when${e.key === 'now' ? ' now' : ''}`}>{e.when}</span>
                      <span className="what">
                        <b>{e.title}</b>
                        <span>{e.text}</span>
                      </span>
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

          <section id="skills" aria-labelledby="h-skills">
            <div className="sec-head">
              <span className="num">03</span>
              <h2 id="h-skills">{c.skills.title}</h2>
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

          <section id="faq" aria-labelledby="h-faq">
            <div className="sec-head">
              <span className="num">04</span>
              <h2 id="h-faq">{c.faq.title}</h2>
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

          <section className="contact" id="contato" aria-labelledby="h-contato">
            <div className="inner">
              <div>
                <div className="mono">05 · {c.contact.label}</div>
                <h2 id="h-contato">
                  {c.contact.title1}
                  <br /> {c.contact.title2} {c.contact.title3}
                </h2>
                <a className="email" href={`mailto:${c.links.email}`}>
                  {c.links.email}
                </a>
              </div>
              <div className="side">
                <a href={c.links.cv} download>
                  {c.hero.cv}
                </a>
                {c.links.linkedin && <Ext href={c.links.linkedin}>{c.hero.linkedin}</Ext>}
                <Ext href={c.links.github}>{c.hero.github}</Ext>
              </div>
            </div>
          </section>
        </main>

        <footer className="foot">
          <span>{c.footer.rights}</span>
          <span>{c.footer.privacy}</span>
          <time dateTime={c.updated}>{c.footer.updated}</time>
          <span>victors.codes</span>
        </footer>
      </div>
    </div>
  );
}

function Row({ dt, dd }: { dt: string; dd: string }) {
  return (
    <>
      <dt>{dt}</dt>
      <dd>{dd}</dd>
    </>
  );
}

export function LangLinks({ c }: { c: ClassicContent }) {
  const isPt = c.locale !== 'en';
  return (
    <>
      <a href={isPt ? c.links.self : c.links.other} hrefLang="pt-BR" lang="pt-BR" aria-current={isPt ? 'true' : undefined}>
        PT
      </a>
      <span aria-hidden="true"> / </span>
      <a href={isPt ? c.links.other : c.links.self} hrefLang="en" lang="en" aria-current={!isPt ? 'true' : undefined}>
        EN
      </a>
    </>
  );
}
