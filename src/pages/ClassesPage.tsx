import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import ClassDetail from '../components/ClassDetail'
import './ClassesPage.css'

const KIND_BADGE: Record<string, string> = {
  class: 'C',
  interface: 'I',
  enum: 'E',
  record: 'R',
  annotation: '@',
}

function ClassList() {
  const [query, setQuery] = useState('')
  const { id, classSummaries, areaTitles } = useCompendium()

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? classSummaries.filter(
          (c) => c.name.toLowerCase().includes(q) || c.fqcn.toLowerCase().includes(q) || c.summary.toLowerCase().includes(q),
        )
      : classSummaries
    const byArea = new Map<string, typeof filtered>()
    for (const c of filtered) {
      const list = byArea.get(c.area) ?? []
      list.push(c)
      byArea.set(c.area, list)
    }
    return byArea
  }, [query, classSummaries])

  return (
    <div className="classes-page">
      <header className="classes-header">
        <h1>Class Reference</h1>
        <p className="classes-lede">
          {classSummaries.length} essential JDK classes, curated — key methods, examples, and pitfalls, with links to the
          official Javadoc.
        </p>
        <input
          type="search"
          className="classes-search"
          placeholder="Filter classes… (e.g. HashMap, concurrent, stream)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Filter classes"
        />
      </header>

      {[...groups.entries()].map(([area, classes]) => (
        <section key={area} className="classes-group">
          <h2 className="eyebrow">{areaTitles[area] ?? area}</h2>
          <ul className="classes-grid">
            {classes.map((c) => (
              <li key={c.fqcn}>
                <Link to={`/${id}/classes/${c.fqcn}`} className="class-card">
                  <span className={`kind-badge kind-${c.kind}`} aria-label={c.kind}>
                    {KIND_BADGE[c.kind]}
                  </span>
                  <span className="class-card-body">
                    <span className="class-card-name">{c.name}</span>
                    <span className="class-card-pkg">{c.pkg}</span>
                    <span className="class-card-summary">{c.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.size === 0 && <p className="classes-empty">No classes match “{query}”.</p>}
    </div>
  )
}

export default function ClassesPage() {
  const { fqcn } = useParams()
  const { id, meta } = useCompendium()
  if (!meta.hasClasses) {
    return (
      <div className="classes-page">
        <header className="classes-header">
          <h1>Class Reference</h1>
          <p className="classes-lede">
            The {meta.label} compendium has no class reference — browse its <Link to={`/${id}/topics`}>topics</Link> instead.
          </p>
        </header>
      </div>
    )
  }
  if (fqcn) return <ClassDetail fqcn={fqcn} />
  return <ClassList />
}
