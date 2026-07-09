import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'release-cadence',
    domainId: 'modern',
    title: 'Release Cadence & Versions',
    summary:
      'Since Java 9, a feature release ships every six months, with an LTS every two years (11, 17, 21, 25). Features arrive as previews first, ecosystems target LTS, and "Java is stagnant" died in 2017.',
    keyPoints: [
      {
        text: 'Two releases per year (March/September); LTS every 2 years — 21 (2023) and 25 (2025) are current targets',
        detail: 'The six-month train means a feature either makes it in cooked or waits for the next train — no more "held hostage" five-year releases. LTS designation is a vendor-support decision, not a language one: any release could in principle be supported long-term, but the ecosystem coordinated around 8/11/17/21/25 as the safe upgrade rungs, so tooling, frameworks, and enterprises target those specifically.',
      },
      {
        text: 'Preview features need `--enable-preview` and can change; incubator APIs likewise',
        detail: 'A preview feature compiles to a real class file, but it is stamped with a minor-version marker that only a JVM run with `--enable-preview` (of the *same* major version) will load — this stops preview bytecode from silently leaking into production runtimes that lack the flag. Incubator APIs (like the old Vector API modules) are separate module namespaces still allowed to break signature-incompatibly between releases, unlike preview language features which are usually closer to final.',
      },
      {
        text: 'Landmark drops: 8 lambdas/streams; 9 modules; 11 HttpClient + LTS; 17 sealed; 21 virtual threads + pattern matching',
        detail: 'Each of these is "landmark" because it changed idiomatic style, not just added an API: 8 made functional-style collection processing normal, 9 forced the ecosystem to reckon with strong encapsulation, 11 made a synchronous `HttpURLConnection` feel legacy overnight, and 17/21 together made data-oriented "closed hierarchy + exhaustive switch" a first-class alternative to the visitor pattern.',
      },
      {
        text: 'Upgrading LTS→LTS is the mainstream path; each skip accumulates real performance/GC wins for free',
        detail: 'Non-LTS releases are not experimental — they are fully supported until the next release ships — but most orgs skip them anyway because paying for support/testing every six months is not worth it when nothing forces the upgrade. Because GC and JIT improvements are baked into the runtime rather than opt-in APIs, an app that recompiles for 21 straight from 8 gets a decade of generational-GC and compiler work with zero source changes.',
      },
      {
        text: 'The `--release N` flag compiles against N\'s API — safer than source/target alone',
        detail: 'The old `-source 8 -target 8` combo only controls language syntax and bytecode version — it does not swap out which JDK API signatures the compiler sees, so code compiled with a Java 21 javac using `-source 8` could still accidentally call a method added in Java 11 and only fail at runtime on an actual Java 8 JVM. `--release 8` additionally loads Java 8\'s exact API surface (via bundled symbol data) so that mistake becomes a compile error instead.',
      },
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
        detail: 'All of these compile from the same OpenJDK source under the same TCK-verified spec, so `java -version` differences aside, the language and standard library behave identically across distributions — what actually differs is who backports security patches, for how long, and whether you pay for support. The choice is a procurement/ops decision (who do we call at 2am), not a technical one.',
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
      {
        text: 'Locals with initializers only — no fields, parameters, or return types',
        detail: 'The restriction is deliberate: a field, parameter, or return type is part of a class\'s public contract, read by callers who never see the initializer — inferring it there would mean the API signature depends on implementation detail. A local variable is visible only within its own method body, where the initializer sits right next to the declaration.',
      },
      {
        text: 'The inferred type is fixed at compile time; `var` is not `dynamic`',
        detail: 'This is the single most common misunderstanding for people coming from JavaScript or Python: `var x = 5` in Java is exactly as statically typed as `int x = 5` — the compiler writes the concrete type into the bytecode, and reassigning `x` to a `String` later is a compile error, identical to what would happen if you had spelled out `int` explicitly.',
      },
      {
        text: '`var map = new HashMap<String, List<Order>>()` removes pure noise',
        detail: 'The right-hand side already names the concrete type in full — repeating `HashMap<String, List<Order>>` on the left adds zero information a reader could not already get from the constructor call. This is the case `var` was designed for: noise reduction with no comprehension cost, as opposed to a method call whose return type is not obvious from its name.',
      },
      {
        text: 'With diamond both sides can\'t infer: `var list = new ArrayList<>()` is `ArrayList<Object>`',
        detail: 'Normally `List<String> list = new ArrayList<>()` lets the diamond `<>` borrow its type argument from the declared left-hand type. With `var`, there is no declared left-hand type to borrow from — both sides are simultaneously trying to infer from each other — so the compiler falls back to inferring `Object`, silently producing an `ArrayList<Object>` instead of the `ArrayList<String>` you probably meant.',
      },
      {
        text: 'Style rule: use `var` when the right-hand side names the type or the variable name carries it',
        detail: 'The failure mode to avoid is a declaration where neither the variable name nor the initializer tells the reader the type without extra lookup — e.g. `var result = service.process(data)` forces opening `process()` just to know what you are holding. `var users = new HashMap<...>()` or `var out = new ByteArrayOutputStream()` are safe because the constructor call already names the type.',
      },
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
        detail: 'A bare lambda or method reference has no type on its own — `Runnable r = () -> {}` works because `Runnable` tells the compiler which functional interface to implement, but `var r = () -> {}` gives the compiler nothing to infer against, so it is a compile error. The same logic applies to `null`: `var x = null` cannot pick a type, since `null` is compatible with every reference type equally.',
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
      {
        text: '`if (o instanceof String s)` — test, cast, and bind in one step',
        detail: 'Before Java 16 this was always three separate steps: `if (o instanceof String) { String s = (String) o; ... }` — a check, then a redundant cast the compiler could have proven safe already, then a binding. Pattern matching collapses all three because the compiler already knows `o` is a `String` at the point `instanceof` succeeded; `s` is just naming what it already proved.',
      },
      {
        text: 'Switch expressions yield values; arrow arms don\'t fall through',
        detail: 'Classic `switch` statements are actions with accidental fallthrough as a footgun-by-default; switch *expressions* (the `->` form) are the opposite on both counts — each arm produces a value via implicit yield (or explicit `yield` for a block body), and one arm never silently continues into the next, removing the single most common switch bug (a forgotten `break`).',
      },
      {
        text: 'Type patterns in switch: `case Integer i ->`; guards: `case String s when s.length() > 3 ->`',
        detail: 'A bare type pattern only tests the selector\'s runtime type; a `when` guard adds an arbitrary boolean condition evaluated only after the type matches, letting you split "is a String" from "is a String I actually care about" without nesting an `if` inside the arm.',
      },
      {
        text: 'Record patterns deconstruct: `case Point(int x, int y) ->` — nested patterns too',
        detail: 'Because a record\'s components are public and fixed by its canonical constructor, the compiler can safely pull them apart without a getter call for each — `case Rect(Point(var x1, var y1), Point(var x2, var y2))` reaches two levels deep into a `Rect` in one pattern, which is exactly the kind of tree-shaped destructuring that used to need multiple manual `.get()` chains.',
      },
      {
        text: 'Sealed hierarchies + no default = compiler-checked **exhaustiveness**',
        detail: 'The compiler can only prove a switch handles every case if it knows the complete set of subtypes in advance — that is precisely what `sealed` provides ([[sealed-types-overview]]). Add a new permitted subtype later and every switch over that sealed type that lacks a `default` now fails to compile until updated, turning a runtime gap into a build-time forcing function.',
      },
      {
        text: '`case null` is now expressible; without it, switch still NPEs on null selectors',
        detail: 'Historically `switch (o)` threw `NullPointerException` immediately if `o` was null, before any case was even considered — a surprise for anyone used to `if`/`else` chains handling null explicitly. `case null ->` lets you handle that case like any other; omit it and the old NPE-on-null behavior is preserved for backward compatibility, it does not silently match `default`.',
      },
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
        detail: '"Flow scoping" means the compiler tracks exactly which paths through the code are guaranteed to have matched — after `if (!(o instanceof String s)) return;`, every line after that `if` can only be reached when the negation is false, i.e. when `o instanceof String` was true, so `s` is provably bound there even though it looks like it is outside the `if`\'s braces. Dominance is a straightforward exhaustiveness safeguard: if a broader pattern were allowed to match first, the more specific case after it could never be reached, which is almost certainly a bug, so the compiler rejects it outright.',
      },
      {
        kind: 'note',
        title: 'Old switch survives',
        text: 'Statement switches with `:` labels and fallthrough remain legal — treat them as legacy ([[control-flow]]). New code: arrow form always; expression form whenever a value is produced; patterns when dispatching on type structure.',
        detail: 'Nothing about pattern matching or switch expressions deprecates the classic colon-and-fallthrough form — it is unambiguous, established syntax that a huge amount of existing code depends on, so removing it would break the world for no benefit. The guidance is purely about new code: there is no longer a reason to reach for the old form unless you are intentionally relying on fallthrough.',
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
      {
        text: 'Open with `"""` + newline; close alignment controls indentation stripping',
        detail: 'Requiring a newline right after the opening `"""` is deliberate — it forces the content itself to start on its own line, so the compiler has a clean, unambiguous block of lines to run the indentation-stripping algorithm over, rather than having to special-case whatever trailing text sat on the opening delimiter\'s line.',
      },
      {
        text: 'The closing delimiter\'s column sets the left margin — move it to control indentation',
        detail: 'The compiler computes the minimum indentation across every line of the block, including the line the closing `"""` sits on, and strips exactly that much from all of them. Indenting the closing delimiter further right than the content effectively caps how much gets stripped, which is the lever you use to preserve (or remove) leading whitespace in the final string.',
      },
      {
        text: '`\\` at line end joins lines (no newline); `\\s` keeps trailing spaces',
        detail: 'These two escapes exist because text blocks otherwise strip exactly what editors already strip — trailing spaces and the concept of "no newline here" — so without them there would be no way to represent a genuinely long single line wrapped for readability in source, or content that truly needs trailing whitespace preserved (e.g. some fixed-width formats).',
      },
      {
        text: 'Quotes inside need no escaping; `\\n`, `\\t` still work if wanted',
        detail: 'A single or double quote only needs escaping in a text block if it would otherwise be mistaken for part of the `"""` delimiter sequence (e.g. three quotes in a row) — ordinary embedded JSON or HTML full of `"` characters reads exactly as the source you would paste in, which is the entire point of the feature.',
      },
      {
        text: 'It\'s still a `String` — same type, same methods, interning included',
        detail: 'A text block is purely a source-level syntax for writing a string literal — after compilation there is no distinct "text block" type or runtime representation, so it participates in constant-pool interning, `.equals()`, and every `String` method exactly like a quoted literal would. The only thing that changed is how convenient it is to write the content.',
      },
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
        detail: 'This bites people who paste in fixed-width text (like a table or an ASCII diagram) expecting the whitespace to survive verbatim — a whole column of trailing padding can quietly disappear, and the bug only shows up when the output is compared byte-for-byte against something else, not when eyeballed in a terminal.',
      },
      {
        kind: 'note',
        title: 'Where they earn their keep',
        text: 'SQL in [[jdbc-database|JDBC]]/repositories, JSON fixtures in tests, HTML fragments, scripts passed to `ProcessBuilder` — anywhere the old escape-and-concatenate style hid the actual content. Syntax inside is still just text: no checking, no injection safety ([[jdbc-database|use parameters]]).',
        detail: 'The common thread across all these use cases is embedding a *foreign* language inside Java source — the old `"..." + "\\n" + "..."` style forced you to mentally reconstruct the actual SQL or JSON from a wall of escapes, while a text block lets you paste it in exactly as it would look in a `.sql` or `.json` file, readable at a glance by anyone who knows that other language.',
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
      {
        text: '`sealed interface X permits A, B, C` — only A, B, C may implement X',
        detail: 'This is enforced by the compiler at the declaration site of any other class — a fourth type trying to `implements X` from outside the `permits` list simply fails to compile, no matter what module or package it lives in. The closure is a property of `X` itself, not something callers or implementers can opt out of.',
      },
      {
        text: 'Every permitted subtype must be `final`, `sealed` (continuing the closure), or `non-sealed` (reopening)',
        detail: 'This rule closes a loophole that would otherwise defeat the whole feature: if a permitted subtype were allowed to be freely extensible, the "complete set of cases" the sealed interface promises would only be complete one level down, and any switch relying on exhaustiveness could still miss an unknown grand-subtype. Every permitted type must explicitly declare which of the three closure states it continues.',
      },
      {
        text: 'Same-file subtypes can omit `permits`; otherwise same module/package',
        detail: 'The `permits` clause is only there to tell the compiler (and a reader) where to *look* for the full set of subtypes — if everything already lives in one file, the compiler can just scan that file itself and infer the list, so spelling it out would be redundant. Once subtypes are scattered across separate files, there is no such shortcut and the list must be explicit.',
      },
      {
        text: 'Pairs with [[records]] for data variants and [[switch-expressions-pattern-matching|pattern switches]] for processing',
        detail: 'Sealed types describe the *shape* of a closed set of alternatives; records give each alternative a concrete, transparent data representation; pattern switches are how you consume that combination exhaustively. None of the three is very useful alone — together they are Java\'s answer to algebraic data types from functional languages.',
      },
      {
        text: 'Use when the set of variants is a **domain fact**, not an extension point',
        detail: 'The test is whether adding a new variant later should be a deliberate, reviewed decision that touches every place the type is processed (seal it), or something a third party should be free to do without your involvement (leave it open, or use a plain interface). Sealing something that genuinely needed third-party extensibility just relocates the pain to "now no one outside your module can implement this."',
      },
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
        detail: 'This matters because the compile-time guarantee alone would be incomplete: separately-compiled bytecode (a hand-crafted `.class` file, or one compiled against an old version of the sealed interface) could otherwise claim to implement it without ever going through the compiler\'s check. Enforcing the permitted-subclasses list during class loading closes that gap at the one point every class must pass through regardless of how its bytecode was produced.',
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
      {
        text: '`StructuredTaskScope` forks subtasks and joins them as a unit — no orphaned threads',
        detail: 'A subtask forked inside a scope cannot outlive that scope — leaving the try-with-resources block guarantees every forked thread has either completed, failed, or been cancelled. Compare this to a raw `ExecutorService.submit()`, where nothing stops a caller from moving on while a submitted task keeps running unsupervised in the background.',
      },
      {
        text: 'Joiner policies: all-succeed-or-throw, first-success wins (`anySuccessful`), custom',
        detail: 'The joiner is what turns "a pile of concurrent subtasks" into a specific concurrency *pattern* — fan-out-and-wait-for-all, race-and-take-the-first, or a bespoke quorum/partial-results policy — all expressed as one composable object passed to `open()`, rather than hand-rolled coordination logic scattered through the calling code.',
      },
      {
        text: 'Failure of one subtask cancels the siblings — timeouts and errors stop wasted work',
        detail: 'Without this, a failed subtask in a fan-out would leave its siblings running to completion for no reason — burning CPU, holding connections open, doing work whose result will be discarded anyway once the scope reports failure. Automatic cancellation on first failure is what makes "all-succeed-or-throw" cheap to run instead of merely correct.',
      },
      {
        text: 'The task tree is visible in thread dumps — concurrency you can *see*',
        detail: 'Unstructured concurrency (raw executors, fire-and-forget tasks) produces a thread dump that is just a flat list — there is no way to tell which threads are logically related to which request. Because structured concurrency threads a parent-child relationship through every fork, a dump can show the whole call tree of a request, which is a debugging capability plain thread pools never had.',
      },
      {
        text: '`ScopedValue`: immutable, inheritance-friendly context — the ThreadLocal successor',
        detail: 'A `ThreadLocal` is mutable for the life of a thread and, on a pooled thread, can leak stale values into whatever runs next unless explicitly cleared. `ScopedValue` is bound only for the dynamic extent of one `run()` call, is immutable for that whole scope, and is automatically visible to any `StructuredTaskScope` forks started within it — no manual propagation, no leak between unrelated tasks.',
      },
      {
        text: 'Both finalized in Java 25 (previews through 21–24)',
        detail: 'The multi-release preview cycle (four rounds, 21 through 24) reflects how much the API shape changed based on real usage feedback before locking it down — `StructuredTaskScope`\'s factory methods and the joiner API in particular were reworked more than once, which is exactly why the app treats preview features as "test, don\'t deploy" until they are finalized.',
      },
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
        detail: '"Hedged requests" — firing the same request at two or three replicas and taking whichever answers first — is a classic tail-latency-reduction technique that used to require manually racing futures and cleaning up the losers yourself. `anySuccessful()` makes it a one-line joiner choice, with cancellation of the slower replicas handled automatically.',
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
      {
        text: '`Arena.ofConfined()`: single-thread scope; `ofShared()`: multi-thread; close frees everything at once',
        detail: 'The arena is the whole lifetime story in one object: every segment allocated from it is freed together the moment the arena closes, which is what gives FFM deterministic, GC-independent cleanup — the opposite of hoping a finalizer eventually runs. Confined vs shared is purely about which threads are allowed to touch the segments before that happens.',
      },
      {
        text: '`MemorySegment` is bounds-checked and lifetime-checked — use-after-free throws',
        detail: 'This is the direct answer to what made `sun.misc.Unsafe` so dangerous: an out-of-bounds access or a read after the backing memory was freed does not corrupt adjacent memory or crash the JVM silently, it throws a normal Java exception at the access site. Safety checks cost a branch per access, which the JIT typically optimizes away in hot loops once it proves the bounds statically.',
      },
      {
        text: '`MemoryLayout` describes C structs; `VarHandle`s read/write named fields',
        detail: 'Describing the layout up front (field names, sizes, padding, alignment) lets the API compute correct offsets for you instead of hand-calculating byte offsets into a struct — the same source of subtle bugs that plagued raw `Unsafe`/`ByteBuffer` struct mapping. The `VarHandle` per named field then reads/writes with the JIT treating it like any other field access.',
      },
      {
        text: 'Long-indexed (64-bit) addressing — past `ByteBuffer`\'s 2 GB limit',
        detail: '`ByteBuffer` was designed around an `int` position/limit/capacity, capping any single buffer at just under 2 GB — a real ceiling for memory-mapped files or large off-heap datasets on modern hardware. `MemorySegment` uses `long` offsets throughout, so a single segment can address memory sizes that were simply unreachable through the old API.',
      },
      {
        text: 'jextract turns `.h` headers into complete Java bindings',
        detail: 'Hand-writing FFM bindings for a non-trivial C library (correct layouts, function descriptors, downcall handles for every function you need) is tedious and error-prone; `jextract` parses the actual header file and generates all of that mechanically, so the Java binding\'s shape always matches the real C declarations instead of a manually-transcribed guess.',
      },
      {
        text: 'Replaces: JNI glue, `sun.misc.Unsafe` memory ops, direct-ByteBuffer lifecycle hacks',
        detail: 'All three of these were workarounds for gaps FFM closes directly: JNI required a separate C glue layer just to cross the language boundary, `Unsafe` gave unchecked raw memory access with zero safety net, and direct buffers had no real deterministic-free story, leaning on `Cleaner`/phantom references. FFM is a single, supported, safety-checked API covering what all three were separately hacking around.',
      },
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
        detail: 'Before this, getting SIMD-level performance out of Java meant hoping the JIT\'s auto-vectorizer recognized your loop shape, with no way to force it or verify it happened. The Vector API expresses the SIMD operation directly and portably, compiling down to whatever the running CPU actually supports (AVX on x86, NEON on ARM) — the same "portable but close to the hardware" bet FFM makes for memory.',
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
      {
        text: 'Valhalla: value classes flatten "objects" into their containers — arrays of points without pointer chasing',
        detail: 'Every object today carries identity — a header, a place in the heap, eligibility for locking — even a `Point` that only ever needs an x and a y. Value classes give up identity in exchange for the JVM being allowed to store them inline (in an array, in a field) instead of as a separate heap allocation reached through a pointer, closing much of the memory-density gap with C-style structs.',
      },
      {
        text: 'Leyden: ahead-of-time class loading/compilation in mainline JDK — CDS on steroids (JEP 483 shipped in 24)',
        detail: 'Class-Data Sharing (CDS) already let a JVM reuse a precomputed snapshot of loaded classes across runs; Leyden extends that idea further along the startup pipeline — caching not just loaded classes but linked state and eventually AOT-compiled code — aiming to close the gap with native-image startup times without giving up the dynamic JIT\'s peak throughput.',
      },
      {
        text: 'Amber pipeline: derived record creation (`with` expressions), stable values, pattern-matching extensions',
        detail: '`with` expressions solve the awkwardness of "updating" an immutable record today, which requires a full canonical-constructor call repeating every unchanged field. Stable values extend the "compute once, then treat as constant" idea beyond `static final` to lazily-initialized fields the JIT can still trust as constants once set.',
      },
      {
        text: 'Vector API finalizes when Valhalla\'s types land — SIMD without intrinsics',
        detail: 'The Vector API has stayed in incubation for years specifically because its ideal representation (a fixed-size vector of primitives, no per-element boxing or identity) is exactly what Valhalla\'s value types are built to provide — finalizing the Vector API before Valhalla lands would lock in a shape the JVM cannot yet store as efficiently as intended.',
      },
      {
        text: 'Babylon: code reflection for GPU/ML offload from Java source',
        detail: 'Ordinary reflection exposes a program\'s *structure* (classes, methods) at runtime; code reflection exposes the *code itself* — method bodies as an inspectable, transformable intermediate representation — which is what lets a library translate a chunk of ordinary Java code into a GPU kernel or an ML computation graph instead of just interpreting it on the CPU.',
      },
      {
        text: 'Follow JEPs, not rumors: openjdk.org/jeps is the source of truth',
        detail: 'Project umbrella names (Valhalla, Leyden, Amber) describe a research direction, not a shipped feature with a fixed date — the only reliable signal for "is this real and when" is the JEP process itself (Draft → Candidate → Targeted → Integrated), which is publicly tracked and far more current than any secondhand summary, including this one.',
      },
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
        detail: 'Each source serves a different purpose: JEPs are the authoritative, versioned specification of what is actually planned or shipped; Inside Java gives the engineering rationale and tradeoffs behind a JEP, useful context a bare spec does not carry; release notes are the ground truth for what is actually running in the JDK you installed, as opposed to what might land eventually.',
      },
    ],
    refs: [
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
      { book: 'optimizing-java', chapter: 'Ch. 15 — Java 9 and the Future' },
    ],
    related: ['release-cadence', 'ffm-api', 'memory-layout', 'virtual-threads'],
  },
]
