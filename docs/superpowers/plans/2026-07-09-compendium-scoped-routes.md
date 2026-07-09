# Compendium-Scoped Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the active compendium (Java / CS / System Design) into the URL as a path segment (`/java/...`, `/cs/...`, `/system-design/...`) so every generated link is self-describing, replacing the current scheme where the compendium is inferred from `localStorage`.

**Architecture:** `App.tsx` gains a new top-level route tree: bare `/` renders a standalone `CompendiumPicker` page; `/:compendiumId/*` wraps the existing `AppShell`/`CompendiumProvider`/pages (`CompendiumProvider` now reads the id from `useParams()` instead of `localStorage`); five literal legacy routes (`topics`, `topics/*`, `graph`, `classes`, `classes/*`) redirect pre-migration unprefixed URLs into the URL-prefixed scheme instead of 404ing. Every internal `Link`/`NavLink`/`navigate()` call site gains a `` `/${compendiumId}` `` prefix.

**Tech Stack:** React 19 / TypeScript / Vite; react-router-dom v6 (`BrowserRouter`, declarative `<Routes>`/`<Route>`); Vitest + React Testing Library + `@testing-library/user-event`.

## Global Constraints

- No change to the content model, `compendiums.ts` metadata shape, or `src/data/integrity.test.ts`.
- `npm test` and `npm run build` must both be green after every task — no task may leave the app in a broken or partially-working state.
- Every commit is scoped to the files that task touched (`git add <files>`, not `git add -A`).
- Match existing code style exactly: no semicolons, single quotes, existing indentation (2 spaces).
- `localStorage`'s `jkb-compendium` key (exported as `STORAGE_KEY` from `src/lib/useCompendium.ts`) becomes a write-only convenience signal — nothing may read it to decide what content loads (only `LegacyRedirect` reads it, to choose a redirect target for old links).

---

### Task 1: Extract `ThemeToggle` into its own component

**Files:**
- Create: `src/components/ThemeToggle.tsx`
- Create: `src/components/ThemeToggle.css`
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/AppShell.css`

**Interfaces:**
- Consumes: `useTheme()` from `src/lib/useTheme.ts` (unchanged, existing hook).
- Produces: `export default function ThemeToggle()` — a zero-prop component, importable from `./ThemeToggle`. Task 3 imports it into `CompendiumPicker.tsx`.

This is a pure extraction — no behavior changes. `App.test.tsx`'s existing `'theme toggle flips the document theme'` test is the regression check; no new test is needed for this task.

- [ ] **Step 1: Create `src/components/ThemeToggle.tsx`**

```tsx
import { useTheme } from '../lib/useTheme'
import './ThemeToggle.css'

export default function ThemeToggle() {
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
```

- [ ] **Step 2: Create `src/components/ThemeToggle.css`**

```css
.shell-icon-btn {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  color: var(--ink-2);
  transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
}

.shell-icon-btn:hover {
  color: var(--ink);
  background: var(--bg-sunken);
}
```

- [ ] **Step 3: Remove `.shell-icon-btn` rules from `src/components/AppShell.css`**

Delete these lines from `src/components/AppShell.css` (currently around line 161):

```css
.shell-icon-btn {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-sm);
  color: var(--ink-2);
  transition: color var(--dur) var(--ease), background var(--dur) var(--ease);
}

.shell-icon-btn:hover {
  color: var(--ink);
  background: var(--bg-sunken);
}
```

- [ ] **Step 4: Update `src/components/AppShell.tsx` to use the extracted component**

Replace:
```tsx
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/useTheme'
import { useCompendium } from '../lib/useCompendium'
import { compendiums } from '../data/compendiums'
import SearchPalette from './SearchPalette'
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
```

With:
```tsx
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import { compendiums } from '../data/compendiums'
import SearchPalette from './SearchPalette'
import ThemeToggle from './ThemeToggle'
import './AppShell.css'
```

(The rest of `AppShell.tsx` — `CompendiumSwitcher`, `AppShell` — is unchanged in this task.)

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: all existing tests still pass (11 test files), including `App.test.tsx`'s theme-toggle test.

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: `tsc -b` clean, Vite build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/ThemeToggle.tsx src/components/ThemeToggle.css src/components/AppShell.tsx src/components/AppShell.css
git commit -m "refactor: extract ThemeToggle into its own component"
```

---

### Task 2: Extract a shared `NotFound` component

