# Dialect-Aware Code Blocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add backward-compatible multi-language highlighting, selectable code variants, and clickable typed sources so the database compendium can present PostgreSQL-first SQL dialect comparisons.

**Architecture:** Extend the shared content types with a single-source/variant code-block union and optional source metadata. Replace the Java-only tokenizer entry point with a Prism-backed language registry that returns the existing safe token shape. Keep interaction inside `CodeBlock`; `TopicView`, class details, and callouts remain thin consumers.

**Tech Stack:** React 19, TypeScript 6, Vite 8, PrismJS core with selected grammars, Vitest, React Testing Library, SSR/prerendering.

## Global Constraints

- Existing code blocks with `{ kind: 'code', code: string }` remain valid and default to Java.
- Supported languages are exactly `java`, `javascript`, `typescript`, `sql`, `bash`, `json`, `markup`, and `text`.
- Runtime highlighting never uses `dangerouslySetInnerHTML`.
- Unsupported runtime language values degrade to escaped plain text.
- Variant selection is local to each block and is not stored globally.
- The first variant is the deterministic SSR and hydration default.
- Clipboard failure is nonfatal and must not display `Copied`.
- Install only Prism core plus the seven required grammars; do not bundle all Prism languages.
- Match repository style: no semicolons, single quotes, two-space indentation.
- Stage only files named by each task; preserve the unrelated untracked `.agents/` directory.
- Every task ends with focused tests and a scoped commit.

---

### Task 1: Add typed, linked source metadata

**Files:**
- Modify: `src/types/content.ts`
- Modify: `src/components/TopicView.tsx`
- Modify: `src/components/TopicView.css`
- Modify: `src/components/TopicView.test.tsx`

**Interfaces:**
- Produces: `SourceKind = 'book' | 'paper' | 'documentation' | 'course' | 'standard'`.
- Produces: optional `Book.kind`, `Book.year`, and `Book.url` fields.
- Preserves: every existing `Book` object and `BookRef` without migration.

- [ ] **Step 1: Add a failing source-link rendering test**

In `src/components/TopicView.test.tsx`, add a provider fixture source with:

```tsx
{
  key: 'codd',
  title: 'A Relational Model of Data for Large Shared Data Banks',
  authors: 'E.F. Codd',
  kind: 'paper',
  year: 1970,
  url: 'https://research.ibm.com/publications/a-relational-model-of-data-for-large-shared-data-banks',
}
```

Add a topic reference `{ book: 'codd', chapter: 'Sections 1–2' }`, then assert:

```tsx
const source = screen.getByRole('link', { name: /A Relational Model of Data/i })
expect(source).toHaveAttribute('href', expect.stringContaining('research.ibm.com'))
expect(source).toHaveAttribute('target', '_blank')
expect(source).toHaveAttribute('rel', 'noopener noreferrer')
expect(screen.getByText(/paper · 1970/i)).toBeInTheDocument()
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npx vitest run src/components/TopicView.test.tsx`

Expected: FAIL because source titles are not links and metadata is not rendered.

- [ ] **Step 3: Extend `Book` in `src/types/content.ts`**

Add above `Book`:

```ts
export type SourceKind = 'book' | 'paper' | 'documentation' | 'course' | 'standard'
```

Replace `Book` with:

```ts
export interface Book {
  key: string
  title: string
  authors: string
  kind?: SourceKind
  year?: number
  url?: string
}
```

- [ ] **Step 4: Render optional metadata and links in `TopicView.tsx`**

Extract a local `SourceTitle` component:

```tsx
function SourceTitle({ title, url }: { title: string; url?: string }) {
  if (!url) return <cite>{title}</cite>
  return (
    <cite>
      <a href={url} target="_blank" rel="noopener noreferrer">{title}</a>
    </cite>
  )
}
```

Within the source list item, render:

```tsx
<SourceTitle title={book?.title ?? r.book} url={book?.url} />
{(book?.kind || book?.year) && (
  <span className="topic-ref-meta">
    {[book.kind, book.year].filter(Boolean).join(' · ')}
  </span>
)}
{' — '}{r.chapter}
```

- [ ] **Step 5: Style source links and metadata**

