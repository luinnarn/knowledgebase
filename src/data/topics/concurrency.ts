import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'threads-lifecycle',
    domainId: 'concurrency',
    title: 'Threads & Their Lifecycle',
    summary:
      'A `Thread` executes a `Runnable` concurrently with the rest of the program. Threads are the unit of scheduling; understanding their states — and interruption, the cooperative stop mechanism — underlies everything else in concurrency.',
    keyPoints: [
      'Start with `Thread.ofPlatform().start(task)` / `new Thread(task).start()` — never call `run()` directly',
      'States: NEW → RUNNABLE ⇄ (BLOCKED | WAITING | TIMED_WAITING) → TERMINATED',
      'Interruption is **cooperative**: `interrupt()` sets a flag; the target must check or be blocked',
      '`InterruptedException` clears the flag — restore it or rethrow, never swallow',
      'Daemon threads don\'t keep the JVM alive',
      'In application code, prefer [[executors-thread-pools|executors]] over raw threads (EJ 80)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Creating and joining',
        code: 'Thread worker = Thread.ofPlatform().name("loader").start(() -> load(data));\n// … do other work …\nworker.join();                      // wait for completion\n\nThread vt = Thread.ofVirtual().start(() -> fetch(url));   // virtual: cheap, see Virtual Threads',
      },
      {
        kind: 'paragraph',
        text: 'Calling `run()` executes the task on **your** thread — the classic beginner bug; `start()` is what creates the new one. A thread terminates when its `run` method returns or throws; an uncaught exception kills only that thread (install an `UncaughtExceptionHandler` to at least log it — silent thread death is a notorious production mystery).',
      },
      {
        kind: 'table',
        caption: 'Thread states (Thread.getState())',
        headers: ['State', 'Meaning', 'Typical cause'],
        rows: [
          ['NEW', 'created, not started', 'before `start()`'],
          ['RUNNABLE', 'running or ready to run', 'normal execution'],
          ['BLOCKED', 'waiting for a monitor lock', 'contended `synchronized`'],
          ['WAITING', 'parked indefinitely', '`join()`, `wait()`, `park()`'],
          ['TIMED_WAITING', 'parked with a deadline', '`sleep(ms)`, `join(ms)`, `wait(ms)`'],
          ['TERMINATED', 'run() finished', 'completion or uncaught exception'],
        ],
      },
      { kind: 'subheading', text: 'Interruption — the only sane way to stop' },
      {
        kind: 'code',
        title: 'Responding to interruption',
        code: 'public void run() {\n    try {\n        while (!Thread.currentThread().isInterrupted()) {\n            process(queue.take());          // blocking calls throw InterruptedException\n        }\n    } catch (InterruptedException e) {\n        Thread.currentThread().interrupt(); // restore the flag for callers up-stack\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'Swallowing InterruptedException',
        text: '`catch (InterruptedException e) {}` erases the stop request — the thread (often a pool worker) keeps running and the shutdown hangs. Either rethrow, or restore with `Thread.currentThread().interrupt()` so code above you can react (JCiP ch. 7). `Thread.stop()`/`suspend()` are deprecated for good reason: they kill threads while holding locks mid-invariant.',
      },
      {
        kind: 'note',
        title: 'sleep and yield',
        text: '`Thread.sleep(ms)` parks without releasing any locks you hold. `Thread.onSpinWait()` hints busy-wait loops to the CPU. Scheduling priorities are best ignored — they map inconsistently to OS priorities (EJ 84: don\'t depend on the thread scheduler).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 10.1–10.3 — Running Threads; Thread States; Properties' },
      { book: 'jcip', chapter: 'Ch. 7 — Cancellation and Shutdown' },
      { book: 'learning-java', chapter: 'Ch. 9 — Threads' },
    ],
    related: ['thread-safety', 'executors-thread-pools', 'virtual-threads'],
  },

  {
    id: 'thread-safety',
    domainId: 'concurrency',
    title: 'Thread Safety',
    summary:
      'A class is thread-safe when it behaves correctly under concurrent access with no extra coordination by callers. The core discipline (JCiP): identify shared mutable state, and guard every access to it with the same lock — or remove the sharing, or the mutability.',
    keyPoints: [
      'The problem is exactly **shared + mutable** state — remove either property and safety is free',
      'Race conditions: check-then-act and read-modify-write compound actions are not atomic',
      'Every shared mutable variable needs **one** guarding policy, applied on every access — reads too',
      'Stateless objects and immutable objects are always thread-safe',
      'Document the policy (`@GuardedBy("lock")` thinking) — safety is a design property, not a code style',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The canonical race (JCiP Listing 2.2)',
        code: 'public class UnsafeCounter {\n    private long count = 0;\n    public void increment() { count++; }     // read-modify-write: THREE operations\n}\n// Two threads calling increment() 10,000 times each\n// routinely produce a total under 20,000 — lost updates.',
      },
      {
        kind: 'paragraph',
        text: '`count++` is load, add, store. Two threads interleave: both load 9, both store 10 — one increment vanishes. **Check-then-act** is the same disease: `if (!map.containsKey(k)) map.put(k, v)` can both pass the check. Compound actions must execute atomically relative to other accesses of the same state.',
      },
      {
        kind: 'code',
        title: 'Three cures',
        code: '// 1. Synchronize every access (one lock, all accesses):\nprivate long count;\npublic synchronized void increment() { count++; }\npublic synchronized long get() { return count; }\n\n// 2. Delegate to an atomic ([[atomics-nonblocking]]):\nprivate final AtomicLong count = new AtomicLong();\npublic void increment() { count.incrementAndGet(); }\n\n// 3. Don\'t share: confine to one thread, or make the state immutable.',
      },
      {
        kind: 'paragraph',
        text: 'JCiP\'s design hierarchy: **don\'t share** (thread confinement — locals, `ThreadLocal`, per-request objects), **don\'t mutate** ([[immutability-class-design|immutable objects]]), or **synchronize consistently**. Guarding *some* accesses is worthless — a single unsynchronized read can observe garbage ([[java-memory-model]]). And atomicity must cover the whole invariant: two `AtomicLong`s that must change together are not atomic together.',
      },
      {
        kind: 'pitfall',
        title: 'Thread-safe components ≠ thread-safe composite',
        text: '`if (!list.contains(x)) list.add(x)` on a synchronized list is still a race — the lock is released between the two calls. Client-side locking must use the **same** lock the collection uses, or better: use a collection API that makes the compound action atomic (`putIfAbsent`, `computeIfAbsent` — [[concurrent-collections]]).',
      },
      {
        kind: 'bestPractice',
        title: 'Synchronize access to shared mutable data (EJ Item 78)',
        text: 'Synchronization is required for **both** mutual exclusion and memory visibility. The cheapest correct policy, in order: confine it, make it immutable, use a concurrent library class, and only then hand-rolled locking. Never invent "clever" lock-free schemes without the JMM chops to prove them.',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 1–2 — Introduction; Thread Safety' },
      { book: 'effective-java', chapter: 'Item 78' },
      { book: 'core-java-1', chapter: 'Ch. 10.5 — Synchronization' },
    ],
    related: ['sharing-objects', 'locks-synchronization', 'immutability-class-design', 'concurrent-collections'],
  },

  {
    id: 'sharing-objects',
    domainId: 'concurrency',
    title: 'Sharing Objects: Visibility & Publication',
    summary:
      'Locking is not only mutual exclusion — it is memory **visibility**. Without synchronization, one thread\'s writes may never become visible to another, in any order. Publish objects safely or watch them arrive half-constructed.',
    keyPoints: [
      'No synchronization ⇒ no visibility guarantee: stale reads, reorderings, infinite loops',
      '`volatile` guarantees visibility (and ordering) for a single variable — not atomicity of compound ops',
      'Safe publication: static initializer, `volatile`/`AtomicReference`, `final` fields, or a lock/concurrent collection',
      '`final` fields are visible correctly after construction — immutable objects publish safely through anything',
      'Never let `this` escape during construction (listeners, inner classes starting threads)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The visibility failure (JCiP Listing 3.1)',
        code: 'public class NoVisibility {\n    private static boolean ready;\n    private static int number;\n\n    static void reader() {\n        while (!ready) Thread.onSpinWait();   // may loop FOREVER (stale read)\n        System.out.println(number);           // may print 0 (reordering!)\n    }\n\n    public static void main(String[] a) {\n        new Thread(NoVisibility::reader).start();\n        number = 42;\n        ready = true;                          // unsynchronized writes\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Both failures are legal outcomes: the JIT may hoist `ready` out of the loop, and the CPU/compiler may reorder the writes ([[java-memory-model]], [[hardware-memory]]). Declaring `ready` **volatile** fixes both — a volatile write *happens-before* the read that sees it, dragging `number = 42` into view with it.',
      },
      {
        kind: 'code',
        title: 'volatile: the flag idiom (and its limit)',
        code: 'private volatile boolean shutdownRequested;   // one writer, many readers: perfect\n\npublic void shutdown() { shutdownRequested = true; }\nwhile (!shutdownRequested) { doWork(); }\n\nprivate volatile int hits;\nhits++;                 // STILL A RACE — volatile read + write, not atomic RMW',
      },
      { kind: 'subheading', text: 'Safe publication' },
      {
        kind: 'paragraph',
        text: 'Publishing = making an object visible to other threads. Done unsafely (plain field write), another thread can observe the reference **before** the constructor\'s writes — a half-built object. The safe idioms (JCiP 3.5): initialize in a static initializer; store into `volatile`/`AtomicReference`; store into a `final` field of a properly published object; or hand it over via a lock-guarded field or concurrent collection (a `BlockingQueue` between producer and consumer is a safe-publication conveyor belt).',
      },
      {
        kind: 'pitfall',
        title: 'Escaping this',
        text: 'Registering a listener or starting a thread **inside a constructor** publishes `this` before construction completes — another thread can call back into a half-initialized object. Use a private constructor + static factory that finishes construction, then registers (JCiP Listing 3.8).',
      },
      {
        kind: 'note',
        title: 'Immutable = publish anywhere',
        text: 'Objects with only `final` fields whose state can\'t change (and didn\'t escape during construction) may be published through even a data race and still be seen fully built — the JMM\'s special guarantee for `final`. One more reason [[immutability-class-design|immutability]] is the concurrency cheat code.',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 3 — Sharing Objects' },
      { book: 'core-java-1', chapter: 'Ch. 10.5 — Synchronization (visibility)' },
      { book: 'effective-java', chapter: 'Item 78' },
    ],
    related: ['java-memory-model', 'thread-safety', 'immutability-class-design', 'atomics-nonblocking'],
  },

  {
    id: 'locks-synchronization',
    domainId: 'concurrency',
    title: 'Locks & Synchronization',
    summary:
      '`synchronized` couples mutual exclusion with visibility, per object monitor, automatically released. `ReentrantLock` adds tryLock, timeouts, interruptibility, and fairness; `ReadWriteLock` and `StampedLock` optimize read-heavy access.',
    keyPoints: [
      'Every object has a monitor; `synchronized(obj)` / synchronized methods acquire it, re-entrantly',
      'Static synchronized methods lock on the **Class** object — a different lock than instances',
      'Keep critical sections small; never call alien methods or do I/O while holding a lock (EJ 79)',
      '`ReentrantLock` when you need tryLock/timeout/interruptible/fair — else `synchronized` is fine',
      '`ReadWriteLock`: many concurrent readers OR one writer; `StampedLock` adds optimistic reads',
      'Lock on a `private final Object lock` to prevent outsiders locking your monitor',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'synchronized — the default tool',
        code: 'public class Vault {\n    private final Object lock = new Object();   // private lock object: uninterferable\n    private final Map<String, byte[]> secrets = new HashMap<>();\n\n    public void store(String id, byte[] value) {\n        byte[] copy = value.clone();             // work OUTSIDE the lock\n        synchronized (lock) {\n            secrets.put(id, copy);               // only the shared-state touch inside\n        }\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Monitors are **reentrant**: a thread holding the lock may re-acquire it (synchronized method calling another synchronized method of the same object) — without reentrancy that would self-deadlock. The lock releases automatically on exit, exception or not. Modern JVMs make uncontended `synchronized` extremely cheap (biased/thin locks; see [[concurrent-performance]]); contention, not the keyword, is what costs.',
      },
      {
        kind: 'code',
        title: 'ReentrantLock — when you need the extras',
        code: 'private final ReentrantLock lock = new ReentrantLock();\n\npublic boolean transfer(Account to, long amount) throws InterruptedException {\n    if (lock.tryLock(1, TimeUnit.SECONDS)) {     // give up instead of deadlocking\n        try {\n            balance -= amount;\n            to.deposit(amount);\n            return true;\n        } finally {\n            lock.unlock();                        // ALWAYS in finally\n        }\n    }\n    return false;\n}',
      },
      {
        kind: 'pitfall',
        title: 'Avoid excessive synchronization (EJ Item 79)',
        text: 'Calling an overridable method or a caller-supplied lambda **while holding a lock** invites deadlock and `ConcurrentModificationException` from within your own class — the alien code can do anything, including lock something else or call back into you. Snapshot state, exit the lock, then notify (or use `CopyOnWriteArrayList` for listener lists).',
      },
      {
        kind: 'code',
        title: 'Read-heavy structures',
        code: 'private final ReadWriteLock rw = new ReentrantReadWriteLock();\n\npublic Config read() {\n    rw.readLock().lock();          // readers share\n    try { return snapshot(); } finally { rw.readLock().unlock(); }\n}\npublic void update(Config c) {\n    rw.writeLock().lock();         // writer excludes everyone\n    try { apply(c); } finally { rw.writeLock().unlock(); }\n}',
      },
      {
        kind: 'note',
        title: 'StampedLock and the modern pecking order',
        text: '`StampedLock.tryOptimisticRead()` reads without locking at all, then validates the stamp — brilliant for read-mostly hot paths, but non-reentrant and subtle. Practical order of preference: no shared state > immutable > [[concurrent-collections]]/atomics > `synchronized` > `ReentrantLock` > `ReadWriteLock` > `StampedLock`. Note: virtual-thread pinning by `synchronized` was resolved in JDK 24 (JEP 491); on 21 LTS, long-held `synchronized` around blocking I/O still argues for `ReentrantLock` in virtual-thread-heavy services ([[virtual-threads]]).',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 2, 13 — Thread Safety; Explicit Locks' },
      { book: 'core-java-1', chapter: 'Ch. 10.5 — Synchronization' },
      { book: 'effective-java', chapter: 'Item 79' },
    ],
    related: ['thread-safety', 'liveness-hazards', 'synchronizers', 'concurrent-performance'],
  },

  {
    id: 'java-memory-model',
    domainId: 'concurrency',
    title: 'The Java Memory Model',
    summary:
      'The JMM defines which writes a read may observe, via the **happens-before** partial order. If two accesses to the same variable aren\'t ordered by happens-before and one is a write, that\'s a data race — and "sequential consistency" intuition no longer applies.',
    keyPoints: [
      'Compilers and CPUs reorder aggressively; the JMM is the contract that tames it',
      'happens-before sources: program order, monitor unlock→lock, volatile write→read, `Thread.start`, `Thread.join`, `final`-field freeze',
      'Data race = concurrent conflicting accesses without happens-before ordering',
      'Synchronization "piggybacks": one volatile/lock edge orders **all** prior writes, not just the flagged variable',
      'The double-checked-locking idiom is broken without `volatile`',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Modern performance rests on reordering: compilers hoist, CPUs execute out of order, store buffers delay visibility ([[hardware-memory]]). Single-threaded code can\'t tell — the JIT preserves *as-if-serial* semantics per thread. Between threads, only **happens-before** edges constrain what a read can return. No edge → the read may see a stale value, a later value, or (for 64-bit non-volatile longs/doubles, in theory) a torn value.',
      },
      {
        kind: 'code',
        title: 'Piggybacking: one edge orders everything before it',
        code: 'class Handoff {\n    private int payload;                 // plain field — no volatile needed\n    private volatile boolean ready;\n\n    void produce() {\n        payload = compute();             // ①\n        ready = true;                    // ② volatile write\n    }\n    void consume() {\n        if (ready)                        // ③ volatile read that sees ②\n            use(payload);                 // ④ guaranteed to see ① — happens-before is transitive\n    }\n}',
      },
      {
        kind: 'code',
        title: 'Double-checked locking — correct only with volatile',
        code: 'private static volatile Helper instance;      // volatile is load-bearing!\n\nstatic Helper getInstance() {\n    Helper h = instance;                       // local read (one volatile access)\n    if (h == null) {\n        synchronized (Helper.class) {\n            h = instance;\n            if (h == null) instance = h = new Helper();\n        }\n    }\n    return h;\n}\n// Without volatile, another thread can see a non-null reference\n// to a Helper whose constructor writes haven\'t been made visible.\n// Simpler alternatives: holder-class idiom, or an enum (EJ 83).',
      },
      {
        kind: 'paragraph',
        text: 'The **lazy initialization holder class idiom** gets the same laziness from the class loader\'s own synchronization, with zero volatile subtlety: `static class Holder { static final Helper INSTANCE = new Helper(); }` — the JVM guarantees class initialization is safely published ([[class-loading]]). Effective Java Item 83: prefer it; and mostly, don\'t lazy-initialize at all.',
      },
      {
        kind: 'pitfall',
        title: '"It works on my machine" is the JMM\'s cruelest joke',
        text: 'x86 hardware forbids most reorderings the JMM permits, so racy code often passes tests on developer laptops and fails on ARM servers (or after a JIT recompile). You cannot test your way out of a data race — only reason your way, or use tools (jcstress) built for it. When in doubt, add the synchronization.',
      },
      {
        kind: 'note',
        title: 'Beyond volatile',
        text: '`VarHandle` (Java 9) exposes finer memory modes — acquire/release, opaque — for lock-free experts; `Atomic*` classes bundle CAS with volatile semantics ([[atomics-nonblocking]]). For everyone else: the well-worn idioms above plus the java.util.concurrent toolbox encode the JMM so you don\'t have to.',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 16 — The Java Memory Model' },
      { book: 'optimizing-java', chapter: 'Ch. 12 — Concurrent Performance Techniques' },
      { book: 'core-java-1', chapter: 'Ch. 10.5 — Synchronization' },
    ],
    related: ['sharing-objects', 'hardware-memory', 'atomics-nonblocking', 'class-loading'],
  },

  {
    id: 'concurrent-collections',
    domainId: 'concurrency',
    title: 'Concurrent Collections',
    summary:
      '`ConcurrentHashMap`, `CopyOnWriteArrayList`, `ConcurrentSkipListMap`, and the blocking queues replace lock-wrapped collections with data structures designed for concurrency — atomic compound operations included.',
    keyPoints: [
      '`ConcurrentHashMap`: fine-grained locking per bin; reads never block; use `compute*`/`merge` for atomic updates',
      'Its iterators are weakly consistent — no `ConcurrentModificationException`, no snapshot either',
      '`CopyOnWriteArrayList`: copies the array per write — perfect for read-mostly listener lists',
      '`BlockingQueue` (`ArrayBlockingQueue`, `LinkedBlockingQueue`) = producer-consumer with built-in backpressure',
      '`ConcurrentSkipListMap/Set`: the concurrent sorted alternatives',
      'size()/isEmpty() are estimates under concurrency — design so you don\'t need exact answers',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Atomic compound operations',
        code: 'ConcurrentHashMap<String, LongAdder> hits = new ConcurrentHashMap<>();\n\n// check-then-act, made atomic by the map itself:\nhits.computeIfAbsent(page, k -> new LongAdder()).increment();\n\nConcurrentHashMap<String, Integer> stock = new ConcurrentHashMap<>();\nstock.merge(sku, -1, Integer::sum);              // atomic read-modify-write\nstock.putIfAbsent(sku, 0);',
      },
      {
        kind: 'paragraph',
        text: 'The whole point over `Collections.synchronizedMap`: compound actions (`putIfAbsent`, `computeIfAbsent`, `merge`, `replace(k, old, new)`) execute **atomically inside the map**, so callers don\'t need a lock spanning two calls ([[thread-safety]]). Throughput scales because writers contend per-bin (CAS + per-bin locks since Java 8), and readers proceed without any locking ([[java-memory-model|volatile reads]]).',
      },
      {
        kind: 'code',
        title: 'Producer–consumer with a BlockingQueue (JCiP ch. 5)',
        code: 'BlockingQueue<Task> queue = new ArrayBlockingQueue<>(1024);   // BOUNDED: backpressure\n\n// producer                              // consumer (each in its own thread)\nqueue.put(task);                          Task t = queue.take();   // both block politely\n\n// with timeouts at the edges:\nif (!queue.offer(task, 100, MILLISECONDS)) shedLoad();',
      },
      {
        kind: 'paragraph',
        text: 'A **bounded** blocking queue is the standard safe-publication conveyor and the standard backpressure valve: producers outpacing consumers get slowed instead of ballooning memory ([[scalability-patterns]]). `SynchronousQueue` (zero capacity, direct handoff) and `LinkedTransferQueue` serve thread-pool internals; `DelayQueue` schedules; `Deque` + work-stealing powers ForkJoin.',
      },
      {
        kind: 'pitfall',
        title: 'CopyOnWriteArrayList in write-heavy paths',
        text: 'Every mutation clones the whole backing array — O(n) allocation per write. It\'s superb for listener registries iterated constantly and mutated rarely; it\'s pathological as a work queue. Reversed misuse exists too: a `ConcurrentHashMap` iterated for a "consistent snapshot" isn\'t one — copy it explicitly when you need a frozen view.',
      },
      {
        kind: 'note',
        title: 'Retirement notices',
        text: '`Hashtable` and `Collections.synchronizedMap` serialize every operation on one lock — and still need client-side locking for compound actions. In modern code they signal "hasn\'t been touched since 2004". `ConcurrentHashMap` disallows null keys/values by design (a null get would be ambiguous under concurrency).',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 5 — Building Blocks' },
      { book: 'core-java-1', chapter: 'Ch. 10.6 — Thread-Safe Collections' },
      { book: 'effective-java', chapter: 'Item 81' },
    ],
    related: ['maps', 'thread-safety', 'executors-thread-pools', 'scalability-patterns'],
  },

  {
    id: 'executors-thread-pools',
    domainId: 'concurrency',
    title: 'Executors & Thread Pools',
    summary:
      'Executors separate task submission from execution policy. Pools reuse threads, bound resource usage, and return `Future`s. Size them for the workload, bound their queues, and always shut them down.',
    keyPoints: [
      'Prefer executors and tasks to raw threads (EJ 80): policy lives in one place',
      '`newFixedThreadPool(n)` for CPU work; `newVirtualThreadPerTaskExecutor()` for blocking I/O work',
      'CPU-bound sizing: ~`Runtime.getRuntime().availableProcessors()`; I/O-bound: don\'t pool — virtual threads',
      '`Future.get` blocks — prefer [[completable-future]] for composition',
      'Unbounded queues (`newFixedThreadPool`\'s default!) hide overload until OOM — bound and reject instead',
      'Shutdown ritual: `shutdown()` → `awaitTermination` → `shutdownNow()` (or use `close()`/try-with-resources, Java 19+)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Submit, collect, shut down',
        code: 'try (ExecutorService pool = Executors.newFixedThreadPool(\n        Runtime.getRuntime().availableProcessors())) {      // AutoCloseable since 19\n\n    List<Future<Report>> futures = tasks.stream()\n            .map(t -> pool.submit(() -> analyze(t)))         // Callable<Report>\n            .toList();\n\n    for (Future<Report> f : futures)\n        merge(f.get());                                       // rethrows task failure as ExecutionException\n}',
      },
      {
        kind: 'paragraph',
        text: 'JCiP\'s framing: a task is a unit of work; an executor is a policy about threads. Changing "200 requests each on its own thread" to "a pool of 16 with a bounded queue and caller-runs rejection" is a one-line change when submission and execution are decoupled — and impossible when `new Thread` calls are scattered through the code (EJ 80).',
      },
      {
        kind: 'code',
        title: 'A production-grade pool is explicit about its policy',
        code: 'ExecutorService pool = new ThreadPoolExecutor(\n        8, 8,                                  // core = max: fixed size\n        0, TimeUnit.SECONDS,\n        new ArrayBlockingQueue<>(1_000),       // BOUNDED queue\n        Thread.ofPlatform().name("worker-", 0).factory(),\n        new ThreadPoolExecutor.CallerRunsPolicy());   // backpressure, not OOM',
      },
      {
        kind: 'pitfall',
        title: 'Thread starvation deadlock (JCiP 8.1)',
        text: 'A task that submits a subtask to **its own bounded pool** and waits for the result deadlocks when all workers are doing the same — everyone waits, nobody runs the subtasks. Dependent tasks need separate pools, unbounded parallelism (virtual threads), or ForkJoin\'s `join` (which knows how to steal work while waiting).',
      },
      {
        kind: 'paragraph',
        text: '**Sizing** (JCiP ch. 8): CPU-bound → N_cpu (a queue of waiting tasks costs nothing; extra threads cost context switches). Mixed → N_cpu × (1 + wait/compute). I/O-dominated → the formula explodes toward thousands, which is the signal that pooling platform threads is the wrong model: use [[virtual-threads]] and stop sizing. **ForkJoinPool** serves divide-and-conquer and [[parallel-streams]] via work-stealing deques; it is not a general blocking-task pool.',
      },
      {
        kind: 'note',
        title: 'Scheduling and single-threading',
        text: '`newScheduledThreadPool` runs delayed/periodic tasks (a periodic task that throws stops silently — wrap the body in try/catch). `newSingleThreadExecutor` serializes tasks — an actor-lite that often replaces locking entirely: mutate the state only on that one thread.',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 6, 8 — Task Execution; Applying Thread Pools' },
      { book: 'effective-java', chapter: 'Item 80' },
      { book: 'core-java-1', chapter: 'Ch. 10.4 — Coordinating Tasks' },
    ],
    related: ['virtual-threads', 'completable-future', 'parallel-streams', 'liveness-hazards'],
  },

  {
    id: 'synchronizers',
    domainId: 'concurrency',
    title: 'Synchronizers: Latches, Barriers, Semaphores',
    summary:
      'Coordination primitives for thread rendezvous: `CountDownLatch` (wait for N events, once), `CyclicBarrier` (N parties meet repeatedly), `Semaphore` (at most N concurrent holders), `Phaser` (all of the above, dynamic).',
    keyPoints: [
      '`CountDownLatch(n)`: `await()` blocks until `countDown()` reaches zero; single-use',
      '`CyclicBarrier(n, action)`: parties `await()` each other; reusable per generation',
      '`Semaphore(permits)`: `acquire`/`release` bound concurrent access to a resource',
      '`Phaser`: register/deregister parties dynamically across phases',
      'Prefer these over `wait`/`notify` — always (EJ 81)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Latch: start gate + completion gate (JCiP 5.5.1)',
        code: 'CountDownLatch start = new CountDownLatch(1);\nCountDownLatch done = new CountDownLatch(workers);\n\nfor (int i = 0; i < workers; i++) {\n    pool.submit(() -> {\n        start.await();            // everyone waits for the gun\n        try { work(); }\n        finally { done.countDown(); }\n        return null;\n    });\n}\nlong t0 = System.nanoTime();\nstart.countDown();                // fire!\ndone.await();                     // wait for all to finish\nlong elapsed = System.nanoTime() - t0;',
      },
      {
        kind: 'code',
        title: 'Semaphore: bounding concurrency',
        code: 'private final Semaphore dbSlots = new Semaphore(10);   // at most 10 concurrent queries\n\npublic Result query(String sql) throws InterruptedException {\n    dbSlots.acquire();\n    try {\n        return db.run(sql);\n    } finally {\n        dbSlots.release();\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Semaphores are the general resource-bounding tool: connection limits, rate limiting, turning any collection into a bounded one (JCiP 5.5.3). With [[virtual-threads]] they replace pool-sizing as the way to limit concurrent access to a constrained resource — a million virtual threads, ten permits.',
      },
      {
        kind: 'paragraph',
        text: '`CyclicBarrier` suits iterative simulations: N workers compute a step, `await()` (the barrier action merges results), then everyone proceeds to the next generation. `Exchanger<V>` swaps objects between exactly two threads — the classic buffer-swap between a filler and a drainer.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer concurrency utilities to wait/notify (EJ Item 81)',
        text: 'Raw `wait`/`notify` demands the loop-inside-synchronized liturgy, notify-vs-notifyAll reasoning, and missed-signal paranoia — for problems the utilities already solve. Bloch: "there is seldom, if ever, a reason to use wait and notify in new code." If you maintain legacy code: always `notifyAll`, always wait in a condition loop.',
      },
      {
        kind: 'note',
        title: 'Custom synchronizers',
        text: 'When nothing fits, extend `AbstractQueuedSynchronizer` — the engine beneath ReentrantLock, Semaphore, and CountDownLatch (JCiP ch. 14). Requires JMM fluency; treat as library-author territory.',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 5.5, 14 — Synchronizers; Building Custom Synchronizers' },
      { book: 'effective-java', chapter: 'Item 81' },
      { book: 'core-java-1', chapter: 'Ch. 10.4 — Coordinating Tasks' },
    ],
    related: ['executors-thread-pools', 'locks-synchronization', 'virtual-threads'],
  },

  {
    id: 'completable-future',
    domainId: 'concurrency',
    title: 'CompletableFuture',
    summary:
      '`CompletableFuture<T>` is a promise you can compose: chain transformations, combine independent results, race alternatives, and attach error handling — asynchronous workflows without callback pyramids or blocked threads.',
    keyPoints: [
      'Create: `supplyAsync(supplier, executor)`; **pass your own executor** — the default is the common FJ pool',
      'Chain: `thenApply` (map), `thenCompose` (flatMap), `thenCombine` (zip two)',
      'Errors flow down the chain to `exceptionally`/`handle` — an unobserved failure vanishes silently',
      '`allOf`/`anyOf` for fan-in; `orTimeout`/`completeOnTimeout` (Java 9) for deadlines',
      '`thenApply` vs `thenApplyAsync`: same-thread continuation vs re-dispatch to a pool',
      'With virtual threads, plain blocking code often replaces CF chains entirely',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A composed pipeline',
        code: 'CompletableFuture<Quote> best =\n    CompletableFuture.supplyAsync(() -> fetchUser(id), ioPool)\n        .thenCompose(user -> CompletableFuture.supplyAsync(\n                () -> fetchQuotes(user), ioPool))               // async dependency\n        .thenApply(quotes -> quotes.stream()\n                .min(comparing(Quote::price)).orElseThrow())     // pure transform\n        .orTimeout(2, TimeUnit.SECONDS)\n        .exceptionally(ex -> {\n            log.warn("quote lookup failed", ex);\n            return Quote.DEFAULT;                                // fallback\n        });\n\nQuote q = best.join();   // only the final consumer blocks (if anyone must)',
      },
      {
        kind: 'code',
        title: 'Fan-out / fan-in',
        code: 'List<CompletableFuture<Price>> calls = vendors.stream()\n        .map(v -> CompletableFuture.supplyAsync(() -> v.quote(item), ioPool))\n        .toList();\n\nCompletableFuture<List<Price>> all =\n    CompletableFuture.allOf(calls.toArray(CompletableFuture[]::new))\n        .thenApply(ignored -> calls.stream().map(CompletableFuture::join).toList());',
      },
      {
        kind: 'pitfall',
        title: 'The default executor is everyone\'s executor',
        text: '`supplyAsync(task)` without an executor runs on `ForkJoinPool.commonPool()` — shared with [[parallel-streams]] and every other library that took the same shortcut. Blocking I/O there starves the whole JVM\'s parallel machinery. House I/O-bound CF work in an explicit executor (or a virtual-thread executor).',
      },
      {
        kind: 'pitfall',
        title: 'Dropped exceptions',
        text: 'A CompletableFuture whose failure no one observes (`join`, `get`, `exceptionally`, `whenComplete`) fails silently — the log shows nothing, the workflow just never completes. Every chain needs a terminal consumer that observes failure. Also know: `thenApply` after a failed stage is skipped, and the exception arrives wrapped in `CompletionException`.',
      },
      {
        kind: 'paragraph',
        text: 'Threading model: non-`Async` continuations run on whichever thread completed the previous stage (possibly *your* thread at composition time if it was already done); `*Async` variants re-dispatch to the pool. Keep continuations short and non-blocking, or make them Async on a suitable executor. And reassess with [[virtual-threads]]: `vthreadExecutor.submit(() -> { straightLineBlockingCode(); })` reads better than most CF chains and scales identically (Core Java and OCNJ both make this point).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 10.7 — Asynchronous Computations' },
      { book: 'ocnj', chapter: 'Ch. 13 — Concurrent Performance Techniques' },
    ],
    related: ['executors-thread-pools', 'virtual-threads', 'http-client'],
  },

  {
    id: 'atomics-nonblocking',
    domainId: 'concurrency',
    title: 'Atomics & Nonblocking Synchronization',
    summary:
      'Atomic classes turn compare-and-swap (CAS) — the CPU\'s optimistic "update if unchanged" instruction — into lock-free counters, references, and accumulators. Faster than locks under contention you can measure, and immune to deadlock.',
    keyPoints: [
      'CAS: atomically "set to new **if** still expected"; on failure, loop and retry',
      '`AtomicInteger/Long/Reference` = volatile semantics + atomic read-modify-write',
      'For hot counters, `LongAdder` beats `AtomicLong` — it stripes contention across cells',
      '`updateAndGet`/`accumulateAndGet` run a lambda atomically (must be pure — it may retry)',
      'ABA problem: value changed A→B→A looks unchanged; `AtomicStampedReference` versions it',
      'Nonblocking algorithms are library-author territory; *using* atomics is everyday code',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The CAS retry loop (what incrementAndGet does)',
        code: 'public class CasCounter {\n    private final AtomicLong value = new AtomicLong();\n\n    public long increment() {\n        long current;\n        do {\n            current = value.get();\n        } while (!value.compareAndSet(current, current + 1));  // retry on interference\n        return current + 1;\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'Locks are pessimistic (assume conflict, exclude everyone); CAS is optimistic (assume no conflict, detect and retry). Under low-to-moderate contention the retry loop almost never retries and costs one CPU instruction — no parking, no context switch, no priority inversion, no deadlock (JCiP ch. 15). Under *extreme* contention, CAS retries burn CPU — that\'s `LongAdder`\'s cue.',
      },
      {
        kind: 'code',
        title: 'The modern toolbox',
        code: 'private final LongAdder requests = new LongAdder();      // hot counter: stripes cells\nrequests.increment();\nlong total = requests.sum();                              // slightly weak snapshot — fine for stats\n\nprivate final AtomicReference<Config> config = new AtomicReference<>(initial);\nconfig.updateAndGet(c -> c.withTimeout(t));               // atomic functional update\n\nAtomicIntegerArray slots = new AtomicIntegerArray(64);    // per-element atomicity',
      },
      {
        kind: 'pitfall',
        title: 'Atomic parts, racy whole',
        text: 'Two atomics updated "together" are not together: a reader between the two updates sees a mixed state. An invariant spanning multiple values needs a lock — or pack the values into one immutable object in a single `AtomicReference` (JCiP\'s `CasNumberRange`: one CAS swaps the (lower, upper) pair).',
      },
      {
        kind: 'note',
        title: 'Field updaters and VarHandle',
        text: '`AtomicLongFieldUpdater` / `VarHandle.compareAndSet` give atomic access to plain fields without the wrapper-object cost — how libraries like Netty shave allocations. `VarHandle` also exposes weaker orderings (acquire/release) for experts squeezing the [[java-memory-model]].',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 15 — Atomic Variables and Nonblocking Synchronization' },
      { book: 'optimizing-java', chapter: 'Ch. 12 — Concurrent Performance' },
      { book: 'core-java-1', chapter: 'Ch. 10.5.5 — Atomics' },
    ],
    related: ['java-memory-model', 'locks-synchronization', 'concurrent-performance', 'sharing-objects'],
  },

  {
    id: 'virtual-threads',
    domainId: 'concurrency',
    title: 'Virtual Threads',
    summary:
      'Virtual threads (Java 21) are JVM-scheduled threads costing ~1 KB instead of ~1 MB: blocking parks the virtual thread and frees its carrier. Thread-per-task becomes viable at millions of tasks — write blocking code, get event-loop scale.',
    keyPoints: [
      'Cheap: create one per task, never pool them',
      'Blocking I/O unmounts the virtual thread from its carrier — the OS thread moves on',
      '`Executors.newVirtualThreadPerTaskExecutor()` is the drop-in server pattern',
      'They help **I/O-bound** workloads; CPU-bound work gains nothing',
      'Limit resources with a `Semaphore`, not by pooling threads',
      'Caveats: `ThreadLocal` per-"thread" caches multiply; pinning via `synchronized` fixed in JDK 24 (JEP 491)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A thousand concurrent calls, straight-line code',
        code: 'try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {\n    List<Future<Price>> results = suppliers.stream()\n            .map(s -> executor.submit(() -> {\n                var response = http.send(requestFor(s), BodyHandlers.ofString());  // blocks — cheaply\n                return parsePrice(response.body());\n            }))\n            .toList();\n    // 1,000 suppliers → 1,000 virtual threads → a handful of carrier threads\n}',
      },
      {
        kind: 'paragraph',
        text: 'Mechanics: a virtual thread\'s stack lives on the heap. When it hits a blocking operation the JDK has retrofitted (sockets, locks, sleeps, queues), the continuation **unmounts** from its carrier (a small FJ pool of OS threads, ~1 per core) and the carrier picks up another virtual thread. Millions of blocked virtual threads cost heap, not OS threads — the C10K problem dissolved into ordinary code.',
      },
      {
        kind: 'paragraph',
        text: 'What changes in design: stop sizing thread pools for I/O concurrency (the pool *was* the bottleneck), stop contorting into reactive pipelines for scale alone, and bound access to scarce resources explicitly with a [[synchronizers|Semaphore]]. What doesn\'t change: [[thread-safety]] — virtual threads are real threads; every visibility and atomicity rule applies unchanged.',
      },
      {
        kind: 'pitfall',
        title: 'Pooling them, or caching in ThreadLocals',
        text: 'A pool of virtual threads reintroduces the limit they removed — and code that cached expensive objects per pooled thread (`ThreadLocal<SimpleDateFormat>` patterns) now allocates per **task**. Replace pooled-thread caching with shared immutable objects or explicit pools of the *resource*, not the thread.',
      },
      {
        kind: 'note',
        title: 'Pinning (historical, mostly)',
        text: 'Before JDK 24, blocking inside a `synchronized` block pinned the carrier thread; long-held monitors around I/O could stall the scheduler (diagnose with `-Djdk.tracePinnedThreads`). JEP 491 fixed this; on Java 21 LTS it remains a reason to prefer `ReentrantLock` around blocking calls in hot paths ([[locks-synchronization]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 10 — Concurrency (virtual threads)' },
      { book: 'ocnj', chapter: 'Ch. 13, 15 — Concurrent Performance; The Future' },
      { book: 'learning-java', chapter: 'Ch. 9 — Threads' },
    ],
    related: ['virtual-threads-structured-concurrency', 'executors-thread-pools', 'sockets-networking', 'completable-future'],
  },

  {
    id: 'liveness-hazards',
    domainId: 'concurrency',
    title: 'Liveness Hazards: Deadlock & Friends',
    summary:
      'Safety failures compute wrong answers; liveness failures compute nothing forever. Deadlock (cyclic lock waits) is the star hazard; livelock and starvation are its cousins. The cure is design: consistent lock ordering and open calls.',
    keyPoints: [
      'Deadlock recipe: two threads acquiring the same two locks in opposite orders',
      'Prevention #1: a global lock **ordering**, applied everywhere (tie-break by `System.identityHashCode`)',
      'Prevention #2: open calls — never call alien methods while holding a lock',
      'Prevention #3: `tryLock` with timeout turns deadlock into recoverable failure',
      'Diagnose with thread dumps (`jstack`/`jcmd Thread.print`) — the JVM prints found deadlocks',
      'Resource deadlocks count too: pools, bounded queues, JDBC connections',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The classic: transferMoney (JCiP 10.1)',
        code: '// Thread A: transfer(checking, savings)  → locks checking, wants savings\n// Thread B: transfer(savings, checking)  → locks savings, wants checking → DEADLOCK\npublic void transfer(Account from, Account to, long amount) {\n    synchronized (from) {\n        synchronized (to) {\n            from.debit(amount);\n            to.credit(amount);\n        }\n    }\n}',
      },
      {
        kind: 'code',
        title: 'The fix: induce a total order on locks',
        code: 'public void transfer(Account from, Account to, long amount) {\n    Account first = from, second = to;\n    if (System.identityHashCode(from) > System.identityHashCode(to)) {\n        first = to; second = from;              // always lock in canonical order\n    }\n    synchronized (first) {\n        synchronized (second) {\n            from.debit(amount);\n            to.credit(amount);\n        }\n    }\n}   // (equal hashes: add a global tie-breaker lock — rare but required for correctness)',
      },
      {
        kind: 'paragraph',
        text: 'Deadlocks are probabilistic bombs: they need the unlucky interleaving, so they pass tests and detonate under production load (JCiP\'s phrasing). The lock-ordering discipline removes the *possibility*. Alien-method calls while holding locks ([[locks-synchronization|EJ 79]]) reintroduce it invisibly — you can\'t know what locks the callee takes. An **open call** (no locks held) restores composability.',
      },
      {
        kind: 'paragraph',
        text: '**Starvation**: a thread never gets CPU or a lock (priority abuse, unfair locks under pathological contention). **Livelock**: threads actively retry and perpetually collide — two-polite-people-in-a-corridor; randomized backoff breaks the symmetry. **Missed signals**: waiting without a condition loop. All three are rarer than deadlock and share the same medicine: simple, well-ordered coordination.',
      },
      {
        kind: 'note',
        title: 'Reading a thread dump',
        text: '`jcmd <pid> Thread.print` labels each thread\'s state, held monitors, and pending locks — and ends with "Found one Java-level deadlock" plus the cycle when there is one. In production, thread dumps are the first tool for "the service stopped responding but isn\'t crashing" ([[profiling]]).',
      },
    ],
    refs: [
      { book: 'jcip', chapter: 'Ch. 10 — Avoiding Liveness Hazards' },
      { book: 'core-java-1', chapter: 'Ch. 10.5 — Synchronization (deadlocks)' },
      { book: 'effective-java', chapter: 'Item 79' },
    ],
    related: ['locks-synchronization', 'executors-thread-pools', 'profiling'],
  },

  {
    id: 'concurrency-best-practices',
    domainId: 'concurrency',
    title: 'Concurrency Doctrine (EJ 78–84 + JCiP)',
    summary:
      'The distilled rules: synchronize all access or none, keep locks small and private, prefer executors and utilities to threads and wait/notify, document thread safety honestly, and treat lazy initialization as a last resort.',
    keyPoints: [
      'Synchronize access to shared mutable data — reads included (78)',
      'Avoid excessive synchronization: no alien calls under a lock (79)',
      'Executors/tasks over threads (80); utilities over wait/notify (81)',
      'Document thread safety: immutable / unconditionally safe / conditionally / not / hostile (82)',
      'Lazy initialization judiciously: holder idiom for statics, volatile DCL for instances (83)',
      'Never depend on the thread scheduler, priorities, or `Thread.yield` (84)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Thread-safety levels (EJ Item 82)',
        headers: ['Level', 'Meaning', 'Examples'],
        rows: [
          ['Immutable', 'constant; no external synchronization ever', '`String`, `Long`, `BigInteger`, records of immutables'],
          ['Unconditionally thread-safe', 'internally synchronized, use freely', '`AtomicLong`, `ConcurrentHashMap`'],
          ['Conditionally thread-safe', 'some sequences need client locking', '`Collections.synchronizedMap` iteration'],
          ['Not thread-safe', 'callers must synchronize every access', '`ArrayList`, `HashMap`'],
          ['Thread-hostile', 'unsafe even fully synchronized (static mutable abuse)', 'rare; usually a bug'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Documentation is part of the API: callers can\'t see your synchronization policy from signatures. State the level; for conditional safety, state exactly which sequences need which lock (the `synchronizedMap` javadoc pattern: iterate while holding the map). Undocumented assumptions become other people\'s data races.',
      },
      {
        kind: 'code',
        title: 'Lazy init cheat sheet (EJ Item 83)',
        code: '// Almost always best: don\'t be lazy.\nprivate final FieldType field = computeFieldValue();\n\n// Lazy static — the holder idiom (JVM does the synchronization):\nprivate static class Holder { static final FieldType FIELD = computeFieldValue(); }\nstatic FieldType getField() { return Holder.FIELD; }\n\n// Lazy instance — volatile double-check:\nprivate volatile FieldType field;\nFieldType getField() {\n    FieldType result = field;\n    if (result == null) {\n        synchronized (this) {\n            if (field == null) field = result = computeFieldValue();\n        }\n    }\n    return result;\n}',
      },
      {
        kind: 'paragraph',
        text: 'JCiP\'s closing wisdom compresses further: **less mutable state** (every removed field is removed analysis), **less sharing** (confinement is free safety), **more immutability**, and when synchronization is unavoidable, **make the policy boring** — one obvious lock per invariant, documented, held briefly. Clever concurrency is a maintenance liability; simple concurrency survives refactoring.',
      },
      {
        kind: 'note',
        title: 'Testing concurrent code (JCiP ch. 12)',
        text: 'Concurrency bugs hide from tests by nature. Raise the odds: run more threads than cores, iterate under load, insert `CountDownLatch` start gates to maximize interleaving, test on weak-memory hardware (ARM), and for serious lock-free work use jcstress. A green test proves little; a red one is gold.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 78–84' },
      { book: 'jcip', chapter: 'Ch. 12, 16 — Testing; The JMM' },
    ],
    related: ['thread-safety', 'java-memory-model', 'executors-thread-pools', 'immutability-class-design'],
  },
]
