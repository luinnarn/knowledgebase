import { lazy, Suspense, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Topic, ContentBlock, KeyPoint, Domain } from '../types/content'
import { useCompendium } from '../lib/useCompendium'
import RichText from './RichText'
import CodeBlock from './CodeBlock'
import Callout from './Callout'
import CompareTable from './CompareTable'
import ExplainToggle from './ExplainToggle'
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
    case 'code': {
      const code = block.code ?? block.variants?.[0]?.code
      return code === undefined ? null : <CodeBlock code={code} title={block.title} caption={block.caption} />
    }
    case 'pitfall':
      return <Callout variant="pitfall" title={block.title} text={block.text} code={block.code} detail={block.detail} />
    case 'bestPractice':
      return <Callout variant="bestPractice" title={block.title} text={block.text} code={block.code} detail={block.detail} />
    case 'note':
      return <Callout variant="note" title={block.title} text={block.text} detail={block.detail} />
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

function KeyPointItem({ point }: { point: KeyPoint }) {
  const [open, setOpen] = useState(false)
  const text = typeof point === 'string' ? point : point.text
  const detail = typeof point === 'string' ? undefined : point.detail
  return (
    <li>
      <div className="keypoint-row">
        <span className="keypoint-text">
          <RichText text={text} />
        </span>
        {detail && <ExplainToggle expanded={open} onToggle={() => setOpen((o) => !o)} />}
      </div>
      {detail && open && (
        <div className="keypoint-detail">
          <RichText text={detail} />
        </div>
      )}
    </li>
  )
}

function SourceTitle({ title, url }: { title: string; url?: string }) {
  if (!url) return <cite>{title}</cite>
  return (
    <cite>
      <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
    </cite>
  )
}

export default function TopicView({ topic }: { topic: Topic }) {
  const { id: compendiumId, domainById, domains, bookByKey } = useCompendium()
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
            <KeyPointItem key={`${topic.id}-${i}`} point={kp} />
          ))}
        </ul>
      </header>

      <div className="topic-body">
        {topic.blocks.map((b, i) => (
          <Block key={`${topic.id}-${i}`} block={b} />
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
                <Link key={id} to={`/${compendiumId}/topics/${d.id}/${id}`} className="chip">
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
                <SourceTitle title={book?.title ?? r.book} url={book?.url} />
                {(book?.kind || book?.year) && (
                  <span className="topic-ref-meta">
                    {[book.kind, book.year].filter(Boolean).join(' · ')}
                  </span>
                )}
                {' — '}{r.chapter}
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
