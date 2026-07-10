import type { GraphNode, GraphEdge } from '../../types/content'
import { domains } from './domains'

type TopicNodeSpec = [id: string, label: string, importance: 1 | 2 | 3]

const topicNodeSpecs: Record<string, TopicNodeSpec[]> = {
  'sd-foundations': [
    ['scalability-fundamentals', 'Scalability Fundamentals', 3],
    ['back-of-envelope-estimation', 'Back-of-Envelope Estimation', 3],
    ['cap-theorem', 'CAP Theorem', 3],
    ['consistency-models', 'Consistency Models', 3],
    ['availability-and-slas', 'Availability & SLAs', 2],
  ],
  'sd-networking': [
    ['dns-resolution', 'DNS Resolution', 2],
    ['load-balancing', 'Load Balancing', 3],
    ['api-gateways-and-service-discovery', 'API Gateways & Service Discovery', 2],
    ['content-delivery-networks', 'CDNs', 2],
    ['communication-protocols-for-services', 'Service Communication Protocols', 2],
  ],
  'sd-iam': [
    ['authentication-fundamentals', 'Authentication Fundamentals', 3],
    ['oauth2-and-openid-connect', 'OAuth 2.0 & OIDC', 3],
    ['sso-and-identity-federation', 'SSO & Identity Federation', 2],
    ['token-based-sessions-and-jwts', 'Token-Based Sessions & JWTs', 3],
    ['authorization-models', 'Authorization Models', 3],
    ['api-and-service-to-service-auth', 'API & Service-to-Service Auth', 2],
    ['zero-trust-architecture', 'Zero Trust Architecture', 2],
    ['secrets-management-and-credential-storage', 'Secrets Management', 2],
  ],
  'sd-caching': [
    ['caching-fundamentals', 'Caching Fundamentals', 3],
    ['cache-invalidation-strategies', 'Cache Invalidation', 3],
    ['distributed-caching-systems', 'Distributed Caching', 2],
    ['cache-stampede-and-hot-keys', 'Cache Stampede & Hot Keys', 1],
    ['write-through-vs-write-back', 'Write-Through vs Write-Back', 2],
  ],
  'sd-databases': [
    ['sql-vs-nosql', 'SQL vs NoSQL', 3],
    ['database-replication', 'Database Replication', 3],
    ['database-sharding-and-partitioning', 'Sharding & Partitioning', 3],
    ['indexing-at-scale', 'Indexing at Scale', 2],
    ['transactions-and-isolation-levels', 'Transactions & Isolation', 2],
    ['polyglot-persistence', 'Polyglot Persistence', 1],
  ],
  'sd-messaging': [
    ['message-queues', 'Message Queues', 3],
    ['publish-subscribe-systems', 'Publish-Subscribe', 2],
    ['event-driven-architecture', 'Event-Driven Architecture', 3],
    ['stream-processing', 'Stream Processing', 2],
    ['batch-vs-stream-processing', 'Batch vs Stream', 2],
    ['exactly-once-and-idempotency', 'Exactly-Once & Idempotency', 2],
  ],
  'sd-distributed-theory': [
    ['consensus-algorithms', 'Consensus Algorithms', 3],
    ['distributed-transactions', 'Distributed Transactions', 2],
    ['quorum-systems', 'Quorum Systems', 2],
    ['clock-synchronization-and-ordering', 'Clocks & Ordering', 2],
    ['distributed-locking', 'Distributed Locking', 2],
    ['gossip-protocols', 'Gossip Protocols', 1],
  ],
  'sd-reliability': [
    ['fault-tolerance-patterns', 'Fault Tolerance Patterns', 3],
    ['circuit-breakers-and-retries', 'Circuit Breakers & Retries', 3],
    ['rate-limiting-algorithms', 'Rate-Limiting Algorithms', 2],
    ['bulkheads-and-isolation', 'Bulkheads & Isolation', 2],
    ['chaos-engineering', 'Chaos Engineering', 1],
    ['graceful-degradation-and-load-shedding', 'Graceful Degradation', 2],
  ],
  'sd-scalability-patterns': [
    ['horizontal-vs-vertical-scaling', 'Horizontal vs Vertical Scaling', 3],
    ['stateless-services-and-session-management', 'Stateless Services', 2],
    ['microservices-vs-monolith', 'Microservices vs Monolith', 3],
    ['service-mesh', 'Service Mesh', 1],
    ['multi-region-architecture', 'Multi-Region Architecture', 2],
    ['api-versioning-and-evolution', 'API Versioning', 1],
  ],
  'sd-observability': [
    ['monitoring-and-metrics', 'Monitoring & Metrics', 3],
    ['logging-and-distributed-tracing', 'Logging & Distributed Tracing', 2],
    ['alerting-and-on-call', 'Alerting & On-Call', 2],
    ['capacity-planning', 'Capacity Planning', 2],
    ['incident-management-and-postmortems', 'Incident Management', 2],
  ],
  'sd-case-studies': [
    ['designing-a-url-shortener', 'URL Shortener', 2],
    ['designing-a-chat-system', 'Chat System', 2],
    ['designing-a-news-feed', 'News Feed', 2],
    ['designing-a-distributed-cache', 'Distributed Cache', 2],
    ['designing-a-rate-limiter-service', 'Rate Limiter Service', 2],
    ['designing-a-search-autocomplete', 'Search Autocomplete', 1],
    ['designing-a-notification-system', 'Notification System', 1],
  ],
}

