import type { GraphEdge, GraphNode } from '../../types/content'
import { domains } from './domains'

const labelOverrides: Record<string, string> = {
  acid: 'ACID',
  aries: 'ARIES',
  bcnf: 'BCNF',
  cte: 'CTE',
  ddl: 'DDL',
  json: 'JSON',
  jsonb: 'JSONB',
  mvcc: 'MVCC',
  sql: 'SQL',
  uuid: 'UUID',
  wal: 'WAL',
}

function topicLabel(id: string): string {
  return id
    .split('-')
    .map((word) => labelOverrides[word] ?? `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

const hubNodes: GraphNode[] = domains.map((domain) => ({
  id: `d-${domain.id}`,
  label: domain.title,
  domainId: domain.id,
  importance: 3,
  kind: 'domain',
}))

const topicNodes: GraphNode[] = domains.flatMap((domain) =>
  domain.topicIds.map((id, index) => ({
    id,
    label: topicLabel(id),
    domainId: domain.id,
    importance: index < 3 ? 3 : index < 7 ? 2 : 1,
    kind: 'topic' as const,
  })),
)

export const graphNodes: GraphNode[] = [...hubNodes, ...topicNodes]

const partOfEdges: GraphEdge[] = topicNodes.map(({ id, domainId }) => ({
  source: id,
  target: `d-${domainId}`,
  type: 'part-of',
}))

const prerequisites: Array<[string, string]> = [
  ['relational-model', 'conceptual-logical-physical-models'],
  ['relations-tuples-attributes-domains', 'entity-relationship-modeling'],
  ['keys-and-identity', 'functional-dependencies'],
  ['functional-dependencies', 'normalization-through-bcnf'],
  ['normalization-through-bcnf', 'higher-normal-forms-and-decomposition'],
  ['entity-relationship-modeling', 'joins'],
  ['relational-algebra', 'logical-query-processing'],
  ['nulls-and-three-valued-logic', 'exists-in-and-null-traps'],
  ['set-vs-bag-semantics', 'set-operations'],
  ['logical-query-processing', 'select-expressions-and-filtering'],
  ['select-expressions-and-filtering', 'joins'],
  ['joins', 'subqueries-and-correlation'],
  ['joins', 'grouping-and-aggregation'],
  ['insert-update-delete', 'merge-upsert-and-returning'],
  ['insert-update-delete', 'transactions-and-acid'],
  ['subqueries-and-correlation', 'common-table-expressions'],
  ['common-table-expressions', 'recursive-queries'],
  ['grouping-and-aggregation', 'window-functions'],
  ['window-functions', 'advanced-window-patterns'],
  ['joins', 'lateral-joins-and-apply'],
  ['grouping-and-aggregation', 'grouping-sets-rollup-and-cube'],
  ['entity-relationship-modeling', 'primary-unique-and-check-constraints'],
  ['keys-and-identity', 'primary-unique-and-check-constraints'],
  ['primary-unique-and-check-constraints', 'foreign-keys-and-referential-actions'],
  ['relations-tuples-attributes-domains', 'numeric-types-and-precision'],
  ['transactions-and-acid', 'isolation-levels-and-anomalies'],
  ['histories-schedules-and-serializability', 'serializable-transactions'],
  ['isolation-levels-and-anomalies', 'read-committed-and-repeatable-read'],
  ['isolation-levels-and-anomalies', 'snapshot-isolation-and-write-skew'],
  ['locking-and-two-phase-locking', 'deadlocks-contention-and-retries'],
  ['mvcc', 'snapshot-isolation-and-write-skew'],
  ['transactions-and-acid', 'application-concurrency-and-transaction-boundaries'],
  ['select-expressions-and-filtering', 'index-mental-model'],
  ['index-mental-model', 'b-tree-indexes'],
  ['b-tree-indexes', 'composite-indexes'],
  ['composite-indexes', 'covering-and-index-only-scans'],
  ['selectivity-cardinality-and-statistics', 'cost-based-query-planning'],
  ['sargability-and-query-shape', 'explain-and-performance-methodology'],
  ['cost-based-query-planning', 'join-sort-and-aggregation-algorithms'],
  ['cost-based-query-planning', 'query-lifecycle-and-iterator-execution'],
  ['database-system-architecture', 'query-lifecycle-and-iterator-execution'],
  ['pages-records-and-file-layout', 'heap-clustered-and-index-organized-storage'],
  ['pages-records-and-file-layout', 'buffer-pools-and-caching'],
  ['write-ahead-logging-and-checkpoints', 'aries-and-crash-recovery'],
  ['mvcc', 'space-reclamation-and-maintenance'],
  ['connections-sessions-and-protocols', 'connection-pooling'],
  ['select-expressions-and-filtering', 'prepared-statements-and-parameter-binding'],
  ['prepared-statements-and-parameter-binding', 'sql-injection-and-query-safety'],
  ['transactions-and-acid', 'application-transaction-design'],
  ['joins', 'n-plus-one-and-data-access-shape'],
  ['application-transaction-design', 'schema-migrations-and-database-testing'],
  ['connection-pooling', 'database-observability'],
  ['roles-privileges-and-least-authority', 'row-level-security-and-data-boundaries'],
  ['roles-privileges-and-least-authority', 'encryption-secrets-and-auditing'],
  ['write-ahead-logging-and-checkpoints', 'backup-restore-and-recovery-objectives'],
  ['backup-restore-and-recovery-objectives', 'point-in-time-recovery'],
  ['explain-and-performance-methodology', 'slow-query-and-incident-diagnosis'],
  ['database-system-architecture', 'database-observability'],
  ['write-ahead-logging-and-checkpoints', 'replication-and-read-scaling'],
  ['replication-and-read-scaling', 'failover-disaster-recovery-and-reliability'],
  ['sql-vs-the-relational-model', 'sql-portability-strategy'],
  ['sql-portability-strategy', 'identifiers-quoting-and-name-resolution'],
  ['numeric-types-and-precision', 'type-and-generated-value-differences'],
  ['merge-upsert-and-returning', 'pagination-upsert-and-returning-differences'],
  ['nulls-and-three-valued-logic', 'null-boolean-collation-and-expression-differences'],
  ['isolation-levels-and-anomalies', 'transaction-and-ddl-differences'],
  ['database-system-architecture', 'postgresql-architecture'],
  ['json-arrays-and-composite-data', 'postgresql-types-jsonb-and-extensions'],
  ['mvcc', 'postgresql-mvcc-and-snapshots'],
  ['space-reclamation-and-maintenance', 'postgresql-vacuum-freezing-and-bloat'],
  ['non-btree-indexes', 'postgresql-index-families'],
  ['cost-based-query-planning', 'postgresql-planner-and-explain'],
  ['write-ahead-logging-and-checkpoints', 'postgresql-wal-backup-and-replication'],
  ['database-observability', 'postgresql-locks-monitoring-and-production-diagnostics'],
]

const related: Array<[string, string]> = [
  ['keys-and-identity', 'primary-unique-and-check-constraints'],
  ['mvcc', 'postgresql-vacuum-freezing-and-bloat'],
  ['b-tree-indexes', 'cost-based-query-planning'],
  ['write-ahead-logging-and-checkpoints', 'point-in-time-recovery'],
  ['write-ahead-logging-and-checkpoints', 'replication-and-read-scaling'],
  ['orm-impedance-mismatch', 'n-plus-one-and-data-access-shape'],
  ['schema-migrations-and-database-testing', 'transaction-and-ddl-differences'],
  ['capacity-maintenance-and-data-lifecycle', 'space-reclamation-and-maintenance'],
  ['choosing-a-relational-database', 'sql-portability-strategy'],
]

export const graphEdges: GraphEdge[] = [
  ...partOfEdges,
  ...prerequisites.map(([source, target]): GraphEdge => ({ source, target, type: 'prerequisite-of' })),
  ...related.map(([source, target]): GraphEdge => ({ source, target, type: 'related-to' })),
]
