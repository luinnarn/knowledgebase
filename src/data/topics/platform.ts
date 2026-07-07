import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'date-time-api',
    domainId: 'platform',
    title: 'The Date & Time API (java.time)',
    summary:
      'java.time models time correctly by separating concepts: `Instant` (machine time), `LocalDate/LocalTime/LocalDateTime` (human calendar, no zone), `ZonedDateTime` (zoned), `Duration` (machine spans) and `Period` (calendar spans). All immutable, all fluent.',
    keyPoints: [
      '`Instant` = point on the timeline (UTC); `LocalDateTime` = wall-clock without zone; `ZonedDateTime` = both',
      'Store and exchange **Instant/UTC**; apply `ZoneId` only at presentation and business-rule edges',
      '`Duration` counts seconds/nanos; `Period` counts years/months/days — DST makes them differ',
      'Formatting/parsing: `DateTimeFormatter` (immutable, thread-safe — unlike old `SimpleDateFormat`)',
      'Everything is immutable: `plusDays` returns a new object',
      'Legacy bridges: `Date.toInstant()`, `Timestamp.toLocalDateTime()`, `Calendar.toZonedDateTime()`',
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
      },
      {
        kind: 'pitfall',
        title: 'LocalDateTime is not a moment',
        text: '"2026-11-01T02:30" is ambiguous or nonexistent in DST-shifting zones. Persisting `LocalDateTime` for events, or defaulting to the server\'s zone (`ZoneId.systemDefault()` sneaks in via one-arg factory methods), breeds bugs that only fire twice a year. Events → `Instant`; future scheduled *local* times (a 9:00 alarm) → `LocalTime` + `ZoneId`, resolved late.',
      },
      {
        kind: 'note',
        title: 'Testing time',
        text: 'Inject a `Clock` (`Clock.fixed(...)`, `Clock.offset(...)`) instead of calling `Instant.now()` directly — every `now()` overload accepts one. Time-dependent logic becomes deterministic under test.',
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
      'Declare with `@interface`; elements look like methods with optional defaults',
      '`@Retention(RUNTIME)` for reflection-read; `SOURCE`/`CLASS` for compile-time tools',
      '`@Target` restricts placement (TYPE, METHOD, FIELD, PARAMETER, TYPE_USE…)',
      'Standard set: `@Override`, `@Deprecated(since, forRemoval)`, `@SuppressWarnings`, `@FunctionalInterface`, `@SafeVarargs`',
      'Frameworks run on annotations: DI (`@Inject`), JPA (`@Entity`), JUnit (`@Test`), Jackson (`@JsonProperty`)',
      'Prefer annotations to naming patterns (EJ 39); always use `@Override` (EJ 40)',
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
      },
      {
        kind: 'note',
        title: 'Annotations are not logic',
        text: 'An annotation is a claim, not a behavior — `@Transactional` does nothing unless a proxy or agent weaves the transaction. Understanding *which machinery* reads each annotation (compiler? agent? framework at startup? reflection per-call?) is understanding your stack\'s magic.',
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
      '`Class<?>` is the entry: `obj.getClass()`, `MyType.class`, `Class.forName(name)`',
      '`getDeclaredFields/Methods/Constructors` (all, this class) vs `getFields/…` (public, inherited)',
      '`setAccessible(true)` bypasses access control — within module limits (JPMS `opens`)',
      'Costs: no compile-time checking, slower dispatch, refactoring-invisible, module friction',
      'Generic *declarations* survive erasure and are readable (`getGenericType`)',
      '`Proxy.newProxyInstance` fabricates interface implementations at runtime — the AOP primitive',
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
      },
      {
        kind: 'note',
        title: 'Reading generics reflectively',
        text: '`field.getGenericType()` returns a `ParameterizedType` exposing `List<String>`\'s type arguments — erasure removed them from objects, not from class-file signatures ([[type-erasure]]). This is how Jackson knows what to deserialize into a `List<Customer>` field.',
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
      '`requires` declares dependencies; `exports` opens packages to compilers and callers',
      '`opens` permits deep reflection (frameworks!) without exporting the API',
      'Strong encapsulation: non-exported packages are inaccessible — even reflectively',
      'Unnamed module (classpath) and automatic modules (jars on module path) ease migration',
      '`requires transitive` re-exports; `provides/uses` wires ServiceLoader',
      '`jlink` assembles a minimal runtime image from just the modules you use',
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
      },
      {
        kind: 'note',
        title: 'ServiceLoader',
        text: 'The `provides`/`uses` pair (or `META-INF/services` on the classpath) lets implementations register themselves and consumers discover them without compile-time coupling — how JDBC drivers, charset providers, and plugin systems load. `ServiceLoader.load(Exporter.class)` iterates every provider on the path.',
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
      '**Always** `PreparedStatement` with `?` parameters — string-concatenated SQL is injection',
      'Pool connections (HikariCP is the de facto standard) — physical connects cost ~ms each',
      'try-with-resources every Connection/Statement/ResultSet — leaks exhaust the pool',
      'Transactions: `setAutoCommit(false)` → work → `commit()`; rollback in the catch',
      'Batch inserts (`addBatch`/`executeBatch`) are 10–100× faster than row-at-a-time',
      '`ResultSet` is a cursor: `while (rs.next())`, typed getters, `wasNull` for primitives',
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
      '`Locale` = language + region (+ script/variant): `Locale.forLanguageTag("sr-Latn-RS")`',
      'Format numbers/currency/dates with `NumberFormat`/`DateTimeFormatter.withLocale` — never string-build them',
      '`ResourceBundle` + `messages_de_DE.properties` selects translations by locale with fallback',
      '`MessageFormat`/`ChoiceFormat` handle placeholder order and plural forms per language',
      'Collation (`Collator`) sorts text per locale rules — `String.compareTo` is code-point order, not human order',
      'Never default silently: locale-sensitive APIs have overloads taking an explicit `Locale`',
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
      },
      {
        kind: 'note',
        title: 'Unicode hygiene',
        text: 'Normalize before comparing (`Normalizer.normalize(s, NFC)` — "é" has two encodings); count grapheme clusters, not chars, for user-perceived length ([[strings-text]]); and test with names like "María-José Ñusta 李小龙" early, not after launch.',
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
      'Passwords: salted adaptive hashes (bcrypt/scrypt/Argon2) — never MD5/SHA-x, never reversible',
      'Symmetric crypto: AES-GCM via `Cipher` ("AES/GCM/NoPadding"), fresh random IV per message',
      '`SecureRandom` for anything security-relevant; `Random`/`ThreadLocalRandom` are predictable',
      'Java-specific sins: native [[serialization]] of untrusted data, SQL injection ([[jdbc-database]]), XXE in XML parsers',
      'Validate input at trust boundaries; encode output for its destination (HTML, SQL, shell)',
      'Keep the JDK current — crypto defaults and TLS versions improve per release',
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
      },
      {
        kind: 'note',
        title: 'TLS on the client',
        text: '`HttpClient` verifies certificates and hostnames by default — the dangerous act is *disabling* it: any `TrustManager` accepting all certs ships MITM-ready code, and copy-paste makes it permanent. Fix trust properly (import the CA into a truststore) instead. The SecurityManager, historically part of this chapter, was removed (JEP 411); process/container isolation replaced it.',
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
      'JNI: `native` methods + generated headers + C glue compiled per platform — powerful, painful, unsafe',
      'JNI crashes take the whole JVM — a segfault in glue code is not an exception',
      'FFM (JEP 454): `Linker` + `SymbolLookup` bind C functions to `MethodHandle`s — no glue code',
      '`MemorySegment` + `Arena` manage off-heap memory with deterministic, scope-checked lifetime',
      'jextract generates Java bindings from C headers automatically',
      'When possible, avoid interop entirely — a pure-Java library outlives every binding',
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
      },
      {
        kind: 'note',
        title: 'Why Panama matters strategically',
        text: 'Off-heap data structures ([[binary-data-buffers|beyond ByteBuffer\'s 2 GB int-indexed limits]]), zero-copy interop with ML/graphics/database libraries, and an official replacement for `sun.misc.Unsafe` (whose memory-access methods are deprecated for removal). Vector API (SIMD) and FFM together are Java\'s bid for the performance-adjacent domains it used to concede ([[future-directions]]).',
      },
    ],
    refs: [
      { book: 'core-java-2', chapter: 'Ch. 13 — Native Methods (incl. 13.11 Foreign Functions)' },
      { book: 'ocnj', chapter: 'Ch. 15 — Modern Performance and The Future' },
    ],
    related: ['ffm-api', 'binary-data-buffers', 'memory-layout'],
  },
]
