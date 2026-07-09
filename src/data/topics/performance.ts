import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'performance-methodology',
    domainId: 'performance',
    title: 'Performance Methodology',
    summary:
      'Performance is an experimental science: define measurable goals, measure a real system under real load, change one thing, measure again. Intuition about bottlenecks is wrong often enough that unmeasured "optimization" is indistinguishable from vandalism.',
    keyPoints: [
      {
        text: 'Quantify first: throughput, latency **percentiles** (p99, not mean), footprint, utilization',
        detail: 'A mean latency of 50ms can hide a p99 of 2 seconds if the distribution has a long tail — and that tail is exactly what a fraction of your users experience on every request. Without named, measurable targets for each of these four, "performance work" has no way to know when it is done or whether a change actually helped.',
      },
      {
        text: 'Top-down: system → JVM (GC/JIT) → code — most wins live above the code level',
        detail: 'A slow database query or a chatty network call dwarfs anything a micro-optimization in application code can claw back — so starting at the code level is usually starting at the wrong layer. Working top-down means ruling out the big, cheap wins (architecture, I/O, GC configuration) before spending effort on code-level tuning that yields the smallest, hardest-won gains.',
      },
      {
        text: 'Change one variable per experiment; keep everything else fixed',
        detail: 'Change two things at once and a measured improvement (or regression) cannot be attributed to either one — you are left guessing which change actually mattered, or whether they interacted in some way neither change alone would show. One variable per run is what makes "measure again" meaningful instead of just reassuring noise.',
      },
      {
        text: 'Averages lie: latency is a distribution with a long tail; report percentiles',
        detail: 'An average is dominated by the bulk of fast requests and can look perfectly healthy while a meaningful fraction of users wait seconds — the average literally cannot see the tail because it summarizes it away. Percentiles (p50, p95, p99, p99.9) each answer a different question: typical, most, and worst-experienced-often-enough-to-matter.',
      },
      {
        text: 'Optimize judiciously (EJ 67): write good programs, measure, then optimize the proven hot 3%',
        detail: 'Chasing performance before establishing correctness and a measurement baseline routinely produces code that is both wrong and not actually faster, because premature optimization tends to guess at bottlenecks rather than find them. The 3% figure is not exact, but the point behind it is: most of the code you write will never appear in a profile, so it should be optimized for the next reader, not for a speed that was never measured to matter.',
      },
      {
        text: 'Beware the classic antipatterns: shiny tuning flags, folklore recipes, benchmarking the wrong thing',
        detail: 'Each of these antipatterns feels like progress — you changed something, maybe a number moved — without ever connecting the change to a measured, reproducible cause. That is what separates tuning from vandalism: a real fix survives being challenged with "how do you know that helped, and why."',
      },
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
        detail: 'Architecture sets a ceiling code cannot exceed no matter how well-tuned — an API making ten sequential remote calls per request cannot be saved by making each call\'s serialization 10% faster. That is why "good architecture first" outranks "fast code": it changes what the achievable ceiling even is.',
      },
      {
        kind: 'note',
        title: 'Latency tools',
        text: 'Load-test with realistic traffic shapes (coordinated omission distorts naive load generators — use tools that account for it, e.g. wrk2/Gatling with HdrHistogram). Record latency full-range with HdrHistogram; a p99.9 of 2 s at 1000 req/s bites ~1 user per second.',
        detail: 'Coordinated omission happens when a naive load generator waits for a response before sending the next request — so during a slow patch, it sends fewer requests and "measures" artificially good latency for the few it does send, exactly when the system is struggling most. Tools built around HdrHistogram correct for this by tracking the requests that should have been sent on schedule, not just the ones that were.',
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
      {
        text: 'Never `System.nanoTime()` around a loop — warm-up, DCE, and OSR artifacts dominate',
        detail: 'A hand-rolled timing loop runs cold code for the first many iterations before the JIT has compiled anything, may have its body deleted entirely by dead-code elimination if the result is unused, and can suffer on-stack-replacement pauses mid-measurement — any one of these can dominate the reported number far more than the code you meant to measure.',
      },
      {
        text: 'JMH: `@Benchmark` methods, forked JVMs, warm-up iterations, statistical output',
        detail: 'Each forked JVM starts cold and warms up independently, which is what makes JMH\'s numbers comparable across runs — a shared, already-warmed JVM would let one benchmark\'s JIT state bleed into the next. The statistical output exists because a single run is noise; only repeated, forked measurements separate signal from variance.',
      },
      {
        text: 'Return values or sink them into `Blackhole` — otherwise the JIT deletes the computation',
        detail: 'If a computed value is never read anywhere, the JIT is fully entitled to conclude it has no observable effect and remove it, leaving you measuring an empty loop. `Blackhole.consume()` (or simply returning the value from the `@Benchmark` method) creates an artificial use the compiler cannot prove away.',
      },
      {
        text: 'Beware constant folding: inputs must come from `@State` fields, not literals',
        detail: 'A computation over compile-time constants can be evaluated once at compile time and replaced with its answer — the "benchmark" then measures nothing more than a hardcoded return. `@State` fields are opaque to the compiler until runtime, forcing the actual computation to run on every invocation, as production code would experience it.',
      },
      {
        text: 'Microbenchmarks answer *micro* questions; validate at system level before believing them',
        detail: 'A microbenchmark measures one method, fully warmed, in isolation — it says nothing about how that method behaves under real allocation pressure, cache contention from neighboring code, or GC pauses triggered by the rest of the system. A win in isolation only matters if it survives contact with the full system under real load.',
      },
      {
        text: 'Run on quiet hardware; mind turbo/thermal effects; compare distributions, not single runs',
        detail: 'A CPU that boosts its clock speed when the rest of the machine is idle reports different numbers than the same code running alongside other load, and thermal throttling after a few minutes can quietly slow a benchmark partway through its own run. Comparing distributions across multiple forked runs surfaces this kind of environmental noise instead of mistaking it for a real result.',
      },
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
        detail: 'All three traps share a root cause: the JIT and compiler are allowed to remove or precompute anything they can prove has no observable effect, and a careless microbenchmark is full of code with no observable effect by construction. Blackhole, `@State` fields, and forked warm-up all exist specifically to make the computation observable and force it to run for real.',
      },
      {
        kind: 'paragraph',
        text: 'The deeper caveat (both performance books): a microbenchmark answers "how fast is this method in isolation, fully warm, on this data". Production asks "does this change move p99 under mixed load". Use microbenchmarks to compare *implementations of a proven hot spot* ([[profiling]] finds those), and re-validate at system level. Most engineers need system benchmarks weekly and microbenchmarks yearly.',
      },
      {
        kind: 'note',
        title: 'Running it',
        text: 'JMH generates via `mvn archetype:generate -DarchetypeArtifactId=jmh-java-benchmark-archetype`, or Gradle plugin `me.champeau.jmh`. Run the built jar, not the IDE (IDE runners skip forking). `-prof gc` adds allocation rates; `-prof perfasm` shows the actual assembly — the final word in any JIT argument ([[jit-compilation]]).',
        detail: 'Running the built jar rather than inside the IDE matters because JMH forks a fresh JVM per trial specifically to isolate profile pollution between benchmarks — an IDE\'s run button typically skips that fork and reuses one warm JVM, quietly invalidating the isolation the harness was designed to provide.',
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
      {
        text: 'Always run with `-Xlog:gc*:file=gc.log:time,uptime,level,tags` — negligible overhead, priceless data',
        detail: 'Unified GC logging costs a fraction of a percent of throughput because it is just appending structured lines to a file — nowhere near the overhead of a profiler — yet it is the one artifact that lets you diagnose a GC-related incident that happened last night without having to reproduce it live.',
      },
      {
        text: 'First-order knobs: heap size (`-Xmx`/`-Xms`), collector choice, `-XX:MaxGCPauseMillis` (G1)',
        detail: 'These three cover the vast majority of GC tuning value: heap size trades memory for collection frequency, collector choice trades throughput for pause-time predictability, and the pause-time goal tells G1 how aggressively to work to hit it. Nearly everything past these three is a smaller, more situational knob.',
      },
      {
        text: 'Read for: allocation rate (MB/s), pause durations & causes, promotion rate, full-GC frequency',
        detail: 'Allocation rate tells you how fast young gen fills (and therefore how often young GCs fire); promotion rate tells you how much of that allocation survives long enough to age into old gen; full-GC frequency is the alarm bell for either a genuine leak or a heap that is simply too small for the live set. Reading these four in order usually points straight at the dominant problem.',
      },
      {
        text: 'Set `-Xms` = `-Xmx` in servers/containers — resizing causes pauses and confuses ergonomics',
        detail: 'A heap that starts small and grows on demand pays a resize pause exactly when the application is under enough load to need the extra room — the worst possible time. Fixing `-Xms` equal to `-Xmx` trades a small amount of upfront memory reservation for eliminating that entire class of pause.',
      },
      {
        text: 'Symptom→cause: frequent young GC = high allocation; growing old gen = leak or premature promotion; "to-space exhausted" (G1) = evacuation pressure',
        detail: 'Each symptom narrows the search dramatically: frequent young GCs send you to an allocation profiler, not a heap-size conversation; a steadily growing old gen after every full GC (rather than a sawtooth that resets) is the leak signature specifically; and evacuation failure means G1 could not find room to copy live objects during a collection, usually because the heap itself is too small for the live data.',
      },
      {
        text: 'Analyze with GCViewer / gceasy.io; correlate pauses with request-latency spikes',
        detail: 'A GC log by itself only proves the JVM paused; correlating that timestamp against your request-latency dashboard is what proves — or disproves — that GC caused the specific spike users felt. Without that correlation step, "the GC logs look bad" is not yet evidence of anything actionable.',
      },
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
        detail: 'GC tuning flags can only rearrange how the collector responds to a given allocation rate — they cannot make the application allocate less. When the actual problem is accidental allocation, no amount of `-XX` flag tuning closes that gap; only reducing the allocation itself does.',
      },
      {
        kind: 'note',
        title: 'Ergonomics respect containers',
        text: 'Defaults derive from container limits: max heap ¼ of the cgroup memory limit, GC threads from the CPU quota. Explicitly set `-XX:MaxRAMPercentage=75` (or a fixed `-Xmx`) in Kubernetes, and leave headroom for metaspace + direct buffers + stacks under the same limit ([[cloud-native-java]]).',
        detail: 'The JVM\'s default heap-sizing ergonomics respect container cgroup limits, but "respects" does not mean "optimizes for your specific memory budget." Metaspace, direct buffers, and thread stacks all live outside the heap and inside the same cgroup limit, so an aggressive default heap fraction can still starve them and trigger an OOM-kill that heap graphs alone won\'t explain.',
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
      {
        text: 'JFR: `-XX:StartFlightRecording` or `jcmd JFR.start` — ~1% overhead, safe in production',
        detail: 'JFR is built into the JVM itself and uses the same low-level event infrastructure the JVM already maintains for its own bookkeeping, which is why its overhead is low enough to leave running permanently — unlike most profilers, it was designed from the start to be safe in a live production service, not just a diagnostic session.',
      },
      {
        text: 'async-profiler: CPU/alloc/lock flame graphs without safepoint bias',
        detail: 'Classic sampling profilers can only take a sample when the JVM reaches a safepoint, which systematically over-represents safepoint-friendly code and under-represents tight, JIT-compiled loops that rarely hit one. async-profiler samples via OS-level mechanisms instead, so it captures exactly the hot, tightly-compiled code that safepoint-biased tools miss.',
      },
      {
        text: 'Flame graph reading: width = time share; look for wide plateaus you own',
        detail: 'Height in a flame graph is just call-stack depth and carries no performance meaning by itself — width is the only dimension that encodes where time actually goes. A wide, flat plateau near the top of the stack, deep in your own code rather than a library, is exactly the shape of a genuine, addressable hot spot.',
      },
      {
        text: 'Execution profilers hide I/O waits — wall-clock mode or JFR events catch blocked time',
        detail: 'A thread blocked waiting for a socket read or a lock is, by definition, not executing any code — so a CPU-sampling profiler correctly reports zero CPU time for it and makes the wait invisible. Wall-clock sampling, or JFR\'s explicit blocking events, samples on elapsed time regardless of whether the thread is running, which is the only way to see time spent waiting rather than computing.',
      },
      {
        text: 'Heap analysis: `jcmd GC.heap_dump` + Eclipse MAT (dominator tree finds leaks)',
        detail: 'A dominator tree answers "if this object were freed, what else would become unreachable with it" — a much sharper leak-finding question than "what is biggest," since a leak is usually one long-lived root (a static map, an unbounded cache) retaining a large subgraph of otherwise-normal objects underneath it.',
      },
      {
        text: 'Old instrumenting profilers distort hot code — trust sampling',
        detail: 'Instrumenting profilers insert timing code around every method call, and that overhead is not evenly distributed — small, frequently-called methods get proportionally more distortion than large, rarely-called ones, which can make a fast method look artificially slow. Sampling profilers observe the running program from outside at intervals, adding overhead without changing what the code itself does.',
      },
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
        detail: 'A CPU flame graph can only show time spent executing code — a thread parked waiting for a lock or a downstream response is, from the CPU profiler\'s perspective, doing nothing worth recording, so the graph looks small and unremarkable even while user-facing latency is terrible. Profile the resource that is actually scarce, not the one that happens to be easy to sample.',
      },
      {
        kind: 'note',
        title: 'Continuous profiling',
        text: 'Always-on JFR with rotating recordings (`maxage`/`maxsize`) means the incident at 3 a.m. is *already recorded* when you wake up. Cloud vendors and tools (Pyroscope, Parca) productize continuous flame graphs — the profiling counterpart of [[observability]].',
        detail: 'The alternative to always-on profiling is reproducing an incident after the fact, which requires the failure to happen again under observation — something intermittent problems routinely refuse to do. A rotating JFR recording sidesteps that entirely: by the time anyone asks what was happening at 3 a.m., the recording already captured it.',
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
      {
        text: 'Avoid creating unnecessary objects **in hot paths** (EJ 6) — elsewhere, clarity wins',
        detail: 'This advice is routinely over-applied: EJ 6 itself warns against hand-rolled object pools for lightweight objects, because young-generation allocation and collection is already extremely cheap ([[gc-fundamentals]]). The qualifier "in hot paths" is doing the real work — outside code the profiler has actually identified as hot, the same advice just produces harder-to-read code for no measured benefit.',
      },
      {
        text: 'String concat in loops → `StringBuilder`, presized when possible (EJ 63)',
        detail: 'Each `+` on a `String` inside a loop allocates a brand-new backing array and copies everything built so far into it, making the total work quadratic in the number of concatenations. A single `StringBuilder`, ideally presized to the expected final length, amortizes that copying down to roughly linear.',
      },
      {
        text: 'Boxing in hot loops: `Long sum` in a loop creates millions of objects (EJ 61)',
        detail: 'Every arithmetic operation on a boxed `Long` unboxes it, computes on the primitive, and reboxes a brand-new `Long` object to hold the result — a loop that looks like simple addition is secretly allocating one object per iteration. Declaring the accumulator as a primitive `long` removes the boxing entirely and can be an order of magnitude faster.',
      },
      {
        text: 'Presize collections; choose by access pattern ([[choosing-collections]])',
        detail: 'A collection that grows by doubling still copies all existing elements into the new backing array on every resize — presizing to the known or estimated final count eliminates that copying altogether. Choosing the right structure for the access pattern usually matters far more than any micro-tuning of a poorly-chosen one.',
      },
      {
        text: 'Exceptions are for exceptional paths — construction cost is the stack trace',
        detail: 'Constructing a `Throwable` walks and records every frame on the current call stack, which is genuinely expensive compared to almost any other single operation in the language — the `throw` itself is cheap, but building the object to throw is not. This is exactly why exceptions make a poor substitute for ordinary control flow: the cost is paid on every use, not just the rare ones.',
      },
      {
        text: 'Small, focused methods inline; megamorphic call sites don\'t ([[jit-compilation]])',
        detail: 'The JIT can only inline a call site if it can predict, with high confidence, which concrete method implementation will run there — a call site that sees more than a couple of different implementations in practice (megamorphic) forces a real virtual dispatch on every call instead. Small methods are more likely to stay monomorphic or bimorphic and are cheap to inline even when they don\'t.',
      },
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
        detail: 'Every one of the hot-path habits in this topic trades some readability for speed — presized builders, primitive accumulators, hoisted regex constants all read as slightly more mechanical than the naive version. Paying that cost in code the profiler never flags as hot is a pure loss: no user ever notices the speed, but every future reader notices the awkwardness.',
      },
      {
        kind: 'note',
        title: 'Lazy vs eager, once more',
        text: 'Caching and lazy initialization trade memory + complexity for speed — both need eviction thought (an unbounded "cache" is a leak). Measure hit rates; a cache below ~80% hits often costs more than it saves (Java Secrets\' caching chapters).',
        detail: 'An unbounded cache is not actually a performance optimization — it is a memory leak that happens to also serve stale-but-fast reads until it runs the heap out of memory. The 80% hit-rate threshold is a useful rule of thumb because below it, the bookkeeping and eviction overhead of maintaining the cache can exceed what a cache miss would have cost anyway.',
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
      {
        text: 'Amdahl: 5% serial ⇒ max 20× speedup, on any core count',
        detail: 'Amdahl\'s law computes the ceiling from the serial fraction alone: with 5% of the work unavoidably serial, even infinite cores cannot push the speedup past 1/0.05 = 20×, because that serial 5% eventually dominates total wall-clock time no matter how fast the parallel 95% runs. Adding more cores past that ceiling buys nothing.',
      },
      {
        text: 'Reduce lock scope (get in, get out), then lock granularity (stripe), then remove locks (CAS, confinement)',
        detail: 'This is a deliberate order of increasing effort and increasing payoff: shrinking what happens inside an existing lock is nearly free and immediately reduces the serial fraction; splitting one lock into several (striping) requires redesigning the data structure; removing the lock entirely (via CAS or confining state to one thread) is the most work but removes contention as a concept rather than just reducing it.',
      },
      {
        text: 'Contention costs more than blocking: cache-line ping-pong, context switches',
        detail: 'A blocked thread simply waits; a contended lock forces the cache line holding the lock state to bounce between CPU cores as each one tries to acquire it, which is measurably more expensive than the wait itself. "High CPU, low throughput" is often a contention symptom, not a genuine compute-bound one.',
      },
      {
        text: '`LongAdder` over `AtomicLong` for hot counters; `ConcurrentHashMap` over any synchronized map',
        detail: '`AtomicLong` funnels every increment through a single CAS-contended memory location, so under high concurrency threads spend more time retrying failed CAS attempts than doing useful work; `LongAdder` stripes the counter across multiple cells so concurrent writers usually land on different cells and never contend, only summing the cells when a read is needed.',
      },
      {
        text: 'False sharing pads out ([[hardware-memory]]); per-thread state beats shared state',
        detail: 'Two unrelated variables that happen to sit on the same CPU cache line will bounce that entire line between cores whenever either thread writes its own variable, even though the threads never touch each other\'s data. Padding forces each hot variable onto its own cache line so independent writers stop invisibly contending; avoiding shared state in the first place sidesteps the whole class of problem.',
      },
      {
        text: 'Measure contention with JFR lock events, not intuition',
        detail: 'Which lock is actually contended, and how badly, is rarely obvious from reading the code — a lock that looks scary because it guards a big method may be barely contended in practice, while an innocuous-looking one on a hot path may be the real bottleneck. JFR\'s `JavaMonitorEnter` events record actual wait times per lock, replacing a guess with a measurement.',
      },
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
        detail: 'Past the point where all available parallelism is already exploited, every additional thread only adds scheduling and contention overhead — there is no more real work for it to do in parallel, so it just competes with existing threads for the same CPUs and locks. Little\'s law gives a principled way to compute the actual concurrency a system needs instead of guessing at a thread-pool size.',
      },
      {
        kind: 'note',
        title: 'Virtual threads change the shape, not the physics',
        text: '[[virtual-threads]] eliminate thread-count ceilings for blocked-on-I/O work, but contended locks, saturated CPUs, and hot cache lines behave exactly as before. A million virtual threads waiting on one `synchronized` block is still one block.',
        detail: 'Virtual threads solve the specific problem of thread-count ceilings for I/O-bound waiting — you can have a million of them blocked on network calls without exhausting OS resources — but they run on the same finite CPUs and contend for the same locks and cache lines as before. A `synchronized` block that serializes access is still exactly as serializing whether one physical thread or a million virtual ones are queued behind it.',
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
      {
        text: 'Three signals: logs (events), metrics (aggregates over time), traces (request paths across services)',
        detail: 'Each signal answers a different question and none substitutes for the others: logs tell you *what happened* at one point, metrics tell you *how much/how often* across the whole fleet, and traces tell you *where time went* for one specific request as it crossed service boundaries. A complete incident investigation usually needs all three, correlated together.',
      },
      {
        text: 'OpenTelemetry is the vendor-neutral standard — instrument once, export anywhere',
        detail: 'Before OpenTelemetry, instrumenting a service meant coupling code to one specific vendor\'s SDK, and switching backends later meant re-instrumenting everything. OTel standardizes the instrumentation API separately from the export format, so the same instrumented code can ship data to any OTLP-compatible backend without a code change.',
      },
      {
        text: 'Java auto-instrumentation: the OTel Java agent wires HTTP/JDBC/gRPC spans with zero code',
        detail: 'The agent attaches at JVM startup and rewrites bytecode for known libraries as they load, inserting span creation around their entry points — which is why it needs no source changes at all, only a `-javaagent` flag, and why it only covers libraries it specifically knows how to instrument.',
      },
      {
        text: 'Metrics via Micrometer (Spring\'s default) → Prometheus/OTLP; alert on symptoms (SLOs), not causes',
        detail: 'Alerting on a cause, like "CPU is at 80%," pages someone for a condition that may or may not actually be hurting users, while alerting on a symptom, like "p99 latency exceeds the SLO," pages exactly when users are actually affected, regardless of which underlying cause is responsible this time.',
      },
      {
        text: 'Correlate: trace-id in every log line joins the three signals',
        detail: 'Without a shared identifier, a slow trace and the log lines that explain why it was slow are two separate haystacks with no way to connect them except timestamps, which get unreliable once multiple requests overlap. Threading the same trace ID through every log line emitted while handling that request turns "search the logs around this time" into "search the logs for this exact ID."',
      },
      {
        text: 'JVM-specifics: export GC pause time, heap after-GC, thread states, JFR streams',
        detail: 'These four JVM-internal signals are what let you rule GC in or out as the cause of an application-level latency spike without needing to attach a profiler live — a GC pause overlapping a latency spike in the dashboards is a strong, fast-to-check hypothesis, before reaching for anything more invasive.',
      },
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
        detail: 'A time series is created for every unique combination of tag values, so a per-user tag on a metric with a million users creates a million time series — most monitoring systems price and perform by series count, making this both a cost and a query-latency problem. An average of averages is not the true average, which is why raw histogram buckets, aggregated centrally, are the only mathematically valid way to compute a fleet-wide p99.',
      },
      {
        kind: 'note',
        title: 'Sampling traces',
        text: '100% tracing at scale is costly; head sampling (keep 1%) is cheap but blind to rare failures; tail sampling (decide after seeing the outcome, at the collector) keeps every error and slow trace. Most platforms land on tail sampling for exactly the requests you\'ll investigate.',
        detail: 'Head sampling decides whether to keep a trace before it knows the outcome, so it keeps roughly the same fraction of fast, boring requests as slow, broken ones — exactly the failures you most want to investigate are the ones it is most likely to have discarded. Tail sampling defers that decision until the request finishes, so it can specifically keep every error and slow outlier while still discarding the uninteresting bulk.',
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
      {
        text: 'The JVM is container-aware: defaults derive from cgroup CPU/memory limits — set `-XX:MaxRAMPercentage` deliberately',
        detail: 'Modern JVMs read the container\'s cgroup limits, not the host machine\'s total memory, to compute default heap sizing — but the default fraction is a generic compromise that does not know how much of your container\'s budget needs to go to metaspace, thread stacks, or direct buffers. Setting the percentage explicitly is how you encode that knowledge instead of trusting a one-size-fits-all default.',
      },
      {
        text: 'Total memory = heap + metaspace + code cache + thread stacks + direct buffers; the OOM-killer counts it all',
        detail: 'The container\'s OOM-killer watches total process RSS, not JVM heap usage — so a service can be OOM-killed while every heap dashboard shows plenty of headroom, because the memory that actually ran out was metaspace, native thread stacks, or off-heap buffers the heap graphs never account for.',
      },
      {
        text: 'CPU quota < 2 cores silently degrades GC/JIT parallelism — check `availableProcessors()`',
        detail: 'The JVM sizes its GC worker-thread count and common ForkJoinPool from `Runtime.availableProcessors()`, which under a fractional CPU quota reports as a single core — collapsing parallel GC to effectively serial and starving anything that assumes multiple worker threads, all without any error or warning.',
      },
      {
        text: 'Cold-start ladder: AppCDS → CRaC checkpoint/restore → GraalVM native-image',
        detail: 'Each rung trades more setup effort for a bigger startup-time win: AppCDS shares pre-parsed class metadata across JVM runs for a modest, easy improvement; CRaC checkpoints an already-warmed-up JVM and restores it almost instantly but requires the application to cooperate with closing and reopening sockets; native-image compiles ahead-of-time for millisecond startup, at the cost of closed-world reflection constraints and typically lower peak throughput than a fully warmed JIT.',
      },
      {
        text: 'JIT warm-up meets autoscaling: fresh pods serve slow requests — pre-warm or scale earlier',
        detail: 'A newly-started pod runs entirely in the interpreter, or lightly JIT\'d, until enough requests trigger tiered compilation to kick in — so the first wave of real traffic an autoscaled pod receives is served at a fraction of steady-state speed, right when the system is scaling out specifically because it needs more capacity urgently.',
      },
      {
        text: 'Right-size by measuring: a 4 GB limit around a 512 MB working set is money burned',
        detail: 'Cloud costs typically scale with the resource limit requested, not what is actually used — so an oversized container limit is a recurring bill for capacity nobody is using, while an undersized one risks OOM-kills. Measuring the actual working set is what turns the limit into an informed number instead of a guess rounded up for safety.',
      },
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
        detail: 'CFS quotas allow bursting above the average rate briefly, then throttle the container hard once it exceeds its quota within a scheduling period — which is exactly what a burst of JIT compilation activity during warm-up tends to trigger, producing a latency spike that has nothing to do with request volume and everything to do with the container being paused by the kernel.',
      },
      {
        kind: 'note',
        title: 'Kubernetes etiquette',
        text: 'Liveness probes must not fail during GC pauses (generous timeouts); readiness gates traffic until warm-up ends (hit a warm-up endpoint first); `preStop` + connection draining beats dropped requests on scale-down. And logs to stdout, metrics scraped, traces exported — the [[observability]] triad is table stakes.',
        detail: 'A liveness probe that fails during a long GC pause causes Kubernetes to kill and restart a perfectly healthy pod that was simply paused — which not only wastes the restart but discards whatever warm-up progress that pod had already made. Generous liveness timeouts are what keep a normal GC pause from looking like a crash.',
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
      {
        text: 'Stateless services scale by replication; push state to stores designed for it',
        detail: 'A stateless instance can be killed, replaced, or multiplied at any moment because no request depends on which specific instance handles it — the moment an instance holds session state or in-memory data another request needs, replacing it becomes lossy or requires sticky routing, defeating much of the point of horizontal scaling.',
      },
      {
        text: 'Every remote call gets a **timeout**, a retry budget (with jittered backoff), and a fallback decision',
        detail: 'Without a timeout, a hung remote call ties up the calling thread indefinitely, and that pile-up is exactly the mechanism behind most cascading failures. The retry budget and fallback decide what happens next once the timeout fires, so all three exist together — a timeout with no fallback just converts "slow" into "slow, then also fails."',
      },
      {
        text: 'Retries without idempotency duplicate effects; retries without backoff are a self-inflicted DDoS',
        detail: 'Retrying a non-idempotent operation after a timeout risks performing it twice if the original request actually succeeded and only the response was lost — the caller cannot tell the difference between "it failed" and "it succeeded but I didn\'t hear back." Retrying immediately, at scale, during an outage is also literally what a distributed denial-of-service attack looks like, just self-inflicted by your own fleet.',
      },
      {
        text: 'Backpressure: bounded queues + load shedding beat unbounded buffering, always',
        detail: 'An unbounded queue does not remove the overload — it just delays the failure and converts it into an out-of-memory crash later, with every queued request eventually timing out anyway, just much later and with a much worse failure mode. A bounded queue plus explicit shedding fails fast, cheaply, and predictably.',
      },
      {
        text: 'Bulkheads isolate resource pools per dependency; circuit breakers fail fast when a dependency is down',
        detail: 'Without a bulkhead, one slow dependency can consume every thread in a shared pool waiting on it, starving calls to every *other* dependency that would otherwise have succeeded quickly. A circuit breaker goes further: once failures cross a threshold, it stops even attempting calls for a cooldown period, sparing both the caller\'s threads and the already-struggling dependency.',
      },
      {
        text: 'Cache with a policy: TTL + bounded size + measured hit rate — or it\'s a leak with good PR',
        detail: 'A cache with no eviction policy is, structurally, identical to a memory leak — it just has a friendlier name because it is also serving useful data on the way to exhausting memory. TTL and bounded size are what make it a cache rather than a leak; measured hit rate is what proves it is worth the memory it spends.',
      },
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
        detail: 'The mechanism is a feedback loop: retries add load precisely when the dependency is already struggling, which makes it fail more, which triggers more retries — each iteration makes the underlying problem worse rather than better. Jittered exponential backoff spreads retries out over time instead of synchronizing them into further bursts, and a fleet-wide retry budget caps total retry volume regardless of how many individual clients are retrying.',
      },
      {
        kind: 'note',
        title: 'Scaling the data',
        text: 'Stateless compute scales trivially; state is the hard part — read replicas and caches for read scaling, partitioning/sharding for writes, async replication with staleness budgets. Every cache and replica introduces a consistency decision; make TTLs and invalidation explicit, and measure hit rates ([[language-performance|caching]] cuts both ways).',
        detail: 'Compute scales by adding more identical, interchangeable instances; data does not have that luxury because each replica or shard holds different bytes that must somehow stay consistent with each other. Every read replica and every cache is an explicit tradeoff between staleness and scale, which is why TTLs and invalidation strategy deserve as much design attention as the caching decision itself.',
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
