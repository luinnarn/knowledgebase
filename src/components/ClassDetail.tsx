import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { JavaClass } from '../types/content'
import { classLoaders, classSummaries } from '../data/classes/index'
import { domains } from '../data/domains'
import CodeBlock from './CodeBlock'
import Callout from './Callout'
import './ClassDetail.css'

const topicDomain = new Map(domains.flatMap((d) => d.topicIds.map((t) => [t, d.id] as const)))
const summaryByFqcn = new Map(classSummaries.map((s) => [s.fqcn, s]))

const cache = new Map<string, JavaClass[]>()

export default function ClassDetail({ fqcn }: { fqcn: string }) {
  const meta = summaryByFqcn.get(fqcn)
  const [cls, setCls] = useState<JavaClass | null>(() => cache.get(meta?.area ?? '')?.find((c) => c.fqcn === fqcn) ?? null)

  useEffect(() => {
    if (!meta) return
    let cancelled = false
    const hit = cache.get(meta.area)
    if (hit) {
      setCls(hit.find((c) => c.fqcn === fqcn) ?? null)
      return
    }
    classLoaders[meta.area]?.().then(({ classes }) => {
      cache.set(meta.area, classes)
      if (!cancelled) setCls(classes.find((c) => c.fqcn === fqcn) ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [fqcn, meta])

  if (!meta) {
    return (
      <div className="classdetail">
        <h1>Unknown class</h1>
        <p>
          No entry for <code className="inline-code">{fqcn}</code>. Browse the <Link to="/classes">class reference</Link>.
        </p>
      </div>
    )
  }
  if (!cls) return <div className="classdetail" aria-busy="true" />

  return (
    <article className="classdetail">
      <header>
        <p className="eyebrow">
          {cls.pkg} · {cls.module} · since Java {cls.since}
        </p>
        <h1 className="classdetail-name">{cls.name}</h1>
        <CodeBlock code={cls.declaration} title="declaration" />
        <p className="classdetail-summary">{cls.summary}</p>
      </header>

      {cls.points.length > 0 && (
        <ul className="classdetail-points">
          {cls.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      )}

      {cls.methods.length > 0 && (
        <section>
          <h2>Key methods</h2>
          <div className="method-table-wrap">
            <table className="method-table">
              <tbody>
                {cls.methods.map((m, i) => (
                  <tr key={i}>
                    <td>
                      <code>{m.signature}</code>
                    </td>
                    <td>{m.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {cls.example && (
        <section>
          <h2>Example</h2>
          <CodeBlock code={cls.example.code} caption={cls.example.caption} />
        </section>
      )}

      {cls.pitfalls.map((p, i) => (
        <Callout key={i} variant="pitfall" title="Pitfall" text={p} />
      ))}

      <footer className="classdetail-footer">
        {cls.related.length > 0 && (
          <div className="classdetail-related">
            <span className="eyebrow">Related</span>
            <div className="classdetail-chips">
              {cls.related.map((r) => {
                if (r.startsWith('topic:')) {
                  const id = r.slice(6)
                  const d = topicDomain.get(id)
                  if (!d) return null
                  return (
                    <Link key={r} to={`/topics/${d}/${id}`} className="chip">
                      {titleFromId(id)}
                    </Link>
                  )
                }
                const rel = summaryByFqcn.get(r)
                if (!rel) return null
                return (
                  <Link key={r} to={`/classes/${r}`} className="chip">
                    {rel.name}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
        <a className="classdetail-javadoc" href={cls.javadocUrl} target="_blank" rel="noreferrer">
          Official Javadoc ↗
        </a>
      </footer>
    </article>
  )
}

function titleFromId(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
