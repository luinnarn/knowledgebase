import { useEffect, useState } from 'react'
import type { Topic } from '../types/content'
import { topicLoaders } from '../data/topics/index'

const cache = new Map<string, Topic[]>()

export type TopicsState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; topics: Topic[] }

/** Loads (and caches) a domain's topics via its lazy chunk. */
export function useTopics(domainId: string | undefined): TopicsState {
  const [state, setState] = useState<TopicsState>(() => {
    if (!domainId || !topicLoaders[domainId]) return { status: 'unavailable' }
    const hit = cache.get(domainId)
    return hit ? { status: 'ready', topics: hit } : { status: 'loading' }
  })

  useEffect(() => {
    if (!domainId) return
    const loader = topicLoaders[domainId]
    if (!loader) {
      setState({ status: 'unavailable' })
      return
    }
    const hit = cache.get(domainId)
    if (hit) {
      setState({ status: 'ready', topics: hit })
      return
    }
    let cancelled = false
    setState({ status: 'loading' })
    loader().then(({ topics }) => {
      cache.set(domainId, topics)
      if (!cancelled) setState({ status: 'ready', topics })
    })
    return () => {
      cancelled = true
    }
  }, [domainId])

  return state
}
