# SEO, Crawlability & Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every canonical route in Java::Compendium (~360 routes across 3 compendiums) gets its own static, crawlable HTML with correct per-route title/description/canonical/OG/Twitter tags and JSON-LD, plus a generated `sitemap.xml`, `robots.txt`, and per-domain OG images — built entirely at `npm run build` time, with zero change to how Cloudflare Pages deploys the site.

**Architecture:** A new SSR entrypoint (`src/entry-server.tsx`) renders the existing `<App/>` component tree with React Router's `StaticRouter` + `renderToString` for every route enumerated from the app's own typed data. A plain Node script (`scripts/prerender.mjs`) runs after the normal client build and an SSR build of that entrypoint, and writes one `dist/<path>/index.html` per route (real rendered content + injected `<head>` metadata), plus `dist/sitemap.xml` and per-domain OG images. `dist/robots.txt` is a static file. React hydrates on top of the prerendered markup for real users exactly as today.

**Tech Stack:** React 19, react-router-dom 7.18, Vite 8 (client build + `--ssr` build), Vitest, `@resvg/resvg-js` (new devDependency, for build-time PNG generation from SVG — no headless browser).

## Global Constraints

- Production domain is `https://referencehub.dev` (used verbatim in every canonical URL, OG tag, and the sitemap).
- No changes to Cloudflare Pages project configuration — all new build steps fold into the existing `npm run build` script; output stays in `./dist`.
- Legacy unprefixed routes (`/topics/*`, `/graph`, `/classes/*`) are never prerendered and never appear in the sitemap.
- No `SearchAction` JSON-LD (no server-queryable search endpoint exists).
- No `<lastmod>`/`<changefreq>`/`<priority>` in the sitemap.
- OG images: exactly one per domain across all compendiums (32 today: 12 Java + 10 CS + 10 System Design) — not per-topic, not a single site-wide image.
- Java class-reference pages use a separate "area" taxonomy (`lang-core`, `collections`, `functional`, `concurrent`, `io-net`, `platform` — from `src/data/classes/index.ts`'s `areaTitles`) that is **not** the same set as topic `Domain` ids (`fundamentals`, `oop`, `generics`, `collections`, `functional`, `exceptions`, `io`, `concurrency`, `jvm`, `performance`, `platform`, `modern` — from `src/data/domains.ts`). Class pages borrow a Domain's OG image via an explicit area→domain mapping (see Task 6) rather than getting their own images, to keep the total at exactly 32.

---

## Context: two real SSR landmines found in the existing code

Before any new code, two existing files touch browser-only APIs unconditionally during render (not inside `useEffect`), which will crash Node's `renderToString`:

1. **`src/lib/useTheme.ts`** — `document.documentElement.dataset.theme = theme` runs directly in the hook body on every render (line 39), and `useSyncExternalStore(subscribe, currentTheme)` has no third `getServerSnapshot` argument, which React requires for server rendering.
2. **`src/pages/CompendiumPicker.tsx`** — `const lastUsed = localStorage.getItem(STORAGE_KEY)` (line 8) runs directly in the component body.

Both are fixed in Task 1.

Separately, topic and class content loads lazily through `useEffect` (`src/lib/useTopics.ts`, `src/components/ClassDetail.tsx`), which never fires during a single synchronous `renderToString` pass — naively, every topic/class page would prerender as an empty "loading" placeholder instead of real content. Both hooks' module-private caches are checked synchronously in their `useState` initializer *before* falling back to a loading state, so pre-warming those caches before calling `render()` is enough to get real content on the first (only) SSR pass. Task 2 exports the preload functions needed for this.

---

### Task 1: Fix SSR-unsafe browser API access

**Files:**
- Modify: `src/lib/useTheme.ts`
- Modify: `src/pages/CompendiumPicker.tsx`
- Create: `src/lib/useTheme.test.tsx`
- Test: `src/lib/useTheme.test.tsx`, `src/lib/ssrSafety.test.tsx` (new)

**Interfaces:**
- Produces: `useTheme(): [Theme, () => void]` (unchanged signature, now SSR-safe).

- [ ] **Step 1: Write a failing Node-environment test proving the current crash**

Create `src/lib/ssrSafety.test.tsx`:

```tsx
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import CompendiumPicker from '../pages/CompendiumPicker'

describe('components with no DOM globals available (simulates SSR)', () => {
  it('renders ThemeToggle without throwing', () => {
    expect(() => renderToString(<ThemeToggle />)).not.toThrow()
  })

  it('renders CompendiumPicker without throwing', () => {
    expect(() =>
      renderToString(
        <MemoryRouter>
          <CompendiumPicker />
        </MemoryRouter>,
      ),
    ).not.toThrow()
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/ssrSafety.test.tsx`
Expected: FAIL — `ThemeToggle` throws `ReferenceError: document is not defined` (or a `useSyncExternalStore` "Missing getServerSnapshot" error), and `CompendiumPicker` throws `ReferenceError: localStorage is not defined`.

- [ ] **Step 3: Fix `useTheme.ts`**

Replace the full contents of `src/lib/useTheme.ts`:

```ts
import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'jkb-theme'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function currentTheme(): Theme {
  const stored = localStorage.getItem(KEY)
  return stored === 'light' || stored === 'dark' ? stored : systemTheme()
}

// index.html's default (no data-theme attribute) renders the light palette, so that's the
// only sane snapshot to hand back during server rendering — there's no request, browser, or
// stored preference to read at build time.
function serverTheme(): Theme {
  return 'light'
}

let listeners: Array<() => void> = []

function subscribe(cb: () => void) {
  listeners.push(cb)
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', cb)
  return () => {
    listeners = listeners.filter((l) => l !== cb)
    mq.removeEventListener('change', cb)
  }
}

export function useTheme(): [Theme, () => void] {
  const theme = useSyncExternalStore(subscribe, currentTheme, serverTheme)

  const toggle = useCallback(() => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    localStorage.setItem(KEY, next)
    document.documentElement.dataset.theme = next
    listeners.forEach((l) => l())
  }, [])

  // Keep the attribute in sync on first render too (no-op during server rendering, where
  // there's no `document` to set it on).
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme
  }
  return [theme, toggle]
}
```

- [ ] **Step 4: Fix `CompendiumPicker.tsx`**

In `src/pages/CompendiumPicker.tsx`, change:

```tsx
  const lastUsed = localStorage.getItem(STORAGE_KEY)
```

to:

```tsx
  const lastUsed = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
```

- [ ] **Step 5: Run the new test again to confirm it passes**

Run: `npx vitest run src/lib/ssrSafety.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 6: Add a regression test for `useTheme` itself (previously untested)**

Create `src/lib/useTheme.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from './useTheme'

function Harness() {
  const [theme, toggle] = useTheme()
  return (
    <button onClick={toggle} data-testid="toggle">
      {theme}
    </button>
  )
}

test('reflects the theme stored in localStorage', () => {
  localStorage.setItem('jkb-theme', 'dark')
  render(<Harness />)
  expect(screen.getByTestId('toggle')).toHaveTextContent('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  localStorage.removeItem('jkb-theme')
})

test('toggle flips the theme and persists it', async () => {
  localStorage.setItem('jkb-theme', 'light')
  render(<Harness />)
  await userEvent.click(screen.getByTestId('toggle'))
  expect(screen.getByTestId('toggle')).toHaveTextContent('dark')
  expect(localStorage.getItem('jkb-theme')).toBe('dark')
  localStorage.removeItem('jkb-theme')
})
```

- [ ] **Step 7: Run the full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS — all existing tests green, including `src/pages/CompendiumPicker.test.tsx` unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/lib/useTheme.ts src/lib/useTheme.test.tsx src/lib/ssrSafety.test.tsx src/pages/CompendiumPicker.tsx
git commit -m "fix: make useTheme and CompendiumPicker safe to render without DOM globals"
```

---

### Task 2: Export cache-preload helpers for topics and classes

**Files:**
- Modify: `src/lib/useTopics.ts`
- Modify: `src/components/ClassDetail.tsx`
- Test: `src/lib/useTopics.test.ts` (new), `src/components/ClassDetail.preload.test.tsx` (new)

**Interfaces:**
- Produces: `preloadTopics(compendiumId: string, domainId: string, topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>>): Promise<void>` from `src/lib/useTopics.ts`.
- Produces: `preloadClassArea(compendiumId: string, area: string, classLoaders: Record<string, () => Promise<{ classes: JavaClass[] }>>): Promise<void>` from `src/components/ClassDetail.tsx`.
- Consumes (Step 1 test only): `compendiumRegistry` from `src/data/registry.ts` (already used elsewhere in the app for real Java domain/loader data — `compendiumRegistry.java.topicLoaders`, `compendiumRegistry.java.domains[0].id`).

- [ ] **Step 1: Write a failing test for `preloadTopics`**

Create `src/lib/useTopics.test.ts`:

```ts
import { renderHook } from '@testing-library/react'
import { compendiumRegistry } from '../data/registry'
import { useTopics, preloadTopics } from './useTopics'

test('preloadTopics warms the cache so useTopics starts in the ready state', async () => {
  const domainId = compendiumRegistry.java.domains[0].id
  await preloadTopics('java', domainId, compendiumRegistry.java.topicLoaders)

  const { result } = renderHook(() => useTopics('java', compendiumRegistry.java.topicLoaders, domainId))

  expect(result.current.status).toBe('ready')
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/lib/useTopics.test.ts`
Expected: FAIL — `preloadTopics` is not exported from `./useTopics`.

- [ ] **Step 3: Add `preloadTopics` to `src/lib/useTopics.ts`**

Add this export (the `cache` map above it already exists — do not duplicate it):

```ts
/** Pre-warms the module cache for a compendium+domain so the next render of useTopics for that
 *  key starts in the 'ready' state synchronously, instead of 'loading' (which only resolves via
 *  a useEffect — useful for SSR, where effects never run during the single render pass). */
export async function preloadTopics(
  compendiumId: string,
  domainId: string,
  topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>>,
): Promise<void> {
  const key = `${compendiumId}:${domainId}`
  if (cache.has(key)) return
  const loader = topicLoaders[domainId]
  if (!loader) return
  const { topics } = await loader()
  cache.set(key, topics)
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `npx vitest run src/lib/useTopics.test.ts`
Expected: PASS.

- [ ] **Step 5: Write a failing test for `preloadClassArea`**

Create `src/components/ClassDetail.preload.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { compendiumRegistry } from '../data/registry'
import ClassDetail, { preloadClassArea } from './ClassDetail'
import { renderWithCompendium } from '../test-utils'

test('preloadClassArea warms the cache so ClassDetail renders real content on first render', async () => {
  const fqcn = compendiumRegistry.java.classSummaries[0].fqcn
  const area = compendiumRegistry.java.classSummaries[0].area
  await preloadClassArea('java', area, compendiumRegistry.java.classLoaders)

  renderWithCompendium(<ClassDetail fqcn={fqcn} />)

  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})
```

- [ ] **Step 6: Run it to confirm it fails**

Run: `npx vitest run src/components/ClassDetail.preload.test.tsx`
Expected: FAIL — `preloadClassArea` is not exported from `./ClassDetail`.

- [ ] **Step 7: Add `preloadClassArea` to `src/components/ClassDetail.tsx`**

Add this export (the `cache` map above it already exists in the file — do not duplicate it):

```ts
/** Pre-warms the module cache for a compendium+area so the next ClassDetail render for a class
 *  in that area starts with real data synchronously, instead of the loading placeholder (which
 *  only resolves via a useEffect — useful for SSR, where effects never run during the single
 *  render pass). */
export async function preloadClassArea(
  compendiumId: string,
  area: string,
  classLoaders: Record<string, () => Promise<{ classes: JavaClass[] }>>,
): Promise<void> {
  const key = `${compendiumId}:${area}`
  if (cache.has(key)) return
  const loader = classLoaders[area]
  if (!loader) return
  const { classes } = await loader()
  cache.set(key, classes)
}
```

- [ ] **Step 8: Run the test again to confirm it passes**

Run: `npx vitest run src/components/ClassDetail.preload.test.tsx`
Expected: PASS.

- [ ] **Step 9: Run the full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/useTopics.ts src/lib/useTopics.test.ts src/components/ClassDetail.tsx src/components/ClassDetail.preload.test.tsx
git commit -m "feat: export cache-preload helpers for topics and classes"
```

---

### Task 3: Route enumerator (`getAllRoutes`)

**Files:**
- Create: `src/seo/routes.ts`
- Test: `src/seo/routes.test.ts`

**Interfaces:**
- Consumes: `compendiums`, `CompendiumMeta` from `src/data/compendiums.ts`; `compendiumRegistry` from `src/data/registry.ts`.
- Produces: `RouteKind` (union type), `RouteMeta` (interface), `CLASS_AREA_TO_DOMAIN_ID: Record<string, string>`, `getAllRoutes(): Promise<RouteMeta[]>` — all consumed by Tasks 4, 6, 7, 8.

- [ ] **Step 1: Write the failing test**

Create `src/seo/routes.test.ts`:

```ts
import { compendiumRegistry } from '../data/registry'
import { getAllRoutes, CLASS_AREA_TO_DOMAIN_ID } from './routes'

test('enumerates exactly one route per topic, one per class, with unique paths', async () => {
  const routes = await getAllRoutes()

  const paths = routes.map((r) => r.path)
  expect(new Set(paths).size).toBe(paths.length)

  const expectedTopicCount = Object.values(compendiumRegistry).reduce(
    (n, data) => n + data.domains.reduce((m, d) => m + d.topicIds.length, 0),
    0,
  )
  expect(routes.filter((r) => r.kind === 'topic')).toHaveLength(expectedTopicCount)

  const expectedClassCount = compendiumRegistry.java.classSummaries.length
  expect(routes.filter((r) => r.kind === 'class-detail')).toHaveLength(expectedClassCount)

  // CS and System Design have no class reference.
  expect(routes.some((r) => r.path === '/cs/classes')).toBe(false)
  expect(routes.some((r) => r.path === '/system-design/classes')).toBe(false)

  // Every route has real, non-empty metadata.
  for (const route of routes) {
    expect(route.path.startsWith('/')).toBe(true)
    expect(route.title.length).toBeGreaterThan(0)
    expect(route.description.length).toBeGreaterThan(0)
  }

  // Every class-detail route's domainId maps to a real Java domain.
  const javaDomainIds = new Set(compendiumRegistry.java.domains.map((d) => d.id))
  for (const route of routes.filter((r) => r.kind === 'class-detail')) {
    expect(route.domainId).toBeDefined()
    expect(javaDomainIds.has(route.domainId!)).toBe(true)
  }

  // The picker route and each compendium-home route exist.
  expect(routes.find((r) => r.path === '/')?.kind).toBe('picker')
  expect(routes.find((r) => r.path === '/java')?.kind).toBe('compendium-home')
  expect(routes.find((r) => r.path === '/cs')?.kind).toBe('compendium-home')
  expect(routes.find((r) => r.path === '/system-design')?.kind).toBe('compendium-home')

  // The compendium-home route carries its domain list for the ItemList JSON-LD.
  const javaHome = routes.find((r) => r.path === '/java')!
  expect(javaHome.domains?.length).toBe(compendiumRegistry.java.domains.length)
})

test('CLASS_AREA_TO_DOMAIN_ID maps every class area to a real Java domain', () => {
  const javaDomainIds = new Set(compendiumRegistry.java.domains.map((d) => d.id))
  for (const [area, domainId] of Object.entries(CLASS_AREA_TO_DOMAIN_ID)) {
    expect(javaDomainIds.has(domainId), `area "${area}" maps to unknown domain "${domainId}"`).toBe(true)
  }
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/seo/routes.test.ts`
Expected: FAIL — `src/seo/routes.ts` doesn't exist yet.

- [ ] **Step 3: Implement `src/seo/routes.ts`**

```ts
import { compendiums, type CompendiumMeta } from '../data/compendiums'
import { compendiumRegistry, type CompendiumData } from '../data/registry'

export type RouteKind =
  | 'picker'
  | 'compendium-home'
  | 'topics-index'
  | 'domain-landing'
  | 'topic'
  | 'graph'
  | 'classes-index'
  | 'class-detail'

export interface RouteMeta {
  path: string
  kind: RouteKind
  title: string
  description: string
  compendiumId?: string
  compendiumLabel?: string
  domainId?: string
  domainTitle?: string
  topicId?: string
  fqcn?: string
  /** Only set on 'compendium-home' routes — feeds the ItemList structured data. */
  domains?: Array<{ id: string; title: string }>
}

/** Java's class-reference "areas" (from src/data/classes/index.ts's areaTitles) are a separate,
 *  smaller taxonomy than topic Domains (src/data/domains.ts) — they overlap in naming for some
 *  ids ('collections', 'functional', 'platform') but diverge for others ('concurrent' vs
 *  'concurrency', 'io-net' vs 'io', 'lang-core' has no Domain equivalent at all). Class pages
 *  have no Domain of their own, so they borrow the closest Domain's OG image via this table. */
export const CLASS_AREA_TO_DOMAIN_ID: Record<string, string> = {
  'lang-core': 'fundamentals',
  collections: 'collections',
  functional: 'functional',
  concurrent: 'concurrency',
  'io-net': 'io',
  platform: 'platform',
}

const MAX_DESCRIPTION_LENGTH = 155

function truncate(text: string): string {
  return text.length <= MAX_DESCRIPTION_LENGTH ? text : `${text.slice(0, MAX_DESCRIPTION_LENGTH - 1).trimEnd()}…`
}

async function compendiumRoutes(meta: CompendiumMeta, data: CompendiumData): Promise<RouteMeta[]> {
  const routes: RouteMeta[] = []

  routes.push({
    path: `/${meta.id}`,
    kind: 'compendium-home',
    title: `${meta.label}::Compendium`,
    description: truncate(meta.heroLede),
    compendiumId: meta.id,
    compendiumLabel: meta.label,
    domains: data.domains.map((d) => ({ id: d.id, title: d.title })),
  })

  const topicCount = data.domains.reduce((n, d) => n + d.topicIds.length, 0)
  routes.push({
    path: `/${meta.id}/topics`,
    kind: 'topics-index',
    title: `Topics · ${meta.label}::Compendium`,
    description: truncate(`${data.domains.length} domains, ${topicCount} topics — distilled from curated books.`),
    compendiumId: meta.id,
    compendiumLabel: meta.label,
  })

  routes.push({
    path: `/${meta.id}/graph`,
    kind: 'graph',
    title: `Knowledge Graph · ${meta.label}::Compendium`,
    description: truncate(`An interactive graph of every domain and topic in the ${meta.label} compendium.`),
    compendiumId: meta.id,
    compendiumLabel: meta.label,
  })

  for (const domain of data.domains) {
    routes.push({
      path: `/${meta.id}/topics/${domain.id}`,
      kind: 'domain-landing',
      title: `${domain.title} · ${meta.label}::Compendium`,
      description: truncate(domain.blurb),
      compendiumId: meta.id,
      compendiumLabel: meta.label,
      domainId: domain.id,
      domainTitle: domain.title,
    })

    const loader = data.topicLoaders[domain.id]
    if (!loader) continue
    const { topics } = await loader()
    for (const topic of topics) {
      routes.push({
        path: `/${meta.id}/topics/${domain.id}/${topic.id}`,
        kind: 'topic',
        title: `${topic.title} · ${domain.title} · ${meta.label}::Compendium`,
        description: truncate(topic.summary),
        compendiumId: meta.id,
        compendiumLabel: meta.label,
        domainId: domain.id,
        domainTitle: domain.title,
        topicId: topic.id,
      })
    }
  }

  if (meta.hasClasses) {
    routes.push({
      path: `/${meta.id}/classes`,
      kind: 'classes-index',
      title: `Class Reference · ${meta.label}::Compendium`,
      description: truncate(
        `${data.classSummaries.length} essential JDK classes, curated — key methods, examples, and pitfalls.`,
      ),
      compendiumId: meta.id,
      compendiumLabel: meta.label,
    })

    for (const summary of data.classSummaries) {
      routes.push({
        path: `/${meta.id}/classes/${summary.fqcn}`,
        kind: 'class-detail',
        title: `${summary.name} · Class Reference · ${meta.label}::Compendium`,
        description: truncate(summary.summary),
        compendiumId: meta.id,
        compendiumLabel: meta.label,
        domainId: CLASS_AREA_TO_DOMAIN_ID[summary.area],
        fqcn: summary.fqcn,
      })
    }
  }

  return routes
}

/** Enumerates every canonical (non-legacy) route in the app, across all compendiums, with the
 *  metadata needed to prerender it and build its <head> tags. Single source of truth shared by
 *  the prerender script (Task 8), the SSR safety-net test (Task 5), and the sitemap generator
 *  (Task 8) — nothing else should hand-maintain a route list. */
export async function getAllRoutes(): Promise<RouteMeta[]> {
  const routes: RouteMeta[] = [
    {
      path: '/',
      kind: 'picker',
      title: 'Choose a Compendium · Compendium',
      description: 'Java, CS, and System Design — three cross-linked knowledge bases distilled from foundational books.',
    },
  ]
  for (const meta of compendiums) {
    routes.push(...(await compendiumRoutes(meta, compendiumRegistry[meta.id])))
  }
  return routes
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `npx vitest run src/seo/routes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/seo/routes.ts src/seo/routes.test.ts
git commit -m "feat: add getAllRoutes() route enumerator for prerendering and sitemap generation"
```

---

### Task 4: SSR entry point (`render`)

**Files:**
- Create: `src/entry-server.tsx`
- Test: `src/entry-server.test.tsx`

**Interfaces:**
- Consumes: `preloadTopics` (Task 2, `src/lib/useTopics.ts`), `preloadClassArea` (Task 2, `src/components/ClassDetail.tsx`), `getAllRoutes`, `RouteMeta` (Task 3, `src/seo/routes.ts`), `compendiumRegistry` (`src/data/registry.ts`), `App` (`src/App.tsx`).
- Produces: `render(route: RouteMeta): Promise<string>` and re-exports `getAllRoutes`, `RouteMeta`, `RouteKind` — consumed by Task 5 and Task 8.

- [ ] **Step 1: Write the failing test**

Create `src/entry-server.test.tsx`:

```tsx
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { render } from './entry-server'
import { getAllRoutes } from './seo/routes'

describe('entry-server render()', () => {
  it('renders real topic content, not the loading placeholder', async () => {
    const routes = await getAllRoutes()
    const topicRoute = routes.find((r) => r.kind === 'topic' && r.compendiumId === 'java')!

    const html = await render(topicRoute)

    expect(html).toContain('topic-title')
    expect(html).not.toContain('topic-loading')
  })

  it('renders real class-detail content, not the loading placeholder', async () => {
    const routes = await getAllRoutes()
    const classRoute = routes.find((r) => r.kind === 'class-detail')!

    const html = await render(classRoute)

    expect(html).toContain('classdetail-name')
  })

  it('renders the compendium home page', async () => {
    const routes = await getAllRoutes()
    const homeRoute = routes.find((r) => r.path === '/java')!

    const html = await render(homeRoute)

    expect(html.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/entry-server.test.tsx`
Expected: FAIL — `src/entry-server.tsx` doesn't exist yet.

- [ ] **Step 3: Implement `src/entry-server.tsx`**

```tsx
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { compendiumRegistry } from './data/registry'
import { preloadTopics } from './lib/useTopics'
import { preloadClassArea } from './components/ClassDetail'
import { getAllRoutes, type RouteMeta, type RouteKind } from './seo/routes'

export { getAllRoutes, type RouteMeta, type RouteKind }

/** Pre-warms whichever lazy-loaded cache the given route depends on, so the single synchronous
 *  renderToString pass below renders real content instead of each component's "loading" state
 *  (which normally only resolves via a useEffect that never fires during SSR). */
async function preload(route: RouteMeta): Promise<void> {
  if (!route.compendiumId) return
  const data = compendiumRegistry[route.compendiumId]

  if (route.kind === 'topic' && route.domainId) {
    await preloadTopics(route.compendiumId, route.domainId, data.topicLoaders)
  }

  if (route.kind === 'class-detail' && route.fqcn) {
    const summary = data.classSummaries.find((s) => s.fqcn === route.fqcn)
    if (summary) await preloadClassArea(route.compendiumId, summary.area, data.classLoaders)
  }
}

/** Renders one route to a static HTML fragment (no <html>/<head> — the prerender script injects
 *  that separately). Always goes through this function rather than calling renderToString
 *  directly against <App/>, since real content for topic/class-detail routes requires their
 *  lazy data to already be cached. */
export async function render(route: RouteMeta): Promise<string> {
  await preload(route)
  return renderToString(
    <StaticRouter location={route.path}>
      <App />
    </StaticRouter>,
  )
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `npx vitest run src/entry-server.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/entry-server.tsx src/entry-server.test.tsx
git commit -m "feat: add SSR entry point that renders real content for every route"
```

---

### Task 5: SSR safety-net test (regression guardrail)

**Files:**
- Create: `src/entry-server.safetynet.test.ts`

**Interfaces:**
- Consumes: `getAllRoutes`, `render` from `src/entry-server.ts` (Task 4).

- [ ] **Step 1: Write the test**

Create `src/entry-server.safetynet.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { getAllRoutes, render } from './entry-server'

describe('SSR safety net', () => {
  it('renders every canonical route without throwing', async () => {
    const routes = await getAllRoutes()
    expect(routes.length).toBeGreaterThan(0)

    for (const route of routes) {
      const html = await render(route)
      expect(typeof html).toBe('string')
    }
  }, 60_000)
})
```

- [ ] **Step 2: Run it**

Run: `npx vitest run src/entry-server.safetynet.test.ts`
Expected: PASS — every route in `getAllRoutes()` renders without throwing. (If this fails for a specific route, the failure message names the route's `path`, `kind`, `domainId`/`fqcn` from the loop — track down which component that route hits and check for another unconditional `window`/`document`/`localStorage` reference outside a `useEffect`, same class of bug as Task 1.)

- [ ] **Step 3: Commit**

```bash
git add src/entry-server.safetynet.test.ts
git commit -m "test: add SSR safety net covering every canonical route"
```

---

### Task 6: Per-domain OG image generation

**Files:**
- Create: `src/seo/ogImage.ts`
- Create: `src/seo/ogImageRender.ts`
- Test: `src/seo/ogImage.test.ts`, `src/seo/ogImageRender.test.ts`
- Modify: `package.json` (add `@resvg/resvg-js` devDependency)
- Modify: `src/entry-server.tsx` (re-export `generateOgImages`, `resolveOgImagePath`)

**Interfaces:**
- Consumes: `compendiums` (`src/data/compendiums.ts`), `compendiumRegistry` (`src/data/registry.ts`), `RouteMeta` (Task 3).
- Produces: `ogImagePath(compendiumId, domainId): string`, `resolveOgImagePath(route: RouteMeta): string`, `allOgImageTargets(): OgImageTarget[]` from `src/seo/ogImage.ts`; `generateOgImages(distDir: string): Promise<void>` from `src/seo/ogImageRender.ts` — consumed by Task 7 and Task 8.

- [ ] **Step 1: Install the rasterizer**

Run: `npm install --save-dev @resvg/resvg-js`
Expected: adds `@resvg/resvg-js` to `package.json`'s `devDependencies` and updates `package-lock.json`.

- [ ] **Step 2: Write the failing test for path naming/resolution**

Create `src/seo/ogImage.test.ts`:

```ts
import { compendiumRegistry } from '../data/registry'
import { ogImagePath, resolveOgImagePath, allOgImageTargets } from './ogImage'
import type { RouteMeta } from './routes'

test('ogImagePath builds a stable per-domain path', () => {
  expect(ogImagePath('java', 'collections')).toBe('/og/java/collections.png')
})

test('resolveOgImagePath uses the route domain when present', () => {
  const route: RouteMeta = {
    path: '/java/topics/collections/arraylist',
    kind: 'topic',
    title: 't',
    description: 'd',
    compendiumId: 'java',
    domainId: 'collections',
  }
  expect(resolveOgImagePath(route)).toBe('/og/java/collections.png')
})

test('resolveOgImagePath falls back to the compendium\'s first domain when the route has none', () => {
  const route: RouteMeta = { path: '/java/graph', kind: 'graph', title: 't', description: 'd', compendiumId: 'java' }
  expect(resolveOgImagePath(route)).toBe(`/og/java/${compendiumRegistry.java.domains[0].id}.png`)
})

test('resolveOgImagePath falls back to the Java default compendium for the root picker route', () => {
  const route: RouteMeta = { path: '/', kind: 'picker', title: 't', description: 'd' }
  expect(resolveOgImagePath(route)).toBe(`/og/java/${compendiumRegistry.java.domains[0].id}.png`)
})

test('allOgImageTargets returns exactly one target per domain across all compendiums (32 today)', () => {
  const targets = allOgImageTargets()
  const expectedCount = Object.values(compendiumRegistry).reduce((n, data) => n + data.domains.length, 0)
  expect(targets).toHaveLength(expectedCount)
  expect(new Set(targets.map((t) => `${t.compendiumId}/${t.domainId}`)).size).toBe(targets.length)
})
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `npx vitest run src/seo/ogImage.test.ts`
Expected: FAIL — `src/seo/ogImage.ts` doesn't exist yet.

- [ ] **Step 4: Implement `src/seo/ogImage.ts`**

```ts
import { compendiums } from '../data/compendiums'
import { compendiumRegistry } from '../data/registry'
import type { RouteMeta } from './routes'

/** Public URL path (relative to site root) for a domain's generated OG image. */
export function ogImagePath(compendiumId: string, domainId: string): string {
  return `/og/${compendiumId}/${domainId}.png`
}

/** Resolves which domain's OG image a given route should use: its own domain if it has one,
 *  otherwise its compendium's first domain (compendium home, topics index, graph, classes
 *  index), otherwise the Java default compendium's first domain (only the root picker route
 *  has no compendium at all). */
export function resolveOgImagePath(route: RouteMeta): string {
  const compendiumId = route.compendiumId ?? 'java'
  const domainId = route.domainId ?? compendiumRegistry[compendiumId].domains[0].id
  return ogImagePath(compendiumId, domainId)
}

export interface OgImageTarget {
  compendiumId: string
  domainId: string
  domainTitle: string
  compendiumLabel: string
  color: string
}

/** Every (compendium, domain) pair whose OG image must be generated at build time — one per
 *  domain across all compendiums (32 today: 12 Java + 10 CS + 10 System Design). */
export function allOgImageTargets(): OgImageTarget[] {
  const targets: OgImageTarget[] = []
  for (const meta of compendiums) {
    for (const domain of compendiumRegistry[meta.id].domains) {
      targets.push({
        compendiumId: meta.id,
        domainId: domain.id,
        domainTitle: domain.title,
        compendiumLabel: meta.label,
        color: domain.color,
      })
    }
  }
  return targets
}
```

- [ ] **Step 5: Run the test again to confirm it passes**

Run: `npx vitest run src/seo/ogImage.test.ts`
Expected: PASS.

- [ ] **Step 6: Write the failing test for actual PNG rendering**

Create `src/seo/ogImageRender.test.ts`:

```ts
import { mkdtemp, readdir, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { generateOgImages } from './ogImageRender'
import { allOgImageTargets } from './ogImage'

test('generates one valid PNG per OG image target, including domain titles with special characters', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'og-images-'))
  await generateOgImages(dir)

  const targets = allOgImageTargets()
  for (const target of targets) {
    const filePath = path.join(dir, 'og', target.compendiumId, `${target.domainId}.png`)
    const bytes = await readFile(filePath)
    expect(bytes.length).toBeGreaterThan(0)
    // PNG magic number.
    expect(bytes.subarray(0, 8)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }

  // Regression check for the specific domain whose title contains an unescaped "&"
  // ("Objects, Classes & OOP Design") — this must not throw when building the SVG.
  const oopDir = await readdir(path.join(dir, 'og', 'java'))
  expect(oopDir).toContain('oop.png')
})
```

- [ ] **Step 7: Run it to confirm it fails**

Run: `npx vitest run src/seo/ogImageRender.test.ts`
Expected: FAIL — `src/seo/ogImageRender.ts` doesn't exist yet.

- [ ] **Step 8: Implement `src/seo/ogImageRender.ts`**

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { allOgImageTargets } from './ogImage'

const WIDTH = 1200
const HEIGHT = 630

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function svgTemplate(domainTitle: string, compendiumLabel: string, color: string): string {
  const safeDomainTitle = escapeXml(domainTitle)
  const safeLabel = escapeXml(compendiumLabel)
  return `<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#12141c"/>
  <rect x="0" y="0" width="24" height="${HEIGHT}" fill="${color}"/>
  <text x="80" y="120" font-family="sans-serif" font-size="32" fill="${color}" font-weight="700">${safeLabel}::Compendium</text>
  <text x="80" y="340" font-family="sans-serif" font-size="64" fill="#F5F6FA" font-weight="700">${safeDomainTitle}</text>
</svg>`
}

/** Rasterizes one PNG per domain across every compendium into <distDir>/og/<compendiumId>/<domainId>.png. */
export async function generateOgImages(distDir: string): Promise<void> {
  for (const target of allOgImageTargets()) {
    const svg = svgTemplate(target.domainTitle, target.compendiumLabel, target.color)
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
    const png = resvg.render().asPng()

    const outDir = path.join(distDir, 'og', target.compendiumId)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, `${target.domainId}.png`), png)
  }
}
```

- [ ] **Step 9: Run the test again to confirm it passes**

Run: `npx vitest run src/seo/ogImageRender.test.ts`
Expected: PASS.

- [ ] **Step 10: Re-export from `src/entry-server.tsx`**

Add near the top of `src/entry-server.tsx`, alongside the existing `getAllRoutes` re-export:

```ts
export { generateOgImages } from './seo/ogImageRender'
export { resolveOgImagePath } from './seo/ogImage'
```

- [ ] **Step 11: Run the full test suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add package.json package-lock.json src/seo/ogImage.ts src/seo/ogImage.test.ts src/seo/ogImageRender.ts src/seo/ogImageRender.test.ts src/entry-server.tsx
git commit -m "feat: generate per-domain OG images at build time"
```

---

### Task 7: `<head>` metadata + JSON-LD builder

**Files:**
- Create: `src/seo/head.ts`
- Test: `src/seo/head.test.ts`
- Modify: `src/entry-server.tsx` (re-export `buildHead`)

**Interfaces:**
- Consumes: `RouteMeta` (Task 3), `resolveOgImagePath` (Task 6).
- Produces: `buildHead(route: RouteMeta): string` — an HTML string containing `<title>`, meta description, canonical link, OG/Twitter tags, and JSON-LD `<script>` tags — consumed by Task 8.

- [ ] **Step 1: Write the failing test**

Create `src/seo/head.test.ts`:

```ts
import { buildHead } from './head'
import type { RouteMeta } from './routes'

const topicRoute: RouteMeta = {
  path: '/java/topics/collections/arraylist',
  kind: 'topic',
  title: 'ArrayList · Collections · Java::Compendium',
  description: 'A resizable-array List implementation backed by an array.',
  compendiumId: 'java',
  compendiumLabel: 'Java',
  domainId: 'collections',
  domainTitle: 'Collections',
  topicId: 'arraylist',
}

test('includes the exact title, description, and canonical URL', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('<title>ArrayList · Collections · Java::Compendium</title>')
  expect(head).toContain('content="A resizable-array List implementation backed by an array."')
  expect(head).toContain('<link rel="canonical" href="https://referencehub.dev/java/topics/collections/arraylist">')
})

test('includes Open Graph and Twitter tags pointing at the domain OG image', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('property="og:type" content="article"')
  expect(head).toContain('property="og:image" content="https://referencehub.dev/og/java/collections.png"')
  expect(head).toContain('name="twitter:card" content="summary_large_image"')
})

test('emits a TechArticle and a BreadcrumbList for a topic route', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('"@type":"TechArticle"')
  expect(head).toContain('"@type":"BreadcrumbList"')
})

test('emits an ItemList of domains for a compendium-home route', () => {
  const homeRoute: RouteMeta = {
    path: '/java',
    kind: 'compendium-home',
    title: 'Java::Compendium',
    description: 'd',
    compendiumId: 'java',
    compendiumLabel: 'Java',
    domains: [{ id: 'fundamentals', title: 'Language Fundamentals' }],
  }
  const head = buildHead(homeRoute)
  expect(head).toContain('"@type":"ItemList"')
  expect(head).toContain('Language Fundamentals')
})

test('emits only a WebSite entry (no BreadcrumbList) for the root picker route', () => {
  const pickerRoute: RouteMeta = { path: '/', kind: 'picker', title: 'Choose a Compendium · Compendium', description: 'd' }
  const head = buildHead(pickerRoute)
  expect(head).toContain('"@type":"WebSite"')
  expect(head).not.toContain('"@type":"BreadcrumbList"')
})

test('escapes HTML-special characters in title and description', () => {
  const route: RouteMeta = {
    path: '/java/topics/oop/generics-wildcards',
    kind: 'topic',
    title: 'Generics & Wildcards · OOP · Java::Compendium',
    description: 'Covers "extends" and <T> bounds.',
    compendiumId: 'java',
    compendiumLabel: 'Java',
    domainId: 'oop',
  }
  const head = buildHead(route)
  expect(head).toContain('Generics &amp; Wildcards')
  expect(head).toContain('&quot;extends&quot; and &lt;T&gt; bounds')
})
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run src/seo/head.test.ts`
Expected: FAIL — `src/seo/head.ts` doesn't exist yet.

- [ ] **Step 3: Implement `src/seo/head.ts`**

```ts
import type { RouteMeta } from './routes'
import { resolveOgImagePath } from './ogImage'

const SITE_ORIGIN = 'https://referencehub.dev'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function breadcrumbJsonLd(route: RouteMeta): object {
  const items: Array<{ '@type': 'ListItem'; position: number; name: string; item: string }> = []
  let position = 1
  items.push({ '@type': 'ListItem', position: position++, name: 'Compendium', item: `${SITE_ORIGIN}/` })

  if (route.compendiumId && route.compendiumLabel) {
    items.push({
      '@type': 'ListItem',
      position: position++,
      name: `${route.compendiumLabel}::Compendium`,
      item: `${SITE_ORIGIN}/${route.compendiumId}`,
    })
  }
  if (route.domainId && route.domainTitle && route.compendiumId) {
    items.push({
      '@type': 'ListItem',
      position: position++,
      name: route.domainTitle,
      item: `${SITE_ORIGIN}/${route.compendiumId}/topics/${route.domainId}`,
    })
  }
  items.push({ '@type': 'ListItem', position: position++, name: route.title, item: `${SITE_ORIGIN}${route.path}` })

  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items }
}

/** Builds the full <head> fragment (title, description, canonical, OG/Twitter, JSON-LD) for one
 *  route. Returned as a raw HTML string the prerender script splices into the built index.html
 *  template just before </head>. */
export function buildHead(route: RouteMeta): string {
  const canonical = `${SITE_ORIGIN}${route.path}`
  const image = `${SITE_ORIGIN}${resolveOgImagePath(route)}`
  const title = escapeHtml(route.title)
  const description = escapeHtml(route.description)

  const jsonLd: object[] = []

  if (route.kind === 'topic' || route.kind === 'class-detail') {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: route.title,
      description: route.description,
      url: canonical,
      ...(route.compendiumLabel ? { isPartOf: { '@type': 'CreativeWorkSeries', name: `${route.compendiumLabel}::Compendium` } } : {}),
      ...(route.domainTitle ? { about: route.domainTitle } : {}),
    })
  }

  if (route.kind === 'compendium-home' && route.domains && route.compendiumId) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: route.domains.map((d, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: d.title,
        url: `${SITE_ORIGIN}/${route.compendiumId}/topics/${d.id}`,
      })),
    })
  }

  if (route.kind === 'picker') {
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Compendium', url: `${SITE_ORIGIN}/` })
  } else {
    jsonLd.push(breadcrumbJsonLd(route))
  }

  const jsonLdTags = jsonLd.map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`).join('\n    ')

  return `<title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    ${jsonLdTags}`
}
```

