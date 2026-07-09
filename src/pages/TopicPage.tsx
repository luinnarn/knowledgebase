import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import { useTopics } from '../lib/useTopics'
import Sidebar from '../components/Sidebar'
import TopicView from '../components/TopicView'
import NotFound from '../components/NotFound'
import './TopicPage.css'

function TopicsIndex() {
  const { id, domains } = useCompendium()
  const flatCount = domains.reduce((n, d) => n + d.topicIds.length, 0)
  return (
    <div className="topics-index">
      <h1>Topics</h1>
      <p className="topics-index-lede">
        {domains.length} domains, {flatCount} topics — distilled from curated books. Pick a domain to start.
      </p>
      <div className="topics-index-grid">
        {domains.map((d) => (
          <Link key={d.id} to={`/${id}/topics/${d.id}`} className="domain-card" style={{ '--domain': d.color } as React.CSSProperties}>
            <h2>{d.title}</h2>
            <p>{d.blurb}</p>
            <span className="domain-card-count">{d.topicIds.length} topics</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DomainLanding({ domainId }: { domainId: string }) {
  const { id, domainById, graphNodes } = useCompendium()
  const labelById = useMemo(
    () => new Map(graphNodes.filter((n) => n.kind === 'topic').map((n) => [n.id, n.label])),
    [graphNodes],
  )
  const domain = domainById.get(domainId)
  if (!domain) return <NotFound homeHref={`/${id}/topics`} homeLabel="topic index" />
  return (
    <div className="topics-index">
      <p className="eyebrow" style={{ color: domain.color }}>
        Domain
      </p>
      <h1>{domain.title}</h1>
      <p className="topics-index-lede">{domain.blurb}</p>
      <ol className="domain-topic-list" style={{ '--domain': domain.color } as React.CSSProperties}>
        {domain.topicIds.map((tid) => (
          <li key={tid}>
            <Link to={`/${id}/topics/${domainId}/${tid}`}>{labelById.get(tid) ?? tid}</Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

function PrevNext({ domainId, topicId }: { domainId: string; topicId: string }) {
  const { id, domains, graphNodes } = useCompendium()
  const labelById = useMemo(
    () => new Map(graphNodes.filter((n) => n.kind === 'topic').map((n) => [n.id, n.label])),
    [graphNodes],
  )
  const flatOrder = useMemo<Array<[string, string]>>(
    () => domains.flatMap((d) => d.topicIds.map((t) => [d.id, t] as [string, string])),
    [domains],
  )
  const idx = flatOrder.findIndex(([d, t]) => d === domainId && t === topicId)
  const prev = idx > 0 ? flatOrder[idx - 1] : undefined
  const next = idx >= 0 && idx < flatOrder.length - 1 ? flatOrder[idx + 1] : undefined
  return (
    <nav className="prevnext" aria-label="Topic pagination">
      {prev ? (
        <Link to={`/${id}/topics/${prev[0]}/${prev[1]}`} className="prevnext-link prev">
          <span className="eyebrow">‹ Previous</span>
          <span>{labelById.get(prev[1])}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/${id}/topics/${next[0]}/${next[1]}`} className="prevnext-link next">
          <span className="eyebrow">Next ›</span>
          <span>{labelById.get(next[1])}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}

function TopicContent({ domainId, topicId }: { domainId: string; topicId: string }) {
  const { id: compendiumId, domainById, topicLoaders, graphNodes } = useCompendium()
  const state = useTopics(compendiumId, topicLoaders, domainId)
  const domain = domainById.get(domainId)
  if (!domain || !domain.topicIds.includes(topicId)) return <NotFound homeHref={`/${compendiumId}/topics`} homeLabel="topic index" />

  if (state.status === 'loading') {
    return <div className="topic-loading" aria-busy="true" />
  }
  if (state.status === 'unavailable') {
    const label = graphNodes.find((n) => n.id === topicId)?.label ?? topicId
    return (
      <div className="topics-index">
        <p className="eyebrow" style={{ color: domain.color }}>
          {domain.title}
        </p>
        <h1>{label}</h1>
        <p className="topics-index-lede">This topic's content is being authored — check back shortly.</p>
      </div>
    )
  }
  const topic = state.topics.find((t) => t.id === topicId)
  if (!topic) return <NotFound homeHref={`/${compendiumId}/topics`} homeLabel="topic index" />
  return (
    <>
      <TopicView topic={topic} />
      <PrevNext domainId={domainId} topicId={topicId} />
    </>
  )
}

export default function TopicPage() {
  const { domainId, topicId } = useParams()
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Close the drawer on navigation.
  useEffect(() => {
    setDrawerOpen(false)
  }, [domainId, topicId])

  return (
    <div className="topics-layout">
      <div className={`sidebar-holder ${drawerOpen ? 'is-open' : ''}`}>
        <Sidebar />
      </div>
      {drawerOpen && <button className="sidebar-backdrop" aria-label="Close topic navigation" onClick={() => setDrawerOpen(false)} />}
      <div className="topics-content">
        {!domainId ? (
          <TopicsIndex />
        ) : !topicId ? (
          <DomainLanding domainId={domainId} />
        ) : (
          <TopicContent domainId={domainId} topicId={topicId} />
        )}
      </div>
      <button className="topics-layout-toggle" onClick={() => setDrawerOpen((o) => !o)} aria-expanded={drawerOpen}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
        Topics
      </button>
    </div>
  )
}
