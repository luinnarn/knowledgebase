import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'performance-methodology',
    domainId: 'performance',
    title: 'Performance Methodology',
    summary:
      'Performance is an experimental science: define measurable goals, measure a real system under real load, change one thing, measure again. Intuition about bottlenecks is wrong often enough that unmeasured "optimization" is indistinguishable from vandalism.',
    keyPoints: [
      'Quantify first: throughput, latency **percentiles** (p99, not mean), footprint, utilization',
      'Top-down: system → JVM (GC/JIT) → code — most wins live above the code level',
      'Change one variable per experiment; keep everything else fixed',
      'Averages lie: latency is a distribution with a long tail; report percentiles',
      'Optimize judiciously (EJ 67): write good programs, measure, then optimize the proven hot 3%',
      'Beware the classic antipatterns: shiny tuning flags, folklore recipes, benchmarking the wrong thing',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Optimizing Java opens with the uncomfortable truth: most "performance work" in industry is guessing. The antidote is a measurement loop — establish a **baseline** on production-like hardware and data, state a hypothesis ("GC pauses cause the p99 spikes"), test it with the right tool (GC logs, profiler, JFR), apply *one* change, and re-measure. If you cannot say what number you are trying to move and by how much, you are not optimizing yet.',
      },
      {
        kind: 'table',
        caption: 'The performance vocabulary',
        headers: ['Metric', 'Definition', 'Watch out'],
        rows: [
          ['Throughput', 'work units / time (req/s)', 'meaningless without a latency bound'],
          ['Latency', 'time per operation, as a distribution', 'p50 hides the tail your users feel'],
          ['Utilization', '% of capacity in use', '100% CPU ≠ useful work (GC? spinning?)'],
          ['Footprint', 'memory/CPU required', 'the cloud bill dimension'],
          ['Saturation point', 'load where latency departs linearity', 'find it *before* production does'],
        ],
      },
      {
        kind: 'paragraph',
        text: '**Antipatterns catalog** (Optimizing Java ch. 4, OCNJ appendix B): *Shiny tuning* — cargo-culted JVM flags from old blogs; *Fiddle with switches* — tuning before diagnosing; *Performance tuning wizardry* — trusting the lone hero over the measurement; *Missing the bigger picture* — micro-optimizing code while the database does table scans; *UAT-is-my-desktop* — testing on hardware unlike production. Each is a social failure as much as a technical one.',
      },
      {
        kind: 'bestPractice',
        title: 'Optimize judiciously (EJ Item 67)',
        text: 'Jackson\'s rules: don\'t do it; (for experts) don\'t do it yet. Strive for good architecture — component boundaries and APIs lock in performance ceilings long before code details matter (a chatty remote API cannot be saved by fast code). Then measure, find the real hot spots, fix those, and **measure again** — confirming the fix helped is not optional.',
      },
      {
        kind: 'note',
        title: 'Latency tools',
        text: 'Load-test with realistic traffic shapes (coordinated omission distorts naive load generators — use tools that account for it, e.g. wrk2/Gatling with HdrHistogram). Record latency full-range with HdrHistogram; a p99.9 of 2 s at 1000 req/s bites ~1 user per second.',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 1, 4 — Definitions; Testing Patterns and Antipatterns' },
      { book: 'ocnj', chapter: 'Ch. 1–2 — Definitions; Methodology' },
      { book: 'effective-java', chapter: 'Item 67' },
    ],
    related: ['microbenchmarking', 'profiling', 'gc-tuning-logging', 'observability'],
  },

  {
    id: 'microbenchmarking',
    domainId: 'performance',
    title: 'Microbenchmarking & JMH',
    summary:
      'Naive timing loops measure the JIT\'s ability to delete your benchmark, not your code. JMH (Java Microbenchmark Harness) exists because warm-up, dead-code elimination, constant folding, and coordinated omission defeat hand-rolled measurement.',
    keyPoints: [
      'Never `System.nanoTime()` around a loop — warm-up, DCE, and OSR artifacts dominate',
      'JMH: `@Benchmark` methods, forked JVMs, warm-up iterations, statistical output',
      'Return values or sink them into `Blackhole` — otherwise the JIT deletes the computation',
      'Beware constant folding: inputs must come from `@State` fields, not literals',
      'Microbenchmarks answer *micro* questions; validate at system level before believing them',
      'Run on quiet hardware; mind turbo/thermal effects; compare distributions, not single runs',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A correct JMH benchmark',
        code: '@State(Scope.Benchmark)\n@BenchmarkMode(Mode.AverageTime)\n@OutputTimeUnit(TimeUnit.NANOSECONDS)\n@Warmup(iterations = 5, time = 1)\n@Measurement(iterations = 5, time = 1)\n@Fork(3)\npublic class ConcatBench {\n    @Param({"10", "1000"}) int size;\n    List<String> words;\n\n    @Setup\n    public void setup() { words = randomWords(size); }\n\n    @Benchmark\n    public String builder() {\n        StringBuilder sb = new StringBuilder();\n        for (String w : words) sb.append(w);\n        return sb.toString();               // RETURNED — can\'t be dead-code eliminated\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'What JMH automates (Optimizing Java ch. 5): **forked JVMs** isolate profile pollution between benchmarks; **warm-up iterations** let tiered compilation settle before measurement; **Blackhole** consumes results with minimal, JIT-opaque cost; `@State` defeats constant folding; and the statistics engine reports mean ± error across iterations. Every one of these corresponds to a way naive benchmarks silently lie.',
      },
      {
        kind: 'pitfall',
        title: 'The benchmark that measured nothing',
        text: 'A loop computing values nobody reads is dead code — C2 removes it and you measure an empty loop at 0.3 ns/op. A computation on constants folds at compile time — same result. A benchmark fitting in L1 cache mismeasures a RAM-resident production workload ([[hardware-memory]]). JMH\'s own samples document a dozen such traps; read them before trusting any number.',
      },
      {
        kind: 'paragraph',
        text: 'The deeper caveat (both performance books): a microbenchmark answers "how fast is this method in isolation, fully warm, on this data". Production asks "does this change move p99 under mixed load". Use microbenchmarks to compare *implementations of a proven hot spot* ([[profiling]] finds those), and re-validate at system level. Most engineers need system benchmarks weekly and microbenchmarks yearly.',
      },
      {
        kind: 'note',
        title: 'Running it',
        text: 'JMH generates via `mvn archetype:generate -DarchetypeArtifactId=jmh-java-benchmark-archetype`, or Gradle plugin `me.champeau.jmh`. Run the built jar, not the IDE (IDE runners skip forking). `-prof gc` adds allocation rates; `-prof perfasm` shows the actual assembly — the final word in any JIT argument ([[jit-compilation]]).',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 5 — Microbenchmarking and Statistics' },
      { book: 'ocnj', chapter: 'Appendix A — Microbenchmarking' },
    ],
    related: ['jit-compilation', 'performance-methodology', 'language-performance'],
  },

  {
    id: 'gc-tuning-logging',
    domainId: 'performance',
    title: 'GC Tuning & Logging',
    summary:
      'GC tuning starts with GC logs — free, always-on-able, and containing allocation rates, pause causes, and promotion behavior. Size the heap, pick the collector, set a pause goal; everything further needs log evidence.',
    keyPoints: [
      'Always run with `-Xlog:gc*:file=gc.log:time,uptime,level,tags` — negligible overhead, priceless data',
      'First-order knobs: heap size (`-Xmx`/`-Xms`), collector choice, `-XX:MaxGCPauseMillis` (G1)',
      'Read for: allocation rate (MB/s), pause durations & causes, promotion rate, full-GC frequency',
      'Set `-Xms` = `-Xmx` in servers/containers — resizing causes pauses and confuses ergonomics',
      'Symptom→cause: frequent young GC = high allocation; growing old gen = leak or premature promotion; "to-space exhausted" (G1) = evacuation pressure',
      'Analyze with GCViewer / gceasy.io; correlate pauses with request-latency spikes',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Unified logging (Java 9+) and what a line means',
        code: '$ java -Xlog:gc*:file=gc.log:time,uptime:filecount=5,filesize=20m -jar app.jar\n\n[2026-07-07T12:00:01.234+0000][12.345s] GC(42) Pause Young (Normal) (G1 Evacuation Pause)\n      Eden: 512M(512M)->0B(480M) Survivors: 32M->48M Heap: 1200M(2048M)->720M(2048M) 14.2ms\n// eden filled (512M since last young GC) → allocation rate ≈ 512M / interval\n// heap after: 720M live-ish → old-gen occupancy trend = leak detector',
      },
      {
        kind: 'paragraph',
        text: 'The tuning loop (Optimizing Java ch. 8): confirm GC is actually the problem (correlate pause log timestamps with latency spikes — if p99 spikes without pauses, look elsewhere); compute **allocation rate** and **promotion rate** from the logs; then address the dominant term. High allocation → reduce garbage creation in hot paths ([[language-performance]]) or grow eden. High promotion → objects living just long enough to promote; investigate mid-lived caches and batch sizes. Full GCs recurring → undersized heap or a leak ([[profiling|heap-dump time]]).',
      },
      {
        kind: 'table',
        caption: 'Symptoms → first moves',
        headers: ['Log symptom', 'Likely cause', 'First move'],
        rows: [
          ['Young pauses too frequent', 'high allocation rate', 'reduce allocation; bigger young gen'],
          ['Young pauses too long', 'too much surviving data', 'check survivor overflow, object lifetimes'],
          ['Mixed/old collections struggling (G1)', 'old gen filling with live data', 'bigger heap; find the retention'],
          ['`to-space exhausted` / evacuation failure', 'no room to evacuate', 'increase heap/reserve, lower IHOP'],
          ['Recurring Full GC', 'leak, undersized heap, or `System.gc()`', 'heap dump; `-XX:+DisableExplicitGC`'],
          ['Humongous allocations (G1)', 'objects > 50% region size', 'chunk big arrays; larger `G1HeapRegionSize`'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Tuning the wrong layer',
        text: 'The most common GC "problem" is an allocation problem, and the most common allocation problem is accidental — string churn in logging ([[logging]]), boxing in hot loops, defensive copies of big collections per request. An hour with an allocation profiler (`-prof gc` in JMH, JFR\'s TLAB events) beats a week of flag roulette.',
      },
      {
        kind: 'note',
        title: 'Ergonomics respect containers',
        text: 'Defaults derive from container limits: max heap ¼ of the cgroup memory limit, GC threads from the CPU quota. Explicitly set `-XX:MaxRAMPercentage=75` (or a fixed `-Xmx`) in Kubernetes, and leave headroom for metaspace + direct buffers + stacks under the same limit ([[cloud-native-java]]).',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 8 — GC Logging, Monitoring, Tuning, and Tools' },
      { book: 'ocnj', chapter: 'Ch. 4–5 — Garbage Collection' },
      { book: 'java-secrets', chapter: 'Performance tuning chapters' },
    ],
    related: ['gc-algorithms', 'gc-fundamentals', 'profiling', 'observability'],
  },

  {
    id: 'profiling',
    domainId: 'performance',
    title: 'Profiling',
    summary:
      'Profilers tell you where time and memory actually go. Prefer sampling profilers with low overhead — JDK Flight Recorder (built-in, production-safe) and async-profiler (flame graphs, no safepoint bias) — and profile allocation as often as CPU.',
    keyPoints: [
      'JFR: `-XX:StartFlightRecording` or `jcmd JFR.start` — ~1% overhead, safe in production',
      'async-profiler: CPU/alloc/lock flame graphs without safepoint bias',
      'Flame graph reading: width = time share; look for wide plateaus you own',
      'Execution profilers hide I/O waits — wall-clock mode or JFR events catch blocked time',
      'Heap analysis: `jcmd GC.heap_dump` + Eclipse MAT (dominator tree finds leaks)',
      'Old instrumenting profilers distort hot code — trust sampling',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The production toolkit',
        code: '# Flight Recorder: record 2 minutes, dump to file\n$ jcmd <pid> JFR.start duration=120s filename=rec.jfr settings=profile\n$ jfr print --events jdk.CPULoad,jdk.GarbageCollection rec.jfr   # or open in JDK Mission Control\n\n# async-profiler: 30 s CPU flame graph\n$ asprof -d 30 -f flame.html <pid>\n$ asprof -e alloc -d 30 -f alloc.html <pid>     # allocation sites instead\n\n# Emergency triage\n$ jcmd <pid> Thread.print          # what is everyone doing right now?\n$ jcmd <pid> GC.heap_dump dump.hprof',
      },
      {
        kind: 'paragraph',
        text: '**Safepoint bias** (Optimizing Java ch. 13): classic samplers (JVisualVM et al.) can only sample at safepoints, so they systematically attribute time to safepoint-friendly code and miss tight JIT-compiled loops. async-profiler uses `AsyncGetCallTrace` + perf events to sample anywhere, which is why its flame graphs are the community standard. JFR sidesteps the issue with its own event machinery and adds the whole JVM\'s telemetry: GC, JIT, locks, TLAB allocations, socket I/O.',
      },
      {
        kind: 'paragraph',
        text: '**Memory-leak workflow**: watch old-gen occupancy after full collections trend upward ([[gc-tuning-logging]]); take a heap dump near fullness; open the **dominator tree** in MAT — it ranks objects by *retained* size, and the leak is usually a top-3 entry (a static map, an unbounded cache, a listener list that only grows). `jmap -histo:live <pid>` gives a quick class histogram without the dump ceremony.',
      },
      {
        kind: 'pitfall',
        title: 'Profiling CPU when the problem is waiting',
        text: 'A service at 5% CPU with terrible latency is **blocked** — on locks, connection pools, or downstream calls. CPU flame graphs show nothing; you want JFR\'s `JavaMonitorEnter`/thread-park events, async-profiler `-e wall` (wall-clock mode), or [[liveness-hazards|thread dumps]] under load. Profile the resource that\'s scarce, not the one that\'s easy.',
      },
      {
        kind: 'note',
        title: 'Continuous profiling',
        text: 'Always-on JFR with rotating recordings (`maxage`/`maxsize`) means the incident at 3 a.m. is *already recorded* when you wake up. Cloud vendors and tools (Pyroscope, Parca) productize continuous flame graphs — the profiling counterpart of [[observability]].',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 13 — Profiling' },
      { book: 'ocnj', chapter: 'Ch. 12 — Profiling' },
      { book: 'java-secrets', chapter: 'Performance analysis chapters' },
    ],
    related: ['performance-methodology', 'gc-tuning-logging', 'observability', 'liveness-hazards'],
  },

  {
    id: 'language-performance',
    domainId: 'performance',
    title: 'Language-Level Performance',
    summary:
      'The code-level catalog, applied *after* profiling: allocation discipline in hot paths, string handling, boxing, collection sizing and choice, exception cost, and the JIT-friendliness of small monomorphic methods.',
    keyPoints: [
      'Avoid creating unnecessary objects **in hot paths** (EJ 6) — elsewhere, clarity wins',
      'String concat in loops → `StringBuilder`, presized when possible (EJ 63)',
      'Boxing in hot loops: `Long sum` in a loop creates millions of objects (EJ 61)',
      'Presize collections; choose by access pattern ([[choosing-collections]])',
      'Exceptions are for exceptional paths — construction cost is the stack trace',
      'Small, focused methods inline; megamorphic call sites don\'t ([[jit-compilation]])',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The EJ Item 6/61 classic',
        code: '// ~6 seconds: creates 2^31 Long objects\nLong sum = 0L;\nfor (long i = 0; i < Integer.MAX_VALUE; i++) sum += i;\n\n// ~0.6 seconds: one variable\nlong sum2 = 0L;\nfor (long i = 0; i < Integer.MAX_VALUE; i++) sum2 += i;\n\n// Compile-once regex (String.matches recompiles per call):\nprivate static final Pattern ROMAN = Pattern.compile("^(?=.)M*(C[MD]|D?C{0,3})...");\nboolean isRoman(String s) { return ROMAN.matcher(s).matches(); }',
      },
      {
        kind: 'paragraph',
        text: 'Allocation nuance the books insist on: small short-lived objects are nearly free ([[gc-fundamentals|TLAB + young GC]]), and [[jit-compilation|escape analysis]] deletes many entirely — so "avoid objects" as a blanket style produces obfuscated code with no payoff (EJ 6 explicitly warns *against* your own object pools for lightweight objects). The wins live in **hot paths found by profiling**: per-request buffers reused, streams-of-boxes turned into [[primitive-streams|primitive streams]], format/parse objects (`DateTimeFormatter`, `Pattern`) hoisted to constants.',
      },
      {
        kind: 'table',
        caption: 'Hot-path checklist (distilled from Optimizing Java ch. 11 & Java Secrets)',
        headers: ['Area', 'Habit'],
        rows: [
          ['Strings', 'builder + presize; avoid `+=` in loops; `equals`, never `==`'],
          ['Boxing', 'primitives in loops/fields; primitive streams; watch `Map<Integer,…>` hot keys'],
          ['Collections', 'presize; right structure; iterate entrySet, not keySet+get'],
          ['Regex/formatters', 'compile once as `static final`'],
          ['Exceptions', 'never for control flow; consider `fillInStackTrace` cost'],
          ['Logging', 'parameterized messages; guard expensive args ([[logging]])'],
          ['I/O', 'buffer everything; batch syscalls ([[io-streams]])'],
          ['Methods', 'small and monomorphic-friendly for inlining'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Optimizing the cold path',
        text: 'Applying these habits everywhere costs readability and reviews. The 97/3 rule holds: ~3% of code is hot; the profiler tells you which ([[profiling]]). The remaining 97% should be optimized for the *reader*. An unreadable optimization in cold code is pure loss.',
      },
      {
        kind: 'note',
        title: 'Lazy vs eager, once more',
        text: 'Caching and lazy initialization trade memory + complexity for speed — both need eviction thought (an unbounded "cache" is a leak). Measure hit rates; a cache below ~80% hits often costs more than it saves (Java Secrets\' caching chapters).',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 6, 61, 63, 67' },
      { book: 'optimizing-java', chapter: 'Ch. 11 — Java Language Performance Techniques' },
      { book: 'java-secrets', chapter: 'Performance techniques chapters' },
    ],
    related: ['microbenchmarking', 'choosing-collections', 'strings-text', 'jit-compilation'],
  },

  {
    id: 'concurrent-performance',
    domainId: 'performance',
    title: 'Concurrent Performance',
    summary:
      'Amdahl\'s law caps speedup by the serial fraction — and locks are the serial fraction. Scale by shrinking critical sections, striping or removing shared state, and preferring CAS/immutability over exclusion.',
    keyPoints: [
      'Amdahl: 5% serial ⇒ max 20× speedup, on any core count',
      'Reduce lock scope (get in, get out), then lock granularity (stripe), then remove locks (CAS, confinement)',
      'Contention costs more than blocking: cache-line ping-pong, context switches',
      '`LongAdder` over `AtomicLong` for hot counters; `ConcurrentHashMap` over any synchronized map',
      'False sharing pads out ([[hardware-memory]]); per-thread state beats shared state',
      'Measure contention with JFR lock events, not intuition',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'JCiP ch. 11 frames it: concurrency\'s costs are context switches (a blocked thread parks — microseconds plus cache-refill), memory synchronization (fences defeat compiler/CPU optimizations), and contention (the serializer). The scalability ladder, in order of preference: **don\'t share** (thread confinement, per-request objects), **share immutably** ([[immutability-class-design]]), **share with CAS** ([[atomics-nonblocking]]), **share with striped/short locks**, and only then a single coarse lock.',
      },
      {
        kind: 'code',
        title: 'Shrinking the serial fraction',
        code: '// BAD: I/O and parsing inside the lock — the whole request serializes here\nsynchronized (cache) {\n    if (!cache.containsKey(key)) cache.put(key, parse(fetch(key)));\n    return cache.get(key);\n}\n\n// GOOD: the map handles atomicity; expensive work runs unlocked per key\nreturn cache.computeIfAbsent(key, k -> parse(fetch(k)));   // ConcurrentHashMap\n\n// Hot counter: striped cells absorb write contention\nprivate final LongAdder hits = new LongAdder();',
      },
      {
        kind: 'paragraph',
        text: '**Lock granularity**: one lock per hash bin (what `ConcurrentHashMap` does) instead of one per map multiplies throughput under write contention; per-connection instead of per-server; per-account instead of per-bank (with an [[liveness-hazards|ordering discipline]]). The end state of granularity shrinking is *no* lock: a single-writer design (one thread owns the state, others send messages via a queue) often out-scales clever locking entirely.',
      },
      {
        kind: 'pitfall',
        title: 'More threads ≠ more throughput',
        text: 'Past the saturation point, added threads add context switches and contention only — throughput *drops* while CPU climbs. If throughput stalls as load rises, look for the shared bottleneck (a lock, a pool, an fsync-ing logger — [[logging]]) with JFR\'s `JavaMonitorEnter` events. Little\'s law (L = λW) sizes what you actually need ([[executors-thread-pools]]).',
      },
      {
        kind: 'note',
        title: 'Virtual threads change the shape, not the physics',
        text: '[[virtual-threads]] eliminate thread-count ceilings for blocked-on-I/O work, but contended locks, saturated CPUs, and hot cache lines behave exactly as before. A million virtual threads waiting on one `synchronized` block is still one block.',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 11 — Performance and Scalability' },
      { book: 'optimizing-java', chapter: 'Ch. 12 — Concurrent Performance Techniques' },
      { book: 'ocnj', chapter: 'Ch. 13 — Concurrent Performance Techniques' },
    ],
    related: ['locks-synchronization', 'atomics-nonblocking', 'hardware-memory', 'scalability-patterns'],
  },

  {
    id: 'observability',
    domainId: 'performance',
    title: 'Observability',
    summary:
      'Observability = explaining system behavior from its outputs: structured logs, metrics, and distributed traces, unified today under OpenTelemetry. It replaces "can we reproduce it?" with "we can already see it".',
    keyPoints: [
      'Three signals: logs (events), metrics (aggregates over time), traces (request paths across services)',
      'OpenTelemetry is the vendor-neutral standard — instrument once, export anywhere',
      'Java auto-instrumentation: the OTel Java agent wires HTTP/JDBC/gRPC spans with zero code',
      'Metrics via Micrometer (Spring\'s default) → Prometheus/OTLP; alert on symptoms (SLOs), not causes',
      'Correlate: trace-id in every log line joins the three signals',
      'JVM-specifics: export GC pause time, heap after-GC, thread states, JFR streams',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'OCNJ\'s cloud-native premise: with dozens of service instances appearing and disappearing, attaching a profiler to "the slow box" is over — telemetry must be **always on, centrally aggregated, and correlated**. A request\'s story: the trace shows which hop spent the time; that span\'s attributes and the correlated logs say why; metrics say whether it\'s one request or all of them. Design dashboards around questions ("why is p99 up?"), not around data you happen to have.',
      },
      {
        kind: 'code',
        title: 'OpenTelemetry in a Java service',
        code: '# Zero-code start: the agent instruments common libraries automatically\n$ java -javaagent:opentelemetry-javaagent.jar \\\n       -Dotel.service.name=orders \\\n       -Dotel.exporter.otlp.endpoint=http://collector:4317 \\\n       -jar orders.jar\n\n// Custom spans where business logic needs visibility:\nSpan span = tracer.spanBuilder("price.calculate").startSpan();\ntry (Scope s = span.makeCurrent()) {\n    return engine.price(order);\n} finally {\n    span.end();\n}',
      },
      {
        kind: 'paragraph',
        text: '**JVM signals worth exporting** (OCNJ ch. 10–11): GC pause totals and max (the latency suspect #1 — [[gc-tuning-logging]]), heap-after-GC (the leak trend), allocation rate, thread counts by state (a BLOCKED pile-up is a [[liveness-hazards|lock story]]), and JFR event streams (JFR Streaming, Java 14+, feeds live JVM internals to your pipeline). Correlating a p99 spike with a GC pause — or proving the *absence* of that correlation — is the single most common observability win in Java services.',
      },
      {
        kind: 'pitfall',
        title: 'Cardinality explosions and unaggregatable averages',
        text: 'A metric tagged per-user or per-URL creates millions of time series and a monitoring bill to match — tag with bounded sets only. And export latency as **histograms** (Prometheus buckets, OTLP exponential histograms); you cannot compute a global p99 from per-instance averages or percentiles.',
      },
      {
        kind: 'note',
        title: 'Sampling traces',
        text: '100% tracing at scale is costly; head sampling (keep 1%) is cheap but blind to rare failures; tail sampling (decide after seeing the outcome, at the collector) keeps every error and slow trace. Most platforms land on tail sampling for exactly the requests you\'ll investigate.',
      },
    ],
    refs: [
      { book: 'ocnj', chapter: 'Ch. 10–11 — Introduction to Observability; Implementing Observability in Java' },
      { book: 'optimizing-java', chapter: 'Ch. 8 — GC Logging, Monitoring, Tuning' },
    ],
    related: ['logging', 'profiling', 'cloud-native-java', 'gc-tuning-logging'],
  },

  {
    id: 'cloud-native-java',
    domainId: 'performance',
    title: 'Cloud-Native Java',
    summary:
      'Containers changed the JVM\'s constraints: startup time matters (autoscaling), memory limits are hard (OOM-killer), and CPU quotas warp thread ergonomics. Configure the JVM for its cgroup, and attack cold start with CDS, CRaC, or native images.',
    keyPoints: [
      'The JVM is container-aware: defaults derive from cgroup CPU/memory limits — set `-XX:MaxRAMPercentage` deliberately',
      'Total memory = heap + metaspace + code cache + thread stacks + direct buffers; the OOM-killer counts it all',
      'CPU quota < 2 cores silently degrades GC/JIT parallelism — check `availableProcessors()`',
      'Cold-start ladder: AppCDS → CRaC checkpoint/restore → GraalVM native-image',
      'JIT warm-up meets autoscaling: fresh pods serve slow requests — pre-warm or scale earlier',
      'Right-size by measuring: a 4 GB limit around a 512 MB working set is money burned',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A sane container JVM',
        code: 'ENTRYPOINT ["java", \\\n  "-XX:MaxRAMPercentage=75",        # heap = 75% of container limit; rest for native\n  "-XX:+ExitOnOutOfMemoryError",    # die fast; let the orchestrator restart cleanly\n  "-Xlog:gc*:file=/logs/gc.log:time:filecount=5,filesize=20m", \\\n  "-XX:NativeMemoryTracking=summary", \\\n  "-jar", "app.jar"]\n\n$ jcmd 1 VM.native_memory summary    # where the non-heap memory went',
      },
      {
        kind: 'paragraph',
        text: 'The recurring incident (OCNJ ch. 8–9): container OOM-killed while heap dashboards showed 60% usage — because the *process* exceeded the cgroup limit on metaspace, thread stacks (hundreds of threads × 1 MB), and [[binary-data-buffers|direct buffers]]. Budget explicitly: for a 1 GiB limit, ~75% heap works only when threads and native usage are modest; Native Memory Tracking plus `jcmd` shows the real split.',
      },
      {
        kind: 'paragraph',
        text: '**Startup**: class loading + verification + interpretation + JIT warm-up can mean minutes to peak performance for a big Spring service — poison for scale-to-zero. The ladder: **AppCDS/CDS archives** (share pre-parsed class metadata, easy 10–40% off startup); **CRaC** (checkpoint a warmed JVM, restore in ~100 ms — needs framework cooperation to close/reopen sockets); **GraalVM native-image** (ms startup, MBs of RSS, but closed-world reflection config and generally lower peak throughput than warmed C2 — [[jit-compilation]]). Project Leyden is folding these ideas into the mainline JDK ([[future-directions]]).',
      },
      {
        kind: 'pitfall',
        title: 'Fractional CPU quotas',
        text: 'A `cpu: 500m` limit gives `availableProcessors() == 1`: GC goes effectively serial, the common ForkJoin pool gets one thread, and default sizing everywhere collapses. JVM services want ≥2 CPUs; below that, configure thread counts explicitly and expect longer pauses. Also beware CPU *throttling* with CFS quotas — bursty JIT compilation triggers it, showing up as mysterious early-life latency.',
      },
      {
        kind: 'note',
        title: 'Kubernetes etiquette',
        text: 'Liveness probes must not fail during GC pauses (generous timeouts); readiness gates traffic until warm-up ends (hit a warm-up endpoint first); `preStop` + connection draining beats dropped requests on scale-down. And logs to stdout, metrics scraped, traces exported — the [[observability]] triad is table stakes.',
      },
    ],
    refs: [
      { book: 'ocnj', chapter: 'Ch. 8–9 — Components of the Cloud Stack; Deploying Java in the Cloud' },
      { book: 'java-secrets', chapter: 'Cloud-native development chapters' },
    ],
    related: ['gc-algorithms', 'observability', 'jit-compilation', 'scalability-patterns'],
  },

  {
    id: 'scalability-patterns',
    domainId: 'performance',
    title: 'Scalability & Resilience Patterns',
    summary:
      'Scaling past one JVM is an architecture problem: statelessness enables horizontal scale, backpressure prevents overload collapse, and bulkheads/circuit breakers/timeouts stop one failing dependency from taking the fleet down.',
    keyPoints: [
      'Stateless services scale by replication; push state to stores designed for it',
      'Every remote call gets a **timeout**, a retry budget (with jittered backoff), and a fallback decision',
      'Retries without idempotency duplicate effects; retries without backoff are a self-inflicted DDoS',
      'Backpressure: bounded queues + load shedding beat unbounded buffering, always',
      'Bulkheads isolate resource pools per dependency; circuit breakers fail fast when a dependency is down',
      'Cache with a policy: TTL + bounded size + measured hit rate — or it\'s a leak with good PR',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The cascade anatomy (OCNJ ch. 14, Java Secrets\' fault-tolerance chapters): dependency B slows → A\'s threads pile up waiting on B → A\'s pool exhausts → A\'s callers queue → memory grows, GC thrashes, everything times out at once. Each defense targets a link: **timeouts** cap the wait, **bulkheads** cap the threads any one dependency can hold hostage, **circuit breakers** stop sending after failures cross a threshold (probing periodically for recovery), **load shedding** rejects work beyond capacity *early*, when rejection is still cheap.',
      },
      {
        kind: 'code',
        title: 'The resilient call, assembled',
        code: '// Resilience4j-style composition around a remote call:\nCircuitBreaker breaker = CircuitBreaker.ofDefaults("inventory");\nRetry retry = Retry.of("inventory", RetryConfig.custom()\n        .maxAttempts(3)\n        .intervalFunction(IntervalFunction.ofExponentialRandomBackoff(100, 2.0))\n        .retryExceptions(TimeoutException.class)      // retry ONLY idempotent, transient failures\n        .build());\nBulkhead bulkhead = Bulkhead.of("inventory", BulkheadConfig.custom()\n        .maxConcurrentCalls(20).build());\n\nSupplier<Stock> call = () -> client.stock(sku);       // client itself has a 500 ms timeout\nStock stock = Decorators.ofSupplier(call)\n        .withBulkhead(bulkhead).withCircuitBreaker(breaker).withRetry(retry)\n        .withFallback(List.of(CallNotPermittedException.class), e -> Stock.UNKNOWN)\n        .get();',
      },
      {
        kind: 'paragraph',
        text: '**Backpressure** is the system-level version of the [[concurrent-collections|bounded BlockingQueue]] rule: somewhere, a limit must exist; the only choice is whether it fails explicitly (429/503, caller-runs, shed) or implicitly (OOM, 30-second GC pause, cascading timeout storm). Unbounded thread pools, unbounded queues, and unlimited retries all "work" until the day they define your outage.',
      },
      {
        kind: 'pitfall',
        title: 'The retry storm',
        text: 'A dependency browns out; every client retries 3× immediately; its load triples at its weakest moment; it dies fully; recovery now needs the whole fleet\'s retries to drain. Exponential backoff **with jitter** and a fleet-level retry budget (e.g., retries ≤ 10% of requests) are what separate self-healing from self-harming systems.',
      },
      {
        kind: 'note',
        title: 'Scaling the data',
        text: 'Stateless compute scales trivially; state is the hard part — read replicas and caches for read scaling, partitioning/sharding for writes, async replication with staleness budgets. Every cache and replica introduces a consistency decision; make TTLs and invalidation explicit, and measure hit rates ([[language-performance|caching]] cuts both ways).',
      },
    ],
    refs: [
      { book: 'java-secrets', chapter: 'Scalability & fault-tolerance chapters' },
      { book: 'ocnj', chapter: 'Ch. 14 — Distributed Systems Techniques' },
      { book: 'jcip', chapter: 'Ch. 8 — Applying Thread Pools' },
    ],
    related: ['cloud-native-java', 'concurrent-performance', 'http-client', 'concurrent-collections'],
  },
]