const hubId = (domainId: string) => `d-${domainId}`

const hubNodes: GraphNode[] = domains.map((d) => ({
  id: hubId(d.id),
  label: d.title,
  domainId: d.id,
  importance: 3,
  kind: 'domain',
}))

const topicNodes: GraphNode[] = Object.entries(topicNodeSpecs).flatMap(([domainId, specs]) =>
  specs.map(([id, label, importance]) => ({ id, label, domainId, importance, kind: 'topic' as const })),
)

export const graphNodes: GraphNode[] = [...hubNodes, ...topicNodes]

const partOfEdges: GraphEdge[] = topicNodes.map((n) => ({
  source: n.id,
  target: hubId(n.domainId),
  type: 'part-of',
}))

/** [source, target] — source should be learned before target. */
const prerequisites: Array<[string, string]> = [
  ['scalability-fundamentals', 'back-of-envelope-estimation'],
  ['scalability-fundamentals', 'horizontal-vs-vertical-scaling'],
  ['cap-theorem', 'consistency-models'],
  ['consistency-models', 'database-replication'],
  ['dns-resolution', 'load-balancing'],
  ['load-balancing', 'api-gateways-and-service-discovery'],
  ['caching-fundamentals', 'cache-invalidation-strategies'],
  ['caching-fundamentals', 'distributed-caching-systems'],
  ['sql-vs-nosql', 'database-sharding-and-partitioning'],
  ['database-replication', 'database-sharding-and-partitioning'],
  ['message-queues', 'publish-subscribe-systems'],
  ['message-queues', 'event-driven-architecture'],
  ['event-driven-architecture', 'stream-processing'],
  ['consensus-algorithms', 'distributed-transactions'],
  ['quorum-systems', 'distributed-locking'],
  ['fault-tolerance-patterns', 'circuit-breakers-and-retries'],
  ['circuit-breakers-and-retries', 'bulkheads-and-isolation'],
  ['rate-limiting-algorithms', 'designing-a-rate-limiter-service'],
  ['caching-fundamentals', 'designing-a-distributed-cache'],
  ['distributed-caching-systems', 'designing-a-distributed-cache'],
  ['database-sharding-and-partitioning', 'designing-a-url-shortener'],
  ['message-queues', 'designing-a-chat-system'],
  ['event-driven-architecture', 'designing-a-news-feed'],
  ['monitoring-and-metrics', 'alerting-and-on-call'],
  ['alerting-and-on-call', 'incident-management-and-postmortems'],
  ['authentication-fundamentals', 'oauth2-and-openid-connect'],
  ['oauth2-and-openid-connect', 'sso-and-identity-federation'],
  ['oauth2-and-openid-connect', 'token-based-sessions-and-jwts'],
  ['authorization-models', 'api-and-service-to-service-auth'],
]

