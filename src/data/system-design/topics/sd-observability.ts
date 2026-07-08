import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'monitoring-and-metrics',
    domainId: 'sd-observability',
    title: 'Monitoring & Metrics',
    summary:
      'Metrics are numeric time series — counters, gauges, histograms — that report the aggregate health of a system in real time, and are the foundation every alert, dashboard, and capacity decision is built on.',
    keyPoints: [
      'Counter: monotonically increasing (requests served, errors) — useful as a rate (per second) far more often than as a raw total',
      'Gauge: a value that goes up or down (queue depth, memory used, active connections) — the current state, not a rate',
      'Histogram: distribution of observed values (request latency) — enables percentiles, which matter far more than the average for user-facing latency',
      'The four golden signals (latency, traffic, errors, saturation) form a minimal dashboard for any service',
      'Cardinality — the number of distinct label combinations — is the hidden cost of metrics: tagging a counter by user ID turns it into millions of time series and can take down the monitoring system itself',
      'Averages hide the worst experience: a 50ms average latency can still mean 1% of users wait 5 seconds — look at p95/p99, not just the mean',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'Where a metric goes',
        code: 'flowchart LR\n  App[Service] -->|emit| Agent[Metrics Agent]\n  Agent --> TSDB[(Time-Series DB)]\n  TSDB --> Dashboard[Dashboards]\n  TSDB --> AlertMgr[Alerting]',
      },
      {
        kind: 'table',
        caption: 'The three metric types',
        headers: ['Type', 'Measures', 'Example', 'Typical query'],
        rows: [
          ['Counter', 'cumulative count', 'total requests served', 'rate() over 5 minutes'],
          ['Gauge', 'current value', 'queue depth, memory used', 'current value, or min/max over a window'],
          ['Histogram', 'distribution of values', 'request latency', 'p50 / p95 / p99'],
        ],
      },
      {
        kind: 'code',
        title: 'Registering the three metric types',
        code: 'Counter.builder("http.requests").tag("status", "200").register(registry).increment();\nGauge.builder("queue.depth", queue, Queue::size).register(registry);\nTimer.builder("http.request.duration").publishPercentileHistogram().register(registry);',
      },
      {
        kind: 'pitfall',
        title: 'High-cardinality labels can crash the monitoring system',
        text: 'Tagging a metric by a high-cardinality dimension — user ID, request ID, a raw URL with path parameters — multiplies the number of distinct time series the backend has to store and index, and can degrade or crash the monitoring system itself long before it degrades the service being monitored.',
      },
      {
        kind: 'bestPractice',
        title: 'Track percentiles, not averages, for anything user-facing',
        text: 'An average latency of 50ms is consistent with every user having a fine experience, or with 99% of users at 10ms and 1% waiting 5 seconds — the histogram\'s p95/p99 distinguishes those cases; the mean cannot.',
      },
      {
        kind: 'note',
        text: 'The four golden signals — latency, traffic, errors, saturation — are a deliberately minimal starting dashboard: enough to answer "is this service healthy right now" without needing service-specific knowledge.',
      },
    ],
    refs: [{ book: 'sre-book', chapter: 'Ch. 6 — Monitoring Distributed Systems' }],
    related: ['logging-and-distributed-tracing', 'alerting-and-on-call', 'capacity-planning'],
  },

  {
    id: 'logging-and-distributed-tracing',
    domainId: 'sd-observability',
    title: 'Logging & Distributed Tracing',
    summary:
      'Logs capture discrete events with full detail; traces stitch a single request\'s path across every service it touched into one timeline — together they answer "what happened" and "where did the time go" that metrics alone cannot.',
    keyPoints: [
      'Structured logging (key-value/JSON, not free-form text) is what makes logs queryable at scale — grep does not scale past one machine',
      'A trace is a tree of spans; each span records one unit of work with a start time, duration, and parent span — the whole tree reconstructs the request\'s path',
      'Context propagation — a trace ID and span ID passed through every hop, in headers or message metadata — is what lets independently-deployed services contribute spans to the same trace',
      'Log correlation IDs, often the trace ID itself, let you jump from "this span was slow" to the exact log lines from that service during that span',
      'Sampling is unavoidable at scale — tracing every request is often too expensive, so systems sample a percentage, or trace every erroring/slow request unconditionally ("tail-based sampling")',
      'Metrics tell you something is wrong; traces tell you where; logs tell you why — they are complementary, not substitutes for each other',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'One request, one trace, many spans',
        code: 'sequenceDiagram\n  participant C as Client\n  participant G as Gateway\n  participant O as Order Service\n  participant P as Payment Service\n  C->>G: POST /checkout (trace-id abc123)\n  G->>O: createOrder (span g-o)\n  O->>P: chargeCard (span o-p)\n  P-->>O: charged\n  O-->>G: order created\n  G-->>C: 201 Created',
      },
      {
        kind: 'table',
        caption: 'Logs vs metrics vs traces',
        headers: ['', 'Logs', 'Metrics', 'Traces'],
        rows: [
          ['Question answered', 'what exactly happened', 'is something wrong, in aggregate', 'where did the time go'],
          ['Granularity', 'single event', 'aggregated over time', 'single request across services'],
          ['Storage cost', 'high — full detail', 'low — pre-aggregated', 'high, mitigated by sampling'],
        ],
      },
      {
        kind: 'code',
        title: 'Propagating trace context across a call',
        code: 'Span span = tracer.spanBuilder("chargeCard").setParent(Context.current()).startSpan();\ntry (Scope scope = span.makeCurrent()) {\n    httpClient.send(request.header("traceparent", span.getSpanContext().toTraceparent()));\n} finally {\n    span.end();\n}',
      },
      {
        kind: 'pitfall',
        title: 'Unstructured logs become unqueryable at scale',
        text: 'Free-form text logs work fine on one developer\'s machine grepping a single file. Across thousands of instances they are effectively unsearchable unless every log line is structured (consistent fields, machine-parseable) from the start — retrofitting structure onto years of free-text logs is a large, low-priority project that never quite happens.',
      },
      {
        kind: 'bestPractice',
        title: 'Propagate a trace ID through every hop, including async ones',
        text: 'A trace that stops at the edge of a message queue or a background job loses the ability to connect "this request was slow" to the async work it triggered — the trace ID should ride along in queue message metadata, not just HTTP headers.',
      },
      {
        kind: 'note',
        text: 'Sampling every request is often unnecessary and expensive; sampling only a fraction of normal requests while unconditionally keeping every erroring or slow one (tail-based sampling) captures almost all of the useful signal for a fraction of the storage cost.',
      },
    ],
    refs: [
      { book: 'sre-book', chapter: 'Ch. 6 — Monitoring Distributed Systems' },
      { book: 'release-it', chapter: 'Ch. — Logging and Transparency' },
    ],
    related: ['monitoring-and-metrics', 'microservices-vs-monolith', 'incident-management-and-postmortems'],
  },

  {
    id: 'alerting-and-on-call',
    domainId: 'sd-observability',
    title: 'Alerting & On-Call',
    summary:
      'An alert should fire only when a human needs to act right now — every alert that does not meet that bar trains the on-call engineer to ignore alerts, which is how real incidents get missed.',
    keyPoints: [
      'Alert on symptoms (user-facing latency or error rate breaching an SLO) rather than causes (CPU at 80%) — causes change constantly and do not always mean users are affected',
      'Every page should be actionable: if there is nothing a human can do about it right now, it belongs on a dashboard, not in a page',
      'Alert fatigue is a real failure mode — a system that pages constantly for non-issues trains engineers to acknowledge-and-ignore, which is exactly when a real incident slips through',
      'Multi-window, multi-burn-rate alerting (a fast burn over a short window plus a slow burn over a long window) catches both sudden and slow-building SLO violations without paging on every brief blip',
      'On-call rotation design — length, handoff process, escalation policy — is itself a system that needs designing; an unsustainable rotation causes burnout and worse incident response, not better',
      'Runbooks attached to alerts turn a 3am page into a 10-minute fix instead of a 45-minute cold investigation',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'From burn-rate breach to resolution',
        code: 'flowchart LR\n  A[SLO burn-rate breach] --> B{Alert fires}\n  B --> C[Page on-call]\n  C --> D{Acknowledged?}\n  D -->|no, timeout| E[Escalate to secondary]\n  D -->|yes| F[Investigate via runbook]\n  F --> G[Resolve]\n  F -->|major impact| H[Incident Management]',
      },
      {
        kind: 'table',
        caption: 'Symptom-based vs cause-based alerting',
        headers: ['', 'Symptom-based', 'Cause-based'],
        rows: [
          ['Fires on', 'user-facing SLO breach', 'internal metric crossing a threshold'],
          ['False positive rate', 'lower — tied to actual impact', 'higher — many causes never affect users'],
          ['Actionability', 'usually yes', 'often "wait and see"'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Paging on causes instead of symptoms drowns the signal',
        text: 'A threshold like "page if CPU exceeds 80%" fires constantly on a system that is healthy but simply busy, and trains the on-call engineer to acknowledge and dismiss pages without reading them closely — exactly the muscle memory that causes a real, symptom-based alert to be dismissed too.',
      },
      {
        kind: 'bestPractice',
        title: 'Every alert needs a runbook link, or it is not ready to page a human',
        text: 'A runbook does not need to solve the problem automatically — it needs to tell a half-asleep on-call engineer what this alert means, what to check first, and who to escalate to, cutting a cold investigation down to a guided one.',
      },
      {
        kind: 'note',
        text: 'Multi-burn-rate alerting pairs a short, sensitive window (catches fast-moving outages quickly) with a longer, less sensitive window (catches slow degradations that a short window would treat as noise) — one alert policy for both failure shapes instead of two separate thresholds fighting each other.',
      },
    ],
    refs: [{ book: 'sre-book', chapter: 'Ch. — Practical Alerting from Time-Series Data' }],
    related: ['monitoring-and-metrics', 'availability-and-slas', 'incident-management-and-postmortems'],
  },

  {
    id: 'capacity-planning',
    domainId: 'sd-observability',
    title: 'Capacity Planning',
    summary:
      'Capacity planning answers "will we have enough headroom before we need it" — using historical growth, seasonal peaks, and load testing to provision ahead of demand instead of reacting to an outage.',
    keyPoints: [
      'Organic growth (steady user or traffic increase) and inorganic events (a marketing launch, a viral moment, a holiday sale) need different planning horizons — one is a trend line, the other is a spike to explicitly provision for',
      'Load testing against a production-like environment finds the actual breaking point of a system, not just its comfortable operating range',
      'Headroom targets — for example never running above 60-70% sustained utilization — leave room for both traffic spikes and losing capacity without an immediate crisis',
      'The bottleneck is rarely uniform across a system: CPU, memory, connection-pool limits, and downstream dependency quotas each have separate ceilings, and the lowest one wins',
      'Autoscaling handles gradual demand shifts well but reacts too slowly for sudden spikes — a scale-up event still takes minutes, so pre-provisioning ahead of a known event is still necessary',
      'Cost and capacity are the same conversation: over-provisioning "just in case" is a real, ongoing expense, not a free insurance policy',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Organic vs inorganic growth planning',
        headers: ['', 'Organic growth', 'Inorganic event'],
        rows: [
          ['Shape', 'steady trend line', 'sharp, time-boxed spike'],
          ['Planning input', 'historical growth rate', 'known event date and expected multiplier'],
          ['Response', 'autoscaling keeps pace', 'pre-provision ahead of time — autoscaling reacts too slowly'],
        ],
      },
      {
        kind: 'code',
        title: 'Sizing instance count from a target utilization',
        code: 'int requiredInstances(double peakRps, double rpsPerInstance, double headroomFactor) {\n    // headroomFactor 1.4 targets roughly 70% sustained utilization at peak\n    return (int) Math.ceil(peakRps / rpsPerInstance * headroomFactor);\n}',
      },
      {
        kind: 'pitfall',
        title: 'Autoscaling reacts too slowly for a scheduled traffic spike',
        text: 'A new instance still needs minutes to launch, warm up, and start serving. For a launch or sale with a known start time, waiting for autoscaling to catch up means the first minutes of the spike are served by too little capacity — pre-provisioning ahead of the known event avoids that gap entirely.',
      },
      {
        kind: 'bestPractice',
        title: 'Target sustained utilization well below 100%',
        text: 'Pick the target headroom from what capacity you can tolerate losing at once — one zone, one bad deploy — not from instinct. If losing a third of capacity should not cause an outage, sustained utilization needs to stay below roughly two-thirds even before accounting for traffic spikes.',
      },
      {
        kind: 'note',
        text: 'The system-wide bottleneck is whichever resource has the lowest ceiling — CPU, memory, connection pools, and downstream API quotas rarely run out at the same utilization level, so capacity planning has to check each one, not just the obvious one.',
      },
    ],
    refs: [
      { book: 'sre-book', chapter: 'Ch. — Capacity Planning' },
      { book: 'web-scalability', chapter: 'Ch. — Load Testing and Capacity Planning' },
    ],
    related: ['horizontal-vs-vertical-scaling', 'monitoring-and-metrics', 'back-of-envelope-estimation'],
  },

  {
    id: 'incident-management-and-postmortems',
    domainId: 'sd-observability',
    title: 'Incident Management & Postmortems',
    summary:
      'An incident is managed in two phases — restore service first, understand root cause second — and a blameless postmortem is how an organization actually learns from an outage instead of just being relieved it is over.',
    keyPoints: [
      'Mitigate before you diagnose: rolling back a bad deploy or failing over to a healthy region ends user impact immediately, even before the root cause is known',
      'An incident commander owns coordination and communication during an incident so responders can focus on fixing instead of status-updating',
      'A severity scale drives response consistently — who gets paged, whether execs are notified, whether a public status page updates — instead of deciding ad hoc each time',
      'Blameless postmortems focus on what about the system allowed this, rather than who made the mistake — punishing the person who tripped an incident just teaches everyone to hide the next one',
      'A postmortem\'s real output is action items with owners and dates — a document that identifies causes but assigns no follow-up changes nothing',
      'Timeline reconstruction — what was known, when, and what was done about it — is often more valuable than the root cause itself, since it reveals detection and response gaps that recur across unrelated incidents',
    ],
    blocks: [
      {
        kind: 'diagram',
        title: 'From detection to a shipped fix',
        code: 'flowchart LR\n  Detect --> Mitigate\n  Mitigate --> Communicate\n  Communicate --> Diagnose\n  Diagnose --> Postmortem\n  Postmortem --> ActionItems[Action Items]\n  ActionItems --> FollowUp[Follow-Up Tracking]',
      },
      {
        kind: 'table',
        caption: 'A severity scale example',
        headers: ['Severity', 'Impact', 'Who is paged', 'Comms cadence'],
        rows: [
          ['SEV1', 'full outage or data loss', 'on-call plus incident commander plus leadership', 'continuous, public status page'],
          ['SEV2', 'major feature degraded', 'on-call plus incident commander', 'regular internal updates'],
          ['SEV3', 'minor, contained impact', 'on-call', 'ticket, no broad comms'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A postmortem without owned action items is theater',
        text: 'A well-written timeline and root cause analysis that ends without specific, owned, dated follow-up work changes nothing — the same failure mode recurs because identifying a cause was mistaken for fixing it.',
      },
      {
        kind: 'bestPractice',
        title: 'Mitigate first, understand later',
        text: 'Restoring service and finding root cause are different jobs, done in that order: a rollback or failover that ends user impact in minutes is far more valuable than a root-cause investigation that takes an hour while users keep seeing errors.',
      },
      {
        kind: 'note',
        text: 'A blameless culture is not about avoiding accountability — it is a practical bet that engineers who are not afraid of being blamed report near-misses and honest timelines, which is the raw material every future postmortem depends on.',
      },
    ],
    refs: [{ book: 'sre-book', chapter: 'Ch. 14-15 — Managing Incidents; Postmortem Culture' }],
    related: ['alerting-and-on-call', 'monitoring-and-metrics', 'fault-tolerance-patterns'],
  },
]
