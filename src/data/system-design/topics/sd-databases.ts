import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'sql-vs-nosql',
    domainId: 'sd-databases',
    title: 'SQL vs NoSQL',
    summary:
      'Relational databases buy you joins, ad-hoc queries, and strong transactional guarantees at the cost of rigid schemas and harder horizontal scaling. NoSQL trades those guarantees for flexible schemas and near-linear write scaling — the choice is about your access patterns, not which one is "better."',
    keyPoints: [
      'Relational (SQL): fixed schema, joins across tables, ACID transactions, vertical scaling is the path of least resistance',
      'NoSQL is not one thing: document stores (MongoDB), key-value (DynamoDB, Redis), wide-column (Cassandra), and graph (Neo4j) solve different problems',
      'NoSQL systems typically favor denormalization — data duplicated across documents so a single read hits one partition instead of joining across many',
      '"Schemaless" does not mean "no schema" — it means the schema lives in application code instead of the database, so migrations become a runtime concern',
      'NewSQL (CockroachDB, Spanner) blurs the line: relational semantics with horizontal scaling, at the cost of higher operational complexity',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Choosing along the dimensions that actually matter',
        headers: ['Dimension', 'SQL (relational)', 'NoSQL'],
        rows: [
          ['Schema', 'Fixed, enforced at write time', 'Flexible, enforced (or not) in application code'],
          ['Relationships', 'Joins across normalized tables', 'Denormalized — related data embedded together'],
          ['Consistency', 'ACID transactions by default', 'Often eventual; strong consistency is opt-in and costly'],
          ['Scaling', 'Vertical first; horizontal needs sharding', 'Horizontal scaling is the default design point'],
          ['Query flexibility', 'Ad-hoc queries via SQL', 'Access patterns often must be designed in upfront'],
        ],
      },
      {
        kind: 'diagram',
        title: 'A rough decision path',
        code: 'flowchart TD\n  A[Need multi-row ACID transactions or ad-hoc joins?] -->|Yes| B[SQL]\n  A -->|No| C[Access pattern known and simple, e.g. get-by-key?]\n  C -->|Yes| D[NoSQL key-value or document store]\n  C -->|No, complex relationships| E[SQL or a graph database]\n  D --> F[Need massive write throughput across many nodes?]\n  F -->|Yes| G[Wide-column store, e.g. Cassandra]\n  F -->|No| H[Document or key-value store]',
        caption: 'A starting heuristic, not a rulebook — real systems often use both (see [[polyglot-persistence]])',
      },
      {
        kind: 'paragraph',
        text: 'The deepest difference is not the query language, it is where the schema lives and when it is enforced. A relational database rejects a malformed row at insert time; a document store will happily store it, and the very first sign of trouble is an NPE deep in application code reading a field that some documents never had. This is a real cost, not a convenience — schema migrations that a relational database handles as a single `ALTER TABLE` become an application-level "handle both the old and new shape" problem that can live in the codebase for years.',
      },
      {
        kind: 'code',
        title: 'The same relationship, modeled two ways',
        code: '// Relational: normalized, joined at query time\n// orders(id, customer_id, total)\n// order_items(id, order_id, sku, qty)\nclass OrderRepository {\n    List<OrderItem> findItems(long orderId, Connection conn) throws SQLException {\n        String sql = "SELECT sku, qty FROM order_items WHERE order_id = ?";\n        try (PreparedStatement ps = conn.prepareStatement(sql)) {\n            ps.setLong(1, orderId);\n            // ...map ResultSet rows to OrderItem\n            return List.of(); // illustrative\n        }\n    }\n}\n\n// Document store: denormalized, the whole order is one document\n// { "_id": "order-123", "customerId": "c-9", "total": 42.50,\n//   "items": [{ "sku": "A1", "qty": 2 }, { "sku": "B7", "qty": 1 }] }\n// One read returns everything; no join, but every order duplicates\n// whatever customer/item data it embedded at write time.',
        caption: 'The document model trades a join for duplicated, possibly-stale embedded data',
      },
      {
        kind: 'pitfall',
        title: '"Schemaless" is a promise the application has to keep instead',
        text: 'A document store with no schema enforcement will store a document missing a field, with the wrong type, or with a field renamed in a later deploy — and it will not tell you. Every reader has to defensively handle documents shaped like every version of the schema that has ever existed in production, forever, unless a backfill migration is run. This is the real cost hiding behind "flexible schema."',
      },
      {
        kind: 'bestPractice',
        title: 'Default to SQL; reach for NoSQL when you can name the reason',
        text: 'Relational databases handle far more workloads well than their reputation suggests — including reasonably large scale with read replicas and sharding. Choose NoSQL when you have a concrete, named requirement it solves better: a genuinely simple key-value access pattern at extreme write volume, a document shape that maps 1:1 to how you always read it, or graph traversal queries that would be miserable as recursive SQL joins.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 2 — Data Models and Query Languages' },
      { book: 'database-internals', chapter: 'Part I — Storage Engines' },
      { book: 'sdi-vol1', chapter: 'Ch. 6 — Data Store Selection' },
    ],
    related: ['polyglot-persistence', 'database-sharding-and-partitioning', 'transactions-and-isolation-levels'],
  },

  {
    id: 'database-replication',
    domainId: 'sd-databases',
    title: 'Database Replication',
    summary:
      'Copying the same data onto multiple machines for availability and read scaling. The central tension is synchronous replication (safe, slow, can block on a dead replica) versus asynchronous (fast, but a crashed leader can lose the last few writes).',
    keyPoints: [
      'Leader-follower (single-leader) is the default: all writes go to one leader, reads can be served from followers',
      'Synchronous replication guarantees a follower has the data before acknowledging the write; asynchronous acknowledges immediately and replicates in the background',
      'Async replication risks read-after-write inconsistency: a client can write to the leader and immediately read stale data from a lagging follower',
      'Multi-leader and leaderless replication remove the single point of failure but introduce write conflicts that must be resolved (last-write-wins, vector clocks, application-level merge)',
      'Failover (promoting a follower to leader) is the dangerous part — done wrong it causes split-brain, with two leaders both accepting writes',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Leader-follower replication and the write path',
        code: 'sequenceDiagram\n  participant C as Client\n  participant L as Leader\n  participant F1 as Follower 1\n  participant F2 as Follower 2\n  C->>L: write(x = 5)\n  L->>F1: replicate(x = 5)\n  L->>F2: replicate(x = 5)\n  F1-->>L: ack\n  L-->>C: write acknowledged\n  Note over L,F2: F2 acks later — async replication,<br/>F2 briefly serves a stale read',
        caption: 'Async replication acknowledges the client before every follower has caught up',
      },
      {
        kind: 'paragraph',
        text: 'Every replication scheme is a bet about which failure you would rather have. Synchronous replication to all followers means a single slow or unreachable follower stalls every write in the system — a strong consistency guarantee that is also a strong availability liability. Fully asynchronous replication never blocks a write on a follower, but a leader crash right after acknowledging a write can lose it entirely, because it never made it anywhere else. Most production systems compromise: synchronous to one follower ("semi-synchronous"), asynchronous to the rest.',
      },
      {
        kind: 'table',
        caption: 'Replication topologies',
        headers: ['Topology', 'Writes go to', 'Conflict handling', 'Typical use'],
        rows: [
          ['Single-leader', 'One leader only', 'None needed — one writer', 'The default for most OLTP databases'],
          ['Multi-leader', 'Any leader, per region', 'Required — concurrent writes can conflict', 'Multi-datacenter writes, offline-first apps'],
          ['Leaderless (quorum)', 'Any replica, client waits for W acks', 'Required — resolved via versions/timestamps', 'Dynamo-style stores (Cassandra, Riak)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Read-your-writes is not automatic',
        text: 'A user who just posted a comment and immediately refreshes the page can see it vanish if the refresh happens to be routed to a follower that has not caught up yet. This is a direct, visible consequence of asynchronous replication, not a bug in application code. Fixing it means routing a user\'s own reads to the leader for some window after their write, or reading from a replica only once it has confirmed applying a version at or past the write.',
      },
      {
        kind: 'bestPractice',
        title: 'Use follower reads for scale, not for anything that must be fresh',
        text: 'Read replicas are excellent for spreading read load — analytics, search indexes, dashboards — where a few hundred milliseconds of staleness is invisible to the business. Anything where a user would notice staleness (their own just-written data, a payment status they are actively watching) should read from the leader or from a replica with an explicit freshness guarantee.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 5 — Replication' },
      { book: 'sdi-vol1', chapter: 'Ch. 6 — Data Store Selection' },
    ],
    related: ['consistency-models', 'quorum-systems', 'multi-region-architecture', 'cap-theorem'],
  },

  {
    id: 'database-sharding-and-partitioning',
    domainId: 'sd-databases',
    title: 'Sharding & Partitioning',
    summary:
      'Splitting a dataset across multiple machines so no single node has to hold — or serve — all of it. The entire discipline reduces to one question: which key decides where a row lives, and does that choice spread load evenly?',
    keyPoints: [
      'Range partitioning: contiguous key ranges per shard — great for range scans, terrible when writes cluster at the "current" end (e.g. timestamps)',
      'Hash partitioning: hash(key) mod N spreads keys evenly but destroys range-scan locality and makes resharding expensive without consistent hashing',
      'Consistent hashing minimizes data movement on resharding — adding a node only reshuffles ~1/N of the keys instead of nearly everything',
      'A poorly chosen shard key creates a hot shard: one celebrity user, one viral post, or one popular SKU can overload a single node while the rest sit idle',
      'Cross-shard queries (joins, transactions, aggregates) are the recurring cost — they either fan out to every shard or are designed away entirely',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A request routed to its shard by hashed key',
        code: 'flowchart LR\n  Client --> Router[Shard Router]\n  Router -->|hash mod 3 is 0| S0[(Shard 0)]\n  Router -->|hash mod 3 is 1| S1[(Shard 1)]\n  Router -->|hash mod 3 is 2| S2[(Shard 2)]',
        caption: 'The router (or a client-side library) must apply the exact same hash function everywhere',
      },
      {
        kind: 'code',
        title: 'A minimal consistent-hashing ring',
        code: 'class ConsistentHashRing {\n    private final TreeMap<Long, String> ring = new TreeMap<>();\n    private final int vnodesPerNode = 100; // virtual nodes smooth the distribution\n\n    void addNode(String node) {\n        for (int i = 0; i < vnodesPerNode; i++) {\n            ring.put(hash(node + "#" + i), node);\n        }\n    }\n\n    String nodeFor(String key) {\n        long h = hash(key);\n        var entry = ring.ceilingEntry(h);           // first node clockwise from h\n        return entry != null ? entry.getValue() : ring.firstEntry().getValue();\n    }\n\n    private long hash(String s) {\n        return java.util.zip.CRC32C.class.hashCode() ^ s.hashCode(); // stand-in for a real 64-bit hash\n    }\n}',
        caption: 'Virtual nodes (vnodes) prevent one physical node from owning a disproportionate arc of the ring',
      },
      {
        kind: 'pitfall',
        title: 'The celebrity problem: your shard key picked the hot node for you',
        text: 'Sharding a social app by user ID puts every one of a celebrity\'s millions of followers\' feed-fan-in writes onto that one user\'s shard. No amount of adding shards helps, because the hash function keeps sending that key to the same place. The fix is workload-specific: split hot keys further (sub-sharding a single logical key across multiple physical shards), or redesign the access pattern (fan-out on write vs fan-out on read — see [[designing-a-news-feed]]) so no single shard absorbs disproportionate load.',
      },
      {
        kind: 'note',
        title: 'Resharding is the operation everything else is designed around',
        text: 'The real design question is rarely "how do I shard" but "how do I reshard without downtime when a shard outgrows its node." Range partitioning splits a hot range in two. Hash partitioning with a fixed number of shards over-provisioned from day one (more logical shards than physical nodes, several logical shards per node) lets you rebalance by moving whole logical shards between nodes rather than rehashing everything.',
      },
      {
        kind: 'bestPractice',
        title: 'Pick a shard key for its distribution, not its convenience',
        text: 'A good shard key has high cardinality (many distinct values) and no correlation with request frequency. `user_id` is usually good; `signup_date` or `country` are usually bad, because they concentrate load into a small number of buckets (whichever day had a marketing push, whichever country has the most users).',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 6 — Partitioning' },
      { book: 'database-internals', chapter: 'Ch. 1 — Introduction and Overview' },
      { book: 'sdi-vol1', chapter: 'Ch. 6 — Data Store Selection' },
    ],
    related: ['database-replication', 'sql-vs-nosql', 'designing-a-url-shortener', 'distributed-caching-systems'],
  },

  {
    id: 'indexing-at-scale',
    domainId: 'sd-databases',
    title: 'Indexing at Scale',
    summary:
      'An index trades write cost and storage for read speed — it is a second, ordered copy of some columns that lets a query skip straight to matching rows instead of scanning the table. The two dominant structures, B-trees and LSM-trees, make opposite bets about where that cost lands.',
    keyPoints: [
      'B-tree indexes update in place — reads are fast and predictable, but every write is a random disk I/O to the exact page being modified',
      'LSM-trees (log-structured merge-trees) buffer writes in memory and flush them as sorted, immutable files — writes become sequential and fast, at the cost of background compaction and slower worst-case reads',
      'A secondary index is itself just another index structure mapping a non-primary column back to primary keys — every one you add slows down every write',
      'A covering index includes every column a query needs, letting the database answer entirely from the index without touching the underlying row',
      'Composite (multi-column) index column order matters: an index on (a, b) serves queries filtering on `a` or on `a AND b`, but not on `b` alone',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'The LSM-tree write path',
        code: 'flowchart LR\n  W[Write] --> M[Memtable in RAM, sorted]\n  M -->|memtable full| F[Flush to SSTable on disk]\n  F --> C[Background compaction merges SSTables]\n  C --> C',
        caption: 'Writes only ever append; reads may have to check the memtable and several SSTables',
      },
      {
        kind: 'code',
        title: 'The memtable-flush idea, minimized',
        code: 'class SimpleLsmStore {\n    private TreeMap<String, String> memtable = new TreeMap<>();\n    private final List<TreeMap<String, String>> sstables = new ArrayList<>();\n    private static final int FLUSH_THRESHOLD = 1000;\n\n    void put(String key, String value) {\n        memtable.put(key, value);\n        if (memtable.size() >= FLUSH_THRESHOLD) {\n            sstables.add(0, memtable);      // newest first\n            memtable = new TreeMap<>();\n        }\n    }\n\n    String get(String key) {\n        if (memtable.containsKey(key)) return memtable.get(key);\n        for (var sstable : sstables) {       // newest-to-oldest — first match wins\n            if (sstable.containsKey(key)) return sstable.get(key);\n        }\n        return null;\n    }\n}',
        caption: 'Real LSM engines add bloom filters per SSTable so a miss does not mean scanning every file',
      },
      {
        kind: 'table',
        caption: 'B-tree vs LSM-tree',
        headers: ['', 'B-tree', 'LSM-tree'],
        rows: [
          ['Writes', 'Random I/O, in place', 'Sequential I/O, append-only'],
          ['Reads', 'Predictable — one tree lookup', 'May check memtable + several SSTables'],
          ['Write amplification', 'Lower', 'Higher — data is rewritten during compaction'],
          ['Used by', 'PostgreSQL, MySQL InnoDB', 'Cassandra, RocksDB, LevelDB'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Every index you add is a tax on every future write',
        text: 'It is easy to add secondary indexes reactively — "queries on this column are slow, add an index" — without noticing that a table with ten indexes now pays ten index updates per write. In write-heavy systems this shows up as mysteriously degrading write latency months after the schema quietly accumulated indexes nobody audits.',
      },
      {
        kind: 'bestPractice',
        title: 'Design the covering index around the actual query, column order included',
        text: 'For a query like `WHERE status = ? ORDER BY created_at DESC`, an index on `(status, created_at)` lets the database satisfy the filter and the sort from the index alone — no separate sort step, no row lookups for filtering. Getting the column order backwards (`(created_at, status)`) forces a full index scan filtered afterward, defeating the purpose.',
      },
    ],
    refs: [
      { book: 'database-internals', chapter: 'Part I — Storage Engines' },
      { book: 'ddia', chapter: 'Ch. 3 — Storage and Retrieval' },
    ],
    related: ['sql-vs-nosql', 'database-sharding-and-partitioning', 'designing-a-search-autocomplete'],
  },

  {
    id: 'transactions-and-isolation-levels',
    domainId: 'sd-databases',
    title: 'Transactions & Isolation Levels',
    summary:
      'A transaction bundles several operations into one all-or-nothing unit (atomicity), but isolation — what one transaction can see of another\'s uncommitted work — is a spectrum, not a switch, and the default on most databases is weaker than people assume.',
    keyPoints: [
      'ACID: Atomicity, Consistency, Isolation, Durability — isolation is the axis with the most real-world variance between databases',
      'Anomalies from weak isolation: dirty reads (seeing uncommitted data), non-repeatable reads (a re-read within one transaction sees different data), phantom reads (a re-run query returns different rows)',
      'Isolation levels from weakest to strongest: Read Uncommitted, Read Committed, Repeatable Read, Serializable — each rules out more anomalies at a concurrency cost',
      'MVCC (multi-version concurrency control) is how most modern databases give readers a consistent snapshot without blocking writers — readers see an older version instead of waiting',
      'A database\'s default isolation level is usually **not** Serializable — PostgreSQL defaults to Read Committed, and "Serializable" must be requested explicitly when correctness demands it',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A lost update under weak isolation',
        code: 'sequenceDiagram\n  participant T1 as Transaction 1\n  participant DB\n  participant T2 as Transaction 2\n  T1->>DB: read balance = 100\n  T2->>DB: read balance = 100\n  T1->>DB: write balance = 100 - 30 = 70\n  T2->>DB: write balance = 100 - 50 = 50\n  Note over DB: T1s withdrawal is silently lost —<br/>final balance is 50, not 20',
        caption: 'Both transactions read the same starting value and overwrote each other\'s update',
      },
      {
        kind: 'table',
        caption: 'Isolation levels and what they rule out',
        headers: ['Level', 'Dirty reads', 'Non-repeatable reads', 'Phantom reads', 'Concurrency cost'],
        rows: [
          ['Read Uncommitted', 'Possible', 'Possible', 'Possible', 'Lowest'],
          ['Read Committed', 'Prevented', 'Possible', 'Possible', 'Low'],
          ['Repeatable Read', 'Prevented', 'Prevented', 'Possible (mostly)', 'Medium'],
          ['Serializable', 'Prevented', 'Prevented', 'Prevented', 'Highest'],
        ],
      },
      {
        kind: 'code',
        title: 'Requesting isolation explicitly instead of trusting the default',
        code: 'try (Connection conn = dataSource.getConnection()) {\n    conn.setAutoCommit(false);\n    conn.setTransactionIsolation(Connection.TRANSACTION_SERIALIZABLE);\n\n    int balance = readBalance(conn, accountId);\n    if (balance < amount) throw new InsufficientFundsException();\n    writeBalance(conn, accountId, balance - amount);\n\n    conn.commit();\n} catch (SQLException e) {\n    // A serialization failure here means retry the whole transaction —\n    // the database detected a conflict it could not silently resolve.\n}',
        caption: 'Serializable transactions can fail with a serialization error under contention — callers must retry',
      },
      {
        kind: 'pitfall',
        title: 'Application-level "check then act" without transactional isolation',
        text: 'Checking `if (stock > 0)` in application code and then issuing a separate `UPDATE stock = stock - 1` as two round trips — even inside a nominal transaction — is a race if the isolation level does not prevent it. The check-then-act pattern needs either Serializable isolation, an atomic `UPDATE ... WHERE stock > 0` that fails visibly at zero rows affected, or an explicit row lock (`SELECT ... FOR UPDATE`).',
      },
      {
        kind: 'note',
        title: 'This is a different axis from distributed consistency models',
        text: 'Isolation levels describe concurrent transactions on a single database engine. [[consistency-models]] describe what a distributed, replicated system guarantees across nodes. A database can be perfectly Serializable on one node and still expose stale reads the moment replication and multiple nodes enter the picture — the two concerns compound rather than substitute for each other.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 7 — Transactions' },
      { book: 'database-internals', chapter: 'Part III — Transaction Processing and Consistency' },
    ],
    related: ['distributed-transactions', 'consistency-models', 'database-replication'],
  },

  {
    id: 'polyglot-persistence',
    domainId: 'sd-databases',
    title: 'Polyglot Persistence',
    summary:
      'Using different databases for different parts of the same system, each chosen for the workload it actually serves — a relational store for transactions, a search index for full-text queries, a cache for hot reads — instead of forcing one database to do everything adequately.',
    keyPoints: [
      'The gain is real: a search engine does full-text search far better than SQL `LIKE`, and a cache serves hot reads at a latency no disk-backed store can match',
      'The cost is also real: data now lives in N places that can drift out of sync, and the system needs an explicit mechanism to keep them close enough',
      'One system should be the source of truth; every other store is a derived, rebuildable view of it',
      'Change Data Capture (CDC) — streaming a database\'s write-ahead log as events — is the standard way to propagate changes to secondary stores without dual writes',
      'Dual writes (writing to two stores directly from application code) are a classic reliability trap: a crash between the two writes leaves them permanently inconsistent',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'One source of truth, several derived stores',
        code: 'flowchart LR\n  App[Application] -->|writes| PG[(PostgreSQL: source of truth)]\n  PG -->|CDC / change stream| Bus[Event Stream]\n  Bus --> ES[(Elasticsearch: search index)]\n  Bus --> Redis[(Redis: cache)]\n  Bus --> WH[(Warehouse: analytics)]',
        caption: 'Every downstream store is rebuildable by replaying the change stream from scratch',
      },
      {
        kind: 'paragraph',
        text: 'The system that gets this wrong writes to Postgres and then, in the same request handler, writes to Elasticsearch too — two writes, no shared transaction between them. The moment the process crashes, or the second write times out, or a deploy race reorders things, the two stores disagree and nothing detects it until a customer notices search returning stale results. CDC turns this into a single write plus an asynchronous, replayable, at-least-once propagation pipeline — the kind of problem [[event-driven-architecture]] and [[exactly-once-and-idempotency]] already have good answers for.',
      },
      {
        kind: 'table',
        caption: 'A typical split by workload',
        headers: ['Store', 'Role', 'Why not just use the primary database'],
        rows: [
          ['Relational (Postgres)', 'Source of truth, transactional writes', '—'],
          ['Search index (Elasticsearch)', 'Full-text and faceted search', 'SQL `LIKE` does not rank or tokenize text well'],
          ['Cache (Redis)', 'Sub-millisecond hot reads', 'Disk-backed reads cannot match in-memory latency'],
          ['Column store (warehouse)', 'Analytics over historical data', 'OLTP schemas and indexes are wrong for OLAP scans'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Dual writes silently diverge under any partial failure',
        text: 'Writing to two independent stores from application code with no shared transaction means "both writes succeeded," "only the first succeeded," and "only the second succeeded" are all reachable states — and nothing distinguishes them from the outside. This is the single most common way polyglot systems end up with quietly stale search results or caches.',
      },
      {
        kind: 'bestPractice',
        title: 'Every derived store should be rebuildable from zero',
        text: 'If the search index or cache can be deleted entirely and rebuilt by replaying the change stream from the source of truth, drift stops being a permanent problem and becomes an operational one — "reprocess the backlog" instead of "manually reconcile inconsistent data by hand."',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 11 — Stream Processing' },
      { book: 'sdi-vol2', chapter: 'Ch. 4 — Design a Search Autocomplete System' },
      { book: 'bytebytego-archive', chapter: 'Data Architecture — Polyglot Persistence' },
    ],
    related: ['sql-vs-nosql', 'event-driven-architecture', 'designing-a-news-feed'],
  },
]