**Files:**
- Create: `src/components/NotFound.tsx`
- Create: `src/components/NotFound.css`
- Modify: `src/pages/TopicPage.tsx`
- Modify: `src/pages/TopicPage.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `export default function NotFound({ homeHref = '/', homeLabel = 'home' }: { homeHref?: string; homeLabel?: string })`. Task 3 uses it (with default props) in `App.tsx`'s catch-all route and in `CompendiumProvider.tsx`'s invalid-id branch. Task 4 updates its three call sites in this file to pass compendium-prefixed `homeHref` values.

`TopicPage.tsx` currently defines a local, unexported `NotFound` function used in three places, always linking to `/topics`. This task extracts it as a reusable component with configurable link target/label, but does **not** change routing — behavior stays pixel-identical (still literal `/topics`, `topic index`), since the route restructure hasn't happened yet (that's Task 3). Prefixing `homeHref` to the active compendium happens in Task 4, alongside every other internal link.

- [ ] **Step 1: Create `src/components/NotFound.tsx`**

```tsx
import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound({ homeHref = '/', homeLabel = 'home' }: { homeHref?: string; homeLabel?: string }) {
  return (
    <div className="not-found">
      <h1>Not found</h1>
      <p className="not-found-lede">
        That page doesn't exist. Browse the <Link to={homeHref}>{homeLabel}</Link> instead.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/NotFound.css`**

```css
.not-found {
  max-width: 56rem;
  margin: 0 auto;
  padding: var(--sp-7) var(--sp-5) var(--sp-8);
}

.not-found h1 {
  font-size: var(--fs-hero);
  margin-bottom: var(--sp-3);
}

.not-found-lede {
  color: var(--ink-2);
  max-width: 55ch;
}
```

- [ ] **Step 3: Write a failing test for the domain-not-found case**

`TopicPage.test.tsx` currently tests the "unknown topic" NotFound path but not the "unknown domain" one. Add this test using the file's existing local `renderAt` helper (unchanged in this task):

Add to `src/pages/TopicPage.test.tsx`, after the existing `'unknown topic shows not found'` test:
```tsx
test('unknown domain shows not found', () => {
  renderAt('/topics/bogus-domain')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})
```

- [ ] **Step 4: Run the test to verify it currently passes (it should — NotFound already exists locally)**

Run: `npx vitest run src/pages/TopicPage.test.tsx`
Expected: PASS (6/6) — this step just confirms the new test is well-formed before you touch `TopicPage.tsx`'s implementation in the next step.

- [ ] **Step 5: Update `src/pages/TopicPage.tsx` to use the shared component**

Add the import near the top (after the `useTopics` import):
```tsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCompendium } from '../lib/useCompendium'
import { useTopics } from '../lib/useTopics'
import Sidebar from '../components/Sidebar'
import TopicView from '../components/TopicView'
import NotFound from '../components/NotFound'
import './TopicPage.css'
```

Remove the local `NotFound` function entirely:
```tsx
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
```

In `DomainLanding`, replace:
```tsx
  const domain = domainById.get(domainId)
  if (!domain) return <NotFound />
```
With:
```tsx
  const domain = domainById.get(domainId)
  if (!domain) return <NotFound homeHref="/topics" homeLabel="topic index" />
```

In `TopicContent`, replace both:
```tsx
  if (!domain || !domain.topicIds.includes(topicId)) return <NotFound />
```
With:
```tsx
  if (!domain || !domain.topicIds.includes(topicId)) return <NotFound homeHref="/topics" homeLabel="topic index" />
```

And:
```tsx
  const topic = state.topics.find((t) => t.id === topicId)
  if (!topic) return <NotFound />
```
With:
```tsx
  const topic = state.topics.find((t) => t.id === topicId)
  if (!topic) return <NotFound homeHref="/topics" homeLabel="topic index" />
```

- [ ] **Step 6: Run the tests again to confirm they pass**

Run: `npx vitest run src/pages/TopicPage.test.tsx`
Expected: PASS (6/6), including the new `'unknown domain shows not found'` test.

- [ ] **Step 7: Run the full suite and build**

Run: `npm test`
Expected: all test files pass.

Run: `npm run build`
Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add src/components/NotFound.tsx src/components/NotFound.css src/pages/TopicPage.tsx src/pages/TopicPage.test.tsx
git commit -m "refactor: extract shared NotFound component"
```

---

### Task 3: Compendium-scoped routing skeleton

**Files:**
- Create: `src/pages/CompendiumPicker.tsx`
- Create: `src/pages/CompendiumPicker.css`
- Create: `src/pages/CompendiumPicker.test.tsx`
- Create: `src/test-utils.tsx`
- Modify: `src/lib/CompendiumProvider.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/pages/TopicPage.test.tsx`
- Modify: `src/pages/ClassesPage.test.tsx`
- Modify: `src/components/SearchPalette.test.tsx`
- Modify: `src/components/AppShell.test.tsx`
- Modify: `src/components/TopicView.test.tsx`
- Modify: `src/components/GraphView.test.tsx`

**Interfaces:**
- Consumes: `NotFound` (Task 2), `ThemeToggle` (Task 1), `STORAGE_KEY`/`useCompendium` (existing), `compendiumById`/`DEFAULT_COMPENDIUM`/`compendiums` (existing, `src/data/compendiums.ts`).
- Produces: `CompendiumProvider` now requires a `:compendiumId` route param ancestor to resolve (no longer reads `localStorage` to decide the active id). `renderApp(path: string)` and `renderWithCompendium(ui, opts?)` exported from `src/test-utils.tsx` — Task 4 doesn't add new exports here, but continues using both.

**Deliberate scope boundary:** every internal `Link`/`NavLink` in the app (`AppShell`'s nav, `Sidebar`, `HomePage`, `TopicPage`, `GraphView`, `ClassDetail`, `ClassesPage`, `RichText`) still points at the old unprefixed paths (`/topics`, `/graph`, `/classes/...`) after this task. That's intentional — the five new legacy-redirect routes bounce those straight back to `/${lastKnownOrDefaultCompendium}${path}`, so the app stays fully functional (just with one extra redirect hop on every internal navigation) with zero changes to the 10 files Task 4 will touch. This lets the routing skeleton itself land as one reviewable, fully-tested task before the separate mechanical prefix sweep.

- [ ] **Step 1: Create `src/test-utils.tsx`**

```tsx
import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import CompendiumProvider from './lib/CompendiumProvider'

/** Renders the real App at a given path — for integration-style tests that exercise routing,
 *  lazy content loading, and navigation end to end. */
export function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

/** Renders a single component inside a working CompendiumProvider, for tests that don't need
 *  the rest of the app's routing (e.g. a component rendered in isolation with a fixture). Mirrors
 *  App.tsx's real `:compendiumId` route nesting so useCompendium() resolves correctly. */
export function renderWithCompendium(ui: ReactElement, { compendiumId = 'java' }: { compendiumId?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[`/${compendiumId}`]}>
      <Routes>
        <Route path=":compendiumId" element={<CompendiumProvider>{ui}</CompendiumProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}
```

- [ ] **Step 2: Rewrite `src/lib/CompendiumProvider.tsx` to read the id from the URL**

Replace the entire file with:
```tsx
import { useEffect, useMemo, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { compendiumById } from '../data/compendiums'
import { compendiumRegistry } from '../data/registry'
import { CompendiumContext, STORAGE_KEY, type CompendiumValue } from './useCompendium'
import NotFound from '../components/NotFound'

export default function CompendiumProvider({ children }: { children: ReactNode }) {
  const { compendiumId } = useParams()
  const navigate = useNavigate()
  const valid = !!compendiumId && compendiumById.has(compendiumId)

  // Keep localStorage in sync with whichever compendium is actually being viewed, so the
  // picker page's "continue" affordance reflects real usage — it drives no redirects itself.
  useEffect(() => {
    if (valid) localStorage.setItem(STORAGE_KEY, compendiumId!)
  }, [valid, compendiumId])

  const value = useMemo<CompendiumValue | null>(() => {
    if (!valid) return null
    const setCompendium = (next: string) => {
      if (next === compendiumId || !compendiumById.has(next)) return
      navigate(`/${next}`)
    }
    return { id: compendiumId!, meta: compendiumById.get(compendiumId!)!, ...compendiumRegistry[compendiumId!], setCompendium }
  }, [valid, compendiumId, navigate])

  if (!value) return <NotFound />

  return <CompendiumContext.Provider value={value}>{children}</CompendiumContext.Provider>
}
```

- [ ] **Step 3: Create `src/pages/CompendiumPicker.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { compendiums } from '../data/compendiums'
import { STORAGE_KEY } from '../lib/useCompendium'
import ThemeToggle from '../components/ThemeToggle'
import './CompendiumPicker.css'

export default function CompendiumPicker() {
  const lastUsed = localStorage.getItem(STORAGE_KEY)

  return (
    <div className="picker">
      <header className="picker-header">
        <span className="picker-brand">Compendium</span>
        <ThemeToggle />
      </header>
      <main className="picker-main">
        <h1 className="picker-title">Choose a compendium</h1>
        <div className="picker-grid">
          {compendiums.map((c) => (
            <Link key={c.id} to={`/${c.id}`} className={`picker-card ${c.id === lastUsed ? 'is-last-used' : ''}`}>
              <span className="picker-card-label">{c.label}</span>
              <span className="picker-card-hero">{c.heroTitle}</span>
              <span className="picker-card-lede">{c.heroLede}</span>
              {c.id === lastUsed && <span className="picker-card-continue">Continue</span>}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/pages/CompendiumPicker.css`**

```css
.picker {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-4) var(--sp-5);
  border-bottom: 1px solid var(--line);
}

.picker-brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-md);
}

.picker-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sp-7) var(--sp-5);
  gap: var(--sp-6);
}

.picker-title {
  font-size: var(--fs-hero);
  text-align: center;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--sp-4);
  max-width: 60rem;
  width: 100%;
}

.picker-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  padding: var(--sp-5);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg-raised);
  color: inherit;
  transition: border-color var(--dur) var(--ease), transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}

.picker-card:hover {
  text-decoration: none;
  transform: translateY(-2px);
  border-color: var(--accent);
  box-shadow: var(--shadow);
}

.picker-card.is-last-used {
  border-color: var(--accent);
}

.picker-card-label {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-3);
}

