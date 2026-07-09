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
): Promise<void> {
  const key = `${compendiumId}:${domainId}`
  if (cache.has(key)) return
  const loader = topicLoaders[domainId]
  if (!loader) return
  const { topics } = await loader()
  cache.set(key, topics)
}
