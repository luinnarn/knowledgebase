import { renderHook } from '@testing-library/react'
import { compendiumRegistry } from '../data/registry'
import { useTopics, preloadTopics } from './useTopics'

test('preloadTopics warms the cache so useTopics starts in the ready state', async () => {
  const domainId = compendiumRegistry.java.domains[0].id
  await preloadTopics('java', domainId, compendiumRegistry.java.topicLoaders)

  const { result } = renderHook(() => useTopics('java', compendiumRegistry.java.topicLoaders, domainId))

  expect(result.current.status).toBe('ready')
})