.picker-card-hero {
  font-family: var(--font-display);
  font-size: var(--fs-lg);
  font-weight: 600;
}

.picker-card-lede {
  font-size: var(--fs-sm);
  color: var(--ink-2);
}

.picker-card-continue {
  align-self: flex-start;
  margin-top: var(--sp-2);
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--accent);
  color: var(--accent-ink);
  font-size: var(--fs-xs);
  font-weight: 600;
}
```

- [ ] **Step 5: Write `src/pages/CompendiumPicker.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CompendiumPicker from './CompendiumPicker'

function renderPicker() {
  return render(
    <MemoryRouter>
      <CompendiumPicker />
    </MemoryRouter>,
  )
}

test('links to every compendium', () => {
  renderPicker()
  expect(screen.getByRole('link', { name: /^Java/ })).toHaveAttribute('href', '/java')
  expect(screen.getByRole('link', { name: /^CS/ })).toHaveAttribute('href', '/cs')
  expect(screen.getByRole('link', { name: /^SysDesign/ })).toHaveAttribute('href', '/system-design')
})

test('marks the last-used compendium from localStorage', () => {
  localStorage.setItem('jkb-compendium', 'cs')
  renderPicker()
  expect(screen.getByRole('link', { name: /^CS/ })).toHaveClass('is-last-used')
  localStorage.removeItem('jkb-compendium')
})

test('does not mark any card when nothing is stored', () => {
  localStorage.removeItem('jkb-compendium')
  renderPicker()
  expect(screen.getByRole('link', { name: /^Java/ })).not.toHaveClass('is-last-used')
  expect(screen.getByRole('link', { name: /^CS/ })).not.toHaveClass('is-last-used')
  expect(screen.getByRole('link', { name: /^SysDesign/ })).not.toHaveClass('is-last-used')
})
```

- [ ] **Step 6: Run the picker test**

Run: `npx vitest run src/pages/CompendiumPicker.test.tsx`
Expected: PASS (3/3).

- [ ] **Step 7: Rewrite `src/App.tsx`**

Replace the entire file with:
```tsx
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import CompendiumProvider from './lib/CompendiumProvider'
import AppShell from './components/AppShell'
import NotFound from './components/NotFound'
import CompendiumPicker from './pages/CompendiumPicker'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'
import GraphPage from './pages/GraphPage'
import ClassesPage from './pages/ClassesPage'
import { compendiumById, DEFAULT_COMPENDIUM } from './data/compendiums'
import { STORAGE_KEY } from './lib/useCompendium'

/** Redirects a pre-migration unprefixed URL (e.g. /topics/x) into the compendium-scoped
 *  equivalent, using the last-known compendium from localStorage (defaulting to Java). */
