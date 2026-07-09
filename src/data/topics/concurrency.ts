import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'threads-lifecycle',
    domainId: 'concurrency',
    title: 'Threads & Their Lifecycle',
    summary:
      'A `Thread` executes a `Runnable` concurrently with the rest of the program. Threads are the unit of scheduling; understanding their states — and interruption, the cooperative stop mechanism — underlies everything else in concurrency.',
    keyPoints: [
      {
        text: 'Start with `Thread.ofPlatform().start(task)` / `new Thread(task).start()` — never call `run()` directly',
        detail: '`run()` is just a normal method call — it executes on the caller\'s own thread, synchronously, doing nothing concurrent at all. `start()` is the one that asks the JVM to allocate a new call stack and have the scheduler run it independently.',
      },
      {
        text: 'States: NEW → RUNNABLE ⇄ (BLOCKED | WAITING | TIMED_WAITING) → TERMINATED',
        detail: 'RUNNABLE covers both "actually executing on a core" and "ready to run, waiting for the OS scheduler" — Java can\'t distinguish them, only the OS can. TERMINATED is a dead end: a finished `Thread` object cannot be restarted, you must create a new one.',
      },
      {
        text: 'Interruption is **cooperative**: `interrupt()` sets a flag; the target must check or be blocked',
        detail: 'Calling `interrupt()` never forcibly stops anything — it either flips an internal boolean the target must poll via `isInterrupted()`, or, if the target is already parked in a blocking call like `sleep`/`wait`/`join`, wakes it early by throwing `InterruptedException`. Code that never checks the flag and never blocks simply ignores the interrupt forever.',
      },
      {
        text: '`InterruptedException` clears the flag — restore it or rethrow, never swallow',
        detail: 'Throwing `InterruptedException` has the side effect of clearing the interrupted status back to false, so if you catch it and do nothing, the information that someone asked this thread to stop is gone. Restoring it with `Thread.currentThread().interrupt()` lets code further up the call stack still see the request.',
      },
      {
        text: 'Daemon threads don\'t keep the JVM alive',
        detail: 'The JVM exits once every remaining thread is a daemon, regardless of whether those daemons are still running — so they are right for background/cleanup work but wrong for anything whose completion actually matters. Mark one with `setDaemon(true)` before calling `start()`.',
      },
      {
        text: 'In application code, prefer [[executors-thread-pools|executors]] over raw threads (EJ 80)',
        detail: 'A raw `new Thread(...).start()` scatters policy decisions — how many threads, how they are reused, how they shut down — across every call site. An executor centralizes that policy in one place, so it can be changed later without touching the code that submits work.',
      },
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
        detail: 'A pool worker that swallows its interrupt keeps pulling and processing tasks forever, so `ExecutorService.shutdownNow()` — which works by interrupting every running worker — has no effect on it, and the pool never actually terminates. `Thread.stop()` is worse in a different way: it can release a lock the thread was holding mid-update, publishing an object whose invariants are broken to every other thread waiting on that lock.',
      },
      {
        kind: 'note',
        title: 'sleep and yield',
        text: '`Thread.sleep(ms)` parks without releasing any locks you hold. `Thread.onSpinWait()` hints busy-wait loops to the CPU. Scheduling priorities are best ignored — they map inconsistently to OS priorities (EJ 84: don\'t depend on the thread scheduler).',
        detail: 'Sleeping while holding a lock is a common accidental cause of long-held locks — the sleeping thread is not doing any useful work, but every other thread waiting on that lock is stalled for the full sleep duration regardless. If a delay is genuinely needed inside a critical section, that is usually a sign the critical section is scoped too broadly.',
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
      {
        text: 'The problem is exactly **shared + mutable** state — remove either property and safety is free',
        detail: 'A variable only one thread ever touches cannot race, no matter how it is written; a variable that never changes after construction cannot be caught mid-update, no matter how many threads read it. Every concurrency bug in this domain traces back to some state that is both reachable from multiple threads *and* being mutated — remove either half and the whole category of bug disappears.',
      },
      {
        text: 'Race conditions: check-then-act and read-modify-write compound actions are not atomic',
        detail: 'Each individual operation (`get`, `put`, `count++`) may itself be safe in isolation, but a *sequence* of them — check a condition, then act on it — has a gap between the steps where another thread can slip in and invalidate the assumption the second step relies on. The bug is not in either operation; it is in the unguarded gap between them.',
      },
      {
        text: 'Every shared mutable variable needs **one** guarding policy, applied on every access — reads too',
        detail: 'Guarding writes but not reads is a common half-measure that still leaves a race: a reader with no synchronization can observe a stale or partially-written value with no ordering guarantee at all ([[java-memory-model]]). The policy has to be uniform — the same lock (or equivalent) on every single access to that variable, reads included, or the guarantee has a hole.',
      },
      {
        text: 'Stateless objects and immutable objects are always thread-safe',
        detail: 'A stateless object has no fields to race over — every method call is independent of every other. An immutable object\'s fields are all set once during construction and never change again, so there is no window where one thread could observe a value mid-mutation. Both sidestep the "shared + mutable" precondition entirely rather than managing it.',
      },
      {
        text: 'Document the policy (`@GuardedBy("lock")` thinking) — safety is a design property, not a code style',
        detail: 'Thread safety cannot be verified by staring at one method in isolation — it is a property of the relationship between a piece of state and every place that touches it, which is invisible unless it is written down. `@GuardedBy` (even just as a comment convention) turns an implicit assumption living in the original author\'s head into something the next person modifying the code can actually check against.',
      },
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
        detail: 'Each individual call (`contains`, `add`) internally acquires and releases the list\'s lock — safe on its own, but the lock is fully released between the two calls, leaving a gap where another thread can add the same element. Thread safety of the parts does not compose into thread safety of a sequence built from them; the sequence itself needs its own atomicity guarantee.',
      },
      {
        kind: 'bestPractice',
        title: 'Synchronize access to shared mutable data (EJ Item 78)',
        text: 'Synchronization is required for **both** mutual exclusion and memory visibility. The cheapest correct policy, in order: confine it, make it immutable, use a concurrent library class, and only then hand-rolled locking. Never invent "clever" lock-free schemes without the JMM chops to prove them.',
        detail: 'The ordering matters because each option down the list costs more to get right: confinement and immutability make races structurally impossible with no runtime cost, a battle-tested concurrent collection has already had its lock-free tricks reviewed by experts, and hand-rolled locking or lock-free code is where subtle, hard-to-reproduce bugs are actually introduced — reach for it last, not first.',
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
      {
        text: 'No synchronization ⇒ no visibility guarantee: stale reads, reorderings, infinite loops',
        detail: 'Without a happens-before edge connecting a write on one thread to a read on another, the JMM permits the reader to see an arbitrarily stale value indefinitely — not "eventually consistent," genuinely unbounded. A spin loop reading an unsynchronized flag can, in principle, never observe the update, because nothing forces the reading thread to ever refresh its view.',
      },
      {
        text: '`volatile` guarantees visibility (and ordering) for a single variable — not atomicity of compound ops',
        detail: 'A `volatile` write establishes a happens-before edge with any subsequent `volatile` read of the same variable, which fixes visibility and reordering for that one variable. It does nothing about a sequence of operations on it — `volatileInt++` is still a read, an increment, and a write as three separate steps, exactly as racy as a non-volatile increment.',
      },
      {
        text: 'Safe publication: static initializer, `volatile`/`AtomicReference`, `final` fields, or a lock/concurrent collection',
        detail: 'Each of these idioms works because it forces a happens-before edge between the object\'s construction and whatever thread later reads the reference — a static initializer runs under a lock the class-loading machinery already provides, and `volatile`/`final`/locks each carry their own JMM guarantee. Publishing through a plain, unsynchronized field has no such edge, which is precisely the gap that lets a half-constructed object leak out.',
      },
      {
        text: '`final` fields are visible correctly after construction — immutable objects publish safely through anything',
        detail: 'The JMM gives `final` fields a special guarantee: as long as `this` did not escape during construction, any thread that gets a reference to the object after the constructor returns is guaranteed to see the `final` fields correctly initialized — even if that reference arrived through a data race. This is the one case where "unsynchronized publication" is still safe, precisely because immutability removes the possibility of ever seeing a *later* stale value too.',
      },
      {
        text: 'Never let `this` escape during construction (listeners, inner classes starting threads)',
        detail: 'The moment `this` is handed to something outside the constructor — a listener registration, a thread started from an inner class — another thread can call back into the object before the constructor has finished running, seeing fields that are still mid-initialization. This is exactly the loophole that would also void the `final`-field visibility guarantee above.',
      },
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
        detail: 'The danger is not limited to the obvious case of directly passing `this` somewhere — an inner (non-static) class instance implicitly holds a reference to its enclosing `this`, so starting a thread from an anonymous inner class defined inside a constructor leaks the enclosing object just as surely. The factory-method fix works because the object is fully constructed and assigned to a local variable before anything is registered with it.',
      },
      {
        kind: 'note',
        title: 'Immutable = publish anywhere',
        text: 'Objects with only `final` fields whose state can\'t change (and didn\'t escape during construction) may be published through even a data race and still be seen fully built — the JMM\'s special guarantee for `final`. One more reason [[immutability-class-design|immutability]] is the concurrency cheat code.',
        detail: 'This is a genuinely unusual guarantee in the JMM — almost everywhere else, a data race means undefined/unpredictable behavior, full stop. Immutable objects with only `final` fields are carved out as the one exception, which is a large part of why immutability keeps showing up as the recommended fix throughout this whole domain: it does not just avoid races, it is specifically exempted from their consequences.',
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
      {
        text: 'Every object has a monitor; `synchronized(obj)` / synchronized methods acquire it, re-entrantly',
        detail: 'Every object carries an intrinsic monitor as part of its header, whether or not anything ever locks it — `synchronized` does not create a lock, it acquires the one that already exists. Reentrancy means the *thread*, not the *call*, owns the lock once acquired, so a synchronized method calling another synchronized method on the same object does not block on itself.',
      },
      {
        text: 'Static synchronized methods lock on the **Class** object — a different lock than instances',
        detail: 'A `static synchronized` method acquires the monitor of the `Class` object itself (there is exactly one per loaded class), while an instance `synchronized` method acquires the monitor of `this` — two entirely separate locks. Mixing the two expecting them to exclude each other is a common source of "why isn\'t my synchronization working" confusion.',
      },
      {
        text: 'Keep critical sections small; never call alien methods or do I/O while holding a lock (EJ 79)',
        detail: '"Alien" means any method you do not control the implementation of — an overridable method, a caller-supplied lambda, a listener callback. Held locks are also held during blocking I/O, so every thread waiting on that same lock is now stalled behind however long the disk or network call takes, turning a local slowdown into contention across the whole application.',
      },
      {
        text: '`ReentrantLock` when you need tryLock/timeout/interruptible/fair — else `synchronized` is fine',
        detail: '`synchronized` acquisition is unconditional and uninterruptible — a thread blocked waiting for a monitor cannot be told to give up and cannot be interrupted out of the wait. `ReentrantLock` adds exactly those capabilities (`tryLock` with a timeout, `lockInterruptibly`, optional fairness) at the cost of manual `unlock()` discipline in a `finally` block that `synchronized` gives you for free.',
      },
      {
        text: '`ReadWriteLock`: many concurrent readers OR one writer; `StampedLock` adds optimistic reads',
        detail: 'A plain lock serializes all access, readers included, even though concurrent reads of unchanging data are perfectly safe together. `ReadWriteLock` lets any number of readers hold the read lock simultaneously, excluding only writers; `StampedLock` goes further with optimistic reads that take no lock at all and just validate afterward, worthwhile only when reads vastly outnumber writes and contention is measured to actually be a problem.',
      },
      {
        text: 'Lock on a `private final Object lock` to prevent outsiders locking your monitor',
        detail: 'Synchronizing on `this` (or on a public field) exposes your monitor to any external code that can get a reference to the object — a caller synchronizing on your instance for its own unrelated purpose can block your internal synchronization, or worse, deadlock against it. A private, dedicated lock object is reachable only by your own class\'s code, closing that hole entirely.',
      },
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
        detail: 'The deadlock risk is concrete, not theoretical: if the alien code calls back into your object and tries to acquire the same lock your thread is already holding elsewhere in a different order relative to some other lock, you have the classic lock-ordering deadlock. Releasing your lock before invoking anything you do not control removes the possibility entirely, at the cost of working from a snapshot instead of live state.',
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
        detail: 'An optimistic read takes a stamp, reads the data without any lock at all, then checks whether the stamp is still valid — if a writer intervened, the stamp is invalid and the reader must retry (typically falling back to a real read lock). This trades a small chance of wasted, discarded work for zero lock overhead in the common uncontended case, which is a fundamentally different tradeoff than every lock above it in the pecking order.',
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
      {
        text: 'Compilers and CPUs reorder aggressively; the JMM is the contract that tames it',
        detail: 'Reordering exists because it makes single-threaded code faster — a compiler or CPU that has to execute instructions in exactly the order you wrote them, with every intermediate result flushed to memory immediately, would leave enormous performance on the table. The JMM does not forbid reordering; it defines the specific, minimal set of guarantees (happens-before edges) that must survive it, so multithreaded code can still reason about ordering where it matters.',
      },
      {
        text: 'happens-before sources: program order, monitor unlock→lock, volatile write→read, `Thread.start`, `Thread.join`, `final`-field freeze',
        detail: 'This is the complete practical toolkit — every correct synchronization idiom in Java is built from one or more of these edges. `Thread.start()` guarantees everything the starting thread did before the call is visible inside the new thread; `Thread.join()` guarantees everything the joined thread did is visible after the join returns; the rest are the locking and volatile primitives already covered elsewhere in this domain.',
      },
      {
        text: 'Data race = concurrent conflicting accesses without happens-before ordering',
        detail: '"Conflicting" means at least one of the two accesses is a write to the same variable; "concurrent" means neither happens-before the other. Once a data race exists on some variable, the JMM makes no promises about what any read of it returns — not just "maybe stale," genuinely unconstrained, which is what makes racy code categorically different from merely slow code.',
      },
      {
        text: 'Synchronization "piggybacks": one volatile/lock edge orders **all** prior writes, not just the flagged variable',
        detail: 'Happens-before is transitive: if write ① happens-before volatile write ②, and ② happens-before read ③ on another thread, then ① also happens-before ③, even though ① never touched anything volatile itself. This is what makes the "compute into a plain field, then flip a volatile flag" idiom correct — the flag\'s visibility guarantee drags every preceding plain write along with it.',
      },
      {
        text: 'The double-checked-locking idiom is broken without `volatile`',
        detail: 'Without `volatile`, a reader thread can observe the non-null reference written inside the synchronized block before it observes the constructor\'s writes to that object\'s fields — the reference and the object\'s state can become visible out of order. Marking the field `volatile` re-establishes the happens-before edge between "the object is fully constructed" and "another thread sees the reference," which is the entire idiom\'s reason for existing.',
      },
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
        detail: 'The JMM is defined by what the *specification* permits, not by what any particular CPU actually does — x86\'s strong memory model happens to forbid most reorderings the spec allows, so racy code frequently "works" there by accident. The same code can fail the moment it runs on ARM (weaker ordering guarantees) or even on the same x86 machine after the JIT recompiles the method differently, which is why passing tests locally proves nothing about correctness.',
      },
      {
        kind: 'note',
        title: 'Beyond volatile',
        text: '`VarHandle` (Java 9) exposes finer memory modes — acquire/release, opaque — for lock-free experts; `Atomic*` classes bundle CAS with volatile semantics ([[atomics-nonblocking]]). For everyone else: the well-worn idioms above plus the java.util.concurrent toolbox encode the JMM so you don\'t have to.',
        detail: 'Plain `volatile` gives full sequential-consistency-like ordering, which is sometimes stronger (and slower) than a given algorithm actually needs. `VarHandle`\'s acquire/release/opaque modes let an expert ask for exactly the ordering guarantee required and no more — a genuinely sharp tool, which is precisely why the note frames it as being for lock-free experts rather than everyday code.',
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
      {
        text: '`ConcurrentHashMap`: fine-grained locking per bin; reads never block; use `compute*`/`merge` for atomic updates',
        detail: 'Locking per-bin instead of the whole map means two threads writing to different bins never contend with each other at all — throughput scales with the number of bins, not with a single global lock. Reads take no lock whatsoever, relying on volatile-style visibility instead, which is why they never block behind a writer.',
      },
      {
        text: 'Its iterators are weakly consistent — no `ConcurrentModificationException`, no snapshot either',
        detail: '"Weakly consistent" means the iterator tolerates concurrent modification without throwing, but it also does not promise to reflect any single consistent point-in-time state — it may or may not see an element added or removed mid-iteration. This is a deliberate tradeoff: a true consistent snapshot would require either copying the whole map or locking it, both of which defeat the point of a concurrent map.',
      },
      {
        text: '`CopyOnWriteArrayList`: copies the array per write — perfect for read-mostly listener lists',
        detail: 'Because every write allocates a fresh backing array, readers iterating an old snapshot are never disturbed by concurrent writes and need no locking or `ConcurrentModificationException` handling at all — the entire safety story is "you always see a consistent, if possibly slightly stale, snapshot." That only pays off when writes are rare enough that the O(n) copy cost stays negligible.',
      },
      {
        text: '`BlockingQueue` (`ArrayBlockingQueue`, `LinkedBlockingQueue`) = producer-consumer with built-in backpressure',
        detail: 'A bounded blocking queue\'s `put()` blocks the producer once the queue is full, which is precisely what backpressure means — instead of the producer racing ahead and piling up unbounded work in memory, it is forced to slow down to match the consumer\'s actual processing rate.',
      },
      {
        text: '`ConcurrentSkipListMap/Set`: the concurrent sorted alternatives',
        detail: 'A `TreeMap` cannot safely be shared across threads without external locking that serializes every access, defeating the point of a sorted structure meant for concurrent use. `ConcurrentSkipListMap` gets its concurrency from a skip list\'s structure (layered linked lists) rather than a balanced tree, which lends itself to lock-free/fine-grained concurrent updates in a way tree rebalancing does not.',
      },
      {
        text: 'size()/isEmpty() are estimates under concurrency — design so you don\'t need exact answers',
        detail: 'By the time `size()` returns a number, other threads may have already added or removed elements, so the value is stale the instant you receive it — there is no way around this for a genuinely concurrent structure without freezing the whole map to count it. Code that needs an exact, actionable count (rather than an approximate one for logging/metrics) usually has a design problem, not a missing API.',
      },
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
        detail: 'Both misuses come from picking a collection for its concurrency guarantee without checking whether its actual performance shape matches the workload: a write-heavy `CopyOnWriteArrayList` pays an O(n) copy on every single mutation, and a `ConcurrentHashMap`\'s weak-consistency iteration was never meant to answer "give me a frozen view," only "let me iterate safely while others mutate."',
      },
      {
        kind: 'note',
        title: 'Retirement notices',
        text: '`Hashtable` and `Collections.synchronizedMap` serialize every operation on one lock — and still need client-side locking for compound actions. In modern code they signal "hasn\'t been touched since 2004". `ConcurrentHashMap` disallows null keys/values by design (a null get would be ambiguous under concurrency).',
        detail: 'The null-ambiguity problem is specific to concurrent maps: on a single-threaded `HashMap`, `get(k)` returning `null` could mean either "no mapping" or "mapped to null," and callers disambiguate with `containsKey`. Under concurrency, another thread could remove the key between your `get` and your `containsKey` check, so that disambiguation pattern is itself racy — `ConcurrentHashMap` sidesteps the whole problem by forbidding null values outright.',
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
      {
        text: 'Prefer executors and tasks to raw threads (EJ 80): policy lives in one place',
        detail: 'A codebase full of scattered `new Thread(...).start()` calls has its concurrency policy smeared across every call site — changing pool size or rejection behavior means hunting down and editing each one. An executor centralizes that policy behind a single object, so submission code never needs to know or care how the work actually gets scheduled.',
      },
      {
        text: '`newFixedThreadPool(n)` for CPU work; `newVirtualThreadPerTaskExecutor()` for blocking I/O work',
        detail: 'A fixed pool of platform threads makes sense when the work is CPU-bound, because more threads than cores just adds context-switching overhead without more actual throughput. Blocking I/O work is the opposite case — threads spend most of their time waiting, not computing — which is exactly what virtual threads are built for: cheap enough to have thousands blocked at once.',
      },
      {
        text: 'CPU-bound sizing: ~`Runtime.getRuntime().availableProcessors()`; I/O-bound: don\'t pool — virtual threads',
        detail: 'For CPU-bound work, once you have one runnable thread per core, adding more only means more context switching with no additional throughput — the formula genuinely is just "how many cores do I have." For I/O-bound work the right pool size formula grows toward the thousands as wait time dominates, which is the tell that pooling platform threads is the wrong tool entirely, not just mis-sized.',
      },
      {
        text: '`Future.get` blocks — prefer [[completable-future]] for composition',
        detail: 'Calling `get()` on a `Future` ties up the calling thread until the task finishes, which is fine for a single fire-and-wait but becomes awkward the moment you want to chain, combine, or react to multiple async results without dedicating a thread to each wait. `CompletableFuture` expresses that composition without blocking anything until you actually need the final result.',
      },
      {
        text: 'Unbounded queues (`newFixedThreadPool`\'s default!) hide overload until OOM — bound and reject instead',
        detail: 'An unbounded queue means a pool that cannot keep up with incoming work never rejects anything — it just keeps accepting tasks into an ever-growing queue, silently building up memory pressure with no visible symptom until the process finally runs out of heap. A bounded queue with an explicit rejection policy turns that invisible failure mode into an immediate, actionable one.',
      },
      {
        text: 'Shutdown ritual: `shutdown()` → `awaitTermination` → `shutdownNow()` (or use `close()`/try-with-resources, Java 19+)',
        detail: '`shutdown()` alone stops accepting new tasks but does not wait for existing ones to finish, so code that shuts down and immediately exits can cut off in-flight work. The full ritual — stop accepting, wait a bounded time for graceful completion, then force-interrupt anything still running — is what guarantees a clean, bounded-time exit instead of either hanging forever or dropping work abruptly.',
      },
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
        detail: 'The deadlock happens because every worker thread in the pool is simultaneously blocked waiting for a subtask result, and the subtasks themselves are queued behind those same blocked workers with no free thread left to ever run them — the pool has silently run out of capacity to make progress. Virtual threads sidestep this because blocking one does not consume a scarce OS thread the way blocking a platform-thread pool worker does.',
      },
      {
        kind: 'paragraph',
        text: '**Sizing** (JCiP ch. 8): CPU-bound → N_cpu (a queue of waiting tasks costs nothing; extra threads cost context switches). Mixed → N_cpu × (1 + wait/compute). I/O-dominated → the formula explodes toward thousands, which is the signal that pooling platform threads is the wrong model: use [[virtual-threads]] and stop sizing. **ForkJoinPool** serves divide-and-conquer and [[parallel-streams]] via work-stealing deques; it is not a general blocking-task pool.',
      },
      {
        kind: 'note',
        title: 'Scheduling and single-threading',
        text: '`newScheduledThreadPool` runs delayed/periodic tasks (a periodic task that throws stops silently — wrap the body in try/catch). `newSingleThreadExecutor` serializes tasks — an actor-lite that often replaces locking entirely: mutate the state only on that one thread.',
        detail: 'A single-threaded executor gives you mutual exclusion "for free" as a structural property, not an enforced rule — since only one thread ever touches the state, there is nothing to race, no lock needed, and no way to accidentally forget to acquire one. It trades throughput (everything is serialized) for that simplicity, which is a good deal when the workload does not need parallelism in the first place.',
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
      {
        text: '`CountDownLatch(n)`: `await()` blocks until `countDown()` reaches zero; single-use',
        detail: 'A latch models a one-time gate: once the count reaches zero it stays open forever, and there is no way to reset it back up. That single-use nature is exactly right for "wait for N things to finish once" (startup, or a fan-out/fan-in), but wrong for anything that needs to coordinate the same group of threads repeatedly.',
      },
      {
        text: '`CyclicBarrier(n, action)`: parties `await()` each other; reusable per generation',
        detail: 'Unlike a latch, a barrier resets itself automatically once all N parties have arrived — the optional action runs exactly once per "generation," right when the last party arrives and before anyone is released, making it the natural fit for repeated lock-step phases (like each generation of a simulation) rather than a one-shot rendezvous.',
      },
      {
        text: '`Semaphore(permits)`: `acquire`/`release` bound concurrent access to a resource',
        detail: 'A semaphore does not care which thread acquired which permit or in what order — it is purely a counter with blocking increment/decrement, which is what makes it the general tool for "no more than N concurrent users of this resource," independent of whatever the resource actually is (a connection pool, a rate limit, a fixed-size cache slot).',
      },
      {
        text: '`Phaser`: register/deregister parties dynamically across phases',
        detail: 'A `CyclicBarrier`\'s party count is fixed at construction; `Phaser` allows parties to register and deregister on the fly between phases, which matters when the set of participating threads genuinely changes over the lifetime of the coordination (workers that come and go) rather than being a known, fixed pool from the start.',
      },
      {
        text: 'Prefer these over `wait`/`notify` — always (EJ 81)',
        detail: 'Hand-written `wait`/`notify` code has to get the associated lock, the loop-not-if check for spurious wakeups, and the choice of `notify` vs `notifyAll` all correct simultaneously, with no compiler help if any of them is wrong — a notoriously easy pattern to get subtly wrong. The higher-level synchronizers encode the same coordination patterns correctly once, in a well-tested library, so application code never has to get those details right itself.',
      },
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
        detail: 'The "condition loop" requirement exists because a woken thread is not guaranteed the condition it was waiting for is actually true — spurious wakeups are permitted by the spec, and `notifyAll` wakes every waiter even when only one\'s condition became true. Re-checking the condition in a `while` (not `if`) after waking is what makes the code correct despite both of those; a single missed re-check is a classic source of intermittent bugs.',
      },
      {
        kind: 'note',
        title: 'Custom synchronizers',
        text: 'When nothing fits, extend `AbstractQueuedSynchronizer` — the engine beneath ReentrantLock, Semaphore, and CountDownLatch (JCiP ch. 14). Requires JMM fluency; treat as library-author territory.',
        detail: 'AQS provides the hard, easy-to-get-wrong parts — the wait queue, the CAS-based state transitions, the park/unpark plumbing — leaving a subclass to implement only the small "is this a valid state to acquire/release" logic. Every built-in synchronizer already does this correctly; a new custom synchronizer should be a rare last resort, not a first idea.',
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
      {
        text: 'Create: `supplyAsync(supplier, executor)`; **pass your own executor** — the default is the common FJ pool',
        detail: 'The overload without an executor argument silently uses `ForkJoinPool.commonPool()`, a JVM-wide shared pool that parallel streams and other libraries also use by default — mixing blocking work into it starves everyone else relying on it for CPU-bound parallelism. Passing your own executor keeps your workload\'s resource usage isolated and visible.',
      },
      {
        text: 'Chain: `thenApply` (map), `thenCompose` (flatMap), `thenCombine` (zip two)',
        detail: 'The naming mirrors `Stream`/`Optional` deliberately: `thenApply` transforms a value with a plain function (map), `thenCompose` chains onto another async operation that itself returns a `CompletableFuture` (flatMap — avoiding a nested `CompletableFuture<CompletableFuture<T>>`), and `thenCombine` waits for two independent futures and merges their results (zip).',
      },
      {
        text: 'Errors flow down the chain to `exceptionally`/`handle` — an unobserved failure vanishes silently',
        detail: 'A failed stage skips every subsequent `thenApply`/`thenCompose` in the chain, propagating the failure forward exactly like an exception unwinding a call stack — except there is no automatic "uncaught exception" surfacing the way there is for a thread. If nothing downstream ever calls `exceptionally`, `handle`, or blocks on the result with `get`/`join`, the failure is simply never observed by anyone.',
      },
      {
        text: '`allOf`/`anyOf` for fan-in; `orTimeout`/`completeOnTimeout` (Java 9) for deadlines',
        detail: '`allOf` completes only once every input future has completed (fan-in for "wait for all"), while `anyOf` completes as soon as the first one does (for racing alternatives). `orTimeout` fails the future with a `TimeoutException` if a deadline passes; `completeOnTimeout` instead supplies a fallback value — the same deadline concept with two different failure behaviors.',
      },
      {
        text: '`thenApply` vs `thenApplyAsync`: same-thread continuation vs re-dispatch to a pool',
        detail: 'The non-`Async` form runs the continuation on whatever thread happens to complete the previous stage — which could be your own thread, if the stage was already done by the time you attached the continuation, or a pool thread otherwise. This inconsistency is exactly why long or blocking continuations should use the `Async` variant with an explicit executor: it removes the ambiguity about which thread does the work.',
      },
      {
        text: 'With virtual threads, plain blocking code often replaces CF chains entirely',
        detail: 'A `CompletableFuture` chain exists largely to avoid dedicating a scarce platform thread to blocked waiting — but a virtual thread blocked in straight-line code costs almost nothing, which removes the original motivation. `vthreadExecutor.submit(() -> { blockingStepOne(); blockingStepTwo(); })` reads as ordinary sequential code and scales the same way a CF chain would, without the `.thenApply`/`.thenCompose` indirection.',
      },
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
        detail: 'The common pool is sized around the number of CPU cores, on the assumption that everything running in it is CPU-bound and briefly occupies a thread. A blocking I/O call there occupies a thread for however long the I/O takes instead, which can starve unrelated parallel-stream operations elsewhere in the same JVM that are also waiting for a common-pool thread to free up.',
      },
      {
        kind: 'pitfall',
        title: 'Dropped exceptions',
        text: 'A CompletableFuture whose failure no one observes (`join`, `get`, `exceptionally`, `whenComplete`) fails silently — the log shows nothing, the workflow just never completes. Every chain needs a terminal consumer that observes failure. Also know: `thenApply` after a failed stage is skipped, and the exception arrives wrapped in `CompletionException`.',
        detail: 'This differs sharply from a thread\'s uncaught exception, which at least prints a stack trace by default — a `CompletableFuture`\'s failure has no such fallback surfacing mechanism, so the only way to ever learn about it is to explicitly attach something that inspects the outcome. It is easy to build a long chain, forget the terminal `exceptionally`/`handle`, and have failures disappear into silence during testing where nothing happens to trigger them.',
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
      {
        text: 'CAS: atomically "set to new **if** still expected"; on failure, loop and retry',
        detail: 'The "if still expected" clause is what makes it useful without a lock: the CPU checks the current value and swaps it in one indivisible hardware instruction, so if another thread changed the value first, the CAS simply fails and reports that instead of corrupting anything. Retrying with the fresh value is what turns a single failed attempt into a correct update.',
      },
      {
        text: '`AtomicInteger/Long/Reference` = volatile semantics + atomic read-modify-write',
        detail: 'A plain `volatile` field gives you visibility but not atomicity for compound operations like increment — `volatileInt++` is still read-then-write as two separate steps. The `Atomic*` classes add the missing piece, wrapping a volatile-like field with CAS-based methods (`incrementAndGet`, `compareAndSet`) that are genuinely atomic as a whole operation.',
      },
      {
        text: 'For hot counters, `LongAdder` beats `AtomicLong` — it stripes contention across cells',
        detail: 'Under heavy contention, every thread hammering the same `AtomicLong` keeps causing each other\'s CAS to fail and retry, burning CPU on collisions. `LongAdder` spreads the count across multiple internal cells (one thread mostly hits "its own" cell), so contention drops dramatically; the tradeoff is that reading the total (`sum()`) has to add all the cells together, making writes cheap and reads slightly more expensive.',
      },
      {
        text: '`updateAndGet`/`accumulateAndGet` run a lambda atomically (must be pure — it may retry)',
        detail: 'These methods implement the same read-compute-CAS-retry loop you would otherwise hand-write, but with the "compute" step expressed as a lambda instead of inline code. Because the whole loop can retry if another thread interferes, the lambda may run more than once for a single logical call — any side effect inside it (like incrementing something else) would happen multiple times, which is why it must be a pure function of its input.',
      },
      {
        text: 'ABA problem: value changed A→B→A looks unchanged; `AtomicStampedReference` versions it',
        detail: 'A plain CAS only compares the current value to the expected one — if the value went A→B→A between your read and your CAS, the comparison sees "still A" and succeeds, even though the value was genuinely modified in between (which matters if intermediate state, like a node being freed and reused, had side effects). `AtomicStampedReference` attaches a version stamp that increments on every change, so a stamp mismatch reveals the intermediate mutation even when the value itself reverted.',
      },
      {
        text: 'Nonblocking algorithms are library-author territory; *using* atomics is everyday code',
        detail: 'Using `AtomicLong.incrementAndGet()` requires no special expertise — it is a drop-in replacement for a synchronized counter. Designing a new lock-free data structure from CAS primitives (a lock-free queue, a lock-free stack) requires reasoning about interleavings and memory ordering at a level of rigor most application code never needs; that is precisely the kind of code JCiP means by "library-author territory."',
      },
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
        detail: 'Each individual `AtomicLong`\'s update is atomic in isolation, but nothing links the two updates together as a unit — a reader can observe the first field already updated and the second still holding its old value, exactly the "atomic parts, racy whole" failure this domain keeps returning to. Bundling both values into one immutable object swapped by a single `AtomicReference` CAS makes the *pair* atomic, not just each half.',
      },
      {
        kind: 'note',
        title: 'Field updaters and VarHandle',
        text: '`AtomicLongFieldUpdater` / `VarHandle.compareAndSet` give atomic access to plain fields without the wrapper-object cost — how libraries like Netty shave allocations. `VarHandle` also exposes weaker orderings (acquire/release) for experts squeezing the [[java-memory-model]].',
        detail: 'An `AtomicLong` field means every instance of your class carries an extra object allocation just to hold that counter — negligible normally, but measurable at Netty\'s scale (millions of objects). A field updater or `VarHandle` instead performs atomic operations directly on a plain `long`/`volatile long` field via reflection-like access, getting the same CAS semantics without paying for a separate wrapper object per instance.',
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
      {
        text: 'Cheap: create one per task, never pool them',
        detail: 'A platform thread costs roughly a megabyte of stack and a real OS thread — pooling exists specifically to amortize that cost across many tasks. A virtual thread costs about a kilobyte of heap and no dedicated OS thread, which removes the reason to pool at all: creating a fresh one per task is the intended, cheap default.',
      },
      {
        text: 'Blocking I/O unmounts the virtual thread from its carrier — the OS thread moves on',
        detail: 'When a virtual thread hits a blocking call the JDK has retrofitted for this, its continuation is parked on the heap and the carrier (a real OS thread from a small pool) is freed to run a different virtual thread instead of sitting idle waiting. This is what lets a handful of carrier threads service millions of concurrently-blocked virtual threads.',
      },
      {
        text: '`Executors.newVirtualThreadPerTaskExecutor()` is the drop-in server pattern',
        detail: 'This factory returns an `ExecutorService` with the exact same interface as any pooled executor, but backed by unpooled virtual threads under the hood — existing code written against `ExecutorService` (submit tasks, get `Future`s) can switch to it with essentially no other changes, immediately gaining thread-per-task scalability.',
      },
      {
        text: 'They help **I/O-bound** workloads; CPU-bound work gains nothing',
        detail: 'Virtual threads solve the cost of *waiting*, not the cost of *computing* — a CPU-bound task occupies a core for its entire duration regardless of which kind of thread runs it, so there is no more parallelism available than the number of physical cores allows either way. The entire benefit is specific to workloads that spend most of their time blocked on I/O.',
      },
      {
        text: 'Limit resources with a `Semaphore`, not by pooling threads',
        detail: 'With platform threads, pool size doubled as a de facto concurrency limiter on whatever resource the tasks touched — a side effect of the pool, not a deliberate control. With virtual threads there is no pool to size, so the actual resource being protected (a database\'s connection limit, a rate-limited API) needs its own explicit bound, which is exactly what a `Semaphore` provides directly.',
      },
      {
        text: 'Caveats: `ThreadLocal` per-"thread" caches multiply; pinning via `synchronized` fixed in JDK 24 (JEP 491)',
        detail: 'A `ThreadLocal` cache sized for "one per pooled platform thread" (dozens) suddenly becomes "one per task" (potentially millions) once every task gets its own virtual thread, which can turn a small, bounded cache into unbounded memory growth. Pinning was the other historical caveat: a virtual thread blocking inside a `synchronized` block used to keep its carrier thread stuck too, defeating the whole point, until JEP 491 fixed it.',
      },
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
        detail: 'Pooling virtual threads defeats the point twice over: it reintroduces a hard cap on concurrency (the exact limit virtual threads exist to remove), and it makes `ThreadLocal` caching pattern actively harmful rather than a minor inefficiency, since a fresh virtual thread per task means a fresh cache entry per task instead of per long-lived pooled thread. The fix is to cache at the object level (a shared immutable formatter) rather than per-thread.',
      },
      {
        kind: 'note',
        title: 'Pinning (historical, mostly)',
        text: 'Before JDK 24, blocking inside a `synchronized` block pinned the carrier thread; long-held monitors around I/O could stall the scheduler (diagnose with `-Djdk.tracePinnedThreads`). JEP 491 fixed this; on Java 21 LTS it remains a reason to prefer `ReentrantLock` around blocking calls in hot paths ([[locks-synchronization]]).',
        detail: 'Pinning happened because `synchronized`\'s monitor was implemented in a way tied to the OS thread, not the virtual thread — unmounting mid-`synchronized`-block would have broken that association, so the JVM instead kept the carrier thread stuck for the whole blocking call, silently reintroducing platform-thread-style blocking costs exactly where virtual threads were supposed to remove them. JEP 491 reimplemented monitors so this no longer happens.',
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
      {
        text: 'Deadlock recipe: two threads acquiring the same two locks in opposite orders',
        detail: 'Thread A holds lock 1 and wants lock 2; thread B holds lock 2 and wants lock 1 — each is blocked waiting for a lock the other holds, and neither can ever release what it has because it is stuck waiting. The bug is entirely in the *order* of acquisition, not in either individual lock being wrong to use.',
      },
      {
        text: 'Prevention #1: a global lock **ordering**, applied everywhere (tie-break by `System.identityHashCode`)',
        detail: 'If every piece of code that needs two locks always acquires them in the same relative order, the cyclic-wait condition that causes deadlock becomes structurally impossible — there is no interleaving that produces a cycle when everyone agrees on the order. The identity-hash tie-break exists because the "natural" order (e.g., account ID) is not always available or comparable at the lock-acquisition site.',
      },
      {
        text: 'Prevention #2: open calls — never call alien methods while holding a lock',
        detail: 'A lock you are holding is invisible to you the moment you call into code you do not control — that alien code might acquire other locks in an order that conflicts with your own ordering discipline, reintroducing the exact cyclic-wait possibility the ordering rule was meant to eliminate. Releasing your lock before calling out (an "open call") keeps the two concerns separate.',
      },
      {
        text: 'Prevention #3: `tryLock` with timeout turns deadlock into recoverable failure',
        detail: 'Unlike `synchronized`\'s unconditional, uninterruptible acquisition, `ReentrantLock.tryLock(timeout)` gives up and returns `false` if it cannot get the lock in time — a thread that would otherwise deadlock forever instead fails fast and can retry, back off, or report an error, converting an invisible hang into a visible, handleable failure.',
      },
      {
        text: 'Diagnose with thread dumps (`jstack`/`jcmd Thread.print`) — the JVM prints found deadlocks',
        detail: 'The JVM tracks which thread holds which monitor and which thread is waiting on which, so it can walk that graph looking for cycles — when it finds one, `jstack`/`jcmd Thread.print` prints "Found one Java-level deadlock" along with the exact cycle of threads and locks involved, turning "the service just stopped responding" into a precise, actionable diagnosis.',
      },
      {
        text: 'Resource deadlocks count too: pools, bounded queues, JDBC connections',
        detail: 'The same cyclic-wait pattern that causes lock deadlock can happen with any finite, shared resource — two requests each holding one connection from a pool while waiting to acquire a second connection the other holds is structurally identical to two threads deadlocked on two monitors, just with a connection pool standing in for the lock.',
      },
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
        detail: 'A thread dump is a free, non-invasive snapshot — it does not require the JVM to be restarted, attached with a debugger, or otherwise disrupted, which is exactly why it is the first tool reached for when a production service is unresponsive: it costs almost nothing to take and often shows the deadlock (or the hot lock everyone is queued behind) directly, without needing to reproduce the issue anywhere else.',
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
      {
        text: 'Synchronize access to shared mutable data — reads included (78)',
        detail: 'This is the foundational rule everything else in this doctrine builds on: guarding only writes still leaves readers with no visibility or ordering guarantee, so "synchronize the writes" alone is not actually thread-safe, only partially so.',
      },
      {
        text: 'Avoid excessive synchronization: no alien calls under a lock (79)',
        detail: 'The word "excessive" is doing real work here — the rule is not "synchronize less," it is "don\'t extend a critical section to cover code you don\'t control," since that is what invites both deadlock (unknown lock ordering in the alien code) and unnecessary contention (the lock is held longer than the actual shared-state access requires).',
      },
      {
        text: 'Executors/tasks over threads (80); utilities over wait/notify (81)',
        detail: 'Both items share one theme: prefer a well-tested, higher-level abstraction over hand-rolling the same coordination pattern from lower-level primitives. Executors centralize threading policy that would otherwise be scattered; concurrency utilities encode wait/notify patterns (latches, barriers, semaphores) that are notoriously easy to get subtly wrong by hand.',
      },
      {
        text: 'Document thread safety: immutable / unconditionally safe / conditionally / not / hostile (82)',
        detail: 'A class\'s public API signature says nothing about its concurrency contract — two classes can have identical method signatures while one is safe to share across threads and the other corrupts state under concurrent access. Without an explicit documented level, every caller either has to read the implementation or guess, and a wrong guess becomes a data race in someone else\'s code.',
      },
      {
        text: 'Lazy initialization judiciously: holder idiom for statics, volatile DCL for instances (83)',
        detail: '"Judiciously" is the operative word: Bloch\'s actual recommendation is mostly *don\'t* lazy-initialize, since the performance win is rarely worth the complexity. When it is genuinely needed, the holder-class idiom gets correctness for free from the class-loading machinery\'s own synchronization, which is why it is preferred over hand-rolled double-checked locking wherever it applies.',
      },
      {
        text: 'Never depend on the thread scheduler, priorities, or `Thread.yield` (84)',
        detail: 'Thread scheduling behavior is not part of the Java language specification — it is left to the JVM and OS, so code that happens to work because of a particular scheduler\'s quirks on one platform can behave completely differently on another JVM, OS, or even just a different core count. Correct concurrent code must be correct regardless of how the scheduler happens to interleave threads, never merely lucky.',
      },
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
        detail: 'A concurrency bug typically needs a specific, low-probability interleaving to manifest — a test suite that runs each test once, quickly, on one machine is heavily biased toward never hitting that interleaving at all. Deliberately maximizing contention (more threads than cores, synchronized start gates so everyone races at once, many iterations) raises the odds of actually triggering the bug instead of just failing to find it.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 78–84' },
      { book: 'jcip', chapter: 'Ch. 12, 16 — Testing; The JMM' },
    ],
    related: ['thread-safety', 'java-memory-model', 'executors-thread-pools', 'immutability-class-design'],
  },
]
