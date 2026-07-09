import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'jvm-architecture',
    domainId: 'jvm',
    title: 'JVM Architecture',
    summary:
      'The JVM is a managed runtime: it loads bytecode through class loaders, interprets it, profiles it, JIT-compiles the hot parts to machine code, and manages memory with garbage collection — trading a warm-up phase for adaptive, profile-guided speed.',
    keyPoints: [
      {
        text: 'Pipeline: class loading → bytecode verification → interpretation → profiling → JIT compilation',
        detail: 'Each stage trades startup speed for eventual peak speed: the interpreter runs almost immediately with no compile pause, while profiling data accumulates in the background so the JIT can later compile only the methods that actually matter, with real information about what they do.',
      },
      {
        text: 'Major subsystems: class loader, runtime data areas (heap, stacks, metaspace), execution engine (interpreter + JIT), GC',
        detail: 'These four pieces map directly onto the four questions a runtime has to answer: where does code come from (class loader), where does data live (runtime data areas), how does code actually run (execution engine), and who reclaims memory nobody references anymore (GC).',
      },
      {
        text: 'HotSpot optimizes the common path based on **observed runtime behavior** — often beating static compilation',
        detail: 'A static compiler must generate code that is correct for every possible input; HotSpot only has to be fast for the inputs that actually show up in this run, and it can always fall back to the interpreter (deoptimize) if its assumption turns out wrong — a static binary has no such escape hatch.',
      },
      {
        text: 'Java\'s two value kinds: primitives and object references — no raw pointers',
        detail: 'Because a "reference" is never exposed as a raw memory address, the GC is free to move objects around during compaction and simply update the references that point at them — something impossible in languages where a pointer is just an address the program can do arithmetic on.',
      },
      {
        text: '`java -XX:+PrintFlagsFinal` reveals the ~700 tunables; most should stay untouched',
        detail: 'HotSpot\'s default ergonomics already pick sensible values for most of these flags based on the detected hardware and heap size; hand-tuning them without a measured, GC-log-backed reason to (see gc-tuning-logging) usually trades a real, well-tested default for a worse, untested guess.',
      },
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
        detail: 'The distinction that actually matters day to day is HotSpot vs GraalVM native-image, not which vendor built the binary: same-source distributions (Temurin, Corretto, Zulu, Oracle) are interchangeable at the bytecode level and differ only in support/patch cadence, while GraalVM native-image is a genuinely different execution model (ahead-of-time compiled, no interpreter or profile-guided JIT at all).',
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
      {
        text: 'Phases: load bytes → verify → prepare (defaults) → resolve (lazy) → initialize (static init runs)',
        detail: 'Prepare and initialize are easy to conflate but are distinct: prepare allocates storage for static fields and sets them to their type\'s zero value (0, null, false), while initialize is the later step that actually runs `static { ... }` blocks and static field initializer expressions — which is why a class can be "loaded" long before its static initializers ever execute.',
      },
      {
        text: 'Parent delegation: a loader asks its parent first — core classes can\'t be spoofed',
        detail: 'Without delegation, application code could define its own `java.lang.String` and have it silently shadow the real one wherever the classpath order happened to favor it; delegating upward first means the bootstrap loader always wins the race for core classes, no matter what an application or plugin loader tries to define.',
      },
      {
        text: 'A class\'s identity is (class loader, binary name) — same bytes in two loaders = two different classes',
        detail: 'This is not a metaphor — the JVM literally treats `com.acme.Foo` loaded by loader A and `com.acme.Foo` loaded by loader B as two unrelated types with no assignment compatibility between them, which is exactly the mechanism application servers and plugin systems rely on for per-deployment isolation.',
      },
      {
        text: 'Static initializers run **once**, under the JVM\'s own lock — the holder idiom exploits this',
        detail: 'The holder idiom puts the expensive singleton in a private static nested class that is not loaded until something references it; the JVM\'s own per-class initialization lock then gives you thread-safe, exactly-once, lazy construction for free, with none of the double-checked-locking boilerplate that pattern historically needed.',
      },
      {
        text: '`ClassNotFoundException` (asked by name, absent) vs `NoClassDefFoundError` (present at compile, missing/failed at run)',
        detail: 'ClassNotFoundException is a checked exception from reflective lookups (`Class.forName`) when the name simply cannot be found anywhere on the loader\'s search path; NoClassDefFoundError is an Error thrown when code that compiled fine now can\'t find (or previously failed to initialize) a class it statically depends on — a classpath drift or a poisoned static initializer, not a typo.',
      },
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
        detail: 'The JVM marks the class permanently erroneous the moment its static initializer throws once, so it never even tries to re-run it — every subsequent caller, potentially minutes or threads apart, gets a generic NoClassDefFoundError with no reference back to the original exception, which is why grepping logs for the first occurrence (usually ExceptionInInitializerError) rather than the most recent one is the actual fix.',
      },
      {
        kind: 'note',
        title: 'Modules and loaders',
        text: 'Since Java 9 the platform is modularized: the *platform* loader replaced the extension loader, and [[modules-jpms|JPMS]] readability rules apply before class loading resolves anything. AppCDS and Project Leyden lean on class-loading determinism to cut startup time ([[cloud-native-java]]).',
        detail: 'AppCDS works because class loading is so deterministic: it pre-parses and pre-verifies a fixed set of classes into a shared archive at build or first-run time, so later JVM startups can memory-map that archive instead of re-parsing and re-verifying the same bytecode from scratch — a meaningful chunk of cold-start time on short-lived services.',
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
      {
        text: 'Stack machine: operands push/pop on the operand stack; locals live in numbered slots',
        detail: 'There are no named variables at the bytecode level — the compiler assigns each local (and each method parameter, `this` included) a numbered slot in a fixed-size array, and every operation reads its inputs from and writes its result back onto the operand stack, which is why disassembled code reads like a sequence of pushes and pops rather than expressions.',
      },
      {
        text: 'Opcode families: loads/stores (`aload_0`), arithmetic (`iadd`), control (`ifeq`, `goto`), invocation, allocation',
        detail: 'Opcodes are also type-specialized (`iadd` for int, `ladd` for long, `dadd` for double, and so on) rather than generic, which is part of why the bytecode format is compact and why the verifier can check type correctness instruction-by-instruction without any runtime type inspection.',
      },
      {
        text: 'Five invokes: `invokevirtual`, `invokeinterface`, `invokespecial`, `invokestatic`, `invokedynamic`',
        detail: 'The first four map directly to Java\'s own dispatch rules — virtual for ordinary instance methods, interface for interface method calls, special for constructors/private/super calls that must not be overridden, static for methods with no receiver — while invokedynamic is the odd one out: it defers the actual dispatch decision to runtime-generated logic instead of baking it into the class file.',
      },
      {
        text: '`invokedynamic` (indy) powers lambdas, string concat, records\' generated methods',
        detail: 'Before invokedynamic, every new language feature that needed dynamic behavior (lambdas, dynamic string concatenation strategies) would have required generating a synthetic class per call site at compile time; indy instead defers to a bootstrap method the first time a call site executes, letting the runtime generate and cache exactly the code needed for that one call site.',
      },
      {
        text: 'The verifier proves type safety before execution — malformed bytecode never runs',
        detail: 'The verifier walks every method\'s bytecode before it ever runs and proves, independent of any actual input, that the operand stack and local slots are always used with consistent types and that control flow never jumps into the middle of an instruction — the safety net that lets the JVM trust bytecode from anywhere, including a network, without a sandboxing layer around every instruction.',
      },
      {
        text: 'String `switch`, boxing, string concat: all sugar — `javap` shows the truth',
        detail: 'None of these exist as their own opcodes: a `switch` on a `String` compiles down to a `hashCode`-based switch followed by an `equals` check to rule out collisions, autoboxing compiles to explicit `valueOf`/`intValue`-style calls, and `+` on strings compiles to either `StringBuilder` calls or (since JEP 280) an `invokedynamic` call — `javap -c` is the only way to know which, for any given JDK version.',
      },
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
        detail: 'Mocking frameworks and APM agents cannot recompile your source, so instead they load the class file, use ASM or ByteBuddy to splice in new bytecode (a proxy method, a timing probe) at exactly this instruction level, and hand the JVM a modified class — which is also why some bytecode-manipulation bugs only surface as bizarre VerifyError messages rather than ordinary exceptions.',
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
      {
        text: 'Object = header (mark word + class pointer) + fields (padded to 8-byte alignment)',
        detail: 'The header is fixed overhead every single object pays regardless of how small its actual data is — a `Point` with two ints is mostly header. Alignment padding exists because the JVM (and the underlying hardware) reads memory more efficiently at 8-byte boundaries, so a few wasted bytes per object is traded for faster access to all of them.',
      },
      {
        text: 'Compressed oops: 4-byte references below ~32 GB heap — crossing that threshold *costs* memory',
        detail: 'Compressed oops store references as a 32-bit offset from a base address instead of a full 64-bit pointer, which works as long as the whole heap fits within the range that offset can address — roughly 32 GB. Grow the heap past that line and every reference in the JVM silently doubles in size, which can mean a heap bump actually *increases* effective memory pressure from reference overhead alone.',
      },
      {
        text: 'An `Integer` weighs ~16 bytes vs 4 for an `int`; `int[]` vs `Integer[]` is night and day',
        detail: 'A boxed `Integer` pays the full object tax — header plus the 4-byte value, padded — for what a primitive stores in 4 bytes with zero overhead, and an `Integer[]` is an array of pointers to separately-allocated boxes scattered across the heap, not contiguous data. An `int[]` of the same logical values is one contiguous block a fraction of the size, with none of the pointer-chasing.',
      },
      {
        text: 'Escape analysis lets the JIT stack-allocate or scalarize objects that don\'t escape',
        detail: 'If the JIT can prove an object never leaves the method that created it — no reference stored in a field, returned, or passed to an unanalyzable call — it does not need real heap identity at all. The JIT can replace the object with its individual fields as plain local variables (scalar replacement), which removes the allocation, the header overhead, and any GC cost for that object entirely.',
      },
      {
        text: 'The heap is generational: young (eden + survivors) and old — allocation happens in TLABs',
        detail: 'This generational split exists because most objects die almost immediately (the weak generational hypothesis) — collecting the young generation is cheap precisely because it is small and mostly garbage by the time it fills. TLABs (thread-local allocation buffers) let each thread bump-allocate in its own private slice of eden without any cross-thread synchronization, which is what makes ordinary allocation nearly as cheap as a pointer increment.',
      },
      {
        text: 'Native memory (direct buffers, metaspace, thread stacks) is invisible to heap dashboards',
        detail: 'Heap-focused monitoring only sees the generational heap by design — but direct `ByteBuffer`s, class metadata (metaspace), and every thread\'s stack all consume process memory outside it. A container can hit its memory limit and get OOM-killed by the OS while every heap dashboard shows plenty of headroom, because none of that native memory ever shows up there.',
      },
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
        detail: 'Each object in the array is a separate heap allocation that could be anywhere, so walking the array means chasing a pointer to a effectively random address for every element — the opposite of the sequential access pattern the cache is built to prefetch. Flattened, primitive-array layouts turn that into one contiguous scan the hardware handles efficiently by default.',
      },
      {
        kind: 'note',
        title: 'Stack vs heap, precisely',
        text: 'Stacks hold frames: primitives and *references* — never objects. "Java objects on the stack" happens only as a JIT optimization (escape analysis → scalar replacement), invisible to semantics. Deep recursion exhausts a thread\'s stack (default ~512 KB–1 MB, `-Xss`), throwing `StackOverflowError`.',
        detail: 'This is a common point of confusion for people who\'ve heard "small objects live on the stack in some languages" — in Java that never happens at the language-semantics level, only as an invisible JIT optimization that a developer cannot rely on or control. The mental model that matters for correctness is simple: objects are always heap data, stacks only ever hold primitives and references to that heap data.',
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
      {
        text: 'Reachability, not reference counting: cycles are collected for free',
        detail: 'A reference-counting collector (like Python\'s or Swift\'s ARC) has to specifically detect and break cycles, because two objects only pointing at each other never hit a zero count on their own. A tracing collector sidesteps the whole problem: it starts from roots and marks whatever it can actually reach, so a cyclic pair with no path from a root is simply never marked, no special cycle detection required.',
      },
      {
        text: 'Weak generational hypothesis: most objects die young; survivors get promoted via survivor spaces',
        detail: 'This hypothesis is the entire justification for splitting the heap into generations at all — if it were false (most objects lived a long time), collecting young-only would barely reclaim anything and the design would not pay off. Empirically it holds strongly enough across most workloads that young-generation collection can afford to be frequent and cheap, while old-generation collection stays rare.',
      },
      {
        text: 'Young GC cost ∝ **live** objects, not allocated — dead objects cost literally nothing to collect',
        detail: 'A copying/evacuating young collector only does work for objects it has to move to a survivor space — dead objects are simply left behind when eden is reset, with no per-object "freeing" step at all. This is the opposite of what intuition suggests: a young GC pass over a mostly-garbage eden is *fast* specifically because almost nothing survives to be copied.',
      },
      {
        text: 'Stop-the-world pauses at safepoints; modern collectors shrink STW to milliseconds',
        detail: 'A safepoint is a point in generated code where every thread\'s state is in a form the GC can safely inspect — the JVM cannot pause threads at arbitrary instructions, it has to wait for each one to reach such a point. Reducing STW time over the collectors\' history has meant moving more and more of the actual marking/copying work to run concurrently with application threads, leaving less that strictly requires a full pause.',
      },
      {
        text: 'Card tables / remembered sets track old→young pointers so young GC needn\'t scan the old gen',
        detail: 'A young collection needs to know every reference pointing *into* the young generation, including ones from old-generation objects — without a shortcut, that would mean scanning the entire (much larger) old generation on every young GC, defeating the point of collecting young generations cheaply. A card table instead marks which small memory regions were recently written to, so young GC only has to re-scan those flagged regions for old→young pointers.',
      },
      {
        text: '`OutOfMemoryError` usually means a leak: reachable-but-unused objects GC *cannot* touch',
        detail: 'GC only ever reclaims *unreachable* objects — it has no concept of "unused," only "unreferenced." An ever-growing cache, a listener list that never unregisters, or a static collection that only gets appended to are all perfectly reachable from a GC root, so the collector is working exactly as designed right up until the heap is full of objects nobody actually needs anymore.',
      },
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
        detail: 'A "resurrected" object is one whose `finalize()` method stores `this` somewhere reachable again, making an object the collector had already decided was garbage reachable once more — which forces the JVM to re-verify reachability before actually reclaiming it, adding real overhead and unpredictability to a mechanism that was already unreliable about *when* it runs at all.',
      },
      {
        kind: 'note',
        title: 'Reference strength',
        text: '`SoftReference` (cleared under memory pressure — crude caches), `WeakReference` (cleared at next GC once weakly reachable — `WeakHashMap`, canonicalization), `PhantomReference` + queue (post-mortem cleanup, the machinery under `Cleaner`). Each adds GC work; use sparingly.',
        detail: 'The three types trade off exactly how aggressively the referent can be reclaimed: soft references hang on until the JVM is genuinely short on memory (useful for a cache that should shrink under pressure but not disappear casually), weak references let go at the very next GC cycle once nothing else holds the object, and phantom references are never usable to access the object at all — they only exist to be enqueued as a notification after it\'s already gone, which is exactly the primitive `Cleaner` needs for reliable post-mortem cleanup.',
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
      {
        text: 'G1 (default): heap as ~2048 regions; collects the *garbage-first* regions within a pause target (`-XX:MaxGCPauseMillis`, default 200 ms)',
        detail: 'Splitting the heap into many small regions instead of one contiguous young/old space is what lets G1 be selective — it can evacuate just the regions with the most garbage per unit of work, and stop once it has done enough regions to likely hit the pause target, rather than being forced to process one giant contiguous generation in full every time.',
      },
      {
        text: 'Parallel: STW everything with all cores — best raw throughput for batch jobs',
        detail: 'Parallel makes the opposite tradeoff from G1/ZGC/Shenandoah on purpose: it stops every application thread and throws every CPU core at collection as fast as possible, accepting a longer pause in exchange for spending the least total CPU time on GC overall. For a batch job with no user waiting on individual request latency, that is exactly the right trade.',
      },
      {
        text: 'ZGC: colored pointers + load barriers → pauses <1 ms regardless of heap size; generational since JDK 21',
        detail: 'Because ZGC can mark and relocate objects concurrently with the application, its pause time is decoupled from heap size — a 10 GB heap and a 10 TB heap both see sub-millisecond pauses, since the actual bulk of the work happens while the app keeps running. "Generational since JDK 21" matters because the original single-generation ZGC treated all objects equally, missing the young-generation efficiency win that made G1 competitive on throughput.',
      },
      {
        text: 'Shenandoah: brooks-pointer-descended concurrent compaction, similar goals to ZGC',
        detail: 'A Brooks pointer is an extra indirection word stored with every object, letting the collector relocate the object and update just that one pointer while readers transparently follow it to the new location — a different concurrent-compaction mechanism than ZGC\'s colored pointers, but aimed at the same result: compacting the heap without a long stop-the-world pause.',
      },
      {
        text: 'Humongous objects (>50% region) stress G1 — watch for them in logs',
        detail: 'G1 allocates any object larger than half a region directly into one or more contiguous "humongous" regions, bypassing the normal young-generation path entirely — a workload that allocates many large arrays can fragment the region space and trigger more frequent, more expensive collections than the same total allocation spread across normal-sized objects would.',
      },
      {
        text: 'Serial for tiny containers; Epsilon allocates-only (benchmark baseline)',
        detail: 'Serial\'s single-threaded simplicity is actually an advantage on a heap small enough (and a container constrained enough) that coordinating multiple GC threads would cost more than it saves. Epsilon does no collection at all — it exists purely to answer "how much of my measured overhead is GC," by removing GC from the equation entirely and letting the app OOM once it exhausts the heap.',
      },
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
        detail: 'Old tuning advice was written for old collectors with different internal heuristics — a flag that made sense for CMS\'s specific failure modes can actively fight G1\'s or ZGC\'s very different internal ergonomics, sometimes making the exact problem it was meant to fix worse. The collectors\' own auto-tuning has improved enough that most manual flags are solving problems that no longer exist, or solving them worse than the default would have.',
      },
      {
        kind: 'note',
        title: 'Container reality',
        text: 'The JVM sizes its default heap (¼ of RAM) and GC thread counts from the **container\'s** limits (since 8u191/JDK 10). In Kubernetes, set `-XX:MaxRAMPercentage` and remember non-heap memory (metaspace, direct buffers, stacks) shares the same cgroup limit — the OOM-killer doesn\'t read heap dashboards ([[cloud-native-java]]).',
        detail: 'Before JDK 10 the JVM read the host machine\'s total memory even when running in a cgroup-limited container, routinely sizing its default heap far larger than the container\'s actual memory budget — the classic symptom was a JVM that looked fine by its own metrics right up until the kernel OOM-killer terminated the whole process for exceeding a limit the JVM never knew existed.',
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
      {
        text: 'Tiered: interpreter → C1 (profiled) → C2 at ~10k invocations; loops trigger on-stack replacement',
        detail: 'Jumping straight to C2\'s expensive, aggressive optimization would make startup slow for no benefit on code that only runs a handful of times — tiering lets C1 get *reasonably* fast code out quickly while gathering the profile data C2 needs to specialize. On-stack replacement is what lets a long-running loop get promoted to compiled code mid-execution, instead of only ever compiling at the next method call.',
      },
      {
        text: '**Inlining is the gateway optimization** — it unlocks everything else',
        detail: 'Most other JIT optimizations only see as far as one method body — replacing a call with the callee\'s actual code merges two method bodies into one optimization scope, which is what lets the compiler propagate constants, eliminate allocations, and hoist checks *across* what used to be a call boundary. Without inlining, those optimizations simply have nothing to work with beyond a single small method.',
      },
      {
        text: 'Speculation + deoptimization: monomorphic call sites devirtualize; a new receiver type deopts back',
        detail: 'If a call site has only ever seen one concrete implementation, the JIT can compile a direct call (or even inline it) instead of paying for virtual dispatch, betting that the pattern continues — a bet it can afford to make because deoptimization is a real, working fallback, not a crash. The moment a genuinely new receiver type shows up, that compiled code is discarded and the method falls back to the interpreter while a new, more general version compiles.',
      },
      {
        text: 'Escape analysis: non-escaping objects become stack scalars — allocation eliminated',
        detail: 'This is the same escape analysis mechanism referenced in memory layout, applied here as a JIT-stage optimization: proving an object\'s lifetime never leaves the current method lets the compiler skip the heap allocation entirely and treat its fields as ordinary local variables, removing both the allocation cost and any GC pressure that object would otherwise have contributed.',
      },
      {
        text: 'Warm-up is real: benchmark and load-test only after the JIT settles ([[microbenchmarking]])',
        detail: 'The first thousands of invocations of any method run interpreted or under lightly-optimized C1 code, meaningfully slower than the eventual C2-compiled steady state — a benchmark or load test that measures from cold start is measuring warm-up time and compiled performance mixed together, which does not represent what a long-running production service actually experiences after it has been serving traffic for a while.',
      },
      {
        text: 'Code cache full = compilation silently stops — monitor it',
        detail: 'Compiled native code lives in a fixed-size code cache, and once it fills up HotSpot simply stops compiling more methods — there is no exception, no log spam by default, the application just quietly stays on interpreted/C1 code for anything not yet compiled. A service with an unusually large number of hot methods (common with heavy bytecode generation, like some ORMs) can silently regress in throughput this way with no obvious symptom besides the slowdown itself.',
      },
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
        detail: 'The two-type inline cache is a middle ground the JIT maintains specifically because bimorphic call sites (exactly two implementations) are common enough to special-case — it checks both cached types in sequence, still avoiding a full vtable lookup. Once a third type shows up, maintaining a growing chain of checks stops paying off and the JIT gives up on specialization entirely, falling back to a plain virtual dispatch with none of inlining\'s downstream benefits.',
      },
      {
        kind: 'note',
        title: 'The AOT counterpoint',
        text: 'GraalVM native-image compiles ahead-of-time: instant startup, small footprint, no warm-up — but no profile-guided speculation, closed-world reflection config, and typically lower peak throughput. The cloud-native trade-off in one line: CRaC/Leyden aim to keep JIT peaks *and* fix startup ([[cloud-native-java]], [[future-directions]]).',
        detail: 'AOT compilation has to be correct for every possible execution up front, with no runtime profile to specialize against and no ability to deoptimize if an assumption turns out wrong — which is exactly the tradeoff C2\'s speculative, profile-guided approach makes in the opposite direction. Native-image wins decisively on cold-start latency (no interpreter phase, no warm-up at all) at the cost of the peak throughput a fully profile-optimized C2 method eventually reaches.',
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
      {
        text: 'Latency ladder: L1 ~1 ns → L2 ~4 ns → L3 ~15 ns → RAM ~100 ns → SSD ~100 µs → network ~ms',
        detail: 'Each step down this ladder is roughly an order of magnitude slower than the one before it, and the CPU spends most of its idle time waiting on whichever level actually has the data — algorithmic complexity that ignores which level of this hierarchy an operation touches can be a poor predictor of real-world speed, since a "slow" O(n) scan through cache-resident data can beat a "fast" O(log n) search that misses cache on every step.',
      },
      {
        text: 'Cache lines are 64 bytes: sequential access is nearly free (prefetch); pointer-chasing is a miss per hop',
        detail: 'The hardware prefetcher watches memory access patterns and, when it detects sequential reads, starts pulling the next cache lines in before they are even requested — sequential access effectively hides the RAM latency behind computation that is already happening. Pointer-chasing defeats this entirely: each hop\'s address depends on the value just read, so there is nothing to prefetch ahead of time, and every hop pays the full latency.',
      },
      {
        text: 'Store buffers and out-of-order execution are *why* the [[java-memory-model]] exists',
        detail: 'If every core simply saw every other core\'s writes in program order the instant they happened, there would be no need for a memory model at all — but store buffers let a core continue executing past a write before that write is globally visible, and out-of-order execution can reorder independent operations for speed. The JMM is the language-level contract for what visibility and ordering guarantees `volatile`, locks, and plain fields actually provide given that this hardware reality exists underneath.',
      },
      {
        text: 'False sharing: two threads writing different fields on one cache line ping-pong it between cores',
        detail: 'Cache coherency protocols (like MESI) operate at the granularity of a whole cache line, not individual bytes — if thread A writes field `x` and thread B writes unrelated field `y`, but both happen to live on the same 64-byte line, each write invalidates the other core\'s cached copy of that entire line, forcing constant re-fetching even though the two threads never touch the same *variable*.',
      },
      {
        text: 'TLB, NUMA, branch prediction — each occasionally surfaces in Java performance work',
        detail: 'These are lower-level hardware mechanisms than cache lines but follow the same pattern: the TLB caches virtual-to-physical address translations (a miss costs a page-table walk), NUMA means memory attached to a *different* CPU socket is measurably slower to access than local memory, and mispredicted branches flush a speculatively-executed pipeline. None of them is usually the first thing to check, but each shows up often enough in serious profiling work to be worth recognizing.',
      },
      {
        text: 'Mechanical sympathy: arrays beat linked structures for traversal, always',
        detail: '"Always" here is a strong claim precisely because it holds up against the theoretical argument that a linked structure\'s O(1) insertion should make it competitive — on real hardware, the constant-factor cost of a cache miss per node dwarfs the asymptotic advantage for anything but the smallest structures, which is why array-backed collections dominate as the default choice throughout this app\'s Collections domain too.',
      },
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
        detail: 'A microbenchmark that repeatedly touches the same small dataset lets that data stay resident in L1/L2 cache for the whole run, measuring best-case latency numbers that a production workload — churning through gigabytes of live data that constantly evicts cache — will never see. The Formula 1 driver\'s "mechanical sympathy" (understanding the machine well enough to work with it, not against it) is the same idea applied to writing code that respects the memory hierarchy instead of ignoring it.',
      },
    ],
    refs: [
      { book: 'optimizing-java', chapter: 'Ch. 3 — Hardware and Operating Systems' },
      { book: 'ocnj', chapter: 'Ch. 7 — Hardware and Operating Systems' },
    ],
    related: ['java-memory-model', 'memory-layout', 'concurrent-performance', 'lists'],
  },
]