- [ ] **Step 4: Run the test again to confirm it passes**

Run: `npx vitest run src/seo/head.test.ts`
Expected: PASS.

- [ ] **Step 5: Re-export from `src/entry-server.tsx`**

Add alongside the other re-exports in `src/entry-server.tsx`:

```ts
export { buildHead } from './seo/head'
```

- [ ] **Step 6: Run the full test suite**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/seo/head.ts src/seo/head.test.ts src/entry-server.tsx
git commit -m "feat: add per-route <head> metadata and JSON-LD builder"
```

---

### Task 8: Wire it all together — prerender script, build pipeline, robots.txt, hydration

**Files:**
- Modify: `src/main.tsx` (hydrate instead of blindly overwriting prerendered content)
- Create: `public/robots.txt`
- Create: `scripts/prerender.mjs`
- Modify: `package.json` (`build` script)

**Interfaces:**
- Consumes (at runtime, from the built SSR bundle): `getAllRoutes`, `render`, `generateOgImages`, `resolveOgImagePath`, `buildHead` — all re-exported from `src/entry-server.tsx` by Tasks 3, 4, 6, 7.

- [ ] **Step 1: Make the client entry hydrate real prerendered markup, but still work in dev**

`dist/<route>/index.html` will soon contain real server-rendered markup inside `#root`. `createRoot(...).render(...)` would discard that and re-render from scratch client-side — defeating the point for real users (a visible flash, and losing the "instant" content). Switch to `hydrateRoot`, but only when there's actually something to hydrate — in `npm run dev` (Vite dev server), `index.html`'s `#root` is still empty, and `hydrateRoot` against an empty container logs a harmless-but-noisy mismatch warning every load.

