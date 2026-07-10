// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { getAllRoutes, render } from './entry-server'

describe('SSR safety net', () => {
  it('renders every canonical route without throwing', async () => {
    const routes = await getAllRoutes()
    expect(routes.length).toBeGreaterThan(0)

    for (const route of routes) {
      try {
        const { html } = await render(route)
        expect(typeof html).toBe('string')
      } catch (error) {
        const routeInfo = [
          `path: ${route.path}`,
          `kind: ${route.kind}`,
          ...(route.domainId ? [`domainId: ${route.domainId}`] : []),
          ...(route.fqcn ? [`fqcn: ${route.fqcn}`] : []),
        ].join(', ')
        const originalMessage = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to render route (${routeInfo}): ${originalMessage}`)
      }
    }
  }, 60_000)
})
