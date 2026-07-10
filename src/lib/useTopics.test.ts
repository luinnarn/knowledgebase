import { renderHook } from '@testing-library/react'
import { compendiumRegistry } from '../data/registry'
import { useTopics, preloadTopics, seedTopicsCache } from './useTopics'

test('preloadTopics warms the cache so useTopics starts in the ready state', async () => {
  const domainId = compendiumRegistry.java.domains[0].id
  await preloadTopics('java', domainId, compendiumRegistry.java.topicLoaders)

  const { result } = renderHook(() => useTopics('java', compendiumRegistry.java.topicLoaders, domainId))

  expect(result.current.status).toBe('ready')
})

test('preloadTopics returns the topics array on both the fresh-load and already-cached paths', async () => {
  const domainId = compendiumRegistry.java.domains[1].id
  const first = await preloadTopics('java', domainId, compendiumRegistry.java.topicLoaders)
  expect(first).toBeDefined()
  expect(first!.length).toBeGreaterThan(0)

  const second = await preloadTopics('java', domainId, compendiumRegistry.java.topicLoaders)
  expect(second).toBe(first)
})

test('seedTopicsCache seeds the cache synchronously so useTopics is immediately ready, with no loader called', () => {
  const domainId = compendiumRegistry.java.domains[2].id
  const fakeTopics = [
    {
      id: 'seeded-topic',
      domainId,
      title: 'Seeded',
      summary: 'seeded summary',
      keyPoints: [],
      blocks: [],
      refs: [],
      related: [],
    },
  ]

  const loaders = {
    ...compendiumRegistry.java.topicLoaders,
    [domainId]: async () => {
      throw new Error('loader should never be called after seeding')
    },
  }

  seedTopicsCache('java', domainId, fakeTopics)

  const { result } = renderHook(() => useTopics('java', loaders, domainId))

  expect(result.current).toEqual({ status: 'ready', topics: fakeTopics })
})
