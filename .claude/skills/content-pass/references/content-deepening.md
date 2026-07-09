# Content Deepening — Rubric

## Rule

Unlike `expandable-detail` (mechanical), this pass is judgment-based: read the target file and decide what's thin, then fill it in. Apply the "per topic" section below to topic files, and the "per class" section to class-ref files — use whichever applies to the file you were given.

## Per topic (deepen only where thin)

Apply as needed, not mechanically to every topic in the file:

- **Bridging prose** — add a `paragraph` block where a concept is asserted without grounding, so a reader with general programming background but no depth in this specific area can follow without an external lookup.
- **Background `note`** — where missing context would interrupt the main flow if inlined, put it in a `note` block instead.
- **Worked example** — ensure each topic has at least one runnable, annotated `code` block illustrating the concept in practice.
- **keyPoints** — grow to 5–7 skimmable items where currently fewer.
- **Voice discipline** — keep it dense and opinionated. Every added sentence must earn its place by improving comprehension; no filler, no beginner hand-holding beyond the missing grounding.

### Exemplar — a deepened topic block sequence

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

The pattern: ground the mental model first (paragraph, cross-linking `[[related-topic]]`), then one non-obvious behavioral note, then a worked code example that shows rather than tells.

## Per class (deepen the reference)

Class refs are `JavaClass` objects (`src/types/content.ts`) built with the `jc()` helper (typically imported from `src/data/classes/util.ts`), which derives `name`/`pkg`/`javadocUrl` from `fqcn` + `module` and defaults `points`/`methods`/`pitfalls`/`related` to `[]`.

- **Methods** — grow each `methods` list generously: ~15–25 for workhorse classes; exhaustive of the practically-used API for pure utility classes (static-method holders like `Arrays`/`Collections`). Curation still applies — omit deprecated/legacy and vanishingly-rare overloads — but the bar is "a working developer rarely needs to leave this page."
- **example** — add an `example` (with `caption`) where a major class lacks one.
- **pitfalls** — add genuine pitfalls where thin (real footguns, not generic advice).

### Exemplar — a deepened class ref (trimmed)

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
    { signature: 'static <T> T[] copyOf(T[] a, int newLength)', desc: 'Grow/shrink via copy; padded with null/0/false.' },
    { signature: 'static <T> List<T> asList(T... a)', desc: 'Fixed-size, write-through List view — add/remove throw.' },
  ],
  example: {
    code: 'int[] a = { 5, 2, 8, 1 };\nArrays.sort(a);                       // [1, 2, 5, 8]\nint i = Arrays.binarySearch(a, 5);    // 2\nint[] b = Arrays.copyOfRange(a, 0, 2); // [1, 2]\nString s = Arrays.toString(a);        // "[1, 2, 5, 8]"',
    caption: 'The everyday array toolkit — sort, search, slice, compare.',
  },
  pitfalls: [
    'Arrays have no content equals/hashCode/toString of their own — always route through Arrays.* (or Arrays.deep* for nested arrays).',
    'asList is a fixed-size view over the original array: set() writes through, add()/remove() throw UnsupportedOperationException.',
  ],
  related: ['topic:arrays', 'java.util.List'],
}),
```

(Trimmed for length — the full `Arrays` ref in `src/data/classes/collections.ts` covers ~14 methods; this shows the shape, not the ceiling for a given class.)

## Completion marker

Once a file has been deepened, add this line directly under its imports if not already present:

```ts
// content-pass: deepened
```

This is the only signal the coordinator uses to know a file no longer needs this pass — don't skip it.

## Non-goals

- No schema changes (`src/types/content.ts` is off-limits).
- No new topics — a domain's topic ids are fixed. New **class refs** are allowed if the domain's class-ref file is genuinely missing coverage (e.g. a related interface with no ref yet), each with a matching summary row in the domain's `index.ts` (the integrity suite asserts `classSummaries.length === loadedClasses.length`).
- Don't touch domains other than the one file you were dispatched on.
