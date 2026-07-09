import { Link } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import './HomePage.css'

export default function HomePage() {
  const { id, meta, domains, graphNodes, graphEdges, classSummaries, books } = useCompendium()
  const topicCount = domains.reduce((n, d) => n + d.topicIds.length, 0)

  return (
    <div className="home">
      <section className="home-hero">
        <p className="eyebrow">A knowledge base distilled from {books.length} books</p>
        <h1 className="home-title">{meta.heroTitle}</h1>
        <p className="home-lede">{meta.heroLede}</p>
        <div className="home-actions">
          <Link to={`/${id}/topics`} className="home-cta primary">
            Browse topics
          </Link>
          <Link to={`/${id}/graph`} className="home-cta">
            Explore the graph
          </Link>
          <span className="home-hint">
            or press <kbd>⌘K</kbd> to search
          </span>
        </div>
        <dl className="home-stats">
          <div>
            <dt>Domains</dt>
            <dd>{domains.length}</dd>
          </div>
          <div>
            <dt>Topics</dt>
            <dd>{topicCount}</dd>
          </div>
          {meta.hasClasses && (
            <div>
              <dt>Classes</dt>
              <dd>{classSummaries.length}</dd>
            </div>
          )}
          <div>
            <dt>Graph edges</dt>
            <dd>{graphEdges.length}</dd>
          </div>
        </dl>
      </section>

      <section className="home-domains" aria-label="Domains">
        <div className="home-domains-grid">
          {domains.map((d) => (
            <Link
              key={d.id}
              to={`/${id}/topics/${d.id}`}
              className="home-domain"
              style={{ '--domain': d.color } as React.CSSProperties}
            >
              <span className="home-domain-spine" aria-hidden />
              <span className="home-domain-body">
                <span className="home-domain-title">{d.title}</span>
                <span className="home-domain-blurb">{d.blurb}</span>
                <span className="home-domain-meta">
                  {d.topicIds.length} topics ·{' '}
                  {graphNodes.filter((n) => n.domainId === d.id && n.importance === 3 && n.kind === 'topic').length}{' '}
                  cornerstone
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-sources">
        <h2 className="eyebrow">Distilled from</h2>
        <ul>
          {books.map((b) => (
            <li key={b.key}>
              <cite>{b.title}</cite>
              <span>{b.authors}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
