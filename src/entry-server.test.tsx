// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { render } from './entry-server'
import { getAllRoutes } from './seo/routes'

describe('entry-server render()', () => {
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
