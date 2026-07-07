import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'release-cadence',
    domainId: 'modern',
    title: 'Release Cadence & Versions',
    summary:
      'Since Java 9, a feature release ships every six months, with an LTS every two years (11, 17, 21, 25). Features arrive as previews first, ecosystems target LTS, and "Java is stagnant" died in 2017.',
    keyPoints: [
      'Two releases per year (March/September); LTS every 2 years — 21 (2023) and 25 (2025) are current targets',
      'Preview features need `--enable-preview` and can change; incubator APIs likewise',
      'Landmark drops: 8 lambdas/streams; 9 modules; 11 HttpClient + LTS; 17 sealed; 21 virtual threads + pattern matching',
      'Upgrading LTS→LTS is the mainstream path; each skip accumulates real performance/GC wins for free',
      'The `--release N` flag compiles against N\'s API — safer than source/target alone',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The releases that changed how Java is written',
        headers: ['Version', 'Year', 'Headliners'],
        rows: [
          ['8', '2014', 'lambdas, streams, Optional, java.time'],
          ['9', '2017', 'modules (JPMS), JShell, six-month cadence begins'],
          ['11 (LTS)', '2018', 'HttpClient, `var` (10), single-file run, JFR open-sourced'],
          ['17 (LTS)', '2021', 'sealed classes, records (16), pattern matching instanceof, text blocks (15)'],
          ['21 (LTS)', '2023', 'virtual threads, pattern matching for switch, sequenced collections, generational ZGC'],
          ['25 (LTS)', '2025', 'compact source files, scoped values, module import declarations, Shenandoah gen.'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The cadence changed the *risk model*: instead of a decade-scale big-bang release (Java 9 was five years late), features ship when ready, hardened through **preview** rounds — pattern matching took four previews across 17–21. For teams this means: read release notes twice a year, adopt on LTS, and treat preview features as experiments, never production commitments (they *have* changed between previews).',
      },
      {
        kind: 'paragraph',
        text: 'The quiet compounding: each release carries GC improvements ([[gc-algorithms|generational ZGC]]), JIT gains, and startup work that arrive **without code changes**. Multiple industry benchmarks show double-digit throughput gains going 8 → 17 → 21 purely from the runtime. Staying on 8 (still common) forfeits a decade of free performance — the cheapest optimization most legacy systems have available ([[performance-methodology]]).',
      },
      {
        kind: 'note',
        title: 'Distributions in one line',
        text: 'OpenJDK is the source; Temurin (Eclipse), Corretto (Amazon), Zulu (Azul), Microsoft Build, and Oracle JDK are builds of it differing in support contracts and patch cadence, not language features. Pick one with the patch/LTS policy your org needs ([[cloud-native-java]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 1 — An Introduction to Java' },
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
      { book: 'learning-java', chapter: 'Ch. 1 — A Modern Language' },
    ],
    related: ['future-directions', 'virtual-threads-structured-concurrency', 'switch-expressions-pattern-matching'],
  },

  {
    id: 'var-type-inference',
    domainId: 'modern',
    title: 'var & Local Type Inference',
    summary:
      '`var` (Java 10) infers a local variable\'s type from its initializer — less ceremony, same static typing. It shines when the type is obvious or noisy, and harms when the reader is left guessing.',
    keyPoints: [
      'Locals with initializers only — no fields, parameters, or return types',
      'The inferred type is fixed at compile time; `var` is not `dynamic`',
      '`var map = new HashMap<String, List<Order>>()` removes pure noise',
      'With diamond both sides can\'t infer: `var list = new ArrayList<>()` is `ArrayList<Object>`',
      'Style rule: use `var` when the right-hand side names the type or the variable name carries it',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Good var, bad var',
        code: '// Good — the type is right there or irrelevant:\nvar users = new HashMap<String, List<User>>();\nvar out = new ByteArrayOutputStream();\nfor (var entry : usersByRole.entrySet()) { ... }\n\n// Bad — what is this?\nvar result = service.process(data);        // reader must open process()\nvar x = getHandle();                        // name AND type opaque\n\n// Trap — inferred type isn\'t what you meant:\nvar list = new ArrayList<>();               // ArrayList<Object>!\nvar price = 10;                             // int — you wanted BigDecimal?',
      },
      {
        kind: 'paragraph',
        text: '`var` also captures **non-denotable types**: an anonymous class\'s members become accessible (`var point = new Object() { int x = 5; }; point.x`), and intersection types from generic methods survive. These are curiosities; the everyday win is stripping `Map.Entry<String, List<Order>>` down to `var entry` in loop headers.',
      },
      {
        kind: 'paragraph',
        text: 'The style guidance (OpenJDK\'s own LVTI style guide, echoed by Core Java): `var` moves information from the declaration to the initializer — fine when the initializer is informative (`new X()`, factory named like the type, literal), costly when it\'s a method call with a vague name. Interface-typed declarations (`List<String> l = new ArrayList<>()` — [[interfaces|EJ 64]]) are one genuine loss; use judgment where the abstraction matters.',
      },
      {
        kind: 'note',
        title: 'It\'s still javac doing the work',
        text: 'The bytecode declares the concrete inferred type; nothing is dynamic and nothing changes at runtime. `var` cannot infer from `null`, from a lambda, or from a method reference — those need a target type ([[lambdas]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.4 — Variables (var)' },
      { book: 'learning-java', chapter: 'Ch. 4 — The Java Language' },
    ],
    related: ['generics-why', 'lambdas'],
  },

  {
    id: 'switch-expressions-pattern-matching',
    domainId: 'modern',
    title: 'Pattern Matching & Switch Expressions',
    summary:
      'The pattern-matching trilogy — `instanceof` patterns (16), switch expressions (14), and patterns in switch with record deconstruction (21) — turns type-test-and-cast chains into checked, exhaustive, declarative code.',
    keyPoints: [
      '`if (o instanceof String s)` — test, cast, and bind in one step',
      'Switch expressions yield values; arrow arms don\'t fall through',
      'Type patterns in switch: `case Integer i ->`; guards: `case String s when s.length() > 3 ->`',
      'Record patterns deconstruct: `case Point(int x, int y) ->` — nested patterns too',
      'Sealed hierarchies + no default = compiler-checked **exhaustiveness**',
      '`case null` is now expressible; without it, switch still NPEs on null selectors',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'From instanceof chains to deconstruction',
        code: 'sealed interface Shape permits Circle, Rect, Compound {}\nrecord Circle(Point c, double r) implements Shape {}\nrecord Rect(Point tl, Point br) implements Shape {}\nrecord Compound(List<Shape> parts) implements Shape {}\n\ndouble area(Shape s) {\n    return switch (s) {\n        case Circle(Point ignored, double r) -> Math.PI * r * r;\n        case Rect(Point(var x1, var y1), Point(var x2, var y2)) ->   // nested!\n                Math.abs((x2 - x1) * (y2 - y1));\n        case Compound(List<Shape> parts) ->\n                parts.stream().mapToDouble(this::area).sum();\n    };  // no default: the compiler PROVES all Shapes are covered\n}',
      },
      {
        kind: 'paragraph',
        text: 'The exhaustiveness guarantee is the headline: add a `Triangle` to the sealed interface and **every switch over Shape fails to compile** until it handles the new case — the compiler enforcing what the visitor pattern used to enforce with ceremony. This is the "data-oriented programming" style ([[records]] + [[sealed-types-overview|sealed]] + patterns): model data as closed hierarchies of transparent values, and process it with switch.',
      },
      {
        kind: 'code',
        title: 'Guards and dominance',
        code: 'String describe(Object o) {\n    return switch (o) {\n        case null -> "nothing";                          // explicit null handling\n        case Integer i when i < 0 -> "negative " + i;     // guarded pattern\n        case Integer i -> "int " + i;                     // must come AFTER the guarded one\n        case String s -> "text \\"" + s + "\\"";\n        default -> o.toString();\n    };\n}',
      },
      {
        kind: 'pitfall',
        title: 'Scope and dominance rules',
        text: 'A pattern variable is in scope only where the match is certain — `if (!(o instanceof String s)) return; s.length();` works (flow scoping), but using `s` in an `else` doesn\'t. In switch, an unguarded pattern *dominates* later more-specific ones: `case Object o` before `case String s` is a compile error — order from specific to general.',
      },
      {
        kind: 'note',
        title: 'Old switch survives',
        text: 'Statement switches with `:` labels and fallthrough remain legal — treat them as legacy ([[control-flow]]). New code: arrow form always; expression form whenever a value is produced; patterns when dispatching on type structure.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 5.9 — Pattern Matching' },
      { book: 'learning-java', chapter: 'Ch. 4–5 — Language; Objects' },
    ],
    related: ['records', 'sealed-types-overview', 'control-flow'],
  },

  {
    id: 'text-blocks',
    domainId: 'modern',
    title: 'Text Blocks',
    summary:
      'Text blocks (Java 15) hold multi-line strings between `"""` delimiters: no escape ladders, automatic incidental-indentation stripping, and readable embedded JSON, SQL, and HTML.',
    keyPoints: [
      'Open with `"""` + newline; close alignment controls indentation stripping',
      'The closing delimiter\'s column sets the left margin — move it to control indentation',
      '`\\` at line end joins lines (no newline); `\\s` keeps trailing spaces',
      'Quotes inside need no escaping; `\\n`, `\\t` still work if wanted',
      'It\'s still a `String` — same type, same methods, interning included',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Before and after',
        code: 'String jsonOld = "{\\n" +\n        "  \\"name\\": \\"Duke\\",\\n" +\n        "  \\"role\\": \\"mascot\\"\\n" +\n        "}";\n\nString json = """\n        {\n          "name": "Duke",\n          "role": "mascot"\n        }\n        """;   // closing delimiter position strips the common indent',
      },
      {
        kind: 'paragraph',
        text: 'The indentation algorithm: the compiler finds the minimal indentation across all lines *including the closing delimiter line*, and strips it — so out-denting the closing `"""` preserves visual nesting in source while producing flush-left output. `String.stripIndent()`, `translateEscapes()`, and `formatted()` are the companion methods; `"""…%s…""".formatted(value)` covers interpolation until/unless a dedicated feature lands.',
      },
      {
        kind: 'pitfall',
        title: 'Trailing whitespace silently vanishes',
        text: 'Line-end spaces are stripped (editors trim them anyway, so they were untrustworthy). If a protocol genuinely needs them, end the line with `\\s`. And the first line must be a newline — `"""text` on the opening line is a compile error.',
      },
      {
        kind: 'note',
        title: 'Where they earn their keep',
        text: 'SQL in [[jdbc-database|JDBC]]/repositories, JSON fixtures in tests, HTML fragments, scripts passed to `ProcessBuilder` — anywhere the old escape-and-concatenate style hid the actual content. Syntax inside is still just text: no checking, no injection safety ([[jdbc-database|use parameters]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.6 — Strings (text blocks)' },
      { book: 'learning-java', chapter: 'Ch. 8 — Text and Core Utilities' },
    ],
    related: ['strings-text', 'jdbc-database'],
  },

  {
    id: 'sealed-types-overview',
    domainId: 'modern',
    title: 'Sealed Types',
    summary:
      'A `sealed` class or interface names its complete set of direct subtypes with `permits`. The hierarchy becomes a closed algebraic data type: the compiler knows every case, and exhaustive switches need no default.',
    keyPoints: [
      '`sealed interface X permits A, B, C` — only A, B, C may implement X',
      'Every permitted subtype must be `final`, `sealed` (continuing the closure), or `non-sealed` (reopening)',
      'Same-file subtypes can omit `permits`; otherwise same module/package',
      'Pairs with [[records]] for data variants and [[switch-expressions-pattern-matching|pattern switches]] for processing',
      'Use when the set of variants is a **domain fact**, not an extension point',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A closed domain model',
        code: 'public sealed interface PaymentMethod\n        permits Card, BankTransfer, Wallet {}\n\npublic record Card(String pan, YearMonth expiry) implements PaymentMethod {}\npublic record BankTransfer(String iban) implements PaymentMethod {}\npublic record Wallet(String provider, String accountId) implements PaymentMethod {}\n\nFee feeFor(PaymentMethod m) {\n    return switch (m) {\n        case Card c -> Fee.percent(1.5);\n        case BankTransfer t -> Fee.flat(30);\n        case Wallet w -> Fee.percent(2.0);\n    };   // add GiftCard to permits → this switch fails to compile until handled\n}',
      },
      {
        kind: 'paragraph',
        text: 'Sealing inverts the default openness of inheritance: instead of "anyone may extend" ([[inheritance-polymorphism]]) or "no one may" (`final`), it says **exactly these**. That middle ground models real domains — a JSON value is null/bool/number/string/array/object, an AST has known node kinds, a payment is one of the supported methods. Libraries also seal to keep interface implementation rights internal while exposing the type.',
      },
      {
        kind: 'paragraph',
        text: 'Design guidance: seal when *you* enumerate the variants and adding one should force review of all processing code (the exhaustiveness compile errors are the feature). Keep interfaces unsealed when third parties are supposed to plug in ([[interfaces]]). `non-sealed` deliberately punches a hole — rare, but it lets one branch reopen for extension (e.g., a `sealed Shape` with a `non-sealed CustomShape` escape hatch).',
      },
      {
        kind: 'note',
        title: 'Reflection and the JVM view',
        text: '`Class.isSealed()` and `getPermittedSubclasses()` expose the closure at runtime; the class file records it in the `PermittedSubclasses` attribute, and the JVM enforces it at class definition — a rogue subclass fails to load, not just to compile ([[class-loading]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 5.8 — Sealed Classes' },
      { book: 'learning-java', chapter: 'Ch. 5 — Objects in Java' },
    ],
    related: ['records', 'switch-expressions-pattern-matching', 'inheritance-polymorphism'],
  },

  {
    id: 'virtual-threads-structured-concurrency',
    domainId: 'modern',
    title: 'Structured Concurrency & Scoped Values',
    summary:
      'Structured concurrency (finalized in Java 25) makes concurrent subtasks children of a scope: they complete, fail, or cancel **together**, with errors propagating like ordinary exceptions. Scoped values replace ThreadLocal for context in virtual-thread code.',
    keyPoints: [
      '`StructuredTaskScope` forks subtasks and joins them as a unit — no orphaned threads',
      'Joiner policies: all-succeed-or-throw, first-success wins (`anySuccessful`), custom',
      'Failure of one subtask cancels the siblings — timeouts and errors stop wasted work',
      'The task tree is visible in thread dumps — concurrency you can *see*',
      '`ScopedValue`: immutable, inheritance-friendly context — the ThreadLocal successor',
      'Both finalized in Java 25 (previews through 21–24)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Fork two calls, need both (Java 25 API)',
        code: 'Response handle(Request req) throws InterruptedException {\n    try (var scope = StructuredTaskScope.open()) {          // all must succeed\n        Subtask<User> user = scope.fork(() -> findUser(req.userId()));\n        Subtask<Order> order = scope.fork(() -> fetchOrder(req.orderId()));\n\n        scope.join();                                        // waits; throws if any failed,\n                                                              // cancelling the sibling\n        return new Response(user.get(), order.get());\n    }   // leaving the scope guarantees no subtask outlives it\n}',
      },
      {
        kind: 'paragraph',
        text: 'The problem it fixes: with bare [[executors-thread-pools|executors]] or [[completable-future]], a failed subtask\'s siblings keep burning resources, cancellation must be wired by hand, and thread dumps show an unstructured soup. Structured concurrency imports the discipline of structured programming — a concurrent operation has one entry, one exit, and its children are lexically scoped. `join()` is mandatory before reading results; forgetting it is an error, not a race.',
      },
      {
        kind: 'code',
        title: 'ScopedValue: context without the ThreadLocal foot-guns',
        code: 'private static final ScopedValue<RequestContext> CONTEXT = ScopedValue.newInstance();\n\nScopedValue.where(CONTEXT, new RequestContext(traceId, user))\n           .run(() -> handleRequest(req));      // bound for this call tree only\n\n// anywhere below — including forked subtasks, which inherit it automatically:\nvar ctx = CONTEXT.get();',
      },
      {
        kind: 'paragraph',
        text: '`ThreadLocal`\'s problems compound with [[virtual-threads]]: unbounded mutability, leaks when threads are pooled, expensive per-thread copies for inheritance across millions of threads. `ScopedValue` is immutable, bound for a dynamic scope, automatically inherited by `StructuredTaskScope` forks, and freed on scope exit — request context (trace IDs, auth) done right ([[observability]]).',
      },
      {
        kind: 'note',
        title: 'Racing instead of joining all',
        text: '`StructuredTaskScope.open(Joiner.anySuccessful())` returns the first successful subtask and cancels the rest — hedged requests against replicas in five lines. Custom joiners handle quorum and collect-partial-results policies.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 10 — Concurrency (structured concurrency preview)' },
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
    ],
    related: ['virtual-threads', 'completable-future', 'executors-thread-pools'],
  },

  {
    id: 'ffm-api',
    domainId: 'modern',
    title: 'The Foreign Function & Memory API',
    summary:
      'FFM (final in Java 22) is Project Panama delivered: `MemorySegment`/`Arena` for safe off-heap memory with deterministic lifetimes, and `Linker` for calling native libraries without JNI glue. The sanctioned successor to Unsafe and direct-buffer tricks.',
    keyPoints: [
      '`Arena.ofConfined()`: single-thread scope; `ofShared()`: multi-thread; close frees everything at once',
      '`MemorySegment` is bounds-checked and lifetime-checked — use-after-free throws',
      '`MemoryLayout` describes C structs; `VarHandle`s read/write named fields',
      'Long-indexed (64-bit) addressing — past `ByteBuffer`\'s 2 GB limit',
      'jextract turns `.h` headers into complete Java bindings',
      'Replaces: JNI glue, `sun.misc.Unsafe` memory ops, direct-ByteBuffer lifecycle hacks',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Structured off-heap data',
        code: 'MemoryLayout POINT = MemoryLayout.structLayout(\n        ValueLayout.JAVA_DOUBLE.withName("x"),\n        ValueLayout.JAVA_DOUBLE.withName("y"));\nVarHandle X = POINT.varHandle(PathElement.groupElement("x"));\nVarHandle Y = POINT.varHandle(PathElement.groupElement("y"));\n\ntry (Arena arena = Arena.ofConfined()) {\n    MemorySegment points = arena.allocate(POINT, 1_000_000);   // 16 MB off-heap, zeroed\n    for (long i = 0; i < 1_000_000; i++) {\n        MemorySegment p = points.asSlice(i * POINT.byteSize(), POINT.byteSize());\n        X.set(p, 0L, (double) i);\n        Y.set(p, 0L, Math.sqrt(i));\n    }\n}   // deterministic free — no GC involvement, no finalizer roulette',
      },
      {
        kind: 'paragraph',
        text: 'Why it matters beyond native calls ([[native-interop]]): **GC-invisible data**. A multi-gigabyte cache in `MemorySegment`s adds nothing to heap marking work ([[gc-fundamentals]]) — the technique behind low-latency stores like Chronicle, previously built on Unsafe. Memory-mapped files return `MemorySegment`s too (`channel.map(..., arena)`), finally giving [[binary-data-buffers|mapped memory]] deterministic unmapping.',
      },
      {
        kind: 'paragraph',
        text: 'Safety model: confined arenas make single-threaded use race-free by construction (foreign threads touching the segment throw); shared arenas allow concurrent access with your own [[thread-safety|synchronization]]; bounds checks JIT down to negligible cost in hot loops. The explicit unsafe escape (`MemorySegment.ofAddress(...).reinterpret(...)`) exists, is named accordingly, and requires `--enable-native-access` — auditability that Unsafe never had.',
      },
      {
        kind: 'note',
        title: 'Companion: the Vector API',
        text: 'Panama\'s sibling (still incubating) expresses SIMD computations (`FloatVector.fromArray(...)`) that compile to AVX/NEON instructions — paired with FFM layouts, Java addresses numeric workloads it historically ceded to C++ ([[future-directions]]).',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 13.11 — Foreign Functions: A Glimpse into the Future' },
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
    ],
    related: ['native-interop', 'binary-data-buffers', 'memory-layout'],
  },

  {
    id: 'future-directions',
    domainId: 'modern',
    title: 'Future Directions',
    summary:
      'The OpenJDK umbrella projects sketch Java\'s next decade: Valhalla (value types — memory density), Leyden (startup/AOT), Amber (language ergonomics), Panama\'s remaining pieces (Vector API), and Loom\'s tail (structured concurrency refinement).',
    keyPoints: [
      'Valhalla: value classes flatten "objects" into their containers — arrays of points without pointer chasing',
      'Leyden: ahead-of-time class loading/compilation in mainline JDK — CDS on steroids (JEP 483 shipped in 24)',
      'Amber pipeline: derived record creation (`with` expressions), stable values, pattern-matching extensions',
      'Vector API finalizes when Valhalla\'s types land — SIMD without intrinsics',
      'Babylon: code reflection for GPU/ML offload from Java source',
      'Follow JEPs, not rumors: openjdk.org/jeps is the source of truth',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: '**Valhalla** attacks Java\'s oldest performance tax: an `ArrayList<Point>` is an array of pointers to heap objects ([[memory-layout]]), each with a header, scattered across memory ([[hardware-memory]]). Value classes (`value record Point(double x, double y)`) renounce identity — no header semantics, no locking on them — letting the JVM inline them into arrays and fields: C-struct density with Java abstraction. It has been "coming" for a decade because it touches everything: generics over values, `Integer`\'s identity edge cases, the JIT, serialization.',
      },
      {
        kind: 'paragraph',
        text: '**Leyden** productizes the [[cloud-native-java|startup]] fixes: JEP 483 (Java 24) caches loaded/linked classes ahead of time; successive JEPs add AOT method profiles and code caches — aiming for native-image-class startup while keeping the dynamic JVM and C2 peak performance. **Amber** continues the ergonomics arc that produced [[records]], [[sealed-types-overview|sealed]], and [[switch-expressions-pattern-matching|patterns]]: `with` expressions for records, stable values (lazy final), and eventually deconstruction beyond records.',
      },
      {
        kind: 'paragraph',
        text: 'The strategic reading (OCNJ\'s closing chapter): the JVM keeps absorbing its competitors\' advantages — Go\'s cheap concurrency ([[virtual-threads]]), Rust/C++\'s memory density (Valhalla), native startup (Leyden), SIMD (Vector API) — while keeping the ecosystem, the observability ([[observability]]), and three decades of libraries. Betting on Java\'s stagnation has been a losing trade since 2017 ([[release-cadence]]).',
      },
      {
        kind: 'note',
        title: 'How to track it',
        text: 'JEPs (openjdk.org/jeps/0) for what\'s in flight; Inside Java (inside.java) for the engineering blogs; the six-month release notes for what actually shipped. Preview features are invitations to test, not to deploy.',
      },
    ],
    refs: [
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
      { book: 'optimizing-java', chapter: 'Ch. 15 — Java 9 and the Future' },
    ],
    related: ['release-cadence', 'ffm-api', 'memory-layout', 'virtual-threads'],
  },
]
