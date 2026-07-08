import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'collections-overview',
    domainId: 'collections',
    title: 'The Collections Framework',
    summary:
      'One interface hierarchy — `Collection` branching into `List`, `Set`, and `Queue`, with `Map` alongside — and interchangeable implementations behind it. Program to the interface; choose the implementation for its performance shape.',
    keyPoints: [
      {
        text: 'Core interfaces: `Collection`, `List`, `Set`, `SortedSet`/`NavigableSet`, `Queue`, `Deque`, `Map`',
        detail: '`Collection` is the root: anything you can add to, remove from, and iterate. `List` keeps order and allows duplicates; `Set` forbids duplicates; `Queue`/`Deque` are head-first holding structures for work items; `Map` stands apart — it is not a `Collection` at all, it associates keys with values rather than just holding elements.',
      },
      {
        text: 'Declare variables as the interface type: `List<String> l = new ArrayList<>()` (EJ 64) — swap the implementation later without touching a single caller',
        detail: 'If a field, parameter, or return type is typed as `ArrayList` instead of `List`, every caller is now coupled to that concrete class — switching to `LinkedList` later means touching every call site, not just the one `new` expression. Declaring the interface type keeps the constructor as the only place that knows which implementation was chosen.',
      },
      {
        text: '`Iterable` powers for-each; `Iterator.remove` is the only safe removal during iteration',
        detail: 'The for-each loop is sugar for calling `iterator()` and looping `hasNext()`/`next()` — any type implementing `Iterable` gets it for free. Removing through the collection itself while that same loop is mid-iteration corrupts the iterator\'s bookkeeping; only `Iterator.remove()` is guaranteed safe, because the iterator updates its own state at the same time.',
      },
      {
        text: 'Factory methods `List.of` / `Set.of` / `Map.of` create compact **immutable** collections',
        detail: 'These are static factory methods (EJ Item 1), not constructors — they can return specialized, space-optimized implementations under the hood (a zero-element singleton, a one-element wrapper) instead of always allocating a full resizable structure, flexibility a public constructor could never offer.',
      },
      {
        text: 'Optional operations: immutable views throw `UnsupportedOperationException` on mutation',
        detail: 'The `Collection` interfaces define more methods than every implementation can honestly support — `add`/`remove`/`set` are documented as "optional operations." An immutable implementation still implements the full interface for polymorphism\'s sake, it just throws at runtime instead of refusing to compile.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Interfaces and their workhorse implementations',
        headers: ['Interface', 'Hash-based', 'Array-based', 'Tree-based', 'Linked'],
        rows: [
          ['`List`', '—', '`ArrayList` ✦', '—', '`LinkedList`'],
          ['`Set`', '`HashSet` ✦', '—', '`TreeSet`', '`LinkedHashSet`'],
          ['`Map`', '`HashMap` ✦', '—', '`TreeMap`', '`LinkedHashMap`'],
          ['`Queue`', '—', '`ArrayDeque` ✦, `PriorityQueue`', '—', '`LinkedList`'],
        ],
      },
      {
        kind: 'paragraph',
        text: '✦ = the default choice. The framework\'s design bet: a small set of interfaces, each with a handful of implementations distinguished **only** by performance characteristics and iteration order. Algorithms (`Collections.sort`, `binarySearch`, `shuffle`) are written once against the interfaces.',
      },
      {
        kind: 'code',
        title: 'Program to interfaces',
        code: 'List<String> wordList = new ArrayList<>();     // swap to LinkedList without touching callers\nSet<Integer> seen = new HashSet<>();\nMap<String, List<Order>> byCustomer = new HashMap<>();\n\nList<String> fixed = List.of("S", "M", "L");   // immutable, null-hostile, compact',
      },
      {
        kind: 'pitfall',
        title: 'ConcurrentModificationException',
        text: 'Structurally modifying a collection while iterating it (except through the iterator itself) fails fast. Use `iterator.remove()`, `removeIf(predicate)`, or collect changes and apply after the loop. In multithreaded code the fix is a concurrent collection ([[concurrent-collections]]), not a `try/catch`.',
        code: 'words.removeIf(w -> w.length() < 3);   // the safe idiom',
        detail: 'The fail-fast check works by stamping a `modCount` on the collection at iterator-creation time; every structural change bumps it, and the iterator compares modCounts on every `next()`/`remove()` call. It is a best-effort bug detector, not a guarantee — the JDK explicitly warns against relying on it for correctness, only for catching bugs during development.',
      },
      {
        kind: 'paragraph',
        text: '`List.of`/`Map.of` collections reject `null` and are **truly immutable** — unlike `Arrays.asList` (fixed-size but write-through, [[arrays]]) and unlike `Collections.unmodifiableList` (a read-only *view* of a possibly-changing list, [[views-algorithms]]).',
      },
      {
        kind: 'note',
        title: 'Three "unmodifiable" flavors — don\'t conflate them',
        text: '① `List.of(...)`/`Map.of(...)`/`Set.of(...)`: truly immutable — no backing array to mutate, null-hostile, fixed forever. ② `Arrays.asList(a)`: fixed-**size** but write-through — `set` mutates the backing array, `add`/`remove` throw ([[arrays]]). ③ `Collections.unmodifiableList(l)` and friends: a read-only *view* over `l` — the wrapper itself throws on mutation, but if code elsewhere still holds `l`, changes there are visible through the wrapper. Only ① is safe to hand out as a permanent guarantee; ② and ③ are both still tied to mutable state behind the scenes — see [[views-algorithms]] for the full picture.',
        detail: 'The practical failure mode: a class that hands out `Collections.unmodifiableList(this.items)` from a getter has **not** achieved immutability — a caller cannot mutate through the wrapper, but the class\'s own later code still can, and that mutation is instantly visible to anyone holding the wrapper. Only handing out a `List.copyOf(this.items)` snapshot severs that connection.',
      },
      {
        kind: 'bestPractice',
        title: 'Return empty collections, not null (EJ Item 54)',
        text: 'Returning `null` where a collection is expected forces every caller into null checks and breaks for-each. Return `List.of()` / `Collections.emptyList()` — they are shared immutable singletons, so there is no allocation cost.',
        detail: 'The instances returned by `List.of()`/`Collections.emptyList()` are genuine singletons — calling them a million times allocates nothing, so there is no performance argument for returning `null` to "save an allocation." The only cost of banning null returns is that every caller stops needing an `if (result != null)` check before a for-each — a correctness win, not just a style preference.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.1–9.2 — Framework; Interfaces' },
      { book: 'learning-java', chapter: 'Ch. 7 — Collections and Generics' },
      { book: 'effective-java', chapter: 'Items 54, 64' },
    ],
    related: ['choosing-collections', 'lists', 'maps', 'generics-why'],
  },

  {
    id: 'lists',
    domainId: 'collections',
    title: 'Lists',
    summary:
      '`ArrayList` is the default list: contiguous storage, O(1) index access, amortized O(1) append. `LinkedList` almost never wins — its theoretical O(1) insertion is buried under cache-hostile node chasing.',
    keyPoints: [
      {
        text: '`ArrayList`: backed by a growable array; grows ~1.5× when full',
        detail: 'Growth means allocating a new, larger backing array and copying every existing element into it — an O(n) operation that happens occasionally, so the *amortized* cost per `add` stays O(1) even though any single call might trigger a full copy.',
      },
      {
        text: 'Middle insertion/removal in `ArrayList` is O(n) — elements shift',
        detail: 'Removing index 0 from a 10,000-element list means shifting all 9,999 remaining elements one slot to the left via `System.arraycopy` — cheap per element, but the cost scales with how many elements sit after the modified index, not with the list\'s total capacity.',
      },
      {
        text: '`LinkedList` is O(n) to *reach* any position; each node is a separate allocation',
        detail: '`get(500)` on a `LinkedList` walks 500 node-to-node pointer hops from whichever end is closer — there is no array to jump into directly. Each node is also its own heap object with two reference fields plus an object header, so a `LinkedList` uses meaningfully more memory than an `ArrayList` of the same size.',
      },
      {
        text: 'Presize with `new ArrayList<>(expectedSize)` when the size is known',
        detail: 'Presizing skips the repeated grow-and-copy cycles a default-capacity list would otherwise pay while filling up — one allocation instead of roughly log₁.₅(n) of them, which matters in a hot path building a large list from a known-size source.',
      },
      {
        text: '`List.copyOf(c)` for defensive immutable copies; `subList(a, b)` returns a live range **view**, not a copy',
        detail: 'These are opposite tools: `copyOf` severs the connection to the source entirely (safe to hand out, never changes underneath the caller), while `subList` deliberately keeps the connection — edits through the sublist mutate the original list\'s corresponding range, and vice versa.',
      },
      {
        text: '`List.of(...)` is truly immutable — null-hostile, throws `UnsupportedOperationException` on any mutation attempt',
        detail: 'Unlike `Arrays.asList`, there is no backing array a caller can reach through some other reference — `List.of` collections own no mutable state at all, which is what makes them safe to treat as permanent constants.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'ArrayList vs LinkedList',
        headers: ['Operation', '`ArrayList`', '`LinkedList`'],
        rows: [
          ['`get(i)`', 'O(1)', 'O(n) — walks nodes'],
          ['`add(e)` at end', 'O(1) amortized', 'O(1)'],
          ['`add(i, e)` middle', 'O(n) shift, cache-friendly', 'O(n) walk + O(1) link'],
          ['`Iterator.remove`', 'O(n)', 'O(1) at cursor'],
          ['Memory per element', 'one reference slot', 'node object: 2 pointers + header (~24 B extra)'],
          ['Cache behavior', 'excellent (contiguous)', 'poor (pointer chasing)'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The performance books are blunt here: on modern hardware, memory locality dominates ([[hardware-memory]]). An `ArrayList` traversal streams through cache lines; a `LinkedList` traversal takes a potential cache miss per element. Even for insert-heavy workloads, `ArrayList` or `ArrayDeque` usually measures faster. Choose `LinkedList` only for genuine cursor-based editing via `ListIterator`.',
      },
      {
        kind: 'code',
        title: 'ListIterator: the one job LinkedList still wins',
        code: 'ListIterator<String> it = names.listIterator();\nwhile (it.hasNext()) {\n    String name = it.next();\n    if (name.isBlank()) {\n        it.remove();                // O(1) at the cursor on a LinkedList\n    } else if (name.equals("TBD")) {\n        it.set("Unknown");          // replace in place, no second lookup\n    }\n}\nwhile (it.hasPrevious()) {\n    it.previous();                  // bidirectional — plain Iterator cannot go back\n}',
      },
      {
        kind: 'note',
        title: 'What ListIterator adds over Iterator',
        text: '`ListIterator` extends `Iterator` with backward traversal (`hasPrevious`/`previous`), in-place replacement (`set`), and positional insertion/removal (`add`/`remove`) — all relative to the cursor, with no index arithmetic. Traversal and `set` are O(1) even on an `ArrayList`; only `add`/`remove` shift the backing array. On a `LinkedList` those cursor-local structural edits are O(1) too — the one scenario where the node-per-element design actually pays for itself.',
      },
      {
        kind: 'code',
        title: 'Everyday list work',
        code: 'List<String> names = new ArrayList<>(1000);   // presized: no regrowth copies\nnames.add("Ada");\nnames.set(0, "Grace");\nnames.sort(Comparator.naturalOrder());          // in-place TimSort\nList<String> top10 = List.copyOf(names.subList(0, 10)); // materialize the view',
      },
      {
        kind: 'pitfall',
        title: 'subList is a view, not a copy',
        text: 'Mutations through the view write through to the backing list, and structural modification of the backing list invalidates the view (`ConcurrentModificationException` on next access). Wrap in `List.copyOf` if you need independence.',
        detail: 'This is the same live-view hazard as `Map.keySet()`/`entrySet()`: because `subList` shares storage with its parent, any structural change to the *parent* list outside the sublist\'s range invalidates the sublist\'s internal cursor, and the next operation on it throws `ConcurrentModificationException` even though the sublist itself was never touched.',
      },
      {
        kind: 'pitfall',
        title: 'remove(int) vs remove(Object)',
        text: 'For a `List<Integer>`, `list.remove(1)` removes the element **at index 1**, while `list.remove(Integer.valueOf(1))` removes the first element equal to 1. Overload resolution prefers the primitive — a classic autoboxing ambush.',
        detail: 'Java resolves overloads at compile time by the most specific applicable static type, and `int` is more specific than boxed `Integer` for a literal like `1` — so `list.remove(1)` always binds to the index-based overload no matter what the list actually contains. Effective Java calls this exact interaction out as a place generics and autoboxing collide badly.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.3 — Concrete Collections' },
      { book: 'optimizing-java', chapter: 'Ch. 11 — Java Language Performance Techniques' },
      { book: 'learning-java', chapter: 'Ch. 7 — Collections' },
    ],
    related: ['arrays', 'choosing-collections', 'hardware-memory'],
  },

  {
    id: 'sets',
    domainId: 'collections',
    title: 'Sets',
    summary:
      'A `Set` rejects duplicates as defined by `equals` (or `compareTo` in sorted sets). `HashSet` is O(1) and unordered, `LinkedHashSet` remembers insertion order, `TreeSet` iterates sorted at O(log n) per operation.',
    keyPoints: [
      {
        text: '`HashSet`: hash table over a backing `HashMap`; iteration order is arbitrary and can change',
        detail: 'Because a `HashSet` is literally a `HashMap<E, Object>` under the hood, its iteration order follows the same bucket layout as a `HashMap`\'s keys — which depends on hash codes and table capacity, not insertion order, and can shift after a resize even with no elements added or removed.',
      },
      {
        text: '`LinkedHashSet`: insertion-ordered iteration for a small memory premium',
        detail: 'It is a `HashSet` with an extra doubly-linked list threading through the entries to remember insertion order — the O(1) hash operations are unchanged, the cost is one pair of extra reference fields per entry.',
      },
      {
        text: '`TreeSet`: red-black tree, sorted iteration, `NavigableSet` range queries',
        detail: 'Every operation costs O(log n) instead of a hash set\'s O(1), because each one has to walk the tree to find or maintain the sorted position; the payoff is that iteration always visits elements in order and `floor`/`ceiling`/`subSet` become possible at all.',
      },
      {
        text: 'Elements must have consistent `equals`/`hashCode` — and stay **unmutated** while inside',
        detail: 'The set computes an element\'s bucket from its `hashCode()` once, at insertion time; if a field that participates in that hash code changes afterward, the element is still sitting in its *old* bucket, so `contains`/`remove` — which recompute the hash to know where to look — will never find it again.',
      },
      {
        text: '`EnumSet` for enum elements: bit-vector speed with Set semantics',
        detail: 'Internally it is one (or a few) `long` fields, one bit per possible enum constant — membership, union, and intersection become bitwise operations instead of hash lookups or tree walks, which is why it outperforms every other `Set` implementation for enum element types.',
      },
      {
        text: 'Iteration order: `HashSet` arbitrary, `LinkedHashSet` insertion order, `TreeSet` sorted order',
        detail: 'This ordering guarantee (or lack of one) is a load-bearing part of each type\'s contract, not an implementation detail you can casually rely on or ignore — code that depends on `HashSet` iteration order for correctness is one JDK upgrade away from breaking.',
      },
      {
        text: '`Set.of(...)` rejects duplicate arguments at construction — throws `IllegalArgumentException`, not a silent dedup',
        detail: 'This is deliberate: calling `add` twice with the same element on a `HashSet` silently no-ops, but writing `Set.of(a, a)` is almost always a bug at the call site, so the factory fails loudly instead of quietly deduping something you probably didn\'t mean to list twice.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A `Set` is best understood as a `Map` with no values: `HashSet` *is* a `HashMap<E, Object>` sharing one dummy value, and `TreeSet` wraps a `TreeMap`. Everything that governs a map — how `equals`/`hashCode` decide identity, iteration order, load factor ([[hashing-internals]]) — governs the matching set verbatim. Pick a set the same way you\'d pick its [[maps|map]]: `HashSet` for O(1) membership and don\'t-care order, `LinkedHashSet` to remember insertion order, `TreeSet` when you need sorted iteration or range queries.',
      },
      {
        kind: 'code',
        title: 'Deduplication and membership',
        code: 'Set<String> seen = new HashSet<>();\nfor (String word : words) {\n    if (!seen.add(word)) {          // add() returns false for duplicates\n        System.out.println("dup: " + word);\n    }\n}\n\nSet<String> sorted = new TreeSet<>(words);         // sorted, deduped\nSet<String> ordered = new LinkedHashSet<>(words);  // first-seen order kept',
      },
      {
        kind: 'paragraph',
        text: 'Set algebra comes from bulk operations: `a.retainAll(b)` (intersection), `a.addAll(b)` (union), `a.removeAll(b)` (difference). For membership-heavy pipelines, `Set.contains` at O(1) beats `List.contains` at O(n) — a frequent silent performance bug ([[choosing-collections]]).',
      },
      {
        kind: 'pitfall',
        title: 'Mutating an element inside a hash set',
        text: 'If a field participating in `hashCode` changes while the object sits in a `HashSet`, the object is now filed in the wrong bucket: `contains` says false, `remove` fails, and the "duplicate" can be added again. Store immutable keys, or remove → mutate → re-add. Same rule for [[maps|HashMap]] keys.',
        detail: 'This is the exact same failure mode as mutating a `HashMap` key: the set computed the element\'s bucket once, from its hash code at insertion time, and has no way to know the object changed underneath it — the fix is identical too, remove before mutating, then re-add.',
      },
      {
        kind: 'paragraph',
        text: '`TreeSet` implements `NavigableSet`: `first()`, `last()`, `floor(e)`, `ceiling(e)`, `headSet`, `tailSet`, `subSet` — range views over the sorted order. Remember membership is decided by `compareTo`, not `equals` ([[sorted-collections]]).',
      },
      {
        kind: 'note',
        title: 'Iteration order stability',
        text: 'Never depend on `HashSet` order — it varies with capacity, insertion history, and JDK version. Tests that assert on it are flaky by construction. Want determinism? `LinkedHashSet` or `TreeSet`.',
        detail: 'This applies with equal force across JDK versions: two different JDK builds (or even two runs of the same build with different internal capacities) are free to iterate the same `HashSet` contents in different orders, because nothing in the `Set` contract promises otherwise.',
      },
      {
        kind: 'note',
        title: 'When add() returns false',
        text: '`set.add(x)` returns `false` when an equal element is already present — a one-call "have I seen this?" test with no second lookup, which is exactly what powers the dedup idiom above. It is only as correct as the element\'s `equals`/`hashCode` ([[object-contracts]]); a class that overrides one but not the other silently duplicates members it should have rejected, or rejects ones it should have kept.',
        detail: 'This is the same single-call test-and-set idiom `Map.putIfAbsent` uses — one call that both checks and (conditionally) mutates, avoiding the classic check-then-act sequence that a separate `contains` followed by `add` would need (though `HashSet` itself still is not thread-safe either way).',
      },
      {
        kind: 'code',
        title: 'Dedup a stream, then navigate a sorted set',
        code: 'record LogEntry(String host, Instant at) {}\n\nSet<String> distinctHosts = entries.stream()\n        .map(LogEntry::host)\n        .collect(Collectors.toCollection(HashSet::new));   // membership only, order irrelevant\n\nNavigableSet<Integer> ports = new TreeSet<>(Set.of(22, 80, 443, 8080));\nports.ceiling(100);     // 443  — smallest element >= 100\nports.headSet(443);     // [22, 80]  — everything below 443\nports.descendingSet();  // 8080, 443, 80, 22\n// ports.contains(443) is O(log n) here; a HashSet would answer the same question in O(1)\n// — pay for navigation only when you actually use floor/ceiling/range queries',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.3 — Concrete Collections' },
      { book: 'learning-java', chapter: 'Ch. 7 — Collections' },
      { book: 'effective-java', chapter: 'Item 36 (EnumSet)' },
    ],
    related: ['hashing-internals', 'sorted-collections', 'object-contracts'],
  },

  {
    id: 'queues-deques',
    domainId: 'collections',
    title: 'Queues, Deques & Priority Queues',
    summary:
      '`Queue` offers FIFO with polite failure modes; `Deque` adds both ends (and replaces the legacy `Stack`); `PriorityQueue` always surrenders the smallest element. `ArrayDeque` is the right default for both stack and queue.',
    keyPoints: [
      {
        text: 'Two method families: throwing (`add`/`remove`/`element`) vs value-returning (`offer`/`poll`/`peek`)',
        detail: 'Both families do the same operation — the difference is entirely in how they report failure. Pick throwing when hitting an edge case (empty queue, full bounded queue) is a bug worth surfacing immediately; pick the value-returning family when emptiness is routine control flow you were going to check anyway.',
      },
      {
        text: '`ArrayDeque`: circular array, faster than `LinkedList` as a queue and than `Stack` as a stack',
        detail: 'A circular array wraps its head/tail indices around the same fixed-size backing array instead of shifting elements, so both ends support O(1) amortized add/remove with none of `LinkedList`\'s per-node allocation overhead or cache-unfriendly pointer chasing.',
      },
      {
        text: '`PriorityQueue`: binary heap; `poll` is O(log n); **iteration is not sorted**',
        detail: 'A binary heap only guarantees the smallest (or highest-priority) element sits at the root — the rest of the array satisfies the heap property (a parent ≤ its children) but is not otherwise ordered, so a plain for-each visits entries in whatever array position they happen to occupy.',
      },
      'Blocking variants (`ArrayBlockingQueue`, `LinkedBlockingQueue`) live in [[concurrent-collections]]',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Stack and queue via Deque',
        code: 'Deque<Task> queue = new ArrayDeque<>();\nqueue.offer(task);            // enqueue at tail\nTask next = queue.poll();     // dequeue from head (null if empty)\n\nDeque<Frame> stack = new ArrayDeque<>();\nstack.push(frame);            // addFirst\nFrame top = stack.pop();      // removeFirst (throws if empty)',
      },
      {
        kind: 'note',
        title: 'Two method families, one contract each',
        text: 'Every `Queue` operation comes in a throwing form (`add`, `remove`, `element`) and a special-value form (`offer`, `poll`, `peek`). The families matter at the edges: on an empty queue `remove()`/`element()` throw `NoSuchElementException` while `poll()`/`peek()` return `null`; on a bounded queue `add` throws `IllegalStateException` while `offer` returns `false`. Reach for the throwing family when emptiness or fullness is a bug worth surfacing immediately; reach for the special-value family when it is routine control flow — draining a queue is a `E e; while ((e = queue.poll()) != null) { … }` loop, not a `try/catch` ladder. See [[choosing-collections]] for picking the structure in the first place.',
        detail: 'Draining with `poll()` in a `while` loop is idiomatic precisely because it turns "is the queue empty" from an exceptional condition into an ordinary loop-termination check — the same pattern shows up reading lines from a `BufferedReader` or entries from an `Iterator`.',
      },
      {
        kind: 'code',
        title: 'PriorityQueue',
        code: 'Queue<Job> jobs = new PriorityQueue<>(Comparator.comparing(Job::deadline));\njobs.addAll(pending);\nwhile (!jobs.isEmpty()) {\n    process(jobs.poll());     // always the earliest deadline\n}',
      },
      {
        kind: 'pitfall',
        title: 'Iterating a PriorityQueue is not sorted',
        text: 'The heap property only guarantees the **head** is minimal. `for (Job j : jobs)` visits in heap-array order. To consume in priority order, `poll()` in a loop — or sort a copy.',
        detail: 'The array backing the heap only satisfies "each parent is ≤ its children," which is enough to guarantee the root (index 0) is the minimum, but says nothing about the relative order of any two sibling or cousin nodes — so a for-each, which walks the array in index order, has no reason to come out sorted.',
      },
      {
        kind: 'note',
        title: 'Retire java.util.Stack',
        text: '`Stack extends Vector`: synchronized on every call and it inherits list operations that violate stack discipline. It survives for compatibility only — `ArrayDeque` is the replacement.',
        detail: '`Vector` (and therefore `Stack`) synchronizes every single method call even in single-threaded code, paying a lock acquisition for no benefit, and `Stack` additionally inherits `Vector`\'s indexed `add`/`remove` methods that let callers violate stack discipline — `ArrayDeque` supports none of that by design.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.3.4–9.3.5 — Queues, Deques, Priority Queues' },
      { book: 'learning-java', chapter: 'Ch. 7 — Collections' },
    ],
    related: ['concurrent-collections', 'choosing-collections', 'lists'],
  },

  {
    id: 'maps',
    domainId: 'collections',
    title: 'Maps',
    summary:
      '`Map` associates keys with values — the most used data structure in Java after lists. `HashMap` is the O(1) default; `TreeMap` keeps keys sorted; `LinkedHashMap` remembers order and can act as an LRU cache. The modern API (`getOrDefault`, `computeIfAbsent`, `merge`) removes almost every manual null dance.',
    keyPoints: [
      {
        text: 'A key maps to exactly one value; `put` returns the previous value or null',
        detail: 'Calling `put` on a key that already has a mapping silently overwrites it and hands back whatever was there before — a useful signal for "did I just replace something," but easy to miss since the return value is often ignored.',
      },
      {
        text: '`getOrDefault`, `putIfAbsent`, `computeIfAbsent`, `merge` — learn these four',
        detail: 'Between them these four cover almost every "get with a fallback" and "insert or update" pattern that used to require a `containsKey`/`get`/`put` dance — and on `ConcurrentHashMap` they are additionally atomic, replacing what would otherwise need explicit locking.',
      },
      {
        text: 'Iterate `entrySet()` when you need both key and value',
        detail: 'Iterating `keySet()` and then calling `get(key)` for each one works but re-looks-up every entry (an extra hash computation and bucket walk per key); `entrySet()` hands you both halves of the same entry object in one pass.',
      },
      {
        text: 'Keys must be stable: mutating a key in place breaks the map',
        detail: 'Exactly the same rule that governs `HashSet` elements applies to hash-based map keys, because a `Map` is implemented as buckets keyed by hash — change the key\'s hash-relevant fields after insertion and the entry is stranded in its old bucket.',
      },
      {
        text: '`LinkedHashMap` + `removeEldestEntry` = instant LRU cache',
        detail: 'Constructed with the access-order flag set to true, every `get` moves that entry to the "most recently used" end of the internal linked list; overriding `removeEldestEntry` to return true past a size threshold turns that ordering into automatic eviction, with no manual bookkeeping.',
      },
      {
        text: 'Views: `keySet()`, `values()`, `entrySet()` write through to the map',
        detail: 'These three methods do not copy anything — they return live windows onto the same underlying entries, so removing through `keySet()` deletes from the map itself, and structurally changing the map while one of these views is being iterated throws `ConcurrentModificationException`.',
      },
      {
        text: '`null` keys/values: `HashMap` allows one null key and null values; `TreeMap` rejects null keys but allows null values; `ConcurrentHashMap` rejects both',
        detail: '`TreeMap` rejects a null key because it needs to `compareTo` every key against every other, and comparing against null throws `NullPointerException`; `ConcurrentHashMap` rejects null entirely because a null return from `get` would be ambiguous between "key absent" and "key present, mapped to null" in a way that is actively dangerous under concurrent mutation.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The modern Map API',
        code: 'Map<String, Integer> counts = new HashMap<>();\n\n// Counting — three eras:\nInteger old = counts.get(word);                       // 2004\ncounts.put(word, old == null ? 1 : old + 1);\ncounts.put(word, counts.getOrDefault(word, 0) + 1);   // 2014\ncounts.merge(word, 1, Integer::sum);                  // idiomatic now\n\n// Multimap idiom — no null checks:\nMap<String, List<Order>> byCustomer = new HashMap<>();\nbyCustomer.computeIfAbsent(customer, k -> new ArrayList<>()).add(order);',
      },
      {
        kind: 'paragraph',
        text: '`computeIfAbsent` returns the existing or newly-computed value, making one-line multimaps and caches. `merge(key, value, remapper)` handles "insert or combine". These also have atomic semantics on [[concurrent-collections|ConcurrentHashMap]], where they replace lock-protected check-then-act sequences.',
      },
      {
        kind: 'code',
        title: 'getOrDefault, computeIfAbsent, and merge — what each replaces',
        code: '// getOrDefault: replaces `map.containsKey(k) ? map.get(k) : fallback`\nint priority = priorities.getOrDefault(task, DEFAULT_PRIORITY);\n\n// computeIfAbsent: replaces "check null, create, put, then use" for lazy init / multimaps\nList<Order> orders = byCustomer.computeIfAbsent(customer, k -> new ArrayList<>());\norders.add(order);\n\n// merge: replaces "get, null-check, put-or-combine" for counters and accumulators\nwordCounts.merge(word, 1, Integer::sum);              // insert 1, or add 1 to existing\ntotals.merge(department, invoice.amount(), BigDecimal::add);',
      },
      {
        kind: 'pitfall',
        title: 'computeIfAbsent returns the value, not null',
        text: '`computeIfAbsent` never returns null on success — it hands back the *existing* value if the key is present, or the *freshly computed* one if it just inserted. Code that treats its return as "did I just insert?" is wrong; check `containsKey` before the call if that distinction matters. (It genuinely can return null: if the mapping function itself returns null, no entry is added and `computeIfAbsent` returns null — a legitimate way to signal "skip".)',
        detail: 'The one case it genuinely can return null is exactly that carve-out: if the mapping *function* itself returns null, the JDK treats it as "do not insert anything" and hands back null — legitimate for signaling "skip this key," but easy to conflate with the "just inserted" case if the return value isn\'t read carefully.',
      },
      {
        kind: 'pitfall',
        title: 'Mutating a map during forEach',
        text: 'Adding or removing keys from inside `map.forEach((k, v) -> …)` throws `ConcurrentModificationException`, same as mutating during a for-each loop — `forEach` is still iterating the backing structure. `replaceAll` is the safe in-place update for values only (it cannot add/remove keys). To delete conditionally, use `map.entrySet().removeIf(e -> …)` or `map.values().removeIf(...)`; to insert derived keys, collect them first and `putAll` after.',
        detail: '`forEach` is specified to behave like iterating `entrySet()` internally, so it inherits the exact same fail-fast, structural-modification-throws-CME behavior as any other iteration — the fix is the same too: collect the keys to remove or add into a separate list first, then apply them after the loop finishes.',
      },
      {
        kind: 'code',
        title: 'Iteration and bulk ops',
        code: 'for (Map.Entry<String, Integer> e : counts.entrySet()) {\n    System.out.println(e.getKey() + ": " + e.getValue());\n}\ncounts.forEach((k, v) -> System.out.println(k + ": " + v));\ncounts.replaceAll((k, v) -> v * 2);',
      },
      {
        kind: 'pitfall',
        title: 'get on a miss returns null — and so might a hit',
        text: 'A `null` from `get` means *absent or mapped-to-null* — indistinguishable. `containsKey` disambiguates; better, avoid null values entirely (`Map.of` even forbids them). For sorted/ordered alternatives: `TreeMap` (sorted keys, `NavigableMap` range queries), `LinkedHashMap` (insertion or access order).',
        detail: 'This ambiguity is precisely what `getOrDefault` and `computeIfAbsent` exist to sidestep — reaching for `containsKey` to disambiguate is a correct but two-lookup fix, whereas designing the map to simply never store null values removes the ambiguity altogether.',
      },
      {
        kind: 'code',
        title: 'LRU cache in six lines',
        code: 'Map<K, V> cache = new LinkedHashMap<>(16, 0.75f, true) {   // true = access order\n    @Override\n    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {\n        return size() > MAX_ENTRIES;\n    }\n};',
      },
      {
        kind: 'note',
        title: 'Special-purpose maps',
        text: '`EnumMap` (array-backed, for enum keys — EJ 37), `WeakHashMap` (entries vanish when keys are only weakly reachable — canary for memory leaks), `IdentityHashMap` (keys compared with `==`, for object-graph algorithms like serialization).',
        detail: '`EnumMap` gets its speed the same way `EnumSet` does — a small array indexed by ordinal instead of a hash table; `WeakHashMap` is less a performance tool and more a leak-detection one, useful for caches keyed by objects you do not want to be the reason those objects stay alive.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.4 — Maps' },
      { book: 'learning-java', chapter: 'Ch. 7 — Collections' },
      { book: 'effective-java', chapter: 'Item 37 (EnumMap)' },
    ],
    related: ['hashing-internals', 'concurrent-collections', 'sorted-collections'],
  },

  {
    id: 'hashing-internals',
    domainId: 'collections',
    title: 'Hashing Internals',
    summary:
      'HashMap = array of buckets, indexed by a spread of the key\'s `hashCode`, with collisions chained in lists that convert to red-black trees when they grow. Knowing this explains capacity, load factor, and why hashCode quality matters.',
    keyPoints: [
      {
        text: 'Bucket index = `(n - 1) & spreadedHash` — table size n is always a power of two',
        detail: 'Because `n` is a power of two, `n - 1` is a run of all-1 bits (15 for n=16, 31 for n=32), and ANDing a hash against that mask is equivalent to `hash % n` but computed with a single fast bitwise instruction instead of a division.',
      },
      {
        text: 'Load factor 0.75: table doubles (rehash) when size exceeds capacity × 0.75',
        detail: '0.75 is a deliberate space/time tradeoff baked into the JDK\'s default: a lower load factor means emptier, faster buckets at the cost of wasted array slots; a higher one packs the table tighter but lets bucket chains grow longer before the next resize.',
      },
      {
        text: 'Java 8+: a bucket with ≥ 8 colliding entries becomes a red-black tree → worst case O(log n)',
        detail: 'Below 8 entries a chain is actually faster to scan than a tree, because the constant overhead of a comparison-based tree loses to a handful of hash-then-equals checks — the treeification threshold is chosen specifically because that is roughly where the tree starts winning.',
      },
      {
        text: 'Equal objects **must** share a hash code, or lookups miss ([[object-contracts]])',
        detail: 'A `get` first jumps to the bucket the *search key*\'s hash computes, then compares against entries in that bucket — if an object\'s `hashCode` disagrees with its `equals`, the map can put one into bucket 3 and look for it in bucket 9, and simply never find it, equals or no equals.',
      },
      {
        text: 'Presize: `HashMap.newHashMap(expected)` (Java 19+) or capacity = expected / 0.75 + 1',
        detail: 'The division by the load factor matters because the constructor\'s capacity argument is the *table size*, not the number of entries it can hold before resizing — asking for exactly the entry count you expect would trigger a resize before you even finish inserting them.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Picture the table first: a `HashMap` is, at bottom, an array (`table`) of "buckets." A key\'s `hashCode()` is reduced to an index into that array — that reduction is what "spreading" and `(n-1) & hash` compute. Put a key in and it lands in the bucket its index names; ask for it back and the map recomputes the same index and looks there. Two keys can reduce to the *same* index — they "collide" — so each bucket actually holds a small chain (or, once it grows large enough, a tree) of every entry that ever landed there, and a lookup walks that chain comparing hashes then `equals`. Load factor and resizing exist to keep those chains short: shrink the array-to-entries ratio, and the ④-step "walk the bucket" degrades.',
      },
      {
        kind: 'paragraph',
        text: 'A `get(key)`: ① compute `key.hashCode()`, ② spread it (`h ^ (h >>> 16)` — mixes high bits into the low bits that pick the bucket), ③ index the table, ④ walk the bucket comparing first hash values, then `equals`. With a good hash function buckets hold 0–2 entries and the whole operation is a handful of cache accesses.',
      },
      {
        kind: 'code',
        title: 'The essential shape (simplified from OpenJDK)',
        code: 'transient Node<K,V>[] table;          // length always a power of 2\n\nstatic class Node<K,V> {\n    final int hash;\n    final K key;\n    V value;\n    Node<K,V> next;                    // collision chain\n}\n\nstatic final int hash(Object key) {\n    int h;\n    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);\n}',
      },
      {
        kind: 'paragraph',
        text: '**Treeification** (Java 8) capped the damage of pathological collisions: before it, an attacker posting thousands of colliding keys degraded a server\'s HashMap to an O(n) list — an actual DoS class. At 8 collisions a bucket becomes a red-black tree ordered by hash then (if `Comparable`) by key.',
      },
      {
        kind: 'pitfall',
        title: 'Resize is the hidden cost',
        text: 'Every doubling re-distributes all entries. Inserting a million entries into a default-sized (16) map performs ~17 rehash passes. When the size is even roughly known, presize — a one-line change worth real percentage points in hot paths (a standard tip in the performance books).',
        detail: 'Each of those ~17 rehash passes is a full O(current size) operation — allocate a new, double-sized array, then recompute the bucket for every existing entry and relink it — so the total work across all resizes is itself on the order of the final size, paid in unpredictable pauses instead of one upfront cost.',
      },
      {
        kind: 'paragraph',
        text: '`hashCode` quality is your contract: `Objects.hash(f1, f2, …)` is fine for most classes; high-performance code hand-rolls `31 * result + field` chains to avoid varargs boxing (EJ Item 11). Caching the hash of an immutable object (as `String` does) turns repeated lookups nearly free.',
      },
      {
        kind: 'note',
        title: 'HashSet is a HashMap in a trench coat',
        text: '`HashSet<E>` delegates to a `HashMap<E, Object>` with a shared dummy value. All of the above — spreading, load factor, treeification — applies verbatim to sets.',
        detail: 'Concretely: `HashSet.add(e)` is implemented as `map.put(e, PRESENT)` where `PRESENT` is one shared dummy object reused for every entry, so a `HashSet` pays exactly a `HashMap`\'s memory overhead per element plus nothing for the unused value slot.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.3.3, 9.4 — Hash Sets; Maps' },
      { book: 'effective-java', chapter: 'Items 10, 11' },
      { book: 'java-secrets', chapter: 'Collections & performance chapters' },
    ],
    related: ['object-contracts', 'maps', 'sets', 'language-performance'],
  },

  {
    id: 'sorted-collections',
    domainId: 'collections',
    title: 'Sorted Collections',
    summary:
      '`TreeMap` and `TreeSet` keep elements permanently sorted in a red-black tree: O(log n) operations, in-order iteration, and navigation queries (`floor`, `ceiling`, ranges) that hash structures cannot answer.',
    keyPoints: [
      {
        text: 'Red-black tree: self-balancing; height ≤ 2 log n guaranteed',
        detail: 'An unbalanced binary search tree can degrade to a linked list (O(n) per operation) if elements arrive in sorted order; a red-black tree\'s coloring and rotation rules guarantee no root-to-leaf path is ever more than twice as long as any other, keeping every operation at O(log n) regardless of insertion order.',
      },
      {
        text: 'Order comes from `Comparable` or a `Comparator` supplied at construction',
        detail: 'If no `Comparator` is passed to the constructor, the tree falls back to the element type\'s natural order via `compareTo` — pass one explicitly to override that, or to sort a type that has no natural order at all.',
      },
      {
        text: '**Membership uses compareTo, not equals** — keep them consistent',
        detail: 'Two elements that `compareTo` reports as equal (returns 0) are treated as the same element by `TreeSet`/`TreeMap`, full stop — even if `equals` would say they are different objects, the second one is either rejected (`TreeSet.add`) or silently overwrites the first (`TreeMap.put`).',
      },
      {
        text: '`NavigableMap/Set`: `floorKey`, `ceilingKey`, `headMap`, `tailMap`, `subMap`, `descending*`',
        detail: '`floor`/`ceiling` answer "nearest key ≤ / ≥ this one" in O(log n) — a question a hash-based structure cannot answer at all without scanning every entry, which is the whole reason to reach for a tree over a hash map when the data is naturally ordered.',
      },
      {
        text: 'Sorted ≠ sort-once: for one-time ordering, sorting an `ArrayList` is cheaper',
        detail: 'A `TreeSet` pays O(log n) on *every* insertion to maintain order continuously; if the data only needs to be sorted once at the end, collecting into an `ArrayList` and calling `Collections.sort` once is the same asymptotic cost with far less overhead per operation and no ongoing rebalancing.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Navigation queries',
        code: 'NavigableMap<LocalDate, Meeting> calendar = new TreeMap<>();\n\nMeeting nextMeeting = calendar.ceilingEntry(today).getValue();   // earliest ≥ today\nvar thisWeek = calendar.subMap(monday, true, friday, true);      // range view\nvar latestPast = calendar.floorEntry(today);                     // latest ≤ today',
      },
      {
        kind: 'paragraph',
        text: 'These queries are the reason to choose a tree: schedules, price ladders, version lookups ("newest release ≤ requested"), leaderboards. A `HashMap` can only answer exact-key questions; a `TreeMap` answers *nearest-key* and *range* questions at the same O(log n).',
      },
      {
        kind: 'note',
        title: 'Comparable vs Comparator',
        text: '`Comparable` ([[object-contracts]]) is the type\'s own **natural order** — `compareTo` lives on the class itself, so there is exactly one, and it is what a plain `new TreeSet<>()` uses. `Comparator` is an **external, standalone** ordering passed in at construction (or to `sort`/`sorted`) — a type can have any number of them (`by salary`, `by hire date`, `reversed`), and none of them need to agree with `compareTo`. Reach for `Comparable` when there is one obvious default order for every instance of a type; reach for `Comparator` for every other order, and always for types you don\'t own.',
        detail: 'A useful test for which one you need: if you can say "the" natural order of this type without qualification (numbers by magnitude, strings alphabetically), that\'s `Comparable`; the moment you catch yourself saying "sorted by X" for some field X, that\'s a `Comparator`.',
      },
      {
        kind: 'pitfall',
        title: 'compareTo-equals inconsistency',
        text: '`TreeSet` deems elements duplicate when `compareTo` returns 0 — `equals` is never consulted. A `TreeSet<BigDecimal>` collapses `2.0` and `2.00` into one element, while `HashSet` keeps both. A comparator that only compares one field silently swallows "different" entries that tie on it — a nasty production bug. Break ties explicitly: `comparing(...).thenComparing(...)`.',
        detail: '`BigDecimal.compareTo` treats `2.0` and `2.00` as equal because it compares mathematical value, while `BigDecimal.equals` treats them as different because it also compares scale (the number of decimal places) — the two methods are deliberately inconsistent, which is exactly the trap this pitfall warns about.',
      },
      {
        kind: 'pitfall',
        title: 'TreeMap/TreeSet judge equality by compareTo, not equals',
        text: 'The same rule governs `TreeMap`: `put`ting a key that compares equal (`compareTo`/`comparator` returns 0) to an existing key **overwrites** that entry rather than adding a second one — even if `equals` says the two keys are different objects. If an ordering is inconsistent with `equals` (EJ Item 14), the map silently drops entries a caller expected to keep, with no exception and no log line. Keep `compareTo` consistent with `equals`, or document loudly when you intentionally deviate ([[object-contracts]]).',
        detail: 'There is no exception thrown and no log line written when this happens — the second `put` simply looks like a normal update to whoever wrote it, and the "lost" entry only becomes visible as a bug when someone later notices the map has fewer entries than the number of `put` calls that were made.',
      },
      {
        kind: 'code',
        title: 'Custom order at construction',
        code: 'SortedSet<Employee> byPay = new TreeSet<>(\n        Comparator.comparingDouble(Employee::salary).reversed()\n                  .thenComparing(Employee::id));      // tie-breaker keeps distinct elements\nbyPay.addAll(staff);',
      },
      {
        kind: 'code',
        title: 'NavigableMap range views: subMap, headMap, tailMap',
        code: 'NavigableMap<Integer, String> gradeBands = new TreeMap<>(Map.of(\n        90, "A", 80, "B", 70, "C", 60, "D"));\n\n// subMap(from, fromInclusive, to, toInclusive) — an arbitrary range, live view\nSortedMap<Integer, String> passing = gradeBands.subMap(60, true, 100, false);\n\n// headMap(toKey) — everything strictly below toKey; headMap(toKey, true) includes it\nSortedMap<Integer, String> belowB = gradeBands.headMap(80);          // {60=D, 70=C}\n\n// tailMap(fromKey) — everything from fromKey up; inclusive by default\nSortedMap<Integer, String> bAndUp = gradeBands.tailMap(80);          // {80=B, 90=A}\n\n// all three are VIEWS: writes through to gradeBands, and vice versa\npassing.remove(70);          // also removes 70 from gradeBands',
      },
      {
        kind: 'note',
        title: 'Concurrent cousin',
        text: '`ConcurrentSkipListMap`/`Set` provide the same sorted/navigable API lock-free for multithreaded use — see [[concurrent-collections]].',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.3.3 — Trees; 9.4 Maps' },
      { book: 'effective-java', chapter: 'Item 14 — Comparable' },
    ],
    related: ['object-contracts', 'sets', 'maps', 'concurrent-collections'],
  },

  {
    id: 'views-algorithms',
    domainId: 'collections',
    title: 'Views, Wrappers & Algorithms',
    summary:
      'Much of the collections framework returns *views* — lightweight objects backed by the original data: unmodifiable wrappers, `subList` ranges, map key sets, `List.of` and friends. Plus a toolbox of polymorphic algorithms in `Collections`.',
    keyPoints: [
      {
        text: 'A view shares storage with its source — changes propagate (in whichever directions are allowed)',
        detail: 'Nothing is copied when a view is created — `subList`, `keySet()`, and friends return an object that reads and writes through to the same backing array or table as the original, so the view is only ever as valid as its source is unchanged in incompatible ways.',
      },
      {
        text: '`Collections.unmodifiable*` = read-only **window**; the underlying collection can still change',
        detail: 'The wrapper itself refuses every mutating call with `UnsupportedOperationException`, but it holds a reference to the *original* collection rather than a copy of its contents — if the code that created the wrapper still has that original reference and mutates it, the wrapper reflects the change immediately.',
      },
      {
        text: '`List.copyOf` / `Set.copyOf` / `Map.copyOf` = true independent immutable copies',
        detail: 'Unlike the `unmodifiable*` wrappers, these allocate an actual new collection and copy every element into it at call time — there is no live connection to the source afterward, which is what makes them safe to use for genuine defensive copies.',
      },
      {
        text: 'Algorithms: `sort`, `binarySearch`, `shuffle`, `reverse`, `rotate`, `swap`, `min`/`max`, `frequency`, `disjoint`',
        detail: 'All of these are static methods written once against the `List`/`Collection` interfaces rather than against any specific implementation — the same reason `Collections.sort` works identically on an `ArrayList` or a `LinkedList` (though at very different performance).',
      },
      {
        text: '`nCopies`, `emptyList` — memory-free "virtual" collections',
        detail: '`Collections.nCopies(100, "")` does not allocate a 100-element array — it stores just the count and the one repeated element, and computes `get(i)` on demand, which is why it works fine even for absurdly large counts.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Which "immutable" is it?',
        headers: ['Expression', 'What you get', 'Underlying changes visible?', 'Mutation via it'],
        rows: [
          ['`Collections.unmodifiableList(l)`', 'read-only view of `l`', '**Yes**', 'throws'],
          ['`List.copyOf(l)`', 'independent immutable copy', 'No', 'throws'],
          ['`List.of(...)`', 'immutable from scratch', 'n/a', 'throws'],
          ['`Arrays.asList(a)`', 'fixed-size view of array', 'Yes (both ways)', '`set` ok, `add` throws'],
          ['`map.keySet()`', 'view of keys', 'Yes (both ways)', '`remove` ok, `add` throws'],
          ['`list.subList(a, b)`', 'range view', 'Yes (both ways)', 'allowed, writes through'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'An unmodifiable view is not an immutable collection',
        text: 'If code elsewhere holds the original reference, your "unmodifiable" list still changes under your feet. For a defensive copy in an immutable class, use `List.copyOf` ([[immutability-class-design]]); wrappers are for *sharing* a live collection read-only.',
        detail: 'This is the single most common misunderstanding of the `Collections.unmodifiable*` family — "unmodifiable" describes what the *wrapper* will let you do, not a property of the data it contains, and confusing the two is how supposedly-immutable state ends up changing.',
      },
      {
        kind: 'pitfall',
        title: 'Views are live — writes flow through, both ways',
        text: '`subList`, `Map.keySet()`/`values()`/`entrySet()`, `Arrays.asList`, and the `Collections.unmodifiable*`/`synchronized*` wrappers are not copies — they are windows onto the same backing storage, in both directions. Remove through `keySet()` and the entry disappears from the map; structurally change the backing collection while a derived view is in scope and the view throws `ConcurrentModificationException` on its next use. Try to grow a fixed-size `Arrays.asList`, or write through an unmodifiable wrapper, and you get `UnsupportedOperationException` instead. Neither exception means the JDK is broken — they are the view telling you exactly which contract it enforces: *live and mutable* (CME on structural surprises) or *live and read-only* (UOE on any write attempt).',
        detail: 'The mental model that keeps this straight: a view is a *lens*, not a *photograph* — nothing happens to a photograph if you scribble on the lens, but a lens always shows the scene as it currently is, which is exactly the live-window behavior every one of these views exhibits.',
      },
      {
        kind: 'code',
        title: 'keySet() is not a snapshot — it edits the map',
        code: 'Map<String, Integer> scores = new HashMap<>(Map.of("a", 1, "b", 2, "c", 3));\nscores.keySet().removeIf(k -> k.equals("b"));   // removes "b" from scores itself\n// scores is now {a=1, c=3} — the returned Set IS the map\'s keys, not a copy\n\nList<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5));\nnums.subList(1, 3).clear();                     // removes indices 1..2 from nums too\n// nums is now [1, 4, 5]',
      },
      {
        kind: 'code',
        title: 'The algorithms toolbox',
        code: 'Collections.sort(cards);                      // or cards.sort(null)\nCollections.shuffle(cards);                   // Fisher–Yates\nint pos = Collections.binarySearch(sorted, key);   // requires sorted input\nCollections.reverse(cards);                   // in place\nCollections.rotate(list, 2);                  // cycle elements\nString top = Collections.max(names);          // natural order, or pass a Comparator\nint dups = Collections.frequency(words, "the");\nboolean none = Collections.disjoint(setA, setB); // true if no common elements\nList<String> blanks = Collections.nCopies(100, ""); // O(1) memory',
      },
      {
        kind: 'paragraph',
        text: '`binarySearch` returns `-(insertionPoint) - 1` on a miss — the encoded slot where the key belongs, so a follow-up `add(-pos - 1, key)` keeps the list sorted. Passing a `LinkedList` defeats the purpose (random access degrades to O(n)); the method detects this via the `RandomAccess` marker interface.',
      },
      {
        kind: 'note',
        title: 'Checked wrappers',
        text: '`Collections.checkedList(list, String.class)` adds runtime type checks at insertion — useful for hunting down code that abuses raw types to smuggle wrong-typed elements into a generic collection ([[generics-why]]).',
        detail: 'This exists specifically for the hole raw types leave in the type system: assigning a generic list to a raw-typed reference and inserting the wrong element type compiles with only a warning and corrupts the list silently — wrapping the real list in `checkedList` makes that same bad insertion throw immediately, at the point of corruption instead of at some unrelated later `get`.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9.5–9.6 — Copies and Views; Algorithms' },
    ],
    related: ['collections-overview', 'immutability-class-design', 'lists'],
  },

  {
    id: 'choosing-collections',
    domainId: 'collections',
    title: 'Choosing the Right Collection',
    summary:
      'A decision guide: match the collection to the questions your code asks. Default to `ArrayList`, `HashMap`, `HashSet`, `ArrayDeque` — and deviate only for ordering, navigation, priorities, enums, or concurrency.',
    keyPoints: [
      {
        text: 'Ask: duplicates? ordering? key-lookup? both-ends access? priority? concurrent?',
        detail: 'Answering these six questions in order eliminates most of the framework immediately — "do I need key lookup" alone rules out every `List`/`Set`/`Queue` implementation and narrows the choice to the `Map` family.',
      },
      {
        text: 'Defaults: `ArrayList` / `HashMap` / `HashSet` / `ArrayDeque`',
        detail: 'These four cover the overwhelming majority of real code specifically because most collections are small, accessed far more than they are structurally modified, and have no ordering requirement beyond "however things were put in" — the cases that need something else are the exception, not the rule.',
      },
      {
        text: 'Need sorted iteration or nearest-key queries → `TreeMap`/`TreeSet`',
        detail: 'This is the one category the default hash-based structures categorically cannot serve at any cost — no amount of post-processing turns a `HashMap` into something that answers "the entry just below this key" in better than a full scan.',
      },
      {
        text: 'Need insertion order remembered → `LinkedHashMap`/`LinkedHashSet`',
        detail: 'These cost only a small, constant memory premium over their hash-based parents (one extra pair of links per entry) for a guarantee `HashMap`/`HashSet` explicitly do not make — reach for them the moment iteration order is part of the contract, not just an accident of the current implementation.',
      },
      {
        text: 'Enum keys/elements → `EnumMap`/`EnumSet`, always',
        detail: 'The "always" is deliberate: there is essentially no downside to `EnumMap`/`EnumSet` over their hash-based equivalents when the key/element type is an enum — strictly faster, strictly less memory, with declaration-order iteration as a bonus — one of the rare cases in the framework with no tradeoff to weigh.',
      },
      {
        text: 'Multithreaded → [[concurrent-collections]], never `synchronizedX` wrappers by reflex',
        detail: 'A `synchronizedList`/`synchronizedMap` wrapper only makes *individual* method calls thread-safe — a common check-then-act sequence like `if (!map.containsKey(k)) map.put(k, v)` is still racy even wrapped, because another thread can slip in between the two calls; the `concurrent` package\'s classes provide atomic compound operations that actually close that gap.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Decision table',
        headers: ['You need…', 'Reach for', 'Why'],
        rows: [
          ['Indexed access, a sequence', '`ArrayList`', 'contiguous, cache-friendly, O(1) get — see [[lists]]'],
          ['Stack or FIFO queue', '`ArrayDeque`', 'circular array; beats Stack & LinkedList — [[queues-deques]]'],
          ['Dedup, don\'t care about order', '`HashSet`', 'O(1) contains — see [[sets]]'],
          ['Dedup, keep insertion order', '`LinkedHashSet`', 'hash speed + stable iteration order'],
          ['Key → value lookup', '`HashMap`', 'O(1) get/put — see [[maps]]'],
          ['Sorted iteration, range/nearest-key queries', '`TreeMap` / `TreeSet`', 'red-black tree, NavigableXxx API — [[sorted-collections]]'],
          ['Deterministic iteration order, no sorting needed', '`LinkedHashMap` / `LinkedHashSet`', 'linked entries preserve insertion order'],
          ['LRU cache', '`LinkedHashMap` in access-order mode + `removeEldestEntry`', 'access reorders to most-recent; the hook evicts the eldest past capacity'],
          ['Priority / always-process-min', '`PriorityQueue`', 'binary heap, `poll` is O(log n)'],
          ['Enum keys / elements', '`EnumMap` / `EnumSet`', 'array/bit-vector speed (EJ 36–37) — [[enums]]'],
          ['Shared across threads', '`ConcurrentHashMap`, `CopyOnWriteArrayList`, blocking queues', 'see [[concurrent-collections]]'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The performance literature\'s framing: choose by **access pattern first, asymptotics second, constants third**. An O(1) structure with terrible cache behavior can lose to an O(n) scan for small n — and most collections *are* small. Measure before optimizing ([[performance-methodology]]); but don\'t write the accidental O(n²) either.',
      },
      {
        kind: 'pitfall',
        title: 'The accidental O(n²)',
        text: '`list.contains(x)` inside a loop over another list is the classic quadratic bug — invisible at 100 elements, fatal at 1,000,000. Any repeated membership test belongs in a `HashSet`. Similarly `list.remove(0)` in a loop (each shifts everything) wants an `ArrayDeque`.',
        detail: 'The bug hides in plain sight because `list.contains(x)` reads as a single, innocuous call — nothing about its shape signals that it is actually an O(n) scan, and it takes a second nested loop before the combination becomes an O(n²) that only shows up once the input grows past whatever size was used in testing.',
      },
      {
        kind: 'code',
        title: 'Sizing and immutability defaults',
        code: '// Known size → presize (avoids regrowth copies and rehashing):\nList<Row> rows = new ArrayList<>(rowCount);\nMap<String, User> byId = HashMap.newHashMap(userCount);   // Java 19+\n\n// Fixed reference data → immutable factories:\nstatic final Set<String> VOWELS = Set.of("a", "e", "i", "o", "u");',
      },
      {
        kind: 'note',
        title: 'Legacy holdouts',
        text: '`Vector`, `Hashtable`, `Stack`, `Enumeration` are early-JDK relics: synchronized on every call (slow, yet not actually thread-safe for compound actions). In old codebases, replace on sight — `ArrayList`, `HashMap`, `ArrayDeque`, `Iterator`.',
        detail: '"Not actually thread-safe for compound actions" is the key phrase — `Vector`/`Hashtable` synchronize every individual method, so a single `get` or `put` is safe, but a `size()` check followed by a `get(size()-1)` is still a race exactly like the unsynchronized collections, while paying lock overhead on every call regardless.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 9 — Collections' },
      { book: 'optimizing-java', chapter: 'Ch. 11 — Java Language Performance Techniques' },
      { book: 'java-secrets', chapter: 'Performance chapters' },
    ],
    related: ['collections-overview', 'lists', 'sets', 'maps', 'sorted-collections', 'concurrent-collections', 'enums', 'queues-deques'],
  },
]
