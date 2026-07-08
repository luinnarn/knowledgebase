import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'horizontal-vs-vertical-scaling',
    domainId: 'sd-scalability-patterns',
    title: 'Horizontal vs Vertical Scaling',
    summary:
      'Vertical scaling buys a bigger machine; horizontal scaling buys more machines. Vertical is simpler and hits a hard ceiling; horizontal is unbounded in theory but demands statelessness and coordination the moment you adopt it.',
    keyPoints: [
      'Vertical scaling (scale up): more CPU/RAM/disk on one box — no architecture changes, but bounded by the biggest instance type that exists and remains a single point of failure',
      'Horizontal scaling (scale out): more machines behind a load balancer — unbounded in principle, but requires the workload to be splittable and the service to be stateless',
      'Vertical scaling has zero coordination cost; horizontal scaling introduces network calls, partitioning, and consistency questions that did not exist before',
      'Cost curves bend against vertical scaling fast — doubling a machine\'s specs rarely costs 2x near the top of a hardware tier, it costs 3-5x',
      'Horizontal scaling only helps if the bottleneck is actually parallelizable — a single hot shard or a serialized write path will not get faster from adding boxes',
      'Redundancy, not just capacity, is a common reason to go horizontal: three small instances survive one dying; one big instance does not',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Most systems scale vertically first because it is free — resize the instance, restart, done. The switch to horizontal scaling is a real architectural commitment: every piece of per-client state has to move out of process memory ([[stateless-services-and-session-management]]), and the workload has to actually be parallelizable for adding machines to help at all.',
      },
      {
        kind: 'diagram',
        title: 'Two ways to add capacity',
        code: 'flowchart LR\n  subgraph vert["Vertical Scaling"]\n    A[Small Server] --> B[Bigger Server] --> C[Biggest Server]\n  end\n  subgraph horiz["Horizontal Scaling"]\n    LB[Load Balancer] --> S1[Server 1]\n    LB --> S2[Server 2]\n    LB --> S3[Server 3]\n  end',
      },
      {
        kind: 'table',
        caption: 'Vertical vs horizontal scaling',
        headers: ['', 'Vertical (scale up)', 'Horizontal (scale out)'],
        rows: [
          ['Mechanism', 'bigger CPU/RAM/disk on one machine', 'more machines behind a load balancer'],
          ['Ceiling', 'hard limit — the biggest instance that exists', 'no theoretical limit'],
          ['Coordination cost', 'none — still one machine', 'load balancing, partitioning, distributed state'],
          ['Failure mode', 'single point of failure', 'redundant — one node dying does not take the system down'],
          ['Requires', 'nothing — works with any code', 'stateless services or externalized state'],
        ],
      },
      {
        kind: 'code',
        title: 'A request handler that assumes nothing about which instance serves it',
        code: '@RestController\npublic class OrderController {\n    private final OrderRepository repo;     // externalized state — a database\n    private final SessionStore sessions;     // externalized session state, e.g. Redis\n\n    @PostMapping("/orders")\n    public OrderResponse createOrder(@RequestHeader("Session-Id") String sessionId,\n                                      @RequestBody OrderRequest req) {\n        Session session = sessions.get(sessionId);   // not an in-memory HashMap\n        Order order = repo.save(new Order(session.userId(), req.items()));\n        return new OrderResponse(order.id());\n    }\n}',
        caption: 'Any instance can serve any request — nothing about this client is held in the process',
      },
      {
        kind: 'pitfall',
        title: 'Scaling out a bottleneck that cannot be parallelized',
        text: 'Horizontal scaling only helps the portion of work that can run in parallel. A single-writer database, a global sequence counter, or a step that must run in strict order will not get faster no matter how many application servers sit in front of it — the serial fraction caps the maximum speedup regardless of how much parallel capacity you add elsewhere.',
      },
      {
        kind: 'bestPractice',
        title: 'Scale up first — it is free',
        text: 'Vertical scaling requires zero code changes: resize the instance and restart. Reach for horizontal scaling when you hit a genuine ceiling, or need redundancy, not by default — it forces statelessness and data-partitioning decisions across the whole system.',
      },
      {
        kind: 'note',
        text: 'Horizontal scaling is often reached for capacity, but redundancy is just as common a motivation — even a workload that comfortably fits on one machine may run on three so that one instance failing, or one bad deploy, does not take the whole service down.',
      },
    ],
    refs: [{ book: 'web-scalability', chapter: 'Ch. 1-2 — Scalability Principles; Horizontal vs Vertical Scaling' }],
    related: ['scalability-fundamentals', 'stateless-services-and-session-management', 'capacity-planning'],
  },

  {
    id: 'stateless-services-and-session-management',
    domainId: 'sd-scalability-patterns',
    title: 'Stateless Services & Session Management',
    summary:
      'A stateless service keeps nothing about a specific client between requests, which is what makes it safe to run behind a load balancer with any request landing on any instance. Session state has to live somewhere — the question is just where.',
    keyPoints: [
      'Stateless means no per-client data held in server memory between requests — every request carries, or looks up, everything it needs',
      'Sticky sessions (session affinity at the load balancer) fake statelessness by always routing a client to the same instance — it works until that instance dies or gets overloaded',
      'Externalizing session state to a shared store (Redis, a database, a signed client-side token) is what makes any instance interchangeable',
      'JWTs push session state into the client itself (signed, not encrypted by default) — no server-side lookup, but revocation before expiry is hard',
      'Server-side sessions in a shared cache support instant revocation and richer session data, at the cost of a network hop and a dependency that must itself be highly available',
      'Statelessness is a prerequisite for horizontal scaling, rolling deploys, and autoscaling — a stateful instance cannot be killed and replaced without losing something',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Any instance can serve any request',
        code: 'flowchart LR\n  Client --> LB[Load Balancer]\n  LB --> S1[Instance 1]\n  LB --> S2[Instance 2]\n  LB --> S3[Instance 3]\n  S1 --> Redis[(Redis Session Store)]\n  S2 --> Redis\n  S3 --> Redis',
      },
      {
        kind: 'table',
        caption: 'Where session state can live',
        headers: ['', 'Sticky sessions', 'Server-side (Redis/DB)', 'Client-side (JWT)'],
        rows: [
          ['Any instance can serve a request?', 'no — pinned to one', 'yes', 'yes'],
          ['Instant revocation', 'n/a', 'yes — delete the entry', 'no — valid until expiry'],
          ['Extra network hop', 'no', 'yes', 'no'],
          ['Failure mode', 'lost session if the instance dies', 'store must be highly available', 'stale permissions until expiry'],
        ],
      },
      {
        kind: 'code',
        title: 'Stateless JWT verification',
        code: 'public Claims verify(String token) {\n    return Jwts.parserBuilder()\n        .setSigningKey(publicKey)\n        .build()\n        .parseClaimsJws(token)   // throws if signature or expiry is invalid\n        .getBody();\n}',
        caption: 'No database round trip — but a token issued before a permission change stays valid until it expires',
      },
      {
        kind: 'pitfall',
        title: 'Sticky sessions silently reintroduce state',
        text: 'Sticky sessions look stateless architecturally, but a node restart or scale-in event loses every session routed there, and uneven session distribution creates hot instances the load balancer cannot rebalance freely, since it is locked into routing each client back to the same node.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer short-lived tokens plus a revocation check over long-lived JWTs',
        text: 'A short expiry (minutes, refreshed via a separate token) bounds how long a compromised or permission-changed token stays valid, without paying for a database lookup on every single request the way a fully server-side session would.',
      },
      {
        kind: 'note',
        text: 'The JWT vs server-side session choice is really a tradeoff between lookup cost and revocation speed — server-side sessions revoke instantly at the cost of a lookup on every request; JWTs skip the lookup but cannot be un-issued before they expire.',
      },
    ],
    refs: [
      { book: 'web-scalability', chapter: 'Ch. 4 — Load Balancing and Session Handling' },
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Scale From Zero To Millions Of Users' },
    ],
    related: ['horizontal-vs-vertical-scaling', 'load-balancing', 'distributed-caching-systems'],
  },

  {
    id: 'microservices-vs-monolith',
    domainId: 'sd-scalability-patterns',
    title: 'Microservices vs Monolith',
    summary:
      'A monolith deploys as one unit and scales by replicating the whole thing; microservices split a system into independently deployable services, trading operational simplicity for the ability to scale, deploy, and own each piece independently.',
    keyPoints: [
      'A monolith is one deployable artifact — simple to develop, test, and deploy locally; it scales by running more full copies of everything',
      'Microservices decompose along business capability boundaries — each service owns its data and can be deployed, scaled, and even rewritten independently',
      'The cost of microservices is distributed-systems complexity: network calls where there used to be function calls, partial failure, and eventual consistency across service boundaries',
      'A well-factored monolith — clear module boundaries, no shared mutable state across modules — captures most of microservices\' organizational benefits without the network overhead',
      'Team topology often drives the decision more than technology: microservices let independent teams ship independently; a monolith requires more central coordination as team count grows',
      'The "distributed monolith" antipattern — services split apart but still deployed in lockstep and sharing a database — gets all of the network overhead with none of the independence benefit',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Same system, two decompositions',
        code: 'flowchart TB\n  subgraph mono["Monolith"]\n    M[Single Deployable] --> MO[Orders Module]\n    M --> MU[Users Module]\n    M --> MP[Payments Module]\n    M --> DB1[(Single Database)]\n  end\n  subgraph micro["Microservices"]\n    GW[API Gateway] --> OS[Orders Service]\n    GW --> US[Users Service]\n    GW --> PS[Payments Service]\n    OS --> DB2[(Orders DB)]\n    US --> DB3[(Users DB)]\n    PS --> DB4[(Payments DB)]\n  end',
      },
      {
        kind: 'table',
        caption: 'Monolith vs microservices',
        headers: ['', 'Monolith', 'Microservices'],
        rows: [
          ['Deployment', 'one unit, all at once', 'independent, per service'],
          ['Scaling granularity', 'whole application', 'per service, matched to its own load'],
          ['Data ownership', 'shared schema', 'each service owns its data'],
          ['Failure isolation', 'a bug can take down everything', 'a failing service can be isolated'],
          ['Operational overhead', 'low — one thing to run', 'high — many services, network, tracing'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'The distributed monolith',
        text: 'Splitting a codebase into separate services that still share one database and must be deployed together at the same version gets every cost of the network (latency, partial failure, serialization) with none of the benefit (independent deployability, independent scaling, clear ownership).',
      },
      {
        kind: 'bestPractice',
        title: 'Start with a modular monolith',
        text: 'Enforcing clean module boundaries and no cross-module database access inside a single deployable is far cheaper to get right than premature service boundaries, and it makes a later split into real microservices mechanical instead of a rewrite — the boundaries are already there.',
      },
      {
        kind: 'note',
        text: 'The decision is driven by team topology as much as by technology: once enough independent teams need to ship on their own schedule, the coordination cost of a shared monolith deploy starts to outweigh the network cost of splitting it up.',
      },
    ],
    refs: [
      { book: 'designing-distributed-systems', chapter: 'Ch. 1 — Introduction: Small Is Beautiful' },
      { book: 'sdi-vol2', chapter: 'Ch. — Microservices Architecture' },
    ],
    related: ['service-mesh', 'api-gateways-and-service-discovery', 'communication-protocols-for-services'],
  },

  {
    id: 'service-mesh',
    domainId: 'sd-scalability-patterns',
    title: 'Service Mesh',
    summary:
      'A service mesh moves cross-cutting concerns — retries, timeouts, mTLS, load balancing, observability — out of application code and into a sidecar proxy running next to every service instance, controlled by a central control plane.',
    keyPoints: [
      'Sidecar pattern: a proxy (e.g. Envoy) runs alongside every service instance and intercepts all inbound/outbound traffic — the app talks to localhost, the sidecar handles the network',
      'Data plane (the sidecars) does the actual proxying; control plane (e.g. Istio\'s istiod) pushes configuration — routing rules, mTLS certs, retry policy — to every sidecar',
      'Mesh-provided features: automatic mTLS between services, consistent retry/timeout/circuit-breaker policy, traffic shifting for canary deploys, and uniform metrics without app code changes',
      'The mesh adds a hop — client to local sidecar, network, remote sidecar, remote app — and a new operational dependency, which is a real cost, not a free lunch',
      'An API gateway handles north-south traffic (outside to inside); a service mesh handles east-west traffic (service to service inside the cluster) — related but distinct problems',
      'Service mesh solves problems that only exist once many services call each other over the network — it has little to offer a monolith',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Sidecar proxies and a control plane',
        code: 'flowchart LR\n  subgraph PodA["Service A Pod"]\n    AppA[App A] <--> SidecarA[Envoy Sidecar]\n  end\n  subgraph PodB["Service B Pod"]\n    SidecarB[Envoy Sidecar] <--> AppB[App B]\n  end\n  SidecarA <--> SidecarB\n  ControlPlane[Control Plane] -.config.-> SidecarA\n  ControlPlane -.config.-> SidecarB',
      },
      {
        kind: 'table',
        caption: 'API gateway vs service mesh',
        headers: ['', 'API Gateway', 'Service Mesh'],
        rows: [
          ['Traffic direction', 'north-south (client to cluster)', 'east-west (service to service)'],
          ['Typical concerns', 'auth, rate limiting, routing', 'mTLS, retries, load balancing, tracing'],
          ['Where it runs', 'edge of the cluster', 'a sidecar per service instance'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A sidecar\'s resource cost is multiplied by every single instance',
        text: 'Adding a proxy per pod means the mesh\'s CPU/memory footprint scales linearly with instance count, not with the number of services — at high instance counts this becomes a meaningful fraction of total cluster capacity, worth measuring before adopting a mesh.',
      },
      {
        kind: 'bestPractice',
        title: 'Adopt a mesh once you feel the pain, not preemptively',
        text: 'Implementing retries, mTLS, and consistent observability by hand across a handful of services is manageable; once dozens of services each reimplement it slightly differently, a mesh\'s consistency starts to outweigh its operational cost.',
      },
      {
        kind: 'note',
        text: 'A mesh can implement [[circuit-breakers-and-retries]] transparently at the proxy layer — the same policy applies uniformly to every service without each one needing its own retry library configured correctly.',
      },
    ],
    refs: [{ book: 'designing-distributed-systems', chapter: 'Ch. 3 — Sidecars; Service Mesh Patterns' }],
    related: ['microservices-vs-monolith', 'api-gateways-and-service-discovery', 'circuit-breakers-and-retries', 'communication-protocols-for-services'],
  },

  {
    id: 'multi-region-architecture',
    domainId: 'sd-scalability-patterns',
    title: 'Multi-Region Architecture',
    summary:
      'Running a system across multiple geographic regions buys lower latency for distant users and survival of a whole-region outage — at the cost of cross-region data consistency and a much harder operational story.',
    keyPoints: [
      'Active-passive: one region serves traffic, another stands by as a warm replica — simple, but standby capacity sits mostly idle and failover has real recovery time',
      'Active-active: multiple regions serve traffic simultaneously — better latency and utilization, but every region can accept writes, and those writes must be reconciled',
      'Cross-region replication is inherently asynchronous at useful latencies — tens to low-hundreds of milliseconds between continents makes synchronous cross-region writes crater latency',
      'GeoDNS or anycast routes each user to their nearest healthy region; health checks must distinguish "degraded" from "down" to avoid routing users into a bad region',
      'Conflict resolution — last-writer-wins, CRDTs, or an explicit merge function — is unavoidable in active-active: someone decides what happens when two regions accept conflicting writes for the same record',
      'RPO (how much data can be lost) and RTO (how long until service is restored) are the two numbers that should drive active-passive vs active-active, not architectural preference',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Active-passive vs active-active',
        code: 'flowchart TB\n  subgraph ap["Active-Passive"]\n    U1[Users] --> R1[Region A - Active]\n    R1 -.replicate.-> R2[Region B - Standby]\n  end\n  subgraph aa["Active-Active"]\n    U2[US Users] --> RA[Region A]\n    U3[EU Users] --> RB[Region B]\n    RA -.sync.-> RB\n    RB -.sync.-> RA\n  end',
      },
      {
        kind: 'table',
        caption: 'Active-passive vs active-active',
        headers: ['', 'Active-Passive', 'Active-Active'],
        rows: [
          ['Write path', 'primary region only', 'any region'],
          ['Remote-user latency', 'higher — routed to primary', 'lower — served by nearest region'],
          ['Failover time', 'real — standby must take over', 'none — other regions already serving'],
          ['Conflict handling', 'not needed — single writer', 'required — concurrent writes across regions'],
          ['Idle capacity', 'standby mostly unused', 'all regions doing useful work'],
        ],
      },
      {
        kind: 'code',
        title: 'Last-writer-wins conflict resolution',
        code: 'Record resolve(Record local, Record remote) {\n    return local.updatedAt().isAfter(remote.updatedAt()) ? local : remote;\n}',
        caption: 'The simplest strategy — silently drops the losing write, fine for some data (a view count) and wrong for others (a shopping cart)',
      },
      {
        kind: 'pitfall',
        title: 'RPO/RTO decided implicitly by the replication mechanism',
        text: 'Choosing an active-passive setup without measuring actual replication lag means the real recovery point objective is whatever lag happens to be at failover time, not a number anyone consciously chose — it should be measured and tested, not assumed.',
      },
      {
        kind: 'bestPractice',
        title: 'Default to active-passive unless you specifically need multi-region write availability',
        text: 'Active-active buys lower latency and full regional failover, but it forces a conflict-resolution strategy onto every write path in the system — a cost worth paying only when the latency or availability requirement genuinely demands it.',
      },
      {
        kind: 'note',
        text: 'Multi-region write availability is a direct consequence of the choices in [[consistency-models]] and [[cap-theorem]] — active-active is, in effect, choosing availability and partition tolerance over strict consistency across regions.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 5 — Replication' },
      { book: 'sdi-vol2', chapter: 'Ch. — Multi-Region Architecture' },
    ],
    related: ['database-replication', 'consistency-models', 'cap-theorem'],
  },

  {
    id: 'api-versioning-and-evolution',
    domainId: 'sd-scalability-patterns',
    title: 'API Versioning & Evolution',
    summary:
      'APIs must change without breaking every existing client — versioning strategy decides whether that happens through URL/header negotiation, additive-only schema evolution, or a deprecation policy with a real deadline.',
    keyPoints: [
      'URL versioning (`/v1/orders`), header versioning (`Accept: application/vnd.api+json;version=2`), and additive-only evolution are the three common strategies, each with different client-visibility tradeoffs',
      'Backward-compatible ("additive") changes — new optional fields, new endpoints — do not need a version bump; removing or renaming a field, or changing its meaning, does',
      'A deprecation policy needs three things to be real: an announcement, a sunset date, and telemetry on who is still calling the old version',
      'Consumer-driven contract testing — each client publishes what it actually uses — lets a provider evolve a schema safely without knowing every client\'s exact code',
      'Running multiple API versions simultaneously multiplies operational and testing surface — every version alive is a version someone has to keep working',
      'Semantic versioning communicates intent, but most internal API version bumps are avoidable entirely by designing for additive evolution from the start',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Versioning strategies',
        headers: ['', 'URL versioning', 'Header versioning', 'Additive-only'],
        rows: [
          ['Client visibility', 'obvious in the URL', 'hidden in a header', 'no version at all'],
          ['Caching', 'cache-friendly — distinct URLs', 'harder — same URL, different response', 'cache-friendly'],
          ['When it works', 'any breaking change', 'any breaking change', 'only additive changes'],
        ],
      },
      {
        kind: 'code',
        title: 'Evolving a response type additively',
        code: 'public record OrderResponse(\n    String id,\n    BigDecimal total,\n    String currency,            // added later — old clients ignoring unknown fields still work\n    List<String> discountCodes  // added later, defaults to empty — never remove a field, only add\n) {}',
      },
      {
        kind: 'pitfall',
        title: 'Silently changing a field\'s meaning is worse than removing it',
        text: 'Removing a field breaks old clients loudly and immediately. Changing what a field means while keeping its name and type — say, `total` starting to include tax when it previously did not — breaks them silently, producing wrong answers instead of errors.',
      },
      {
        kind: 'bestPractice',
        title: 'Design for additive evolution first',
        text: 'Reach for a version bump only for genuine breaking changes. Most real-world API growth is additive — new fields, new endpoints — and never needs a version at all if the schema and clients are designed to ignore unknown fields.',
      },
      {
        kind: 'note',
        text: 'A deprecation announcement without usage telemetry on the old version is not a real deprecation plan — "turn it off eventually" never actually happens without visibility into who is still calling it.',
      },
    ],
    refs: [
      { book: 'web-scalability', chapter: 'Ch. — API Design for Scale' },
      { book: 'sdi-vol1', chapter: 'Ch. — API Design Considerations' },
    ],
    related: ['api-gateways-and-service-discovery', 'microservices-vs-monolith'],
  },
]
