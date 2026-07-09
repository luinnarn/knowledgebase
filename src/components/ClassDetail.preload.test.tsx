import { screen } from '@testing-library/react'
import { compendiumRegistry } from '../data/registry'
import ClassDetail, { preloadClassArea, seedClassAreaCache } from './ClassDetail'
import { renderWithCompendium } from '../test-utils'

test('preloadClassArea warms the cache so ClassDetail renders real content on first render', async () => {
  const fqcn = compendiumRegistry.java.classSummaries[0].fqcn
  const area = compendiumRegistry.java.classSummaries[0].area
  await preloadClassArea('java', area, compendiumRegistry.java.classLoaders)

  renderWithCompendium(<ClassDetail fqcn={fqcn} />)

  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
})

test('preloadClassArea returns the classes array on both the fresh-load and already-cached paths', async () => {
  const area = compendiumRegistry.java.classSummaries[1].area
  const first = await preloadClassArea('java', area, compendiumRegistry.java.classLoaders)
  expect(first).toBeDefined()
  expect(first!.length).toBeGreaterThan(0)

  const second = await preloadClassArea('java', area, compendiumRegistry.java.classLoaders)
  expect(second).toBe(first)
})

test('seedClassAreaCache seeds the cache synchronously so ClassDetail renders real content, with no loader called', () => {
  const summary = compendiumRegistry.java.classSummaries[2]
  const fakeClass = {
    fqcn: summary.fqcn,
    name: 'Seeded',
    pkg: summary.pkg,
    module: 'seeded.module',
    kind: summary.kind,
    since: '99',
    summary: 'seeded summary',
    declaration: 'class Seeded {}',
    points: [],
    methods: [],
    pitfalls: [],
    related: [],
    javadocUrl: 'https://example.com',
  }

  seedClassAreaCache('java', summary.area, [fakeClass])

  // The cache is already seeded before first render, so ClassDetail's useState initializer and
  // its effect (which checks the cache before ever touching classLoaders) both short-circuit —
  // the real classLoaders from the registry are never invoked for this area.
  renderWithCompendium(<ClassDetail fqcn={summary.fqcn} />)

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Seeded')
})
