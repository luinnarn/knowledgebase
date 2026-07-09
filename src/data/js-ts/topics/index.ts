import type { Topic } from '../../../types/content'

/** Lazy loader per domain — keeps each JS/TS domain's content in its own chunk. */
export const topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>> = {
  "js-runtime": () => import('./js-runtime'),
  "functions-scope-objects": () => import('./functions-scope-objects'),
  "async-js": () => import('./async-js'),
  "ts-fundamentals": () => import('./ts-fundamentals'),
  "advanced-typescript": () => import('./advanced-typescript'),
  "modules-runtime-tooling": () => import('./modules-runtime-tooling'),
  "testing-quality": () => import('./testing-quality'),
}
