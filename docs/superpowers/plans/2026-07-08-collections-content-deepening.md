# Collections Content Deepening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deepen the Collections domain of Java::Compendium — richer topic prose, far fuller per-class method coverage, and ~9 new utility/interface class refs — so it reads as a complete, self-contained reference.

**Architecture:** Pure content authoring inside the existing typed-data model. Topics live in `src/data/topics/collections.ts`; class refs in `src/data/classes/collections.ts` with a mirror summary row in `src/data/classes/index.ts`. No schema, component, CSS, or test-harness changes. The integrity suite (`src/data/integrity.test.ts`, run via `npm test`) is the safety net and gates every task.

**Tech Stack:** React 19 / TypeScript / Vite; Vitest for the integrity suite; content is plain TS data objects (`Topic`, `JavaClass`) using mini-markdown (`**bold**`, `` `code` ``, `*italic*`, `[[topic-id]]` / `[[topic-id|label]]`).

## Global Constraints

- **No schema changes.** Do not edit `src/types/content.ts`, `RichText.tsx`, `TopicView.tsx`, the graph, search, or `integrity.test.ts`.
- **No new topics.** The 9 topic ids are fixed. New **class refs** are allowed (Tasks 8–9 only).
- **Every `[[link]]` must resolve** to a real planned topic id. Unlabeled `[[id]]` links are enforced by the integrity suite; **labeled `[[id|label]]` links are NOT auto-checked** — verify them by hand (`grep` the target id across `src/data/topics/`). Valid Collections topic ids: `collections-overview`, `lists`, `sets`, `queues-deques`, `maps`, `hashing-internals`, `sorted-collections`, `views-algorithms`, `choosing-collections`. Cross-domain ids (e.g. `arrays`, `generics-why`, `object-contracts`, `concurrent-collections`, `hardware-memory`, `optional`, `enums`, `gc-fundamentals`, `language-performance`) also exist — only link to ids you have confirmed exist.
- **Class refs are built with the `jc()` helper** (`src/data/classes/util.ts`), which derives `name`/`pkg`/`javadocUrl` from `fqcn` + `module` and defaults `points`/`methods`/`pitfalls`/`related` to `[]`. Every new class needs BOTH a `jc({...})` object in `collections.ts` AND a matching `[fqcn, kind, summary]` row under the `collections:` key in `index.ts` — the integrity suite asserts `classSummaries.length === loadedClasses.length` and that every summary fqcn has a loaded class.
- **`jc()` javadoc-URL gotcha:** `jc()` replaces *all* dots in the fqcn with slashes. For the nested type `java.util.Map.Entry` this yields a broken `.../java/util/Map/Entry.html`. The integrity test only checks the URL *prefix*, so it will NOT catch this. Build `Map.Entry` by spreading `jc(...)` and overriding `pkg` and `javadocUrl` (see Task 9).
- **Match the existing voice exactly:** dense, opinionated, performance-aware. Expand for comprehension; never pad. Method `signature`/`desc` phrasing, `since` versions, and `refs` book keys must mirror neighboring entries.
- **Verification per task (always all three):**
  - `npm test` → expect all integrity specs PASS.
  - `npm run build` → expect `tsc -b` to typecheck clean and Vite to build (catches malformed data objects the tests don't).
  - Visual spot-check optional: `npx vite preview --port 4173` then `node scripts/verify-visual.mjs`.

## A note on this plan's granularity

This is a content-authoring plan, not algorithm code. Each task specifies **exactly which gaps to fill, which methods to add, and which pitfalls to write** for each item — that specificity is the deliverable's contract. Two items are authored verbatim below as **format exemplars** (one topic in Task 1, one class in Task 7) to lock the quality bar; the rest follow that established shape. Tasks 8–9 give the **full `jc({...})` objects** for the new refs, since those are genuinely new code. Fill authored prose during execution to the exemplar's standard — do not paste the exemplar's text into other items.

## File Structure

- `src/data/topics/collections.ts` — 9 topics. Modified in Tasks 1–3.
- `src/data/classes/collections.ts` — 24 existing class refs (deepened, Tasks 4–7) + ~9 new refs appended (Tasks 8–9).
- `src/data/classes/index.ts` — the `collections:` summary-row array. Modified in Tasks 8–9 only (one new row per new class).

No other files change.

---

### Task 1: Deepen sequence topics — `lists`, `sets`, `queues-deques`

**Files:**
- Modify: `src/data/topics/collections.ts` (topics `lists`, `sets`, `queues-deques`)

**Interfaces:**
- Consumes: existing `Topic` shape; the `ContentBlock` union (`paragraph`, `subheading`, `code`, `pitfall`, `bestPractice`, `note`, `table`).
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Deepen `sets` to the exemplar standard**

`sets` currently jumps to `HashSet`/`TreeSet`/`LinkedHashSet` performance without grounding *why membership is `equals`+`hashCode`-driven*. Add, in this order inside `blocks`:
  1. A leading `paragraph` grounding the mental model: a `Set` is "a `Map` whose keys are the elements" — membership, dedup, and iteration order all inherit from the backing map. Cross-link `[[hashing-internals]]` and `[[maps]]`.
  2. Keep the existing implementation table/prose.
  3. A `note` titled "When add() returns false" explaining the built-in seen-before idiom and that it hinges on correct `equals`/`hashCode` (`[[object-contracts]]`).
  4. A worked `code` block: dedup a stream of records, then a `TreeSet` range/navigation example contrasted with a `HashSet`.

Grow `keyPoints` to 5–7 items if currently fewer (e.g. add "iteration order: `HashSet` arbitrary, `LinkedHashSet` insertion, `TreeSet` sorted" and "`Set.of` rejects duplicate arguments at construction").

**Exemplar — this is the target quality/format for a deepened topic block sequence** (matches the existing `hashing-internals` density):

```ts
{
  kind: 'paragraph',
  text: 'A `Set` is best understood as a `Map` with no values: `HashSet` *is* a `HashMap<E, Object>` sharing one dummy value, and `TreeSet` wraps a `TreeMap`. Everything that governs a map — how `equals`/`hashCode` decide identity, iteration order, load factor ([[hashing-internals]]) — governs the matching set verbatim. Pick a set the same way you pick its map: `HashSet` for O(1) membership and don\'t-care order, `LinkedHashSet` to remember insertion order, `TreeSet` when you need sorted iteration or range queries.',
},
{
  kind: 'note',
  title: 'add() returning false is the dedup primitive',
  text: '`set.add(x)` returns `false` when an equal element is already present — a one-call "have I seen this?" test with no second lookup. It is only as correct as the element\'s `equals`/`hashCode` ([[object-contracts]]); a class that overrides one but not the other silently duplicates or loses members.',
},
{
  kind: 'code',
  title: 'Dedup, then navigate',
  code: 'Set<String> unique = new HashSet<>(rawTags);              // dedup in one pass\n\nNavigableSet<Integer> ports = new TreeSet<>(Set.of(22, 80, 443, 8080));\nports.ceiling(100);   // 443  — smallest element >= 100\nports.headSet(443);   // [22, 80]  — everything below 443\nports.descendingSet(); // 8080, 443, 80, 22',
},
```

- [ ] **Step 2: Deepen `lists`**

`lists` is already strong (has the ArrayList-vs-LinkedList table). Additions only: (a) a `code`/`note` on `ListIterator` for cursor-based editing (the one place `LinkedList` earns its keep), forward-referencing the new `[[topic-id|ListIterator]]`? — no, link the class page is not a topic; instead just describe `ListIterator` in prose; (b) ensure `keyPoints` mentions `List.of` immutability and the `subList` view semantics. Keep it tight — do not restate the table.

- [ ] **Step 3: Deepen `queues-deques`**

Add a `note` clarifying the two method families every `Queue` has — the throwing set (`add`/`remove`/`element`) vs the special-value set (`offer`/`poll`/`peek`) — and *when each throws vs returns null/false*. Add a worked `code` block using `ArrayDeque` as both a stack (`push`/`pop`) and a FIFO queue (`offer`/`poll`), and note `PriorityQueue` iteration is **not** sorted (only `poll` order is). Cross-link `[[choosing-collections]]`.

- [ ] **Step 4: Run the integrity suite**

Run: `npm test`
Expected: PASS — all `topics` specs green (link resolution, required layers).

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`
Expected: `tsc -b` clean, Vite build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/data/topics/collections.ts
git commit -m "content: deepen list/set/queue collections topics"
```

---

### Task 2: Deepen map/hashing topics — `maps`, `hashing-internals`, `sorted-collections`

**Files:**
- Modify: `src/data/topics/collections.ts` (topics `maps`, `hashing-internals`, `sorted-collections`)

**Interfaces:**
- Consumes: `Topic` / `ContentBlock` shapes.
- Produces: nothing.

- [ ] **Step 1: Deepen `maps`**

Ensure the modern map API is taught, not just listed. Add a worked `code` block demonstrating `computeIfAbsent` (multimap idiom), `merge` (counting idiom), and `getOrDefault`, each with a one-line comment on what it replaces (the old get-null-check-put dance). Add a `pitfall` on `computeIfAbsent` returning the *existing or new* value (not null) and on mutating a map during `forEach`. Grow `keyPoints` to include "`null` keys/values: `HashMap` allows one null key; `TreeMap`/`ConcurrentHashMap` reject nulls."

- [ ] **Step 2: Deepen `hashing-internals` (targeted bridge)**

This topic is already deep but assumes the reader knows what a "bucket" is before load factor is discussed. Insert **one** leading `paragraph` (before the existing `(n-1) & hash` keyPoint payoff) grounding the picture: a hash table is an array of slots ("buckets"); a key's `hashCode` is reduced to an index into that array; multiple keys landing in the same slot "collide" and are chained. Only then does load factor / resize make sense. Keep everything already there. Do not duplicate the existing spread-function paragraph.

- [ ] **Step 3: Deepen `sorted-collections`**

Add a `note` distinguishing `Comparable` (natural order, one per type) from `Comparator` (external, many orderings), and a `pitfall` that `TreeMap`/`TreeSet` judge equality by `compareTo`/`comparator` returning 0 — **not** `equals` — so an ordering inconsistent with `equals` silently drops "equal" entries. Add a worked `code` block for `NavigableMap` range views (`subMap`/`headMap`/`tailMap`) if not already vivid. Cross-link `[[object-contracts]]`.

- [ ] **Step 4: Run the integrity suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/data/topics/collections.ts
git commit -m "content: deepen map/hashing/sorted collections topics"
```

---

### Task 3: Deepen cross-cutting topics — `collections-overview`, `views-algorithms`, `choosing-collections`

**Files:**
- Modify: `src/data/topics/collections.ts` (topics `collections-overview`, `views-algorithms`, `choosing-collections`)

**Interfaces:**
- Consumes: `Topic` / `ContentBlock` shapes.
- Produces: nothing.

- [ ] **Step 1: Deepen `collections-overview`**

Add a `note` that names the three flavors of "unmodifiable" so the reader isn't confused later: truly-immutable (`List.of`), fixed-size write-through (`Arrays.asList`), and read-only view of a mutable backing (`Collections.unmodifiableList`). Cross-link `[[views-algorithms]]` and `[[arrays]]`. Ensure the "program to interfaces" idea has a one-line *why* (swap implementation without touching callers).

- [ ] **Step 2: Deepen `views-algorithms`**

Make the "view" concept concrete: add a `pitfall` that `subList`, `Map.keySet`/`values`/`entrySet`, `Arrays.asList`, and the `Collections.unmodifiable*`/`synchronized*` wrappers are all **live views** — writes and structural changes flow through — and `ConcurrentModificationException`/`UnsupportedOperationException` are the symptoms of misusing them. Add a `code` block showing `keySet().removeIf(...)` removing from the backing map. List the workhorse `Collections` algorithms in a `table` or tightened `keyPoints` (`sort`, `binarySearch`, `reverse`, `shuffle`, `min`/`max`, `frequency`, `disjoint`, `nCopies`).

- [ ] **Step 3: Deepen `choosing-collections`**

This is the decision hub — make it a genuine cheat sheet. Ensure there is a decision `table` keyed by need → recommended type (e.g. "indexed access" → `ArrayList`; "dedup, don't care about order" → `HashSet`; "dedup + insertion order" → `LinkedHashSet`; "sorted / range queries" → `TreeMap`/`TreeSet`; "FIFO or stack" → `ArrayDeque`; "priority" → `PriorityQueue`; "enum keys" → `EnumMap`; "LRU cache" → `LinkedHashMap` access-order). Cross-link the relevant topics. Keep prose minimal — the table carries it.

- [ ] **Step 4: Run the integrity suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/data/topics/collections.ts
git commit -m "content: deepen overview/views/choosing collections topics"
```

---

### Task 4: Deepen core-interface & List-family classes

**Files:**
- Modify: `src/data/classes/collections.ts` (`Collection`, `List`, `ArrayList`, `LinkedList`, `Iterator`, `Comparator`)

**Interfaces:**
- Consumes: `jc()` helper; `MethodDoc` shape `{ signature, desc }`.
- Produces: nothing.

Grow each `methods` list toward the ceiling (~15–25 for workhorses) and add `example`/`pitfalls` where thin. Specifics:

- [ ] **Step 1: `Collection` + `List`**

`Collection`: add `addAll`, `removeAll`, `retainAll`, `containsAll`, `clear`, `iterator()`, `toArray(T[])`. `List`: add `indexOf`/`lastIndexOf`, `addAll(int, Collection)`, `replaceAll(UnaryOperator)`, `listIterator()`, `contains`, `getFirst`/`getLast`/`addFirst`/`addLast` (SequencedCollection, Java 21), `List.of` overloads note. Add `related` link to the new `java.util.ListIterator` (created in Task 9 — this forward reference is fine; both land before any commit that runs the full suite, but if running Task 4 before Task 9, temporarily omit the `java.util.ListIterator` relation and add it in Task 9). Keep the existing `remove(int)` vs `remove(Object)` pitfall.

- [ ] **Step 2: `ArrayList` + `LinkedList`**

`ArrayList`: add `add(int, E)`, `set`, `indexOf`, `removeIf`, `forEach`, `subList`, `iterator`, plus the existing capacity methods; add an `example` showing presize + bulk add + `trimToSize`. `LinkedList`: add its `Deque` methods (`addFirst`/`addLast`/`peekFirst`/`pollLast`/`push`/`pop`) to show its real niche; keep the "rarely the right choice" pitfall.

- [ ] **Step 3: `Iterator` + `Comparator`**

`Iterator`: add `hasNext`/`next`/`remove`/`forEachRemaining` with the CME-safe-removal note. `Comparator`: this is a workhorse — add `comparing`/`comparingInt`/`comparingDouble`, `thenComparing`, `reversed`, `reverseOrder`/`naturalOrder`, `nullsFirst`/`nullsLast`. Add a `pitfall`: comparators built by subtraction (`(a,b) -> a - b`) overflow for large/negative ints — use `Integer.compare`. Add an `example` chaining `comparing(...).thenComparing(...).reversed()`.

- [ ] **Step 4: Run the integrity suite**

Run: `npm test`
Expected: PASS (class `related` links resolve).

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/data/classes/collections.ts
git commit -m "content: expand method coverage on List-family class refs"
```

---

### Task 5: Deepen Set-family & Map-family classes

**Files:**
- Modify: `src/data/classes/collections.ts` (`Set`, `HashSet`, `LinkedHashSet`, `TreeSet`, `Map`, `HashMap`, `LinkedHashMap`, `TreeMap`, `EnumMap`, `EnumSet`, `WeakHashMap`)

**Interfaces:**
- Consumes: `jc()`, `MethodDoc`.
- Produces: nothing.

- [ ] **Step 1: Set family (`Set`, `HashSet`, `LinkedHashSet`, `TreeSet`)**

`Set`: add `add`/`remove`/`contains`/`retainAll` (as intersection), plus the `of`/`copyOf` factories. `TreeSet`: add the `NavigableSet` surface — `first`/`last`, `ceiling`/`floor`/`higher`/`lower`, `headSet`/`tailSet`/`subSet`, `pollFirst`/`pollLast`, `descendingSet`; add `related` to the new `java.util.NavigableSet`/`java.util.SortedSet` (Task 8). `HashSet`/`LinkedHashSet`: add the presize constructor note; `HashSet.newHashSet(int)` (Java 19+).

- [ ] **Step 2: `Map` + `HashMap` (workhorses — go deep)**

`Map`: add `getOrDefault`, `putIfAbsent`, `computeIfAbsent`, `computeIfPresent`, `compute`, `merge`, `forEach`, `replaceAll`, `keySet`/`values`/`entrySet` (note: live views), `Map.of`/`Map.ofEntries`/`Map.entry`, `Map.copyOf`. Add a `pitfall`: `entrySet`/`keySet`/`values` are backed views — removal writes through, structural map changes invalidate iteration. `HashMap`: add an `example` using `computeIfAbsent` for a multimap and `merge` for counting; add a `pitfall` that iteration order is unspecified and unstable across versions/resizes — never rely on it (use `LinkedHashMap`). Add `HashMap.newHashMap(int)` (Java 19+).

- [ ] **Step 3: `LinkedHashMap` + `TreeMap`**

`LinkedHashMap`: add the access-order constructor + `removeEldestEntry` override and an `example` building a fixed-size LRU cache. `TreeMap`: add the full `NavigableMap` surface — `firstKey`/`lastKey`, `ceilingKey`/`floorKey`/`higherKey`/`lowerKey`, `ceilingEntry`/`floorEntry`, `firstEntry`/`lastEntry`/`pollFirstEntry`, `headMap`/`tailMap`/`subMap`, `descendingMap`; `related` to new `java.util.NavigableMap`/`java.util.SortedMap` (Task 8). Add a `pitfall` mirroring the topic: ordering inconsistent with `equals` drops entries.

- [ ] **Step 4: `EnumMap`, `EnumSet`, `WeakHashMap`**

Round these out modestly (they are already focused): `EnumSet` add `range`, `copyOf`; `EnumMap` note it preserves declaration order and forbids null keys; `WeakHashMap` keep as-is or add `related` to `[[gc-fundamentals]]`. No need to hit the ceiling on these specialized types.

- [ ] **Step 5: Run the integrity suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 7: Commit**

```bash
git add src/data/classes/collections.ts
git commit -m "content: expand method coverage on Set/Map-family class refs"
```

---

### Task 6: Deepen Queue-family & `Optional` classes

**Files:**
- Modify: `src/data/classes/collections.ts` (`Queue`, `Deque`, `ArrayDeque`, `PriorityQueue`, `Optional`)

**Interfaces:**
- Consumes: `jc()`, `MethodDoc`.
- Produces: nothing.

- [ ] **Step 1: `Queue` + `Deque`**

`Queue`: add both method families with their contrast — `add`/`remove`/`element` (throw) vs `offer`/`poll`/`peek` (special value). `Deque` (workhorse): add `addFirst`/`addLast`, `offerFirst`/`offerLast`, `pollFirst`/`pollLast`, `peekFirst`/`peekLast`, `push`/`pop`, `descendingIterator`; add a `note` that `Deque` supersedes the legacy `Stack` class.

- [ ] **Step 2: `ArrayDeque` + `PriorityQueue`**

`ArrayDeque`: add an `example` using it as a stack and a queue; note not thread-safe and forbids null elements. `PriorityQueue`: add `offer`/`poll`/`peek`, constructor with `Comparator`, and a `pitfall` that iteration/`toArray` order is **not** sorted — only successive `poll()` yields sorted order.

- [ ] **Step 3: `Optional`**

Already solid; add `filter`, `or(Supplier)`, `isPresent`/`isEmpty`, and reinforce the `orElse` vs `orElseGet` eager-evaluation pitfall as an explicit `pitfalls` entry. Add `related` to `[[optional]]` topic (already present) — leave as is if so.

- [ ] **Step 4: Run the integrity suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git add src/data/classes/collections.ts
git commit -m "content: expand method coverage on Queue-family and Optional refs"
```

---

### Task 7: Utility classes — `Arrays` and `Collections` (comprehensive)

**Files:**
- Modify: `src/data/classes/collections.ts` (`Arrays`, `Collections`)

**Interfaces:**
- Consumes: `jc()`, `MethodDoc`.
- Produces: nothing.

These are the utility surface the user called out — make them exhaustive of the practically-used API and give each a worked `example`.

- [ ] **Step 1: `Arrays` — comprehensive methods + example**

Extend `methods` to cover: `sort(a)` / `sort(a, from, to)` / `sort(T[], Comparator)`, `parallelSort`, `binarySearch(a, key)` / ranged, `copyOf` / `copyOfRange`, `fill(a, val)` / ranged, `setAll(a, IntFunction)`, `equals` / `deepEquals`, `hashCode` / `deepHashCode`, `toString` / `deepToString`, `compare` / `mismatch`, `asList`, `stream(a)` / `stream(a, from, to)`. Keep descriptions terse. Add an `example`:

**Exemplar — target quality/format for a deepened class ref** (this is the bar for Tasks 4–7):

```ts
jc({
  fqcn: 'java.util.Arrays',
  module: 'java.base',
  kind: 'class',
  since: '1.2',
  summary: 'Static utilities for raw arrays: sort, parallel sort, binary search, fill, copy, comparison, hashing, streaming, and the fixed-size asList view.',
  declaration: 'public final class Arrays',
  methods: [
    { signature: 'static void sort(int[] a) / sort(int[] a, int from, int to)', desc: 'Dual-pivot quicksort for primitives; ranged variant sorts a slice.' },
    { signature: 'static <T> void sort(T[] a, Comparator<? super T> c)', desc: 'Stable TimSort for objects; null comparator = natural order.' },
    { signature: 'static void parallelSort(...)', desc: 'Fork/join parallel sort — wins on large arrays, same result.' },
    { signature: 'static int binarySearch(int[] a, int key)', desc: 'Sorted arrays only; negative return = -(insertion point) - 1.' },
    { signature: 'static <T> T[] copyOf(T[] a, int newLength)', desc: 'Grow/shrink via copy; padded with null/0/false.' },
    { signature: 'static <T> T[] copyOfRange(T[] a, int from, int to)', desc: 'Copy a slice into a fresh array.' },
    { signature: 'static void fill(long[] a, long v) / fill(a, from, to, v)', desc: 'Bulk assignment, whole array or slice.' },
    { signature: 'static <T> void setAll(T[] a, IntFunction<? extends T> gen)', desc: 'Populate by index via a generator function.' },
    { signature: 'static boolean equals(int[] a, int[] b) / deepEquals(Object[], Object[])', desc: 'Content comparison (== on arrays is identity!); deep recurses nested arrays.' },
    { signature: 'static int hashCode(int[] a) / deepHashCode(Object[] a)', desc: 'Content-based hash — arrays do not override hashCode themselves.' },
    { signature: 'static String toString(int[] a) / deepToString(Object[] a)', desc: 'Readable printing; deep recurses nested arrays.' },
    { signature: 'static int compare(int[] a, int[] b) / mismatch(int[] a, int[] b)', desc: 'Lexicographic order; mismatch returns first differing index or -1.' },
    { signature: 'static <T> List<T> asList(T... a)', desc: 'Fixed-size, write-through List view — add/remove throw.' },
    { signature: 'static IntStream stream(int[] a) / stream(a, from, to)', desc: 'Array-to-stream bridge, whole array or slice.' },
  ],
  example: {
    code: 'int[] a = { 5, 2, 8, 1 };\nArrays.sort(a);                       // [1, 2, 5, 8]\nint i = Arrays.binarySearch(a, 5);    // 2\nint[] b = Arrays.copyOfRange(a, 0, 2); // [1, 2]\nString s = Arrays.toString(a);        // "[1, 2, 5, 8]"\nint firstDiff = Arrays.mismatch(a, b); // 2  (first index where they differ)',
    caption: 'The everyday array toolkit — sort, search, slice, compare.',
  },
  pitfalls: [
    'Arrays have no content equals/hashCode/toString of their own — always route through Arrays.* (or Arrays.deep* for nested arrays).',
    'asList is a fixed-size view over the original array: set() writes through, add()/remove() throw UnsupportedOperationException.',
  ],
  related: ['topic:arrays', 'java.util.List', 'java.util.Collections'],
}),
```

- [ ] **Step 2: `Collections` — comprehensive methods + example**

Extend `methods` to cover: `sort` / `sort(list, cmp)`, `binarySearch`, `reverse`, `shuffle`, `swap`, `rotate`, `fill`, `copy`, `min` / `max`, `frequency`, `disjoint`, `addAll`, `replaceAll`, `nCopies`, `emptyList` / `emptyMap` / `emptySet`, `singletonList` / `singleton` / `singletonMap`, `unmodifiableList` / `unmodifiableMap` / `unmodifiableSet` / `unmodifiableCollection`, `synchronizedList` / `synchronizedMap` / `synchronizedCollection`. Add an `example` (e.g. sort + binarySearch + unmodifiable wrap) and a `pitfall`: `synchronized*` wrappers still require manual synchronization on the wrapper during iteration; and unmodifiable wrappers are *views*, not copies (the backing collection can still change).

- [ ] **Step 3: Run the integrity suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/data/classes/collections.ts
git commit -m "content: comprehensive Arrays and Collections utility refs"
```

---

### Task 8: New refs — sorted/navigable interface family

**Files:**
- Modify: `src/data/classes/collections.ts` (append 4 new `jc({...})` objects)
- Modify: `src/data/classes/index.ts` (append 4 rows under `collections:`)

**Interfaces:**
- Consumes: `jc()`.
- Produces: loaded classes `java.util.SortedSet`, `java.util.NavigableSet`, `java.util.SortedMap`, `java.util.NavigableMap` — referenced by `TreeSet`/`TreeMap` `related` (Task 5).

- [ ] **Step 1: Append the four class objects to `collections.ts`**

```ts
jc({
  fqcn: 'java.util.SortedSet',
  module: 'java.base',
  kind: 'interface',
  since: '1.2',
  summary: 'A Set that maintains its elements in ascending order, by natural ordering or a supplied Comparator. Adds endpoint and range operations over Set.',
  declaration: 'public interface SortedSet<E> extends Set<E>',
  methods: [
    { signature: 'E first() / E last()', desc: 'Lowest / highest element (throws if empty).' },
    { signature: 'SortedSet<E> headSet(E to) / tailSet(E from)', desc: 'Range views: strictly-below / at-or-above.' },
    { signature: 'SortedSet<E> subSet(E from, E to)', desc: 'Half-open [from, to) range view.' },
    { signature: 'Comparator<? super E> comparator()', desc: 'The ordering in use, or null for natural order.' },
  ],
  related: ['java.util.NavigableSet', 'java.util.TreeSet', 'topic:sorted-collections'],
}),
jc({
  fqcn: 'java.util.NavigableSet',
  module: 'java.base',
  kind: 'interface',
  since: '1.6',
  summary: 'A SortedSet with nearest-match navigation and descending views. TreeSet is the standard implementation.',
  declaration: 'public interface NavigableSet<E> extends SortedSet<E>',
  methods: [
    { signature: 'E ceiling(E e) / floor(E e)', desc: 'Least element >= e / greatest element <= e (null if none).' },
    { signature: 'E higher(E e) / lower(E e)', desc: 'Strictly greater / strictly lesser neighbor.' },
    { signature: 'E pollFirst() / pollLast()', desc: 'Retrieve and remove the lowest / highest element.' },
    { signature: 'NavigableSet<E> descendingSet()', desc: 'Reverse-order view over the same elements.' },
    { signature: 'NavigableSet<E> subSet(E from, boolean fromInc, E to, boolean toInc)', desc: 'Range view with inclusive/exclusive endpoints.' },
  ],
  related: ['java.util.SortedSet', 'java.util.TreeSet', 'topic:sorted-collections'],
}),
jc({
  fqcn: 'java.util.SortedMap',
  module: 'java.base',
  kind: 'interface',
  since: '1.2',
  summary: 'A Map that keeps its keys in ascending order, by natural ordering or a Comparator. Adds endpoint and range operations over Map.',
  declaration: 'public interface SortedMap<K, V> extends Map<K, V>',
  methods: [
    { signature: 'K firstKey() / lastKey()', desc: 'Lowest / highest key (throws if empty).' },
    { signature: 'SortedMap<K, V> headMap(K to) / tailMap(K from)', desc: 'Range views over the key ordering.' },
    { signature: 'SortedMap<K, V> subMap(K from, K to)', desc: 'Half-open [from, to) key-range view.' },
    { signature: 'Comparator<? super K> comparator()', desc: 'The key ordering, or null for natural order.' },
  ],
  related: ['java.util.NavigableMap', 'java.util.TreeMap', 'topic:sorted-collections'],
}),
jc({
  fqcn: 'java.util.NavigableMap',
  module: 'java.base',
  kind: 'interface',
  since: '1.6',
  summary: 'A SortedMap with nearest-match key/entry navigation and descending views. TreeMap is the standard implementation.',
  declaration: 'public interface NavigableMap<K, V> extends SortedMap<K, V>',
  methods: [
    { signature: 'K ceilingKey(K k) / floorKey(K k)', desc: 'Least key >= k / greatest key <= k (null if none).' },
    { signature: 'Map.Entry<K, V> ceilingEntry(K k) / floorEntry(K k)', desc: 'Nearest entry at or beyond / at or below k.' },
    { signature: 'Map.Entry<K, V> firstEntry() / lastEntry()', desc: 'Extreme entries (null if empty).' },
    { signature: 'Map.Entry<K, V> pollFirstEntry() / pollLastEntry()', desc: 'Retrieve and remove the extreme entry.' },
    { signature: 'NavigableMap<K, V> descendingMap()', desc: 'Reverse-order view over the same mappings.' },
    { signature: 'NavigableMap<K, V> subMap(K from, boolean fromInc, K to, boolean toInc)', desc: 'Key-range view with inclusive/exclusive endpoints.' },
  ],
  related: ['java.util.SortedMap', 'java.util.TreeMap', 'java.util.Map.Entry', 'topic:sorted-collections'],
}),
```

> Note: `java.util.Map.Entry` in `NavigableMap.related` is created in Task 9. If executing Task 8 before Task 9, omit that one relation here and add it when Task 9 lands, OR run `npm test` only after Task 9. The rest of Task 8's relations resolve within Tasks 5/8.

- [ ] **Step 2: Append the four summary rows to `index.ts`**

Under the `collections:` array in `src/data/classes/index.ts`, append:

```ts
    ['java.util.SortedSet', 'interface', 'Set kept in ascending order — first/last and range views'],
    ['java.util.NavigableSet', 'interface', 'SortedSet + ceiling/floor navigation and descending views'],
    ['java.util.SortedMap', 'interface', 'Map with keys in ascending order — endpoint and range views'],
    ['java.util.NavigableMap', 'interface', 'SortedMap + nearest-key/entry navigation and descending views'],
```

- [ ] **Step 3: Run the integrity suite**

Run: `npm test`
Expected: PASS — `classSummaries.length === loadedClasses.length`, every new summary fqcn has a loaded class, all `related` resolve (except a deferred `Map.Entry` relation if you chose to omit it).

- [ ] **Step 4: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add src/data/classes/collections.ts src/data/classes/index.ts
git commit -m "content: add SortedSet/NavigableSet/SortedMap/NavigableMap refs"
```

---

### Task 9: New refs — `SequencedCollection`, `SequencedMap`, `ListIterator`, `Spliterator`, `Map.Entry`

**Files:**
- Modify: `src/data/classes/collections.ts` (append 5 new class objects)
- Modify: `src/data/classes/index.ts` (append 5 rows under `collections:`)

**Interfaces:**
- Consumes: `jc()`.
- Produces: loaded classes `java.util.SequencedCollection`, `java.util.SequencedMap`, `java.util.ListIterator`, `java.util.Spliterator`, `java.util.Map.Entry` — the last resolves the deferred `related` from Tasks 4 and 8.

- [ ] **Step 1: Append four `jc({...})` objects + the special-cased `Map.Entry`**

```ts
jc({
  fqcn: 'java.util.SequencedCollection',
  module: 'java.base',
  kind: 'interface',
  since: '21',
  summary: 'Java 21 unification of collections with a well-defined encounter order: first/last access and a reversed view, inherited by List, Deque, and SortedSet.',
  declaration: 'public interface SequencedCollection<E> extends Collection<E>',
  methods: [
    { signature: 'void addFirst(E) / addLast(E)', desc: 'Insert at the front / back (may be unsupported on immutable views).' },
    { signature: 'E getFirst() / getLast()', desc: 'Peek the ends (throws NoSuchElementException if empty).' },
    { signature: 'E removeFirst() / removeLast()', desc: 'Remove and return an end element.' },
    { signature: 'SequencedCollection<E> reversed()', desc: 'A reverse-order VIEW — writes flow through.' },
  ],
  points: ['Retrofitted onto List, Deque, LinkedHashSet, and SortedSet in Java 21 — one consistent end-access API.'],
  related: ['java.util.List', 'java.util.Deque', 'topic:collections-overview'],
}),
jc({
  fqcn: 'java.util.SequencedMap',
  module: 'java.base',
  kind: 'interface',
  since: '21',
  summary: 'Java 21 Map with a defined encounter order: first/last entries, put-at-end, and reversed/sequenced views. Implemented by LinkedHashMap and NavigableMap.',
  declaration: 'public interface SequencedMap<K, V> extends Map<K, V>',
  methods: [
    { signature: 'Map.Entry<K, V> firstEntry() / lastEntry()', desc: 'Ends of the encounter order (null if empty).' },
    { signature: 'Map.Entry<K, V> pollFirstEntry() / pollLastEntry()', desc: 'Retrieve and remove an end entry.' },
    { signature: 'V putFirst(K, V) / putLast(K, V)', desc: 'Insert or move a mapping to an end.' },
    { signature: 'SequencedMap<K, V> reversed()', desc: 'Reverse-order VIEW of the mappings.' },
  ],
  related: ['java.util.LinkedHashMap', 'java.util.NavigableMap', 'topic:collections-overview'],
}),
jc({
  fqcn: 'java.util.ListIterator',
  module: 'java.base',
  kind: 'interface',
  since: '1.2',
  summary: 'A bidirectional cursor over a List that can also insert, replace, and remove at the current position — the one place LinkedList editing beats ArrayList.',
  declaration: 'public interface ListIterator<E> extends Iterator<E>',
  methods: [
    { signature: 'boolean hasNext() / hasPrevious()', desc: 'Traversal in either direction.' },
    { signature: 'E next() / E previous()', desc: 'Advance / retreat, returning the crossed element.' },
    { signature: 'int nextIndex() / previousIndex()', desc: 'Indices of the elements the cursor sits between.' },
    { signature: 'void set(E e)', desc: 'Replace the last element returned by next/previous.' },
    { signature: 'void add(E e)', desc: 'Insert before the element that next() would return.' },
    { signature: 'void remove()', desc: 'Remove the last element returned (CME-safe).' },
  ],
  related: ['java.util.Iterator', 'java.util.List', 'topic:lists'],
}),
jc({
  fqcn: 'java.util.Spliterator',
  module: 'java.base',
  kind: 'interface',
  since: '1.8',
  summary: 'The traversal-and-partition primitive under the Stream API: advance one element, split off a chunk for parallelism, and advertise characteristics the pipeline optimizes on.',
  declaration: 'public interface Spliterator<T>',
  methods: [
    { signature: 'boolean tryAdvance(Consumer<? super T> action)', desc: 'Process the next element if present; false when exhausted.' },
    { signature: 'Spliterator<T> trySplit()', desc: 'Split off a prefix chunk for parallel work (null if not splittable).' },
    { signature: 'long estimateSize()', desc: 'Estimated remaining count — drives parallel task sizing.' },
    { signature: 'int characteristics()', desc: 'Bit flags: ORDERED, SORTED, SIZED, DISTINCT, IMMUTABLE, NONNULL...' },
    { signature: 'void forEachRemaining(Consumer<? super T> action)', desc: 'Bulk-process the rest sequentially.' },
  ],
  points: ['You rarely implement one directly — Collection.spliterator() and the Stream framework provide them.'],
  related: ['java.util.Iterator', 'java.util.stream.Stream', 'topic:collections-overview'],
}),
{
  ...jc({
    fqcn: 'java.util.Map.Entry',
    module: 'java.base',
    kind: 'interface',
    since: '1.2',
    summary: 'A single key/value pair — the element type of Map.entrySet() and the return of NavigableMap navigation. Comparator factories order entries by key or value.',
    declaration: 'public interface Map.Entry<K, V>',
    methods: [
      { signature: 'K getKey() / V getValue()', desc: 'The pair components.' },
      { signature: 'V setValue(V value)', desc: 'Write through to the backing map (entrySet entries only).' },
      { signature: 'static <K,V> Map.Entry<K,V> comparingByKey() / comparingByValue()', desc: 'Comparators for sorting entry streams.' },
      { signature: 'static <K,V> Map.Entry<K,V> Map.entry(K, V)', desc: 'Immutable standalone entry (via Map.entry factory).' },
    ],
    related: ['java.util.Map', 'java.util.NavigableMap', 'topic:maps'],
  }),
  pkg: 'java.util',
  javadocUrl: 'https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Map.Entry.html',
},
```

> The `Map.Entry` entry is spread-and-overridden because `jc()` would otherwise emit `pkg: 'java.util.Map'` and a broken `.../java/util/Map/Entry.html` URL (all-dots-to-slashes). `name` derives correctly to `Entry`.

- [ ] **Step 2: If Tasks 4/8 deferred the `java.util.ListIterator` / `java.util.Map.Entry` relations, add them back now**

Add `'java.util.ListIterator'` to `List.related` (Task 4) and `'java.util.Map.Entry'` to `NavigableMap.related` (Task 8) if they were omitted to keep intermediate `npm test` runs green.

- [ ] **Step 3: Append five summary rows to `index.ts`**

Under the `collections:` array, append:

```ts
    ['java.util.SequencedCollection', 'interface', 'Java 21: first/last access and a reversed view over an ordered collection'],
    ['java.util.SequencedMap', 'interface', 'Java 21: first/last entries, put-at-end, and reversed views for maps'],
    ['java.util.ListIterator', 'interface', 'Bidirectional list cursor that can add/set/remove in place'],
    ['java.util.Spliterator', 'interface', 'Split-and-traverse primitive powering the Stream API'],
    ['java.util.Map.Entry', 'interface', 'A key/value pair — entrySet element and comparator factories'],
```

- [ ] **Step 4: Run the integrity suite**

Run: `npm test`
Expected: PASS — all 33 class refs (24 deepened + 9 new) load, summaries mirror them 1:1, every `related` resolves.

- [ ] **Step 5: Typecheck / build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 6: Visual verification (final)**

Run: `npx vite preview --port 4173` (background) then `node scripts/verify-visual.mjs`
Expected: Collections topic and class pages render; new class pages reachable; no console errors.

- [ ] **Step 7: Commit**

```bash
git add src/data/classes/collections.ts src/data/classes/index.ts
git commit -m "content: add Sequenced*/ListIterator/Spliterator/Map.Entry refs"
```

---

## Final verification (after all tasks)

- [ ] `npm test` — full integrity suite green.
- [ ] `npm run build` — typecheck + production build clean.
- [ ] Manual review in `npm run dev`: walk all 9 Collections topics (self-contained, no unexplained jargon) and spot-check `Arrays`, `Collections`, `HashMap`, `TreeMap`, and the new interface refs for method depth and correct javadoc links (especially `Map.Entry` → `Map.Entry.html`).
- [ ] Update project memory (`java-compendium-app.md`) to record the Collections deepening as the quality bar for future domain passes.

## Self-review against the spec

- **Deepen thin topic prose** → Tasks 1–3 (all 9 topics, with the specific `hashing-internals` bridge called out in Task 2).
- **More methods on existing classes** → Tasks 4–7 (all 24 refs, workhorses to ~15–25, `Arrays`/`Collections` exhaustive).
- **New utility/interface refs** → Tasks 8–9 (all 9 from the spec: SortedSet, NavigableSet, SortedMap, NavigableMap, SequencedCollection, SequencedMap, ListIterator, Spliterator, Map.Entry), each with the required `index.ts` row.
- **`Objects`/`Iterable` not re-added** → honored (they stay in lang-core; referenced only via `related`).
- **No schema/component/test changes; integrity green per task** → every task ends with `npm test` + `npm run build`.
- **`Map.Entry` javadoc-URL gotcha** → handled explicitly in Task 9 Step 1.
