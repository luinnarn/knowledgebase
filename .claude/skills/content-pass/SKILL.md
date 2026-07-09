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
