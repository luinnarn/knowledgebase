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

- **Scope of this pass:** the Collections domain end-to-end — 9 topics + 24 class refs — as the pilot that sets the "expanded" quality bar. Other domains are explicitly out of scope for this spec; they follow as separate passes reusing this pattern.
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

- **Methods** — grow each `methods` list to the important curated set: ~8–15 for workhorse classes (`ArrayList`, `HashMap`, `TreeMap`, `ArrayDeque`, `Deque`, `Comparator`); **comprehensive** for `Arrays` and `Collections` since those are the utility surface the user called out. Curated still means "the methods that matter," not a javadoc dump.
- **example** — add an `example` (with `caption`) where a major class lacks one, especially the utility classes (`Arrays`, `Collections`) which benefit most from a worked snippet.
- **pitfalls** — add genuine pitfalls where thin, e.g. `HashMap` iteration-order instability, `TreeMap`/`TreeSet` ordering-inconsistent-with-`equals`, `Comparator` reversed/`thenComparing` subtraction overflow, `PriorityQueue` iteration not being sorted.

Specific coverage to add:
- `Arrays`: `copyOfRange`, `parallelSort`, `mismatch`, `compare`, ranged `sort(a, from, to)` / `fill(a, from, to, v)`, `setAll`, `hashCode` / `deepHashCode`, ranged `stream`.
- `Collections`: `reverse`, `swap`, `rotate`, `disjoint`, `addAll`, `synchronizedList`/`synchronizedMap`, `unmodifiableMap`/`unmodifiableSet`, `emptyList`/`emptyMap`/`singletonList`, `replaceAll`.

## Out of scope

- Any schema change to `content.ts` (no new block kinds, no new Topic/JavaClass fields).
- Changes to `RichText.tsx`, `TopicView.tsx`, the graph, search, or the integrity test harness.
- Any domain other than Collections.
- Re-running / rebuilding the PDF extraction pipeline.
- Adding entirely new topics or new class refs (the 9 topics and 24 classes already exist; this pass deepens them). If authoring reveals a genuinely missing sibling class that belongs in the Collections area, it may be added, but that is not a goal.

## Guardrails & verification

- `[[topic-id]]` / `[[topic-id|label]]` links must resolve to real topic ids; class `related` entries must resolve to real fqcns or `topic:` ids.
- Run `npm test` (the integrity suite in `src/data/integrity.test.ts`) after editing each file — it fails on any broken link, graph edge, or class relation.
- Beware the `.topic` global CSS class collision noted in project memory — but since this pass adds no components/CSS, that is only a caution.
- Match existing formatting exactly: mini-markdown in prose (`**bold**`, `` `code` ``, `*italic*`, `[[links]]`), method `signature`/`desc` phrasing style, `since` versions, `refs` book keys.

## Success criteria

- A reader with general programming background but no Java-collections depth can follow every Collections topic without an external lookup.
- `Arrays` and `Collections` read as complete, usable utility references.
- Voice and formatting are indistinguishable from the best existing entries.
- `npm test` is green.

## After the pilot

User reviews the deepened Collections domain in the running app. Once the quality bar is confirmed, the same pattern rolls out domain-by-domain in follow-up passes (each its own plan), and the project memory is updated to note the deepening standard.