Add to `src/components/TopicView.css` near existing `.topic-refs` rules:

```css
.topic-refs a {
  color: inherit;
  text-decoration-color: color-mix(in srgb, currentColor 35%, transparent);
  text-underline-offset: 0.15em;
}

.topic-refs a:hover {
  color: var(--domain);
}

.topic-ref-meta {
  margin-left: 0.4em;
  color: var(--ink-3);
  font-size: var(--fs-xs);
}
```

- [ ] **Step 6: Verify focused and full tests**

Run: `npx vitest run src/components/TopicView.test.tsx src/data/integrity.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/types/content.ts src/components/TopicView.tsx src/components/TopicView.css src/components/TopicView.test.tsx
git commit -m "feat: add linked source metadata"
```

---

### Task 2: Introduce the code-block union and Prism language registry

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/types/content.ts`
- Create: `src/lib/highlightCode.ts`
- Create: `src/lib/highlightCode.test.ts`
- Modify: `src/lib/highlightJava.ts`
- Modify: `src/lib/highlightJava.test.ts`

**Interfaces:**
- Produces: `CodeLanguage`, `CodeVariant`, and `CodeContentBlock` from `src/types/content.ts`.
- Produces: `highlightCode(code: string, language: CodeLanguage | string): Token[]`.
- Preserves: `highlightJava(code: string): Token[]` as a wrapper.

- [ ] **Step 1: Install the scoped syntax-highlighting dependency**

Run: `npm install prismjs && npm install --save-dev @types/prismjs`

Expected: `package.json` adds `prismjs`; dev dependencies add `@types/prismjs`; lockfile updates cleanly.

- [ ] **Step 2: Write failing generic-highlighter tests**

Create `src/lib/highlightCode.test.ts`:

```ts
import { highlightCode, type Token } from './highlightCode'

const joined = (tokens: Token[]) => tokens.map((token) => token.text).join('')

test.each([
  ['java', 'public record User(long id) {}'],
  ['javascript', 'const answer = 42'],
  ['typescript', 'type Id = string | number'],
  ['sql', 'SELECT id FROM users WHERE active = TRUE;'],
  ['bash', 'psql --dbname app'],
  ['json', '{"active": true}'],
  ['markup', '<table><tr></tr></table>'],
  ['text', 'literal <>& text'],
])('round-trips %s source', (language, code) => {
  expect(joined(highlightCode(code, language))).toBe(code)
})

test('marks SQL keywords', () => {
  expect(highlightCode('SELECT id FROM users', 'sql').filter((t) => t.type === 'kw').map((t) => t.text.toUpperCase()))
    .toEqual(['SELECT', 'FROM'])
})

test('unknown languages fall back to plain text', () => {
  expect(highlightCode('<unsafe>', 'unknown')).toEqual([{ text: '<unsafe>', type: 'plain' }])
})
```

- [ ] **Step 3: Run the new test and verify failure**

Run: `npx vitest run src/lib/highlightCode.test.ts`

Expected: FAIL because `highlightCode.ts` does not exist.

- [ ] **Step 4: Add code types to `src/types/content.ts`**

Add:

```ts
export type CodeLanguage = 'java' | 'javascript' | 'typescript' | 'sql' | 'bash' | 'json' | 'markup' | 'text'

export interface CodeVariant {
  id: string
  label: string
  language: CodeLanguage
  code: string
}

export type CodeContentBlock =
  | { kind: 'code'; code: string; language?: CodeLanguage; variants?: never; title?: string; caption?: string }
  | { kind: 'code'; code?: never; language?: never; variants: CodeVariant[]; title?: string; caption?: string }
```

Replace the current code member in `ContentBlock` with `CodeContentBlock`:

```ts
export type ContentBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'subheading'; text: string }
  | CodeContentBlock
  // retain the existing callout/table/diagram members unchanged
```

- [ ] **Step 5: Implement `src/lib/highlightCode.ts`**

Import Prism core and only required grammars:

```ts
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import type { CodeLanguage } from '../types/content'

