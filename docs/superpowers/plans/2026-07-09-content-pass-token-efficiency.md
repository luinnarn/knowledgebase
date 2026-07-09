# Content-Pass Token Efficiency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a `content-pass` project skill that lets a coordinator dispatch cheap, self-contained, fresh subagents to run the two recurring content-authoring passes (expandable-detail retrofit, content deepening) one domain file at a time, then validate it with one real dispatch.

**Architecture:** A lean `SKILL.md` (workflow + dispatch template + "what's next" grep recipes) plus two mode-specific reference docs (`expandable-detail.md`, `content-deepening.md`) that embed calibration exemplars directly so a dispatched subagent never has to read a second live file for voice comparison. The coordinator only ever runs cheap `grep`/`git status` commands and dispatches fresh, non-fork subagents — never reads target file bodies itself.

**Tech Stack:** Plain Markdown skill files (`.claude/skills/content-pass/`); no code, no schema, no test-infrastructure changes. Verification of authored content continues to rely on the existing `npm test` (Vitest integrity suite) and `npm run build` (`tsc -b` + Vite) gates.

## Global Constraints

- No changes to `src/types/content.ts`, `RichText.tsx`, `TopicView.tsx`, the graph, search, or `src/data/integrity.test.ts`.
- Skill lives at `.claude/skills/content-pass/SKILL.md` with references under `.claude/skills/content-pass/references/`.
- Dispatch is sequential — one file, one subagent, at a time. Never parallelize (adjacent files can share `src/data/classes/index.ts` or a domain's `index.ts` topic loader).
- Every commit must follow the existing message conventions already visible in `git log` (`Retrofit <domain> domain with expandable detail`) and only happen after both `npm test` and `npm run build` pass clean.
- Fresh, non-fork subagent dispatch only (per the approved design) — this keeps per-dispatch cost to "skill + one file," with no inherited conversation history.

---

### Task 1: Create `SKILL.md`

**Files:**
- Create: `.claude/skills/content-pass/SKILL.md`

**Interfaces:**
- Consumes: nothing (this is the entry point).
- Produces: the skill's frontmatter `name: content-pass`, referenced by Task 4's dispatch prompt; the two reference-file paths consumed by Tasks 2–3's files.

- [ ] **Step 1: Write `SKILL.md`**

```markdown
---
name: content-pass
description: Use when retrofitting expandable detail (KeyPoint/callout `detail` fields) or deepening content (richer prose, fuller method coverage) on a single Java::Compendium topic or class-ref file. Determines what's next, applies the right mode's rubric, verifies with npm test/build, and commits.
---

# Content Pass

Two recurring content-authoring passes repeat across this repo's topic and class-ref files (`src/data/cs/topics/*.ts`, `src/data/topics/*.ts`, `src/data/system-design/topics/*.ts`, `src/data/classes/*.ts`). This skill handles **one file at a time**, in one of two modes. It exists to keep each pass cheap: a dispatched subagent reads only the schema-relevant reference and the one target file — never a second live file for comparison.

## Modes

- **`expandable-detail`** — add optional `detail` fields to `KeyPoint` objects and `pitfall`/`bestPractice`/`note` blocks. Mechanical, no judgment calls about what content to add. See `references/expandable-detail.md`.
- **`content-deepening`** — richer topic prose (bridging paragraphs, background notes, worked examples) and fuller class-method coverage. Judgment-based — you decide what's thin. See `references/content-deepening.md`.

**Only read the reference file for the mode you were given.** Do not read the other mode's reference — it isn't relevant to your task and costs tokens for nothing.

## Determine what's next (coordinator use — run before dispatching)

Run from the repo root:

```bash
# 1. Finish in-progress work first: any topic/class file with uncommitted changes
git status --short -- src/data/cs/topics/*.ts src/data/topics/*.ts src/data/system-design/topics/*.ts src/data/classes/*.ts

# 2. If step 1 is empty, find untouched expandable-detail candidates (zero `detail:` occurrences)
grep -L "detail:" src/data/cs/topics/*.ts src/data/topics/*.ts src/data/system-design/topics/*.ts 2>/dev/null | grep -v '/index\.ts$'

# 3. If step 2 is empty, find undeepened content-deepening candidates (no completion marker)
grep -L "content-pass: deepened" src/data/topics/*.ts src/data/cs/topics/*.ts src/data/system-design/topics/*.ts 2>/dev/null | grep -v '/index\.ts$'
```

Priority order: finish anything from step 1 first (uncommitted WIP), then sweep `expandable-detail` across all fully-untouched files (step 2) before starting `content-deepening` (step 3) — the mechanical pass is cheaper and should clear a domain before the heavier pass touches it. Pick one file from the highest-priority non-empty step.

## Dispatch (coordinator use)

Dispatch **one fresh, non-fork subagent per file**. Wait for it to finish and report before dispatching the next one — never parallelize.

Prompt template:

```
Use the content-pass skill, mode: <expandable-detail|content-deepening>, on <file path>.
If the Skill tool doesn't list content-pass yet, read .claude/skills/content-pass/SKILL.md
and the relevant references/<mode>.md file directly with the Read tool instead.
Read the target file, apply the mode's pattern per the skill's rubric, run
npm test && npm run build, commit as "<commit message>", then report back:
files changed, test/build result, commit hash. If genuinely blocked, report
that instead of guessing.
```

Commit message convention:
- `expandable-detail` mode: `Retrofit <domain> domain with expandable detail` — match the exact wording already used in this repo's git history.
- `content-deepening` mode: `content: deepen <domain> domain`

`<domain>` is the file's basename without extension (e.g. `craftsmanship-practice`, `sd-caching`).

## Workflow (subagent use)

1. Read the target file in full.
2. Read the mode's reference doc (`references/expandable-detail.md` or `references/content-deepening.md`).
3. Apply the mode's pattern to every topic/class entry in the file that needs it.
4. Run `npm test` — expect the integrity suite to pass (link resolution, class/summary sync, graph edges).
5. Run `npm run build` — expect `tsc -b` to typecheck clean and Vite to build.
6. If either fails, fix and re-run before proceeding. Never commit a failing state.
7. If mode is `content-deepening`, add `// content-pass: deepened` directly under the file's imports if not already present.
8. Commit with the convention above, scoped to the file(s) you touched (`git add <file(s)>`, not `git add -A`).
9. Report back: which file, which mode, test/build result, commit hash.

## Constraints (both modes)

- Never edit `src/types/content.ts`, `RichText.tsx`, `TopicView.tsx`, the graph, search, or `src/data/integrity.test.ts`.
- Every `[[topic-id]]` link and every class `related` entry must resolve. `npm test` catches unlabeled `[[id]]` links and class/summary sync automatically; labeled `[[id|label]]` links are **not** auto-checked — verify by hand (`grep` the target id) if you add any.
- Match the existing voice exactly: dense, opinionated, performance-aware. Expand for comprehension, never pad for beginners.
```

- [ ] **Step 2: Verify frontmatter is valid YAML**

Run: `head -5 "/Users/nikola/VS Code Projects/java-knowledge-base/.claude/skills/content-pass/SKILL.md"`
Expected: three lines between `---` markers, `name: content-pass` and a `description:` line, matching the format used by other skills in this environment (e.g. `using-superpowers`).

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/content-pass/SKILL.md
git commit -m "tooling: add content-pass skill entry point"
```

---

### Task 2: Create `references/expandable-detail.md`

**Files:**
- Create: `.claude/skills/content-pass/references/expandable-detail.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the mode reference loaded by any subagent dispatched with `mode: expandable-detail` (per Task 1's `SKILL.md`).

- [ ] **Step 1: Write `references/expandable-detail.md`**

```markdown
# Expandable Detail — Rubric

## Rule

Every `KeyPoint` object (`{ text, detail }`) and every `pitfall`/`bestPractice`/`note` `ContentBlock` should carry a `detail` field, unless the base `text` is already fully self-contained (rare — most existing entries benefit from one).

`KeyPoint` is a union: `string | { text: string; detail: string }` (defined in `src/types/content.ts`). A plain string entry has **not** been retrofitted yet — convert it to the object form when adding `detail`.

## What `detail` is for

`detail` expands **why**, not **what**. The `text`/base sentence already states the fact or rule tersely; `detail` gives the reasoning, the failure mode it guards against, or the mental model that makes the rule stick — 2–4 sentences, dense, no restating the headline.

### Exemplar 1 — KeyPoint

Before:
```ts
'SRP — a module should have one reason to change: one responsibility, one *actor* it answers to',
```

After:
```ts
{
  text: 'SRP — a module should have one reason to change: one responsibility, one *actor* it answers to',
  detail: '"Actor" is the operative word, not "thing" — two pieces of logic can look like the same responsibility to a programmer while actually serving two different stakeholders who change their requirements independently. The class only has one reason to change when it answers to exactly one of them.',
},
```

### Exemplar 2 — callout block (pitfall)

Before:
```ts
{
  kind: 'pitfall',
  title: 'LSP: the classic Square-extends-Rectangle trap',
  text: 'Mathematically a square is a rectangle, so `Square extends Rectangle` looks reasonable — until `setWidth`/`setHeight` on a `Rectangle` reference silently also change the other dimension on a `Square`, breaking any code that assumed setting one didn\'t affect the other. LSP violations hide in behavior, not signatures: the types check out, but the *contract* — what callers are entitled to assume — doesn\'t hold. If a subtype needs `instanceof` checks or narrows preconditions/widens postconditions in surprising ways, it isn\'t really substitutable.',
},
```

After:
```ts
{
  kind: 'pitfall',
  title: 'LSP: the classic Square-extends-Rectangle trap',
  text: 'Mathematically a square is a rectangle, so `Square extends Rectangle` looks reasonable — until `setWidth`/`setHeight` on a `Rectangle` reference silently also change the other dimension on a `Square`, breaking any code that assumed setting one didn\'t affect the other. LSP violations hide in behavior, not signatures: the types check out, but the *contract* — what callers are entitled to assume — doesn\'t hold. If a subtype needs `instanceof` checks or narrows preconditions/widens postconditions in surprising ways, it isn\'t really substitutable.',
  detail: 'The trap is specifically that this compiles cleanly and looks conceptually correct (squares genuinely are rectangles, mathematically) — nothing in the type signatures reveals the problem. It only surfaces at runtime, in a caller that held a `Rectangle` reference and never expected setting one dimension to silently move the other, which is exactly the kind of contract violation LSP exists to name.',
},
```

Apply the same shape to `bestPractice` and `note` blocks — add `detail` alongside the existing `title`/`text`.

## Non-goals

- Do not add new `ContentBlock`s, new topics, or new class refs — this pass only adds `detail` fields to what already exists.
- Do not reword existing `text` fields on `KeyPoint`s or blocks — leave the base sentence exactly as it is (only converting the array-literal shape from string to object where needed).
- Do not touch `summary`, `refs`, or `related`.

## Per-file completion check

Before committing, re-scan the file and confirm:
- No `keyPoints` array entry is still a bare string literal — every entry is `{ text, detail }`.
- Every `pitfall`/`bestPractice`/`note` block has a `detail` key.

If the file has multiple topics, check every topic — it's common for only the first one or two to have been converted in a prior pass.
```

- [ ] **Step 2: Verify it references the same exemplar source used in `SKILL.md`'s voice guidance**

Run: `grep -c "Exemplar" "/Users/nikola/VS Code Projects/java-knowledge-base/.claude/skills/content-pass/references/expandable-detail.md"`
Expected: `2`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/content-pass/references/expandable-detail.md
git commit -m "tooling: add expandable-detail rubric reference"
```

---

### Task 3: Create `references/content-deepening.md`

**Files:**
- Create: `.claude/skills/content-pass/references/content-deepening.md`

**Interfaces:**
- Consumes: nothing.
- Produces: the mode reference loaded by any subagent dispatched with `mode: content-deepening` (per Task 1's `SKILL.md`).

- [ ] **Step 1: Write `references/content-deepening.md`**

```markdown
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
```

- [ ] **Step 2: Verify the exemplar code blocks are syntactically plausible TypeScript**

Run: `grep -c "jc({" "/Users/nikola/VS Code Projects/java-knowledge-base/.claude/skills/content-pass/references/content-deepening.md"`
Expected: `1` (the one embedded class-ref exemplar)

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/content-pass/references/content-deepening.md
git commit -m "tooling: add content-deepening rubric reference"
```

---

### Task 4: Validate the skill with one real dispatch

**Files:**
- Modify: `src/data/cs/topics/craftsmanship-practice.ts` (via the dispatched subagent, not directly)

**Interfaces:**
- Consumes: `SKILL.md` and `references/expandable-detail.md` from Tasks 1–2.
- Produces: nothing consumed by later tasks — this is the validation checkpoint for the whole plan.

**Note:** this task inherently requires dispatching a subagent (the `Agent` tool) — it should be run by whoever has coordinator-level tool access in the executing session, not delegated further down.

At plan-writing time, `src/data/cs/topics/craftsmanship-practice.ts` has uncommitted changes already in the working tree (one topic, `pragmatic-mindset`, already converted to the expandable-detail shape; the other six topics — `tracer-bullets-and-prototyping`, `requirements-and-communication`, `tooling-and-automation`, `estimating`, `testing-philosophy`, `debugging-and-problem-solving` — are not yet converted). This is exactly the kind of in-progress file `SKILL.md`'s "determine what's next" step 1 is designed to pick up first.

- [ ] **Step 1: Confirm the file is still the top-priority pending file**

Run:
```bash
cd "/Users/nikola/VS Code Projects/java-knowledge-base" && git status --short -- src/data/cs/topics/*.ts src/data/topics/*.ts src/data/system-design/topics/*.ts src/data/classes/*.ts
```
Expected: `src/data/cs/topics/craftsmanship-practice.ts` appears (possibly alongside the other 4 files already in progress at plan-writing time: `architecture-principles.ts`, `design-patterns.ts`, `interview-patterns.ts`, `refactoring-quality.ts`). If the list differs from this because some of those 5 were committed between plan-writing and execution, pick whichever one of the 5 still shows as modified; if all 5 are gone, re-run the full "determine what's next" procedure from `SKILL.md` and use whatever file it surfaces instead of `craftsmanship-practice.ts`.

- [ ] **Step 2: Dispatch the subagent**

Use the `Agent` tool with a fresh (non-fork) dispatch, description `"Finish craftsmanship-practice expandable-detail pass"`, and this prompt:

```
Use the content-pass skill, mode: expandable-detail, on
src/data/cs/topics/craftsmanship-practice.ts in the Java::Compendium repo at
/Users/nikola/VS Code Projects/java-knowledge-base.

If the Skill tool doesn't list content-pass yet, read
.claude/skills/content-pass/SKILL.md and
.claude/skills/content-pass/references/expandable-detail.md directly with the
Read tool instead.

This file has uncommitted changes already: one topic (pragmatic-mindset) has
already been converted to the expandable-detail shape. Finish the remaining
six topics in the same file to the same standard, then verify and commit the
whole file as one commit (matching the existing convention of one commit per
domain).

Read the target file, apply the mode's pattern per the skill's rubric, run
npm test && npm run build, commit as "Retrofit craftsmanship-practice domain
with expandable detail", then report back: files changed, test/build result,
commit hash. If genuinely blocked, report that instead of guessing.
```

- [ ] **Step 3: Review the subagent's report**

Confirm the report states: `npm test` passed, `npm run build` passed, and a commit was made. If it reports being blocked, read its stated reason and resolve it (e.g. clarify the reference doc) rather than proceeding.

- [ ] **Step 4: Independently verify the result**

Run:
```bash
cd "/Users/nikola/VS Code Projects/java-knowledge-base" && git log --oneline -1 -- src/data/cs/topics/craftsmanship-practice.ts && git status --short -- src/data/cs/topics/craftsmanship-practice.ts && npm test 2>&1 | tail -20
```
Expected: the log shows a new commit for this file, `git status` shows no uncommitted changes to it, and `npm test` passes (all integrity specs green).

- [ ] **Step 5: Spot-check the diff for quality**

Run:
```bash
cd "/Users/nikola/VS Code Projects/java-knowledge-base" && git show --stat HEAD -- src/data/cs/topics/craftsmanship-practice.ts
```
Read the actual commit diff (`git show HEAD -- src/data/cs/topics/craftsmanship-practice.ts`) and confirm: every `keyPoints` entry across all seven topics is the `{ text, detail }` object form, every `pitfall`/`bestPractice`/`note` block has a `detail` field, and the voice matches the exemplars in `references/expandable-detail.md` (dense, "why not what", no padding).

If quality is off, fix `references/expandable-detail.md` (not just this file) so the correction compounds across all future dispatches — this is the point of the reference doc.

---

## Final verification (after all tasks)

- [ ] `.claude/skills/content-pass/SKILL.md`, `references/expandable-detail.md`, and `references/content-deepening.md` all exist and are committed.
- [ ] `src/data/cs/topics/craftsmanship-practice.ts` is fully retrofitted, committed, and `npm test` / `npm run build` are green.
- [ ] No other files under `src/` were modified by this plan except `craftsmanship-practice.ts` (Task 4's validation target).
- [ ] `src/types/content.ts`, `RichText.tsx`, `TopicView.tsx`, and `src/data/integrity.test.ts` are untouched.

## Self-review against the spec

- **One skill, two modes** → Task 1 (`SKILL.md` covers both, dispatches to mode-specific references).
- **Fresh, non-fork subagent dispatch, sequential, self-contained prompt** → `SKILL.md`'s "Dispatch" section (Task 1) and the literal dispatch in Task 4, Step 2.
- **Embedded exemplars instead of reading live files for calibration** → Tasks 2–3 (both reference docs embed real exemplars pulled from this repo's own git history, trimmed for the doc).
- **Progress tracking derived from repo state, no tracking file** → `SKILL.md`'s "Determine what's next" section (Task 1): `git status` for in-progress work, `grep -L "detail:"` for untouched expandable-detail candidates, `grep -L "content-pass: deepened"` for undeepened candidates.
- **Completion marker for content-deepening** → `references/content-deepening.md` (Task 3).
- **Sequential dispatch, no parallel writes** → stated explicitly in `SKILL.md`'s "Dispatch" section and the Global Constraints above.
- **Validated with a real run, not just written** → Task 4, using the actual next-pending file identified at plan-writing time (with a fallback if repo state has moved on by execution time).
- **No schema/test-infrastructure changes** → Global Constraints; nothing in any task touches `src/types/content.ts` or `integrity.test.ts`.
