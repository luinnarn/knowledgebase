import type { Topic } from '../../../types/content'

/** Lazy loader per domain — keeps each AI/ML domain's content in its own chunk. */
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>> = {
  "foundations": () => import('./foundations'),
  "classical-ml": () => import('./classical-ml'),
  "deep-learning": () => import('./deep-learning'),
  "llms-generative-ai": () => import('./llms-generative-ai'),
  "applied-ai-engineering": () => import('./applied-ai-engineering'),
  "production-ml": () => import('./production-ml'),
  "responsible-ai": () => import('./responsible-ai'),
}
