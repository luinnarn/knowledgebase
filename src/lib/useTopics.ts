import { useEffect, useState } from 'react'
import type { Topic } from '../types/content'

const cache = new Map<string, Topic[]>()

export type TopicsState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; topics: Topic[] }

/** Loads (and caches) a domain's topics via its lazy chunk, scoped to a compendium. */
export function useTopics(
  compendiumId: string,
  topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>>,
  domainId: string | undefined,
): TopicsState {
  const key = domainId ? `${compendiumId}:${domainId}` : ''
  const [state, setState] = useState<TopicsState>(() => {
    if (!domainId || !topicLoaders[domainId]) return { status: 'unavailable' }
    const hit = cache.get(key)
    return hit ? { status: 'ready', topics: hit } : { status: 'loading' }
  })

  useEffect(() => {
    if (!domainId) return
    const loader = topicLoaders[domainId]
    if (!loader) {
      setState({ status: 'unavailable' })
      return
    }
    const hit = cache.get(key)
    if (hit) {
      setState({ status: 'ready', topics: hit })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    loader().then(({ topics }) => {
      cache.set(key, topics)
      if (!cancelled) setState({ status: 'ready', topics })
    })
    return () => {
      cancelled = true
    }
  }, [key, domainId, topicLoaders])

  return state
}

/** Pre-warms the module cache for a compendium+domain so the next render of useTopics for that
 *  key starts in the 'ready' state synchronously, instead of 'loading' (which only resolves via
 *  a useEffect — useful for SSR, where effects never run during the single render pass). */
export async function preloadTopics(
  compendiumId: string,
  domainId: string,
  topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>>,
): Promise<Topic[] | undefined> {
  const key = `${compendiumId}:${domainId}`
  const hit = cache.get(key)
  if (hit) return hit
  const loader = topicLoaders[domainId]
  if (!loader) return undefined
  const { topics } = await loader()
  cache.set(key, topics)
  return topics
}

/** Synchronously seeds the cache from already-known data (e.g. a serialized SSR preload payload
 *  read on the client), skipping the async loader entirely — used to make the client's first
 *  render match prerendered HTML instead of starting from an empty cache. */
export function seedTopicsCache(compendiumId: string, domainId: string, topics: Topic[]): void {
  cache.set(`${compendiumId}:${domainId}`, topics)
}
