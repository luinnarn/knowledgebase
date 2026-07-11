// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import { render } from './entry-server'
import { getAllRoutes } from './seo/routes'
import CompendiumProvider from './lib/CompendiumProvider'
import TopicView from './components/TopicView'
import type { Topic } from './types/content'

describe('entry-server render()', () => {
  it('selects the first PostgreSQL variant deterministically during SSR', () => {
    const topic: Topic = {
      id: 'dialect-fixture',
      domainId: 'fundamentals',
      title: 'Dialect fixture',
      summary: 'A sufficiently detailed summary for deterministic server rendering.',
      keyPoints: ['One', 'Two', 'Three'],
      blocks: [{
        kind: 'code',
        variants: [
          { id: 'postgresql', label: 'PostgreSQL', language: 'sql', code: 'SELECT pg_catalog.current_database();' },
          { id: 'mysql', label: 'MySQL', language: 'sql', code: 'SELECT DATABASE();' },
        ],
      }],
      refs: [{ book: 'core-java-1', chapter: 'Fixture' }],
      related: [],
    }

    const html = renderToString(
      <StaticRouter location="/java">
        <Routes>
          <Route path=":compendiumId" element={<CompendiumProvider><TopicView topic={topic} /></CompendiumProvider>} />
        </Routes>
      </StaticRouter>,
    )

    expect(html).toContain('pg_catalog.current_database')
    expect(html).toMatch(/<button[^>]*aria-selected="true"[^>]*>PostgreSQL<\/button>/)
    expect(html).not.toMatch(/<button[^>]*aria-selected="true"[^>]*>MySQL<\/button>/)
  })

  it('renders real topic content, not the loading placeholder', async () => {
    const routes = await getAllRoutes()
    const topicRoute = routes.find((r) => r.kind === 'topic' && r.compendiumId === 'java')!

    const { html } = await render(topicRoute)

    expect(html).toContain('topic-title')
    expect(html).not.toContain('topic-loading')
  })

  it('renders real class-detail content, not the loading placeholder', async () => {
    const routes = await getAllRoutes()
    const classRoute = routes.find((r) => r.kind === 'class-detail')!

    const { html } = await render(classRoute)

    expect(html).toContain('classdetail-name')
  })

  it('renders the compendium home page', async () => {
    const routes = await getAllRoutes()
    const homeRoute = routes.find((r) => r.path === '/java')!

    const { html } = await render(homeRoute)

    expect(html.length).toBeGreaterThan(0)
  })

  it('returns preloadedData for a topic route', async () => {
    const routes = await getAllRoutes()
    const topicRoute = routes.find((r) => r.kind === 'topic' && r.compendiumId === 'java')!

    const { preloadedData } = await render(topicRoute)

    expect(preloadedData?.kind).toBe('topic')
    if (preloadedData?.kind === 'topic') {
      expect(preloadedData.compendiumId).toBe('java')
      expect(preloadedData.domainId).toBe(topicRoute.domainId)
      expect(preloadedData.topics.length).toBeGreaterThan(0)
    }
  })

  it('returns preloadedData for a class-detail route', async () => {
    const routes = await getAllRoutes()
    const classRoute = routes.find((r) => r.kind === 'class-detail')!

    const { preloadedData } = await render(classRoute)

    expect(preloadedData?.kind).toBe('class-detail')
    if (preloadedData?.kind === 'class-detail') {
      expect(preloadedData.compendiumId).toBe(classRoute.compendiumId)
      expect(preloadedData.classes.length).toBeGreaterThan(0)
      expect(preloadedData.classes.some((c) => c.fqcn === classRoute.fqcn)).toBe(true)
    }
  })

  it('returns null preloadedData for a route with no lazy data', async () => {
    const routes = await getAllRoutes()
    const graphRoute = routes.find((r) => r.kind === 'graph')!

    const { preloadedData } = await render(graphRoute)

    expect(preloadedData).toBeNull()
  })
})
