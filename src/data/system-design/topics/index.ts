import type { Topic } from '../../../types/content'

/**
 * Lazy loader per domain — keeps each domain's content in its own chunk.
 * A domain is registered here once its content is fully authored; the
 * integrity suite then enforces an exact match with Domain.topicIds.
 */
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>> = {
  'sd-foundations': () => import('./sd-foundations'),
  'sd-networking': () => import('./sd-networking'),
  'sd-iam': () => import('./sd-iam'),
  'sd-caching': () => import('./sd-caching'),
  'sd-databases': () => import('./sd-databases'),
  'sd-messaging': () => import('./sd-messaging'),
  'sd-distributed-theory': () => import('./sd-distributed-theory'),
  'sd-reliability': () => import('./sd-reliability'),
  'sd-scalability-patterns': () => import('./sd-scalability-patterns'),
  'sd-observability': () => import('./sd-observability'),
  'sd-case-studies': () => import('./sd-case-studies'),
}
