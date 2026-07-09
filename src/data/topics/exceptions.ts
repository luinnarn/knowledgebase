import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'exception-hierarchy',
    domainId: 'exceptions',
    title: 'The Exception Hierarchy',
    summary:
      'All throwables descend from `Throwable`, splitting into `Error` (JVM-level, don\'t catch), checked `Exception` (declared, recoverable) and unchecked `RuntimeException` (programming errors). The checked/unchecked line is a design decision, not an accident.',
    keyPoints: [
      {
        text: '`Error`: OutOfMemoryError, StackOverflowError — the JVM is in trouble; don\'t catch',
        detail: 'An `Error` means the JVM itself can no longer guarantee correct execution — there is no heap left, or the stack is exhausted. Catching it and continuing is a lie: the thread that ran out of memory may have left shared state half-mutated. Let the process die (or the container restart it) rather than papering over a JVM-level failure.',
      },
      {
        text: 'Checked exceptions must be caught or declared (`throws`) — for conditions callers can recover from',
        detail: 'The compiler enforces this at every call site: if a method declares `throws IOException`, every caller must either handle it or re-declare it themselves, all the way up the call stack. That is the whole point — checked exceptions are a compiler-verified contract that a failure mode was considered, not silently forgotten.',
      },
      {
        text: '`RuntimeException` (NPE, IAE, ISE, IndexOutOfBounds…) signals **precondition violations** — bugs',
        detail: 'These fire because the calling code did something the API explicitly forbids — passed null where it is not allowed, an out-of-range index, called a method before the object was ready. There is no "recovery" from a bug; the fix is in the caller\'s code, not a catch block, which is why they are unchecked: forcing every caller to handle them would just encourage catching and ignoring real bugs.',
      },
      {
        text: 'Use checked for recoverable conditions, runtime for programming errors (EJ 70)',
        detail: 'Ask: if this fails, can a *reasonable caller* do something about it other than crash — retry, ask the user for different input, fall back? If yes, checked. If the only sane response is "the caller had a bug," unchecked. Most APIs lean unchecked today because genuinely recoverable conditions are rarer than they first appear.',
      },
      {
        text: 'The stack trace is captured where the exception is **constructed**',
        detail: '`Throwable.fillInStackTrace()` runs inside the constructor, not at the `throw` statement — so a pre-built, reused exception instance reports the stack from where it was originally `new`-ed, not from where it is thrown later. This is also why constructing an exception (even one you never throw) is not free: capturing a stack trace walks and records every frame.',
      },
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
        detail: 'The historical example is using an ArrayIndexOutOfBoundsException to detect the end of a loop instead of comparing against `size()` — it looks clever but is both slower (constructing an exception dwarfs a comparison) and obscures intent for the next reader. An API that offers no way to test state before acting (only "try it and catch the failure") forces every caller into this trap; `Iterator.hasNext()` exists specifically so callers never have to catch just to know when to stop.',
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
      {
        text: 'try-with-resources closes in reverse order, even on exceptions — always prefer it (EJ 9)',
        detail: 'Reverse order mirrors how resources are typically opened and depend on each other — if resource B was opened using resource A, closing B first (before A) is the safe order, exactly like unwinding a stack. try-with-resources gets this right automatically; a hand-written nested finally block that closes in the wrong order is a subtle, easy-to-introduce bug.',
      },
      {
        text: 'Suppressed exceptions: a close-failure doesn\'t mask the real one (`getSuppressed`)',
        detail: 'If the try block throws, and then `close()` *also* throws while unwinding, the original exception is the one propagated — the close-failure is attached to it via `addSuppressed` and retrievable with `getSuppressed()`. Nothing is silently lost; both failures are visible in the printed stack trace, under a "Suppressed:" section.',
      },
      {
        text: 'Multi-catch: `catch (IOException | SQLException e)`',
        detail: 'Multi-catch only works when the handling logic is identical for both types — the compiler infers `e`\'s static type as the least upper bound of the alternatives (so you cannot call methods specific to just one), and it forbids catching two types where one is a subtype of the other (redundant). It exists to avoid duplicating a catch body for exceptions that genuinely get the same treatment.',
      },
      {
        text: 'Chain causes when translating: `throw new StorageException(e)` (EJ 73)',
        detail: 'Passing the original exception as the cause preserves the full underlying stack trace (accessible via `getCause()`) even though callers now see your higher-level exception type. Translating without chaining — `throw new StorageException(e.getMessage())` — throws away the original stack trace, turning debugging into guesswork.',
      },
      {
        text: '`finally` remains for non-resource cleanup (locks, counters)',
        detail: 'try-with-resources only helps for things implementing `AutoCloseable`. Releasing a `ReentrantLock`, decrementing a counter, or resetting a flag has no such interface, so `finally` (guaranteed to run whether the try block returns normally, throws, or even returns early) is still the right tool for that class of cleanup.',
      },
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
        detail: 'The failure does not go away when you swallow it — it just resurfaces later as a confusing downstream symptom (a null field, a stale cache, a missing row) with none of the context that would have explained it. Whoever debugs that later has to work backward from the symptom with no clue an exception was ever thrown, when the original catch block had the full story right there.',
      },
      {
        kind: 'pitfall',
        title: 'catch (Exception e) — the overbroad net',
        text: 'Catch-all handlers swallow NPEs and other bugs together with the failure you meant to handle, corrupting the "fail loudly at the bug" principle. Catch the most specific types; use multi-catch for genuine sharing; reserve catch-Exception for top-level boundaries that log and fail the request.',
        detail: '`Exception` is a supertype of every checked exception AND every `RuntimeException`, so `catch (Exception e)` also catches a `NullPointerException` from a genuine bug in the try block — and if that catch block just logs a warning and moves on, the bug is masked instead of surfaced. Narrow catches let real programming errors propagate up and fail loudly, which is exactly what should happen to a bug.',
      },
      {
        kind: 'note',
        title: 'Rethrow idioms',
        text: 'A `finally` that returns or throws silently discards the in-flight exception — never return from finally. When recording-and-rethrowing, prefer `catch (X e) { log(e); throw e; }`; the compiler\'s precise rethrow analysis keeps the declared types intact.',
        detail: 'If a `finally` block itself returns a value or throws, that action wins over whatever the try or catch block was doing — an in-flight exception is discarded without a trace, silently, as if it never happened. This is one of the few places the language lets you accidentally erase an error completely, so treat any `return`/`throw` inside `finally` as a red flag during review.',
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
      {
        text: 'Avoid unnecessary checked exceptions — they tax every caller (EJ 71)',
        detail: 'Every checked exception forces every single caller, transitively, up the call stack, to either catch it or declare it — including callers who have no meaningful way to recover. That tax is worth paying when recovery is genuinely possible; when it is not, the checked exception has bought nothing but boilerplate.',
      },
      {
        text: 'Document every exception thrown, with `@throws` (EJ 74)',
        detail: 'This applies to unchecked exceptions too, even though the compiler does not force it: a caller cannot defend against a failure mode they do not know exists. An undocumented `IllegalStateException` from deep inside a call chain is a debugging session waiting to happen for someone who never read the source.',
      },
      {
        text: 'Detail messages must capture the values that caused the failure (EJ 75)',
        detail: 'A message like "invalid index" is useless three months later in a production log — it tells you *that* something went wrong but not *what*. Include every parameter and field value relevant to the failure so the message alone is enough to reproduce the bug, without needing to re-run anything.',
      },
      {
        text: 'Strive for failure atomicity: a failed call should leave the object as it was (EJ 76)',
        detail: 'If a method throws partway through and leaves the object in some intermediate, half-updated state, the caller\'s catch block cannot safely assume anything about that object afterward — not even that it is still usable. Atomicity means a caller can catch the exception, log it, and keep using the object exactly as if the failed call had never been attempted.',
      },
      {
        text: 'Never let an exception escape with less information than it arrived with',
        detail: 'This is the argument against catching an exception and re-throwing a plain, new one built only from a hardcoded string — every rethrow point is an opportunity to either preserve context (chain the cause, keep the original message) or accidentally erase it. Once information is gone, no one downstream can get it back.',
      },
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
        detail: 'If a service layer, a controller layer, and a top-level handler each log the same exception before rethrowing it, one failure produces three (or six, if each logs both entry and translation) near-identical stack traces in the logs — noise that makes the real incident harder to find, not easier. Pick one place, usually the outermost boundary that actually decides how to respond to the failure, and log there exactly once.',
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
      {
        text: 'Syntax: `assert condition;` or `assert condition : detailMessage;`',
        detail: 'The optional message after the colon is evaluated lazily — only when the assertion actually fails — so it is fine to make it expensive (building a diagnostic string, formatting several fields), since a passing assertion never pays that cost.',
      },
      {
        text: 'Disabled by default; enable with `java -ea` (or `-ea:com.mycompany...`)',
        detail: 'This is why assertions can check expensive invariants freely: without `-ea`, `assert` statements compile to a no-op guarded by a static final boolean, and the JIT eliminates them from the compiled code entirely. There is no production performance argument against writing more of them.',
      },
      {
        text: 'For **internal invariants and unreachable states** — never for public-API argument checking',
        detail: 'Public methods must validate arguments with real, always-on checks (`IllegalArgumentException`, `Objects.requireNonNull`) because a caller from outside your control can pass anything — an assertion would silently vanish in production and the bad input would corrupt state instead of failing fast. Assertions are for conditions your own code should have already guaranteed.',
      },
      {
        text: 'A failed assert throws `AssertionError` — it should mean "impossible happened"',
        detail: '`AssertionError` intentionally does not extend `Exception` — it signals that a supposedly-impossible state was reached, not a recoverable condition. Catching it to "handle" the failure defeats the purpose; if it fires during testing, the fix belongs in the code, not in a catch block.',
      },
      {
        text: 'Never put side effects in an assertion',
        detail: 'Because assertions disappear entirely without `-ea`, any side effect written inside one — a list mutation, a counter increment, a call whose return value matters — silently stops happening in production, while tests (which typically run with assertions enabled) never reveal the gap.',
      },
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
        detail: 'This is the single most dangerous assertion mistake because it does not fail loudly — the program keeps running, just with different behavior than whatever was tested with `-ea` on. The tell is any assertion whose condition does more than return a boolean; extract the action to its own statement and assert only the resulting value.',
      },
      {
        kind: 'note',
        title: 'Enabling granularity',
        text: '`-ea` enables for all non-JDK classes, `-ea:com.acme.engine...` for a package tree, `-esa` for JDK system classes. CI test runs should enable assertions globally — they are executable documentation you already wrote.',
        detail: 'Assertions are opt-in per JVM invocation, not per class, so a team can easily forget to enable them in CI and never notice a broken invariant until it fails a different, less obvious way in production. Wiring `-ea` into the test runner configuration once, rather than relying on every developer remembering a JVM flag locally, is the reliable fix.',
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
      {
        text: 'Levels: ERROR (action needed) > WARN (surprising, tolerated) > INFO (lifecycle) > DEBUG > TRACE',
        detail: 'The hierarchy is also a filter: setting the root logger to INFO silently drops every DEBUG and TRACE call site without touching code. Levels are chosen for the *audience* — ERROR/WARN for whoever gets paged, INFO for an operator watching lifecycle events, DEBUG/TRACE for a developer actively investigating one specific incident.',
      },
      {
        text: 'Parameterized logging `log.debug("user {}", id)` avoids string-building when disabled',
        detail: 'Writing `"user " + id` instead builds the string unconditionally, even when the debug level is disabled and the result is thrown away — the concatenation (and any `toString()` calls inside it) happens regardless. The `{}` placeholder form defers formatting to inside the logger, which checks the level first and skips the work entirely when it is disabled.',
      },
      {
        text: 'Pass the exception **object** as the last argument — that preserves the stack trace',
        detail: 'Logging frameworks special-case a final `Throwable` argument specifically to attach the full stack trace to the log record. `log.error("failed", e)` keeps the trace; `log.error("failed: " + e.getMessage())` keeps only the message string and throws away exactly the information needed to debug it later.',
      },
      {
        text: 'Log an exception once, at the layer that handles it',
        detail: 'Every layer that catches, logs, and rethrows the same exception multiplies one failure into several near-duplicate stack traces in the log stream. Decide once which layer actually owns the response to a given failure — usually the outermost one — and let every other layer translate or propagate it silently.',
      },
      {
        text: 'In cloud environments: structured (JSON) logs to stdout, correlated by trace IDs ([[observability]])',
        detail: 'Plain-text logs are built for a human reading one file; structured JSON logs are built for an aggregator that needs to filter, group, and correlate millions of lines across many service instances. A trace ID threaded through every log line — and propagated across service calls — is what lets you reconstruct one request\'s full path through a distributed system.',
      },
      {
        text: 'Logging is I/O on the hot path — async appenders for latency-sensitive apps',
        detail: 'A synchronous appender writes (and sometimes fsyncs) on the calling thread, so a burst of log calls can stall request-handling threads behind disk or network I/O. Async appenders hand the log record to a background thread via a queue, trading a small risk of losing the last few entries on a crash for keeping the hot path fast.',
      },
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
        detail: 'The `+` operator runs at the call site before the logging call is ever entered, so the JVM has no chance to skip it — by the time `log.debug` executes and checks whether DEBUG is enabled, the string is already built and `bigObject.toString()` has already run. Parameterized placeholders push that decision inside the logger, after the level check, not before it.',
      },
      {
        kind: 'paragraph',
        text: 'The performance books\' angle: logging is frequently the hidden bottleneck in high-throughput services — synchronous appenders serialize threads through a lock and an fsync. High-performance setups use async appenders with bounded queues, and confront the trade-off honestly: what happens to log events when the queue fills (block vs drop) is a real design decision (Optimizing Java ch. 14).',
      },
      {
        kind: 'note',
        title: 'What to log',
        text: 'Lifecycle transitions, request boundaries with IDs and durations, all handled failures with context, and nothing per-iteration in hot loops. Never log secrets or PII — logs outlive databases. For metrics, use a metrics library, not log parsing; for request flows across services, tracing ([[observability]]).',
        detail: 'The categories map to who reads them: lifecycle events help an operator understand what the service is doing right now, request IDs let anyone reconstruct one specific failure after the fact, and per-iteration logging inside a hot loop produces a volume no one will ever read while measurably slowing the loop down. Secrets and PII in particular tend to leak into log-aggregation systems that have much weaker access controls than the database they were copied from.',
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