Replace the full contents of `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/space-grotesk/index.css'
import '@fontsource-variable/jetbrains-mono/index.css'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import './styles/tokens.css'
import './styles/base.css'
import App from './App'

const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
```

- [ ] **Step 2: Run the full test suite to check for regressions**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 3: Add `robots.txt`**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://referencehub.dev/sitemap.xml
```

- [ ] **Step 4: Write `scripts/prerender.mjs`**

Create `scripts/prerender.mjs`:

```js
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllRoutes, render, generateOgImages, buildHead } from '../dist-ssr/entry-server.js'

const ROOT = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(ROOT, '..', 'dist')
const SITE_ORIGIN = 'https://referencehub.dev'

async function main() {
  const template = await readFile(path.join(DIST, 'index.html'), 'utf-8')
  const routes = await getAllRoutes()

  await generateOgImages(DIST)

  const sitemapUrls = []
  for (const route of routes) {
    const html = await render(route)
    const head = buildHead(route)

    const page = template
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
      .replace(/<meta name="description"[^>]*>/, '')
      .replace(/<title>.*?<\/title>/s, '')
      .replace('</head>', `  ${head}\n  </head>`)

    const outDir = route.path === '/' ? DIST : path.join(DIST, route.path)
    await mkdir(outDir, { recursive: true })
    await writeFile(path.join(outDir, 'index.html'), page)

    sitemapUrls.push(`${SITE_ORIGIN}${route.path}`)
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`
  await writeFile(path.join(DIST, 'sitemap.xml'), sitemap)

  console.log(`Prerendered ${routes.length} routes and wrote sitemap.xml with ${sitemapUrls.length} URLs.`)
}

main()
```

- [ ] **Step 5: Wire the new steps into `package.json`'s `build` script**

In `package.json`, change:

```json
    "build": "tsc -b && vite build",
```

to:

```json
    "build": "tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs",
```

- [ ] **Step 6: Run the full build and verify the output**

Run: `npm run build`
Expected: completes without error. Then verify with:

```bash
test -f dist/sitemap.xml && echo "sitemap OK"
test -f dist/og/java/collections.png && echo "og image OK"
grep -o '<title>[^<]*</title>' dist/java/topics/collections/arraylist/index.html
grep -c 'topic-title' dist/java/topics/collections/arraylist/index.html
grep -o '<title>[^<]*</title>' dist/cs/index.html
```

Expected: `sitemap OK`, `og image OK` printed; the first `grep -o` prints a title containing "ArrayList" (not the generic "Java::Compendium"); the `grep -c` prints `1` or more (real content, not the loading placeholder); the second `grep -o` prints a **different** title containing "CS::Compendium" — confirming per-route metadata actually varies.

- [ ] **Step 7: Smoke-test the prerendered build in a real browser**

Run: `npx vite preview --port 4173` (leave running), then in another terminal:

```bash
curl -s http://localhost:4173/java/topics/collections/arraylist | grep -o '<title>[^<]*</title>'
curl -s http://localhost:4173/java/topics/collections/arraylist | grep -c 'topic-title'
```

Expected: the same per-route title and real content as Step 6, served over HTTP exactly as Cloudflare Pages would serve it. Stop the preview server afterward.

- [ ] **Step 8: Commit**

```bash
git add src/main.tsx public/robots.txt scripts/prerender.mjs package.json package-lock.json
git commit -m "feat: wire up build-time prerendering, sitemap, robots.txt, and hydration"
```

---

## Self-Review Notes

- **Spec coverage:** every locked decision and section of `docs/superpowers/specs/2026-07-09-seo-prerendering-design.md` maps to a task — architecture (Tasks 1, 2, 4, 8), per-route metadata (Task 3, 7), structured data (Task 7), OG images (Task 6), robots.txt/sitemap (Task 8), SSR safety-net test (Task 5).
- **Type consistency checked:** `RouteMeta` is defined once in Task 3 and used with identical field names (`compendiumId`, `compendiumLabel`, `domainId`, `domainTitle`, `topicId`, `fqcn`, `domains`) in Tasks 4, 6, 7, 8 — no renamed fields across tasks. `preloadTopics`/`preloadClassArea` signatures match their call sites in Task 4's `preload()` exactly.
- **CLASS_AREA_TO_DOMAIN_ID vs. spec wording:** the approved spec says OG images resolve "via its own domainId" for every topic/class page — since class-reference pages don't actually have a `domainId` in the data model (they have an unrelated `area` taxonomy), Task 3 introduces the explicit `CLASS_AREA_TO_DOMAIN_ID` mapping so class pages still resolve to one of the 32 domain images, honoring the spec's locked "32 total" image count rather than silently expanding it.
