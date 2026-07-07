# Collections Content Deepening — Design

**Date:** 2026-07-08
**Status:** Approved (pending spec review)
**Scope:** Pilot pass to deepen the Collections domain content as a calibration for a later app-wide rollout.

## Problem

Java::Compendium reads as a strong reference for someone who already knows Java, but:

1. Some individual items are terse enough to be hard to follow without prior knowledge — a concept is asserted without the grounding a reader would need (e.g. `hashing-internals` discusses load factor before establishing what a bucket is).
2. Method coverage on class refs is thinly curated — workhorse classes list only a handful of methods, and the utility classes (`Arrays`, `Collections`) are far from complete despite being *the* utility surface.
3. The user explicitly called out collections and utility classes like `Arrays` as priorities.

The content is intentionally not for beginners — that stays. The goal is **expand for comprehension, not pad for beginners**: keep the dense, opinionated, performance-aware voice while making each item self-contained.

## Decisions (locked)

- **Scope of this pass:** the Collections domain end-to-end — 9 topics + 24 existing class refs (deepened) + ~8–9 new utility/interface class refs (added) — as the pilot that sets the "expanded" quality bar. Other domains are explicitly out of scope for this spec; they follow as separate passes reusing this pattern.
- **Content source:** authored from current Java expertise (through Java 21+), matching existing voice and citing the same books where a claim maps to them. No re-extraction of the source PDFs.
- **Mechanism:** Approach A — enrich within the existing content model. **No schema, component, or test-infrastructure changes.** Only data files change.

## Approach A: enrich within the existing model

The `ContentBlock` union (`paragraph`, `subheading`, `code`, `pitfall`, `bestPractice`, `note`, `table`) and the `JavaClass` model (`methods`, `example`, `pitfalls`, `points`) are already rich enough. In particular, the `note` block already serves the "here's the background you'd otherwise be missing" role, so no new `background` block or depth tier is needed.

### Per topic (deepen only where thin)

Files: `src/data/topics/collections.ts` — topics `collections-overview`, `lists`, `sets`, `queues-deques`, `maps`, `hashing-internals`, `sorted-collections`, `views-algorithms`, `choosing-collections`.

For each topic, apply as needed (not mechanically to every topic):

- **Bridging prose** — add a `paragraph` where a concept is asserted without grounding, so the reader can follow without an external lookup.
- **Background `note`** — where the missing context would interrupt the main flow, put it in a `note` block instead of inlining.
- **Worked example** — ensure each topic has at least one runnable, annotated `code` block illustrating the concept in practice.
- **keyPoints** — grow to 5–7 skimmable items where currently short.
- **Voice discipline** — keep it dense and opinionated. Every added sentence must earn its place by improving comprehension; no filler, no beginner hand-holding beyond the missing grounding.

Known specific gap to fix: `hashing-internals` should ground what a hash bucket is and how `hashCode`→bucket mapping works before discussing load factor and resizing.

### Per class (deepen the reference)

File: `src/data/classes/collections.ts` — the 24 refs: `Collection`, `List`, `ArrayList`, `LinkedList`, `Set`, `HashSet`, `LinkedHashSet`, `TreeSet`, `Map`, `HashMap`, `LinkedHashMap`, `TreeMap`, `Queue`, `Deque`, `ArrayDeque`, `PriorityQueue`, `Iterator`, `Comparator`, `Collections`, `Arrays`, `EnumMap`, `EnumSet`, `WeakHashMap`, `Optional`.

- **Methods** — grow each `methods` list generously: up to ~15–25 for workhorse classes (`ArrayList`, `HashMap`, `TreeMap`, `TreeSet`, `ArrayDeque`, `Deque`, `Comparator`, `Map`, `List`); **exhaustive of the practically-used API** for `Arrays` and `Collections`. Curation still applies — omit deprecated/legacy and vanishingly-rare overloads — but the bar is "a working Java developer rarely needs to leave this page," not "a handful of highlights."
- **example** — add an `example` (with `caption`) where a major class lacks one, especially the utility classes (`Arrays`, `Collections`) which benefit most from a worked snippet.
- **pitfalls** — add genuine pitfalls where thin, e.g. `HashMap` iteration-order instability, `TreeMap`/`TreeSet` ordering-inconsistent-with-`equals`, `Comparator` reversed/`thenComparing` subtraction overflow, `PriorityQueue` iteration not being sorted.