function LegacyRedirect() {
  const location = useLocation()
  const stored = localStorage.getItem(STORAGE_KEY)
  const target = stored && compendiumById.has(stored) ? stored : DEFAULT_COMPENDIUM
  return <Navigate to={`/${target}${location.pathname}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route index element={<CompendiumPicker />} />

      {/* Legacy unprefixed URLs from before compendium-scoped routing — redirect, don't 404. */}
      <Route path="topics" element={<LegacyRedirect />} />
      <Route path="topics/*" element={<LegacyRedirect />} />
      <Route path="graph" element={<LegacyRedirect />} />
      <Route path="classes" element={<LegacyRedirect />} />
      <Route path="classes/*" element={<LegacyRedirect />} />

      <Route
        path=":compendiumId"
        element={
          <CompendiumProvider>
            <AppShell />
          </CompendiumProvider>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="topics/:domainId?/:topicId?" element={<TopicPage />} />
        <Route path="graph" element={<GraphPage />} />
        <Route path="classes/:fqcn?" element={<ClassesPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

- [ ] **Step 8: Rewrite `src/App.test.tsx`**

Replace the entire file with:
```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './test-utils'

beforeEach(() => {
  localStorage.clear()
})

test('bare root shows the compendium picker', () => {
  renderApp('/')
  expect(screen.getByRole('heading', { name: /choose a compendium/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /^Java/ })).toHaveAttribute('href', '/java')
})

test('renders the shell with brand and primary nav', () => {
  renderApp('/java')
  expect(screen.getByText('Compendium')).toBeInTheDocument()
  const nav = screen.getByRole('navigation', { name: /primary/i })
  expect(nav).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Topics' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Graph' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Classes' })).toBeInTheDocument()
})

test('navigates between sections', async () => {
  const user = userEvent.setup()
  renderApp('/java')
  await user.click(screen.getByRole('link', { name: 'Graph' }))
  expect(screen.getByRole('heading', { name: /knowledge graph/i })).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Classes' }))
  expect(screen.getByRole('heading', { name: /class reference/i })).toBeInTheDocument()
})

test('theme toggle flips the document theme', async () => {
  const user = userEvent.setup()
  renderApp('/java')
  const initial = document.documentElement.dataset.theme
  await user.click(screen.getByRole('button', { name: /switch to/i }))
  expect(document.documentElement.dataset.theme).not.toBe(initial)
})

test('invalid compendium segment shows not found', () => {
  renderApp('/bogus')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})

test('unmatched multi-segment path shows not found', () => {
  renderApp('/foo/bar/baz')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})

test('legacy unprefixed link redirects into the default compendium', async () => {
  renderApp('/topics/generics/type-erasure')
  expect(await screen.findByRole('heading', { name: /type erasure/i, level: 1 })).toBeInTheDocument()
})
```

- [ ] **Step 9: Update `src/pages/TopicPage.test.tsx`**

Replace the entire file with:
```tsx
import { screen } from '@testing-library/react'
import { renderApp } from '../test-utils'

test('topics index lists all twelve domains', () => {
  renderApp('/java/topics')
  expect(screen.getByRole('heading', { name: 'Topics', level: 1 })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /language fundamentals/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /concurrency/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /jvm internals/i })).toBeInTheDocument()
})

test('domain landing lists its topics', () => {
  renderApp('/java/topics/generics')
  expect(screen.getByRole('heading', { name: 'Generics', level: 1 })).toBeInTheDocument()
  // Appears in both the sidebar (auto-expanded active domain) and the landing list.
  expect(screen.getAllByRole('link', { name: 'Wildcards & PECS' }).length).toBeGreaterThanOrEqual(2)
})

test('sidebar shows domain tree', () => {
  renderApp('/java/topics')
  const nav = screen.getByRole('navigation', { name: 'Topics' })
  expect(nav).toBeInTheDocument()
})

test('authored topic loads via its lazy chunk and renders the full view', async () => {
  renderApp('/java/topics/generics/type-erasure')
  expect(await screen.findByRole('heading', { name: /type erasure/i, level: 1 })).toBeInTheDocument()
  expect(screen.getByTestId('topic-summary')).toHaveTextContent(/compile-time construct/i)
  expect(screen.getByText('Sources')).toBeInTheDocument()
})

test('unknown topic shows not found', () => {
  renderApp('/java/topics/generics/nope')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})

test('unknown domain shows not found', () => {
  renderApp('/java/topics/bogus-domain')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})
```

- [ ] **Step 10: Update `src/pages/ClassesPage.test.tsx`**

Replace the entire file with:
```tsx
import { screen, fireEvent } from '@testing-library/react'
import { renderApp } from '../test-utils'
import { classSummaries } from '../data/classes/index'

test('class list shows every curated class and filters', () => {
  renderApp('/java/classes')
  expect(screen.getByRole('heading', { name: /class reference/i })).toBeInTheDocument()
  expect(screen.getAllByRole('link').length).toBeGreaterThan(classSummaries.length)
  fireEvent.change(screen.getByRole('searchbox', { name: /filter classes/i }), { target: { value: 'ConcurrentHash' } })
  expect(screen.getByText('ConcurrentHashMap')).toBeInTheDocument()
  expect(screen.queryByText('LocalDate')).not.toBeInTheDocument()
})

test('class detail loads lazily with methods and javadoc link', async () => {
  renderApp('/java/classes/java.util.HashMap')
  expect(await screen.findByRole('heading', { name: 'HashMap', level: 1 })).toBeInTheDocument()
  expect(screen.getByText(/key methods/i)).toBeInTheDocument()
  const javadoc = screen.getByRole('link', { name: /official javadoc/i })
  expect(javadoc).toHaveAttribute('href', expect.stringContaining('docs.oracle.com'))
})
```

- [ ] **Step 11: Update `src/components/SearchPalette.test.tsx`**

Replace the entire file with:
```tsx
import { screen, fireEvent } from '@testing-library/react'
import { getSearchIndex } from '../lib/searchIndex'
import { compendiumRegistry } from '../data/registry'
import { renderApp } from '../test-utils'

test('index finds topics and classes for a known query', async () => {
  const index = await getSearchIndex('java', compendiumRegistry.java)
  const hits = index.search('erasure')
  expect(hits.some((h) => String(h.id) === 'topic:type-erasure')).toBe(true)
  const classHits = index.search('ConcurrentHashMap')
  expect(classHits.some((h) => String(h.id) === 'class:java.util.concurrent.ConcurrentHashMap')).toBe(true)
})

