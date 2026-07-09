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
