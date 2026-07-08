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
