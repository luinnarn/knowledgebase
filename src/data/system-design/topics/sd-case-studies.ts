import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'designing-a-url-shortener',
    domainId: 'sd-case-studies',
    title: 'Designing a URL Shortener',
    summary:
      'The "hello world" of system design — deceptively simple until you hit the two real problems: generating short, collision-free codes at scale, and serving redirects fast enough that latency is invisible.',
    keyPoints: [
      'Core requirement: given a long URL, return a short code; given the short code, redirect (HTTP 301/302) to the original URL',
      'Anchor the design in numbers: e.g. 100M new URLs/month at a 100:1 read:write ratio — redirects, not creation, are the hot path',
      'Short code generation: base62-encode an auto-incrementing ID (simple, collision-free, but a bottleneck at one counter), a random code with a collision check, or pre-allocated key ranges handed to writer nodes',
      'The redirect path should be cacheable and fast — a cache or CDN in front of the database turns a hot lookup into a memory access',
      'A simple key-value store (short code to long URL) fits the access pattern exactly — no relational schema or joins needed',
      'Custom aliases, expiration, and click analytics change the write path (a uniqueness check for aliases) and add an async analytics pipeline that must stay off the redirect\'s critical path',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'High-level architecture',
        code: 'flowchart TD\n  Client --> LB[Load Balancer]\n  LB --> API[API Service]\n  API -->|write| KeyGen[Key Generation Service]\n  API -->|read/write| Cache[(Cache)]\n  Cache --> DB[(Key-Value Store)]\n  API -.async click event.-> Queue[[Analytics Queue]]',
      },
      {
        kind: 'diagram',
        title: 'The redirect (read) path',
        code: 'sequenceDiagram\n  participant C as Client\n  participant A as API Service\n  participant Ca as Cache\n  participant D as Database\n  C->>A: GET /abc123\n  A->>Ca: lookup abc123\n  alt cache hit\n    Ca-->>A: long URL\n  else cache miss\n    A->>D: lookup abc123\n    D-->>A: long URL\n    A->>Ca: populate cache\n  end\n  A-->>C: 301 Redirect',
      },
      {
        kind: 'table',
        caption: 'Short code generation strategies',
        headers: ['Strategy', 'Uniqueness guarantee', 'Write contention', 'Complexity'],
        rows: [
          ['Base62(auto-increment ID)', 'guaranteed by the counter', 'single counter is a bottleneck', 'low'],
          ['Random + collision check', 'checked per write', 'a retry loop on collision', 'medium'],
          ['Pre-allocated key ranges', 'guaranteed — ranges never overlap', 'none — each writer owns a range', 'medium-high'],
        ],
      },
      {
        kind: 'code',
        title: 'Base62 encoding',
        code: 'static final String ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";\n\nstatic String encode(long id) {\n    StringBuilder sb = new StringBuilder();\n    while (id > 0) {\n        sb.append(ALPHABET.charAt((int) (id % 62)));\n        id /= 62;\n    }\n    return sb.reverse().toString();\n}',
      },
      {
        kind: 'pitfall',
        title: 'A single auto-increment counter becomes the write bottleneck and SPOF',
        text: 'Every write serializes through one counter, and losing it stalls all new URL creation. Pre-allocating ID ranges to multiple writer nodes (each hands out its range locally, refilling from a coordinator only occasionally) removes the single point of contention.',
      },
      {
        kind: 'bestPractice',
        title: 'Cache the redirect path aggressively',
        text: 'Reads outnumber writes by orders of magnitude here, so the entire system\'s user-facing performance is decided by the cache hit rate on the redirect path, not by the sophistication of the write path.',
      },
      {
        kind: 'note',
        text: 'Click analytics should be fire-and-forget onto a queue, processed asynchronously — putting it on the redirect\'s critical path would tie the fastest, hottest endpoint in the system to the slowest, least time-sensitive one.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 8 — Design A URL Shortener' },
      { book: 'bytebytego-archive', chapter: 'System Design: URL Shortener' },
    ],
    related: ['back-of-envelope-estimation', 'caching-fundamentals', 'database-sharding-and-partitioning'],
  },

  {
    id: 'designing-a-chat-system',
    domainId: 'sd-case-studies',
    title: 'Designing a Chat System',
    summary:
      'The hard problem is not sending a message — it is delivering it in real time to a recipient who might be offline, connected to a different server, or on multiple devices at once.',
    keyPoints: [
      'Requirements to size the design: 1:1 and group messaging, online presence, and at-least-once delivery with per-conversation ordering (global ordering is not needed)',
      'WebSockets, with long-polling as a fallback, keep a persistent connection open for real-time delivery — plain HTTP request/response cannot push to an idle client',
      'A connection is pinned to one server instance; delivering to a recipient connected elsewhere needs a pub/sub layer that fans a message out to whichever server holds that connection',
      'Message storage is closer to a per-conversation append-only log, partitioned by conversation ID, than to a mutable relational table',
      'Offline delivery: undelivered messages queue server-side and flush on reconnect or push notification; delivery and read receipts are their own small state machine per message',
      'Group chat fan-out to a large group is a miniature version of the same push-vs-pull tradeoff as a social feed',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'High-level architecture',
        code: 'flowchart TD\n  ClientA[Client A] <-->|WebSocket| ServerA[Chat Server A]\n  ClientB[Client B] <-->|WebSocket| ServerB[Chat Server B]\n  ServerA <--> PubSub[[Pub/Sub]]\n  ServerB <--> PubSub\n  ServerA --> DB[(Message Store)]\n  ServerB --> DB\n  ServerA --> Presence[(Presence Store)]',
      },
      {
        kind: 'diagram',
        title: 'Cross-server delivery',
        code: 'sequenceDiagram\n  participant A as Client A\n  participant SA as Server A\n  participant PS as Pub/Sub\n  participant SB as Server B\n  participant B as Client B\n  A->>SA: send message to B\n  SA->>SA: append to conversation log\n  SA->>PS: publish(userB, message)\n  PS->>SB: message for connected userB\n  SB->>B: push over WebSocket\n  B-->>SB: delivery ack\n  SB-->>PS: ack',
      },
      {
        kind: 'table',
        caption: '1:1 vs group chat',
        headers: ['', '1:1 chat', 'Large group chat'],
        rows: [
          ['Delivery path', 'one pub/sub hop to one recipient', 'fan-out to every online member'],
          ['Storage shape', 'per-conversation log, two participants', 'per-conversation log, many readers'],
          ['Scaling concern', 'minimal', 'fan-out cost scales with group size'],
        ],
      },
      {
        kind: 'code',
        title: 'Routing a message to its recipient',
        code: '@OnMessage\npublic void onMessage(ChatMessage msg, Session session) {\n    messageStore.append(msg.conversationId(), msg);\n    String targetServer = presence.serverFor(msg.recipientId());\n    if (targetServer == null) {\n        offlineQueue.enqueue(msg.recipientId(), msg);   // recipient offline — deliver on reconnect\n    } else {\n        pubSub.publish(targetServer, msg);\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'Pinned connections without a cross-server routing layer break delivery',
        text: 'If a server can only deliver to clients connected to itself, two users who happen to land on different servers simply cannot message each other — the pub/sub fan-out layer is not an optimization here, it is a correctness requirement.',
      },
      {
        kind: 'bestPractice',
        title: 'Model messages as an append-only per-conversation log',
        text: 'Treating messages as immutable, ordered, append-only records (rather than mutable rows) matches both how chat is actually read — recent-first, paginated backward — and how it is written, with no need for update-in-place logic.',
      },
      {
        kind: 'note',
        text: 'Group chat fan-out at scale is the same push-vs-pull tradeoff covered in depth in [[designing-a-news-feed]] — a message to a thousand-member group is, structurally, one post to a thousand followers.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 12 — Design A Chat System' },
      { book: 'grokking-sdi', chapter: 'Ch. — Designing Facebook Messenger' },
    ],
    related: ['message-queues', 'publish-subscribe-systems', 'designing-a-news-feed'],
  },

  {
    id: 'designing-a-news-feed',
    domainId: 'sd-case-studies',
    title: 'Designing a News Feed',
    summary:
      'A news feed is fundamentally a fan-out problem — when someone posts, do you push it to every follower\'s feed immediately, or make each follower pull and merge posts on read? The answer usually depends on how famous the poster is.',
    keyPoints: [
      'Fan-out-on-write (push): when a user posts, immediately write it into every follower\'s precomputed feed — reads become O(1), but a celebrity with millions of followers turns one post into millions of writes',
      'Fan-out-on-read (pull): a feed is assembled at read time by merging posts from everyone a user follows — no write amplification, but every read does real work and scales badly with follow count',
      'Hybrid approach: push for ordinary users, pull-and-merge for high-fan-out accounts — the common real-world answer, at the cost of two code paths',
      'Ranking, rather than plain reverse-chronological order, requires scoring candidate posts at read time — pushing at least part of the work back toward fan-out-on-read regardless of delivery strategy',
      'Feed storage is typically a precomputed list of post IDs per user in a fast store, hydrated with full post content from a separate content store at read time',
      'Staleness is usually acceptable — a feed a few seconds behind is fine, one of the clearer cases where eventual consistency is not just tolerable but the entire point',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Fan-out-on-write path',
        code: 'flowchart TD\n  User[User Posts] --> PostSvc[Post Service]\n  PostSvc --> ContentStore[(Post Content Store)]\n  PostSvc --> FanoutWorker[Fan-out Worker]\n  FanoutWorker --> FollowerGraph[(Follower Graph)]\n  FanoutWorker --> FeedA[(Follower A Feed)]\n  FanoutWorker --> FeedB[(Follower B Feed)]\n  FanoutWorker --> FeedC[(Follower C Feed)]',
      },
      {
        kind: 'diagram',
        title: 'Hybrid read path',
        code: 'flowchart LR\n  Client --> FeedSvc[Feed Service]\n  FeedSvc -->|ordinary follows| Precomputed[(Precomputed Feed)]\n  FeedSvc -->|celebrity follows| MergeOnRead[Merge-on-Read]\n  MergeOnRead --> ContentStore[(Post Content Store)]\n  FeedSvc --> ContentStore',
      },
      {
        kind: 'table',
        caption: 'Push vs pull vs hybrid',
        headers: ['', 'Push (fan-out-on-write)', 'Pull (fan-out-on-read)', 'Hybrid'],
        rows: [
          ['Write cost', 'high — one write per follower', 'none', 'high only for ordinary accounts'],
          ['Read cost', 'low — precomputed', 'high — merge at read time', 'low, plus a small merge for celebrities'],
          ['Celebrity problem', 'a write storm per post', 'not an issue', 'solved by routing around push'],
        ],
      },
      {
        kind: 'code',
        title: 'Assembling a hybrid feed',
        code: 'List<Post> getFeed(String userId) {\n    List<String> precomputed = feedCache.get(userId);              // from push fan-out\n    List<Post> celebrityPosts = celebrityFollows(userId).stream()\n        .flatMap(c -> postStore.recentByAuthor(c).stream())        // merge-on-read\n        .toList();\n    return merge(hydrate(precomputed), celebrityPosts);\n}',
      },
      {
        kind: 'pitfall',
        title: 'Fan-out-on-write for a celebrity account turns one post into a write storm',
        text: 'An account with millions of followers generates millions of feed writes for a single post under pure push fan-out, which can overwhelm the fan-out workers and delay delivery for every other, unrelated post competing for the same write capacity.',
      },
      {
        kind: 'bestPractice',
        title: 'Route by follower count',
        text: 'Push for accounts under a follower-count threshold, and pull-and-merge for accounts above it — this single routing decision avoids the worst case of both pure strategies without needing a more complex adaptive system.',
      },
      {
        kind: 'note',
        text: 'Adding ranking on top of either strategy pulls at least some work back toward read time — a purely precomputed, reverse-chronological feed is the only version of this design that can be fully realized by fan-out-on-write alone.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 11 — Design A News Feed System' },
      { book: 'bytebytego-archive', chapter: 'System Design: News Feed' },
    ],
    related: ['event-driven-architecture', 'caching-fundamentals', 'designing-a-chat-system'],
  },

  {
    id: 'designing-a-distributed-cache',
    domainId: 'sd-case-studies',
    title: 'Designing a Distributed Cache',
    summary:
      'A distributed cache — the system behind a Redis or Memcached cluster — has to decide where each key lives across many nodes, and what happens to reads and writes when a node dies.',
    keyPoints: [
      'Consistent hashing maps both keys and nodes onto a ring, so adding or removing one node reshuffles only a small fraction of keys instead of nearly all of them',
      'Replication factor (each key stored on N nodes) trades memory cost for read availability and durability against a single node failure',
      'Eviction policy — LRU, LFU, or TTL-based — decides what to discard once memory fills, and should match the actual access pattern rather than being left at a default',
      'Cache topology: client-side hashing (the client library knows the ring) versus a proxy layer (the client always talks to one endpoint, the proxy routes) — the proxy adds a hop but centralizes topology changes',
      'The hot key problem: one extremely popular key overwhelms the single node that owns it no matter how well the rest of the ring is balanced',
      'Cache warm-up after a restart or a cold cluster start is a real operational concern — an empty cache sends every request to the database at once, which can cascade into an outage under load',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Consistent hashing ring',
        code: 'flowchart LR\n  N1((Node 1)) --> N2((Node 2))\n  N2 --> N3((Node 3))\n  N3 --> N4((Node 4))\n  N4 --> N1\n  K1[Key: user:42] -.maps to.-> N2\n  K2[Key: user:99] -.maps to.-> N4',
      },
      {
        kind: 'diagram',
        title: 'Client-side hashing vs a proxy layer',
        code: 'flowchart TB\n  subgraph clientSide["Client-Side Hashing"]\n    App1[App] -->|library picks node| CN1[Cache Node]\n  end\n  subgraph proxyBased["Proxy-Based"]\n    App2[App] --> Proxy[Cache Proxy]\n    Proxy --> CN2[Cache Node]\n  end',
      },
      {
        kind: 'table',
        caption: 'Eviction policies',
        headers: ['Policy', 'Optimizes for', 'Failure mode'],
        rows: [
          ['LRU', 'recency of access', 'a burst of one-time reads can evict genuinely hot data'],
          ['LFU', 'frequency of access', 'slow to adapt when access patterns shift'],
          ['TTL-based', 'freshness', 'does not account for popularity at all — can evict hot data on schedule'],
        ],
      },
      {
        kind: 'code',
        title: 'Looking up a key\'s owning node',
        code: 'TreeMap<Long, Node> ring = new TreeMap<>();   // hash -> node, populated with virtual nodes\n\nNode nodeFor(String key) {\n    long h = hash(key);\n    Map.Entry<Long, Node> entry = ring.ceilingEntry(h);\n    return entry != null ? entry.getValue() : ring.firstEntry().getValue();  // wrap around the ring\n}',
      },
      {
        kind: 'pitfall',
        title: 'A single hot key overwhelms its one owning node',
        text: 'Consistent hashing balances key *count* across nodes well, but a single viral key still routes every request for it to one physical node — no amount of ring balancing helps, since the problem is request concentration on one key, not key distribution.',
      },
      {
        kind: 'bestPractice',
        title: 'Use virtual nodes on the hash ring',
        text: 'Mapping each physical node to many small virtual ranges, rather than one large range, spreads the load of a rebalance more evenly and reduces the chance that removing one node dumps a disproportionate share of keys onto a single neighbor.',
      },
      {
        kind: 'note',
        text: 'A hot key that a single node cannot absorb needs a different fix than better hashing — typically a short-lived local cache in front of the distributed cache, or explicit replication of that one key across multiple nodes.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 6 — Partitioning' },
      { book: 'sdi-vol2', chapter: 'Ch. — Distributed Cache' },
    ],
    related: ['distributed-caching-systems', 'caching-fundamentals', 'cache-stampede-and-hot-keys'],
  },

  {
    id: 'designing-a-rate-limiter-service',
    domainId: 'sd-case-studies',
    title: 'Designing a Rate Limiter Service',
    summary:
      'A rate limiter has to answer "allow or reject" in microseconds, stay correct when its own logic runs on multiple nodes, and not become the very bottleneck it is meant to protect against.',
    keyPoints: [
      'Algorithm choice — token bucket, leaky bucket, fixed window, or sliding window — trades burst tolerance, memory per key, and precision differently ([[rate-limiting-algorithms]] covers the mechanics of each)',
      'As a standalone service, the rate limiter sits in front of, or alongside as a sidecar, the services it protects, checked on every request before it is let through',
      'Distributed counting requires a shared store: if instances do not share state, each one enforces the limit independently and the effective limit becomes limit times instance count',
      'Redis-based implementations lean on atomic `INCR` plus `EXPIRE` (fixed window) or a sorted set of timestamps (sliding window log) so the increment-and-check step is atomic without a separate lock',
      'Failure mode matters: if the rate limiter or its backing store is unreachable, fail open (allow traffic, risk overload) or fail closed (reject traffic, guarantee protection) must be an explicit decision',
      'Limits are usually applied per key — per user, per IP, per API key — so storage and lookup cost scales with the number of distinct keys tracked, not just the request rate',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Rate limiter placement',
        code: 'flowchart LR\n  Client --> Gateway[API Gateway]\n  Gateway --> RL[Rate Limiter]\n  RL --> Redis[(Redis Counters)]\n  RL -->|allowed| Service[Backend Service]\n  RL -->|rejected| Reject[429 Too Many Requests]',
      },
      {
        kind: 'diagram',
        title: 'A Redis-backed check',
        code: 'sequenceDiagram\n  participant C as Client\n  participant RL as Rate Limiter\n  participant R as Redis\n  C->>RL: request (key user:42)\n  RL->>R: INCR user:42:window\n  R-->>RL: current count\n  alt count <= limit\n    RL-->>C: allow\n  else count > limit\n    RL-->>C: 429 reject\n  end',
      },
      {
        kind: 'table',
        caption: 'Fail-open vs fail-closed',
        headers: ['', 'Fail-open', 'Fail-closed'],
        rows: [
          ['On limiter/store outage', 'traffic passes through unchecked', 'traffic is rejected'],
          ['Availability of the protected service', 'not affected by the limiter\'s outage', 'reduced — depends on the limiter being up'],
          ['Risk', 'the thing the limiter protects against can happen', 'a limiter outage becomes a full outage'],
        ],
      },
      {
        kind: 'code',
        title: 'A Redis fixed-window check',
        code: 'boolean allow(String key, int limit, Duration window) {\n    long count = redis.incr(key);\n    if (count == 1) redis.expire(key, window);   // set TTL only on the first hit in this window\n    return count <= limit;\n}',
      },
      {
        kind: 'pitfall',
        title: 'Uncoordinated rate limiter instances multiply the effective limit',
        text: 'If each rate limiter instance keeps its own local counter instead of sharing state, a limit of 100 requests per minute becomes, in effect, 100 times however many instances are running — a shared, atomically-updated store is not an optimization here, it is what makes the limit real.',
      },
      {
        kind: 'bestPractice',
        title: 'Decide fail-open vs fail-closed explicitly',
        text: 'Do not let this be whatever a client library happens to do on a timeout — for a login endpoint under brute-force protection, fail-closed is usually right; for a general API gateway where the limiter\'s own outage should not take down every dependent service, fail-open is often the safer default.',
      },
      {
        kind: 'note',
        text: 'The algorithm mechanics (token bucket vs sliding window etc.) are covered separately in [[rate-limiting-algorithms]] — this topic is about the service wrapped around whichever algorithm is chosen: where it sits, how it stays correct across instances, and what it does when it fails.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 4 — Design A Rate Limiter' },
      { book: 'bytebytego-archive', chapter: 'System Design: Rate Limiter' },
    ],
    related: ['rate-limiting-algorithms', 'distributed-caching-systems', 'graceful-degradation-and-load-shedding'],
  },

  {
    id: 'designing-a-search-autocomplete',
    domainId: 'sd-case-studies',
    title: 'Designing a Search Autocomplete',
    summary:
      'Autocomplete has to return ranked suggestions for a partial prefix in single-digit milliseconds, which means the ranking work has to happen ahead of time, not at request time.',
    keyPoints: [
      'A trie keyed by character, with each node caching its top-K most popular completions, turns a prefix lookup into an O(prefix length) walk instead of scanning all candidate strings',
      'Precomputing top-K per node happens **offline**, on a schedule, aggregating query popularity from search logs — the read path never recomputes rankings live',
      'A trie for a large vocabulary does not fit on one machine — sharding by first character, or by a prefix range, distributes it, at the cost of merging results across a shard boundary',
      'Freshness tradeoff: a trending query will not appear until the next offline rebuild unless a separate fast-path layer specifically boosts very recent spikes',
      'Client-side debouncing — waiting roughly 100-200ms after the last keystroke before firing a request — cuts request volume dramatically for a barely perceptible latency cost',
      'The read path is cacheable per-prefix, since the same common prefixes are requested by many users, absorbing a large fraction of traffic before it reaches the trie service at all',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'High-level architecture',
        code: 'flowchart TD\n  Client -->|debounced keystrokes| API[Autocomplete Service]\n  API --> Cache[(Prefix Cache)]\n  Cache --> TrieShards[Trie Shards]\n  Logs[(Search Query Logs)] --> Aggregator[Offline Aggregation Job]\n  Aggregator -->|nightly rebuild| TrieShards',
      },
      {
        kind: 'diagram',
        title: 'A trie node with a cached top-K',
        code: 'flowchart TD\n  Root((root)) --> S((s))\n  S --> A1((a))\n  A1 --> N1((n))\n  N1 --> TopK["top-K: san francisco, san diego, sandra"]',
      },
      {
        kind: 'table',
        caption: 'Offline rebuild vs live re-ranking',
        headers: ['', 'Offline trie rebuild', 'Live re-ranking'],
        rows: [
          ['Freshness', 'lags until the next scheduled rebuild', 'immediate'],
          ['Read latency', 'very low — a precomputed lookup', 'higher — ranking work on the hot path'],
          ['Cost', 'batch job cost, off the request path', 'ongoing compute on every request'],
        ],
      },
      {
        kind: 'code',
        title: 'Serving suggestions from a precomputed trie',
        code: 'class TrieNode {\n    Map<Character, TrieNode> children = new HashMap<>();\n    List<String> topK = new ArrayList<>();   // precomputed offline, capped at K (e.g. 5-10)\n}\n\nList<String> suggest(TrieNode root, String prefix) {\n    TrieNode node = root;\n    for (char c : prefix.toCharArray()) {\n        node = node.children.get(c);\n        if (node == null) return List.of();\n    }\n    return node.topK;\n}',
      },
      {
        kind: 'pitfall',
        title: 'Ranking at query time misses the millisecond latency budget',
        text: 'Scoring every candidate completion against a ranking model for every keystroke, on every request, cannot realistically hit the single-digit-millisecond response time autocomplete needs — the ranking work has to be done ahead of time and merely looked up at request time.',
      },
      {
        kind: 'bestPractice',
        title: 'Shard the trie and cache popular prefixes',
        text: 'Traffic concentrates heavily on a small set of common prefixes, so a cache in front of the trie shards absorbs the majority of requests before they need a real trie walk at all.',
      },
      {
        kind: 'note',
        text: 'The trending-query freshness gap — a breaking news term not yet reflected in the offline-built trie — is usually addressed with a small, separately-updated fast-path layer that boosts very recent query spikes, rather than by rebuilding the whole trie more often.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 13 — Design A Search Autocomplete System' },
      { book: 'grokking-sdi', chapter: 'Ch. — Designing Typeahead Suggestion' },
    ],
    related: ['indexing-at-scale', 'caching-fundamentals', 'batch-vs-stream-processing'],
  },

  {
    id: 'designing-a-notification-system',
    domainId: 'sd-case-studies',
    title: 'Designing a Notification System',
    summary:
      'A notification system fans a single event out across push, email, and SMS channels, each with different delivery guarantees and failure modes, without spamming a user across channels for the same event.',
    keyPoints: [
      'Requirements to size the design: which channels (push, email, SMS, in-app), delivery guarantee (best-effort, retried, is normal), and expected fan-out volume for a single triggering event',
      'Producers publish an event to a queue rather than calling notification providers directly — decoupling means a slow or down provider does not block the service that triggered the notification',
      'Per-channel workers consume from the queue and call the relevant third-party provider — each channel has its own throughput limits and retry/backoff policy',
      'User preferences (which channels, quiet hours, opt-outs) must be checked before sending — a compliance requirement as much as a UX one',
      'Idempotency matters twice over: the same event should not be processed twice by a retried worker, and the same logical notification should not be re-sent if an earlier attempt actually succeeded but its acknowledgment was lost',
      'Third-party providers rate-limit and can be temporarily down — the pipeline needs its own backoff and dead-letter queue, or a provider outage backs up and starts timing out producers',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'High-level architecture',
        code: 'flowchart TD\n  Producer[Any Service] --> Queue[[Notification Queue]]\n  Queue --> PushWorker[Push Worker]\n  Queue --> EmailWorker[Email Worker]\n  Queue --> SmsWorker[SMS Worker]\n  PushWorker --> APNs[APNs / FCM]\n  EmailWorker --> EmailGw[Email Gateway]\n  SmsWorker --> SmsGw[SMS Gateway]\n  PrefStore[(User Preferences)] --> PushWorker\n  PrefStore --> EmailWorker\n  PrefStore --> SmsWorker',
      },
      {
        kind: 'diagram',
        title: 'One event, fanned out',
        code: 'sequenceDiagram\n  participant P as Producer Service\n  participant Q as Queue\n  participant W as Channel Worker\n  participant Pr as Preference Store\n  participant Ext as Provider\n  P->>Q: publish NotificationEvent\n  Q->>W: deliver event\n  W->>Pr: check user preferences\n  Pr-->>W: channel allowed?\n  alt allowed\n    W->>Ext: send\n    Ext-->>W: ack or failure\n  else opted out\n    W->>W: drop, no send\n  end',
      },
      {
        kind: 'table',
        caption: 'Channel comparison',
        headers: ['Channel', 'Delivery guarantee', 'Latency', 'Typical use'],
        rows: [
          ['Push', 'best-effort', 'seconds', 'time-sensitive, in-app relevant'],
          ['Email', 'best-effort, retried', 'seconds to minutes', 'non-urgent, detailed content'],
          ['SMS', 'best-effort, higher cost per message', 'seconds', 'urgent, high open-rate needs'],
        ],
      },
      {
        kind: 'code',
        title: 'An idempotent notification worker',
        code: 'void process(NotificationEvent event) {\n    if (!dedupStore.markIfAbsent(event.idempotencyKey())) {\n        return;   // already processed — a retry landed here again\n    }\n    if (preferences.allows(event.userId(), event.channel())) {\n        provider.send(event);\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'A slow provider without its own queue backs pressure up to the producer',
        text: 'If a channel worker calls its third-party provider synchronously with no local buffering, a provider slowdown propagates backward through the queue and eventually to the producer\'s request path — exactly the coupling the queue was meant to prevent in the first place.',
      },
      {
        kind: 'bestPractice',
        title: 'Decouple with a queue at the producer boundary',
        text: 'Notification delivery should never sit on a user-facing request\'s critical path — the producer publishes an event and moves on, regardless of how long email or SMS delivery actually takes downstream.',
      },
      {
        kind: 'note',
        text: 'Idempotency is needed at two levels here: the worker-level dedup key prevents a retried message from being processed twice, and a separate check is needed to avoid re-notifying a user across channels for the same logical event if, say, both push and email workers picked it up.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 10 — Design A Notification System' },
      { book: 'bytebytego-archive', chapter: 'System Design: Notification System' },
    ],
    related: ['message-queues', 'exactly-once-and-idempotency', 'publish-subscribe-systems'],
  },
]
