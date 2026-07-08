import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'fault-tolerance-patterns',
    domainId: 'sd-reliability',
    title: 'Fault Tolerance Patterns',
    summary:
      "Building systems that keep working — or fail predictably and cheaply — when a dependency inevitably fails. This is the umbrella discipline; timeouts, retries, circuit breakers, and bulkheads are the specific, composable tactics underneath it.",
    keyPoints: [
      'Assume every dependency will fail eventually — the network, a disk, or another service is the least reliable part of almost any architecture',
      'A **timeout** is the most basic and most frequently missing mechanism: a call with none can hang a thread — and everything waiting on it — forever',
      'Redundancy (multiple instances, replicas) only helps if failure is detected and rerouted around quickly; undetected failure is just a landmine',
      'Isolation ([[bulkheads-and-isolation]]) stops one failing dependency from starving resources unrelated requests need',
      '"Fail fast, fail clearly" beats "hang indefinitely" — a fast, explicit failure lets a caller retry, fall back, or degrade instead of piling up behind it',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Every pattern in this domain answers the same question from a different angle: *when* (not *if*) a dependency fails, how does the rest of the system keep functioning instead of failing along with it? Treat this topic as the map; the others are the specific tools.',
      },
      {
        kind: 'subheading',
        text: 'Matching a failure mode to a pattern',
      },
      {
        kind: 'table',
        caption: 'Failure mode → pattern',
        headers: ['Failure mode', 'Pattern', 'Covered in'],
        rows: [
          ['A call hangs instead of failing', 'Timeout on every network call, no exceptions', 'this topic'],
          ['A dependency is down or erroring repeatedly', 'Circuit breaker stops calling it for a cooldown', '[[circuit-breakers-and-retries]]'],
          ['A transient blip (one bad response)', 'Retry with exponential backoff and jitter', '[[circuit-breakers-and-retries]]'],
          ['One slow dependency exhausts a shared pool', 'Bulkhead: isolated pool per dependency', '[[bulkheads-and-isolation]]'],
          ['Total load exceeds capacity', 'Rate limiting and load shedding', '[[rate-limiting-algorithms]], [[graceful-degradation-and-load-shedding]]'],
        ],
      },
      {
        kind: 'code',
        title: 'The bug: a network call with no timeout',
        code: '// No timeout configured — this call can block the calling thread indefinitely\n// if the remote server accepts the connection but never responds.\nHttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder(uri).build();\nHttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());\n\n// Fixed: an explicit connect timeout AND a per-request timeout.\nHttpClient safeClient = HttpClient.newBuilder()\n    .connectTimeout(Duration.ofSeconds(2))\n    .build();\nHttpRequest safeRequest = HttpRequest.newBuilder(uri)\n    .timeout(Duration.ofSeconds(3))     // caps time waiting for the response too\n    .build();',
      },
      {
        kind: 'pitfall',
        title: 'A missing timeout is a silent, compounding failure',
        text: "One hung call rarely looks catastrophic by itself — a few threads stuck waiting. But under a thread-pool-per-request model, enough hung calls exhaust the pool entirely, and *every* request — even ones to healthy dependencies — starts queueing behind threads that will never free up. This is usually how \"one slow dependency took down the whole service\" incidents actually happen.",
      },
      {
        kind: 'bestPractice',
        title: 'Default every new external call to a timeout, from day one',
        text: "Don't treat fault tolerance as something added after an incident. Every new HTTP client, database connection, or RPC stub should ship with an explicit timeout as a matter of course — it costs nothing when the dependency is healthy and is the single highest-leverage line of defense when it isn't.",
      },
      {
        kind: 'note',
        title: "Release It! is the canonical source for this whole domain",
        text: 'Michael Nygard\'s *Release It!* named and catalogued most of the patterns in this domain (circuit breaker, bulkhead, timeout, fail fast) from real production outages, years before they became standard vocabulary — it\'s worth reading directly if resilience engineering becomes a regular part of the job.',
      },
    ],
    refs: [
      { book: 'release-it', chapter: 'Part II — Stability Patterns' },
      { book: 'sre-book', chapter: 'Ch. — Handling Overload and Cascading Failures' },
    ],
    related: ['circuit-breakers-and-retries', 'bulkheads-and-isolation', 'graceful-degradation-and-load-shedding', 'chaos-engineering'],
  },

  {
    id: 'circuit-breakers-and-retries',
    domainId: 'sd-reliability',
    title: 'Circuit Breakers & Retries',
    summary:
      "A circuit breaker stops calling a dependency that's already failing — protecting both the caller and the struggling callee — while a well-designed retry with **exponential backoff and jitter** turns a transient blip into an invisible hiccup instead of an amplified overload.",
    keyPoints: [
      '**Closed**: calls flow normally, failures counted. **Open**: calls fail immediately without touching the dependency, for a cooldown period. **Half-Open**: a trial call decides whether to close again',
      'Retrying without backoff during a real outage multiplies load on an already-struggling dependency — a self-inflicted denial of service',
      'Exponential backoff (doubling the delay each attempt) with **jitter** (randomizing it) prevents every client from retrying in lockstep and re-creating the exact spike that caused the failure',
      'Only retry **idempotent** operations, or ones with an idempotency key ([[exactly-once-and-idempotency]]) — retrying a bare non-idempotent write can duplicate its effect',
      'The two compose: retry a bounded number of times, but let the circuit breaker\'s open state stop that retrying from continuing to hammer a dependency it already knows is down',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Circuit breaker state machine',
        code: 'stateDiagram-v2\n  [*] --> Closed\n  Closed --> Open: failure rate exceeds threshold\n  Open --> HalfOpen: cooldown period elapses\n  HalfOpen --> Closed: trial call succeeds\n  HalfOpen --> Open: trial call fails\n  Closed --> Closed: call succeeds',
        caption: 'Only Half-Open lets a single trial call through to test recovery',
      },
      {
        kind: 'code',
        title: 'A minimal circuit breaker',
        code: 'enum State { CLOSED, OPEN, HALF_OPEN }\n\nclass CircuitBreaker {\n    private State state = State.CLOSED;\n    private int consecutiveFailures = 0;\n    private final int failureThreshold = 5;\n    private Instant openedAt;\n    private final Duration cooldown = Duration.ofSeconds(30);\n\n    synchronized boolean allowCall() {\n        if (state == State.OPEN && Duration.between(openedAt, Instant.now()).compareTo(cooldown) > 0) {\n            state = State.HALF_OPEN;          // one trial call allowed through\n        }\n        return state != State.OPEN;\n    }\n\n    synchronized void onSuccess() {\n        consecutiveFailures = 0;\n        state = State.CLOSED;\n    }\n\n    synchronized void onFailure() {\n        consecutiveFailures++;\n        if (state == State.HALF_OPEN || consecutiveFailures >= failureThreshold) {\n            state = State.OPEN;\n            openedAt = Instant.now();\n        }\n    }\n}',
      },
      {
        kind: 'subheading',
        text: 'Retries: backoff with jitter',
      },
      {
        kind: 'code',
        title: 'Exponential backoff with full jitter',
        code: 'Duration backoffWithJitter(int attempt, Duration base, Duration max) {\n    long capMs = Math.min(max.toMillis(), base.toMillis() * (1L << attempt));   // exponential cap\n    long jitteredMs = ThreadLocalRandom.current().nextLong(capMs + 1);          // full jitter: 0..cap\n    return Duration.ofMillis(jitteredMs);\n}\n\n// attempt 0: up to  base\n// attempt 1: up to  2 * base\n// attempt 2: up to  4 * base   ... capped at `max`',
      },
      {
        kind: 'table',
        caption: 'Retry strategies',
        headers: ['Strategy', 'Behavior', 'Risk'],
        rows: [
          ['Immediate retry', 'Retry instantly, no delay', 'Amplifies load on an already-failing dependency'],
          ['Fixed delay', 'Same wait every attempt', 'Many clients retry in sync — a "thundering herd"'],
          ['Exponential backoff', 'Delay doubles each attempt', 'Still synchronized if all clients started at once'],
          ['Exponential backoff + jitter', 'Delay is randomized within a growing cap', 'Spreads retries out — the standard recommendation'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A retry storm can turn a blip into an outage',
        text: 'If thousands of clients hit a timeout at the same moment and all retry with the same fixed delay, the retries arrive as one synchronized spike — often larger than the load that caused the original failure. This is precisely what jitter exists to prevent: randomizing each client\'s delay spreads the retries out over time instead of re-concentrating them.',
      },
      {
        kind: 'bestPractice',
        title: 'Layer timeout → retry (idempotent only) → circuit breaker, in that order',
        text: 'A single call should: time out quickly, be retried a small, bounded number of times with backoff+jitter if (and only if) it is safe to repeat, and have those retries themselves stopped cold once the circuit breaker trips open. Skipping the circuit breaker means bounded per-call retries still add up to unbounded aggregate load across many callers.',
      },
      {
        kind: 'note',
        text: "Netflix's Hystrix popularized this exact combination for the JVM; its actively-maintained successor is resilience4j, which implements circuit breakers, retries, bulkheads, and rate limiters as composable decorators around a call.",
      },
    ],
    refs: [
      { book: 'release-it', chapter: 'Ch. 5 — Stability Patterns: Circuit Breaker' },
      { book: 'sre-book', chapter: 'Ch. — Addressing Cascading Failures' },
    ],
    related: ['fault-tolerance-patterns', 'bulkheads-and-isolation', 'exactly-once-and-idempotency', 'graceful-degradation-and-load-shedding'],
  },

  {
    id: 'rate-limiting-algorithms',
    domainId: 'sd-reliability',
    title: 'Rate-Limiting Algorithms',
    summary:
      'Rate limiting caps how many requests a client — or the whole system — can make in a time window, protecting downstream capacity and giving predictable, fair pushback instead of an uncontrolled pile-up. **Token bucket**, **leaky bucket**, **fixed window**, and **sliding window** each make a different precision/memory tradeoff.',
    keyPoints: [
      '**Token bucket**: tokens refill at a steady rate up to a cap; a request consumes one token — allows bursts up to the bucket size, then throttles to the refill rate',
      '**Leaky bucket**: requests queue and drain at a fixed rate, smoothing bursts into constant output rather than allowing them through',
      '**Fixed window**: simplest to implement (a counter reset every window) but can let through nearly **2×** the limit right at a window boundary',
      '**Sliding window** (log or weighted counter) fixes the boundary-burst problem at the cost of more memory or computation per check',
      'Rate limiting is applied per-client (fairness), globally (protect a shared resource), or both — often at multiple layers: an API gateway and the service behind it',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Rate-limiting algorithms compared',
        headers: ['Algorithm', 'Allows bursts?', 'Memory per key', 'Boundary problem'],
        rows: [
          ['Fixed window', 'Yes, within a window', 'One counter', 'Up to 2× limit at window edges'],
          ['Sliding window log', 'Smoothly limited', 'One timestamp per request', 'None, but memory scales with request rate'],
          ['Sliding window counter', 'Smoothly limited (approximate)', 'Two counters', 'Small approximation error, cheap'],
          ['Token bucket', 'Yes, up to bucket size', 'One counter + timestamp', 'None — bucket size *is* the burst allowance'],
          ['Leaky bucket', 'No — output is constant-rate', 'A queue', 'None, but adds queueing latency'],
        ],
      },
      {
        kind: 'code',
        title: 'Token bucket',
        code: 'class TokenBucket {\n    private final long capacity;\n    private final double refillPerMs;\n    private double tokens;\n    private long lastRefillMs;\n\n    TokenBucket(long capacity, double refillPerSecond) {\n        this.capacity = capacity;\n        this.refillPerMs = refillPerSecond / 1000.0;\n        this.tokens = capacity;\n        this.lastRefillMs = System.currentTimeMillis();\n    }\n\n    synchronized boolean tryConsume() {\n        long now = System.currentTimeMillis();\n        tokens = Math.min(capacity, tokens + (now - lastRefillMs) * refillPerMs);\n        lastRefillMs = now;\n        if (tokens >= 1) {\n            tokens -= 1;\n            return true;\n        }\n        return false;    // rate limited\n    }\n}',
      },
      {
        kind: 'diagram',
        title: 'Fixed window\'s boundary-burst problem',
        code: 'graph LR\n  A["...09:00:59 - up to N requests"] --> B["09:01:00 window resets"]\n  B --> C["09:01:00-09:01:01 - up to N MORE requests"]\n  C --> D["Up to 2N requests in a 1-2 second span"]',
        caption: 'A client sending N requests at the end of one window and N more at the start of the next slips past a fixed-window limit',
      },
      {
        kind: 'pitfall',
        title: 'Fixed window lets clients double their limit at the edge',
        text: 'If the limit is 100 requests/minute and a client sends 100 requests at 0:59 and another 100 at 1:00, both windows individually stayed within their limit — but 200 requests landed in a two-second span. A sliding window (log or counter) closes this gap by evaluating the limit over a continuously moving interval instead of discrete, resettable buckets.',
      },
      {
        kind: 'bestPractice',
        title: 'Rate-limit as close to the client as possible',
        text: 'Rejecting an over-limit request at the API gateway/edge costs almost nothing — no backend capacity is consumed. Letting it reach the service and get rejected there still spent connection handling, deserialization, and possibly a database round-trip on a request that was always going to be thrown away.',
      },
      {
        kind: 'note',
        text: 'The concrete system-level version of this topic — how much capacity to size, where the counters live (in-memory vs a shared store like Redis), and how to distribute the limiter across many gateway instances — is worked through end-to-end in [[designing-a-rate-limiter-service]].',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 4 — Design a Rate Limiter' },
      { book: 'bytebytego-archive', chapter: 'Ch. — Rate Limiting Algorithms' },
    ],
    related: ['designing-a-rate-limiter-service', 'graceful-degradation-and-load-shedding', 'api-gateways-and-service-discovery', 'cache-stampede-and-hot-keys'],
  },

  {
    id: 'bulkheads-and-isolation',
    domainId: 'sd-reliability',
    title: 'Bulkheads & Isolation',
    summary:
      "A bulkhead partitions resources — thread pools, connection pools, whole service instances — per dependency or tenant, so one overwhelmed or misbehaving part can't exhaust resources the rest of the system needs. Named for the watertight compartments that keep a ship afloat when one section floods.",
    keyPoints: [
      "Without isolation, one slow dependency can exhaust a shared thread pool, blocking requests to *healthy* dependencies too — \"one slow call takes down everything\"",
      'A thread-pool-per-dependency (or per-tenant) bulkhead guarantees a misbehaving one can only ever exhaust its *own* pool',
      "Bulkheads and circuit breakers compose: isolation limits the **blast radius** of a failure, the breaker limits its **duration**",
      'Applies at multiple granularities: thread pools within a process, connection pools to a database, or entire service instances/clusters dedicated per tenant',
      'The cost of isolation is reduced resource-sharing efficiency — a pool sized for its own worst case sits partly idle most of the time',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Shared pool vs bulkheaded pools',
        code: 'graph TD\n  subgraph Shared pool - no isolation\n    R1[Request to Dependency A] --> P1[Shared thread pool]\n    R2[Request to Dependency B] --> P1\n    P1 -->|A is slow, pool exhausted| X["B requests also blocked"]\n  end\n  subgraph Bulkheaded - isolated pools\n    R3[Request to Dependency A] --> PA[Pool A]\n    R4[Request to Dependency B] --> PB[Pool B]\n    PA -->|A is slow, PA exhausted| Y["Only A-bound requests affected"]\n  end',
        caption: 'Isolating pools per dependency contains a slowdown to only the requests that actually need the slow dependency',
      },
      {
        kind: 'code',
        title: 'A thread-pool bulkhead per dependency',
        code: 'class Bulkheads {\n    private final Map<String, ExecutorService> pools = new ConcurrentHashMap<>();\n\n    ExecutorService poolFor(String dependency, int size) {\n        return pools.computeIfAbsent(dependency,\n            d -> Executors.newFixedThreadPool(size));    // isolated queue + threads per dependency\n    }\n\n    <T> Future<T> call(String dependency, int poolSize, Callable<T> work) {\n        return poolFor(dependency, poolSize).submit(work);\n        // A slow/stuck `work` for "dependency" can only starve THIS pool, not the others.\n    }\n}',
      },
      {
        kind: 'table',
        caption: 'Isolation granularity',
        headers: ['Level', 'Isolates', 'Typical mechanism'],
        rows: [
          ['Thread pool', 'One dependency\'s calls from another\'s, within a process', 'Per-dependency ExecutorService, resilience4j Bulkhead'],
          ['Connection pool', 'One database/service\'s connections from another\'s', 'Separate HikariCP pools per datasource'],
          ['Process/container', 'One tenant\'s workload from another\'s, on shared hardware', 'cgroups, container resource limits'],
          ['Service instance/cluster', 'A noisy tenant from all others entirely', 'Dedicated deployment per large tenant'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A shared connection pool is a bulkhead nobody remembered to build',
        text: 'It\'s common to isolate thread pools per external call but leave a single, shared JDBC connection pool serving every code path — a slow query pattern in one feature can exhaust that shared pool exactly like an unisolated thread pool, taking down unrelated features that also need a database connection.',
      },
      {
        kind: 'bestPractice',
        title: "Size each bulkhead from that dependency's own capacity, not a generic default",
        text: 'A pool sized too small under-utilizes a fast, reliable dependency; sized too large, it defeats the point of isolating a slow one. Size it against the dependency\'s actual observed latency and the calling service\'s target throughput — a back-of-envelope pass ([[back-of-envelope-estimation]]) is usually enough to get in the right range.',
      },
      {
        kind: 'note',
        text: 'This is one of the eleven stability patterns Michael Nygard catalogs in *Release It!* — alongside the circuit breaker, it\'s one of the two most load-bearing ones in that catalog for day-to-day production reliability.',
      },
    ],
    refs: [
      { book: 'release-it', chapter: 'Ch. 5 — Stability Patterns: Bulkheads' },
      { book: 'sre-book', chapter: 'Ch. — Managing Overload' },
    ],
    related: ['fault-tolerance-patterns', 'circuit-breakers-and-retries', 'back-of-envelope-estimation'],
  },

  {
    id: 'chaos-engineering',
    domainId: 'sd-reliability',
    title: 'Chaos Engineering',
    summary:
      'Chaos engineering deliberately injects failure into a production or production-like system to verify that the fault-tolerance mechanisms you built actually work — replacing "we assume this handles failure" with a tested fact.',
    keyPoints: [
      "Popularized by Netflix's **Chaos Monkey**, which randomly terminates production instances during business hours, forcing resilience to be continuously exercised rather than assumed",
      'A chaos experiment starts with a **hypothesis** ("the system keeps serving normally if X fails"), a deliberately small **blast radius**, and an automatic **abort** if steady-state metrics degrade past a threshold',
      '**Game days**: scheduled, deliberate failure-injection exercises with the team watching and ready to intervene — distinct from always-on, automated chaos tooling',
      'Chaos engineering validates the *other* patterns in this domain — circuit breakers, bulkheads, retries — actually fire correctly under real conditions, not just in unit tests written against ideal assumptions',
      "Requires solid observability first ([[monitoring-and-metrics]]) — an experiment you can't observe teaches nothing, and might hide a real incident inside the noise",
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A test suite proves code does what it\'s supposed to under conditions the author thought to simulate. Chaos engineering inverts that: it injects real failure conditions — killed instances, added latency, dropped packets, a full region going dark — into a live system and observes whether the resilience mechanisms actually hold, rather than trusting that they will.',
      },
      {
        kind: 'subheading',
        text: 'Running an experiment safely',
      },
      {
        kind: 'diagram',
        title: 'The chaos experiment loop',
        code: 'flowchart TD\n  A[Define steady-state metric] --> B[Form a hypothesis]\n  B --> C[Choose the smallest useful blast radius]\n  C --> D[Inject the failure]\n  D --> E{Steady-state holds?}\n  E -->|Yes| F[Hypothesis confirmed - expand scope next time]\n  E -->|No| G[Abort immediately, fix the weakness]',
        caption: 'Every run has an automatic abort condition, tied to the same metrics used to confirm the hypothesis',
      },
      {
        kind: 'table',
        caption: 'Common chaos tooling categories',
        headers: ['Tool type', 'Injects', 'Validates'],
        rows: [
          ['Instance/pod termination', 'Kill a running instance', 'Redundancy, health checks, load balancer failover'],
          ['Latency injection', 'Add artificial delay to a dependency call', 'Timeouts, circuit breakers'],
          ['Error injection', 'Force a percentage of calls to fail', 'Retries, fallbacks, circuit breakers'],
          ['Region/AZ failure', 'Simulate an entire region going dark', 'Multi-region failover ([[multi-region-architecture]])'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Chaos without an abort mechanism is just an outage',
        text: "Injecting failure into production without a way to automatically detect \"this experiment is causing real customer harm\" and stop it immediately turns a controlled learning exercise into an uncontrolled incident. The abort condition is not optional — it's what makes the difference between chaos *engineering* and just breaking things.",
      },
      {
        kind: 'bestPractice',
        title: 'Start in staging with a tiny blast radius, earn your way to production',
        text: 'Run the first version of any experiment against a single instance in a non-production environment, confirm the tooling and abort mechanism work as expected, then expand scope — first to a small percentage of production traffic, eventually to the full validation Netflix-style tools run continuously. Confidence is built incrementally, not assumed.',
      },
      {
        kind: 'note',
        text: "This is squarely a validation practice, not a replacement for [[fault-tolerance-patterns]] — chaos engineering finds where those patterns are missing or misconfigured; it doesn't design them in the first place.",
      },
    ],
    refs: [
      { book: 'sre-book', chapter: 'Ch. — Testing for Reliability' },
      { book: 'release-it', chapter: 'Ch. — Adaptation (Chaos and Game Days)' },
    ],
    related: ['fault-tolerance-patterns', 'monitoring-and-metrics', 'multi-region-architecture'],
  },

  {
    id: 'graceful-degradation-and-load-shedding',
    domainId: 'sd-reliability',
    title: 'Graceful Degradation & Load Shedding',
    summary:
      'When a system is overloaded, the choice isn\'t "healthy vs. down" — degrading gracefully (serving a cheaper, partial response) or shedding load (rejecting the least valuable requests first) keeps the system serving *something* instead of collapsing entirely under load it can\'t handle.',
    keyPoints: [
      'Graceful degradation: turn off expensive, non-essential features (personalized recommendations, live counts) under load, while keeping the core function working',
      'Load shedding: reject requests outright once past a capacity threshold, deliberately choosing *which* to drop — lowest priority, non-authenticated, non-revenue-generating traffic first',
      "Shedding load **early** — before it consumes resources — protects the system's ability to serve the requests it does accept at full quality",
      '"Fail open" vs "fail closed" is a related decision for any protective mechanism: if the rate limiter itself fails, does traffic flow through unchecked (fail open, protects availability) or get blocked (fail closed, protects the backend)?',
      'This is a design decision made in advance, with explicit priority tiers, not an ad hoc reaction improvised during an incident',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Overload response decision',
        code: 'flowchart TD\n  A[Incoming request] --> B{System load healthy?}\n  B -->|Yes| C[Serve full response]\n  B -->|No| D{Request priority?}\n  D -->|High - e.g. checkout| E[Serve, possibly degraded features]\n  D -->|Low - e.g. recommendations| F[Shed: reject fast with 503]',
        caption: 'Priority is decided in advance, not improvised while the incident is happening',
      },
      {
        kind: 'table',
        caption: 'Graceful degradation examples',
        headers: ['Product', 'Full feature', 'Degraded under load'],
        rows: [
          ['E-commerce checkout', 'Personalized "you may also like"', 'Static/cached recommendations, or hidden entirely'],
          ['Social feed', 'Real-time like/comment counts', 'Cached, slightly-stale counts'],
          ['Search', 'Full ranking with all signals', 'Simpler ranking, or cached top results'],
          ['Video streaming', 'Highest available bitrate', 'Lower bitrate, same content'],
        ],
      },
      {
        kind: 'code',
        title: 'Priority-based load shedding',
        code: 'boolean shouldShed(Request req, SystemLoad load) {\n    if (load.utilization() < 0.8) return false;               // healthy — serve everyone\n    if (load.utilization() > 0.95) return req.priority() != Priority.CRITICAL; // shed all but critical\n    return req.priority() == Priority.LOW;                     // moderate overload — shed only low priority\n}',
      },
      {
        kind: 'pitfall',
        title: 'Treating over-provisioning as the only overload strategy',
        text: "Buying enough capacity for the worst plausible spike works until a spike exceeds \"plausible\" — a viral post, a flash sale, a retry storm from an upstream outage. Without a degradation and shedding plan, the only lever available during an unexpectedly large spike is more hardware, which usually can't be provisioned fast enough to matter.",
      },
      {
        kind: 'bestPractice',
        title: 'Decide priority tiers and degradation levels at design time',
        text: "Which features are core vs. optional, and which traffic gets served first under pressure, are product and business decisions — they need to be made and agreed on before an incident, encoded directly into the request-handling path, not decided under pressure by whoever is paged at 3am.",
      },
      {
        kind: 'note',
        text: 'This is the systemic complement to [[rate-limiting-algorithms]] (which caps *how much* gets through) and [[circuit-breakers-and-retries]] (which protects against *specific failing dependencies*) — graceful degradation is about what the system does with the load it does accept, once it is running hot.',
      },
    ],
    refs: [
      { book: 'sre-book', chapter: 'Ch. — Handling Overload' },
      { book: 'release-it', chapter: 'Ch. — Handling Traffic Beyond Capacity' },
    ],
    related: ['rate-limiting-algorithms', 'circuit-breakers-and-retries', 'capacity-planning'],
  },
]
