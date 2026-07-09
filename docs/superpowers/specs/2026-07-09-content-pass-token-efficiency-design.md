# Content-Pass Token Efficiency — Design

**Date:** 2026-07-09
**Status:** Approved (pending spec review)
**Scope:** Tooling/workflow to minimize token usage for recurring domain-by-domain content-authoring passes across Java::Compendium (CS, Java, and System Design areas).

## Problem

The project has grown into ~29 topic files (CS: 10, Java: 8, System Design: 10, `collections` retrofitted separately) plus 7 class-ref files, all following one standardized content model (`src/types/content.ts`). Two recurring, well-specified content-authoring passes repeat file-by-file across this set:

1. **Expandable-detail retrofit** — add optional `detail` fields to `KeyPoint`/`pitfall`/`bestPractice`/`note` entries. Mechanical. In progress for CS (5 files uncommitted as of this design); not yet started for System Design (10 files); already done for all Java-domain topic files.
2. **Content deepening** — richer topic prose (bridging paragraphs, background `note`s, worked examples) and fuller class-method coverage. Piloted on `collections` only; explicitly intended to roll out to the other 7 Java domains and, later, CS/System Design.

Each pass today happens inline in one large conversation: reading the schema, reading the target file, re-deriving "what does good look like" by comparing against other files, editing, verifying (`npm test`, `npm run build`), and committing — then repeating for the next file in the *same* context. Context accumulates across every file in the run, driving up token cost as the project grows.

## Decisions (locked)

- **General framework**, not a one-off fix — covers both current pass-types and is reusable for future recurring content passes.
- **Orchestration:** the main conversation acts as a coordinator and dispatches a **fresh, non-fork subagent per domain file**. Fresh agents inherit no conversation history (cheapest option — no inherited-context cache-read cost, unlike forks), at the cost of needing a fully self-contained dispatch prompt each time. The coordinator's own context grows only by a short dispatch prompt + summary per file, so it stays flat regardless of how many domains are processed in one sitting.
- **Skill structure:** one skill, `content-pass`, with two modes (`expandable-detail`, `content-deepening`), rather than two independent skills — avoids duplicating/desyncing the shared schema and workflow steps.
- **Progress tracking:** derived from repo state, not a separate tracking file or conversation memory.
  - Expandable-detail: pending files = `grep -L "detail:" <topic files>` (already valid today).
  - Content-deepening: no existing structural signal, so this pass introduces a one-line completion marker comment near the top of each deepened file (e.g. `// content-pass: deepened`), checkable via `grep -L`.
- **Sequential dispatch, one file at a time** — domain files can share adjacent index/graph files (e.g. `classes/index.ts`), so parallel subagent writes risk conflicting edits; sequential also keeps per-run cost predictable.

## Components

### 1. `.claude/skills/content-pass/SKILL.md`

Kept lean — loaded on every invocation regardless of mode. Contains:
- Frontmatter with a description covering both trigger phrasings ("retrofit expandable detail", "deepen content", "next domain pass").
- **Determine what's next:** the grep recipes for each mode's pending-file list (see Decisions above).
- **Dispatch:** the exact prompt template used to hand a fresh subagent its task (see below).
- **Verification:** `npm test`, `npm run build`, the existing commit-message conventions (`Retrofit <domain> with expandable detail` / `content: deepen <domain> domain`), and the completion-marker convention for content-deepening.
- No embedded exemplars in this file — those live in the mode-specific references so a run only pays to load the one it needs.

### 2. `references/expandable-detail.md`

- Rule: every `KeyPoint` object and every `pitfall`/`bestPractice`/`note` block should carry a `detail` field unless the base text is already fully self-contained.
- Voice bar: `detail` expands *why*, not *what*. One embedded before/after `KeyPoint` exemplar and one embedded callout exemplar (short, verbatim) to calibrate density without reading a live file for comparison.
- Explicit non-goals: no new blocks, no rewording existing `keyPoints`/text, no new topics or classes — this pass only adds `detail`.

### 3. `references/content-deepening.md`

- Generalized version of the `collections` pilot's "Approach A" (from `docs/superpowers/specs/2026-07-08-collections-content-deepening-design.md`): bridging prose where a concept is asserted without grounding, background `note` blocks, at least one worked `code` example per topic, `keyPoints` grown to 5–7, method lists grown per class (workhorses ~15–25 methods, utility classes exhaustive), `example`/`pitfalls` filled where thin.
- One embedded topic-block exemplar and one embedded `jc({...})` class exemplar (trimmed from the collections plan's `sets`/`Arrays` examples) to lock the quality bar.
- Unlike expandable-detail, this pass requires judgment (deciding *what's* missing per file) rather than a pre-written per-domain task list — the dispatched subagent performs its own gap analysis against the rubric.

### 4. Orchestration flow

For each pending file:
1. Coordinator runs a cheap `grep`/`ls` (no file bodies read) to confirm the file is still pending for the target mode.
2. Coordinator dispatches one fresh, non-fork subagent with this prompt shape:
   ```
   Use the content-pass skill, mode: <expandable-detail|content-deepening>, on <file path>.
   Read the file, apply the mode's pattern per the skill's rubric, run npm test && npm run build,
   commit as "<convention>", then report: files changed, test/build result, commit hash.
   ```
3. Subagent invokes the `content-pass` skill itself (loading only the relevant mode reference), reads the target file, applies the pattern, verifies, commits, and returns a short summary.
4. Coordinator waits for that result before dispatching the next file — no parallel dispatch.

## Error handling

- If `npm test` or `npm run build` fails inside the subagent, it fixes and re-verifies within its own context rather than bouncing back to the coordinator immediately.
- The subagent only returns early with a "blocked" summary if genuinely stuck (e.g. a schema ambiguity it can't resolve) — the coordinator then decides whether to intervene directly or adjust the reference doc.
- No commit happens on a failing verification — matches the existing convention (every commit in git history corresponds to one clean, verified domain pass).

## Testing / validation

- The skill's own correctness is validated by its first real run: dispatch it on the next pending expandable-detail file. If the resulting diff doesn't match the quality bar, fix the reference doc (not just the individual file) so the correction compounds across all future runs.
- No changes to `src/data/integrity.test.ts` or any other test infrastructure — verification continues to rely on the existing `npm test` / `npm run build` gates.

## Out of scope

- Any change to `src/types/content.ts` or other schema/component files.
- Building a custom subagent type (`.claude/agents/*.md`) — fresh dispatches use the existing general-purpose agent path with a self-contained prompt. Can be revisited later if prompt-writing overhead becomes a real cost.
- Parallelizing dispatch across multiple files at once.
- Retroactively adding the content-deepening marker to `collections` in this pass (can be done as a trivial follow-up, or the first time content-deepening tooling runs).

## Success criteria

- A domain file can be retrofitted or deepened by dispatching a single fresh subagent with a short, self-contained prompt — no need for the coordinator to read the target file itself.
- The coordinator's own conversation context stays roughly flat across an arbitrary number of domain files processed in one sitting.
- Quality bar (voice, density, format) stays indistinguishable from the best existing entries, calibrated via the embedded exemplars rather than by reading other live files each run.
- `npm test` and `npm run build` stay green after every dispatched pass, matching the existing per-commit verification discipline.
