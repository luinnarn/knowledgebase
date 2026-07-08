import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'message-queues',
    domainId: 'sd-messaging',
    title: 'Message Queues',
    summary:
      'A queue decouples a producer from a consumer in time and load: the producer drops a message and moves on, and one of possibly many competing consumers picks it up whenever it is ready. The queue is the shock absorber between a bursty producer and a consumer with finite capacity.',
    keyPoints: [
      'Point-to-point delivery: each message is consumed by exactly one consumer in a competing-consumers pool, unlike pub-sub\'s fan-out to every subscriber',
      'Queues absorb bursts — a producer spike is buffered instead of overwhelming the consumer, at the cost of added latency for the buffered messages',
      'Delivery is normally at-least-once: a consumer that crashes after receiving but before acknowledging causes the broker to redeliver — consumers must be idempotent (see [[exactly-once-and-idempotency]])',
      'A visibility timeout hides a message from other consumers while one is processing it, so two workers do not both pick up the same job',
      'A dead-letter queue (DLQ) catches messages that fail processing repeatedly, so one poison message cannot block the whole queue forever',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Competing consumers pulling from one queue',
        code: 'flowchart LR\n  P[Producer] --> Q[(Queue)]\n  Q --> C1[Consumer 1]\n  Q --> C2[Consumer 2]\n  Q --> C3[Consumer 3]',
        caption: 'Each message goes to exactly one consumer — adding consumers increases throughput, not fan-out',
      },
      {
        kind: 'code',
        title: 'An idempotent consumer with a dead-letter path',
        code: 'void handle(Message msg) {\n    if (alreadyProcessed(msg.id())) {\n        ack(msg);                       // safe no-op — this is a redelivery\n        return;\n    }\n    try {\n        process(msg);\n        markProcessed(msg.id());\n        ack(msg);\n    } catch (RetryableException e) {\n        if (msg.deliveryCount() >= MAX_RETRIES) {\n            sendToDeadLetterQueue(msg, e);\n            ack(msg);                   // stop retrying — a human will look at the DLQ\n        } else {\n            nack(msg);                  // becomes visible again after the visibility timeout\n        }\n    }\n}',
        caption: 'Tracking processed message ids turns "at-least-once delivery" into effectively-once processing',
      },
      {
        kind: 'pitfall',
        title: 'A poison message without a DLQ blocks the whole queue',
        text: 'A malformed message that always throws will be redelivered forever if there is no cap on retries and no dead-letter path — it sits at (or near) the head of the queue, delaying or entirely blocking every message behind it depending on the broker\'s ordering guarantees. A DLQ with a bounded retry count turns an outage into a visible, quarantined failure instead of a silent, ongoing one.',
      },
      {
        kind: 'note',
        title: 'Unbounded queues hide a capacity problem, they do not solve it',
        text: 'A queue with no size limit will happily buffer an unbounded producer/consumer imbalance until the broker runs out of memory or disk — at which point the failure is worse and later than it needed to be. A bounded queue that applies backpressure (rejecting or slowing producers once full) surfaces the mismatch immediately, when it is cheapest to fix.',
      },
      {
        kind: 'bestPractice',
        title: 'Size the consumer pool to the queue\'s arrival rate, not to a guess',
        text: 'Autoscale consumers on queue depth and age-of-oldest-message rather than CPU — CPU utilization tells you nothing about whether messages are piling up. A queue that is growing even at 100% consumer utilization needs more consumers, not more waiting.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 11 — Stream Processing' },
      { book: 'designing-distributed-systems', chapter: 'Ch. 6 — Distributed Work Queue Patterns' },
      { book: 'sdi-vol1', chapter: 'Ch. 12 — Design a Chat System' },
    ],
    related: ['publish-subscribe-systems', 'exactly-once-and-idempotency', 'designing-a-chat-system'],
  },

  {
    id: 'publish-subscribe-systems',
    domainId: 'sd-messaging',
    title: 'Publish-Subscribe',
    summary:
      'Where a queue delivers each message to one consumer, pub-sub broadcasts it to every subscriber of a topic — the shape behind notifications, activity feeds, and event-driven fan-out. Modern brokers like Kafka blend both models via consumer groups.',
    keyPoints: [
      'A publisher sends to a topic without knowing who (or how many) subscribers exist — full decoupling of producer from consumer count',
      'Every subscriber gets every message on a topic — this is fan-out, the opposite of a queue\'s one-message-one-consumer delivery',
      'Kafka-style logs unify the two models: partitions within a topic give queue-like competing-consumer behavior *within* a consumer group, while multiple consumer groups each get their own full copy of the stream',
      'Ordering is typically only guaranteed within a partition, not across the whole topic — messages needing relative order must share a partition key',
      'Slow subscribers are the recurring failure mode: a broker either buffers for them (bounded by retention), drops them, or applies backpressure to the publisher',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'One publish, many independent subscribers',
        code: 'flowchart LR\n  Pub[Publisher] --> Topic{{Topic}}\n  Topic --> Sub1[Subscriber: Email Service]\n  Topic --> Sub2[Subscriber: Push Notification Service]\n  Topic --> Sub3[Subscriber: Analytics Pipeline]',
        caption: 'Each subscriber processes its own full copy of the stream, independent of the others\' speed or failures',
      },
      {
        kind: 'table',
        caption: 'Queue vs pub-sub vs Kafka-style log',
        headers: ['Model', 'Delivery', 'Ordering', 'Replay'],
        rows: [
          ['Queue', 'One consumer per message', 'FIFO-ish within the queue', 'No — consumed messages are gone'],
          ['Classic pub-sub', 'Every subscriber per message', 'Best-effort, no strong guarantee', 'No — fire-and-forget by default'],
          ['Partitioned log (Kafka)', 'Every consumer group, competing within a group', 'Guaranteed per partition', 'Yes — retained and replayable by offset'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Assuming ordering across the whole topic',
        text: 'A topic partitioned for throughput does not deliver messages in global order — only within a partition. Code that assumes "event B always arrives after event A" needs A and B to share a partition key (e.g. the same user id or order id); otherwise they can be processed by different partitions, and therefore different consumer threads, in either order.',
      },
      {
        kind: 'bestPractice',
        title: 'Partition by the entity whose events must stay ordered',
        text: 'Partitioning by `orderId` guarantees every event for a given order is processed in order (by whichever single consumer owns that partition), while still spreading load across many orders in parallel — the standard way to get both throughput and per-entity ordering.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 11 — Stream Processing' },
      { book: 'sdi-vol2', chapter: 'Ch. 7 — Design a Notification System' },
    ],
    related: ['message-queues', 'event-driven-architecture', 'designing-a-notification-system'],
  },

  {
    id: 'event-driven-architecture',
    domainId: 'sd-messaging',
    title: 'Event-Driven Architecture',
    summary:
      'Services communicate by publishing facts about what happened ("OrderPlaced") instead of calling each other directly — trading immediate consistency and simple call chains for loose coupling and independent scaling of producers and consumers.',
    keyPoints: [
      'Inversion of control: a service announces what happened and does not know (or care) who reacts to it, versus RPC where the caller explicitly invokes and waits on each dependency',
      'Buys temporal decoupling (consumers can be down and catch up later) and deployment decoupling (new consumers can be added without touching the producer)',
      'Costs eventual consistency everywhere — there is no moment where "everything downstream has processed this event" is true by construction',
      'Event schemas are now a public contract between services that evolve independently — the same versioning discipline as any external API',
      'The "distributed monolith" anti-pattern: services technically decoupled via events but still implicitly coupled through shared assumptions about event ordering, timing, or payload shape',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'One event, three independent reactions',
        code: 'flowchart TD\n  Order[Order Service] -->|OrderPlaced event| Bus{{Event Bus}}\n  Bus --> Inv[Inventory Service: reserve stock]\n  Bus --> Ship[Shipping Service: create shipment]\n  Bus --> Notif[Notification Service: send confirmation email]',
        caption: 'The order service never calls any of these three services directly, and does not know they exist',
      },
      {
        kind: 'paragraph',
        text: 'The tradeoff is visible the moment something goes wrong: in a direct RPC chain, a failure in the shipping call is immediately visible to the order service, which can retry or roll back synchronously. In an event-driven chain, `OrderPlaced` is published successfully, and the shipping service failing to process it later is invisible to the order service entirely — there is no caller waiting on a response to fail. Detecting and recovering from that failure needs its own explicit machinery: dead-letter queues, monitoring on consumer lag, and often a saga or compensating-action pattern instead of a rollback.',
      },
      {
        kind: 'pitfall',
        title: 'The distributed monolith: decoupled in name, coupled in practice',
        text: 'Services that communicate only through events can still be tightly coupled if they secretly depend on delivery order, on one event always preceding another, or on an implicit shared understanding of a field\'s meaning that was never versioned. The result inherits all the operational complexity of distributed systems while keeping all the fragility of a monolith\'s hidden internal coupling.',
      },
      {
        kind: 'bestPractice',
        title: 'Version event schemas like a public API, because they are one',
        text: 'Treat every event schema as a contract with unknown future consumers: add fields as optional, never repurpose a field\'s meaning, and use a schema registry to catch incompatible changes at publish time rather than as a runtime deserialization failure three services downstream.',
      },
    ],
    refs: [
      { book: 'designing-distributed-systems', chapter: 'Ch. 5 — Event-Driven Patterns' },
      { book: 'ddia', chapter: 'Ch. 11 — Stream Processing' },
      { book: 'bytebytego-archive', chapter: 'Architecture Patterns — Event-Driven Systems' },
    ],
    related: ['message-queues', 'publish-subscribe-systems', 'microservices-vs-monolith', 'designing-a-news-feed'],
  },

  {
    id: 'stream-processing',
    domainId: 'sd-messaging',
    title: 'Stream Processing',
    summary:
      'Computing continuously over an unbounded stream of events rather than a finite batch — aggregations, joins, and alerts that update as new events arrive, using windows to make "sum the last 5 minutes" a well-defined, finite question over an infinite stream.',
    keyPoints: [
      'Event time (when something actually happened) vs processing time (when the system saw it) diverge under network delay and retries — correctness usually needs event time',
      'Windowing makes aggregation over an infinite stream tractable: tumbling (fixed, non-overlapping), sliding (overlapping), and session (gap-based) windows are the three common shapes',
      'Watermarks are a stream processor\'s way of saying "I do not expect events older than time T anymore" — they bound how long a window waits for late data before closing',
      'Stateful operators (a running count, a join across two streams) need their state checkpointed so a crash can resume rather than restart from zero',
      'Not the same thing as Java\'s `java.util.stream` — that is a lazy, one-shot, in-process pipeline over data already fully available in memory; distributed stream processing (Flink, Kafka Streams, Spark Streaming) is a continuously running, fault-tolerant, unbounded computation',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A windowed aggregation pipeline',
        code: 'flowchart LR\n  Src[Event Source] --> W[Tumbling 1-minute window]\n  W --> Agg[Aggregate: count per window]\n  Agg --> Sink[Sink: dashboard / alert]',
        caption: 'Each window closes and emits once its watermark passes, not the instant the clock hits the boundary',
      },
      {
        kind: 'note',
        title: 'Do not confuse this with `java.util.stream`',
        text: 'A Java `Stream<T>.filter(...).map(...).collect(...)` pipeline processes a finite, already-available collection once and is done — no distribution, no fault tolerance, no notion of event time. This topic\'s "stream processing" is the distributed-systems sense: a long-running, checkpointed computation over data that never stops arriving. The two share a name and a "pipeline of operators" shape, and nothing else.',
      },
      {
        kind: 'table',
        caption: 'Window types',
        headers: ['Window', 'Shape', 'Example use'],
        rows: [
          ['Tumbling', 'Fixed size, non-overlapping', '"Requests per minute", each event in exactly one window'],
          ['Sliding', 'Fixed size, overlapping', '"Rolling 5-minute average", updated every 30 seconds'],
          ['Session', 'Gap-based, variable size', '"User activity session", closes after N minutes of inactivity'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Waiting forever for perfectly ordered data',
        text: 'Network delay and retries mean events for a given timestamp keep trickling in indefinitely in the worst case — a window that waits for absolute completeness before emitting a result would never emit anything. Watermarks accept a bounded amount of lateness (e.g. "assume no events older than 30 seconds behind the latest seen") and emit an answer that may occasionally miss very late data, in exchange for the pipeline actually producing output.',
      },
      {
        kind: 'bestPractice',
        title: 'Checkpoint state, do not just checkpoint position',
        text: 'A crash-and-resume needs both "which offset was I reading from" and "what was my running aggregate state at that point" saved consistently together — restoring only the offset without the matching state either double-counts already-processed events or silently drops accumulated state.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 11 — Stream Processing' },
      { book: 'bytebytego-archive', chapter: 'Data Architecture — Stream Processing' },
    ],
    related: ['batch-vs-stream-processing', 'event-driven-architecture', 'exactly-once-and-idempotency'],
  },

  {
    id: 'batch-vs-stream-processing',
    domainId: 'sd-messaging',
    title: 'Batch vs Stream',
    summary:
      'Batch processing runs over a bounded, already-collected dataset on a schedule — high throughput, high latency. Stream processing runs continuously as data arrives — low latency, at the cost of the harder correctness problems that come with unbounded, out-of-order input.',
    keyPoints: [
      'Batch: high throughput per unit of compute, simple reasoning (the input is fixed and known), but results are only as fresh as the last run',
      'Stream: results update within seconds, but every hard problem — late data, exactly-once semantics, backpressure — has to be solved instead of assumed away',
      'Lambda architecture runs both: a batch layer for accuracy and a speed layer for low-latency approximate results, merged at query time — at the cost of maintaining the same logic twice',
      'Kappa architecture drops the batch layer entirely: everything is a stream, and "batch" reprocessing is just replaying the stream from an earlier offset',
      'The choice is really about whether your correctness-critical logic can tolerate being expressed once (Kappa) or genuinely needs the simpler batch model for some views',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Lambda architecture: two paths to the same answer',
        code: 'flowchart TD\n  Data[Raw Event Log] --> Batch[Batch Layer: nightly recompute, exact]\n  Data --> Speed[Speed Layer: streaming, approximate, low-latency]\n  Batch --> Serve[Serving Layer]\n  Speed --> Serve\n  Serve --> Query[Query: merge batch + speed views]',
        caption: 'The speed layer\'s approximate view is replaced by the batch layer\'s exact view once it catches up',
      },
      {
        kind: 'pitfall',
        title: 'Lambda architecture doubles the logic that has to stay correct',
        text: 'Maintaining the same aggregation logic in both a batch job (e.g. a Spark job) and a streaming job (e.g. a Flink job) means every bug fix, every business-rule change, has to be made twice and kept in sync — a well-documented source of subtle discrepancies between the "fast, approximate" and "slow, exact" answers that are supposed to agree.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer Kappa when the infrastructure supports replay',
        text: 'If the event log is retained long enough and the stream processor can replay from an arbitrary offset, "batch reprocessing" becomes "run the same streaming job again from offset 0" — one codebase, one set of correctness bugs to fix, at the cost of needing a stream processor capable of high-throughput replay.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 10 — Batch Processing' },
      { book: 'bytebytego-archive', chapter: 'Data Architecture — Lambda and Kappa Architectures' },
    ],
    related: ['stream-processing', 'event-driven-architecture'],
  },

  {
    id: 'exactly-once-and-idempotency',
    domainId: 'sd-messaging',
    title: 'Exactly-Once & Idempotency',
    summary:
      'True exactly-once delivery across an unreliable network is provably impossible in the general case (the Two Generals Problem) — what production systems actually build is at-least-once delivery combined with idempotent processing, which behaves like exactly-once from the outside.',
    keyPoints: [
      'At-most-once: send and forget — simplest, but messages can be silently lost',
      'At-least-once: retry until acknowledged — messages are never lost, but duplicates are guaranteed to happen eventually',
      '"Exactly-once" as marketed by brokers usually means exactly-once *within that broker\'s pipeline* (e.g. Kafka\'s transactional producer/consumer) — it does not make an arbitrary external side effect (an email send, a payment charge) idempotent for free',
      'An idempotency key is a client-generated unique id for a logical operation, checked against a dedup store before the operation runs again',
      'Naturally idempotent operations (`SET x = 5`, `UPSERT`) need no extra bookkeeping; naturally non-idempotent ones (`x += 5`, "send an email", "charge a card") do',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'A retried request, deduplicated by idempotency key',
        code: 'sequenceDiagram\n  participant C as Client\n  participant S as Server\n  participant D as Dedup Store\n  C->>S: POST /charge (key = "abc123")\n  S->>D: seen "abc123"?\n  D-->>S: no\n  S->>S: charge card, store result\n  S-->>C: 200 OK (timeout before client sees this)\n  C->>S: retry POST /charge (key = "abc123")\n  S->>D: seen "abc123"?\n  D-->>S: yes — return stored result\n  S-->>C: 200 OK (same result, card not charged twice)',
        caption: 'The client cannot tell a lost response from a lost request, so it must retry — the server absorbs the duplicate',
      },
      {
        kind: 'code',
        title: 'Idempotency key check before a non-idempotent side effect',
        code: 'Response charge(ChargeRequest req) {\n    Optional<Response> existing = dedupStore.get(req.idempotencyKey());\n    if (existing.isPresent()) {\n        return existing.get();              // replay the prior result, do not charge again\n    }\n    Response result = paymentGateway.charge(req.amount(), req.cardToken());\n    dedupStore.put(req.idempotencyKey(), result, Duration.ofHours(24));\n    return result;\n}',
        caption: 'The dedup store write must happen atomically with (or just after) the side effect to close the race',
      },
      {
        kind: 'pitfall',
        title: 'Trusting the broker\'s "exactly-once" to cover your side effects',
        text: 'A message broker\'s exactly-once guarantee, where it exists, covers delivery and offset bookkeeping within its own system — it says nothing about a consumer that, upon processing a message, calls an external payment API. If that consumer is redelivered the same message (which can still happen during rebalances or crash recovery even with an "exactly-once" broker configuration), the external charge can still happen twice unless the consumer\'s own logic is idempotent.',
      },
      {
        kind: 'bestPractice',
        title: 'Make the client generate the idempotency key, not the server',
        text: 'If the server generates the key, a retried request (the client not knowing whether the first attempt succeeded) gets a new key and is treated as a new operation — exactly the duplicate this mechanism exists to prevent. The client must generate one key per logical attempt and send the same key on every retry of that attempt.',
      },
    ],
    refs: [
      { book: 'ddia', chapter: 'Ch. 8 — The Trouble with Distributed Systems' },
      { book: 'designing-distributed-systems', chapter: 'Ch. 6 — Distributed Work Queue Patterns' },
    ],
    related: ['message-queues', 'distributed-transactions', 'consensus-algorithms'],
  },
]
