import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type MiniSearch from 'minisearch'
import { getSearchIndex, type SearchDoc } from '../lib/searchIndex'
import './SearchPalette.css'

interface Result {
  id: string
  type: 'topic' | 'class'
  title: string
  subtitle: string
  route: string
}

export default function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [active, setActive] = useState(0)
  const [index, setIndex] = useState<MiniSearch<SearchDoc> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      getSearchIndex().then(setIndex)
      setQuery('')
      setResults([])
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    if (!index || !query.trim()) {
      setResults([])
      setActive(0)
      return
    }
    const hits = index.search(query).slice(0, 12) as unknown as Result[]
    setResults(hits)
    setActive(0)
  }, [query, index])

  if (!open) return null

  const go = (r: Result) => {
    onClose()
    navigate(r.route)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      go(results[active])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const topics = results.filter((r) => r.type === 'topic')
  const classes = results.filter((r) => r.type === 'class')

  return (
    <div className="palette-overlay" onClick={onClose}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Search topics and classes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Search query"
        />
        {query.trim() && (
          <div className="palette-results" role="listbox">
            {results.length === 0 && <p className="palette-empty">{index ? 'No matches.' : 'Indexing…'}</p>}
            {topics.length > 0 && <p className="palette-group">Topics</p>}
            {topics.map((r) => (
              <ResultRow key={r.id} r={r} active={results[active]?.id === r.id} onSelect={go} />
            ))}
            {classes.length > 0 && <p className="palette-group">Classes</p>}
            {classes.map((r) => (
              <ResultRow key={r.id} r={r} active={results[active]?.id === r.id} onSelect={go} />
            ))}
          </div>
        )}
        <div className="palette-hints" aria-hidden>
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}

function ResultRow({ r, active, onSelect }: { r: Result; active: boolean; onSelect: (r: Result) => void }) {
  return (
    <button
      className={`palette-result ${active ? 'is-active' : ''}`}
      role="option"
      aria-selected={active}
      onClick={() => onSelect(r)}
    >
      <span className={`palette-badge palette-badge--${r.type}`}>{r.type === 'topic' ? 'T' : 'C'}</span>
      <span className="palette-result-title">{r.title}</span>
      <span className="palette-result-sub">{r.subtitle}</span>
    </button>
  )
}