/** Cross-domain and intra-domain conceptual links. */
const related: Array<[string, string]> = [
  ['availability-and-slas', 'monitoring-and-metrics'],
  ['cap-theorem', 'quorum-systems'],
  ['consistency-models', 'distributed-transactions'],
  ['back-of-envelope-estimation', 'capacity-planning'],
  ['content-delivery-networks', 'caching-fundamentals'],
  ['communication-protocols-for-services', 'service-mesh'],
  ['transactions-and-isolation-levels', 'distributed-transactions'],
  ['polyglot-persistence', 'sql-vs-nosql'],
  ['stream-processing', 'batch-vs-stream-processing'],
  ['exactly-once-and-idempotency', 'message-queues'],
  ['clock-synchronization-and-ordering', 'consensus-algorithms'],
  ['distributed-locking', 'consensus-algorithms'],
  ['gossip-protocols', 'distributed-caching-systems'],
  ['chaos-engineering', 'fault-tolerance-patterns'],
  ['graceful-degradation-and-load-shedding', 'rate-limiting-algorithms'],
  ['microservices-vs-monolith', 'service-mesh'],
  ['service-mesh', 'api-gateways-and-service-discovery'],
  ['multi-region-architecture', 'database-replication'],
  ['multi-region-architecture', 'consistency-models'],
  ['api-versioning-and-evolution', 'api-gateways-and-service-discovery'],
  ['logging-and-distributed-tracing', 'microservices-vs-monolith'],
  ['capacity-planning', 'horizontal-vs-vertical-scaling'],
  ['designing-a-url-shortener', 'back-of-envelope-estimation'],
  ['designing-a-chat-system', 'publish-subscribe-systems'],
  ['designing-a-news-feed', 'caching-fundamentals'],
  ['designing-a-search-autocomplete', 'indexing-at-scale'],
  ['designing-a-notification-system', 'message-queues'],
  ['designing-a-rate-limiter-service', 'distributed-caching-systems'],
  ['stateless-services-and-session-management', 'horizontal-vs-vertical-scaling'],
  ['write-through-vs-write-back', 'cache-invalidation-strategies'],
  ['cache-stampede-and-hot-keys', 'rate-limiting-algorithms'],
  ['authentication-fundamentals', 'token-based-sessions-and-jwts'],
  ['authentication-fundamentals', 'rate-limiting-algorithms'],
  ['authentication-fundamentals', 'sso-and-identity-federation'],
  ['authentication-fundamentals', 'authorization-models'],
  ['oauth2-and-openid-connect', 'api-and-service-to-service-auth'],
  ['sso-and-identity-federation', 'authorization-models'],
  ['authorization-models', 'zero-trust-architecture'],
  ['api-and-service-to-service-auth', 'zero-trust-architecture'],
  ['secrets-management-and-credential-storage', 'api-and-service-to-service-auth'],
  ['secrets-management-and-credential-storage', 'zero-trust-architecture'],
  ['secrets-management-and-credential-storage', 'token-based-sessions-and-jwts'],
  ['api-and-service-to-service-auth', 'service-mesh'],
  ['api-and-service-to-service-auth', 'api-gateways-and-service-discovery'],
  ['zero-trust-architecture', 'microservices-vs-monolith'],
  ['token-based-sessions-and-jwts', 'stateless-services-and-session-management'],
]

export const graphEdges: GraphEdge[] = [
  ...partOfEdges,
  ...prerequisites.map(([source, target]): GraphEdge => ({ source, target, type: 'prerequisite-of' })),
  ...related.map(([source, target]): GraphEdge => ({ source, target, type: 'related-to' })),
]
