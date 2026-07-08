import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'lambdas',
    domainId: 'functional',
    title: 'Lambda Expressions',
    summary:
      'A lambda is a compact block of code you pass around for deferred execution — `(params) -> body`. It implements a functional interface, captures effectively-final variables, and (unlike an anonymous class) has no identity of its own.',
    keyPoints: [
      {
        text: 'Syntax: `(String a, String b) -> a.length() - b.length()`; types usually inferred',
        detail: 'The compiler infers `a`/`b`\'s types from the target functional interface at the call site — `Arrays.sort` expects a `Comparator<String>`, so both parameters are inferred as `String` without you writing it. Add explicit types back only when the target type is ambiguous or the reader needs the hint.',
      },
      {
        text: 'A lambda\'s type is always a **functional interface** (one abstract method)',
        detail: 'The single-abstract-method requirement is what lets the compiler decide unambiguously which method the lambda body implements — default and static methods on the interface don\'t count against the "one abstract method" rule, which is why interfaces loaded with default methods (like `Comparator`) still qualify.',
      },
      {
        text: 'Captured local variables must be effectively final',
        detail: 'A lambda captures local variables *by value* at the point of creation, not by reference to the stack frame (which may no longer exist by the time the lambda runs). If the variable could change after capture, the copy and the "live" variable would silently diverge — effectively-final closes that gap by construction rather than by convention.',
      },
      {
        text: '`this` inside a lambda means the enclosing instance — not the lambda',
        detail: 'Unlike an anonymous class, a lambda does not introduce a new lexical scope — its body is compiled as if it were still sitting inline inside the enclosing method, so `this` resolves exactly as it would there. An anonymous class needs `EnclosingClass.this` for the same reference precisely because it *does* introduce a new scope.',
      },
      {
        text: 'Prefer lambdas to anonymous classes (EJ 42); keep them short — a line or three',
        detail: 'Long lambda bodies lose the readability win that motivated using a lambda in the first place — past a handful of lines, extract a named method or a small class instead. A lambda has no name to signal intent, so the body itself has to carry that weight.',
      },
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
        detail: 'The compiler rejects this specifically because `count++` both reads and writes the captured copy, and effectively-final variables cannot be reassigned anywhere in scope — including inside the lambda. There is no runtime check being skipped here; it is a compile error precisely because the semantics of a mutated capture are undefined once more than one lambda (or thread) might see it.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer lambdas to anonymous classes (EJ Item 42)',
        text: 'Less noise, correct `this`, no accidental fields. Anonymous classes remain for: interfaces with multiple abstract methods, self-reference, or when you genuinely need instance state. And: **omit parameter types unless they add clarity.**',
        detail: 'Anonymous classes survive for cases lambdas structurally cannot cover: an interface with more than one abstract method (a lambda cannot pick which one it implements), or code that needs to refer to itself (a lambda has no `this` of its own, so any reference to the enclosing type\'s `this` inside one always means the *enclosing* instance).',
      },
      {
        kind: 'note',
        title: 'What a lambda compiles to',
        text: 'Not an anonymous class: `invokedynamic` creates the implementation at first call, typically cheaper and JIT-friendly. Stateless lambdas are usually a shared singleton; capturing ones allocate. Details matter only in the hottest paths ([[language-performance]]).',
        detail: 'The `invokedynamic` bootstrap defers the actual implementation strategy to runtime, which is why the JDK has been able to change how lambdas are realized under the hood across releases without recompiling any code that uses them — an anonymous class, by contrast, bakes its strategy into a real `.class` file at compile time.',
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
      {
        text: 'Five kinds: static, bound instance, unbound instance, constructor, array constructor',
        detail: 'The "kind" is really about where the receiver comes from: static references have none, bound references fix it to a specific object at the point the reference is written, unbound references take it as the lambda\'s first argument, and constructor/array-constructor references synthesize a new instance instead of invoking a method on one.',
      },
      {
        text: '`ClassName::instanceMethod` — the **first** lambda argument becomes the receiver',
        detail: 'This is the form that trips people up: `String::toLowerCase` isn\'t "call toLowerCase with no receiver" — it desugars to `(String s) -> s.toLowerCase()`, where the stream element itself supplies the receiver. Any additional lambda parameters become the method\'s actual arguments.',
      },
      {
        text: '`expr::instanceMethod` captures the receiver now, calls later',
        detail: 'Because the receiver expression is evaluated once, at the point the method reference is created, `service::execute` behaves like an eagerly-bound callback to that specific `service` instance — reassigning the `service` variable afterward has no effect on a reference already created from it.',
      },
      {
        text: 'Prefer method references when shorter and clearer (EJ 43)',
        detail: 'The rule is about clarity, not brevity for its own sake — a method reference has no parameter names to help the reader, so when the mapping from arguments to the referenced method is not immediately obvious, an explicit lambda with named parameters is the more readable choice even if it is longer.',
      },
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
        detail: 'This mirrors ordinary method-call evaluation order — `user.get()` in `user.get()::process` runs exactly once, at reference-creation time, the same as any other Java expression evaluated eagerly. The lambda form differs only because the whole expression is wrapped in a new lambda body, deferring *all* of it, receiver included, to call time.',
      },
      {
        kind: 'bestPractice',
        title: 'EJ Item 43, with its own caveat',
        text: '"Prefer method references to lambdas" — *where they are shorter and clearer*. `service::execute` beats `x -> service.execute(x)`. But `() -> action()` inside the same class beats `TheEnclosingClassName::action`, and an explicit lambda beats a puzzling reference.',
        detail: 'The caveat matters because a method reference to a method in the *same* class you\'re writing forces the reader to go find that method to understand the reference, whereas `() -> action()` is self-evidently "call the local method action" without a name lookup — locality of reference beats raw brevity.',
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
      {
        text: 'Six core shapes: `Function<T,R>`, `Predicate<T>`, `Consumer<T>`, `Supplier<T>`, `UnaryOperator<T>`, `BinaryOperator<T>`',
        detail: 'Every one of the roughly 43 interfaces in `java.util.function` is a variation on these six shapes — arity (unary vs binary), whether it returns a value, and primitive specialization. Learning the six lets you predict the name of almost any variant you need (`BiFunction`, `IntPredicate`, `ToLongBiFunction`, …) rather than memorizing the catalog.',
      },
      {
        text: 'Primitive specializations (`IntPredicate`, `LongFunction`…) avoid boxing — prefer them',
        detail: 'A generic `Function<Integer, Integer>` forces every value through an `Integer` object; `IntUnaryOperator` operates on a raw `int` the whole way through. In numeric-heavy pipelines this is the difference between streaming machine words and streaming pointer-chased heap objects — see [[primitive-streams]].',
      },
      {
        text: 'Composition: `f.andThen(g)`, `f.compose(g)`, `p.and(q).or(r)`, `p.negate()`',
        detail: '`andThen`/`compose` differ only in order: `f.andThen(g)` runs `f` then `g`, `f.compose(g)` runs `g` then `f` — the same distinction as mathematical function composition. Composing lets you build pipelines out of small, independently testable pieces before a single stream ever gets involved.',
      },
      {
        text: 'Write your own only with a compelling reason — then annotate `@FunctionalInterface`',
        detail: 'A hand-rolled functional interface can\'t compose with the rest of the ecosystem — nothing that expects `Function<T,R>` will accept your `PathToStringMapper`. `@FunctionalInterface` is worth adding once you do write one: it makes the compiler enforce the single-abstract-method contract instead of silently allowing it to drift as the interface evolves.',
      },
      {
        text: '`Comparator` is the star example of a custom functional interface that earns its keep',
        detail: 'It passes every test for justifying a custom interface: it is used constantly, benefits enormously from a descriptive name over a bare `BiFunction<T,T,Integer>`, carries a real contract (consistency, transitivity), and its ecosystem of default methods (`thenComparing`, `reversed`) would make no sense bolted onto a generic type.',
      },
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
        detail: 'The exception test is deliberately strict, because most "I need my own functional interface" impulses fail at least one criterion — usually the interface would only be used in one or two places, which is exactly when a generic `Function`/`BiFunction` composes better than a bespoke type nobody else\'s code understands.',
      },
      {
        kind: 'pitfall',
        title: 'Boxing through the generic forms',
        text: '`Function<Integer, Integer>` boxes every value through the pipeline. In numeric hot paths use `IntUnaryOperator`, `IntPredicate`, `ToIntFunction` — the same reason [[primitive-streams]] exist. Don\'t overload methods across functional-interface parameter types either; it forces casts at call sites (EJ 52).',
        detail: 'The rule against overloading across functional-interface parameter types exists because the compiler resolves an overload by the lambda\'s *inferred target type*, and when two overloads are both plausible targets, callers get ambiguous-method compile errors or, worse, silently pick the wrong overload and eat a cast.',
      },
      {
        kind: 'note',
        title: 'Checked exceptions don\'t fit',
        text: 'None of the standard interfaces declare checked exceptions — a lambda throwing `IOException` won\'t fit a `Function`. Options: wrap in an unchecked exception, write a small `ThrowingFunction` adapter, or restructure so I/O happens outside the lambda. A perennial friction point with [[exception-hierarchy|checked exceptions]].',
        detail: 'This is a deliberate design gap, not an oversight — a `Function<T,R>` used inside a stream has no way to propagate a checked exception up through `map`/`filter`, since the stream machinery itself declares no checked exceptions on its own methods. Wrapping in an unchecked exception is usually the least-worst option because it at least lets the failure escape the pipeline.',
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
      {
        text: 'Anatomy: source (`stream()`, `Stream.of`, `Files.lines`…) → intermediate ops → terminal op',
        detail: 'Nothing runs until the terminal operation is invoked — building a stream and chaining `.filter()`/`.map()` onto it does no work at all, it just assembles a description of the pipeline that the terminal operation executes in one pass.',
      },
      {
        text: 'Intermediate ops are **lazy**; the terminal op triggers a single fused pass',
        detail: '"Fused" is the key word: rather than materializing an intermediate list after each `filter` or `map`, the runtime pulls one element at a time through *every* stage before moving to the next element — this is why an infinite `Stream.iterate` combined with `limit` still terminates, instead of trying to filter an infinite list first.',
      },
      {
        text: 'A stream never modifies its source; it is single-use — consume once',
        detail: 'A stream is better thought of as a live, one-shot iterator over a computation than as a container — once a terminal operation has pulled everything through it, there is nothing left to pull, and a second terminal call throws rather than silently returning nothing.',
      },
      {
        text: 'Prefer streams where they clarify; loops where they don\'t (EJ 45)',
        detail: 'Streams lose access to the enclosing method\'s control flow — you cannot `break`, `continue`, or `return` from the enclosing method, or throw a checked exception from inside a lambda — so tasks that fundamentally need those are usually clearer, not just easier, as a loop.',
      },
      {
        text: 'Streams of unbounded sources work because of laziness + short-circuit ops (`limit`, `findFirst`)',
        detail: 'A short-circuiting operation like `limit` or `findFirst` tells the pipeline machinery it can stop pulling elements early — combined with laziness, this is what makes `Stream.generate(Math::random).limit(5)` finite even though the source itself never ends.',
      },
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
        detail: 'The exception message is literal: once "operated upon or closed," the stream\'s internal state machine has moved past the point where it can replay elements. This is analogous to calling `next()` on an already-exhausted `Iterator` — the fix is the same too: build a fresh stream from the source rather than trying to reuse the old one.',
      },
      {
        kind: 'bestPractice',
        title: 'Use streams judiciously (EJ Item 45)',
        text: 'Streams excel at transform/filter/aggregate chains. Loops win when you need: mutation of locals, early return from the enclosing method, checked exceptions, or access to *both* a value and its derived value across stages (streams lose earlier pipeline values). Bloch\'s heuristic: refactor to streams only when it makes the code **clearer** — and name your lambda parameters well.',
        detail: '"Access to both a value and its derived value across stages" is the subtle one: once you `.map()` a value away, the original is gone from the pipeline unless you explicitly carry it forward (e.g. in a record or an array), whereas a loop always has every prior local variable still in scope.',
      },
      {
        kind: 'note',
        title: 'Side-effect-free by design (EJ Item 46)',
        text: 'Pipeline lambdas should be pure functions of their input. A `forEach` that accumulates into a shared list is a for-loop wearing a costume — and it breaks under [[parallel-streams|parallelism]]. Accumulation is the collector\'s job ([[collectors]]).',
        detail: 'The reason this matters beyond style: a `forEach` that mutates shared state works by accident under sequential execution, but the exact same code silently corrupts data or loses elements the moment `.parallel()` is added, because nothing in the pipeline\'s contract synchronized that access.',
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
      {
        text: '`map` transforms 1→1; `flatMap` transforms 1→many and flattens; `mapMulti` (Java 16) is its imperative sibling',
        detail: '`flatMap` exists because `map`ping each element to its own stream would leave you with a `Stream<Stream<T>>` — a stream of streams is rarely what you want, so `flatMap` takes that extra step and flattens it back to one level. `mapMulti` avoids the intermediate stream allocation entirely by pushing zero-or-more values via a callback instead.',
      },
      {
        text: '`takeWhile`/`dropWhile` (Java 9) cut ordered streams at a condition',
        detail: 'Unlike `filter`, which tests *every* element, `takeWhile` stops at the first element that fails the predicate and never looks further — on an ordered, sorted-by-relevance stream that is a genuine short-circuit, whereas the equivalent `filter` would needlessly test every remaining element.',
      },
      {
        text: '`anyMatch`/`allMatch`/`noneMatch` and `findFirst`/`findAny` **short-circuit**',
        detail: 'Short-circuiting means the pipeline can stop pulling elements the moment the answer is known — `anyMatch` returns as soon as one element passes; it does not need to see the rest of a million-element stream to answer "yes."',
      },
      {
        text: '`reduce` folds with an associative operation; `collect` builds containers',
        detail: 'The distinction is about what kind of result you\'re producing: `reduce` combines elements into a single value using an operation that must not care about grouping order (associativity is what makes it safe to run in parallel), while `collect` accumulates into a mutable container via a `Collector` recipe — see [[collectors]].',
      },
      {
        text: '`sorted`, `distinct` are stateful — they buffer; keep them late and rare',
        detail: 'Both operations need to see the *entire* stream before they can produce their first output element — `sorted` cannot know an element is in its final position until everything after it has been compared, breaking the "process one element at a time" model that makes most stream stages cheap.',
      },
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
        detail: 'The whole point of these terminals returning `Optional` is to force the empty case into the type signature so it cannot be silently ignored — calling `.get()` unconditionally throws that protection away and reintroduces exactly the same crash-on-missing-value risk that returning `Optional` was meant to prevent.',
      },
      {
        kind: 'pitfall',
        title: 'Ordering semantics of peek/forEach',
        text: '`peek` exists for debugging; relying on it for side effects couples you to evaluation order and element traversal you don\'t control (elements skipped by `limit` are never peeked). On parallel streams, `forEach` ignores encounter order — use `forEachOrdered` if order matters.',
        detail: '`peek` was designed purely as a debugging aid — the JVM is explicitly permitted to skip calling it for elements a downstream short-circuiting operation (like `limit`) never actually needs, so counting on it for a side effect that must always happen is relying on unspecified behavior.',
      },
      {
        kind: 'note',
        title: 'toList() vs collect(toList())',
        text: 'Java 16\'s `stream.toList()` returns an **unmodifiable** list and is the preferred spelling; `collect(Collectors.toList())` returns a list of unspecified mutability (in practice ArrayList). Choose deliberately when downstream code mutates.',
        detail: 'The immutability of `stream.toList()`\'s result is intentional, matching the trend toward `List.of`-style truly-immutable collections — code that assumed `collect(Collectors.toList())`\'s mutability (e.g. calling `.add()` on the result afterward) will throw `UnsupportedOperationException` if blindly swapped to the shorter spelling.',
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
      {
        text: '`toMap(keyFn, valueFn)` throws on duplicate keys — pass a merge function when keys can repeat',
        detail: 'This is a deliberate safety default, not an oversight: silently keeping "whichever value happened to be seen last" for a duplicate key would hide a data-modeling bug, so `toMap` fails loudly unless you explicitly supply a merge function telling it how to resolve the collision.',
      },
      {
        text: '`groupingBy(classifier)` → `Map<K, List<T>>`; add a downstream collector to aggregate per group',
        detail: 'Without a downstream collector, `groupingBy` defaults to collecting each group into a `List` — supplying `counting()`, `summingInt(...)`, or another collector as the second argument changes what each group\'s *value* looks like without changing how the grouping itself works.',
      },
      {
        text: '`partitioningBy(predicate)` → `Map<Boolean, …>` with exactly two entries',
        detail: 'Unlike `groupingBy`, which may produce anywhere from zero to many keys depending on what values actually appear, `partitioningBy` always produces exactly two entries — `true` and `false` — even if every element fell into just one bucket, because the classifier is a `boolean`, not an arbitrary key.',
      },
      {
        text: 'Downstream combinators: `counting`, `summingInt`, `mapping`, `filtering`, `collectingAndThen`',
        detail: 'These compose the same way stream operations do — `mapping` lets a downstream collector operate on a *transformed* view of each group\'s elements without a separate pass, and `collectingAndThen` wraps a finished collector\'s result through one more function (e.g. sealing a list immutable).',
      },
      {
        text: '`joining(", ", "[", "]")` for delimited strings',
        detail: 'The three-argument form adds a prefix and suffix around the whole joined result (`[a, b, c]`), while the one-argument form only supplies the delimiter between elements — reach for `StringBuilder` directly only when you need logic more complex than delimiter/prefix/suffix.',
      },
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
        detail: 'Both failure modes trace back to the same root cause: `toMap` is built on top of `HashMap`, which throws on a `put` of a null value via `merge` internally — so if your value-mapping function can legitimately produce null, `toMap` is the wrong collector, not just a collector that needs extra care.',
      },
      {
        kind: 'note',
        title: 'Custom collectors',
        text: '`Collector.of(supplier, accumulator, combiner, finisher)` when the built-ins don\'t fit. The combiner must correctly merge two partial containers — that\'s what makes the collector parallel-ready ([[parallel-streams]]).',
        detail: 'The combiner argument is what most people get wrong writing a custom collector by hand: in sequential use it is never called, so a broken combiner will pass every test until the exact day someone runs the same collector over a parallel stream and partial results silently merge incorrectly.',
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
      {
        text: 'Boxed `Stream<Integer>` costs an object per value; `IntStream` streams bare ints',
        detail: 'Every `Integer` outside the cached −128…127 range is a separate heap allocation with its own object header — over a million-element pipeline that is a million extra allocations and a million extra pointer dereferences compared to a primitive stream operating on unboxed machine words.',
      },
      {
        text: 'Bridges: `mapToInt` / `mapToObj` / `boxed` / `asDoubleStream`',
        detail: 'These exist because a stream cannot silently switch its element type mid-pipeline — moving from `Stream<String>` to `IntStream` (or back) requires an explicit bridging call that tells the compiler exactly which specialization to produce next.',
      },
      {
        text: '`IntStream.range(0, n)` (exclusive) / `rangeClosed(1, n)` replace index loops',
        detail: 'The naming mirrors `for (int i = 0; i < n; i++)` vs `for (int i = 1; i <= n; i++)` — `range` is exclusive of its upper bound the same way a classic index loop\'s condition is, while `rangeClosed` is the one to reach for when you want both endpoints inclusive, like 1-based counting.',
      },
      {
        text: '`chars()` on String, `Random.ints()`, `Arrays.stream(int[])` are primitive sources',
        detail: 'Notice these all come from APIs whose natural element type is already a primitive — `String` is UTF-16 `char`s underneath, `int[]` is already unboxed — so returning a primitive stream avoids a pointless box-then-unbox round trip the object-stream API would otherwise force.',
      },
      {
        text: 'The specializations exist because erasure forbids `Stream<int>` ([[generics-restrictions]])',
        detail: 'Generics in Java are implemented via type erasure, and a primitive `int` cannot stand in for a type parameter `T` — there is no "generic over int" the way C++ templates allow. The primitive stream types are hand-written classes that sidestep the generic machinery entirely rather than a workaround bolted onto `Stream<T>`.',
      },
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
        detail: 'The compiler will not warn you here — `map` and `mapToInt` are both perfectly valid calls with different return types, so a one-letter typo compiles cleanly and only shows up as a performance regression under profiling, not as an error.',
      },
      {
        kind: 'note',
        title: 'Different Optionals, different terminals',
        text: 'Primitive streams return `OptionalInt`/`OptionalLong`/`OptionalDouble` (with `getAsInt`, not `get`), and their `sum`/`average`/`min`/`max` come built-in — no comparator dance. `average()` on an empty stream is an empty OptionalDouble, not NaN.',
        detail: 'These primitive-specific Optionals exist for the same reason the streams do — avoiding boxing the result of `average()` or `max()` — but it means `OptionalInt` and `Optional<Integer>` are not interchangeable types, so code that generically handles "an optional value" needs a separate code path for each.',
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
      {
        text: 'Parallel wins need: many elements × costly-per-element × splittable source × no shared state',
        detail: 'Every one of these four conditions is necessary, not just helpful — drop any single one (too few elements, cheap-per-element work, a source that resists splitting like a linked list, or any shared mutable state) and the overhead of coordinating threads outweighs, or actively breaks, the parallel version.',
      },
      {
        text: 'Best sources: arrays, `ArrayList`, `IntStream.range` — cheap to split; `iterate` and `limit` are poison',
        detail: 'A `Spliterator` needs to divide the source into roughly equal halves in close to O(1) time — an array or `ArrayList` can be split by index instantly, while `Stream.iterate` has no known size and no random access, so the runtime cannot pre-plan a balanced split at all.',
      },
      {
        text: 'All pipeline functions must be thread-safe and side-effect-free',
        detail: 'This is the same requirement sequential streams have (EJ Item 46) — parallel execution simply exposes violations of it immediately and visibly (races, corrupted collections) instead of letting them pass unnoticed the way a sequential run always would.',
      },
      {
        text: 'Ordering constraints (`findFirst`, `forEachOrdered`) sacrifice speedup; `findAny` doesn\'t',
        detail: 'Preserving encounter order forces worker threads to coordinate on *which* result "comes first" even though they finished their chunks in an arbitrary order — `findAny`/unordered `forEach` let whichever thread finishes first report immediately, which is the entire point of running in parallel.',
      },
      {
        text: 'Everything shares the common FJ pool — one blocked parallel stream starves the JVM\'s others',
        detail: 'Unless you go out of your way to submit into a custom `ForkJoinPool`, every parallel stream (and the default `CompletableFuture` async methods) draws worker threads from the same JVM-wide pool — a long-blocking task in one parallel stream can starve unrelated parallel work elsewhere in the same process.',
      },
      {
        text: '**Measure before and after** — never assume parallel is faster',
        detail: 'The N×Q heuristic in the note below is a starting estimate, not a guarantee — actual speedup depends on core count, JIT warmup, GC pressure from the extra allocations parallel machinery introduces, and the specific merge cost of your collector, all of which only a real benchmark on real hardware will reveal.',
      },
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
        detail: 'This fails specifically because `ArrayList` is not thread-safe — concurrent `add()` calls from multiple worker threads can interleave their internal array-resize logic, producing lost writes or an exception, whereas a `Collector`\'s per-thread accumulation and safe merge step is designed from the ground up for exactly this concurrent scenario.',
      },
      {
        kind: 'paragraph',
        text: 'Rules of thumb from the performance books: below ~10,000 cheap elements, splitting overhead eats the gain (the old N×Q heuristic — element count × per-element cost should exceed ~100k "units"). Merge cost matters too: `groupingBy` into maps merges expensively in parallel — `groupingByConcurrent` exists for that. And benchmark with [[microbenchmarking|JMH]], not wall-clock printlns.',
      },
      {
        kind: 'note',
        title: 'Ordering and determinism',
        text: 'Reductions with associative operators give identical results parallel or not. Side-effect order does not: `forEach` visits in whatever order threads reach elements. If output order matters, keep the pipeline pure and let `collect`/`toList` preserve encounter order — that\'s free.',
        detail: 'This is why `reduce` is required to be associative in the first place — an associative combination gives the same final answer no matter what order the chunks were combined in, which is precisely the property that makes it safe to parallelize without changing the result.',
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
      {
        text: 'Purpose: API honesty — callers must consciously handle absence (EJ 55)',
        detail: 'A `null` return is invisible in a method signature — nothing forces a caller to even consider the absent case — while `Optional<T>` makes "there might be nothing here" part of the type itself, so ignoring it requires an active, visible choice (an unguarded `.get()`) rather than a passive oversight.',
      },
      {
        text: 'Consume with `orElse`, `orElseGet(supplier)`, `orElseThrow`, `ifPresent`, `map`',
        detail: 'Each of these encodes a different way of handling absence without ever calling `.get()` directly — `orElse` supplies a default value, `orElseGet` supplies it lazily via a supplier, `orElseThrow` converts absence into a specific exception, and `map`/`ifPresent` let you act on the value only when it exists.',
      },
      {
        text: 'Never `isPresent()` + `get()` when a functional form exists',
        detail: 'The two-step form reintroduces the exact bug Optional exists to prevent — nothing stops a future edit from adding code between the `isPresent()` check and the `get()` call that invalidates the assumption, whereas `map`/`orElse` make that gap impossible to introduce by construction.',
      },
      {
        text: 'Don\'t wrap collections in Optional — return the empty collection',
        detail: 'A collection already has a built-in "nothing here" representation — the empty collection — that every caller already knows how to handle via a for-each loop or `.isEmpty()`; wrapping it in `Optional<List<T>>` just adds a second, redundant layer of absence-checking on top of the first.',
      },
      {
        text: 'Skip Optional for performance-critical returns and for fields (use null + discipline there)',
        detail: 'Every `Optional` returned is an allocation, which matters in a hot getter called millions of times per second; as a field, it adds a permanent extra layer of indirection to reach the actual value while the field reference itself can still be null, so it does not even remove the null-check burden it was meant to solve.',
      },
      {
        text: '`Optional.stream()` bridges into stream pipelines',
        detail: 'This is what turns "a stream of possibly-missing values" into "a stream of only the present ones" in one step: `.map(repo::findOrder).flatMap(Optional::stream)` treats each `Optional` as a stream of zero or one elements, so `flatMap` naturally drops the empty ones — see [[stream-operations]].',
      },
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
        detail: 'Each of the "do not" cases has the same underlying reason: `Optional` adds a wrapper layer whose only job is signaling absence at an API boundary — inside a class, on a field, or in a parameter, that signaling is either redundant (the caller already controls whether to pass something) or actively unhelpful (it doesn\'t remove nullability, it just adds ceremony around it).',
      },
      {
        kind: 'pitfall',
        title: 'Optional.get() and optional-of-null',
        text: 'Bare `get()` on an empty Optional throws `NoSuchElementException` — you\'ve traded an NPE for an equally uninformative crash. And `Optional.of(null)` NPEs immediately; use `ofNullable` when the input may be null. An `Optional` variable that is *itself* null is a firing offense.',
        detail: '`Optional.of(null)` throwing immediately, rather than silently producing an empty Optional, is deliberate — it forces you to be explicit about intent at the call site: use `ofNullable` when the value genuinely might be null, so that an accidental null never masquerades as a real, present value.',
      },
      {
        kind: 'note',
        title: 'Cost model',
        text: 'Every Optional is an allocation (though escape analysis often removes short-lived ones — [[jit-compilation]]). In tight loops or hot getters, a nullable return with a documented contract remains legitimate. Optional\'s value is at API boundaries, not inside private plumbing.',
        detail: 'Escape analysis lets the JIT allocate short-lived, non-escaping Optionals on the stack (or eliminate them entirely) rather than the heap, but that optimization is not guaranteed — in code paths hot enough and complex enough to defeat it, a well-documented nullable return can still be the pragmatically faster choice.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 1.7 — The Optional Type' },
      { book: 'effective-java', chapter: 'Item 55' },
    ],
    related: ['stream-operations', 'exception-best-practices', 'classes-objects'],
  },
]
