import { useMemo, useState } from 'react'
import { NavLink, useParams } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import './Sidebar.css'

export default function Sidebar() {
  const { domainId } = useParams()
  const { domains, graphNodes } = useCompendium()
  const labelById = useMemo(
    () => new Map(graphNodes.filter((n) => n.kind === 'topic').map((n) => [n.id, n.label])),
    [graphNodes],
  )
  const [open, setOpen] = useState<Record<string, boolean>>(() => (domainId ? { [domainId]: true } : {}))

  // Keep the active domain expanded when navigating directly.
  if (domainId && open[domainId] === undefined) {
    setOpen((o) => ({ ...o, [domainId]: true }))
  }

  return (
    <nav className="sidebar" aria-label="Topics">
      <ul className="sidebar-domains">
        {domains.map((d) => {
          const expanded = !!open[d.id]
          return (
            <li key={d.id}>
              <button
                className="sidebar-domain"
                aria-expanded={expanded}
                onClick={() => setOpen((o) => ({ ...o, [d.id]: !expanded }))}
              >
                <span className="dot" style={{ background: d.color }} />
                <span className="sidebar-domain-title">{d.title}</span>
                <svg
                  className={`sidebar-chev ${expanded ? 'is-open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
              {expanded && (
                <ul className="sidebar-topics" style={{ '--domain': d.color } as React.CSSProperties}>
                  {d.topicIds.map((tid) => (
                    <li key={tid}>
                      <NavLink to={`/topics/${d.id}/${tid}`}>{labelById.get(tid) ?? tid}</NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
