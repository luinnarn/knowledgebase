# Expandable Detail — Rubric

## Rule

Every `KeyPoint` object (`{ text, detail }`) and every `pitfall`/`bestPractice`/`note` `ContentBlock` should carry a `detail` field, unless the base `text` is already fully self-contained (rare — most existing entries benefit from one).

`KeyPoint` is a union: `string | { text: string; detail: string }` (defined in `src/types/content.ts`). A plain string entry has **not** been retrofitted yet — convert it to the object form when adding `detail`.

## What `detail` is for

`detail` expands **why**, not **what**. The `text`/base sentence already states the fact or rule tersely; `detail` gives the reasoning, the failure mode it guards against, or the mental model that makes the rule stick — dense, no restating the headline. Aim for roughly 2–4 sentences' worth of content, but one long em-dash-joined sentence is fine too if that's what the reasoning needs — match this codebase's existing voice, not a literal sentence count.

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
