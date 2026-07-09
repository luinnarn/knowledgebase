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
