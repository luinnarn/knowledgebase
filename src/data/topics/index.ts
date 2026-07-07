import type { Topic } from '../../types/content'

/**
 * Lazy loader per domain — keeps each domain's content in its own chunk.
 * A domain is registered here once its content is fully authored; the
 * integrity suite then enforces an exact match with Domain.topicIds.
 */
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>> = {
  fundamentals: () => import('./fundamentals'),
}
