import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'consensus-algorithms',
    domainId: 'sd-distributed-theory',
    title: 'Consensus Algorithms',
    summary:
      'Consensus lets a cluster of unreliable, possibly-partitioned nodes agree on a single value — a leader, a log entry, a committed transaction — with a provable guarantee that a majority quorum tolerates the rest failing. **Raft** is the algorithm most systems actually implement; Paxos proved it was possible first.',
    keyPoints: [
      'Every decision needs agreement from a **majority** (quorum) of nodes — a minority can crash or partition away without breaking correctness',
      'Raft splits the problem into three understandable pieces: leader election, log replication, and safety',
      'A monotonically increasing **term** number acts as a logical clock — at most one leader per term, enforced by nodes rejecting stale-term messages',
      'A log entry is only committed once replicated to a majority; only then does the leader apply it and reply to the client',
      "Paxos proves consensus is *possible* with majority quorums; Raft is deliberately engineered so it's implementable without a PhD",
      "Real systems rarely hand-roll this: etcd and Consul (Raft), ZooKeeper (Zab, a Paxos relative), and Kafka's KRaft controller all lean on a battle-tested implementation",
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A single node deciding something is trivial; the hard part is a **cluster** of nodes — any of which can crash, with network links that can partition — agreeing on one value without ever disagreeing about what was decided. Consensus algorithms solve exactly this, and they sit under almost every strongly-consistent distributed system: replicated logs, leader election, distributed locks, configuration stores.',
      },
      {
        kind: 'subheading',
        text: 'Raft: leader election',
      },
      {
        kind: 'paragraph',
        text: 'Every node is a **follower**, **candidate**, or **leader**. Followers expect periodic heartbeats from a leader; if a randomized election timeout (typically 150-300ms, randomized to avoid tied elections) elapses with none, a follower becomes a candidate, increments its term, votes for itself, and requests votes from the rest of the cluster. Whichever candidate secures a majority becomes leader for that term.',
      },
      {
        kind: 'diagram',
        title: 'Raft leader election',
        code: 'sequenceDiagram\n  participant A as Follower A\n  participant B as Follower B\n  participant C as Follower C (candidate)\n  Note over C: election timeout elapses\n  C->>C: increment term, vote for self\n  C->>A: RequestVote(term)\n  C->>B: RequestVote(term)\n  A-->>C: vote granted\n  B-->>C: vote granted\n  Note over C: majority reached, becomes leader\n  C->>A: AppendEntries (heartbeat)\n  C->>B: AppendEntries (heartbeat)',
        caption: 'A candidate that wins a majority of votes becomes leader for that term',
      },
      {
        kind: 'code',
        title: 'Simplified RequestVote handling',
        code: 'boolean handleRequestVote(long candidateTerm, String candidateId, long candidateLastLogIndex) {\n    if (candidateTerm < currentTerm) return false;              // stale candidate\n    if (candidateTerm > currentTerm) {\n        currentTerm = candidateTerm;\n        votedFor = null;                                          // new term, vote resets\n    }\n    boolean logIsUpToDate = candidateLastLogIndex >= myLastLogIndex();\n    if ((votedFor == null || votedFor.equals(candidateId)) && logIsUpToDate) {\n        votedFor = candidateId;\n        return true;\n    }\n    return false;\n}',
      },
      {
        kind: 'subheading',
        text: 'Safety: why a committed entry never disappears',
      },
      {
        kind: 'paragraph',
        text: "The leader appends new entries to its log and replicates them to followers; once a **majority** has the entry, the leader marks it committed. Because any future leader must also win votes from a majority, and any two majorities overlap in at least one node, a future leader is guaranteed to have seen every previously committed entry — it cannot win an election without it. This majority-overlap property is the same idea [[quorum-systems]] generalizes to ordinary reads and writes.",
      },
      {
        kind: 'table',
        caption: 'Paxos vs Raft',
        headers: ['', 'Paxos', 'Raft'],
        rows: [
          ['Goal', 'Prove consensus is achievable with majority quorums', 'Make consensus implementable and debuggable'],
          ['Structure', 'Single decree, extended awkwardly to logs (Multi-Paxos)', 'Purpose-built for replicated logs from the start'],
          ['Leader', 'Implicit, re-derived per instance, hard to reason about', 'Explicit, elected, holds the log until it fails'],
          ['Used by', 'Chubby, Spanner (variants)', 'etcd, Consul, CockroachDB, Kafka (KRaft)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A network partition can still leave two nodes *believing* they lead',
        text: "If the network splits, the minority side's leader keeps sending heartbeats until it notices they aren't being acknowledged — but it cannot commit anything meanwhile, since committing requires a majority ack it no longer has. Raft doesn't stop a cut-off node from *believing* it's leader; the term number lets the rest of the cluster reject its stale writes once the partition heals and it re-joins with an out-of-date term.",
      },
      {
        kind: 'bestPractice',
        title: "Use an existing implementation — don't hand-roll Raft",
        text: "Raft's pseudocode looks approachable, but the edge cases (log compaction, cluster membership changes, a leader restarting mid-partition) are exactly where subtle correctness bugs live. Reach for etcd, Consul, or a JVM library like Ratis rather than implementing the paper directly, unless building a correct consensus algorithm *is* the project.",
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 9 — Consistency and Consensus' },
      { book: 'designing-distributed-systems', chapter: 'Ch. — Distributed Coordination' },
    ],
    related: ['quorum-systems', 'distributed-locking', 'database-replication', 'clock-synchronization-and-ordering'],
  },

  {
    id: 'distributed-transactions',
    domainId: 'sd-distributed-theory',
    title: 'Distributed Transactions',
    summary:
      'Committing a change across multiple independent services or shards atomically — all-or-nothing — without a single database to lean on. **Two-phase commit (2PC)** is the classical blocking protocol; the **saga pattern** trades atomicity for availability by sequencing local transactions with compensating actions.',
    keyPoints: [
      '2PC has a coordinator ask every participant to *prepare* (lock resources, promise to commit), then tell them all to *commit* only if everyone agreed',
      "2PC's fatal weakness: if the coordinator crashes after some participants prepare but before it sends commit/abort, those participants block holding locks indefinitely",
      'Sagas replace one distributed transaction with a sequence of local transactions, each with a **compensating action** to undo it if a later step fails',
      'Sagas give up isolation — intermediate states are visible to other transactions — in exchange for not blocking on a coordinator',
      'Idempotent operations ([[exactly-once-and-idempotency]]) are what make retrying a saga step (or a crashed 2PC participant) safe',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: "A single database gives you transactions for free. The moment a change spans two databases, two services, or two shards, you have to build that atomicity guarantee back yourself — and the two dominant answers, 2PC and sagas, sit at opposite ends of a consistency/availability tradeoff.",
      },
      {
        kind: 'subheading',
        text: 'Two-phase commit',
      },
      {
        kind: 'diagram',
        title: 'Two-phase commit: prepare then commit',
        code: 'sequenceDiagram\n  participant C as Coordinator\n  participant A as Participant A\n  participant B as Participant B\n  C->>A: prepare\n  C->>B: prepare\n  A-->>C: vote yes (locked, logged)\n  B-->>C: vote yes (locked, logged)\n  Note over C: all voted yes -> decide commit\n  C->>A: commit\n  C->>B: commit\n  A-->>C: ack\n  B-->>C: ack',
        caption: 'If any participant votes no, the coordinator sends abort to everyone instead',
      },
      {
        kind: 'paragraph',
        text: "Every participant that votes yes must hold its locks and survive a crash with that promise durably logged — it cannot unilaterally decide to commit or abort afterward, only the coordinator's final word matters. That is exactly the problem: if the coordinator dies after collecting votes but before broadcasting the decision, every prepared participant is stuck holding locks, unable to proceed, waiting for a coordinator that may never come back. This is why 2PC is called a **blocking** protocol.",
      },
      {
        kind: 'subheading',
        text: 'Sagas: local transactions plus compensation',
      },
      {
        kind: 'code',
        title: 'A saga as an explicit list of steps and compensations',
        code: 'interface SagaStep {\n    void execute();\n    void compensate();     // undo, called if a LATER step fails\n}\n\nvoid runSaga(List<SagaStep> steps) {\n    Deque<SagaStep> completed = new ArrayDeque<>();\n    try {\n        for (SagaStep step : steps) {\n            step.execute();\n            completed.push(step);\n        }\n    } catch (Exception e) {\n        while (!completed.isEmpty()) {\n            completed.pop().compensate();   // unwind in reverse order\n        }\n        throw new SagaFailedException(e);\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: "A typical order-placement saga: reserve inventory, charge payment, schedule shipping. If shipping scheduling fails, the saga runs compensations in reverse — refund the payment, release the inventory reservation — rather than one giant lock held across all three services for the whole duration.",
      },
      {
        kind: 'table',
        caption: '2PC vs sagas',
        headers: ['', 'Two-phase commit', 'Saga'],
        rows: [
          ['Atomicity', 'True all-or-nothing, enforced by locks', 'Eventual — a failure partway is *undone*, not prevented'],
          ['Isolation', 'Full — nothing sees intermediate state', "None — other transactions can see a saga's partial progress"],
          ['Failure mode', 'Blocks: prepared participants wait forever for the coordinator', 'Never blocks — always makes forward or compensating progress'],
          ['Fits', 'A single trusted coordinator, low-latency network, few participants', 'Microservices, long-running or cross-organization workflows'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A saga step must be retried, so it must be idempotent',
        text: 'If "charge payment" fails to receive a response (network timeout, not necessarily a real failure) and the saga runner retries it, an accidental non-idempotent implementation double-charges the customer. Every saga step and compensation must be safe to run more than once — see [[exactly-once-and-idempotency]] for the standard idempotency-key technique.',
      },
      {
        kind: 'note',
        title: '2PC still shows up — usually one layer down',
        text: 'Distributed SQL databases (Spanner, CockroachCB) and message brokers implementing exactly-once semantics often use 2PC-like protocols *internally*, between their own replicas, where the network is fast and trusted and the "coordinator" is highly available via consensus. The blocking failure mode is what makes 2PC a poor fit *between independently-owned services*, not a flaw in the protocol itself.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 9 — Distributed Transactions' },
      { book: 'sdi-vol2', chapter: 'Ch. — Distributed Transactions and Sagas' },
    ],
    related: ['consensus-algorithms', 'exactly-once-and-idempotency', 'consistency-models', 'microservices-vs-monolith'],
  },

  {
    id: 'quorum-systems',
    domainId: 'sd-distributed-theory',
    title: 'Quorum Systems',
    summary:
      'A quorum is the minimum number of replicas that must agree for a read or write to count — tuning the read quorum **R** and write quorum **W** against replication factor **N** trades consistency for availability and latency, one knob at a time.',
    keyPoints: [
      'The core guarantee: if **R + W > N**, every read quorum overlaps every write quorum in at least one replica, so a read always sees the latest write',
      'W = N (write to every replica) maximizes read speed but any single replica being down blocks writes entirely',
      'R = 1, W = N or R = N, W = 1 push all the cost onto one side of the read/write ratio — tune to the workload',
      'R + W ≤ N is a valid, faster configuration — it just gives up the "read always sees latest write" guarantee (eventual consistency)',
      'Overlapping replicas can still disagree on *which* write is newest — quorum reads are typically paired with version vectors or timestamps to pick a winner',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: "Quorums are the same majority-overlap idea behind [[consensus-algorithms]], applied directly to reads and writes on replicated data instead of to electing a leader: with N replicas, a write to any W of them and a read from any R of them are guaranteed to intersect in at least one replica as long as R + W > N — so at least one replica in the read set has seen the latest committed write.",
      },
      {
        kind: 'diagram',
        title: 'Quorum write then quorum read, N=3',
        code: 'sequenceDiagram\n  participant Client\n  participant R1 as Replica 1\n  participant R2 as Replica 2\n  participant R3 as Replica 3\n  Client->>R1: write(v2)\n  Client->>R2: write(v2)\n  Client->>R3: write(v2)\n  R1-->>Client: ack\n  R2-->>Client: ack\n  Note over Client: W=2 acks received, write succeeds\n  Client->>R2: read()\n  Client->>R3: read()\n  R2-->>Client: v2\n  R3-->>Client: v1 (stale)\n  Note over Client: R=2, overlaps W=2 in R2 -> v2 wins',
        caption: 'With N=3, W=2, R=2: R+W=4 > N=3, so every read quorum overlaps every write quorum',
      },
      {
        kind: 'table',
        caption: 'Common (N, W, R) tunings',
        headers: ['N', 'W', 'R', 'Property'],
        rows: [
          ['3', '3', '1', 'Fast, simple reads; any replica down blocks all writes'],
          ['3', '1', '3', 'Fast, simple writes; any replica down blocks all reads'],
          ['3', '2', '2', 'Balanced — tolerates one replica being down for either'],
          ['3', '1', '1', "R+W ≤ N: fastest, but reads can return stale data (eventual consistency)"],
        ],
      },
      {
        kind: 'code',
        title: 'Quorum write: wait for W acks or fail',
        code: 'CompletableFuture<Void> quorumWrite(List<Replica> replicas, Object value, int w) {\n    List<CompletableFuture<Void>> writes = replicas.stream()\n        .map(r -> r.writeAsync(value))\n        .toList();\n\n    // Succeed as soon as w of them complete; a straggler replica just catches up later.\n    return CompletableFuture.allOf(\n        writes.stream().limit(w).toArray(CompletableFuture[]::new)\n    );\n}',
      },
      {
        kind: 'pitfall',
        title: "Quorum overlap doesn't resolve concurrent writes on its own",
        text: "R+W > N guarantees a read *sees* the latest write, but if two writes happen concurrently to different replicas before either fully propagates, the quorum read may see conflicting versions and still needs a tiebreaker — a timestamp, a version vector, or last-writer-wins — to decide which one \"wins\". Quorums guarantee visibility, not conflict resolution.",
      },
      {
        kind: 'bestPractice',
        title: 'Pick (N, W, R) from the workload, not from habit',
        text: "A read-heavy cache-like workload wants R small (fast reads) and can tolerate W = N (writes are rare). A write-heavy ingestion pipeline wants the opposite. Cassandra, DynamoDB, and Riak all expose W and R as per-operation knobs precisely because the right tradeoff is a property of the access pattern, not a database-wide constant.",
      },
      {
        kind: 'note',
        text: 'This is the same tradeoff [[cap-theorem]] describes at a higher level: sacrificing R+W>N strict overlap for lower latency is choosing availability/latency over strict consistency during normal operation, before a partition even happens.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 5 — Replication: Quorums for Reading and Writing' },
      { book: 'database-internals', chapter: 'Ch. — Quorum Consistency' },
    ],
    related: ['consensus-algorithms', 'cap-theorem', 'consistency-models', 'database-replication'],
  },

  {
    id: 'clock-synchronization-and-ordering',
    domainId: 'sd-distributed-theory',
    title: 'Clock Synchronization & Ordering',
    summary:
      "Wall-clock time on different machines can never be perfectly synchronized, which breaks the naive idea of ordering events by timestamp. **Logical clocks** (Lamport, vector) capture *causal* order — what happened before what — without needing synchronized time at all.",
    keyPoints: [
      "NTP typically synchronizes clocks to within milliseconds, but drift, network jitter, and leap seconds mean two machines' clocks are never provably equal at a given instant",
      "A **Lamport clock** is a single counter per node, incremented on every event and on every message received (taking the max with the sender's timestamp) — it gives a total order consistent with causality, but not real time",
      "Lamport timestamps can't tell concurrent events from causally-related ones just by comparing numbers — two unrelated events can get the same, or an ambiguous, ordering",
      "**Vector clocks** (one counter per node, tracked as a vector) *can* detect concurrency: if neither vector dominates the other, the events are genuinely concurrent",
      "Google Spanner sidesteps the whole problem for its use case with **TrueTime**: GPS + atomic clocks bound clock uncertainty to a known interval, and the database waits out that interval to guarantee external consistency",
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: '"What happened first?" is a deceptively hard question once "first" spans multiple machines. Physical clocks drift and cannot be perfectly synchronized (NTP corrections can even move a clock *backward*), so comparing raw timestamps from two different nodes to decide event order is unreliable at the granularity most systems need. Logical clocks solve a narrower, achievable version of the problem: capturing *causal* order — if event A could have influenced event B, logical clocks guarantee A is ordered before B — without requiring synchronized wall time at all.',
      },
      {
        kind: 'code',
        title: 'Lamport clock: one counter, updated on send/receive',
        code: 'class LamportClock {\n    private long counter = 0;\n\n    synchronized long tick() {                 // local event\n        return ++counter;\n    }\n\n    synchronized long onReceive(long messageTimestamp) {\n        counter = Math.max(counter, messageTimestamp) + 1;\n        return counter;\n    }\n}',
      },
      {
        kind: 'diagram',
        title: 'Lamport timestamps across a message',
        code: 'sequenceDiagram\n  participant A as Node A (clock)\n  participant B as Node B (clock)\n  Note over A: local event, clock=1\n  A->>B: message (timestamp=1)\n  Note over B: clock = max(local, 1) + 1 = 2\n  Note over B: local event, clock=3',
        caption: "B's clock jumps to stay causally after A's message, not just after its own prior events",
      },
      {
        kind: 'paragraph',
        text: "A vector clock generalizes this: instead of one shared counter, each node keeps a full vector of counters, one per node it knows about, incrementing its own slot on every event and merging (taking the elementwise max) on message receipt. Comparing two vector clocks tells you not just an order but whether one event **happened-before** the other, or whether they're truly **concurrent** — information a single Lamport counter cannot recover.",
      },
      {
        kind: 'table',
        caption: 'Lamport vs vector clocks',
        headers: ['', 'Lamport clock', 'Vector clock'],
        rows: [
          ['State per node', 'One integer', 'One integer per node in the cluster'],
          ['Gives a total order', 'Yes (with tie-breaking by node id)', 'A partial order — concurrency is representable'],
          ['Detects true concurrency', 'No — cannot distinguish concurrent from ordered events', 'Yes — incomparable vectors mean concurrent'],
          ['Used for', 'Simple causal ordering, log sequencing', 'Conflict detection in systems like Dynamo/Riak'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Never use wall-clock timestamps to resolve write conflicts',
        text: 'Last-writer-wins by physical timestamp silently discards data whenever clocks are even slightly out of sync — a write from a node with a fast clock always "wins" regardless of true causal order, and clock skew of even a few hundred milliseconds is common across real datacenters. Prefer a logical clock, a vector clock, or an explicit version number for anything where losing a write silently is unacceptable.',
      },
      {
        kind: 'note',
        title: "Spanner's TrueTime: bounding the uncertainty instead of eliminating it",
        text: "TrueTime doesn't claim clocks are synchronized — it returns a time *interval* `[earliest, latest]` guaranteed to contain the true time, backed by GPS and atomic clock hardware in Google's datacenters. Spanner then simply waits out the uncertainty window before letting a transaction's effects become visible, converting \"clocks might be wrong\" into a bounded, known delay rather than an unbounded correctness risk.",
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 8 — Unreliable Clocks' },
      { book: 'database-internals', chapter: 'Ch. — Logical Clocks and Ordering' },
    ],
    related: ['consensus-algorithms', 'consistency-models', 'distributed-locking'],
  },

  {
    id: 'distributed-locking',
    domainId: 'sd-distributed-theory',
    title: 'Distributed Locking',
    summary:
      "A distributed lock lets multiple processes coordinate exclusive access to a shared resource across machines — but every implementation must answer the uncomfortable question: what happens if the lock holder pauses (GC, network stall) past the lock's expiry and keeps acting as if it still holds it?",
    keyPoints: [
      'The simplest form — a row/key in a database with a TTL, or a Redis `SET key value NX PX ttl` — is enough for advisory, best-effort locking',
      "A lock's TTL exists to survive holder crashes, but that same TTL means a holder that pauses (GC, VM stall) past it can resume unaware it lost the lock",
      "**Fencing tokens** — a monotonically increasing number issued with each lock grant — let the protected resource itself reject stale writes from an expired holder, closing the gap TTLs alone leave open",
      'Redlock (multi-instance Redis locking) is popular but contested — Martin Kleppmann\'s critique argues it provides no correctness guarantee under clock/GC pauses without fencing tokens',
      'For real correctness guarantees, a lock built on a consensus system (ZooKeeper, etcd) that issues fencing tokens is the safer foundation than a bare TTL key',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A single-process `synchronized` lock is trivial because the JVM guarantees only one thread holds it at a time, and a crashed thread releases it automatically. Neither guarantee survives crossing a network: the "lock" is now just a fact recorded somewhere (a database row, a Redis key, a ZooKeeper znode), and there is no way to *force* a remote process to stop acting on the belief that it holds it.',
      },
      {
        kind: 'code',
        title: 'A minimal Redis-based lock',
        code: 'boolean tryLock(Jedis redis, String key, String owner, long ttlMs) {\n    // NX: only set if absent. PX: expire after ttlMs. Both atomic in one command.\n    String result = redis.set(key, owner, SetParams.setParams().nx().px(ttlMs));\n    return "OK".equals(result);\n}\n\nboolean unlock(Jedis redis, String key, String owner) {\n    // Only delete if we still own it — a Lua script keeps the check+delete atomic.\n    String script = "if redis.call(\'get\', KEYS[1]) == ARGV[1] then " +\n                     "return redis.call(\'del\', KEYS[1]) else return 0 end";\n    return (Long) redis.eval(script, List.of(key), List.of(owner)) == 1;\n}',
      },
      {
        kind: 'diagram',
        title: 'The gap a bare TTL lock cannot close',
        code: 'sequenceDiagram\n  participant P as Process A\n  participant L as Lock service\n  participant S as Storage\n  P->>L: acquire lock (ttl=10s)\n  L-->>P: granted\n  Note over P: GC pause / VM stall for 15s\n  Note over L: ttl expires, lock released\n  Note over L: Process B acquires the lock\n  Note over P: resumes, unaware lock expired\n  P->>S: write (still believes it holds the lock!)\n  Note over S: without a fencing token, this write is accepted incorrectly',
        caption: "Without a fencing token, Storage cannot tell Process A's write is stale",
      },
      {
        kind: 'paragraph',
        text: 'A fencing token fixes this by making the *protected resource* the enforcement point, not the lock service: every time the lock is granted, an incrementing number is issued alongside it, and the resource rejects any write tagged with a token lower than the highest one it has already seen. Process A resuming after its pause still sends its old, now-stale token — the storage layer rejects it, no matter how confidently Process A believes it holds the lock.',
      },
      {
        kind: 'table',
        caption: 'Locking approaches',
        headers: ['Approach', 'Guarantee', 'Failure mode without fencing'],
        rows: [
          ['Database row + TTL', 'Advisory only', 'Expired holder can still write after TTL if paused'],
          ['Redis SET NX PX (single instance)', 'Advisory, single point of failure', 'Same, plus the Redis instance itself can fail'],
          ['Redlock (multi-instance Redis)', 'Advisory, majority-based', 'Contested — same underlying gap without tokens'],
          ['ZooKeeper/etcd (consensus-backed) + fencing token', 'Strong, enforceable at the resource', 'None, if the resource actually checks the token'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A lock TTL is a bet on a pause duration, not a correctness guarantee',
        text: "Choosing a longer TTL to be \"safer\" just delays the problem; any process can pause for longer than any finite TTL (a stop-the-world GC pause, a hypervisor migrating a VM, a swapped-out container). The lock's expiry is fundamentally a liveness mechanism (so the resource isn't stuck forever), not a safety mechanism — safety has to come from fencing at the resource.",
      },
      {
        kind: 'bestPractice',
        title: "Treat distributed locks as advisory unless the resource enforces the token",
        text: "If the protected operation can't check a fencing token (e.g. an external API call with no such concept), the lock is best-effort coordination between well-behaved participants, not a hard safety guarantee — design the operation to be idempotent ([[exactly-once-and-idempotency]]) as the real safety net.",
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 8-9 — Distributed Locks and Fencing Tokens' },
      { book: 'designing-distributed-systems', chapter: 'Ch. — Coordination Patterns' },
    ],
    related: ['consensus-algorithms', 'exactly-once-and-idempotency', 'clock-synchronization-and-ordering'],
  },

  {
    id: 'gossip-protocols',
    domainId: 'sd-distributed-theory',
    title: 'Gossip Protocols',
    summary:
      'Gossip protocols spread information (membership, failure detection, state updates) through a cluster the way rumors spread through a crowd — each node periodically shares what it knows with a few random peers, reaching every node in O(log N) rounds without any central coordinator.',
    keyPoints: [
      'Each round, every node picks a small number of random peers and exchanges state — no leader, no fixed topology, no single point of failure',
      'Information reaches the whole cluster in O(log N) rounds because the number of informed nodes roughly doubles each round, like epidemic spread',
      'Used for **membership** (who is in the cluster right now) and **failure detection** (who hasn\'t been heard from) in Cassandra, Consul, and Akka Cluster',
      'Gossip is inherently eventually consistent — a node can be behind on the latest state for a few rounds, which is an acceptable tradeoff for its failure-independence',
      "Gossip scales near-linearly in cluster size with only O(log N) messages per node per round, unlike a naive broadcast-to-everyone approach",
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A central coordinator that tracks cluster membership is a single point of failure and a bottleneck at scale. Gossip protocols solve the same problem — "who is alive, and what state do they have" — without one, by having every node periodically talk to a handful of random others and merge what they each know, the same way a rumor eventually reaches everyone in a large crowd without anyone shouting it from a stage.',
      },
      {
        kind: 'diagram',
        title: 'One gossip round, 5 nodes',
        code: 'graph TD\n  A((Node A: knows X)) -->|gossip| B((Node B))\n  A -->|gossip| C((Node C))\n  B -->|gossip| D((Node D))\n  C -->|gossip| E((Node E))\n  D -->|gossip round 2| E',
        caption: 'Random peer exchange each round — X reaches every node within a couple of rounds',
      },
      {
        kind: 'code',
        title: 'One gossip round: pick k random peers, exchange state',
        code: 'void gossipRound(List<Node> peers, ClusterState localState, Random rnd) {\n    List<Node> targets = pickRandom(peers, GOSSIP_FANOUT, rnd);   // e.g. fanout = 3\n    for (Node peer : targets) {\n        ClusterState remoteState = peer.exchange(localState);     // send mine, get theirs\n        localState.mergeNewerEntries(remoteState);                 // per-node version numbers decide "newer"\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Each piece of gossiped state carries a version number (often a simple counter per originating node), so merging two nodes\' views is just "keep whichever entry has the higher version per key" — the same conflict-free merge idea that makes gossip robust to messages arriving out of order or being duplicated. A node that stops responding to gossip is eventually marked suspect, then down, once enough peers fail to hear from it — a **failure detector** built entirely out of the same mechanism used to spread membership.',
      },
      {
        kind: 'table',
        caption: 'Gossip vs a centralized coordinator',
        headers: ['', 'Gossip', 'Centralized coordinator'],
        rows: [
          ['Single point of failure', 'None', 'The coordinator itself'],
          ['Message cost per node', 'O(log N) per round', 'O(1) to the coordinator, but coordinator load is O(N)'],
          ['Propagation delay', 'A few rounds (seconds), probabilistic', 'Immediate, if the coordinator is reachable'],
          ['Consistency', 'Eventually consistent by design', 'Can be made strongly consistent'],
        ],
      },
      {
        kind: 'pitfall',
        title: "Gossip's eventual consistency means membership views can briefly disagree",
        text: 'A node that just joined (or just failed) is not instantly known to the whole cluster — different nodes can have a slightly different view of "who\'s in the cluster" for a few gossip rounds. Anything that assumes an immediately-consistent membership view (e.g. naive routing based on a locally-cached member list) needs to tolerate acting on slightly stale information, or fall back to a stronger coordination mechanism like [[consensus-algorithms]] for membership-critical decisions.',
      },
      {
        kind: 'note',
        text: "Cassandra uses gossip specifically for cluster membership and failure detection, layered underneath its actual data replication — a good example of gossip solving the \"who is out there and are they alive\" question while a separate mechanism (quorum reads/writes, see [[quorum-systems]]) handles the data itself.",
      },
    ],
    refs: [
      { book: 'designing-distributed-systems', chapter: 'Ch. — Gossip and Membership Protocols' },
      { book: 'ddia', chapter: 'Ch. 8 — Detecting Faults' },
    ],
    related: ['consensus-algorithms', 'quorum-systems', 'distributed-caching-systems'],
  },
]
