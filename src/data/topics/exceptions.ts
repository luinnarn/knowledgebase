import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'exception-hierarchy',
    domainId: 'exceptions',
    title: 'The Exception Hierarchy',
    summary:
      'All throwables descend from `Throwable`, splitting into `Error` (JVM-level, don\'t catch), checked `Exception` (declared, recoverable) and unchecked `RuntimeException` (programming errors). The checked/unchecked line is a design decision, not an accident.',
    keyPoints: [
      '`Error`: OutOfMemoryError, StackOverflowError — the JVM is in trouble; don\'t catch',
      'Checked exceptions must be caught or declared (`throws`) — for conditions callers can recover from',
      '`RuntimeException` (NPE, IAE, ISE, IndexOutOfBounds…) signals **precondition violations** — bugs',
      'Use checked for recoverable conditions, runtime for programming errors (EJ 70)',
      'The stack trace is captured where the exception is **constructed**',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The three families',
        headers: ['Family', 'Examples', 'Catch it?', 'Meaning'],
        rows: [
          ['`Error`', '`OutOfMemoryError`, `StackOverflowError`, `NoClassDefFoundError`', 'No', 'JVM/resource failure — unrecoverable'],
          ['Checked `Exception`', '`IOException`, `SQLException`, `InterruptedException`', 'Yes (or declare)', 'Anticipated failures of correct code'],
          ['`RuntimeException`', '`NullPointerException`, `IllegalArgumentException`, `IllegalStateException`', 'Rarely', 'Bugs: violated preconditions'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The compiler enforces honesty about checked exceptions: a method that can fail in a documented way must say so in its signature, and callers must respond. That is powerful for genuinely recoverable conditions (a missing file has a story: ask the user for another) and heavy for conditions no caller can fix — which is why modern Java API design leans unchecked ([[exception-best-practices]]).',
      },
      {
        kind: 'code',
        title: 'Standard unchecked vocabulary (EJ Item 72)',
        code: 'void withdraw(BigDecimal amount) {\n    Objects.requireNonNull(amount, "amount");                    // NPE for null args\n    if (amount.signum() <= 0)\n        throw new IllegalArgumentException("amount must be positive: " + amount);\n    if (closed)\n        throw new IllegalStateException("account closed");        // wrong object state\n    ...\n}',
      },
      {
        kind: 'paragraph',
        text: 'Reuse the standard exceptions — `IllegalArgumentException` (bad parameter value), `IllegalStateException` (object not ready), `NullPointerException` (null where forbidden), `IndexOutOfBoundsException`, `UnsupportedOperationException` — every Java developer already knows their contracts. Custom exception types earn their existence by carrying extra data or enabling distinct handling.',
      },
      {
        kind: 'note',
        title: 'Exceptions are for exceptional conditions (EJ Item 69)',
        text: 'Never use exceptions for ordinary control flow, and never write APIs that force it. A state-testing method (`hasNext`) or an Optional/sentinel return beats making callers catch. Exceptions are also genuinely expensive to *construct* (stack trace capture), one more reason they aren\'t a control-flow tool ([[language-performance]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 7.1–7.2 — Dealing with Errors; Catching Exceptions' },
      { book: 'effective-java', chapter: 'Items 69, 70, 72' },
      { book: 'learning-java', chapter: 'Ch. 6 — Error Handling and Logging' },
    ],
    related: ['catching-cleanup', 'exception-best-practices', 'assertions'],
  },

  {
    id: 'catching-cleanup',
    domainId: 'exceptions',
    title: 'Catching, Rethrowing & try-with-resources',
    summary:
      'Catch what you can handle; wrap-and-rethrow across abstraction boundaries; and let try-with-resources close everything that is `AutoCloseable` — it is shorter *and* more correct than any finally block you would write.',
    keyPoints: [
      'try-with-resources closes in reverse order, even on exceptions — always prefer it (EJ 9)',
      'Suppressed exceptions: a close-failure doesn\'t mask the real one (`getSuppressed`)',
      'Multi-catch: `catch (IOException | SQLException e)`',
      'Chain causes when translating: `throw new StorageException(e)` (EJ 73)',
      '`finally` remains for non-resource cleanup (locks, counters)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'try-with-resources',
        code: 'try (var in = new Scanner(Path.of("in.txt"), StandardCharsets.UTF_8);\n     var out = new PrintWriter("out.txt", StandardCharsets.UTF_8)) {\n    while (in.hasNext())\n        out.println(in.next().toUpperCase());\n}   // out closed first, then in — exception or not',
      },
      {
        kind: 'paragraph',
        text: 'The old `finally` idiom had two flaws this fixes: nested try/finally noise per resource, and the **masking bug** — an exception thrown by `close()` in finally silently discarded the original exception from the body. With try-with-resources the body\'s exception wins and close-failures attach as *suppressed* exceptions, visible in the stack trace and via `getSuppressed()`.',
      },
      {
        kind: 'code',
        title: 'Exception translation with cause chaining (EJ Item 73)',
        code: 'public UserProfile loadProfile(String id) {\n    try {\n        return parse(db.fetchRow(id));\n    } catch (SQLException e) {\n        // translate low-level detail into the abstraction callers understand,\n        // preserving the full diagnostic chain:\n        throw new ProfileStoreException("profile " + id, e);\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'The empty catch block (EJ Item 77)',
        text: 'An ignored exception is a program running with its check-engine light unscrewed — failures surface later, elsewhere, without context. If ignoring is genuinely correct (it occasionally is), name the variable `ignored` and comment why. Otherwise: at minimum, log it.',
      },
      {
        kind: 'pitfall',
        title: 'catch (Exception e) — the overbroad net',
        text: 'Catch-all handlers swallow NPEs and other bugs together with the failure you meant to handle, corrupting the "fail loudly at the bug" principle. Catch the most specific types; use multi-catch for genuine sharing; reserve catch-Exception for top-level boundaries that log and fail the request.',
      },
      {
        kind: 'note',
        title: 'Rethrow idioms',
        text: 'A `finally` that returns or throws silently discards the in-flight exception — never return from finally. When recording-and-rethrowing, prefer `catch (X e) { log(e); throw e; }`; the compiler\'s precise rethrow analysis keeps the declared types intact.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 7.2 — Catching Exceptions' },
      { book: 'effective-java', chapter: 'Items 9, 73, 77' },
    ],
    related: ['exception-hierarchy', 'io-streams', 'exception-best-practices'],
  },

  {
    id: 'exception-best-practices',
    domainId: 'exceptions',
    title: 'Exception Doctrine (EJ 69–77)',
    summary:
      'Effective Java\'s chapter 10, condensed: exceptions only for exceptional conditions, checked only when callers can recover, standard types over custom, translation at layer boundaries, documentation and failure-capture always, atomicity where possible.',
    keyPoints: [
      'Avoid unnecessary checked exceptions — they tax every caller (EJ 71)',
      'Document every exception thrown, with `@throws` (EJ 74)',
      'Detail messages must capture the values that caused the failure (EJ 75)',
      'Strive for failure atomicity: a failed call should leave the object as it was (EJ 76)',
      'Never let an exception escape with less information than it arrived with',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The doctrine at a glance',
        headers: ['Item', 'Rule'],
        rows: [
          ['69', 'Use exceptions only for exceptional conditions — never control flow'],
          ['70', 'Checked for recoverable conditions; runtime for programming errors'],
          ['71', 'Avoid unnecessary checked exceptions (consider Optional or state-testing)'],
          ['72', 'Favor standard exceptions (IAE, ISE, NPE, UOE…)'],
          ['73', 'Throw exceptions appropriate to the abstraction (translate + chain)'],
          ['74', 'Document all exceptions thrown by each method'],
          ['75', 'Include failure-capture information in detail messages'],
          ['76', 'Strive for failure atomicity'],
          ['77', 'Don\'t ignore exceptions'],
        ],
      },
      {
        kind: 'code',
        title: 'Failure-capture in messages (EJ Item 75)',
        code: '// Useless:  throw new IndexOutOfBoundsException();\n// Useful — carries every value needed to reproduce:\nthrow new IndexOutOfBoundsException(\n        "index " + index + " out of bounds for range [" + lower + ", " + upper + ")");',
      },
      {
        kind: 'paragraph',
        text: '**Failure atomicity** (EJ 76): validate parameters *before* mutating (`Stack.pop` checks emptiness before decrementing), order operations so mutation comes last, or work on a copy and swap in on success. Callers who catch your exception will reasonably assume the object is still usable — make that true.',
      },
      {
        kind: 'paragraph',
        text: 'On checked-exception cost (EJ 71): a checked exception forces try/catch or throws on every transitive caller and breaks lambda-based composition ([[functional-interfaces]]). Reserve it for cases where the caller genuinely can recover *and* no better design (Optional return, state-testing method) exists. When in doubt, unchecked.',
      },
      {
        kind: 'note',
        title: 'Logging discipline meets exceptions',
        text: 'Log-and-rethrow at every layer produces sextuple stack traces. Rule: an exception is logged **once**, at the boundary that handles it; intermediate layers translate or pass through. See [[logging]].',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 69–77' },
      { book: 'core-java-1', chapter: 'Ch. 7.3 — Tips for Using Exceptions' },
    ],
    related: ['exception-hierarchy', 'catching-cleanup', 'logging', 'optional'],
  },

  {
    id: 'assertions',
    domainId: 'exceptions',
    title: 'Assertions',
    summary:
      '`assert` documents and checks internal invariants during development — zero cost in production because assertions are disabled by default and compile to nothing unless `-ea` is passed.',
    keyPoints: [
      'Syntax: `assert condition;` or `assert condition : detailMessage;`',
      'Disabled by default; enable with `java -ea` (or `-ea:com.mycompany...`)',
      'For **internal invariants and unreachable states** — never for public-API argument checking',
      'A failed assert throws `AssertionError` — it should mean "impossible happened"',
      'Never put side effects in an assertion',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Internal invariants',
        code: 'private double normalize(double angle) {\n    double result = angle % (2 * Math.PI);\n    if (result < 0) result += 2 * Math.PI;\n    assert result >= 0 && result < 2 * Math.PI : "normalize broke: " + result;\n    return result;\n}\n\nswitch (phase) {\n    case SOLID -> melt();\n    case LIQUID -> boil();\n    default -> throw new AssertionError("unknown phase: " + phase);  // unreachable\n}',
      },
      {
        kind: 'paragraph',
        text: 'The division of labor: **public** method preconditions are enforced with real exceptions (`IllegalArgumentException`, `Objects.requireNonNull`) because they guard against *other people\'s* bugs and must fire in production. **Private** helpers may `assert` their preconditions — the calling code is yours, and the checks document assumptions for free.',
      },
      {
        kind: 'pitfall',
        title: 'Side effects in assertions vanish in production',
        text: '`assert list.remove(item);` removes the item only when assertions are enabled — production behavior silently differs from test behavior. Assertion conditions must be pure. Extract the action: `boolean removed = list.remove(item); assert removed;`.',
      },
      {
        kind: 'note',
        title: 'Enabling granularity',
        text: '`-ea` enables for all non-JDK classes, `-ea:com.acme.engine...` for a package tree, `-esa` for JDK system classes. CI test runs should enable assertions globally — they are executable documentation you already wrote.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 7.4 — Using Assertions' },
      { book: 'effective-java', chapter: 'Item 49 (parameter checking contrast)' },
    ],
    related: ['exception-hierarchy', 'exception-best-practices'],
  },

  {
    id: 'logging',
    domainId: 'exceptions',
    title: 'Logging',
    summary:
      'Logs are the primary diagnostic instrument in production. Use a façade (SLF4J) over a modern backend, log at the right level with parameterized messages, and treat log output as a machine-readable data stream, not console decoration.',
    keyPoints: [
      'Levels: ERROR (action needed) > WARN (surprising, tolerated) > INFO (lifecycle) > DEBUG > TRACE',
      'Parameterized logging `log.debug("user {}", id)` avoids string-building when disabled',
      'Pass the exception **object** as the last argument — that preserves the stack trace',
      'Log an exception once, at the layer that handles it',
      'In cloud environments: structured (JSON) logs to stdout, correlated by trace IDs ([[observability]])',
      'Logging is I/O on the hot path — async appenders for latency-sensitive apps',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The idioms',
        code: 'private static final Logger log = LoggerFactory.getLogger(OrderService.class);\n\nlog.info("order {} accepted for {}", orderId, customerId);   // parameterized — no concat cost\n\ntry {\n    charge(order);\n} catch (PaymentException e) {\n    log.error("payment failed for order {}", orderId, e);     // exception LAST — full trace kept\n    throw new OrderRejectedException(orderId, e);              // …or log OR rethrow, not both\n}',
      },
      {
        kind: 'paragraph',
        text: 'The JDK ships `java.util.logging` (Core Java covers it thoroughly), but the ecosystem consolidated on **SLF4J** as the API with Logback or Log4j2 behind it. The façade matters because libraries must not impose a logging implementation on applications. Configuration (levels per package, appenders, formats) lives outside the code.',
      },
      {
        kind: 'pitfall',
        title: 'log.debug("state: " + bigObject) — paying when silent',
        text: 'String concatenation happens **before** the level check, so disabled debug logs still serialize objects and burn allocations. Parameterized placeholders defer formatting until the level passes; guard with `if (log.isDebugEnabled())` only when computing the *argument* is itself expensive.',
      },
      {
        kind: 'paragraph',
        text: 'The performance books\' angle: logging is frequently the hidden bottleneck in high-throughput services — synchronous appenders serialize threads through a lock and an fsync. High-performance setups use async appenders with bounded queues, and confront the trade-off honestly: what happens to log events when the queue fills (block vs drop) is a real design decision (Optimizing Java ch. 14).',
      },
      {
        kind: 'note',
        title: 'What to log',
        text: 'Lifecycle transitions, request boundaries with IDs and durations, all handled failures with context, and nothing per-iteration in hot loops. Never log secrets or PII — logs outlive databases. For metrics, use a metrics library, not log parsing; for request flows across services, tracing ([[observability]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 7.5 — Logging' },
      { book: 'optimizing-java', chapter: 'Ch. 14 — High-Performance Logging and Messaging' },
      { book: 'ocnj', chapter: 'Ch. 10–11 — Observability' },
      { book: 'learning-java', chapter: 'Ch. 6 — Error Handling and Logging' },
    ],
    related: ['observability', 'exception-best-practices', 'catching-cleanup'],
  },
]
