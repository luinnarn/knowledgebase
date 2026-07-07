import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'jvm-architecture',
    domainId: 'jvm',
    title: 'JVM Architecture',
    summary:
      'The JVM is a managed runtime: it loads bytecode through class loaders, interprets it, profiles it, JIT-compiles the hot parts to machine code, and manages memory with garbage collection — trading a warm-up phase for adaptive, profile-guided speed.',
    keyPoints: [
      'Pipeline: class loading → bytecode verification → interpretation → profiling → JIT compilation',
      'Major subsystems: class loader, runtime data areas (heap, stacks, metaspace), execution engine (interpreter + JIT), GC',
      'HotSpot optimizes the common path based on **observed runtime behavior** — often beating static compilation',
      'Java\'s two value kinds: primitives and object references — no raw pointers',
      '`java -XX:+PrintFlagsFinal` reveals the ~700 tunables; most should stay untouched',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The design bet of the managed runtime (Optimizing Java ch. 2): accept an abstraction layer between code and CPU, and repay it with runtime knowledge no static compiler has — which branches are actually taken, which types actually flow, which locks are actually contended. The interpreter starts instantly; the JIT ([[jit-compilation]]) recompiles hot methods with profile-guided aggression; GC ([[gc-fundamentals]]) replaces manual memory management with throughput-tuned automation.',
      },
      {
        kind: 'table',
        caption: 'Runtime data areas',
        headers: ['Area', 'Holds', 'Per', 'Failure mode'],
        rows: [
          ['Heap', 'all objects and arrays', 'JVM', '`OutOfMemoryError: Java heap space`'],
          ['Java stacks', 'frames: locals, operand stack, return addresses', 'thread', '`StackOverflowError`'],
          ['Metaspace', 'class metadata (native memory since Java 8)', 'JVM', '`OOME: Metaspace`'],
          ['Code cache', 'JIT-compiled machine code', 'JVM', 'JIT stops compiling (silent slowdown)'],
          ['Native/direct', 'direct ByteBuffers, thread stacks, JNI', 'JVM/OS', 'RSS growth invisible to heap monitoring'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'A running JVM is a **multithreaded native process**: your application threads share the process with JIT compiler threads, GC worker threads, and service threads (signal dispatch, attach listener). "The application is idle but CPU is busy" frequently means GC or JIT activity — visible with `jcmd`/JFR ([[profiling]]).',
      },
      {
        kind: 'code',
        title: 'Interrogating the JVM',
        code: '$ java -XX:+PrintFlagsFinal -version | grep -i maxheap   // effective flag values\n$ jcmd <pid> VM.flags                                     // a live process\'s flags\n$ jcmd <pid> VM.version\n$ jcmd <pid> GC.heap_info',
      },
      {
        kind: 'note',
        title: 'Which JVM?',
        text: 'HotSpot (OpenJDK) dominates and is what these notes describe; Eclipse OpenJ9 and GraalVM (JIT written in Java, plus native-image AOT) are the notable alternatives. Distributions (Temurin, Corretto, Zulu, Oracle) build the same OpenJDK source with different support contracts ([[cloud-native-java]]).',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 2 — Overview of the JVM' },
      { book: 'ocnj', chapter: 'Ch. 3 — Overview of the JVM' },
      { book: 'java-secrets', chapter: 'Java execution model chapters' },
    ],
    related: ['class-loading', 'bytecode-execution', 'memory-layout', 'jit-compilation'],
  },

  {
    id: 'class-loading',
    domainId: 'jvm',
    title: 'Class Loading',
    summary:
      'Classes load lazily, on first use, through a delegating hierarchy of class loaders: bootstrap → platform → application. Loading, linking (verify/prepare/resolve), and initialization are distinct phases with precise ordering guarantees.',
    keyPoints: [
      'Phases: load bytes → verify → prepare (defaults) → resolve (lazy) → initialize (static init runs)',
      'Parent delegation: a loader asks its parent first — core classes can\'t be spoofed',
      'A class\'s identity is (class loader, binary name) — same bytes in two loaders = two different classes',
      'Static initializers run **once**, under the JVM\'s own lock — the holder idiom exploits this',
      '`ClassNotFoundException` (asked by name, absent) vs `NoClassDefFoundError` (present at compile, missing/failed at run)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Watching laziness happen',
        code: '$ java -verbose:class Main | head\n[Loaded java.lang.Object from shared objects file]\n[Loaded java.lang.String ...]\n...\n// Initialization is even lazier than loading:\nclass A { static { System.out.println("A initialized"); } }\nClass<?> c = Class.forName("A", false, loader);   // loaded, NOT initialized\nA.someStatic();                                    // NOW "A initialized" prints',
      },
      {
        kind: 'paragraph',
        text: 'Initialization triggers (JLS §12.4): first instance creation, static method call, non-constant static field access, `Class.forName`, or initialization of a subclass. The JVM guarantees exactly-once initialization under an internal lock — which is why the [[java-memory-model|holder class idiom]] is thread-safe lazy loading with zero synchronization code of your own.',
      },
      {
        kind: 'paragraph',
        text: '**Custom class loaders** override `findClass` and call `defineClass(bytes)` — the mechanism behind application servers (per-app isolation), plugin systems, hot reload, and bytecode instrumentation agents. Two loaders defining the same class name produce **incompatible types**: the infamous `ClassCastException: com.acme.Foo cannot be cast to com.acme.Foo` means two loaders each defined `Foo`.',
      },
      {
        kind: 'pitfall',
        title: 'Static initializer failures poison the class',
        text: 'If a static initializer throws, the first caller gets `ExceptionInInitializerError` — and every later use of the class gets a bare `NoClassDefFoundError` with no explanation. When you see NCDFE for a class that is plainly on the classpath, hunt the *earlier* initializer failure in the logs.',
      },
      {
        kind: 'note',
        title: 'Modules and loaders',
        text: 'Since Java 9 the platform is modularized: the *platform* loader replaced the extension loader, and [[modules-jpms|JPMS]] readability rules apply before class loading resolves anything. AppCDS and Project Leyden lean on class-loading determinism to cut startup time ([[cloud-native-java]]).',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 9.1 — Class Loaders' },
      { book: 'optimizing-java', chapter: 'Ch. 2 — Overview of the JVM' },
      { book: 'java-secrets', chapter: 'Execution model chapters' },
    ],
    related: ['jvm-architecture', 'modules-jpms', 'reflection', 'java-memory-model'],
  },

  {
    id: 'bytecode-execution',
    domainId: 'jvm',
    title: 'Bytecode & Execution',
    summary:
      'Bytecode is a compact stack-machine instruction set: ~200 opcodes pushing and popping an operand stack per frame. `javap -c` disassembles it — the ground truth for "what does this Java actually compile to".',
    keyPoints: [
      'Stack machine: operands push/pop on the operand stack; locals live in numbered slots',
      'Opcode families: loads/stores (`aload_0`), arithmetic (`iadd`), control (`ifeq`, `goto`), invocation, allocation',
      'Five invokes: `invokevirtual`, `invokeinterface`, `invokespecial`, `invokestatic`, `invokedynamic`',
      '`invokedynamic` (indy) powers lambdas, string concat, records\' generated methods',
      'The verifier proves type safety before execution — malformed bytecode never runs',
      'String `switch`, boxing, string concat: all sugar — `javap` shows the truth',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'javap: reading the truth',
        code: 'int add(int a, int b) { return a + b; }\n\n$ javap -c Adder\n  int add(int, int);\n    Code:\n       0: iload_1        // push local slot 1 (a)\n       1: iload_2        // push local slot 2 (b)\n       2: iadd           // pop two ints, push sum\n       3: ireturn        // return top of stack\n// slot 0 is `this` for instance methods',
      },
      {
        kind: 'paragraph',
        text: 'The class file contains the **constant pool** (all symbolic references: names, types, string literals), method bytecode with per-method max-stack/max-locals, exception tables, and attributes (line numbers, generics signatures — how [[type-erasure|erasure]] coexists with reflection). Frames are fixed-size at compile time; there is no runtime stack "growth" per method.',
      },
      {
        kind: 'paragraph',
        text: '**Dispatch**: `invokestatic` and `invokespecial` (constructors, private, `super.`) bind at link time; `invokevirtual` dispatches through the receiver\'s vtable; `invokeinterface` searches itables. `invokedynamic` defers the decision to a **bootstrap method** at first execution — the hook that lets [[lambdas]] be allocated lazily by `LambdaMetafactory`, and lets string concatenation pick optimal strategies at runtime (JEP 280), all invisible at the source level.',
      },
      {
        kind: 'code',
        title: 'Sugar exposed',
        code: 'String s = "n=" + n;          // javap: invokedynamic makeConcatWithConstants\nInteger x = 5;                 // javap: invokestatic Integer.valueOf\nfor (String w : list) {...}    // javap: Iterator.hasNext/next loop\nswitch (color) { case "RED"... // javap: hashCode switch + equals confirm',
      },
      {
        kind: 'note',
        title: 'Why care?',
        text: 'Three practical reasons (Optimizing Java ch. 9): performance analysis needs to know what the source became before the JIT sees it; some interview-grade puzzles (boxing identity, string concat in loops) are bytecode-obvious; and instrumentation tools (ASM, ByteBuddy — behind mocking and APM agents) operate at exactly this level.',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 9 — Code Execution on the JVM' },
      { book: 'ocnj', chapter: 'Ch. 6 — Code Execution on the JVM' },
      { book: 'core-java-1', chapter: 'Ch. 11.6 — Bytecode Engineering' },
    ],
    related: ['jit-compilation', 'jvm-architecture', 'lambdas', 'class-loading'],
  },

  {
    id: 'memory-layout',
    domainId: 'jvm',
    title: 'Memory Layout: Heap, Stack & Object Anatomy',
    summary:
      'Objects live on the heap with a 12–16-byte header each; references and primitives live in stack frames. Compressed oops keep references at 4 bytes under 32 GB heaps. Object size and layout drive both memory footprint and cache behavior.',
    keyPoints: [
      'Object = header (mark word + class pointer) + fields (padded to 8-byte alignment)',
      'Compressed oops: 4-byte references below ~32 GB heap — crossing that threshold *costs* memory',
      'An `Integer` weighs ~16 bytes vs 4 for an `int`; `int[]` vs `Integer[]` is night and day',
      'Escape analysis lets the JIT stack-allocate or scalarize objects that don\'t escape',
      'The heap is generational: young (eden + survivors) and old — allocation happens in TLABs',
      'Native memory (direct buffers, metaspace, thread stacks) is invisible to heap dashboards',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'What an object weighs (64-bit, compressed oops)',
        code: 'class Point { int x; int y; }   // 12-byte header + 4 + 4 = 20 → padded to 24 bytes\n\nnew Point[1_000_000]             // 4 MB of refs + 24 MB of Points — scattered on the heap\nint[] xs; int[] ys;              // SoA layout: 8 MB total, contiguous, cache-streamable\n\n// java.lang.Integer: 12-byte header + 4-byte int = 16 bytes → 4× an int, plus indirection',
      },
      {
        kind: 'paragraph',
        text: 'The **mark word** multiplexes identity hash, lock state, and GC age bits — why `System.identityHashCode`, `synchronized`, and object aging all touch the same header. The class pointer feeds `getClass()` and virtual dispatch. Arrays add a 4-byte length. Use JOL (`jol-core`) to print real layouts — field ordering is JVM-chosen (it packs and reorders to minimize padding).',
      },
      {
        kind: 'paragraph',
        text: '**Allocation is nearly free**: each thread bump-allocates in its private TLAB (thread-local allocation buffer) — pointer increment, ~10 instructions, no lock. This plus generational GC ([[gc-fundamentals]]) is why "avoid allocating" is *not* a default rule in Java, only a hot-path rule ([[language-performance]]). Large objects (typically big arrays) may go straight to the old generation or special regions (G1 "humongous").',
      },
      {
        kind: 'pitfall',
        title: 'Pointer-chasing data structures vs the cache',
        text: 'A million small objects referenced from an array means a potential cache miss per element ([[hardware-memory]]). High-performance Java flattens: primitive arrays, structure-of-arrays, or off-heap layouts ([[ffm-api]]). Project Valhalla\'s value classes aim to give this flattening to ordinary code ([[future-directions]]).',
      },
      {
        kind: 'note',
        title: 'Stack vs heap, precisely',
        text: 'Stacks hold frames: primitives and *references* — never objects. "Java objects on the stack" happens only as a JIT optimization (escape analysis → scalar replacement), invisible to semantics. Deep recursion exhausts a thread\'s stack (default ~512 KB–1 MB, `-Xss`), throwing `StackOverflowError`.',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 6 — Understanding Garbage Collection (HotSpot internals)' },
      { book: 'ocnj', chapter: 'Ch. 4 — Understanding Garbage Collection' },
      { book: 'java-secrets', chapter: 'Memory management chapters' },
    ],
    related: ['gc-fundamentals', 'hardware-memory', 'language-performance', 'ffm-api'],
  },

  {
    id: 'gc-fundamentals',
    domainId: 'jvm',
    title: 'GC Fundamentals',
    summary:
      'GC finds live objects by tracing from roots (stacks, statics) — everything unreached is garbage by definition. The weak generational hypothesis ("most objects die young") makes collection cheap: young collections touch only survivors.',
    keyPoints: [
      'Reachability, not reference counting: cycles are collected for free',
      'Weak generational hypothesis: most objects die young; survivors get promoted via survivor spaces',
      'Young GC cost ∝ **live** objects, not allocated — dead objects cost literally nothing to collect',
      'Stop-the-world pauses at safepoints; modern collectors shrink STW to milliseconds',
      'Card tables / remembered sets track old→young pointers so young GC needn\'t scan the old gen',
      '`OutOfMemoryError` usually means a leak: reachable-but-unused objects GC *cannot* touch',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The mental model (Optimizing Java ch. 6): GC = **mark** (trace the object graph from GC roots — thread stacks, static fields, JNI handles) + **reclaim** (sweep the dead in place, compact the live together, or evacuate live objects to a fresh region). Stop-the-world means application threads pause at *safepoints* so the heap graph holds still; "concurrent" collectors do most marking while the app runs, at the price of extra bookkeeping (barriers).',
      },
      {
        kind: 'table',
        caption: 'GC vocabulary (Optimizing Java\'s glossary)',
        headers: ['Term', 'Meaning'],
        rows: [
          ['Stop-the-world (STW)', 'application threads paused during collection work'],
          ['Parallel', 'multiple GC threads do the work'],
          ['Concurrent', 'GC works *while* application threads run — expensive, never total'],
          ['Moving / evacuating', 'live objects relocate; addresses aren\'t stable'],
          ['Compacting', 'survivors end up contiguous — no fragmentation'],
          ['Exact', 'the JVM always knows pointer vs int — enables safe moving'],
        ],
      },
      {
        kind: 'code',
        title: 'The generational lifecycle',
        code: 'allocation → Eden (TLAB bump-pointer)\nEden fills → YOUNG GC: live objects → Survivor S0/S1 (age++)\nage > threshold (~6–15) → promotion to Old generation\nOld fills → OLD/FULL GC (the expensive one — avoid needing it often)',
      },
      {
        kind: 'paragraph',
        text: 'Because young-collection cost tracks live data only, **high allocation rates of short-lived objects are cheap** — the design center of idiomatic Java. What hurts: *premature promotion* (allocation spikes push still-live objects to old before they die → old gen fills with garbage → full GCs), and *leaks* (a static map that only grows keeps everything reachable). Measure allocation rate and promotion rate before touching flags ([[gc-tuning-logging]]).',
      },
      {
        kind: 'pitfall',
        title: 'System.gc() and finalizers',
        text: '`System.gc()` requests (and with default collectors triggers) a **full STW collection** — production code calling it causes pause storms; disable with `-XX:+DisableExplicitGC` if a library misbehaves. Finalizers delay reclamation by at least one extra cycle and can resurrect objects; they are deprecated — [[catching-cleanup|try-with-resources]] and `Cleaner` replaced them (EJ 8).',
      },
      {
        kind: 'note',
        title: 'Reference strength',
        text: '`SoftReference` (cleared under memory pressure — crude caches), `WeakReference` (cleared at next GC once weakly reachable — `WeakHashMap`, canonicalization), `PhantomReference` + queue (post-mortem cleanup, the machinery under `Cleaner`). Each adds GC work; use sparingly.',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 6 — Understanding Garbage Collection' },
      { book: 'ocnj', chapter: 'Ch. 4 — Understanding Garbage Collection' },
      { book: 'core-java-1', chapter: 'Ch. 4 — Objects and Classes (object lifecycle)' },
    ],
    related: ['gc-algorithms', 'memory-layout', 'gc-tuning-logging', 'immutability-class-design'],
  },

  {
    id: 'gc-algorithms',
    domainId: 'jvm',
    title: 'GC Algorithms: Parallel, G1, ZGC, Shenandoah',
    summary:
      'HotSpot ships a portfolio: Parallel (max throughput, big pauses), G1 (balanced, region-based, the default), ZGC and Shenandoah (concurrent, sub-millisecond pauses at slight throughput cost), and Epsilon (no-op, for testing). Choose by pause-time requirements.',
    keyPoints: [
      'G1 (default): heap as ~2048 regions; collects the *garbage-first* regions within a pause target (`-XX:MaxGCPauseMillis`, default 200 ms)',
      'Parallel: STW everything with all cores — best raw throughput for batch jobs',
      'ZGC: colored pointers + load barriers → pauses <1 ms regardless of heap size; generational since JDK 21',
      'Shenandoah: brooks-pointer-descended concurrent compaction, similar goals to ZGC',
      'Humongous objects (>50% region) stress G1 — watch for them in logs',
      'Serial for tiny containers; Epsilon allocates-only (benchmark baseline)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Choosing a collector',
        headers: ['Collector', 'Flag', 'Pause profile', 'Best for'],
        rows: [
          ['G1 (default)', '`-XX:+UseG1GC`', '~10–200 ms, tunable target', 'general services, balanced'],
          ['Parallel', '`-XX:+UseParallelGC`', 'long STW, all-core', 'batch/ETL: throughput over latency'],
          ['ZGC', '`-XX:+UseZGC` (+generational, 21+)', '<1 ms, heap-size independent', 'latency-critical, large heaps'],
          ['Shenandoah', '`-XX:+UseShenandoahGC`', '~1 ms', 'latency-critical (Red Hat lineage)'],
          ['Serial', '`-XX:+UseSerialGC`', 'long, single-core', '<~256 MB heaps, tiny containers'],
          ['Epsilon', '`-XX:+UseEpsilonGC`', 'none — OOMs when full', 'benchmarks, allocation testing'],
        ],
      },
      {
        kind: 'paragraph',
        text: '**G1\'s design**: dividing the heap into regions decouples "young/old" from contiguous address ranges; the collector tracks per-region liveness and evacuates the *emptiest* (garbage-first) regions — reclaiming the most space for the least copying — within the pause budget. Remembered sets (per-region incoming-pointer indexes) make regional collection possible without whole-heap scans; concurrent marking keeps liveness data fresh. Mixed collections gradually chew through old-gen garbage; the dreaded fallback **full GC** (single-threaded until JDK 10, parallel since) signals the steady state failed — usually allocation outrunning marking.',
      },
      {
        kind: 'paragraph',
        text: '**ZGC\'s trick**: metadata bits *inside* the 64-bit pointer (colored pointers) plus a **load barrier** on every reference read let it mark and even *relocate* objects concurrently — a thread touching a moving object gets healed on the fly. Result: max pause under a millisecond on multi-terabyte heaps, in exchange for a few percent throughput and some memory overhead. Generational ZGC (JDK 21) recovered most of the young-collection efficiency it originally gave up.',
      },
      {
        kind: 'pitfall',
        title: 'Tuning by folklore',
        text: 'Flag recipes copied from 2010-era blogs (`-XX:SurvivorRatio=…`, CMS incantations — CMS was removed in JDK 14) actively harm modern collectors. The books\' unanimous advice: pick the right collector, set heap size and (for G1) a realistic pause target, and stop — let the ergonomics work. Every further flag needs a [[gc-tuning-logging|GC-log-backed]] hypothesis.',
      },
      {
        kind: 'note',
        title: 'Container reality',
        text: 'The JVM sizes its default heap (¼ of RAM) and GC thread counts from the **container\'s** limits (since 8u191/JDK 10). In Kubernetes, set `-XX:MaxRAMPercentage` and remember non-heap memory (metaspace, direct buffers, stacks) shares the same cgroup limit — the OOM-killer doesn\'t read heap dashboards ([[cloud-native-java]]).',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 7 — Advanced Garbage Collection' },
      { book: 'ocnj', chapter: 'Ch. 5 — Advanced Garbage Collection' },
      { book: 'java-secrets', chapter: 'GC and scalability chapters' },
    ],
    related: ['gc-fundamentals', 'gc-tuning-logging', 'cloud-native-java', 'memory-layout'],
  },

  {
    id: 'jit-compilation',
    domainId: 'jvm',
    title: 'JIT Compilation',
    summary:
      'HotSpot interprets first, then tiers up: C1 compiles quickly with light optimization, C2 recompiles the hottest methods aggressively using profile data — inlining, devirtualizing, escape-analyzing, and deoptimizing when its speculations break.',
    keyPoints: [
      'Tiered: interpreter → C1 (profiled) → C2 at ~10k invocations; loops trigger on-stack replacement',
      '**Inlining is the gateway optimization** — it unlocks everything else',
      'Speculation + deoptimization: monomorphic call sites devirtualize; a new receiver type deopts back',
      'Escape analysis: non-escaping objects become stack scalars — allocation eliminated',
      'Warm-up is real: benchmark and load-test only after the JIT settles ([[microbenchmarking]])',
      'Code cache full = compilation silently stops — monitor it',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Why late compilation wins (Optimizing Java ch. 10): by the time C2 compiles a method it has thousands of profile samples — which branch is 99% taken, which `instanceof` always passes, that a virtual call always lands in one implementation. It compiles the *observed* program, guards the assumptions cheaply, and **deoptimizes** (falls back to the interpreter, recompiles) if reality changes. Static compilers must be correct for all inputs; the JIT only for the ones that happen, and it gets to change its mind.',
      },
      {
        kind: 'code',
        title: 'Watching the JIT work',
        code: '$ java -XX:+PrintCompilation App | grep MyService\n  312   45   3   com.acme.MyService::price (86 bytes)        // tier 3 (C1+profile)\n  899  102   4   com.acme.MyService::price (86 bytes)        // tier 4 (C2)\n  903   45   3   com.acme.MyService::price (86 bytes) made not entrant  // replaced\n// deeper: -XX:+UnlockDiagnosticVMOptions -XX:+PrintInlining, or JITWatch on -XX:+LogCompilation',
      },
      {
        kind: 'paragraph',
        text: '**Inlining** replaces a call with the callee\'s body — killing call overhead and, critically, letting optimizations see across method boundaries: constants propagate, allocations become scalars ([[memory-layout|escape analysis]]), locks on non-escaping objects vanish (lock elision), bounds checks hoist out of loops, and loops vectorize. Small methods inline best (`-XX:MaxInlineSize` ~35 bytecodes, hot methods up to `FreqInlineSize` ~325) — one more reason the "many small methods" style is *fast*, not slow, on the JVM.',
      },
      {
        kind: 'pitfall',
        title: 'Profile pollution and megamorphic calls',
        text: 'A call site that sees one receiver type compiles to a direct (even inlined) call; two types get an inline cache; **three or more go megamorphic** — a real vtable dispatch, and no inlining behind it. Hot abstract pipelines with many implementations pay this. Similarly, warming code with atypical data teaches the JIT the wrong program; it deopts under real traffic ([[performance-methodology]]).',
      },
      {
        kind: 'note',
        title: 'The AOT counterpoint',
        text: 'GraalVM native-image compiles ahead-of-time: instant startup, small footprint, no warm-up — but no profile-guided speculation, closed-world reflection config, and typically lower peak throughput. The cloud-native trade-off in one line: CRaC/Leyden aim to keep JIT peaks *and* fix startup ([[cloud-native-java]], [[future-directions]]).',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 9–10 — Code Execution; Understanding JIT Compilation' },
      { book: 'ocnj', chapter: 'Ch. 6 — Code Execution on the JVM' },
    ],
    related: ['bytecode-execution', 'microbenchmarking', 'language-performance', 'memory-layout'],
  },

  {
    id: 'hardware-memory',
    domainId: 'jvm',
    title: 'Hardware & the Memory Hierarchy',
    summary:
      'A cache miss to main memory costs ~100 ns — time for hundreds of instructions. Caches, prefetching, and out-of-order execution mean *memory access patterns*, not instruction counts, dominate modern performance. Java\'s abstractions sit directly on this reality.',
    keyPoints: [
      'Latency ladder: L1 ~1 ns → L2 ~4 ns → L3 ~15 ns → RAM ~100 ns → SSD ~100 µs → network ~ms',
      'Cache lines are 64 bytes: sequential access is nearly free (prefetch); pointer-chasing is a miss per hop',
      'Store buffers and out-of-order execution are *why* the [[java-memory-model]] exists',
      'False sharing: two threads writing different fields on one cache line ping-pong it between cores',
      'TLB, NUMA, branch prediction — each occasionally surfaces in Java performance work',
      'Mechanical sympathy: arrays beat linked structures for traversal, always',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Every programmer\'s latency numbers (Optimizing Java ch. 3)',
        headers: ['Operation', 'Cost', 'Scaled (1 cycle = 1 s)'],
        rows: [
          ['L1 cache hit', '~1 ns', 'seconds'],
          ['L3 cache hit', '~15 ns', '~1 minute'],
          ['Main memory', '~100 ns', '~6 minutes'],
          ['NVMe read', '~100 µs', '~3 days'],
          ['Datacenter round trip', '~500 µs', '~2 weeks'],
          ['Disk seek (HDD)', '~10 ms', '~1 year'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The CPU-DRAM gap grew for decades; hardware papered over it with cache hierarchies, prefetchers, speculative and out-of-order execution, and per-core store buffers. Those buffers mean **a write is not globally visible when the instruction retires** — cores can disagree about memory order. Memory fences (which `volatile` and locks emit) drain them. The JMM is the language-level treaty over exactly this machinery.',
      },
      {
        kind: 'code',
        title: 'Cache effects you can measure',
        code: '// Row-major vs column-major traversal of int[4096][4096]:\nfor (i...) for (j...) sum += a[i][j];   // sequential: prefetcher streams it\nfor (j...) for (i...) sum += a[i][j];   // strided: cache miss per access — 5–10× slower\n\n// False sharing: pad or @jdk.internal.vm.annotation.Contended\nclass Counters { volatile long a; /* 56 bytes padding */ volatile long b; }',
      },
      {
        kind: 'paragraph',
        text: '**False sharing** is the classic multicore surprise: independent counters on one 64-byte line serialize both writers through cache-coherency traffic (MESI). `LongAdder` and JDK internals pad with `@Contended`; your hot per-thread structs may need manual padding. Diagnosis: perf counters (`perf stat`, JFR\'s cache-miss events) — never guesswork ([[profiling]]).',
      },
      {
        kind: 'note',
        title: 'What this means for Java style',
        text: 'Prefer arrays and array-backed collections for hot traversals ([[lists]]); keep hot objects small ([[memory-layout]]); batch work to stay in cache; and distrust microbenchmarks that fit in L1 while production data lives in RAM ([[microbenchmarking]]). "Mechanical sympathy" — Gough & Evans borrow Jackie Stewart\'s term — is the difference between algorithmic and *actual* performance.',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 3 — Hardware and Operating Systems' },
      { book: 'ocnj', chapter: 'Ch. 7 — Hardware and Operating Systems' },
    ],
    related: ['java-memory-model', 'memory-layout', 'concurrent-performance', 'lists'],
  },
]
