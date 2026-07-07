import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'lambdas',
    domainId: 'functional',
    title: 'Lambda Expressions',
    summary:
      'A lambda is a compact block of code you pass around for deferred execution — `(params) -> body`. It implements a functional interface, captures effectively-final variables, and (unlike an anonymous class) has no identity of its own.',
    keyPoints: [
      'Syntax: `(String a, String b) -> a.length() - b.length()`; types usually inferred',
      'A lambda\'s type is always a **functional interface** (one abstract method)',
      'Captured local variables must be effectively final',
      '`this` inside a lambda means the enclosing instance — not the lambda',
      'Prefer lambdas to anonymous classes (EJ 42); keep them short — a line or three',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'From ceremony to intent',
        code: '// The unit of behavior: "compare two strings by length"\nArrays.sort(words, new Comparator<String>() {          // 2004\n    public int compare(String a, String b) {\n        return Integer.compare(a.length(), b.length());\n    }\n});\n\nArrays.sort(words, (a, b) -> Integer.compare(a.length(), b.length()));  // lambda\nArrays.sort(words, Comparator.comparingInt(String::length));            // clearest',
      },
      {
        kind: 'paragraph',
        text: 'Forms: zero params `() -> 42`; one param, parens optional `w -> w.length()`; block body with `return` when one expression isn\'t enough. The compiler infers parameter types from the target functional interface — write them only when it helps the reader.',
      },
      {
        kind: 'paragraph',
        text: '**Capture**: lambdas may read local variables of the enclosing scope if they are *effectively final* (never reassigned). This prevents data races on stack variables and keeps capture semantics simple — mutation belongs in the object the lambda operates on, not in captured locals. Instance fields have no such restriction (the lambda captures `this`).',
      },
      {
        kind: 'pitfall',
        title: 'Counting with a captured variable',
        text: '`int count = 0; list.forEach(e -> count++);` does not compile. The stream-native fix: `long count = list.stream().filter(...).count()`. Escaping via a one-element array (`int[] count`) works but signals you want a different design — or a plain loop.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer lambdas to anonymous classes (EJ Item 42)',
        text: 'Less noise, correct `this`, no accidental fields. Anonymous classes remain for: interfaces with multiple abstract methods, self-reference, or when you genuinely need instance state. And: **omit parameter types unless they add clarity.**',
      },
      {
        kind: 'note',
        title: 'What a lambda compiles to',
        text: 'Not an anonymous class: `invokedynamic` creates the implementation at first call, typically cheaper and JIT-friendly. Stateless lambdas are usually a shared singleton; capturing ones allocate. Details matter only in the hottest paths ([[language-performance]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 6.2 — Lambda Expressions' },
      { book: 'effective-java', chapter: 'Item 42' },
      { book: 'learning-java', chapter: 'Ch. 5, 7 — Lambdas' },
    ],
    related: ['functional-interfaces', 'method-references', 'stream-pipeline', 'inner-nested-classes'],
  },

  {
    id: 'method-references',
    domainId: 'functional',
    title: 'Method References',
    summary:
      'A method reference names an existing method where a lambda is expected: `String::length`, `System.out::println`, `User::new`. When it\'s clearer than the lambda, use it; when it isn\'t, don\'t.',
    keyPoints: [
      'Five kinds: static, bound instance, unbound instance, constructor, array constructor',
      '`ClassName::instanceMethod` — the **first** lambda argument becomes the receiver',
      '`expr::instanceMethod` captures the receiver now, calls later',
      'Prefer method references when shorter and clearer (EJ 43)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The five kinds',
        headers: ['Kind', 'Syntax', 'Equivalent lambda'],
        rows: [
          ['Static', '`Integer::parseInt`', '`s -> Integer.parseInt(s)`'],
          ['Bound (receiver fixed)', '`System.out::println`', '`x -> System.out.println(x)`'],
          ['Unbound (receiver = 1st arg)', '`String::toLowerCase`', '`s -> s.toLowerCase()`'],
          ['Constructor', '`ArrayList::new`', '`() -> new ArrayList<>()`'],
          ['Array constructor', '`String[]::new`', '`n -> new String[n]`'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The unbound form is the one worth internalizing: in `Comparator.comparing(Person::getName)`, each `Person` flowing through becomes the receiver of `getName`. With two parameters, `String::compareToIgnoreCase` means `(a, b) -> a.compareToIgnoreCase(b)`.',
      },
      {
        kind: 'code',
        title: 'Where they shine',
        code: 'people.stream()\n      .map(Person::getName)                       // unbound\n      .filter(Objects::nonNull)                    // static\n      .sorted(String::compareToIgnoreCase)         // unbound, 2-arg\n      .forEach(System.out::println);               // bound\n\nList<Set<String>> groups = names.stream()\n      .collect(groupingBy(String::length, mapping(s -> s, toCollection(TreeSet::new))));',
      },
      {
        kind: 'pitfall',
        title: 'Evaluation time of the receiver',
        text: '`user.get()::process` evaluates `user.get()` **immediately** and captures the result; the equivalent lambda `() -> user.get().process()` re-evaluates on every call. Also, a bound reference on a possibly-null receiver NPEs at creation, not at invocation.',
      },
      {
        kind: 'bestPractice',
        title: 'EJ Item 43, with its own caveat',
        text: '"Prefer method references to lambdas" — *where they are shorter and clearer*. `service::execute` beats `x -> service.execute(x)`. But `() -> action()` inside the same class beats `TheEnclosingClassName::action`, and an explicit lambda beats a puzzling reference.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 6.2.4 — Method References' },
      { book: 'effective-java', chapter: 'Item 43' },
    ],
    related: ['lambdas', 'functional-interfaces', 'stream-operations'],
  },

  {
    id: 'functional-interfaces',
    domainId: 'functional',
    title: 'Standard Functional Interfaces',
    summary:
      '`java.util.function` supplies the vocabulary of functional Java: `Function`, `Predicate`, `Consumer`, `Supplier`, the two-arg `Bi*` forms, operators, and primitive specializations. Use these instead of inventing your own (EJ 44).',
    keyPoints: [
      'Six core shapes: `Function<T,R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`, `UnaryOperator<T>`, `BinaryOperator<T>`',
      'Primitive specializations (`IntPredicate`, `LongFunction`…) avoid boxing — prefer them',
      'Composition: `f.andThen(g)`, `f.compose(g)`, `p.and(q).or(r)`, `p.negate()`',
      'Write your own only with a compelling reason — then annotate `@FunctionalInterface`',
      '`Comparator` is the star example of a custom functional interface that earns its keep',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The core six (43 interfaces reduce to these shapes)',
        headers: ['Interface', 'Signature', 'Typical use'],
        rows: [
          ['`Function<T,R>`', '`R apply(T t)`', 'transform a value — `map`'],
          ['`Predicate<T>`', '`boolean test(T t)`', 'filter, match'],
          ['`Consumer<T>`', '`void accept(T t)`', 'side effects — `forEach`'],
          ['`Supplier<T>`', '`T get()`', 'lazy creation, factories'],
          ['`UnaryOperator<T>`', '`T apply(T t)`', 'same-type transform — `replaceAll`'],
          ['`BinaryOperator<T>`', '`T apply(T a, T b)`', 'combine — `reduce`, `merge`'],
        ],
      },
      {
        kind: 'code',
        title: 'Composition builds pipelines without streams',
        code: 'Predicate<String> nonBlank = s -> !s.isBlank();\nPredicate<String> shortEnough = s -> s.length() <= 80;\nPredicate<String> valid = nonBlank.and(shortEnough);\n\nFunction<String, String> clean = String::strip;\nFunction<String, String> normalize = clean.andThen(String::toLowerCase);',
      },
      {
        kind: 'bestPractice',
        title: 'Favor the standard interfaces (EJ Item 44)',
        text: 'An API taking `Function<Path, String>` composes with every other functional API in the ecosystem; a custom `PathToStringMapper` does not. Exception test (all true for `Comparator`): it will be commonly used and benefits from a descriptive name, has a strong contract, and wants default methods.',
      },
      {
        kind: 'pitfall',
        title: 'Boxing through the generic forms',
        text: '`Function<Integer, Integer>` boxes every value through the pipeline. In numeric hot paths use `IntUnaryOperator`, `IntPredicate`, `ToIntFunction` — the same reason [[primitive-streams]] exist. Don\'t overload methods across functional-interface parameter types either; it forces casts at call sites (EJ 52).',
      },
      {
        kind: 'note',
        title: 'Checked exceptions don\'t fit',
        text: 'None of the standard interfaces declare checked exceptions — a lambda throwing `IOException` won\'t fit a `Function`. Options: wrap in an unchecked exception, write a small `ThrowingFunction` adapter, or restructure so I/O happens outside the lambda. A perennial friction point with [[exception-hierarchy|checked exceptions]].',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 44, 52' },
      { book: 'core-java-1', chapter: 'Ch. 6.2 — Lambda Expressions' },
    ],
    related: ['lambdas', 'primitive-streams', 'stream-operations'],
  },

  {
    id: 'stream-pipeline',
    domainId: 'functional',
    title: 'The Stream Pipeline',
    summary:
      'A stream is a lazily-evaluated pipeline over data: source → intermediate operations → one terminal operation. Nothing computes until the terminal runs; streams describe *what*, loops describe *how*.',
    keyPoints: [
      'Anatomy: source (`stream()`, `Stream.of`, `Files.lines`…) → intermediate ops → terminal op',
      'Intermediate ops are **lazy**; the terminal op triggers a single fused pass',
      'A stream never modifies its source; it is single-use — consume once',
      'Prefer streams where they clarify; loops where they don\'t (EJ 45)',
      'Streams of unbounded sources work because of laziness + short-circuit ops (`limit`, `findFirst`)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Declarative vs imperative',
        code: '// How many long words?\nlong count = words.stream()\n        .filter(w -> w.length() > 12)\n        .count();\n\n// Same, imperative:\nint c = 0;\nfor (String w : words)\n    if (w.length() > 12) c++;',
      },
      {
        kind: 'paragraph',
        text: '**Laziness is the engine**: `filter` and `map` record intentions; `count()` runs the fused pipeline in one pass over the data, applying all stages per element. That is why `Stream.iterate(0, n -> n + 1).map(...).limit(10)` terminates — only 10 elements are ever pulled.',
      },
      {
        kind: 'code',
        title: 'Creating streams',
        code: 'Stream.of("a", "b", "c");\nArrays.stream(intArray);\nlist.stream();\nStream.iterate(1L, n -> n * 2).limit(64);        // powers of two\nStream.generate(Math::random).limit(5);\ntry (Stream<String> lines = Files.lines(path)) {  // I/O-backed: close it!\n    long n = lines.count();\n}',
      },
      {
        kind: 'pitfall',
        title: 'Streams are single-use',
        text: 'Calling a second terminal operation throws `IllegalStateException: stream has already been operated upon or closed`. Re-create the stream from the source, or collect once and reuse the collection. And I/O-backed streams (`Files.lines`) hold file handles — use try-with-resources.',
      },
      {
        kind: 'bestPractice',
        title: 'Use streams judiciously (EJ Item 45)',
        text: 'Streams excel at transform/filter/aggregate chains. Loops win when you need: mutation of locals, early return from the enclosing method, checked exceptions, or access to *both* a value and its derived value across stages (streams lose earlier pipeline values). Bloch\'s heuristic: refactor to streams only when it makes the code **clearer** — and name your lambda parameters well.',
      },
      {
        kind: 'note',
        title: 'Side-effect-free by design (EJ Item 46)',
        text: 'Pipeline lambdas should be pure functions of their input. A `forEach` that accumulates into a shared list is a for-loop wearing a costume — and it breaks under [[parallel-streams|parallelism]]. Accumulation is the collector\'s job ([[collectors]]).',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 1.1–1.2 — Stream Operations; Creation' },
      { book: 'effective-java', chapter: 'Items 45, 46' },
      { book: 'learning-java', chapter: 'Ch. 7 — Streams' },
    ],
    related: ['stream-operations', 'collectors', 'parallel-streams', 'lambdas'],
  },

  {
    id: 'stream-operations',
    domainId: 'functional',
    title: 'Stream Operations',
    summary:
      'The intermediate vocabulary — `map`, `filter`, `flatMap`, `sorted`, `distinct`, `limit`/`skip`, `takeWhile`/`dropWhile` — and the terminals: `reduce`, `collect`, `find*`, `*Match`, `min`/`max`, `toList`.',
    keyPoints: [
      '`map` transforms 1→1; `flatMap` transforms 1→many and flattens; `mapMulti` (Java 16) is its imperative sibling',
      '`takeWhile`/`dropWhile` (Java 9) cut ordered streams at a condition',
      '`anyMatch`/`allMatch`/`noneMatch` and `findFirst`/`findAny` **short-circuit**',
      '`reduce` folds with an associative operation; `collect` builds containers',
      '`sorted`, `distinct` are stateful — they buffer; keep them late and rare',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'flatMap: the un-nester',
        code: '// All distinct words across all lines:\nList<String> words = lines.stream()\n        .flatMap(line -> Arrays.stream(line.split("\\\\s+")))  // Stream<String> per line → one stream\n        .map(String::toLowerCase)\n        .distinct()\n        .toList();\n\n// Optional-valued lookups compose the same way:\nList<Order> orders = ids.stream()\n        .map(repo::findOrder)              // Stream<Optional<Order>>\n        .flatMap(Optional::stream)         // keep only present values\n        .toList();',
      },
      {
        kind: 'code',
        title: 'Terminals: reduce and friends',
        code: 'int totalChars = words.stream().mapToInt(String::length).sum();   // specialized reduce\n\nOptional<String> longest = words.stream()\n        .max(Comparator.comparingInt(String::length));\n\nboolean anyEmpty = words.stream().anyMatch(String::isEmpty);       // stops at first hit\n\n// General fold — identity, accumulator (must be associative):\nint sum = numbers.stream().reduce(0, Integer::sum);',
      },
      {
        kind: 'paragraph',
        text: '`reduce`\'s operation must be **associative and stateless** — that contract is what lets the same code run parallel unchanged ([[parallel-streams]]). If your reduction builds a mutable container (a list, a map, a StringBuilder), that\'s not `reduce`, that\'s `collect` — the mutable-reduction terminal ([[collectors]]).',
      },
      {
        kind: 'pitfall',
        title: 'get() on an empty Optional',
        text: 'Terminals like `findFirst`, `max`, `reduce`-without-identity return [[optional]] precisely because the stream may be empty. Chaining `.get()` reintroduces the crash you were being protected from — use `orElse`, `orElseThrow(msg)`, or `ifPresent`.',
      },
      {
        kind: 'pitfall',
        title: 'Ordering semantics of peek/forEach',
        text: '`peek` exists for debugging; relying on it for side effects couples you to evaluation order and element traversal you don\'t control (elements skipped by `limit` are never peeked). On parallel streams, `forEach` ignores encounter order — use `forEachOrdered` if order matters.',
      },
      {
        kind: 'note',
        title: 'toList() vs collect(toList())',
        text: 'Java 16\'s `stream.toList()` returns an **unmodifiable** list and is the preferred spelling; `collect(Collectors.toList())` returns a list of unspecified mutability (in practice ArrayList). Choose deliberately when downstream code mutates.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 1.3–1.7 — filter/map/flatMap; Substreams; Reductions; Optional' },
      { book: 'effective-java', chapter: 'Items 46, 47' },
    ],
    related: ['stream-pipeline', 'collectors', 'optional', 'method-references'],
  },

  {
    id: 'collectors',
    domainId: 'functional',
    title: 'Collectors',
    summary:
      '`collect` performs mutable reduction through a `Collector` recipe. `Collectors` covers containers (`toList`, `toSet`, `toMap`), strings (`joining`), statistics, and — its real power — `groupingBy`/`partitioningBy` with downstream collectors.',
    keyPoints: [
      '`toMap(keyFn, valueFn)` throws on duplicate keys — pass a merge function when keys can repeat',
      '`groupingBy(classifier)` → `Map<K, List<T>>`; add a downstream collector to aggregate per group',
      '`partitioningBy(predicate)` → `Map<Boolean, …>` with exactly two entries',
      'Downstream combinators: `counting`, `summingInt`, `mapping`, `filtering`, `collectingAndThen`',
      '`joining(", ", "[", "]")` for delimited strings',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The everyday set',
        code: 'Map<String, Employee> byId = staff.stream()\n        .collect(toMap(Employee::id, e -> e));                 // throws on dup ids — good!\n\nMap<String, Double> highestPayByDept = staff.stream()\n        .collect(toMap(Employee::dept, Employee::salary, Double::max));  // merge fn\n\nString csv = names.stream().collect(joining(", "));\nIntSummaryStatistics stats = words.stream().collect(summarizingInt(String::length));\n// stats.getMax(), getMin(), getAverage(), getCount(), getSum()',
      },
      {
        kind: 'code',
        title: 'groupingBy with downstreams — SQL GROUP BY in the language',
        code: 'Map<String, List<Employee>> byDept = staff.stream()\n        .collect(groupingBy(Employee::dept));\n\nMap<String, Long> headcount = staff.stream()\n        .collect(groupingBy(Employee::dept, counting()));\n\nMap<String, Double> payroll = staff.stream()\n        .collect(groupingBy(Employee::dept, summingDouble(Employee::salary)));\n\nMap<String, Set<String>> namesByDept = staff.stream()\n        .collect(groupingBy(Employee::dept,\n                 mapping(Employee::name, toCollection(TreeSet::new))));',
      },
      {
        kind: 'paragraph',
        text: 'Downstream collectors nest arbitrarily — `groupingBy(f, groupingBy(g, counting()))` builds two-level maps. `collectingAndThen(toList(), List::copyOf)` post-processes a result (here: seal it immutable). `teeing(c1, c2, merger)` (Java 12) runs two collectors over one pass and merges their results.',
      },
      {
        kind: 'pitfall',
        title: 'toMap and null values / duplicate keys',
        text: 'Two rough edges: `toMap` throws `IllegalStateException` on duplicate keys unless you supply a merge function, and it NPEs on null values (HashMap.merge rejects them). Also `groupingBy` gives no entry for empty groups — `partitioningBy` guarantees both `true` and `false` entries.',
      },
      {
        kind: 'note',
        title: 'Custom collectors',
        text: '`Collector.of(supplier, accumulator, combiner, finisher)` when the built-ins don\'t fit. The combiner must correctly merge two partial containers — that\'s what makes the collector parallel-ready ([[parallel-streams]]).',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 1.8–1.11 — Collecting Results; Grouping' },
      { book: 'effective-java', chapter: 'Item 46' },
    ],
    related: ['stream-operations', 'maps', 'stream-pipeline'],
  },

  {
    id: 'primitive-streams',
    domainId: 'functional',
    title: 'Primitive Streams',
    summary:
      '`IntStream`, `LongStream`, `DoubleStream` process numbers without boxing — plus numeric extras the object stream lacks: `sum`, `average`, `range`, `summaryStatistics`.',
    keyPoints: [
      'Boxed `Stream<Integer>` costs an object per value; `IntStream` streams bare ints',
      'Bridges: `mapToInt` / `mapToObj` / `boxed` / `asDoubleStream`',
      '`IntStream.range(0, n)` (exclusive) / `rangeClosed(1, n)` replace index loops',
      '`chars()` on String, `Random.ints()`, `Arrays.stream(int[])` are primitive sources',
      'The specializations exist because erasure forbids `Stream<int>` ([[generics-restrictions]])',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Numeric pipelines, no boxing',
        code: 'int total = IntStream.rangeClosed(1, 100).sum();                 // 5050\n\ndouble avgLen = words.stream()\n        .mapToInt(String::length)        // Stream<String> → IntStream\n        .average()                        // OptionalDouble\n        .orElse(0);\n\nIntSummaryStatistics s = IntStream.of(measurements).summaryStatistics();\n// s.getMin(), s.getMax(), s.getAverage(), s.getSum()',
      },
      {
        kind: 'paragraph',
        text: 'A boxed pipeline over a million ints allocates a million `Integer` objects (beyond the −128…127 cache) and chases a pointer per element; the primitive pipeline runs over machine words and frequently vectorizes after JIT. When a stream computes over numbers, reach for the specialization **first**, not as an optimization afterthought.',
      },
      {
        kind: 'pitfall',
        title: 'Silent boxing detours',
        text: '`stream.map(String::length)` produces `Stream<Integer>` (boxed); `stream.mapToInt(String::length)` produces `IntStream`. One letter, big difference in a hot loop. Watch method-signature types: `boxed()` is explicit, but a misplaced `map` boxes silently.',
      },
      {
        kind: 'note',
        title: 'Different Optionals, different terminals',
        text: 'Primitive streams return `OptionalInt`/`OptionalLong`/`OptionalDouble` (with `getAsInt`, not `get`), and their `sum`/`average`/`min`/`max` come built-in — no comparator dance. `average()` on an empty stream is an empty OptionalDouble, not NaN.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 1.13 — Primitive Type Streams' },
      { book: 'optimizing-java', chapter: 'Ch. 11 — Language Performance' },
    ],
    related: ['stream-pipeline', 'functional-interfaces', 'language-performance'],
  },

  {
    id: 'parallel-streams',
    domainId: 'functional',
    title: 'Parallel Streams',
    summary:
      'One word — `parallel()` — splits a stream across the common ForkJoinPool. It is effortless and *frequently a mistake*: parallelism pays only for large, splittable sources with CPU-heavy, independent stages (EJ 48).',
    keyPoints: [
      'Parallel wins need: many elements × costly-per-element × splittable source × no shared state',
      'Best sources: arrays, `ArrayList`, `IntStream.range` — cheap to split; `iterate` and `limit` are poison',
      'All pipeline functions must be thread-safe and side-effect-free',
      'Ordering constraints (`findFirst`, `forEachOrdered`) sacrifice speedup; `findAny` doesn\'t',
      'Everything shares the common FJ pool — one blocked parallel stream starves the JVM\'s others',
      '**Measure before and after** — never assume parallel is faster',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A good candidate — and a terrible one',
        code: '// GOOD: huge range, pure math, splittable source, associative reduction\nlong primes = LongStream.range(2, 10_000_000)\n        .parallel()\n        .filter(MathUtils::isPrime)\n        .count();\n\n// BAD (from EJ Item 48): Stream.iterate can\'t split, limit fights parallelism —\n// this version doesn\'t just fail to speed up; it can run effectively forever:\nStream.iterate(TWO, BigInteger::nextProbablePrime)\n        .parallel()\n        .limit(20)\n        .forEach(System.out::println);',
      },
      {
        kind: 'paragraph',
        text: 'Under the hood: the source\'s `Spliterator` recursively halves the data, fork/join workers process chunks, and results merge via your combiner/collector. The model (from [[executors-thread-pools|Fork/Join]]) assumes **non-blocking, CPU-bound** work. I/O in a parallel stream occupies the shared common pool — other parallel streams and `CompletableFuture` defaults stall with it.',
      },
      {
        kind: 'pitfall',
        title: 'Shared mutable state destroys correctness',
        text: '`parallelStream().forEach(e -> results.add(e))` on an `ArrayList` is a data race — lost elements, corruption, or `ArrayIndexOutOfBoundsException`. The pipeline\'s contract: accumulate through `collect`, whose per-thread containers merge safely. If you\'re synchronizing inside a stream, you\'ve already lost the speedup.',
      },
      {
        kind: 'paragraph',
        text: 'Rules of thumb from the performance books: below ~10,000 cheap elements, splitting overhead eats the gain (the old N×Q heuristic — element count × per-element cost should exceed ~100k "units"). Merge cost matters too: `groupingBy` into maps merges expensively in parallel — `groupingByConcurrent` exists for that. And benchmark with [[microbenchmarking|JMH]], not wall-clock printlns.',
      },
      {
        kind: 'note',
        title: 'Ordering and determinism',
        text: 'Reductions with associative operators give identical results parallel or not. Side-effect order does not: `forEach` visits in whatever order threads reach elements. If output order matters, keep the pipeline pure and let `collect`/`toList` preserve encounter order — that\'s free.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Item 48' },
      { book: 'core-java-2', chapter: 'Ch. 1.14 — Parallel Streams' },
      { book: 'ocnj', chapter: 'Ch. 13 — Concurrent Performance Techniques' },
    ],
    related: ['executors-thread-pools', 'stream-pipeline', 'concurrent-performance', 'collectors'],
  },

  {
    id: 'optional',
    domainId: 'functional',
    title: 'Optional',
    summary:
      '`Optional<T>` is a return type that makes "no result" impossible to ignore. Use it for possibly-absent return values; don\'t use it for fields, parameters, or collections — and never call bare `get()`.',
    keyPoints: [
      'Purpose: API honesty — callers must consciously handle absence (EJ 55)',
      'Consume with `orElse`, `orElseGet(supplier)`, `orElseThrow`, `ifPresent`, `map`',
      'Never `isPresent()` + `get()` when a functional form exists',
      'Don\'t wrap collections in Optional — return the empty collection',
      'Skip Optional for performance-critical returns and for fields (use null + discipline there)',
      '`Optional.stream()` bridges into stream pipelines',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Consuming an Optional well',
        code: 'Optional<User> found = repo.findByEmail(email);\n\nUser user = found.orElseThrow(() -> new NoSuchUserException(email));\nString name = found.map(User::name).orElse("anonymous");\nfound.ifPresentOrElse(this::greet, this::showSignup);\n\n// orElse vs orElseGet — the argument of orElse is ALWAYS evaluated:\nconfig = stored.orElse(loadDefaults());        // loadDefaults runs even when present!\nconfig = stored.orElseGet(this::loadDefaults); // lazy — usually what you meant',
      },
      {
        kind: 'paragraph',
        text: 'Chaining absorbs null-check pyramids: `person.flatMap(Person::address).map(Address::city).filter(c -> !c.isBlank())`. Each step runs only if a value is present. For interop, `Optional.ofNullable(legacyCall())` enters the monad; `opt.orElse(null)` exits it at legacy boundaries.',
      },
      {
        kind: 'bestPractice',
        title: 'Return optionals judiciously (EJ Item 55)',
        text: 'Return `Optional<T>` when a result may legitimately be absent and callers must decide what then. Do **not**: return `Optional` for collections (empty collection says it better), put it in fields (adds a layer, still nullable), take it as a parameter (forces `Optional.of` noise — overload instead), or box primitives (`OptionalInt` exists).',
      },
      {
        kind: 'pitfall',
        title: 'Optional.get() and optional-of-null',
        text: 'Bare `get()` on an empty Optional throws `NoSuchElementException` — you\'ve traded an NPE for an equally uninformative crash. And `Optional.of(null)` NPEs immediately; use `ofNullable` when the input may be null. An `Optional` variable that is *itself* null is a firing offense.',
      },
      {
        kind: 'note',
        title: 'Cost model',
        text: 'Every Optional is an allocation (though escape analysis often removes short-lived ones — [[jit-compilation]]). In tight loops or hot getters, a nullable return with a documented contract remains legitimate. Optional\'s value is at API boundaries, not inside private plumbing.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 1.7 — The Optional Type' },
      { book: 'effective-java', chapter: 'Item 55' },
    ],
    related: ['stream-operations', 'exception-best-practices', 'classes-objects'],
  },
]
