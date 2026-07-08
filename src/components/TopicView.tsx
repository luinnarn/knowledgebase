import { lazy, Suspense, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Topic, ContentBlock, Domain } from '../types/content'
import { useCompendium } from '../lib/useCompendium'
import RichText from './RichText'
import CodeBlock from './CodeBlock'
import Callout from './Callout'
import CompareTable from './CompareTable'
import './TopicView.css'

// Mermaid is a heavy dependency (~100KB+ gzipped) — load it only on topics that use one.
const Diagram = lazy(() => import('./Diagram'))

function Block({ block }: { block: ContentBlock }) {
  switch (block.kind) {
    case 'paragraph':
      return (
        <p className="topic-para">
          <RichText text={block.text} />
        </p>
      )
    case 'subheading':
      return <h2 className="topic-subheading">{block.text}</h2>
    case 'code':
      return <CodeBlock code={block.code} title={block.title} caption={block.caption} />
    case 'pitfall':
      return <Callout variant="pitfall" title={block.title} text={block.text} code={block.code} />
    case 'bestPractice':
      return <Callout variant="bestPractice" title={block.title} text={block.text} code={block.code} />
    case 'note':
      return <Callout variant="note" title={block.title} text={block.text} />
    case 'table':
      return <CompareTable caption={block.caption} headers={block.headers} rows={block.rows} />
    case 'diagram':
      return (
        <Suspense fallback={<div className="diagram-loading" aria-busy="true" />}>
          <Diagram code={block.code} title={block.title} caption={block.caption} />
        </Suspense>
      )
  }
}

export default function TopicView({ topic }: { topic: Topic }) {
  const { domainById, domains, bookByKey } = useCompendium()
  const domain: Domain | undefined = domainById.get(topic.domainId)
  const spine = domain?.color ?? 'var(--accent)'
  const topicDomain = useMemo(
    () => new Map(domains.flatMap((d) => d.topicIds.map((t) => [t, d] as const))),
    [domains],
  )

  return (
    <article className="topic" style={{ '--domain': spine } as React.CSSProperties}>
      <header className="topic-header">
        <p className="eyebrow topic-eyebrow">{domain?.title}</p>
        <h1 className="topic-title">{topic.title}</h1>
        <div className="topic-summary" data-testid="topic-summary">
          <RichText text={topic.summary} />
        </div>
        <ul className="topic-keypoints">
          {topic.keyPoints.map((kp, i) => (
            <li key={i}>
              <RichText text={kp} />
            </li>
          ))}
        </ul>
      </header>

      <div className="topic-body">
        {topic.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>

      {topic.related.length > 0 && (
        <nav className="topic-related" aria-label="Related topics">
          <span className="eyebrow">Related</span>
          <div className="topic-related-chips">
            {topic.related.map((id) => {
              const d = topicDomain.get(id)
              if (!d) return null
              return (
                <Link key={id} to={`/topics/${d.id}/${id}`} className="chip">
                  <span className="dot" style={{ background: d.color }} />
                  {titleFromId(id)}
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      <footer className="topic-refs">
        <span className="eyebrow">Sources</span>
        <ul>
          {topic.refs.map((r, i) => {
            const book = bookByKey.get(r.book)
            return (
              <li key={i}>
                <cite>{book?.title ?? r.book}</cite> — {r.chapter}
              </li>
            )
          })}
        </ul>
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