export interface Token {
  text: string
  type: 'kw' | 'type' | 'str' | 'num' | 'comment' | 'ann' | 'plain'
}
```

Use a `Record<CodeLanguage, string | null>` grammar map. Recursively flatten Prism strings/tokens into the safe `Token[]` shape. Map Prism token types `keyword`, `class-name`, `string`, `number`, `comment`, and `annotation` to the existing CSS categories; treat other token types as `plain`. Merge adjacent tokens of the same type. Return one plain token for `text`, unknown languages, or missing grammars.

- [ ] **Step 6: Convert `highlightJava.ts` to a compatibility wrapper**

Replace its implementation with:

```ts
export { type Token } from './highlightCode'
import { highlightCode } from './highlightCode'

export function highlightJava(code: string) {
  return highlightCode(code, 'java')
}
```

- [ ] **Step 7: Run highlighter tests**

Run: `npx vitest run src/lib/highlightCode.test.ts src/lib/highlightJava.test.ts`

Expected: PASS. If Prism categorizes a Java construct differently from the old tokenizer, adjust only the Prism-to-project category mapping; do not weaken the exact round-trip assertion.

- [ ] **Step 8: Run typecheck through the production build**

Run: `npm run build`

Expected: PASS; existing code content remains assignable.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/types/content.ts src/lib/highlightCode.ts src/lib/highlightCode.test.ts src/lib/highlightJava.ts src/lib/highlightJava.test.ts
git commit -m "feat: add multi-language code highlighting"
```

---

### Task 3: Add accessible code variants to `CodeBlock`

**Files:**
- Modify: `src/components/CodeBlock.tsx`
- Modify: `src/components/CodeBlock.css`
- Modify: `src/components/CodeBlock.test.tsx`

**Interfaces:**
- Consumes: `CodeLanguage`, `CodeVariant`, and `highlightCode` from Task 2.
- Produces: `CodeBlock` props accepting either `code`/`language` or `variants`.

- [ ] **Step 1: Add failing interaction tests**

Extend `CodeBlock.test.tsx` with:

```tsx
const sqlVariants = [
  { id: 'postgresql', label: 'PostgreSQL', language: 'sql' as const, code: 'INSERT INTO users(name) VALUES ($1) RETURNING id;' },
  { id: 'mysql', label: 'MySQL', language: 'sql' as const, code: 'INSERT INTO users(name) VALUES (?);' },
]

test('renders PostgreSQL as the initial selected variant', () => {
  render(<CodeBlock variants={sqlVariants} title="Generated keys" />)
  expect(screen.getByRole('tab', { name: 'PostgreSQL' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByText(/RETURNING id/)).toBeInTheDocument()
})

test('switches variants with click and copies active code', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<CodeBlock variants={sqlVariants} />)
  fireEvent.click(screen.getByRole('tab', { name: 'MySQL' }))
  fireEvent.click(screen.getByRole('button', { name: /copy/i }))
  expect(writeText).toHaveBeenCalledWith(sqlVariants[1].code)
})

test('moves selection with arrow keys', () => {
  render(<CodeBlock variants={sqlVariants} />)
  fireEvent.keyDown(screen.getByRole('tab', { name: 'PostgreSQL' }), { key: 'ArrowRight' })
  expect(screen.getByRole('tab', { name: 'MySQL' })).toHaveAttribute('aria-selected', 'true')
})

test('clipboard rejection does not show copied feedback', async () => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
  render(<CodeBlock code="SELECT 1" language="sql" />)
  fireEvent.click(screen.getByRole('button', { name: /copy/i }))
  expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npx vitest run src/components/CodeBlock.test.tsx`

Expected: FAIL because `variants` and `language` props do not exist.

- [ ] **Step 3: Implement the prop union and active source selection**

Use:

```ts
type Props =
  | { code: string; language?: CodeLanguage; variants?: never; title?: string; caption?: string }
  | { code?: never; language?: never; variants: CodeVariant[]; title?: string; caption?: string }
```

Normalize single code to one internal source and variant code to the supplied list. Initialize state to index `0`; clamp/reset to `0` in an effect when the variant identity changes. Highlight and copy the active source.

- [ ] **Step 4: Implement accessible tabs**

For two or more variants, render a `role="tablist"` containing buttons with stable `id`, `aria-controls`, `aria-selected`, and `tabIndex`. Render one `role="tabpanel"` with `aria-labelledby`. Handle `ArrowLeft`, `ArrowRight`, `Home`, and `End`, wrapping at boundaries and moving DOM focus to the newly active tab.

