import { describe, it, expect, vi, afterEach } from 'vitest'
import { hydrateRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { render as ssrRender } from './entry-server'
import { getAllRoutes } from './seo/routes'
import { seedTopicsCache } from './lib/useTopics'
import { seedClassAreaCache } from './components/ClassDetail'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('hydration matches prerendered SSR output', () => {
  it('hydrates a topic route with no console errors and no loading placeholder', async () => {
    const routes = await getAllRoutes()
    const topicRoute = routes.find((r) => r.kind === 'topic' && r.compendiumId === 'java')!

    const { html, preloadedData } = await ssrRender(topicRoute)

    const container = document.createElement('div')
    container.id = 'root'
    container.innerHTML = html
    document.body.appendChild(container)

    if (preloadedData?.kind === 'topic') {
      seedTopicsCache(preloadedData.compendiumId, preloadedData.domainId, preloadedData.topics)
    }

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    hydrateRoot(
      container,
      <MemoryRouter initialEntries={[topicRoute.path]}>
        <App />
      </MemoryRouter>,
    )

    expect(errorSpy).not.toHaveBeenCalled()
    expect(container.querySelector('.topic-title')).not.toBeNull()
    expect(container.querySelector('.topic-loading')).toBeNull()

    errorSpy.mockRestore()
  })

  it('hydrates a class-detail route with no console errors and no loading placeholder', async () => {
    const routes = await getAllRoutes()
    const classRoute = routes.find((r) => r.kind === 'class-detail')!

    const { html, preloadedData } = await ssrRender(classRoute)

    const container = document.createElement('div')
    container.id = 'root'
    container.innerHTML = html
    document.body.appendChild(container)

    if (preloadedData?.kind === 'class-detail') {
      seedClassAreaCache(preloadedData.compendiumId, preloadedData.area, preloadedData.classes)
    }

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    hydrateRoot(
      container,
      <MemoryRouter initialEntries={[classRoute.path]}>
        <App />
      </MemoryRouter>,
    )

    expect(errorSpy).not.toHaveBeenCalled()
    expect(container.querySelector('.classdetail-name')).not.toBeNull()

    errorSpy.mockRestore()
  })
})
