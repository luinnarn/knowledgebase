import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'caching-fundamentals',
    domainId: 'sd-caching',
    title: 'Caching Fundamentals',
    summary:
      'A cache trades memory for latency by keeping a fast, small copy of data in front of something slow and large — and it only helps if the **hit ratio** is high enough to matter.',
    keyPoints: [
      'A cache is only valuable when access has locality (temporal: same key soon again; spatial: nearby keys together) — caching purely random access helps nothing',
      'Cache-aside (lazy loading): the application checks the cache first, and on a miss reads the source of truth and populates the cache itself — the most common pattern',
      'Read-through: the cache is responsible for loading on a miss, transparent to the application — simpler call sites, less flexible',
      'Eviction policy decides what gets thrown out when the cache is full: LRU (evict least-recently-used), LFU (evict least-frequently-used), or TTL (evict by age) — the right one depends on the access pattern',
      'Caches exist at every layer of a system simultaneously: browser, [[content-delivery-networks|CDN]], reverse proxy, application (Redis/Memcached), and the database\'s own buffer pool',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Cache-aside read path',
        code: 'sequenceDiagram\n  participant App\n  participant Cache\n  participant DB\n  App->>Cache: get(key)\n  Cache-->>App: miss\n  App->>DB: query(key)\n  DB-->>App: value\n  App->>Cache: set(key, value)\n  Note over App,Cache: next read for this key is a hit',
        caption: 'The application owns the miss-fill logic; the cache itself stays a simple key-value store',
      },
      {
        kind: 'table',
        caption: 'Eviction policies',
        headers: ['Policy', 'Evicts', 'Good fit'],
        rows: [
          ['LRU', 'Least recently accessed item', 'General-purpose — recency predicts reuse'],
          ['LFU', 'Least frequently accessed item', 'Stable popularity distributions (some keys always hot)'],
          ['TTL', 'Items older than a fixed age', 'Data with a natural freshness window (quotes, weather)'],
        ],
      },
      {
        kind: 'code',
        title: 'Cache-aside get() in Java',
        code: 'Optional<Profile> getProfile(String userId) {\n    Profile cached = cache.get(userId);\n    if (cached != null) return Optional.of(cached);\n\n    Optional<Profile> loaded = database.findProfile(userId);\n    loaded.ifPresent(p -> cache.put(userId, p, Duration.ofMinutes(10)));\n    return loaded;\n}',
      },
      {
        kind: 'pitfall',
        title: 'A cache with no expiry is a memory leak with extra steps',
        text: 'Populating a cache without any eviction policy or TTL means it grows without bound until the process runs out of memory. Even a "cache everything forever" design needs an explicit capacity limit and an eviction policy — the question is never whether to evict, only which policy decides what goes.',
      },
      {
        kind: 'bestPractice',
        title: 'Set a TTL even under LRU/LFU',
        text: 'A size-based eviction policy alone can let stale-but-frequently-accessed data live indefinitely. Pairing it with a TTL bounds the maximum staleness any cached value can have, independent of how often it is accessed — cheap insurance against silently serving very old data forever.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 3 — Storage and Retrieval (caching layers)' },
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Cache' },
    ],
    related: ['cache-invalidation-strategies', 'distributed-caching-systems', 'content-delivery-networks'],
  },

  {
    id: 'cache-invalidation-strategies',
    domainId: 'sd-caching',
    title: 'Cache Invalidation',
    summary:
      '"There are only two hard problems in computer science: cache invalidation and naming things." Getting a cache to stop serving stale data — without either thrashing the source of truth or serving it forever — is genuinely hard.',
    keyPoints: [
      'TTL-based expiry: simple and bounded, but the bound is arbitrary — too short thrashes the database, too long serves stale data for longer than acceptable',
      'Explicit invalidation on write: correct in principle, but every code path that writes the source of truth must remember to invalidate the cache — one missed path reintroduces staleness silently',
      '[[write-through-vs-write-back|Write-through]] sidesteps invalidation by keeping the cache updated at write time instead of correcting it after the fact',
      'Versioned or tagged keys (embedding a content hash or version number in the cache key) avoid invalidation entirely — an old version simply ages out on its own, never invalidated because it is never looked up again',
      'Invalidating a distributed cache cluster requires a broadcast mechanism (pub/sub to every node) — and there is always a real, non-zero propagation window before every node has processed it',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Invalidation broadcast across cache nodes',
        code: 'flowchart TD\n  Writer["Writer Service"] -->|invalidate key X| PubSub["Pub/Sub Channel"]\n  PubSub --> N1["Cache Node 1"]\n  PubSub --> N2["Cache Node 2"]\n  PubSub --> N3["Cache Node 3"]\n  N1 --> Evict1["evict key X"]\n  N2 --> Evict2["evict key X"]\n  N3 --> Evict3["evict key X"]',
        caption: 'Every node must receive and process the message before the invalidation is fully effective — a slow or disconnected node keeps serving the stale value until it does',
      },
      {
        kind: 'pitfall',
        title: 'The invalidate-then-repopulate race',
        text: 'A common bug: request A invalidates a key after a write, but before the cache is empty, request B (still reading the old data path) repopulates the cache with the stale value it already had in flight — leaving the cache confidently serving old data right after an invalidation was supposed to fix it. Guarding against this needs either a version check on repopulation (reject writing back an older version) or a short lock around the invalidate-then-refill sequence.',
      },
      {
        kind: 'table',
        caption: 'Invalidation strategies compared',
        headers: ['Strategy', 'Correctness', 'Operational cost'],
        rows: [
          ['TTL only', 'Bounded staleness, not zero', 'Very low — no coordination needed'],
          ['Explicit invalidation', 'Correct if every write path remembers', 'Moderate — broadcast + race handling'],
          ['Versioned keys', 'Correct by construction', 'Higher memory (old versions linger until TTL)'],
        ],
      },
      {
        kind: 'note',
        text: 'The quote at the top of this topic (often attributed to Phil Karlton) is a joke with teeth: invalidation is hard specifically because it requires *coordinating* correctness across every place that reads and writes the same data, which is the same coordination problem underlying [[consistency-models|consistency models]] and [[distributed-locking]].',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 11 — Derived Data (cache maintenance)' },
      { book: 'sdi-vol2', chapter: 'Ch. 1 — Cache Invalidation' },
    ],
    related: ['caching-fundamentals', 'write-through-vs-write-back', 'distributed-caching-systems'],
  },

  {
    id: 'distributed-caching-systems',
    domainId: 'sd-caching',
    title: 'Distributed Caching',
    summary:
      'A single cache node hits a memory and throughput ceiling; distributed caches partition keys across a cluster, using consistent hashing so the cluster can grow or shrink without remapping almost everything.',
    keyPoints: [
      'A single node has a hard ceiling on both memory (how much can be cached) and throughput (how many ops/sec it can serve) — clusters of nodes (Redis Cluster, sharded Memcached) exist to lift both ceilings',
      'Consistent hashing (a hash ring) means adding or removing one node remaps only roughly 1/N of keys, instead of nearly all of them under simple `hash(key) % N`',
      'Replication inside the cache cluster trades memory for availability — a node can be lost without the keys it owned simply vanishing',
      'Client-side sharding (the caller hashes the key to pick a node directly) avoids a proxy hop but couples every client to the cluster topology; proxy-based sharding adds a hop but centralizes that knowledge',
      'A cold cache — after a full cluster restart or a large-scale rebalance — can send a stampede of misses straight to the origin database ([[cache-stampede-and-hot-keys]]) unless a warmup strategy is in place',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Consistent hashing: adding a node remaps few keys',
        code: 'flowchart LR\n  subgraph "Hash Ring"\n    N1((Node 1))\n    N2((Node 2))\n    N3((Node 3))\n    N4["Node 4 (new)"]\n  end\n  K1[key A] -.-> N1\n  K2[key B] -.-> N2\n  K3[key C] -.-> N4\n  K4[key D] -.-> N3',
        caption: 'Only the keys that land between Node 4\'s position and its predecessor on the ring move — every other key stays put',
      },
      {
        kind: 'table',
        caption: 'Client-side vs proxy-based sharding',
        headers: ['', 'Client-side', 'Proxy-based'],
        rows: [
          ['Extra hop', 'None', 'One (through the proxy)'],
          ['Topology awareness', 'Every client needs it', 'Centralized in the proxy'],
          ['Rebalance coordination', 'Every client must update simultaneously', 'Proxy updates once'],
        ],
      },
      {
        kind: 'code',
        title: 'A minimal consistent-hash ring lookup',
        code: 'class ConsistentHashRing {\n    private final TreeMap<Long, String> ring = new TreeMap<>();\n\n    void addNode(String node) {\n        for (int i = 0; i < 100; i++) ring.put(hash(node + "#" + i), node);   // virtual nodes smooth distribution\n    }\n\n    String nodeFor(String key) {\n        long h = hash(key);\n        Map.Entry<Long, String> entry = ring.ceilingEntry(h);\n        return entry != null ? entry.getValue() : ring.firstEntry().getValue();  // wrap around the ring\n    }\n\n    private long hash(String s) { return s.hashCode() & 0xFFFFFFFFL; }\n}',
        caption: 'Virtual nodes (multiple ring positions per physical node) keep the key distribution roughly even even with few physical nodes',
      },
      {
        kind: 'pitfall',
        title: 'A cold cache after a restart can take down the database it protects',
        text: 'The entire point of a cache is to shield the database from load — a cluster-wide restart or a major topology change empties it all at once, and every request the cache would normally have absorbed now falls straight through to the database simultaneously. Warmup strategies (pre-populating hot keys before cutting traffic over) or origin-side protection (request coalescing, rate limiting) are needed specifically for this moment, not just steady state.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 6 — Partitioning' },
      { book: 'web-scalability', chapter: 'Ch. 8 — Non-Relational Databases (distributed caching)' },
    ],
    related: ['caching-fundamentals', 'cache-stampede-and-hot-keys', 'database-sharding-and-partitioning'],
  },

  {
    id: 'cache-stampede-and-hot-keys',
    domainId: 'sd-caching',
    title: 'Cache Stampede & Hot Keys',
    summary:
      "Two distinct failure modes with a shared root cause: a stampede is many requests missing the same expired key at once; a hot key is one key so popular it overloads the single shard that owns it.",
    keyPoints: [
      'Cache stampede ("dog-piling"): a popular key expires, and hundreds of concurrent requests all miss at the same instant and hit the database simultaneously',
      'Stampede mitigation — request coalescing: the first miss for a key locks and populates it while every other concurrent request for that key waits for the same result instead of also querying the database',
      'Stampede mitigation — probabilistic early expiration: refresh a key slightly before its TTL, with jitter, so not every replica of a popular key expires at exactly the same moment',
      'Hot key: one key (a viral post, a celebrity profile) receives disproportionate traffic, overloading the single node/shard that owns it even though the cluster overall has plenty of spare capacity',
      'Hot-key mitigation: a small local (in-process) cache on top of the distributed cache for the hottest keys, or explicitly replicating a hot key across multiple nodes so no single one absorbs all its traffic',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A stampede at the moment a key expires',
        code: 'sequenceDiagram\n  participant R1 as Request 1\n  participant R2 as Request 2\n  participant R3 as Request 3\n  participant Cache\n  participant DB\n  R1->>Cache: get(hotKey)\n  Cache-->>R1: expired\n  R2->>Cache: get(hotKey)\n  Cache-->>R2: expired\n  R3->>Cache: get(hotKey)\n  Cache-->>R3: expired\n  R1->>DB: query\n  R2->>DB: query\n  R3->>DB: query\n  Note over DB: three identical queries land at once, for one key',
        caption: 'Without coalescing, every concurrent miss for the same key independently re-does the same expensive work',
      },
      {
        kind: 'code',
        title: 'Request coalescing with in-flight futures',
        code: 'class CoalescingCache<K, V> {\n    private final Map<K, CompletableFuture<V>> inFlight = new ConcurrentHashMap<>();\n\n    CompletableFuture<V> get(K key, Supplier<V> loadFromSource) {\n        return inFlight.computeIfAbsent(key, k ->\n            CompletableFuture.supplyAsync(loadFromSource)\n                .whenComplete((v, err) -> inFlight.remove(k))   // only the first caller triggers the load\n        );\n    }\n}',
        caption: 'Every concurrent caller for the same key gets the same in-flight future — the source of truth is queried exactly once, not once per waiter',
      },
      {
        kind: 'pitfall',
        title: 'A cluster with capacity to spare can still fall over from one key',
        text: 'Aggregate cluster metrics (average CPU, average QPS across all shards) can look completely healthy while a single node hosting one extremely popular key is saturated — the fix is not more nodes overall, since consistent hashing sends that key to the same node regardless of cluster size, but specifically detecting and special-casing hot keys.',
      },
      {
        kind: 'table',
        caption: 'Stampede vs hot key',
        headers: ['', 'Cache stampede', 'Hot key'],
        rows: [
          ['Trigger', 'A key expiring', 'Sustained popularity of one key'],
          ['Blast radius', 'The database, briefly', 'One cache node/shard, continuously'],
          ['Primary fix', 'Request coalescing, jittered TTLs', 'Local caching or replicating the hot key'],
        ],
      },
    ],
    refs: [
      { book: 'sdi-vol2', chapter: 'Ch. 1 — Hotspot and Cache Stampede' },
      { book: 'bytebytego-archive', chapter: 'Caching — Cache Stampede and Hot Keys' },
    ],
    related: ['distributed-caching-systems', 'rate-limiting-algorithms', 'caching-fundamentals'],
  },

  {
    id: 'write-through-vs-write-back',
    domainId: 'sd-caching',
    title: 'Write-Through vs Write-Back',
    summary:
      'Where a write lands first decides a hard tradeoff: write-through keeps the cache and database in lockstep at the cost of write latency; write-back is fast but can lose data if the cache fails before flushing.',
    keyPoints: [
      'Write-through: a write updates the cache and the database synchronously, in the same operation — cache and source of truth never diverge, but write latency includes the database round trip',
      'Write-back (write-behind): a write updates only the cache, with the database updated asynchronously later — very low write latency, but a cache node failure before the async flush completes loses that write permanently',
      'Write-around: a write goes directly to the database, bypassing the cache entirely — avoids filling the cache with data that is written once and rarely read',
      'Write-through effectively prevents staleness by construction, which is a more reliable answer to [[cache-invalidation-strategies|cache invalidation]] than invalidating after the fact',
      'The right choice is a durability decision: write-back is fine for data where losing the last few seconds is tolerable (view counters, ephemeral state), never for anything that must survive a crash (financial transactions)',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Three write paths',
        code: 'flowchart TD\n  W1["Write-through"] --> C1[Cache] --> D1[(Database)]\n  W2["Write-back"] --> C2[Cache] -.->|async, later| D2[(Database)]\n  W3["Write-around"] --> D3[(Database)]',
        caption: 'Write-through updates both synchronously; write-back only touches the cache immediately; write-around skips the cache on write entirely',
      },
      {
        kind: 'table',
        caption: 'Choosing a write strategy',
        headers: ['Strategy', 'Write latency', 'Durability risk', 'Good fit'],
        rows: [
          ['Write-through', 'Higher (waits on DB)', 'None', 'Data that must never be lost or stale'],
          ['Write-back', 'Lowest', 'Loses unflushed writes on cache failure', 'High-write-volume, loss-tolerant data'],
          ['Write-around', 'DB-bound, cache untouched', 'None (no cache involved)', 'Write-once, rarely-read data'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Write-back silently loses data on an ungraceful cache failure',
        text: 'If a write-back cache node crashes before its pending writes flush to the database, those writes are simply gone — with no error surfaced to the original caller, who already received a success response. Anything adopting write-back needs an explicit answer to "what happens to unflushed writes if this node dies right now," not just a latency win.',
      },
      {
        kind: 'note',
        text: "These strategies apply just as directly to a CPU's cache hierarchy as to an application-level cache like Redis — the naming and the tradeoff (latency now vs. durability guaranteed) are the same problem at a different scale.",
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 3 — Storage and Retrieval' },
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Cache Write Policies' },
    ],
    related: ['caching-fundamentals', 'cache-invalidation-strategies', 'consistency-models'],
  },
]
