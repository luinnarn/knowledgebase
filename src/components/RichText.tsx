import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { domains } from '../data/domains'

const topicDomain = new Map(domains.flatMap((d) => d.topicIds.map((t) => [t, d.id] as const)))

/** Renders mini-markdown: **bold**, *italic*, `code`, [[topic-id]] and [[topic-id|label]] links. */
export default function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`|\[\[[a-z0-9-]+(?:\|[^\]]+)?\]\])/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
          return <em key={i}>{part.slice(1, -1)}</em>
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
          return (
            <code key={i} className="inline-code">
              {part.slice(1, -1)}
            </code>
          )
        }
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const inner = part.slice(2, -2)
          const [id, label] = inner.split('|')
          const domainId = topicDomain.get(id)
          const display = label ?? titleFromId(id)
          if (!domainId) return <Fragment key={i}>{display}</Fragment>
          return (
            <Link key={i} to={`/topics/${domainId}/${id}`} className="topic-link">
              {display}
            </Link>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </>
  )
}

function titleFromId(id: string): ReactNode {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
