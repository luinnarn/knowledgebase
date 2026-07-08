import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'scalability-fundamentals',
    domainId: 'sd-foundations',
    title: 'Scalability Fundamentals',
    summary:
      'Scaling **vertically** (a bigger machine) always hits a ceiling; scaling **horizontally** (more machines) is the only path past it — but it turns every design problem into a distributed one.',
    keyPoints: [
      'Vertical scaling: more CPU/RAM/disk on one box — simple, no distributed-systems complexity, but bounded by the biggest machine money can buy',
      'Horizontal scaling: more machines sharing the load — unbounded in principle, but requires load balancing, partitioning, and coordination',
      '**Latency** is the time for one request; **throughput** is requests handled per unit time — a system can improve one while making the other worse',
      'Averages hide the story: always reason in **percentiles** (p50/p99/p999) — a p99 ten times the p50 means 1-in-100 users have a bad time',
      "**Little's Law**: average concurrent requests = throughput × average latency — a fixed worker pool caps throughput once latency rises",
      'Most real systems are throughput-bound in one component (a database) and latency-bound in another (a synchronous downstream call) at the same time',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Vertical vs horizontal scaling',
        headers: ['', 'Vertical (scale up)', 'Horizontal (scale out)'],
        rows: [
          ['Mechanism', 'Bigger machine', 'More machines'],
          ['Ceiling', 'Hard limit (largest available hardware)', 'No inherent limit'],
          ['Complexity added', 'None — same single-node code', 'Load balancing, partitioning, coordination, partial failure'],
          ['Failure mode', 'One machine, one point of failure', 'Redundancy possible — a node can die without an outage'],
          ['Typical use', 'Databases with strong consistency needs, legacy monoliths', 'Stateless services, web tiers, most modern backends'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Horizontal scaling: one entry point, many workers',
        code: 'flowchart TD\n  C[Client] --> LB[Load Balancer]\n  LB --> S1[Server 1]\n  LB --> S2[Server 2]\n  LB --> S3[Server 3]\n  S1 --> D[(Shared Database)]\n  S2 --> D\n  S3 --> D',
        caption: 'Adding servers behind a load balancer scales throughput; the shared database often becomes the next bottleneck',
      },
      {
        kind: 'paragraph',
        text: 'A system that reports "average latency: 80ms" can still be unusable for a meaningful slice of users. If p50 is 80ms but p99 is 4 seconds, 1% of requests — potentially thousands per minute at scale — are hitting that slow path. Percentiles are what SLAs are built on ([[availability-and-slas]]), not averages.',
      },
      {
        kind: 'code',
        title: 'Percentile from a batch of latency samples',
        code: 'static long percentile(long[] latenciesMs, double p) {\n    long[] sorted = latenciesMs.clone();\n    Arrays.sort(sorted);\n    int index = (int) Math.ceil(p / 100.0 * sorted.length) - 1;\n    return sorted[Math.max(index, 0)];\n}\n\n// percentile(samples, 50) -> p50, percentile(samples, 99) -> p99',
        caption: 'A quick-and-dirty percentile calculation; production systems use streaming approximations (t-digest, HdrHistogram) instead of sorting every sample',
      },
      {
        kind: 'pitfall',
        title: 'Chasing average latency instead of the tail',
        text: 'Optimizing for the mean can make the tail worse: a change that speeds up the common case by adding a cache might occasionally trigger a slow cold-miss path, dragging p99 up even as the average drops. Always check whether an optimization improves or degrades the percentile that actually matters for your SLA.',
      },
      {
        kind: 'note',
        title: "Little's Law in practice",
        text: "L = λ × W: the average number of requests in flight (L) equals the arrival rate (λ) times the average time each request spends in the system (W). If a thread pool has 200 workers and each request takes 100ms, the pool can sustain roughly 2000 requests/second — push past that and requests queue, and queueing time gets added on top of W, compounding the problem.",
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Scale From Zero to Millions of Users' },
      { book: 'bytebytego-archive', chapter: 'Fundamentals — Latency vs Throughput' },
    ],
    related: ['back-of-envelope-estimation', 'horizontal-vs-vertical-scaling', 'availability-and-slas'],
  },

  {
    id: 'back-of-envelope-estimation',
    domainId: 'sd-foundations',
    title: 'Back-of-Envelope Estimation',
    summary:
      'Before designing anything, size it: rough QPS, storage, and bandwidth numbers derived from user counts turn "make it fast" into concrete, checkable design constraints.',
    keyPoints: [
      'Start from DAU (daily active users) × actions/user/day to get total daily requests, then divide by 86,400 seconds for average QPS',
      'Peak QPS is typically 2-3× average QPS — traffic is not uniform across the day',
      'Storage estimate = new records/day × average record size × retention period, then multiply by the **replication factor**',
      'Memorize the powers-of-two cheat sheet: 2¹⁰ ≈ 10³ (KB), 2²⁰ ≈ 10⁶ (MB), 2³⁰ ≈ 10⁹ (GB), 2⁴⁰ ≈ 10¹² (TB)',
      'The goal is order-of-magnitude, not precision — round aggressively (500M users → "call it 10⁹") and sanity-check the final number against known references',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Powers-of-two cheat sheet',
        headers: ['Power', 'Exact value', 'Approx.'],
        rows: [
          ['2¹⁰', '1,024', '1 thousand (KB)'],
          ['2²⁰', '1,048,576', '1 million (MB)'],
          ['2³⁰', '~1.07 billion', '1 billion (GB)'],
          ['2⁴⁰', '~1.1 trillion', '1 trillion (TB)'],
        ],
      },
      {
        kind: 'code',
        title: 'A worked storage estimate',
        code: 'long dailyActiveUsers = 50_000_000L;\nint postsPerUserPerDay = 2;\nint avgPostSizeBytes = 500;      // text + metadata\nint retentionDays = 365 * 5;      // 5-year retention\nint replicationFactor = 3;\n\nlong dailyPosts = dailyActiveUsers * postsPerUserPerDay;\nlong dailyStorageBytes = dailyPosts * avgPostSizeBytes;\nlong totalStorageBytes = dailyStorageBytes * retentionDays * replicationFactor;\n\n// ~50M * 2 * 500B * 1825 days * 3 replicas =~ 274 PB — time to talk about sharding',
        caption: 'Every input is a rounded guess; the output is meant to reveal orders of magnitude, not a precise figure',
      },
      {
        kind: 'paragraph',
        text: "A useful discipline: derive **QPS**, **storage**, and **bandwidth** separately, since each stresses a different part of the system. QPS stresses compute and connection handling ([[load-balancing]]); storage stresses disk and [[database-sharding-and-partitioning|partitioning]]; bandwidth stresses network links and can surface surprising bottlenecks (e.g. video upload traffic saturating an origin's NIC well before its CPU is stressed).",
      },
      {
        kind: 'bestPractice',
        title: 'State assumptions explicitly, then round',
        text: 'Write down every assumption (DAU, actions/user, average payload size, retention) before multiplying anything. This makes the estimate auditable — a reviewer can spot "that retention period seems too long" — and makes it trivial to redo the math when a real assumption changes.',
      },
      {
        kind: 'pitfall',
        title: 'Forgetting the replication factor',
        text: 'A raw data estimate is only the logical size. Real storage needs 2-3× that for replication (durability), plus overhead for indexes and any denormalized copies — skipping this multiplier is the single most common estimation mistake, and it is not a small rounding error.',
      },
    ],
    refs: [
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Back-of-the-Envelope Estimation' },
      { book: 'grokking-sdi', chapter: 'Key Concepts — Capacity Estimation' },
    ],
    related: ['scalability-fundamentals', 'capacity-planning', 'designing-a-url-shortener'],
  },

  {
    id: 'cap-theorem',
    domainId: 'sd-foundations',
    title: 'CAP Theorem',
    summary:
      'During a network partition, a distributed system must choose between **Consistency** and **Availability** — it cannot have both. Outside a partition, both are attainable; CAP is a statement about behavior under failure, not a permanent label.',
    keyPoints: [
      'CAP: Consistency (every read sees the latest write), Availability (every request gets a non-error response), Partition tolerance (the system keeps working despite dropped/delayed messages between nodes)',
      'Partition tolerance is not really optional for a system spanning more than one machine — networks partition — so CAP in practice is a choice between C and A **during** a partition',
      'CP systems (e.g. ZooKeeper, HBase, etcd): a minority partition refuses to serve reads/writes rather than risk returning stale or conflicting data',
      'AP systems (e.g. Cassandra, DynamoDB): every partition keeps serving, accepting that replicas may diverge until reconciled afterward',
      "PACELC extends CAP: **E**lse (no partition), there is still a tradeoff between **L**atency and **C**onsistency — coordinating for strong consistency costs latency even when nothing is broken",
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A network partition splits the cluster in two',
        code: 'flowchart TD\n  subgraph "Region A (majority)"\n    A1[Node 1]\n    A2[Node 2]\n  end\n  subgraph "Region B (minority)"\n    B1[Node 3]\n  end\n  A1 <-.->|"partition: link down"| B1\n  Client1[Client] --> A1\n  Client2[Client] --> B1',
        caption: 'A CP system blocks writes on the minority side (Node 3); an AP system keeps serving on both sides and reconciles later',
      },
      {
        kind: 'table',
        caption: 'CP vs AP, by example',
        headers: ['', 'CP (consistency-first)', 'AP (availability-first)'],
        rows: [
          ['Behavior under partition', 'Minority side refuses requests', 'Both sides keep serving'],
          ['Data risk', 'None — no divergence allowed', 'Divergent writes, reconciled later'],
          ['Examples', 'ZooKeeper, etcd, HBase', 'Cassandra, DynamoDB, Riak'],
          ['Good fit', 'Configuration, leader election, financial ledgers', 'Shopping carts, social feeds, presence status'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Treating CAP as a permanent architecture label',
        text: 'CAP describes what happens **during a partition**, not a system-wide personality. Many real databases are tunable per-operation (e.g. choosing quorum read/write settings, [[quorum-systems]]) — the same cluster can serve some requests CP-style and others AP-style. Calling a whole system "a CP database" glosses over that nuance.',
      },
      {
        kind: 'note',
        title: 'PACELC: the tradeoff CAP leaves out',
        text: "CAP only describes partition behavior. PACELC says: if Partitioned, choose Availability or Consistency (that's CAP); Else (network is fine), choose Latency or Consistency — because even healthy-network strong consistency requires coordinating with other replicas before acknowledging a write, and that coordination costs time. A system optimized for low latency in the normal case is implicitly leaning AP-ish even when there's no partition at all.",
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 9 — Consistency and Consensus' },
      { book: 'sdi-vol1', chapter: 'Ch. 1 — CAP Theorem' },
    ],
    related: ['consistency-models', 'quorum-systems', 'database-replication'],
  },

  {
    id: 'consistency-models',
    domainId: 'sd-foundations',
    title: 'Consistency Models',
    summary:
      'A spectrum from **strong** (every read sees the latest write) to **eventual** (replicas converge with no bound on when) — with practical stops in between that most real systems actually rely on.',
    keyPoints: [
      'Strong (linearizable) consistency: reads always reflect the most recent acknowledged write, as if there were a single copy of the data — requires coordination, costs latency',
      'Eventual consistency: replicas converge given enough time and no new writes, but offer no guarantee about *when* — cheap and highly available, but stale reads are possible',
      'Causal consistency: preserves cause-and-effect ordering (a reply is never visible before the comment it replies to) without paying for full linearizability',
      'Session guarantees — **read-your-own-writes** and **monotonic reads** — are a practical middle ground: a user never sees their own change disappear or time travel backward',
      'Stronger consistency generally means higher write latency and reduced availability under partition ([[cap-theorem]]) — the choice is a tradeoff, not a strictly-better option',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The consistency spectrum',
        headers: ['Model', 'Guarantee', 'Cost'],
        rows: [
          ['Strong / linearizable', 'Every read sees the latest write', 'Highest — coordination on every op'],
          ['Causal', 'Cause precedes effect, always', 'Moderate — needs dependency tracking'],
          ['Read-your-writes', 'You always see your own recent writes', 'Low — sticky routing or version tokens'],
          ['Eventual', 'Converges given time, no ordering promised', 'Lowest — no coordination needed'],
        ],
      },
      {
        kind: 'diagram',
        title: 'A stale read after a write, under eventual consistency',
        code: 'sequenceDiagram\n  participant User\n  participant Primary\n  participant Replica\n  User->>Primary: write(profile.name = "Ada")\n  Primary-->>User: ack\n  Primary-->>Replica: replicate (async, in flight)\n  User->>Replica: read(profile.name)\n  Replica-->>User: "old name" (stale)\n  Primary-->>Replica: replicate completes',
        caption: 'The write already succeeded from the user\'s point of view, but a read routed to a lagging replica still returns the old value',
      },
      {
        kind: 'pitfall',
        title: 'Load-balanced reads silently break read-your-writes',
        text: 'If reads are load-balanced across replicas without any session affinity, a user can write a change, then have their very next read routed to a replica that has not caught up yet — making their own update appear to have vanished. Fixing this needs either sticky routing to the replica that served the write, or a version token the client passes along so the read waits until the replica catches up to it.',
      },
      {
        kind: 'code',
        title: 'A minimal read-your-writes token',
        code: 'class VersionedSession {\n    private volatile long lastWriteVersion = 0;\n\n    long recordWrite(long versionFromPrimary) {\n        lastWriteVersion = Math.max(lastWriteVersion, versionFromPrimary);\n        return lastWriteVersion;\n    }\n\n    // Replica read waits (or retries) until its applied version >= lastWriteVersion.\n    boolean replicaCanServe(long replicaAppliedVersion) {\n        return replicaAppliedVersion >= lastWriteVersion;\n    }\n}',
        caption: 'The client (or a session-aware proxy) tracks the version of its own last write and requires a replica to have caught up before reading from it',
      },
      {
        kind: 'note',
        text: 'This ties directly back to [[cap-theorem]] and [[quorum-systems]]: a strong-consistency read is really just "wait for enough replicas to agree before answering," and every consistency model here is a different answer to how much waiting is worth paying for.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 5 — Replication (Problems with Replication Lag)' },
      { book: 'sdi-vol2', chapter: 'Ch. 1 — Consistency Patterns' },
    ],
    related: ['cap-theorem', 'database-replication', 'distributed-transactions'],
  },

  {
    id: 'availability-and-slas',
    domainId: 'sd-foundations',
    title: 'Availability & SLAs',
    summary:
      'Availability is measured in "nines"; SLIs (what you measure) roll up into SLOs (your internal target) and SLAs (the external, often contractual, promise) — and every dependency in a chain multiplies the total.',
    keyPoints: [
      'Availability = uptime ÷ total time. "Three nines" (99.9%) allows ~8.7 hours of downtime per year; "five nines" (99.999%) allows ~5 minutes',
      'SLI (Service Level Indicator): a measured metric, e.g. successful-request ratio. SLO (Objective): the internal target for that SLI. SLA (Agreement): the external, often penalty-backed promise — usually looser than the SLO to leave margin',
      'An **error budget** is 1 − SLO: the amount of unreliability you are allowed to spend; once exhausted, many orgs pause feature launches in favor of reliability work',
      'Availability composes **multiplicatively** across a dependency chain: three services each at 99.9% give a combined 0.999³ ≈ 99.7%, not 99.9%',
      "Redundancy (N+1 capacity, active-active regions) is what actually buys higher availability — there is no amount of \"trying harder\" that gets a single instance to five nines",
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Downtime budget by "nines"',
        headers: ['Availability', 'Downtime / year', 'Downtime / month'],
        rows: [
          ['99% (two nines)', '~3.65 days', '~7.3 hours'],
          ['99.9% (three nines)', '~8.76 hours', '~43.8 minutes'],
          ['99.99% (four nines)', '~52.6 minutes', '~4.4 minutes'],
          ['99.999% (five nines)', '~5.3 minutes', '~26 seconds'],
        ],
      },
      {
        kind: 'diagram',
        title: 'Availability multiplies across a request chain',
        code: 'flowchart LR\n  U[User] --> GW["API Gateway (99.95%)"]\n  GW --> SV["Service (99.9%)"]\n  SV --> DB["Database (99.99%)"]\n  DB --> SV\n  SV --> GW\n  GW --> U',
        caption: 'Combined availability ≈ 0.9995 × 0.999 × 0.9999 ≈ 99.84% — lower than any single link',
      },
      {
        kind: 'pitfall',
        title: "A dependency's SLA does not become yours automatically",
        text: "If a downstream provider guarantees 99.99%, your own service that calls it — plus its own logic, plus a database, plus a network hop — cannot exceed that number, and will typically be lower once every link in the chain is multiplied. Quoting a customer-facing SLA equal to (or above) a critical dependency's SLA, without accounting for your own added failure surface, is a common and expensive mistake.",
      },
      {
        kind: 'note',
        title: 'Error budgets turn reliability into a shared, spendable resource',
        text: 'Treating the gap between 100% and the SLO as a budget — rather than "zero incidents, always" — gives teams a rational way to balance shipping velocity against reliability: burn the budget on risky launches when there is room, and freeze on reliability work when it runs out. This reframes outages from a blame event into an expected, budgeted cost of moving fast.',
      },
    ],
    refs: [
      { book: 'sre-book', chapter: 'Ch. 3-4 — Embracing Risk; Service Level Objectives' },
      { book: 'sdi-vol1', chapter: 'Ch. 1 — Availability' },
    ],
    related: ['monitoring-and-metrics', 'incident-management-and-postmortems', 'multi-region-architecture'],
  },
]
