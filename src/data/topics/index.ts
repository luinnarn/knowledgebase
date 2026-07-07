import type { Topic } from '../../types/content'

/** Lazy loader per domain — keeps each domain's content in its own chunk. */
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>> = {
  fundamentals: () => import('./fundamentals'),
}
