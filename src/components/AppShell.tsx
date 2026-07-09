import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import { compendiums } from '../data/compendiums'
import SearchPalette from './SearchPalette'
import ThemeToggle from './ThemeToggle'
import './AppShell.css'

function CompendiumSwitcher() {
  const { meta, setCompendium } = useCompendium()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div className="compendium-switcher" ref={rootRef}>
      <button
        type="button"
        className="brand"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="brand-java">{meta.label}</span>
        <span className="brand-sep">::</span>
        <span className="brand-name">Compendium</span>
        <svg
          className={`brand-chev ${open ? 'is-open' : ''}`}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="compendium-menu" role="listbox" aria-label="Choose a compendium">
          {compendiums.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                role="option"
                aria-selected={c.id === meta.id}
                className={`compendium-option ${c.id === meta.id ? 'is-active' : ''}`}
                onClick={() => {
                  setCompendium(c.id)
                  setOpen(false)
                }}
              >
                <span className="compendium-option-label">{c.label}</span>
                <span className="compendium-option-hero">{c.heroTitle}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { id, meta } = useCompendium()
  const { pathname } = useLocation()

  // BrowserRouter doesn't reset scroll on navigation (only the browser's own
  // back/forward restores it) — without this, routing to a new topic keeps
  // whatever scroll position the previous page was left at.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // index.html's static <title> only covers the initial load — keep the tab
  // title in sync with whichever compendium is actually selected.
  useEffect(() => {
    document.title = `${meta.label}::Compendium`
  }, [meta.label])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="shell">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="shell-header">
        <CompendiumSwitcher />
        <nav className="shell-nav" aria-label="Primary">
          <NavLink to={`/${id}/topics`}>Topics</NavLink>
          <NavLink to={`/${id}/graph`}>Graph</NavLink>
          {meta.hasClasses && <NavLink to={`/${id}/classes`}>Classes</NavLink>}
        </nav>
        <div className="shell-actions">
          <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
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
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
