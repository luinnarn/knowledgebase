import './ExplainToggle.css'

export default function ExplainToggle({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="explain-toggle" onClick={onToggle} aria-expanded={expanded}>
      {expanded ? 'Show less' : 'Explain more'}
      <svg
        className={`explain-chev ${expanded ? 'is-open' : ''}`}
        width="9"
        height="9"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}
