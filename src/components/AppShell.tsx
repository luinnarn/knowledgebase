import { NavLink, Outlet } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'
import './AppShell.css'

function ThemeToggle() {
  const [theme, toggle] = useTheme()
  return (
    <button className="shell-icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      {theme === 'dark' ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  )
}

export default function AppShell({ onOpenSearch }: { onOpenSearch?: () => void }) {
  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="shell-header">
        <NavLink to="/" className="brand">
          <span className="brand-java">Java</span>
          <span className="brand-sep">::</span>
          <span className="brand-name">Compendium</span>
        </NavLink>
        <nav className="shell-nav" aria-label="Primary">
          <NavLink to="/topics">Topics</NavLink>
          <NavLink to="/graph">Graph</NavLink>
          <NavLink to="/classes">Classes</NavLink>
        </nav>
        <div className="shell-actions">
          <button className="search-btn" onClick={onOpenSearch} aria-label="Search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="search-hint">Search</span>
            <kbd>⌘K</kbd>
          </button>
          <ThemeToggle />
        </div>
      </header>
      <main id="main" className="shell-main">
        <Outlet />
      </main>
    </div>
  )
}
