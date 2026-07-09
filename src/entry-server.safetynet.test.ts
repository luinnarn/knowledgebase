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