test('palette opens from header button, searches, and navigates on Enter', async () => {
  renderApp('/java')
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  const input = await screen.findByRole('textbox', { name: /search query/i })
  fireEvent.change(input, { target: { value: 'volatile' } })
  const options = await screen.findAllByRole('option')
  expect(options.length).toBeGreaterThan(0)
  fireEvent.keyDown(input, { key: 'Enter' })
  // Palette closes and navigation occurred (a topic page heading is now present).
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
```

- [ ] **Step 12: Rewrite `src/components/AppShell.test.tsx`**

Replace the entire file with:
```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test-utils'

test('scrolls to top when navigating to a different route', async () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const user = userEvent.setup()
  renderApp('/java/topics/generics/type-erasure')
  expect(await screen.findByRole('heading', { name: /type erasure/i, level: 1 })).toBeInTheDocument()

  scrollTo.mockClear()
  await user.click(screen.getByRole('link', { name: 'Graph' }))

  expect(await screen.findByRole('heading', { name: /knowledge graph/i })).toBeInTheDocument()
  expect(scrollTo).toHaveBeenCalled()
})

test('sets the document title to the active compendium, not a fixed string', () => {
  renderApp('/cs')
  expect(document.title).toBe('CS::Compendium')
})
```

- [ ] **Step 13: Update `src/components/TopicView.test.tsx`'s render helper only**

Replace the top of the file (imports and `renderTopic`) — this is the only change in this step, the fixture and all test bodies (including the two href assertions) stay exactly as they are:

```tsx
import { screen, fireEvent, within } from '@testing-library/react'
import TopicView from './TopicView'
import { renderWithCompendium } from '../test-utils'
import type { Topic } from '../types/content'
```

And:
```tsx
function renderTopic() {
  return renderWithCompendium(<TopicView topic={fixture} />)
}
```

- [ ] **Step 14: Update `src/components/GraphView.test.tsx`'s render helper only**

Replace the top of the file — again, only the render setup changes; the three test bodies (including the href assertion) stay exactly as they are:

```tsx
import { screen, fireEvent, within } from '@testing-library/react'
import GraphView from './GraphView'
import { renderWithCompendium } from '../test-utils'
import { graphNodes } from '../data/graph'

function renderGraph() {
  return renderWithCompendium(<GraphView />)
}
```

- [ ] **Step 15: Run the full test suite**

Run: `npm test`
Expected: all test files pass. If `TopicView.test.tsx` or `GraphView.test.tsx` fail, check that their href assertions are still `/topics/...` (unprefixed) — they must be unchanged in this task; Task 4 updates them.

- [ ] **Step 16: Build**

Run: `npm run build`
Expected: `tsc -b` clean, Vite build succeeds.

- [ ] **Step 17: Commit**

```bash
git add src/test-utils.tsx src/lib/CompendiumProvider.tsx src/App.tsx src/App.test.tsx \
  src/pages/CompendiumPicker.tsx src/pages/CompendiumPicker.css src/pages/CompendiumPicker.test.tsx \
  src/pages/TopicPage.test.tsx src/pages/ClassesPage.test.tsx src/components/SearchPalette.test.tsx \
  src/components/AppShell.test.tsx src/components/TopicView.test.tsx src/components/GraphView.test.tsx
git commit -m "feat: add compendium-scoped routing skeleton (picker, legacy redirects, URL-driven provider)"
```

---

### Task 4: Prefix every internal link with the active compendium

**Files:**
- Modify: `src/components/AppShell.tsx`
- Modify: `src/components/RichText.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/GraphView.tsx`
- Modify: `src/components/TopicView.tsx`
- Modify: `src/components/ClassDetail.tsx`
- Modify: `src/components/TopicView.test.tsx`
- Modify: `src/components/GraphView.test.tsx`
- Modify: `src/pages/ClassesPage.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/TopicPage.tsx`
- Modify: `src/lib/searchIndex.ts`

**Interfaces:**
- Consumes: `useCompendium().id` (existing field, already returned by `CompendiumValue`).
- Produces: nothing consumed by later tasks — this is the last content-changing task; Task 5 is verification only.

Purely mechanical: every `Link`/`NavLink`/route-string in these files gains a `` `/${id}` `` (or `/${compendiumId}`, matching whatever the file already calls it) prefix. Every file already has `useCompendium()` in scope. Where a local variable is already named `id` for something else (a `.map((id) => ...)` callback, a `Map` key), the compendium id is destructured as `compendiumId` instead to avoid shadowing — noted per file below.

- [ ] **Step 1: `src/components/AppShell.tsx`**

Replace:
```tsx
export default function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { meta } = useCompendium()
  const { pathname } = useLocation()
```
With:
```tsx
export default function AppShell() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { id, meta } = useCompendium()
  const { pathname } = useLocation()
```

Replace:
```tsx
          <NavLink to="/topics">Topics</NavLink>
          <NavLink to="/graph">Graph</NavLink>
          {meta.hasClasses && <NavLink to="/classes">Classes</NavLink>}
```
With:
```tsx
          <NavLink to={`/${id}/topics`}>Topics</NavLink>
          <NavLink to={`/${id}/graph`}>Graph</NavLink>
          {meta.hasClasses && <NavLink to={`/${id}/classes`}>Classes</NavLink>}
```

- [ ] **Step 2: `src/components/RichText.tsx`** (compendium id aliased to `compendiumId` — a link-target `id` is already destructured per-link below)

Replace:
```tsx
export default function RichText({ text }: { text: string }) {
  const { domains } = useCompendium()
```
With:
```tsx
export default function RichText({ text }: { text: string }) {
  const { id: compendiumId, domains } = useCompendium()
```

Replace:
```tsx
          return (
            <Link key={i} to={`/topics/${domainId}/${id}`} className="topic-link">
              {display}
            </Link>
          )
```
With:
```tsx
          return (
            <Link key={i} to={`/${compendiumId}/topics/${domainId}/${id}`} className="topic-link">
              {display}
            </Link>
          )
```

- [ ] **Step 3: `src/components/Sidebar.tsx`**

Replace:
```tsx
export default function Sidebar() {
  const { domainId } = useParams()
  const { domains, graphNodes } = useCompendium()
```
With:
```tsx
export default function Sidebar() {
  const { domainId } = useParams()
  const { id, domains, graphNodes } = useCompendium()
```

Replace:
```tsx
                    <li key={tid}>
                      <NavLink to={`/topics/${d.id}/${tid}`}>{labelById.get(tid) ?? tid}</NavLink>
                    </li>
```
With:
```tsx
                    <li key={tid}>
                      <NavLink to={`/${id}/topics/${d.id}/${tid}`}>{labelById.get(tid) ?? tid}</NavLink>
                    </li>
```

- [ ] **Step 4: `src/components/GraphView.tsx`**

Replace:
```tsx
export default function GraphView() {
  const { meta, domains, domainById, graphNodes, graphEdges, topicLoaders } = useCompendium()
```
With:
```tsx
export default function GraphView() {
  const { id, meta, domains, domainById, graphNodes, graphEdges, topicLoaders } = useCompendium()
```

Replace:
```tsx
                <GraphPanelSummary topicId={selected.id} domainId={selected.domainId} topicLoaders={topicLoaders} />
                <Link className="graph-panel-open" to={`/topics/${selected.domainId}/${selected.id}`}>
                  Open topic →
                </Link>
              </>
            ) : (
              <>
                <p className="graph-panel-summary">{selectedDomain?.blurb}</p>
                <Link className="graph-panel-open" to={`/topics/${selected.domainId}`}>
                  Open domain →
                </Link>
```
With:
```tsx
                <GraphPanelSummary topicId={selected.id} domainId={selected.domainId} topicLoaders={topicLoaders} />
                <Link className="graph-panel-open" to={`/${id}/topics/${selected.domainId}/${selected.id}`}>
                  Open topic →
                </Link>
              </>
            ) : (
              <>
                <p className="graph-panel-summary">{selectedDomain?.blurb}</p>
                <Link className="graph-panel-open" to={`/${id}/topics/${selected.domainId}`}>
                  Open domain →
                </Link>
```

- [ ] **Step 5: `src/components/TopicView.tsx`** (compendium id aliased to `compendiumId` — the `related.map((id) => ...)` callback parameter is already named `id`)

Replace:
```tsx
export default function TopicView({ topic }: { topic: Topic }) {
  const { domainById, domains } = useCompendium()
```
With:
```tsx
export default function TopicView({ topic }: { topic: Topic }) {
  const { id: compendiumId, domainById, domains } = useCompendium()
```

Replace:
```tsx
                <Link key={id} to={`/topics/${d.id}/${id}`} className="chip">
```
With:
```tsx
                <Link key={id} to={`/${compendiumId}/topics/${d.id}/${id}`} className="chip">
```

- [ ] **Step 6: `src/components/ClassDetail.tsx`** (already aliases the compendium id to `compendiumId` — no destructure change needed, just the three `Link` targets)

Replace:
```tsx
          No entry for <code className="inline-code">{fqcn}</code>. Browse the <Link to="/classes">class reference</Link>.
```
With:
```tsx
          No entry for <code className="inline-code">{fqcn}</code>. Browse the <Link to={`/${compendiumId}/classes`}>class reference</Link>.
```

Replace:
```tsx
                  return (
                    <Link key={r} to={`/topics/${d}/${id}`} className="chip">
                      {titleFromId(id)}
                    </Link>
                  )
```
With:
```tsx
                  return (
                    <Link key={r} to={`/${compendiumId}/topics/${d}/${id}`} className="chip">
                      {titleFromId(id)}
                    </Link>
                  )
```

Replace:
```tsx
                return (
                  <Link key={r} to={`/classes/${r}`} className="chip">
                    {rel.name}
                  </Link>
                )
```
With:
```tsx
                return (
                  <Link key={r} to={`/${compendiumId}/classes/${r}`} className="chip">
                    {rel.name}
                  </Link>
                )
```

- [ ] **Step 7: `src/pages/ClassesPage.tsx`**

Replace:
```tsx
function ClassList() {
  const [query, setQuery] = useState('')
  const { classSummaries, areaTitles } = useCompendium()
```
With:
```tsx
function ClassList() {
  const [query, setQuery] = useState('')
  const { id, classSummaries, areaTitles } = useCompendium()
```

Replace:
```tsx
                <Link to={`/classes/${c.fqcn}`} className="class-card">
```
With:
```tsx
                <Link to={`/${id}/classes/${c.fqcn}`} className="class-card">
```

Replace:
```tsx
export default function ClassesPage() {
  const { fqcn } = useParams()
  const { meta } = useCompendium()
  if (!meta.hasClasses) {
    return (
      <div className="classes-page">
        <header className="classes-header">
          <h1>Class Reference</h1>
          <p className="classes-lede">
            The {meta.label} compendium has no class reference — browse its <Link to="/topics">topics</Link> instead.
          </p>
        </header>
      </div>
    )
  }
```
With:
```tsx
export default function ClassesPage() {
  const { fqcn } = useParams()
  const { id, meta } = useCompendium()
  if (!meta.hasClasses) {
    return (
      <div className="classes-page">
        <header className="classes-header">
          <h1>Class Reference</h1>
          <p className="classes-lede">
            The {meta.label} compendium has no class reference — browse its <Link to={`/${id}/topics`}>topics</Link> instead.
          </p>
        </header>
      </div>
    )
  }
```

- [ ] **Step 8: `src/pages/HomePage.tsx`**

Replace:
```tsx
export default function HomePage() {
  const { meta, domains, graphNodes, graphEdges, classSummaries, books } = useCompendium()
```
With:
```tsx
export default function HomePage() {
  const { id, meta, domains, graphNodes, graphEdges, classSummaries, books } = useCompendium()
```

Replace:
```tsx
          <Link to="/topics" className="home-cta primary">
            Browse topics
          </Link>
          <Link to="/graph" className="home-cta">
            Explore the graph
          </Link>
```
With:
```tsx
          <Link to={`/${id}/topics`} className="home-cta primary">
            Browse topics
          </Link>
          <Link to={`/${id}/graph`} className="home-cta">
            Explore the graph
          </Link>
```

Replace:
```tsx
            <Link
              key={d.id}
              to={`/topics/${d.id}`}
              className="home-domain"
```
With:
```tsx
            <Link
              key={d.id}
              to={`/${id}/topics/${d.id}`}
              className="home-domain"
```

- [ ] **Step 9: `src/pages/TopicPage.tsx`** (four spots: `TopicsIndex`, `DomainLanding`, `PrevNext`, `TopicContent`)

In `TopicsIndex`, replace:
```tsx
function TopicsIndex() {
  const { domains } = useCompendium()
```
With:
```tsx
function TopicsIndex() {
  const { id, domains } = useCompendium()
```
And replace:
```tsx
          <Link key={d.id} to={`/topics/${d.id}`} className="domain-card" style={{ '--domain': d.color } as React.CSSProperties}>
```
With:
```tsx
          <Link key={d.id} to={`/${id}/topics/${d.id}`} className="domain-card" style={{ '--domain': d.color } as React.CSSProperties}>
```

In `DomainLanding`, replace:
```tsx
function DomainLanding({ domainId }: { domainId: string }) {
  const { domainById, graphNodes } = useCompendium()
```
With:
```tsx
function DomainLanding({ domainId }: { domainId: string }) {
  const { id, domainById, graphNodes } = useCompendium()
```
And replace:
```tsx
  const domain = domainById.get(domainId)
  if (!domain) return <NotFound homeHref="/topics" homeLabel="topic index" />
```
With:
```tsx
  const domain = domainById.get(domainId)
  if (!domain) return <NotFound homeHref={`/${id}/topics`} homeLabel="topic index" />
```
And replace:
```tsx
          <li key={tid}>
            <Link to={`/topics/${domainId}/${tid}`}>{labelById.get(tid) ?? tid}</Link>
          </li>
```
With:
```tsx
          <li key={tid}>
            <Link to={`/${id}/topics/${domainId}/${tid}`}>{labelById.get(tid) ?? tid}</Link>
          </li>
```

In `PrevNext`, replace:
```tsx
function PrevNext({ domainId, topicId }: { domainId: string; topicId: string }) {
  const { domains, graphNodes } = useCompendium()
```
With:
```tsx
function PrevNext({ domainId, topicId }: { domainId: string; topicId: string }) {
  const { id, domains, graphNodes } = useCompendium()
```
And replace:
```tsx
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
```
With:
```tsx
      {prev ? (
        <Link to={`/${id}/topics/${prev[0]}/${prev[1]}`} className="prevnext-link prev">
          <span className="eyebrow">‹ Previous</span>
          <span>{labelById.get(prev[1])}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={`/${id}/topics/${next[0]}/${next[1]}`} className="prevnext-link next">
          <span className="eyebrow">Next ›</span>
          <span>{labelById.get(next[1])}</span>
        </Link>
      ) : (
        <span />
      )}
```

In `TopicContent` (already destructures `id: compendiumId`, no destructure change needed), replace both:
```tsx
  if (!domain || !domain.topicIds.includes(topicId)) return <NotFound homeHref="/topics" homeLabel="topic index" />
```
With:
```tsx
  if (!domain || !domain.topicIds.includes(topicId)) return <NotFound homeHref={`/${compendiumId}/topics`} homeLabel="topic index" />
```
And:
```tsx
  const topic = state.topics.find((t) => t.id === topicId)
  if (!topic) return <NotFound homeHref="/topics" homeLabel="topic index" />
```
With:
```tsx
  const topic = state.topics.find((t) => t.id === topicId)
  if (!topic) return <NotFound homeHref={`/${compendiumId}/topics`} homeLabel="topic index" />
```

- [ ] **Step 10: `src/lib/searchIndex.ts`**

Replace:
```ts
async function build(data: CompendiumData): Promise<MiniSearch<SearchDoc>> {
```
With:
```ts
async function build(compendiumId: string, data: CompendiumData): Promise<MiniSearch<SearchDoc>> {
```

Replace the three `route:` lines:
```ts
        route: `/topics/${domainId}/${t.id}`,
```
```ts
      route: `/classes/${c.fqcn}`,
```
```ts
      route: `/topics/${d.id}`,
```
With:
```ts
        route: `/${compendiumId}/topics/${domainId}/${t.id}`,
```
```ts
      route: `/${compendiumId}/classes/${c.fqcn}`,
```
```ts
      route: `/${compendiumId}/topics/${d.id}`,
```

Replace:
```ts
export function getSearchIndex(compendiumId: string, data: CompendiumData): Promise<MiniSearch<SearchDoc>> {
  let promise = indexPromises.get(compendiumId)
  if (!promise) {
    promise = build(data)
    indexPromises.set(compendiumId, promise)
  }
  return promise
}
```
With:
```ts
export function getSearchIndex(compendiumId: string, data: CompendiumData): Promise<MiniSearch<SearchDoc>> {
  let promise = indexPromises.get(compendiumId)
  if (!promise) {
    promise = build(compendiumId, data)
    indexPromises.set(compendiumId, promise)
  }
  return promise
}
```

- [ ] **Step 11: Update the two deferred href assertions in `src/components/TopicView.test.tsx`**

Replace:
```tsx
  const summaryLink = screen.getByRole('link', { name: 'Arrays' })
  expect(summaryLink).toHaveAttribute('href', '/topics/fundamentals/arrays')
  const labeled = screen.getByRole('link', { name: 'the strings topic' })
  expect(labeled).toHaveAttribute('href', '/topics/fundamentals/strings-text')
```
With:
```tsx
  const summaryLink = screen.getByRole('link', { name: 'Arrays' })
  expect(summaryLink).toHaveAttribute('href', '/java/topics/fundamentals/arrays')
  const labeled = screen.getByRole('link', { name: 'the strings topic' })
  expect(labeled).toHaveAttribute('href', '/java/topics/fundamentals/strings-text')
```

- [ ] **Step 12: Update the deferred href assertion in `src/components/GraphView.test.tsx`, and add a non-default-compendium regression test**

Replace:
```tsx
  expect(screen.getByRole('link', { name: /open topic/i })).toHaveAttribute('href', '/topics/generics/type-erasure')
```
With:
```tsx
  expect(screen.getByRole('link', { name: /open topic/i })).toHaveAttribute('href', '/java/topics/generics/type-erasure')
```

Then add a new test proving the prefix is dynamic, not hardcoded to `'java'`. `renderWithCompendium` (from Task 3) already accepts a `compendiumId` override, so no new imports or manual router wiring are needed — append to the end of the file:
```tsx
test('link prefix follows the active compendium, not a hardcoded default', () => {
  renderWithCompendium(<GraphView />, { compendiumId: 'cs' })
  fireEvent.click(screen.getByRole('button', { name: 'Recursion & Recurrences' }))
  expect(screen.getByRole('link', { name: /open topic/i })).toHaveAttribute(
    'href',
    '/cs/topics/algo-foundations/recursion-and-recurrences',
  )
})
```

(Verified against `src/data/cs/graph.ts`: the `algo-foundations` domain has a topic node `['recursion-and-recurrences', 'Recursion & Recurrences', 3]` — that id/label pair is what the test above uses.)

- [ ] **Step 13: Run the full test suite**

Run: `npm test`
Expected: all test files pass, including the updated href assertions and the new non-default-compendium regression test.

- [ ] **Step 14: Build**

Run: `npm run build`
Expected: `tsc -b` clean, Vite build succeeds.

- [ ] **Step 15: Commit**

```bash
git add src/components/AppShell.tsx src/components/RichText.tsx src/components/Sidebar.tsx \
  src/components/GraphView.tsx src/components/TopicView.tsx src/components/ClassDetail.tsx \
  src/components/TopicView.test.tsx src/components/GraphView.test.tsx \
  src/pages/ClassesPage.tsx src/pages/HomePage.tsx src/pages/TopicPage.tsx src/lib/searchIndex.ts
git commit -m "feat: prefix all internal links with the active compendium"
```

---

### Task 5: Final verification (test suite, build, real-browser check)

**Files:** none modified — verification only, plus a targeted fix-and-recommit cycle if anything surfaces.

**Interfaces:**
- Consumes: the fully migrated app from Tasks 1–4.
- Produces: nothing — this is the plan's final gate.

- [ ] **Step 1: Full automated suite**

Run: `npm test`
Expected: all test files green (baseline was 11 files / 65 tests before this plan; Task 3 adds `CompendiumPicker.test.tsx`, so expect 12 files and a higher total test count — read the actual summary line, don't hardcode an exact number here).

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: `tsc -b` clean, Vite build succeeds (the pre-existing large-chunk warning is expected and unrelated).

- [ ] **Step 3: Start a preview server**

Run (background):
```bash
cd "/Users/nikola/VS Code Projects/java-knowledge-base" && npx vite preview --port 4173
```

- [ ] **Step 4: Real-browser verification script**

This machine has no Chrome — use the project's established `puppeteer-core` + Microsoft Edge headless pattern (see `scripts/verify-visual.mjs`). Write a temporary script inside the repo (so `puppeteer-core` resolves), e.g. `scripts/_tmp-verify-routes.mjs`:

```js
import puppeteer from 'puppeteer-core'

const BASE = 'http://localhost:4173'
const browser = await puppeteer.launch({
  executablePath: '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  headless: true,
})
const errors = []
const page = await browser.newPage()
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[${page.url()}] ${msg.text()}`) })
page.on('pageerror', (err) => errors.push(`[${page.url()}] PAGEERROR ${err.message}`))

async function checkPath(path, expectHeadingMatch) {
  await page.goto(BASE + path, { waitUntil: 'networkidle0' })
  const title = await page.title()
  const bodyText = await page.evaluate(() => document.body.innerText)
  const ok = expectHeadingMatch.test(bodyText)
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${path} — title="${title}" — matched ${expectHeadingMatch}: ${ok}`)
}

// Fresh browser, no localStorage set.
await checkPath('/', /Choose a compendium/i)
await checkPath('/java', /Java, indexed/i)
await checkPath('/cs', /Computer science, clarified/i)
await checkPath('/system-design', /Systems, at scale/i)
await checkPath('/bogus-compendium', /Not found/i)
await checkPath('/topics/generics/type-erasure', /Type Erasure/i) // legacy unprefixed link

console.log('console errors:', errors.length ? errors : 'none')
await browser.close()
```

Run: `cd "/Users/nikola/VS Code Projects/java-knowledge-base" && node scripts/_tmp-verify-routes.mjs`
Expected: every line prints `OK`, and `console errors: none`.

- [ ] **Step 5: Manual switcher + title check**

Using the same script or an interactive follow-up, confirm: opening the compendium switcher in the header (`/java`) and clicking "CS" navigates the URL to `/cs` and the tab title changes to `CS::Compendium`. This can be scripted with a `page.click()` on the switcher button and menu option, or checked by hand — either is acceptable since Task 3/4's automated tests already cover the underlying title and navigation logic; this step is a final human-observable sanity check.

- [ ] **Step 6: Clean up**

```bash
rm -f "/Users/nikola/VS Code Projects/java-knowledge-base/scripts/_tmp-verify-routes.mjs"
```

Stop the preview server (`kill` the background process started in Step 3).

- [ ] **Step 7: If any check failed**

Fix the specific issue, re-run the full `npm test` + `npm run build` + the relevant verification step, and commit the fix separately (`fix: <specific issue>`) before considering the plan complete. Do not bundle unrelated cleanup into this fix commit.

---

## Final verification (after all tasks)

- [ ] `npm test` — full suite green.
- [ ] `npm run build` — clean.
- [ ] Every one of the 25 originally-identified route-building call sites (see the design spec's Problem section) now includes a compendium prefix — confirmed by Task 4's file-by-file changes plus the regression test in Task 4 Step 12.
- [ ] `src/data/integrity.test.ts` untouched and still passing (unaffected by routing — confirmed as part of every `npm test` run across all five tasks).
- [ ] Bare `/`, `/java`, `/cs`, `/system-design`, an invalid compendium segment, and a legacy unprefixed link all resolve correctly per Task 5's browser check.

## Self-review against the spec

- **URL-prefixed routes, URL as source of truth** → Task 3 (`App.tsx`, `CompendiumProvider.tsx`).
- **Bare `/` is a real picker page, not a redirect** → Task 3 (`CompendiumPicker.tsx`).
- **Picker page standalone, not wrapped by AppShell/CompendiumProvider** → Task 3's `App.tsx`: `CompendiumPicker` is a sibling route to `:compendiumId`, not nested under it.
- **`localStorage` downgraded to a convenience signal only** → Task 3's `CompendiumProvider.tsx` (writes on valid id change, never reads to gate content) and `CompendiumPicker.tsx` (reads only for the "continue" badge).
- **Invalid compendium segment 404s, not falls back** → Task 3's `CompendiumProvider.tsx` (`if (!value) return <NotFound />`), tested in `App.test.tsx`'s `'invalid compendium segment shows not found'`.
- **Legacy unprefixed URLs redirect, not 404** → Task 3's five `LegacyRedirect` routes, tested in `App.test.tsx`'s `'legacy unprefixed link redirects into the default compendium'`.
- **All 18+ call sites migrated** → Task 4, itemized file-by-file (ended up being 12 files covering every site found during plan-writing, including a few the original design-time grep undercounted, e.g. `TopicPage.tsx`'s internal `NotFound` link and `searchIndex.ts`'s three `route:` strings).
- **Shared test helper, three affected test files** → the design anticipated `AppShell.test.tsx`, `TopicView.test.tsx`, `GraphView.test.tsx`; plan-writing discovered three more existing files with the same coupling (`App.test.tsx`, `TopicPage.test.tsx`, `ClassesPage.test.tsx`, `SearchPalette.test.tsx` — four, not three) that also render `<App/>` directly at unprefixed paths. All are migrated in Task 3 via `test-utils.tsx`'s two exports (`renderApp`, `renderWithCompendium`).
- **Integrity suite untouched** → never appears in any task's file list; every task's `npm test` run is the regression check.
- **No schema changes** → `src/types/content.ts` never appears in any task's file list.
