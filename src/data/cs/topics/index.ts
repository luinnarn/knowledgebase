import type { Topic } from '../../../types/content'

/**
 * Lazy loader per domain — keeps each domain's content in its own chunk.
 * A domain is registered here once its content is fully authored; the
 * integrity suite then enforces an exact match with Domain.topicIds.
 */
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>> = {
  'algo-foundations': () => import('./algo-foundations'),
  'core-data-structures': () => import('./core-data-structures'),
  'sorting-searching': () => import('./sorting-searching'),
  'graph-algorithms': () => import('./graph-algorithms'),
  'algorithm-design': () => import('./algorithm-design'),
  'interview-patterns': () => import('./interview-patterns'),
  'design-patterns': () => import('./design-patterns'),
  'architecture-principles': () => import('./architecture-principles'),
  'refactoring-quality': () => import('./refactoring-quality'),
  'craftsmanship-practice': () => import('./craftsmanship-practice'),
}
