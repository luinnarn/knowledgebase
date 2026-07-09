import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { JavaClass } from '../types/content'
import { useCompendium } from '../lib/useCompendium'
import CodeBlock from './CodeBlock'
import Callout from './Callout'
import './ClassDetail.css'

const cache = new Map<string, JavaClass[]>()

export default function ClassDetail({ fqcn }: { fqcn: string }) {
  const { id: compendiumId, domains, classLoaders, classSummaries } = useCompendium()
  const topicDomain = useMemo(
    () => new Map(domains.flatMap((d) => d.topicIds.map((t) => [t, d.id] as const))),
    [domains],
  )
  const summaryByFqcn = useMemo(() => new Map(classSummaries.map((s) => [s.fqcn, s])), [classSummaries])
  const meta = summaryByFqcn.get(fqcn)
  const cacheKey = meta ? `${compendiumId}:${meta.area}` : ''
  const [cls, setCls] = useState<JavaClass | null>(() => cache.get(cacheKey)?.find((c) => c.fqcn === fqcn) ?? null)

  useEffect(() => {
    if (!meta) return
    let cancelled = false
    const hit = cache.get(cacheKey)
    if (hit) {
      setCls(hit.find((c) => c.fqcn === fqcn) ?? null)
      return
    }
    classLoaders[meta.area]?.().then(({ classes }) => {
      cache.set(cacheKey, classes)
      if (!cancelled) setCls(classes.find((c) => c.fqcn === fqcn) ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [fqcn, meta, cacheKey, classLoaders])

  if (!meta) {
    return (
      <div className="classdetail">
        <h1>Unknown class</h1>
        <p>
          No entry for <code className="inline-code">{fqcn}</code>. Browse the <Link to={`/${compendiumId}/classes`}>class reference</Link>.
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
                    <Link key={r} to={`/${compendiumId}/topics/${d}/${id}`} className="chip">
                      {titleFromId(id)}
                    </Link>
                  )
                }
                const rel = summaryByFqcn.get(r)
                if (!rel) return null
                return (
                  <Link key={r} to={`/${compendiumId}/classes/${r}`} className="chip">
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

/** Pre-warms the module cache for a compendium+area so the next ClassDetail render for a class
 *  in that area starts with real data synchronously, instead of the loading placeholder (which
 *  only resolves via a useEffect — useful for SSR, where effects never run during the single
 *  render pass). */
export async function preloadClassArea(
  compendiumId: string,
  area: string,
  classLoaders: Record<string, () => Promise<{ classes: JavaClass[] }>>,
): Promise<JavaClass[] | undefined> {
  const key = `${compendiumId}:${area}`
  const hit = cache.get(key)
  if (hit) return hit
  const loader = classLoaders[area]
  if (!loader) return undefined
  const { classes } = await loader()
  cache.set(key, classes)
  return classes
}

/** Synchronously seeds the cache from already-known data (e.g. a serialized SSR preload payload
 *  read on the client), skipping the async loader entirely — used to make the client's first
 *  render match prerendered HTML instead of starting from an empty cache. */
export function seedClassAreaCache(compendiumId: string, area: string, classes: JavaClass[]): void {
  cache.set(`${compendiumId}:${area}`, classes)
}