- [ ] **Step 5: Preserve single-source labels**

For one source, render `title ?? languageLabel(active.language)`. Maintain the existing default label `Java` when no language is supplied.

- [ ] **Step 6: Add responsive tab CSS**

Split the header into title, scrollable tabs, and copy action. Add visible selected, hover, and focus-visible states. Ensure `.codeblock-tabs` has `overflow-x: auto`, tabs use `flex: 0 0 auto`, and the copy button never shrinks.

- [ ] **Step 7: Run focused tests**

Run: `npx vitest run src/components/CodeBlock.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/CodeBlock.tsx src/components/CodeBlock.css src/components/CodeBlock.test.tsx
git commit -m "feat: add selectable code variants"
```

---

### Task 4: Connect variant blocks to topics and validate their shape

**Files:**
- Modify: `src/components/TopicView.tsx`
- Modify: `src/components/TopicView.test.tsx`
- Modify: `src/data/integrity.test.ts`
- Modify: `src/entry-server.test.tsx`

**Interfaces:**
- Consumes: `CodeContentBlock` and the new `CodeBlock` prop union.
- Produces: repository-wide integrity rules for code blocks.

- [ ] **Step 1: Add a failing topic rendering test**

Add a topic block with PostgreSQL and MySQL variants to `TopicView.test.tsx`, render it, select MySQL, and assert its SQL becomes visible while PostgreSQL SQL is no longer in the active panel.

- [ ] **Step 2: Add failing integrity fixtures**

Factor code validation into an exported pure helper in `src/data/integrity.test.ts` or a new colocated `src/data/validateCodeBlock.ts` if direct unit testing is clearer. Cover:

```ts
expect(validateCodeBlock({ kind: 'code', variants: [] })).toContain('at least one variant')
expect(validateCodeBlock({ kind: 'code', variants: [pg, { ...pg }] })).toContain('duplicate variant id')
expect(validateCodeBlock({ kind: 'code', variants: [mysql, pg] })).toContain('PostgreSQL must be first')
```

Define approved SQL labels as `PostgreSQL`, `MySQL`, `SQLite`, `SQL Server`, and `Oracle`.

- [ ] **Step 3: Run focused tests and verify failure**

Run: `npx vitest run src/components/TopicView.test.tsx src/data/integrity.test.ts`

Expected: FAIL at variant rendering/validation.

- [ ] **Step 4: Pass the block union through `TopicView`**

Replace the code case with an explicit branch:

```tsx
case 'code':
  return block.variants
    ? <CodeBlock variants={block.variants} title={block.title} caption={block.caption} />
    : <CodeBlock code={block.code} language={block.language} title={block.title} caption={block.caption} />
```

- [ ] **Step 5: Implement repository-wide code validation**

For every loaded topic block of kind `code`, assert:

- Single-source code is nonempty.
- Variant arrays are nonempty.
- Every variant has a nonempty ID, label, language, and code.
- IDs are unique within the block.
- Languages belong to the approved set.
- When two or more variant labels belong to the SQL-dialect set, the first label is `PostgreSQL` and every dialect label is approved.

- [ ] **Step 6: Add SSR determinism coverage**

In `entry-server.test.tsx`, render a topic fixture containing variants and assert the HTML includes PostgreSQL code and `aria-selected="true"` on PostgreSQL, but does not render MySQL as selected.

- [ ] **Step 7: Run focused tests**

Run: `npx vitest run src/components/TopicView.test.tsx src/components/CodeBlock.test.tsx src/data/integrity.test.ts src/entry-server.test.tsx`

Expected: PASS.

- [ ] **Step 8: Run all verification**

Run: `npm test`

Expected: all test files pass.

Run: `npm run lint`

Expected: exit code 0.

Run: `npm run build`

Expected: client build, SSR build, OG generation, prerendering, and sitemap generation all succeed with no hydration errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/TopicView.tsx src/components/TopicView.test.tsx src/data/integrity.test.ts src/entry-server.test.tsx
git commit -m "feat: integrate dialect-aware topic examples"
```
