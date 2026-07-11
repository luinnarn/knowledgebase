import type { Topic } from '../../../types/content'

type TopicModule = { topics: Topic[] }

/** Lazy loader per domain — keeps each database domain in its own content chunk. */
export const topicLoaders: Record<string, () => Promise<TopicModule>> = {
  'db-foundations': () => import('./db-foundations').then(({ dbFoundationTopics }) => ({ topics: dbFoundationTopics })),
  'db-modeling': () => import('./db-modeling').then(({ dbModelingTopics }) => ({ topics: dbModelingTopics })),
  'db-sql': () => import('./db-sql').then(({ dbSqlTopics }) => ({ topics: dbSqlTopics })),
  'db-advanced-sql': () => import('./db-advanced-sql').then(({ dbAdvancedSqlTopics }) => ({ topics: dbAdvancedSqlTopics })),
  'db-schema-objects': () => import('./db-schema-objects').then(({ dbSchemaObjectsTopics }) => ({ topics: dbSchemaObjectsTopics })),
  'db-transactions': () => import('./db-transactions').then(({ dbTransactionsTopics }) => ({ topics: dbTransactionsTopics })),
  'db-performance': () => import('./db-performance').then(({ dbPerformanceTopics }) => ({ topics: dbPerformanceTopics })),
  'db-internals': () => import('./db-internals').then(({ dbInternalsTopics }) => ({ topics: dbInternalsTopics })),
  'db-applications': () => import('./db-applications').then(({ dbApplicationsTopics }) => ({ topics: dbApplicationsTopics })),
  'db-operations': () => import('./db-operations').then(({ dbOperationsTopics }) => ({ topics: dbOperationsTopics })),
  'db-dialects': () => import('./db-dialects').then(({ dbDialectsTopics }) => ({ topics: dbDialectsTopics })),
  'db-postgresql': () => import('./db-postgresql').then(({ dbPostgresqlTopics }) => ({ topics: dbPostgresqlTopics })),
}
