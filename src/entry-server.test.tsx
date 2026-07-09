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
