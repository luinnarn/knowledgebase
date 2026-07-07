import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { domains, domainById } from '../data/domains'
import { graphNodes } from '../data/graph'
import { useTopics } from '../lib/useTopics'
import Sidebar from '../components/Sidebar'
import TopicView from '../components/TopicView'
import './TopicPage.css'

const labelById = new Map(graphNodes.filter((n) => n.kind === 'topic').map((n) => [n.id, n.label]))

/** Flat ordered list of [domainId, topicId] across all domains, for prev/next. */
const flatOrder: Array<[string, string]> = domains.flatMap((d) => d.topicIds.map((t) => [d.id, t] as [string, string]))

function TopicsIndex() {
  return (
    <div className="topics-index">
      <h1>Topics</h1>
      <p className="topics-index-lede">
        Twelve domains, {flatOrder.length} topics — distilled from eight books. Pick a domain to start.
      </p>
      <div className="topics-index-grid">
        {domains.map((d) => (
          <Link key={d.id} to={`/topics/${d.id}`} className="domain-card" style={{ '--domain': d.color } as React.CSSProperties}>
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
  const domain = domainById.get(domainId)
  if (!domain) return <NotFound />
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
            <Link to={`/topics/${domainId}/${tid}`}>{labelById.get(tid) ?? tid}</Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

function NotFound() {
  return (
    <div className="topics-index">
      <h1>Not found</h1>
      <p className="topics-index-lede">
        That page doesn't exist. Browse the <Link to="/topics">topic index</Link> instead.
      </p>
    </div>
  )
}

function PrevNext({ domainId, topicId }: { domainId: string; topicId: string }) {
  const idx = flatOrder.findIndex(([d, t]) => d === domainId && t === topicId)
  const prev = idx > 0 ? flatOrder[idx - 1] : undefined
  const next = idx >= 0 && idx < flatOrder.length - 1 ? flatOrder[idx + 1] : undefined
  return (
    <nav className="prevnext" aria-label="Topic pagination">
      {prev ? (
        <Link to={`/topics/${prev[0]}/${prev[1]}`} className="prevnext-link prev">
          <span className="eyebrow">‹ Previous</span>
          <span>{labelById.get(prev[1])}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/topics/${next[0]}/${next[1]}`} className="prevnext-link next">
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
  const state = useTopics(domainId)
  const domain = domainById.get(domainId)
  if (!domain || !domain.topicIds.includes(topicId)) return <NotFound />

  if (state.status === 'loading') {
    return <div className="topic-loading" aria-busy="true" />
  }
  if (state.status === 'unavailable') {
    return (
      <div className="topics-index">
        <p className="eyebrow" style={{ color: domain.color }}>
          {domain.title}
        </p>
        <h1>{labelById.get(topicId)}</h1>
        <p className="topics-index-lede">This topic's content is being authored — check back shortly.</p>
      </div>
    )
  }
  const topic = state.topics.find((t) => t.id === topicId)
  if (!topic) return <NotFound />
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