Specific coverage to add:
- `Arrays`: `copyOfRange`, `parallelSort`, `mismatch`, `compare`, ranged `sort(a, from, to)` / `fill(a, from, to, v)`, `setAll`, `hashCode` / `deepHashCode`, ranged `stream`.
- `Collections`: `reverse`, `swap`, `rotate`, `disjoint`, `addAll`, `synchronizedList`/`synchronizedMap`, `unmodifiableMap`/`unmodifiableSet`, `emptyList`/`emptyMap`/`singletonList`, `replaceAll`.

### New class refs to add (utility & interface surface)

The Collections area is missing several types that round out the hierarchy and utility surface. Add each as a full `JavaClass` in `src/data/classes/collections.ts` **and** a summary row under the `collections` rows in `src/data/classes/index.ts`:

- `java.util.SortedSet` (interface) — ordered-set contract: `first`/`last`, `headSet`/`tailSet`/`subSet`, `comparator`.
- `java.util.NavigableSet` (interface) — `ceiling`/`floor`/`higher`/`lower`, `pollFirst`/`pollLast`, `descendingSet`.
- `java.util.SortedMap` (interface) — sorted-map contract mirroring `SortedSet`.
- `java.util.NavigableMap` (interface) — `ceilingEntry`/`floorEntry`/`higherKey`/`lowerKey`, `firstEntry`/`lastEntry`, `subMap`.
- `java.util.SequencedCollection` (interface, Java 21) — `addFirst`/`addLast`, `getFirst`/`getLast`, `removeFirst`/`removeLast`, `reversed`.
- `java.util.SequencedMap` (interface, Java 21) — sequenced-map view methods.
- `java.util.ListIterator` (interface) — bidirectional cursor with `add`/`set`/`previous`/`nextIndex`.
- `java.util.Spliterator` (interface) — the parallel-friendly traversal primitive under streams; `tryAdvance`, `trySplit`, `characteristics`.
- `java.util.Map.Entry` (interface) — key/value pair; `getKey`/`getValue`/`setValue`, static `comparingByKey`/`comparingByValue`, `Map.entry` factory.

`java.util.Objects` and `java.lang.Iterable` already exist (in lang-core) and are **not** re-added here — reference them via `related` instead. `SequencedSet` (Java 21) may be added if it reads as distinct from `SequencedCollection`; otherwise fold it into the `SequencedCollection` entry to avoid a near-empty ref.

## Out of scope

- Any schema change to `content.ts` (no new block kinds, no new Topic/JavaClass fields).
- Changes to `RichText.tsx`, `TopicView.tsx`, the graph, search, or the integrity test harness.
- Any domain other than Collections.
- Re-running / rebuilding the PDF extraction pipeline.
- Adding new **topics** (the 9 topics already exist; this pass deepens them). New **class refs** are in scope — see "New class refs to add" above.
- Re-adding `java.util.Objects` or `java.lang.Iterable`, which already exist in the lang-core area.

## Guardrails & verification

- `[[topic-id]]` / `[[topic-id|label]]` links must resolve to real topic ids; class `related` entries must resolve to real fqcns or `topic:` ids.
- Every new class ref needs **both** a full `JavaClass` in `collections.ts` and a matching summary `Row` under the `collections` key in `index.ts` — the integrity suite checks the two stay in sync.
- Run `npm test` (the integrity suite in `src/data/integrity.test.ts`) after editing each file — it fails on any broken link, graph edge, or class relation.
- Beware the `.topic` global CSS class collision noted in project memory — but since this pass adds no components/CSS, that is only a caution.
- Match existing formatting exactly: mini-markdown in prose (`**bold**`, `` `code` ``, `*italic*`, `[[links]]`), method `signature`/`desc` phrasing style, `since` versions, `refs` book keys.

## Success criteria

- A reader with general programming background but no Java-collections depth can follow every Collections topic without an external lookup.
- `Arrays` and `Collections` read as complete, usable utility references; workhorse classes carry a deep (~15–25 method) curated API.
- The sorted/navigable/sequenced interface family, `ListIterator`, `Spliterator`, and `Map.Entry` now have their own class refs, correctly registered in `index.ts`.
- Voice and formatting are indistinguishable from the best existing entries.
- `npm test` is green.

## After the pilot

User reviews the deepened Collections domain in the running app. Once the quality bar is confirmed, the same pattern rolls out domain-by-domain in follow-up passes (each its own plan), and the project memory is updated to note the deepening standard.
