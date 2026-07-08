import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'dns-resolution',
    domainId: 'sd-networking',
    title: 'DNS Resolution',
    summary:
      'Turning a hostname into an IP address walks a chain of caches and authoritative servers — and along the way, DNS itself becomes a crude but effective load-balancing and failover tool.',
    keyPoints: [
      'Resolution chain: browser cache → OS cache → recursive resolver (often the ISP or a public one like 8.8.8.8) → root servers → TLD servers → authoritative nameserver',
      "TTL controls how long a record is cached — low TTL enables fast failover and traffic shifting, at the cost of more lookups hitting the authoritative server",
      'DNS round-robin (returning multiple A records in rotation) gives coarse load distribution, but clients and resolvers cache results, so it is not real-time load balancing',
      "GeoDNS / latency-based routing returns a different IP depending on the resolver's location — often the very first routing decision in a global architecture",
      'DNS runs mostly over UDP (port 53) with TCP fallback for large responses, and is itself an eventually-consistent, cache-heavy system — propagation after a change is not instant',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'The DNS resolution chain',
        code: 'sequenceDiagram\n  participant Browser\n  participant Resolver\n  participant Root\n  participant TLD\n  participant Auth as "Authoritative NS"\n  Browser->>Resolver: resolve api.example.com\n  Resolver->>Root: where is .com?\n  Root-->>Resolver: TLD server address\n  Resolver->>TLD: where is example.com?\n  TLD-->>Resolver: authoritative NS address\n  Resolver->>Auth: A record for api.example.com?\n  Auth-->>Resolver: 203.0.113.10 (TTL 300s)\n  Resolver-->>Browser: 203.0.113.10',
        caption: 'Every hop after the first is cached at the resolver for the TTL — repeat lookups from any client behind that resolver are free until it expires',
      },
      {
        kind: 'table',
        caption: 'Common DNS record types',
        headers: ['Record', 'Purpose'],
        rows: [
          ['A / AAAA', 'Hostname → IPv4 / IPv6 address'],
          ['CNAME', 'Alias — one hostname points to another hostname'],
          ['NS', 'Delegates a zone to a set of authoritative nameservers'],
          ['MX', 'Mail server for the domain'],
          ['TXT', 'Arbitrary text — domain verification, SPF/DKIM policy'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A very low TTL is not free',
        text: 'Dropping TTL to seconds to enable fast failover means every one of those seconds, a much larger fraction of requests bypass caches and hit the authoritative nameserver directly — during an incident, when traffic patterns are already abnormal, this can turn DNS itself into a bottleneck or amplify an outage instead of mitigating it.',
      },
      {
        kind: 'note',
        title: 'DNS as a poor-man\'s load balancer',
        text: 'Returning multiple A records lets a resolver pick one (often the first, or round-robin) — cheap, but blind to backend health and load, and subject to client-side caching that can pin a client to a now-unhealthy IP well past any TTL if the client ignores it. Real load balancing ([[load-balancing]]) sits behind the single IP DNS resolves to, making per-request decisions DNS fundamentally cannot.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 1 — DNS' },
      { book: 'bytebytego-archive', chapter: 'Networking — How DNS Works' },
    ],
    related: ['load-balancing', 'content-delivery-networks', 'multi-region-architecture'],
  },

  {
    id: 'load-balancing',
    domainId: 'sd-networking',
    title: 'Load Balancing',
    summary:
      'Distributing traffic across a pool of servers — at layer 4 (fast, protocol-agnostic) or layer 7 (content-aware, more expensive) — using an algorithm and health checks to keep it correct as the pool changes.',
    keyPoints: [
      'L4 (transport layer): balances TCP/UDP connections without inspecting payload — very fast, protocol-agnostic, cannot route on HTTP path or headers',
      'L7 (application layer): terminates and inspects HTTP — enables routing by path, header, or cookie, at the cost of CPU for parsing and (usually) TLS termination',
      'Algorithms: round robin (simple, ignores load), least connections (adapts to slow backends), consistent hashing (sticky, minimal remap when the pool changes)',
      'Active health checks (periodic pings) plus passive checks (tracking live error rates) pull unhealthy backends out of rotation automatically',
      'A load balancer is itself a single point of failure unless deployed redundantly — an active-passive pair, or a technique like anycast routing to multiple LB instances',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A load balancer in front of a backend pool',
        code: 'flowchart TD\n  C[Clients] --> LB{Load Balancer}\n  LB -->|healthy| S1[Server 1]\n  LB -->|healthy| S2[Server 2]\n  LB -.->|"unhealthy: removed"| S3[Server 3]\n  LB -->|health check| S1\n  LB -->|health check| S2\n  LB -->|health check| S3',
        caption: 'Health checks continuously re-evaluate the pool; a failing instance stops receiving new traffic without any manual intervention',
      },
      {
        kind: 'table',
        caption: 'Load balancing algorithms',
        headers: ['Algorithm', 'Behavior', 'Weakness'],
        rows: [
          ['Round robin', 'Cycles through servers in order', 'Ignores actual load or request cost'],
          ['Least connections', 'Sends to the server with fewest active connections', 'Needs the LB to track live connection counts'],
          ['Consistent hashing', 'Maps a request key to a server via a hash ring', 'Uneven load if keys are skewed ([[cache-stampede-and-hot-keys]])'],
          ['Weighted round robin', 'Round robin biased by declared server capacity', 'Weights need manual tuning as hardware changes'],
        ],
      },
      {
        kind: 'code',
        title: 'A minimal least-connections picker',
        code: 'class LeastConnectionsBalancer {\n    private final Map<String, AtomicInteger> activeConnections = new ConcurrentHashMap<>();\n\n    String pick(List<String> healthyServers) {\n        return healthyServers.stream()\n            .min(Comparator.comparingInt(s -> activeConnections.getOrDefault(s, new AtomicInteger()).get()))\n            .orElseThrow();\n    }\n\n    void onConnectionOpen(String server) { activeConnections.computeIfAbsent(server, s -> new AtomicInteger()).incrementAndGet(); }\n    void onConnectionClose(String server) { activeConnections.get(server).decrementAndGet(); }\n}',
      },
      {
        kind: 'pitfall',
        title: 'Sticky sessions quietly defeat the point of load balancing',
        text: 'Routing a client to the same backend for its whole session (via a cookie or source-IP hash) reintroduces per-server state and uneven load — one backend can end up overloaded simply because it happens to hold many active sessions. The fix is almost always to make the service itself stateless ([[stateless-services-and-session-management]]) rather than making the load balancer remember where a client "belongs."',
      },
      {
        kind: 'bestPractice',
        title: 'Run the load balancer itself redundantly',
        text: 'A single load balancer instance is a single point of failure for the entire pool behind it. Pair it with a hot standby (active-passive with a virtual IP failover) or use DNS/anycast to route to multiple LB instances — the load balancer needs the same "no single point of failure" discipline it enforces on the servers behind it.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Load Balancer' },
      { book: 'web-scalability', chapter: 'Ch. 3 — Non-Sharded Databases (load balancing tiers)' },
    ],
    related: ['dns-resolution', 'api-gateways-and-service-discovery', 'stateless-services-and-session-management'],
  },

  {
    id: 'api-gateways-and-service-discovery',
    domainId: 'sd-networking',
    title: 'API Gateways & Service Discovery',
    summary:
      'A gateway centralizes cross-cutting concerns (auth, rate limiting, routing) at the edge of a microservices system, while service discovery lets services find each other as instances come and go.',
    keyPoints: [
      'API gateway: a single entry point handling auth, rate limiting ([[rate-limiting-algorithms]]), request routing, and protocol translation, so individual services do not each reimplement them',
      'Service discovery, client-side: the caller queries a registry directly and picks an instance itself (e.g. Netflix Eureka-style) — no extra hop, but couples every client to the registry',
      'Service discovery, server-side: a load balancer or gateway queries the registry on the caller\'s behalf (e.g. via a sidecar or DNS-based discovery) — simpler clients, one more hop',
      'The registry itself needs heartbeats/health checks — a stale entry pointing at a dead instance is worse than no entry at all',
      'A gateway becomes a chokepoint exactly like a load balancer: it needs its own redundancy, and every request now pays its added latency, which should be measured, not assumed away',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Server-side discovery through a gateway',
        code: 'flowchart TD\n  Client --> GW[API Gateway]\n  GW --> Reg[(Service Registry)]\n  GW --> Order["Order Service instance"]\n  Order -->|heartbeat| Reg\n  Payment["Payment Service instance"] -->|heartbeat| Reg\n  GW --> Payment',
        caption: 'The gateway looks up healthy instances in the registry on every request (or via a cached, periodically refreshed view of it)',
      },
      {
        kind: 'table',
        caption: 'Client-side vs server-side discovery',
        headers: ['', 'Client-side', 'Server-side'],
        rows: [
          ['Who queries the registry', 'The calling service itself', 'A gateway or load balancer'],
          ['Extra network hop', 'No', 'Yes'],
          ['Client complexity', 'Higher — needs discovery-aware client library', 'Lower — client just calls one address'],
          ['Coupling', 'Clients coupled to registry API', 'Clients decoupled; gateway coupled instead'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A stale registry entry routes traffic into a void',
        text: 'If an instance crashes without deregistering, and the health-check interval is too generous, the registry keeps advertising it as available — requests routed there time out instead of failing fast. Aggressive heartbeat intervals and a strict expiry (removing an entry that misses several heartbeats) trade a little registry churn for far fewer failed requests.',
      },
      {
        kind: 'note',
        text: 'Both discovery styles usually sit behind a broader [[communication-protocols-for-services|service communication protocol]] choice — the registry answers "which instance," not "how do I talk to it once I have an address."',
      },
    ],
    refs: [
      { book: 'sdi-vol2', chapter: 'Ch. 1 — API Gateway' },
      { book: 'designing-distributed-systems', chapter: 'Ch. 6 — Ambassadors (service discovery patterns)' },
    ],
    related: ['load-balancing', 'service-mesh', 'api-versioning-and-evolution'],
  },

  {
    id: 'content-delivery-networks',
    domainId: 'sd-networking',
    title: 'CDNs',
    summary:
      'A content delivery network caches content at points of presence close to users, cutting round-trip latency and shielding the origin from the bulk of read traffic.',
    keyPoints: [
      'CDN = a geographically distributed set of edge caches (PoPs) that serve cached content from a location near the requesting user',
      'Pull CDN: the edge fetches from origin on first miss and caches per TTL — the common case for most web/API content, requiring no upfront upload step',
      'Push CDN: content is proactively uploaded to edge nodes ahead of time — used when content is large, known in advance, and rarely changes (e.g. software releases)',
      'Cache hit ratio at the edge is the key efficiency metric; rare or long-tail content still round-trips all the way to origin on every request',
      '"Origin shielding" (a mid-tier regional cache in front of the real origin) prevents many PoPs missing simultaneously from all hammering the origin at once',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'CDN request flow',
        code: 'flowchart TD\n  U[User] --> PoP["Nearest Edge PoP"]\n  PoP -->|cache hit| U\n  PoP -->|cache miss| Shield["Regional Shield Cache"]\n  Shield -->|hit| PoP\n  Shield -->|miss| Origin["Origin Server"]\n  Origin --> Shield\n  Shield --> PoP\n  PoP --> U',
        caption: 'A shield tier absorbs simultaneous misses from many edge PoPs so the origin only ever sees one request per miss, not one per PoP',
      },
      {
        kind: 'pitfall',
        title: 'Invalidating content globally is not instant',
        text: 'A cache-purge request against a CDN with hundreds of PoPs takes real time to propagate everywhere — treating an invalidation call as synchronous and immediately re-reading through the CDN can still observe stale content from a PoP that has not yet processed the purge. Content that must be correct the instant it changes (rather than "eventually, soon") needs a cache-busting key (a version in the URL) instead of relying on purge speed.',
      },
      {
        kind: 'note',
        title: 'CDNs do more than serve static files',
        text: 'Beyond caching images/CSS/JS, modern CDNs offer dynamic content acceleration — optimized routing between the edge and origin, persistent connection reuse, and sometimes edge compute — that speeds up even fully dynamic, uncacheable responses by shortening the network path and reusing warm connections.',
      },
      {
        kind: 'table',
        caption: 'Pull vs push CDN',
        headers: ['', 'Pull', 'Push'],
        rows: [
          ['Population', 'Lazy — fetched from origin on first miss', 'Proactive — uploaded ahead of time'],
          ['Best fit', 'Web/API content, unpredictable access patterns', 'Large files, known in advance, infrequently updated'],
          ['Origin load', 'One request per PoP per miss (mitigated by shielding)', 'One upload, then none — origin barely involved afterward'],
        ],
      },
    ],
    refs: [
      { book: 'web-scalability', chapter: 'Ch. 9 — Content Delivery Networks' },
      { book: 'bytebytego-archive', chapter: 'Networking — CDN Fundamentals' },
    ],
    related: ['caching-fundamentals', 'dns-resolution', 'cache-invalidation-strategies'],
  },

  {
    id: 'communication-protocols-for-services',
    domainId: 'sd-networking',
    title: 'Service Communication Protocols',
    summary:
      'REST, gRPC, WebSockets, and GraphQL each trade off human-readability, performance, and coupling differently — the right choice depends on whether the call is internal or client-facing, and whether it needs to be synchronous at all.',
    keyPoints: [
      'REST over HTTP+JSON: ubiquitous, human-readable, cacheable by standard HTTP semantics, but text parsing and payload verbosity cost bandwidth and CPU at scale',
      'gRPC: HTTP/2 transport with protobuf binary encoding — compact and fast, supports bidirectional streaming, requires a shared schema (`.proto`) — a strong default for internal service-to-service calls',
      'WebSockets: a persistent, bidirectional connection — necessary for real-time push (chat, live feeds), but the connection is stateful, which complicates load balancing ([[load-balancing]])',
      'GraphQL: the client specifies exactly the fields it needs in a single request, solving over-/under-fetching — at the cost of query-complexity limits and harder HTTP-level caching at the gateway',
      'Every synchronous protocol couples the caller\'s success to the callee\'s availability in that moment; when that coupling is unacceptable, asynchronous messaging ([[message-queues]]) removes it entirely',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Choosing a protocol',
        headers: ['Protocol', 'Best for', 'Tradeoff'],
        rows: [
          ['REST / HTTP+JSON', 'Public APIs, browser clients', 'Verbose payloads, per-request parsing overhead'],
          ['gRPC', 'Internal service-to-service calls', 'Requires shared .proto schema, less human-debuggable'],
          ['WebSockets', 'Real-time bidirectional push', 'Stateful connection, harder to load balance'],
          ['GraphQL', 'Clients with varied, precise data needs', 'Query complexity control and caching are harder'],
        ],
      },
      {
        kind: 'diagram',
        title: 'gRPC server streaming vs a REST round trip',
        code: 'sequenceDiagram\n  participant Client\n  participant RESTService as "REST Service"\n  participant GRPCService as "gRPC Service"\n  Client->>RESTService: GET /events (poll)\n  RESTService-->>Client: [event1, event2]\n  Client->>RESTService: GET /events (poll again)\n  RESTService-->>Client: [event3]\n  Client->>GRPCService: StreamEvents (one call)\n  GRPCService-->>Client: event1\n  GRPCService-->>Client: event2\n  GRPCService-->>Client: event3',
        caption: 'A gRPC stream keeps one connection open and pushes events as they occur, instead of the client repeatedly asking "anything new?"',
      },
      {
        kind: 'pitfall',
        title: 'WebSocket connections do not survive a naive load balancer restart',
        text: 'Because a WebSocket connection is long-lived and stateful, an L4 load balancer that is simply restarted or reconfigured drops every open connection at once — clients must implement reconnect-with-backoff, and the server side needs a way to rebuild any per-connection state (subscriptions, presence) on reconnect rather than assuming the connection is a stable, permanent channel.',
      },
      {
        kind: 'note',
        text: 'None of these are exclusive: a common shape is REST or GraphQL at the public edge (client-facing, cacheable, debuggable) and gRPC between internal services (fast, schema-enforced) — [[api-gateways-and-service-discovery|the gateway]] is often exactly where that protocol translation happens.',
      },
    ],
    refs: [
      { book: 'sdi-vol2', chapter: 'Ch. 1 — Communication Protocols' },
      { book: 'grokking-sdi', chapter: 'Key Concepts — RPC and REST' },
    ],
    related: ['api-gateways-and-service-discovery', 'message-queues', 'microservices-vs-monolith'],
  },
]
