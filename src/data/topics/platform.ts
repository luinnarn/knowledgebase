import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'date-time-api',
    domainId: 'platform',
    title: 'The Date & Time API (java.time)',
    summary:
      'java.time models time correctly by separating concepts: `Instant` (machine time), `LocalDate/LocalTime/LocalDateTime` (human calendar, no zone), `ZonedDateTime` (zoned), `Duration` (machine spans) and `Period` (calendar spans). All immutable, all fluent.',
    keyPoints: [
      {
        text: '`Instant` = point on the timeline (UTC); `LocalDateTime` = wall-clock without zone; `ZonedDateTime` = both',
        detail: 'These are three different answers to "when": Instant is a machine-comparable point (nanoseconds since the epoch, no notion of "9am"), LocalDateTime is a calendar reading with no fixed point on the timeline (the same "9:00" happens once per zone per day), and ZonedDateTime pins a LocalDateTime to a specific zone\'s rules so it resolves to one real Instant. Picking the wrong one for the job is where most date bugs come from.',
      },
      {
        text: 'Store and exchange **Instant/UTC**; apply `ZoneId` only at presentation and business-rule edges',
        detail: 'A stored Instant never becomes ambiguous or invalid — it is a single point regardless of who reads it. Attaching a zone early (e.g. persisting a ZonedDateTime or, worse, a server-local LocalDateTime) bakes a presentation decision into the data model, so any later change of the zone, the server\'s timezone, or a user\'s locale requires reinterpreting stored values instead of just reformatting them.',
      },
      {
        text: '`Duration` counts seconds/nanos; `Period` counts years/months/days — DST makes them differ',
        detail: 'Duration is a fixed machine-time span (86400 seconds is always 86400 seconds); Period is a calendar span ("1 day") whose actual elapsed time varies — adding a Period of 1 day across a DST transition can be 23, 24, or 25 real hours. Use Duration for timeouts and measured elapsed time, Period for calendar-facing arithmetic like "renews in 1 month."',
      },
      {
        text: 'Formatting/parsing: `DateTimeFormatter` (immutable, thread-safe — unlike old `SimpleDateFormat`)',
        detail: 'SimpleDateFormat holds internal mutable Calendar state, so sharing one instance across threads corrupts concurrent parses/formats silently (no exception, just wrong dates) — the classic fix used to be ThreadLocal<SimpleDateFormat>. DateTimeFormatter has no mutable state at all, so a single static final instance is not just allowed but the idiomatic pattern.',
      },
      {
        text: 'Everything is immutable: `plusDays` returns a new object',
        detail: 'Every java.time type follows the same value-object discipline as String: mutator-looking methods (plusDays, withZoneSameInstant, minusHours) return a new instance and leave the receiver untouched. The classic bug this prevents — and the classic bug this causes if you forget it — is writing `date.plusDays(1);` as a statement and discarding the result.',
      },
      {
        text: 'Legacy bridges: `Date.toInstant()`, `Timestamp.toLocalDateTime()`, `Calendar.toZonedDateTime()`',
        detail: 'These conversion methods exist specifically so old java.util.Date/Calendar-based APIs (JDBC drivers, older libraries, serialized data) can be converted at the boundary and handled with java.time everywhere else in new code, rather than forcing a big-bang migration or living with two incompatible time APIs throughout a codebase.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The type for each job',
        code: 'Instant now = Instant.now();                          // event timestamps, logs, DB\nLocalDate birthday = LocalDate.of(1990, Month.MAY, 3); // no zone: calendar fact\nZonedDateTime meeting = ZonedDateTime.of(\n        LocalDate.of(2026, 7, 20), LocalTime.of(9, 30),\n        ZoneId.of("Europe/Belgrade"));                 // zoned: a real moment\n\nDuration d = Duration.between(start, Instant.now());   // machine span\nPeriod p = Period.between(birthday, LocalDate.now());   // calendar span (y/m/d)\nlong days = ChronoUnit.DAYS.between(birthday, LocalDate.now());',
      },
      {
        kind: 'paragraph',
        text: 'The API forces the right questions. Adding a day across a DST fall-back: `zoned.plusDays(1)` keeps 9:30 next day (25 hours elapse); `zoned.plus(Duration.ofHours(24))` gives 8:30. Neither is wrong — they answer different questions, and the old `Date`/`Calendar` API couldn\'t even express the distinction. `TemporalAdjusters` handle calendar arithmetic: `date.with(TemporalAdjusters.next(DayOfWeek.MONDAY))`.',
      },
      {
        kind: 'code',
        title: 'Formatting and parsing',
        code: 'DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")\n        .withLocale(Locale.GERMANY);\nString s = fmt.format(meeting);\nLocalDateTime parsed = LocalDateTime.parse("07.07.2026 09:30", fmt);\n\nString iso = DateTimeFormatter.ISO_INSTANT.format(now);   // 2026-07-07T14:00:00Z — for APIs',
      },
      {
        kind: 'pitfall',
        title: 'Retire Date, Calendar, and SimpleDateFormat',
        text: '`java.util.Date` is a misnamed mutable instant with deprecated everything; `SimpleDateFormat` is mutable and **not thread-safe** — shared instances corrupt parses silently under load (a classic production bug). `DateTimeFormatter` is immutable; make it a `static final` constant and share freely.',
        detail: 'Date predates the distinction this whole API is built around — it looks like a calendar date but is actually a millisecond instant with no timezone attached, which is why almost every one of its methods (getYear, getMonth, etc.) is deprecated in favor of Calendar, which is itself deprecated in favor of java.time. SimpleDateFormat\'s thread-unsafety is not a theoretical concern: it mutates an internal Calendar during both format() and parse(), so two threads sharing one instance under load produce dates silently swapped between requests — no exception, just wrong data delivered to a customer.',
      },
      {
        kind: 'pitfall',
        title: 'LocalDateTime is not a moment',
        text: '"2026-11-01T02:30" is ambiguous or nonexistent in DST-shifting zones. Persisting `LocalDateTime` for events, or defaulting to the server\'s zone (`ZoneId.systemDefault()` sneaks in via one-arg factory methods), breeds bugs that only fire twice a year. Events → `Instant`; future scheduled *local* times (a 9:00 alarm) → `LocalTime` + `ZoneId`, resolved late.',
        detail: 'During a fall-back transition, "2:30 AM" happens twice (once before the clocks roll back, once after), so a bare LocalDateTime cannot say which one it means; during a spring-forward transition, "2:30 AM" never happens at all, so resolving it to a zone forces java.time to pick an arbitrary adjacent instant. Because these gaps only occur on the one or two nights per year DST shifts, code that silently defaults to the server\'s zone passes all normal testing and only fails in production, on that specific date, for users in the affected zone.',
      },
      {
        kind: 'note',
        title: 'Testing time',
        text: 'Inject a `Clock` (`Clock.fixed(...)`, `Clock.offset(...)`) instead of calling `Instant.now()` directly — every `now()` overload accepts one. Time-dependent logic becomes deterministic under test.',
        detail: 'Code that calls `Instant.now()` or `LocalDate.now()` directly is untestable for anything time-dependent — you cannot assert "this expires after 30 days" without literally waiting 30 days. Threading a Clock parameter through (defaulting to `Clock.systemUTC()` in production, `Clock.fixed(instant, zone)` in tests) makes "now" an injectable dependency like any other, so tests can pin it to an arbitrary instant — including exactly on a DST boundary, to test the pitfall above.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 6 — The Date and Time API' },
      { book: 'learning-java', chapter: 'Ch. 8 — Text and Core Utilities' },
    ],
    related: ['internationalization', 'immutability-class-design'],
  },

  {
    id: 'annotations',
    domainId: 'platform',
    title: 'Annotations',
    summary:
      'Annotations attach structured metadata to program elements; tools and frameworks read them at compile time (annotation processors) or runtime (reflection). They do nothing by themselves — something must process them.',
    keyPoints: [
      {
        text: 'Declare with `@interface`; elements look like methods with optional defaults',
        detail: 'An annotation type is compiled to a regular interface extending `java.lang.annotation.Annotation`; each "element" you declare (`String cron();`) becomes an abstract method the annotation instance implements, and a `default` clause makes it optional at use sites. This is why reading an annotation reflectively looks like calling methods on it (`s.cron()`) rather than accessing fields.',
      },
      {
        text: '`@Retention(RUNTIME)` for reflection-read; `SOURCE`/`CLASS` for compile-time tools',
        detail: 'Retention controls how far the annotation survives past compilation: SOURCE is stripped after compiling (used for compiler checks like `@Override`), CLASS is kept in the .class file but invisible to reflection at runtime (rarely used directly), and RUNTIME is what lets `getAnnotation()` find it at runtime. Picking the wrong retention is a common bug: a `RUNTIME`-processed framework annotation declared with default retention (CLASS) silently never fires.',
      },
      {
        text: '`@Target` restricts placement (TYPE, METHOD, FIELD, PARAMETER, TYPE_USE…)',
        detail: 'Without `@Target`, an annotation could be legally placed anywhere (a class, a field, a local variable), which usually makes no sense for a framework annotation meant only for methods. Restricting the target turns a misuse into a compile error instead of a silent no-op discovered only when the framework fails to find the annotation where it expected it.',
      },
      {
        text: 'Standard set: `@Override`, `@Deprecated(since, forRemoval)`, `@SuppressWarnings`, `@FunctionalInterface`, `@SafeVarargs`',
        detail: '`@FunctionalInterface` is a compiler-checked assertion ("this interface has exactly one abstract method") that catches accidental additions before they break every lambda call site; `@SafeVarargs` on a method promises it does not do anything unsafe with its varargs array\'s reified type, suppressing the heap-pollution warning that generic varargs otherwise generate.',
      },
      {
        text: 'Frameworks run on annotations: DI (`@Inject`), JPA (`@Entity`), JUnit (`@Test`), Jackson (`@JsonProperty`)',
        detail: 'This is the annotation ecosystem\'s real payoff: a small, standardized vocabulary lets frameworks discover and wire up application code without any of it implementing framework interfaces or extending framework base classes — your domain classes stay plain, and the framework does its work by scanning for annotations at startup or via reflection per call.',
      },
      {
        text: 'Prefer annotations to naming patterns (EJ 39); always use `@Override` (EJ 40)',
        detail: 'A naming convention like prefixing test methods with `test` is invisible to tooling — a typo (`tsetFoo`) silently skips the test with zero warning, while `@Test` on the same typo\'d method still runs because the annotation, not the name, is what the runner looks for. `@Override` closes the mirror-image gap: without it, a method meant to override a superclass method but with a slightly wrong signature just silently overloads instead, and the compiler has no way to know that was a mistake.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Defining and reading an annotation',
        code: '@Retention(RetentionPolicy.RUNTIME)\n@Target(ElementType.METHOD)\npublic @interface Scheduled {\n    String cron();\n    boolean enabled() default true;\n}\n\n// The processor — nothing happens without it:\nfor (Method m : jobClass.getDeclaredMethods()) {\n    Scheduled s = m.getAnnotation(Scheduled.class);\n    if (s != null && s.enabled())\n        scheduler.register(s.cron(), () -> invoke(m));\n}',
      },
      {
        kind: 'paragraph',
        text: 'Element types are limited: primitives, `String`, `Class`, enums, annotations, and arrays thereof — values must be compile-time constants. Meta-annotations shape behavior: `@Inherited` (subclasses see class-level annotations), `@Repeatable` (multiple `@Scheduled` on one method), `@Documented` (appears in Javadoc). `TYPE_USE` targets let annotations decorate *types* (`List<@NonNull String>`) — the basis of pluggable null-checking frameworks.',
      },
      {
        kind: 'paragraph',
        text: '**Compile-time processing** (Core Java II ch. 8): annotation processors registered with `javac` generate code from annotations — how Lombok, Dagger, MapStruct, and records-like libraries work without runtime reflection cost. Processors can only *create* new files, not modify existing ones (Lombok famously cheats). Runtime processing via [[reflection]] is simpler and dominant in frameworks like Spring.',
      },
      {
        kind: 'bestPractice',
        title: 'EJ Items 39–40',
        text: 'Naming conventions (`testSomething`) are fragile — typos fail silently; annotations (`@Test`) fail loudly and carry parameters. And `@Override` on every intended override turns "overloaded instead of overridden" ([[object-contracts]]) into a compile error. There is no reason to omit it.',
        detail: '"Fail loudly" here means something specific: a misspelled `@Test` method (as opposed to a misspelled `testFoo` name) is not silently skipped, because there is no correctly-spelled alternative for the tool to accidentally match against — the annotation itself is the contract, not a string pattern the tool guesses at. The `@Override` case is the mirror image: the compiler already knows the exact signature of every method in the supertype, so asking it to verify a match costs nothing and catches a whole category of subtle bugs for free.',
      },
      {
        kind: 'note',
        title: 'Annotations are not logic',
        text: 'An annotation is a claim, not a behavior — `@Transactional` does nothing unless a proxy or agent weaves the transaction. Understanding *which machinery* reads each annotation (compiler? agent? framework at startup? reflection per-call?) is understanding your stack\'s magic.',
        detail: 'This is the single most common source of "I annotated it and nothing happened" bugs: annotations are pure metadata, inert until something goes looking for them. `@Transactional` on a method called from within the same class, for instance, is a classic trap — Spring\'s proxy-based interception only sees calls that go through the proxy from outside, so a self-invocation bypasses the proxy entirely and the annotation is silently ignored despite being perfectly correctly written.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 11 — Annotations' },
      { book: 'effective-java', chapter: 'Items 39–41' },
    ],
    related: ['reflection', 'object-contracts'],
  },

  {
    id: 'reflection',
    domainId: 'platform',
    title: 'Reflection & Dynamic Proxies',
    summary:
      'Reflection examines and manipulates classes at runtime: enumerate members, read/write fields, invoke methods, construct instances from names. Frameworks live on it; application code should treat it as a last resort (EJ 65).',
    keyPoints: [
      {
        text: '`Class<?>` is the entry: `obj.getClass()`, `MyType.class`, `Class.forName(name)`',
        detail: 'Every reflective operation starts from a `Class` object, and there are exactly three ways to get one: ask a live instance for its runtime type, reference a compile-time-known type literal, or resolve a class purely from its name at runtime — the last is what lets a framework instantiate a type it has never seen at compile time, driven entirely by a config string.',
      },
      {
        text: '`getDeclaredFields/Methods/Constructors` (all, this class) vs `getFields/…` (public, inherited)',
        detail: 'These two families answer different questions and mixing them up is a common bug: the `getDeclared*` family sees every member actually declared on that exact class — including private ones — but not inherited members, while the plain `get*` family walks up the inheritance hierarchy but only sees public members. Framework code that needs "every field, public or not, including inherited ones" has to walk the superclass chain manually, calling `getDeclaredFields()` at each level.',
      },
      {
        text: '`setAccessible(true)` bypasses access control — within module limits (JPMS `opens`)',
        detail: 'This single call is how DI containers set private fields and ORMs read private getters without any public API — it disables the access checks the JVM would otherwise enforce at the reflective call site. Since Java 9, this bypass itself is subject to module boundaries: it only works if the target package is `opens`-ed to the caller\'s module (or the caller is on the classpath\'s unnamed module), which is why frameworks doing deep reflection into the JDK need explicit `--add-opens` flags.',
      },
      {
        text: 'Costs: no compile-time checking, slower dispatch, refactoring-invisible, module friction',
        detail: 'Each of these is a real, separate cost: a typo in a reflectively-referenced class or method name is a runtime exception instead of a compile error; reflective invocation is slower than a direct call because the JVM cannot inline or devirtualize through it as easily; an IDE "rename method" refactor will not find or update a string like `"calculateTotal"` used in `getMethod()`; and JPMS strong encapsulation adds a whole new failure mode (InaccessibleObjectException) that did not exist before Java 9.',
      },
      {
        text: 'Generic *declarations* survive erasure and are readable (`getGenericType`)',
        detail: 'Type erasure removes generic type arguments from runtime *objects* — a `List<String>` and a `List<Integer>` are the same class at runtime — but it does not remove them from the class *file*\'s field, method, and superclass signatures, which are recorded separately for exactly this purpose. So while you cannot ask a `List` instance what its element type is, you can ask a `Field` or `Method` declared as `List<String>` what its generic type was, because that information was never erased from the declaration.',
      },
      {
        text: '`Proxy.newProxyInstance` fabricates interface implementations at runtime — the AOP primitive',
        detail: 'Instead of hand-writing a class that implements an interface, `Proxy.newProxyInstance` generates one at runtime that forwards every method call to a single `InvocationHandler` — which is exactly the mechanism behind logging wrappers, transaction interception, and lazy-loading proxies: one generic handler can implement cross-cutting behavior for any interface without writing a wrapper class per interface.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The framework pattern: instantiate by name, inject by field',
        code: 'Class<?> cl = Class.forName(config.get("handler.class"));\nObject handler = cl.getDeclaredConstructor().newInstance();\n\nfor (Field f : cl.getDeclaredFields()) {\n    if (f.isAnnotationPresent(Inject.class)) {\n        f.setAccessible(true);                  // needs the module opened to us\n        f.set(handler, container.lookup(f.getType()));\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'This is dependency injection, ORM hydration, and serialization in miniature — reflection lets a library operate on classes it has never seen. The price list (EJ 65): exceptions move from compile time to runtime, IDE refactorings silently miss string class names, JIT optimizations weaken across reflective calls, and [[modules-jpms|JPMS]] requires packages to be `opens`-ed for deep access. Application code usually has a better tool: interfaces, [[lambdas]], or plain polymorphism.',
      },
      {
        kind: 'code',
        title: 'Dynamic proxy: one InvocationHandler, any interface',
        code: 'OrderService proxied = (OrderService) Proxy.newProxyInstance(\n        loader,\n        new Class<?>[] { OrderService.class },\n        (proxy, method, args) -> {\n            long t0 = System.nanoTime();\n            try {\n                return method.invoke(realService, args);\n            } finally {\n                metrics.record(method.getName(), System.nanoTime() - t0);\n            }\n        });',
      },
      {
        kind: 'paragraph',
        text: 'Dynamic proxies implement *interfaces* only; proxying concrete classes needs bytecode generation (ByteBuddy/CGLIB — how Spring proxies `@Transactional` beans and Mockito mocks classes). For repeated reflective calls, `MethodHandle` (`java.lang.invoke`) offers a faster, typed alternative the JIT can inline — the machinery beneath [[bytecode-execution|invokedynamic]].',
      },
      {
        kind: 'pitfall',
        title: 'Reflection across module boundaries',
        text: 'Since Java 16, `setAccessible` into a non-opened JDK package throws `InaccessibleObjectException` — the end of the `--illegal-access` era. Libraries needing deep access require `--add-opens java.base/java.lang=ALL-UNNAMED` (a red flag to minimize) or, properly, the target module\'s `opens` declaration.',
        detail: 'Before Java 16 this was merely a warning ("An illegal reflective access operation has occurred") that many teams learned to ignore for years; turning it into a hard exception broke plenty of libraries and applications that had quietly depended on reaching into JDK internals. `--add-opens` is a per-run escape hatch, not a fix — it should be treated as technical debt to remove, not a permanent flag to ship, because it re-opens exactly the encapsulation the module system exists to enforce.',
      },
      {
        kind: 'note',
        title: 'Reading generics reflectively',
        text: '`field.getGenericType()` returns a `ParameterizedType` exposing `List<String>`\'s type arguments — erasure removed them from objects, not from class-file signatures ([[type-erasure]]). This is how Jackson knows what to deserialize into a `List<Customer>` field.',
        detail: 'This is the trick that makes JSON-to-generic-collection deserialization possible at all: Jackson cannot ask a bare `List` object what its element type is (erasure already destroyed that at the object level), but it can inspect the *field* or *method* declaration that will hold the result, read its `ParameterizedType`, and see `Customer` as the type argument — then deserialize each JSON element into that concrete type instead of guessing or requiring a manual type hint.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 5.10, 6.5 — Reflection; Proxies' },
      { book: 'effective-java', chapter: 'Item 65' },
    ],
    related: ['annotations', 'class-loading', 'type-erasure', 'modules-jpms'],
  },

  {
    id: 'modules-jpms',
    domainId: 'platform',
    title: 'Modules (JPMS)',
    summary:
      'The Java Platform Module System (Java 9) adds `module-info.java`: explicit dependencies (`requires`) and explicit API surface (`exports`). The JDK itself is modular; application adoption is optional and, outside libraries, modest.',
    keyPoints: [
      {
        text: '`requires` declares dependencies; `exports` opens packages to compilers and callers',
        detail: 'These two directives replace what used to be implicit and unenforced: a classpath jar could always reach into any other jar\'s packages, dependency or not. `requires` makes "what do I actually depend on" a checked fact the module system verifies at compile and launch time, and `exports` makes "what is my public API" equally explicit and enforced.',
      },
      {
        text: '`opens` permits deep reflection (frameworks!) without exporting the API',
        detail: 'A package can be reflectively accessible (for a framework like Jackson or Hibernate to construct and inspect your classes) without being part of your compile-time public API — `opens` grants runtime reflective access alone, while `exports` grants compile-time visibility too. Most application code needs the former for its model classes and the latter for almost nothing.',
      },
      {
        text: 'Strong encapsulation: non-exported packages are inaccessible — even reflectively',
        detail: 'Before modules, `setAccessible(true)` could break into any package\'s internals, exported or not — reflection was a universal skeleton key. A non-exported, non-opened package now refuses that call outright, which is precisely what closed the door on casual `sun.misc.Unsafe`-style internals access from outside the JDK.',
      },
      {
        text: 'Unnamed module (classpath) and automatic modules (jars on module path) ease migration',
        detail: 'Neither of these is a "real" module in the strict sense — they exist purely so that years of pre-module code and jars keep working. The unnamed module gets a special all-access pass (it can read everything), and an automatic module derives a name from its jar filename so named modules can at least declare `requires` on it, without the jar author ever having written a `module-info.java`.',
      },
      {
        text: '`requires transitive` re-exports; `provides/uses` wires ServiceLoader',
        detail: 'Plain `requires` is not visible to *your* callers — if your module requires `com.acme.common` but a caller only requires your module, they cannot see `common` types in your API without also declaring it themselves. `requires transitive` extends your dependency to them automatically, which matters whenever your public API actually exposes another module\'s types.',
      },
      {
        text: '`jlink` assembles a minimal runtime image from just the modules you use',
        detail: 'A full JDK install carries every standard module whether an application uses them or not; `jlink` walks the actual `requires` graph starting from your application module and produces a runtime containing only that closure — routinely a small fraction of the full JDK\'s size, which is exactly what a container image wants.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'module-info.java',
        code: 'module com.acme.orders {\n    requires java.sql;\n    requires transitive com.acme.common;   // callers of orders see common too\n\n    exports com.acme.orders.api;            // public API — the ONLY visible packages\n    opens com.acme.orders.model             // reflection access (e.g. for Jackson)\n            to com.fasterxml.jackson.databind;\n\n    provides com.acme.spi.Exporter\n            with com.acme.orders.CsvExporter;   // ServiceLoader wiring\n}',
      },
      {
        kind: 'paragraph',
        text: 'What modules fix: **classpath hell** (missing jars surface at startup with clear errors, not `NoClassDefFoundError` mid-request), **accidental API** (internals like `sun.misc.Unsafe` were used because they were reachable; exports make the contract explicit), and **bloat** (`jlink` builds a runtime with only the ~20 modules you use — a 40 MB self-contained image instead of a full JDK, relevant for [[cloud-native-java|containers]]).',
      },
      {
        kind: 'paragraph',
        text: 'Migration reality (Core Java II ch. 12): code on the classpath lives in the *unnamed module* and can read everything, so pre-9 apps run unchanged. A jar dropped on the module path becomes an *automatic module* readable by named modules. Most applications stop there; full modularization pays off mainly for libraries and platforms. The strong-encapsulation side effects, though, are universal: `--add-opens` flags for frameworks doing deep reflection into the JDK ([[reflection]]).',
      },
      {
        kind: 'pitfall',
        title: 'Split packages',
        text: 'Two modules containing the same package is illegal on the module path — the classic blocker when modularizing legacy multi-jar projects (and the reason some libraries stayed automatic modules for years). Packages must have exactly one home.',
        detail: 'The module system needs to know unambiguously which module a class belongs to for its strong-encapsulation checks to even make sense — if `com.acme.util` legitimately existed in two modules simultaneously, `requires`/`exports` could no longer say anything coherent about who owns it. This is why the fix is always to consolidate the package into one module, never to work around the restriction.',
      },
      {
        kind: 'note',
        title: 'ServiceLoader',
        text: 'The `provides`/`uses` pair (or `META-INF/services` on the classpath) lets implementations register themselves and consumers discover them without compile-time coupling — how JDBC drivers, charset providers, and plugin systems load. `ServiceLoader.load(Exporter.class)` iterates every provider on the path.',
        detail: 'The consumer only ever depends on the service *interface* (`Exporter`), never on any concrete implementation — new providers can be added by dropping in a new module with a `provides` clause, and the consuming code does not change or even recompile. This is the module system\'s built-in answer to plugin architectures that would otherwise need a separate DI framework.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 12 — The Java Platform Module System' },
      { book: 'core-java-2', chapter: 'Ch. 9.1 — Class Loaders' },
    ],
    related: ['class-loading', 'reflection', 'cloud-native-java'],
  },

  {
    id: 'jdbc-database',
    domainId: 'platform',
    title: 'JDBC & Database Access',
    summary:
      'JDBC is the SQL access layer everything else (JPA, jOOQ, MyBatis) builds on: `DataSource` → `Connection` → `PreparedStatement` → `ResultSet`, with connection pooling and transactions as the production concerns.',
    keyPoints: [
      {
        text: '**Always** `PreparedStatement` with `?` parameters — string-concatenated SQL is injection',
        detail: 'A `PreparedStatement` sends the query text and the parameter values to the database as two separate things — the driver never re-parses user input as SQL syntax, which is what makes injection structurally impossible rather than merely unlikely. String-concatenated SQL has no such boundary: whatever the user typed becomes part of the query text itself.',
      },
      {
        text: 'Pool connections (HikariCP is the de facto standard) — physical connects cost ~ms each',
        detail: 'Opening a raw JDBC connection means a TCP handshake, authentication, and session setup on the database side — single-digit to double-digit milliseconds that would dominate the cost of a fast query if paid on every request. A pool keeps a set of already-authenticated connections warm and hands them out and back, turning that cost into a one-time startup expense instead of a per-request one.',
      },
      {
        text: 'try-with-resources every Connection/Statement/ResultSet — leaks exhaust the pool',
        detail: 'A pooled `Connection` that is never closed never returns to the pool — it just looks "in use" forever from the pool\'s perspective, even though the application has long since forgotten about it. Enough of these leaks and the pool runs out of connections to hand to legitimate requests, which is why try-with-resources on every JDBC resource is not optional cleanliness here, it is what keeps the pool from silently starving.',
      },
      {
        text: 'Transactions: `setAutoCommit(false)` → work → `commit()`; rollback in the catch',
        detail: 'Auto-commit mode (the JDBC default) commits every single statement immediately, which is wrong the moment two statements need to succeed or fail together — a debit without its matching credit, say. Turning it off groups everything up to the next `commit()`/`rollback()` into one atomic unit, and the catch-block rollback is what guarantees a failure partway through does not leave the group half-applied.',
      },
      {
        text: 'Batch inserts (`addBatch`/`executeBatch`) are 10–100× faster than row-at-a-time',
        detail: 'A row-at-a-time loop pays a full network round trip to the database for every single insert; batching queues many statements client-side and sends them in one round trip (or a small number of them), so the win scales with how many rows you can batch together before the network latency, not the database work itself, stops being the bottleneck.',
      },
      {
        text: '`ResultSet` is a cursor: `while (rs.next())`, typed getters, `wasNull` for primitives',
        detail: 'A `ResultSet` does not hand you all the rows at once — it streams them from the database as you call `next()`, which is why forgetting the loop condition or the initial `next()` call is such a common beginner mistake. `wasNull()` exists because a primitive getter like `getInt` cannot distinguish a real `0` from a SQL `NULL`; you must check `wasNull()` immediately after the getter call to tell them apart.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The core pattern',
        code: 'try (Connection conn = dataSource.getConnection();\n     PreparedStatement ps = conn.prepareStatement(\n             "SELECT id, name, salary FROM employees WHERE dept = ? AND salary > ?")) {\n    ps.setString(1, dept);\n    ps.setBigDecimal(2, minSalary);\n    try (ResultSet rs = ps.executeQuery()) {\n        while (rs.next()) {\n            result.add(new Employee(rs.getLong("id"), rs.getString("name"),\n                                    rs.getBigDecimal("salary")));\n        }\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'SQL injection is a solved problem you can still have',
        text: '`"WHERE name = \'" + userInput + "\'"` hands your database to the input. `PreparedStatement` sends SQL and data separately — injection becomes structurally impossible, plus the database caches the plan. There is no legitimate reason to concatenate values into SQL text. (Identifiers — table/column names — can\'t be parameters; whitelist those.)',
        detail: 'The reason identifiers cannot be parameterized is structural, not a JDBC limitation: a `?` parameter always fills the position of a *value* in the query plan, and a table or column name is part of the query\'s structure, decided before the plan even exists. There is no protocol-level slot for "the table name goes here," which is why a whitelist of known-safe identifier strings is the only sound fix.',
      },
      {
        kind: 'code',
        title: 'Transactions and batching',
        code: 'conn.setAutoCommit(false);\ntry (PreparedStatement ps = conn.prepareStatement(\n        "INSERT INTO audit(user_id, action, at) VALUES (?, ?, ?)")) {\n    for (AuditEvent e : events) {\n        ps.setLong(1, e.userId());\n        ps.setString(2, e.action());\n        ps.setObject(3, e.at());              // java.time works directly (JDBC 4.2)\n        ps.addBatch();\n    }\n    ps.executeBatch();\n    conn.commit();\n} catch (SQLException e) {\n    conn.rollback();\n    throw new AuditStoreException(e);\n}',
      },
      {
        kind: 'paragraph',
        text: 'Isolation levels (`Connection.TRANSACTION_READ_COMMITTED` default in most DBs, up to `SERIALIZABLE`) trade anomaly protection for concurrency — know which anomalies (dirty/non-repeatable/phantom reads) your logic tolerates. In practice most Java code drives this through a framework\'s `@Transactional`; the JDBC semantics underneath are unchanged, and leaking connections or holding transactions across remote calls remain *your* bugs ([[scalability-patterns|pool exhaustion]]).',
      },
      {
        kind: 'note',
        title: 'The stack above',
        text: 'JPA/Hibernate maps objects and manages sessions (mind N+1 query patterns — the classic ORM performance failure); jOOQ generates type-safe SQL; Spring\'s `JdbcTemplate`/`JdbcClient` removes boilerplate while staying SQL-first. All of them surface JDBC concepts — pooling, transactions, batching — when performance matters.',
        detail: 'An N+1 query pattern happens when an ORM lazily loads a collection per parent row inside a loop — one query to fetch N parents, then N more queries to fetch each one\'s children, when a single join could have done it in one round trip. It is called "the classic ORM performance failure" because the abstraction makes the extra queries invisible in the code, which is exactly why it survives code review so often.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 5 — Database Programming' },
      { book: 'java-secrets', chapter: 'Data access chapters' },
    ],
    related: ['catching-cleanup', 'scalability-patterns', 'exception-best-practices'],
  },

  {
    id: 'internationalization',
    domainId: 'platform',
    title: 'Internationalization',
    summary:
      'i18n separates code from locale-sensitive behavior: `Locale` drives number/date/currency formatting, collation, and message selection; `ResourceBundle` externalizes translatable text; everything Unicode flows in UTF-8.',
    keyPoints: [
      {
        text: '`Locale` = language + region (+ script/variant): `Locale.forLanguageTag("sr-Latn-RS")`',
        detail: 'Language alone is not enough to pin down formatting conventions — Portuguese in Brazil and Portugal use different date orders, and Serbian is routinely written in both Latin and Cyrillic script. The full BCP 47 tag (language, script, region, variant) is what lets `Locale` disambiguate all of that precisely instead of guessing.',
      },
      {
        text: 'Format numbers/currency/dates with `NumberFormat`/`DateTimeFormatter.withLocale` — never string-build them',
        detail: 'Hand-building a formatted number or date string (`amount + " " + currencySymbol`) bakes in one locale\'s conventions — decimal vs comma separators, symbol placement, date field order — as if they were universal. The formatter classes encapsulate the actual rules for each locale, which is knowledge no individual developer should be re-deriving by hand.',
      },
      {
        text: '`ResourceBundle` + `messages_de_DE.properties` selects translations by locale with fallback',
        detail: 'The fallback chain (`messages_de_DE` → `messages_de` → `messages`, the base bundle) means a translation only has to override what is actually different for that specific locale — a German-Austria bundle can inherit everything from the plain German bundle except the handful of strings that genuinely differ, instead of duplicating the entire file.',
      },
      {
        text: '`MessageFormat`/`ChoiceFormat` handle placeholder order and plural forms per language',
        detail: 'Sentence structure varies by language — a message built by concatenating fragments around a value assumes English word order and breaks the moment a language needs the value earlier or later in the sentence. `MessageFormat` treats the whole sentence as one translatable template with numbered placeholders, so a translator can reorder them freely for their language\'s grammar.',
      },
      {
        text: 'Collation (`Collator`) sorts text per locale rules — `String.compareTo` is code-point order, not human order',
        detail: '`compareTo` compares raw UTF-16 code unit values, which happens to roughly match English alphabetical order but is not actually "correct" ordering for any language — accented letters, case, and language-specific rules (where does "ä" sort in German vs Swedish?) are entirely absent from a code-point comparison. `Collator` encodes the actual linguistic sort order per locale.',
      },
      {
        text: 'Never default silently: locale-sensitive APIs have overloads taking an explicit `Locale`',
        detail: 'An API call that omits the `Locale` argument silently uses the JVM\'s default locale, which is a property of the machine running the code, not a decision made deliberately — the same code can format dates differently on a developer\'s laptop, in CI, and in production depending on each machine\'s configuration. Passing the locale explicitly (`Locale.ROOT` for machine data, the actual user locale for display) makes the behavior a decision instead of an accident of environment.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Locale-driven formatting',
        code: 'double amount = 1234567.89;\nNumberFormat de = NumberFormat.getCurrencyInstance(Locale.GERMANY);\nNumberFormat us = NumberFormat.getCurrencyInstance(Locale.US);\nde.format(amount);   // "1.234.567,89 €"\nus.format(amount);   // "$1,234,567.89"\n\nvar fmt = DateTimeFormatter.ofLocalizedDate(FormatStyle.FULL);\nLocalDate.now().format(fmt.withLocale(Locale.FRANCE));   // "mardi 7 juillet 2026"',
      },
      {
        kind: 'code',
        title: 'ResourceBundle + MessageFormat',
        code: '// messages_en.properties:  cart.items={0,choice,0#no items|1#one item|1<{0} items}\n// messages_de.properties:  cart.items={0,choice,0#keine Artikel|1#ein Artikel|1<{0} Artikel}\n\nResourceBundle msgs = ResourceBundle.getBundle("messages", userLocale);\nString text = MessageFormat.format(msgs.getString("cart.items"), itemCount);',
      },
      {
        kind: 'paragraph',
        text: 'The deeper lessons (Core Java II ch. 7): translatable strings must be **whole messages** with placeholders — concatenating fragments breaks under different word orders; plurals need `ChoiceFormat`/ICU rules, not `if (n == 1)`; case conversion is locale-sensitive (the Turkish dotless-ı makes `"I".toLowerCase()` locale-dependent — use `toLowerCase(Locale.ROOT)` for protocol strings); and sorting user-visible lists needs `Collator`, which knows that `ä` sorts differently in German and Swedish.',
      },
      {
        kind: 'pitfall',
        title: 'Locale-sensitive parsing of machine data',
        text: '`String.format("%f", x)` in a French locale emits `3,14` — and a downstream `Double.parseDouble` explodes. Any string meant for *machines* (config, protocols, logs, SQL) must use `Locale.ROOT` explicitly. The dual bug: parsing user input with `Double.parseDouble` instead of a locale-aware `NumberFormat`.',
        detail: 'This is a two-sided trap because the bug hides on whichever machine has a non-default locale — code developed and tested on an English-locale machine works fine, then fails the moment it runs on a server or a colleague\'s machine configured for a comma-decimal locale, because `%f`\'s output silently changed shape underneath a parser that expects a dot.',
      },
      {
        kind: 'note',
        title: 'Unicode hygiene',
        text: 'Normalize before comparing (`Normalizer.normalize(s, NFC)` — "é" has two encodings); count grapheme clusters, not chars, for user-perceived length ([[strings-text]]); and test with names like "María-José Ñusta 李小龙" early, not after launch.',
        detail: 'The two-encodings problem is real and common: "é" can be one precomposed code point or an "e" followed by a combining accent — visually identical, byte-for-byte different, and a naive `.equals()` sees them as unequal strings. Testing with genuinely diverse names early catches this and grapheme-counting bugs while they are a five-minute fix, instead of after they are baked into a database schema sized for the wrong assumption.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 7 — Internationalization' },
    ],
    related: ['strings-text', 'date-time-api', 'readers-writers'],
  },

  {
    id: 'security-basics',
    domainId: 'platform',
    title: 'Security Basics',
    summary:
      'Java-flavored application security: the JCA crypto architecture (hashing, signatures, encryption), TLS defaults, secret handling, and the perennial Java-specific holes — deserialization, injection, and XML external entities.',
    keyPoints: [
      {
        text: 'Passwords: salted adaptive hashes (bcrypt/scrypt/Argon2) — never MD5/SHA-x, never reversible',
        detail: 'General-purpose hashes like MD5/SHA-256 are deliberately *fast*, which is exactly the wrong property for password storage — fast hashing is what lets an attacker with a stolen hash dump try billions of guesses per second. Adaptive functions like Argon2 are deliberately slow and tunable, so cracking the whole dump costs real time and money even after a breach.',
      },
      {
        text: 'Symmetric crypto: AES-GCM via `Cipher` ("AES/GCM/NoPadding"), fresh random IV per message',
        detail: 'GCM mode provides both confidentiality and integrity in one pass — a tampered ciphertext fails to decrypt rather than silently decrypting to garbage, which plain AES-CBC does not give you for free. Reusing an IV with the same key breaks GCM\'s security guarantees outright, which is why a fresh random IV per message is not a nicety, it is load-bearing.',
      },
      {
        text: '`SecureRandom` for anything security-relevant; `Random`/`ThreadLocalRandom` are predictable',
        detail: '`Random`\'s output is fully determined by its seed via a public, documented algorithm — given a few consecutive outputs, an attacker can often reconstruct the seed and predict every future value. `SecureRandom` draws from a cryptographically strong source specifically designed to resist exactly that kind of reconstruction, which is the only property that matters for tokens, keys, and salts.',
      },
      {
        text: 'Java-specific sins: native [[serialization]] of untrusted data, SQL injection ([[jdbc-database]]), XXE in XML parsers',
        detail: 'All three share the same root cause: a Java API that, by default, treats untrusted input as instructions to execute rather than inert data to process — deserialization reconstructs arbitrary classes from bytes, string-built SQL executes attacker text as query syntax, and a permissive XML parser resolves external entities the document itself defines. Each has a safe, non-default configuration or alternative.',
      },
      {
        text: 'Validate input at trust boundaries; encode output for its destination (HTML, SQL, shell)',
        detail: 'These are two different defenses for two different failure modes, and conflating them is a common mistake: validation rejects input that should never have been accepted at all (an age field containing letters), while output encoding neutralizes special characters *for the specific destination* the data is about to flow into (HTML-escaping for a web page, parameterization for SQL) — the same string can need different encoding for different destinations.',
      },
      {
        text: 'Keep the JDK current — crypto defaults and TLS versions improve per release',
        detail: 'Cryptographic best practice is a moving target: algorithms once considered safe (like SHA-1, or older TLS versions) get deprecated as attacks improve, and the JDK\'s default provider configuration is updated release by release to reflect current guidance. An application pinned to an old JDK inherits its outdated crypto defaults even if the application code itself never changes.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'JCA in practice',
        code: '// Hashing (integrity, not passwords):\nbyte[] digest = MessageDigest.getInstance("SHA-256").digest(data);\n\n// AES-GCM encryption:\nKeyGenerator kg = KeyGenerator.getInstance("AES");\nkg.init(256);\nSecretKey key = kg.generateKey();\n\nbyte[] iv = new byte[12];\nSecureRandom.getInstanceStrong().nextBytes(iv);\nCipher cipher = Cipher.getInstance("AES/GCM/NoPadding");\ncipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, iv));\nbyte[] ct = cipher.doFinal(plaintext);   // store iv || ct',
      },
      {
        kind: 'paragraph',
        text: 'The JCA\'s provider architecture (Core Java II ch. 9) means algorithms are named strings resolved against pluggable providers — which is why agility ("switch to a stronger algorithm") is a configuration concern, and why copy-pasted `"AES/ECB/PKCS5Padding"` from 2009 Stack Overflow still compiles: **ECB mode leaks patterns and is never correct** for general data. GCM gives confidentiality + integrity together; never reuse an IV with the same key.',
      },
      {
        kind: 'paragraph',
        text: '**Passwords** are their own category: slow, salted, adaptive functions (Argon2id preferred, bcrypt fine) so brute force costs attackers real money; a pepper in a secrets manager adds a second factor the database dump doesn\'t contain. **Secrets** never live in code or images — environment injection or a manager (Vault, cloud KMS); and `char[]` over `String` for in-memory passwords is marginal hygiene, not a strategy.',
      },
      {
        kind: 'pitfall',
        title: 'XXE — the default XML parser is too helpful',
        text: 'XML external entities let a crafted document read local files or SSRF your network. Every `DocumentBuilderFactory`/`SAXParserFactory` handling untrusted XML needs `setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)` (plus friends). Same genus as [[serialization|deserialization attacks]]: parsers executing data\'s wishes.',
        detail: 'The attack works because the XML spec lets a document define its own entities, including ones that resolve to a local file path or a URL — a parser that dutifully honors `<!DOCTYPE>` declarations from an untrusted document is, by design, doing exactly what the attacker\'s document tells it to do. Disabling DOCTYPE processing removes the mechanism entirely rather than trying to sanitize its use.',
      },
      {
        kind: 'note',
        title: 'TLS on the client',
        text: '`HttpClient` verifies certificates and hostnames by default — the dangerous act is *disabling* it: any `TrustManager` accepting all certs ships MITM-ready code, and copy-paste makes it permanent. Fix trust properly (import the CA into a truststore) instead. The SecurityManager, historically part of this chapter, was removed (JEP 411); process/container isolation replaced it.',
        detail: 'A trust-all `TrustManager` is almost always written to get past a self-signed certificate in local development, with every intention of removing it later — but "temporary" workarounds copy-pasted between projects have a well-documented habit of reaching production, at which point the application will happily establish a TLS connection to anyone, including an active man-in-the-middle.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 9 — Security' },
      { book: 'effective-java', chapter: 'Item 85 — deserialization' },
      { book: 'java-secrets', chapter: 'Security chapters' },
    ],
    related: ['serialization', 'jdbc-database', 'http-client'],
  },

  {
    id: 'native-interop',
    domainId: 'platform',
    title: 'Native Interop: JNI → Panama',
    summary:
      'Calling C from Java went from JNI (header files, hand-written glue, catastrophic on mistakes) to the Foreign Function & Memory API (Java 22): pure-Java downcalls through method handles and safe, scoped off-heap memory.',
    keyPoints: [
      {
        text: 'JNI: `native` methods + generated headers + C glue compiled per platform — powerful, painful, unsafe',
        detail: 'Every JNI binding needs hand-written C glue code compiled separately for each target platform (Linux/macOS/Windows, x86/ARM) — the "powerful" part is that it can do anything C can do, and the "painful" part is that this glue layer is a second codebase in a different language that has to be maintained, built, and shipped alongside the Java code.',
      },
      {
        text: 'JNI crashes take the whole JVM — a segfault in glue code is not an exception',
        detail: 'The JVM\'s safety guarantees (bounds checking, no raw pointers, exceptions instead of crashes) apply to Java bytecode, not to the native code JNI hands control to — a bug in the C glue that corrupts memory or dereferences a bad pointer crashes the entire process exactly like it would in a pure C program, with no `catch` block anywhere able to stop it.',
      },
      {
        text: 'FFM (JEP 454): `Linker` + `SymbolLookup` bind C functions to `MethodHandle`s — no glue code',
        detail: 'FFM eliminates the separate C glue layer entirely — `Linker` and `SymbolLookup` describe a native function\'s signature in pure Java and produce a `MethodHandle` that calls it directly, so there is nothing to compile per-platform and no second codebase to maintain alongside the Java side.',
      },
      {
        text: '`MemorySegment` + `Arena` manage off-heap memory with deterministic, scope-checked lifetime',
        detail: 'Off-heap memory passed to native code cannot be managed by the garbage collector, which has no visibility into what the native side is doing with a pointer — `Arena` gives that memory an explicit, deterministic lifetime instead, and `MemorySegment` enforces bounds and use-after-free checks on the Java side of every access.',
      },
      {
        text: 'jextract generates Java bindings from C headers automatically',
        detail: 'Hand-translating a C header\'s function signatures, struct layouts, and constants into the equivalent FFM declarations is exactly the kind of mechanical, error-prone work a tool should do instead — `jextract` parses the real header and emits bindings that are guaranteed to match it, rather than a manually maintained approximation that can drift out of sync as the C library evolves.',
      },
      {
        text: 'When possible, avoid interop entirely — a pure-Java library outlives every binding',
        detail: 'Every native binding, however it is written, couples your application to a specific native library\'s ABI, build, and platform support — a pure-Java alternative has none of that baggage and simply keeps working across JVM upgrades and new platforms. Interop is a tool for when the native library provides something Java genuinely cannot (a specific hardware driver, an existing high-performance C library), not a first resort.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'FFM: calling strlen without writing C',
        code: 'Linker linker = Linker.nativeLinker();\nSymbolLookup libc = linker.defaultLookup();\n\nMethodHandle strlen = linker.downcallHandle(\n        libc.find("strlen").orElseThrow(),\n        FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));\n\ntry (Arena arena = Arena.ofConfined()) {\n    MemorySegment cString = arena.allocateFrom("Hello, Panama!");\n    long len = (long) strlen.invokeExact(cString);      // 14\n}   // arena closes → memory freed, further access throws',
      },
      {
        kind: 'paragraph',
        text: 'The safety upgrade over JNI and `Unsafe`: a `MemorySegment` carries **bounds** and a **lifetime** (its `Arena`) — out-of-bounds access and use-after-free throw Java exceptions instead of corrupting the process. Layouts (`MemoryLayout.structLayout(...)`) describe C structs so field access is named and offset-checked. Upcalls (C calling back into Java) get the same treatment via `upcallStub`.',
      },
      {
        kind: 'paragraph',
        text: '**JNI** (Core Java II ch. 13) remains in the ecosystem — JavaCPP, JNA, and countless legacy bindings — and its rules still matter where you meet it: every JNI reference is loader-local, exceptions must be checked manually after every call, and pinned arrays block the GC. New work should not start there; FFM is faster to write, safer to run, and portable by construction (the binding is data, not compiled C).',
      },
      {
        kind: 'pitfall',
        title: 'The native boundary erases Java\'s guarantees',
        text: 'Whatever the API, once control enters C: no bounds checks, no GC awareness (never hand out a pointer into a Java array without pinning/copying), no exceptions — errno and return codes instead. Treat every native call like a syscall: validate inputs before, check results after, and keep the surface minimal.',
        detail: 'This is true regardless of whether the binding is JNI or FFM, because the boundary itself — not the binding technology — is where Java\'s guarantees end. FFM adds safety checks on the Java side of that boundary (bounds-checked segments, scoped lifetimes), but the moment execution is actually inside the native function, none of that protects you; the discipline of validating before and checking after is unavoidable either way.',
      },
      {
        kind: 'note',
        title: 'Why Panama matters strategically',
        text: 'Off-heap data structures ([[binary-data-buffers|beyond ByteBuffer\'s 2 GB int-indexed limits]]), zero-copy interop with ML/graphics/database libraries, and an official replacement for `sun.misc.Unsafe` (whose memory-access methods are deprecated for removal). Vector API (SIMD) and FFM together are Java\'s bid for the performance-adjacent domains it used to concede ([[future-directions]]).',
        detail: '`Unsafe` was never meant to be public API — it leaked out and became load-bearing infrastructure for high-performance libraries precisely because there was no supported alternative for what it offered (raw memory access, no safety net). FFM gives those libraries a real, supported replacement, which is the prerequisite for `Unsafe`\'s memory methods to actually be removable someday instead of permanently grandfathered in.',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 13 — Native Methods (incl. 13.11 Foreign Functions)' },
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
    ],
    related: ['ffm-api', 'binary-data-buffers', 'memory-layout'],
  },
]
