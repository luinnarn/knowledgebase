import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "eslint-and-typescript-eslint",
    domainId: "testing-quality",
    title: "ESLint & typescript-eslint",
    summary: "ESLint catches code-quality and correctness issues through configurable rules. typescript-eslint lets ESLint parse TypeScript and run TypeScript-aware rules that use compiler type information.",
    keyPoints: [
      {
        text: "Linting is automated code review for repeatable concerns",
        detail: "Humans should focus on design, behavior, and trade-offs. Linters are better at checking repetitive style and safety rules consistently."
      },
      {
        text: "Typed rules are more powerful and more expensive",
        detail: "Rules that use TypeScript type information can catch floating promises, unsafe `any`, incorrect async usage, and impossible checks, but they require project-aware setup."
      },
      {
        text: "Rule severity should reflect real risk",
        detail: "A warning everyone ignores is not a control. An error nobody can fix is a productivity tax."
      },
      {
        text: "Flat config is the modern ESLint configuration direction",
        detail: "Many projects now configure ESLint through `eslint.config.*`, composing plugin configs directly."
      },
      {
        text: "Linting should support project style, not become the project",
        detail: "A good config prevents known bugs and keeps code consistent without turning every PR into rule-lawyering."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Typed linting shape",
        code: "export default [\n  {\n    files: [\"**/*.ts\", \"**/*.tsx\"],\n    languageOptions: {\n      parserOptions: {\n        projectService: true,\n      },\n    },\n    rules: {\n      \"@typescript-eslint/no-floating-promises\": \"error\",\n      \"@typescript-eslint/no-explicit-any\": \"warn\",\n    },\n  },\n]",
        caption: "Typed linting can catch issues the TypeScript compiler alone may not report."
      },
      {
        kind: "table",
        caption: "Lint rule categories",
        headers: [
          "Category",
          "Example"
        ],
        rows: [
          [
            "Correctness",
            "no-floating-promises"
          ],
          [
            "Safety",
            "no-explicit-any / no-unsafe-assignment"
          ],
          [
            "Maintainability",
            "no-unused-vars, complexity"
          ],
          [
            "Style consistency",
            "naming conventions"
          ],
          [
            "Framework rules",
            "React hooks, testing-library rules"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Strict config as migration grenade",
        text: "Dropping a maximal ruleset onto an existing codebase can create hundreds of warnings nobody owns.",
        detail: "Introduce high-value rules first, fix in small batches, and prevent new violations before backfilling every old one."
      },
      {
        kind: "bestPractice",
        title: "Make lint actionable",
        text: "Every enabled rule should either prevent a real class of bug, improve readability, or support a team convention. Otherwise, delete it with ceremony and snacks."
      }
    ],
    refs: [
      {
        book: "eslint-docs",
        chapter: "ESLint configuration and rules"
      },
      {
        book: "typescript-eslint-docs",
        chapter: "Typed linting"
      },
      {
        book: "ts-handbook",
        chapter: "TypeScript tooling"
      }
    ],
    related: [
      "tsconfig-strictness",
      "type-safe-api-boundaries",
      "package-managers-lockfiles-and-scripts"
    ]
  },
  {
    id: "prettier-and-formatting",
    domainId: "testing-quality",
    title: "Prettier & Formatting",
    summary: "Prettier parses source code and reprints it in a consistent style. Its main value is not that the style is perfect; it is that formatting stops being a human argument.",
    keyPoints: [
      {
        text: "Prettier is intentionally opinionated",
        detail: "It reduces configuration choices so teams can stop bikeshedding whitespace and line wrapping."
      },
      {
        text: "Formatter and linter have different jobs",
        detail: "Prettier handles layout. ESLint handles code issues and conventions. Mixing those responsibilities creates conflict."
      },
      {
        text: "Format checks belong in CI",
        detail: "CI should fail when code is not formatted, but local tooling should make formatting automatic before it gets there."
      },
      {
        text: "Formatting is not code quality",
        detail: "Beautifully formatted code can still be wrong, unsafe, slow, or impossible to maintain."
      },
      {
        text: "Generated files may need exclusions",
        detail: "Lockfiles, generated clients, snapshots, large JSON, or vendored code may need project-specific ignore rules."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Formatting scripts",
        code: "{\n  \"scripts\": {\n    \"format\": \"prettier --write .\",\n    \"format:check\": \"prettier --check .\"\n  }\n}",
        caption: "One command to fix, one command for CI."
      },
      {
        kind: "table",
        caption: "Tool responsibilities",
        headers: [
          "Tool",
          "Primary job",
          "Avoid"
        ],
        rows: [
          [
            "Prettier",
            "Formatting/layout",
            "Semantic code rules"
          ],
          [
            "ESLint",
            "Code quality and correctness rules",
            "Competing formatting rules"
          ],
          [
            "TypeScript",
            "Static type checking",
            "Style enforcement"
          ],
          [
            "Editor integration",
            "Format on save",
            "Different team behavior per machine"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Formatting rules in two places",
        text: "If Prettier and ESLint both try to control formatting, developers get conflicting fixes and noisy diffs.",
        detail: "Let Prettier own formatting. Let ESLint own code issues."
      },
      {
        kind: "bestPractice",
        title: "Automate formatting before review",
        text: "Use format-on-save, pre-commit hooks where appropriate, and CI checks. Review comments about whitespace are a tax on civilization."
      }
    ],
    refs: [
      {
        book: "prettier-docs",
        chapter: "Prettier documentation"
      },
      {
        book: "eslint-docs",
        chapter: "Formatting and rules"
      },
      {
        book: "typescript-eslint-docs",
        chapter: "Formatting guidance"
      }
    ],
    related: [
      "eslint-and-typescript-eslint",
      "package-managers-lockfiles-and-scripts",
      "vite-and-dev-build-tooling"
    ]
  },
  {
    id: "vitest-unit-tests",
    domainId: "testing-quality",
    title: "Vitest Unit Tests",
    summary: "Vitest is a Vite-native test runner for JavaScript and TypeScript projects, supporting fast unit tests, mocks, fake timers, coverage, browser mode, and familiar Jest-like APIs.",
    keyPoints: [
      {
        text: "Unit tests should verify behavior, not implementation trivia",
        detail: "A good unit test fails when observable behavior breaks, not every time the internal function order changes."
      },
      {
        text: "Fast tests shape developer behavior",
        detail: "If tests run quickly, people run them often. If tests are slow and flaky, people negotiate with them like goblins."
      },
      {
        text: "Vitest fits Vite projects naturally",
        detail: "It shares much of the Vite transform and module pipeline, which is convenient for TS and modern frontend projects."
      },
      {
        text: "Coverage is a signal, not a goal",
        detail: "Coverage tells you which lines ran. It does not tell you whether the assertions prove meaningful behavior."
      },
      {
        text: "Test boundaries should be chosen deliberately",
        detail: "Pure functions, parsers, validators, reducers, services, and API wrappers are excellent unit-test candidates."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Simple behavior test",
        code: "import { describe, expect, it } from \"vitest\"\nimport { parseUserId } from \"./user-id\"\n\ndescribe(\"parseUserId\", () => {\n  it(\"accepts valid user ids\", () => {\n    expect(parseUserId(\"user_123\")).toBe(\"user_123\")\n  })\n\n  it(\"rejects invalid ids\", () => {\n    expect(() => parseUserId(\"product_123\")).toThrow(\"Invalid\")\n  })\n})",
        caption: "One happy path, one failure path, both tied to observable behavior."
      },
      {
        kind: "table",
        caption: "Good unit-test targets",
        headers: [
          "Target",
          "Why"
        ],
        rows: [
          [
            "Pure functions",
            "Deterministic and fast"
          ],
          [
            "Parsers/validators",
            "Boundary safety"
          ],
          [
            "Reducers/state machines",
            "Many state transitions"
          ],
          [
            "API wrappers",
            "Error/status handling"
          ],
          [
            "Formatting/mapping logic",
            "Easy regressions"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Snapshot as personality replacement",
        text: "Snapshots are useful for stable structured output, but giant snapshots often hide the important assertion inside a haystack.",
        detail: "Prefer explicit assertions for behavior you care about."
      },
      {
        kind: "bestPractice",
        title: "Test the contract",
        text: "Write tests against the public behavior of the unit. Avoid asserting private helper calls unless interaction itself is the contract."
      }
    ],
    refs: [
      {
        book: "vitest-docs",
        chapter: "Vitest guide"
      },
      {
        book: "vite-docs",
        chapter: "Vite integration"
      },
      {
        book: "node-docs",
        chapter: "Testing"
      }
    ],
    related: [
      "mocking-and-test-doubles",
      "async-testing",
      "type-safe-api-boundaries"
    ]
  },
  {
    id: "mocking-and-test-doubles",
    domainId: "testing-quality",
    title: "Mocking & Test Doubles",
    summary: "Mocks, stubs, fakes, spies, and fixtures replace real collaborators so tests can control inputs, isolate behavior, avoid slow dependencies, and observe important interactions.",
    keyPoints: [
      {
        text: "A stub returns controlled data",
        detail: "Use stubs when the dependency's behavior is not under test and you need predictable responses."
      },
      {
        text: "A fake has working simplified behavior",
        detail: "An in-memory repository is often better than a pile of mocks because it behaves like a small real system."
      },
      {
        text: "A spy records interactions",
        detail: "Use spies when the interaction is part of the contract: an event emitted, callback called, repository save requested."
      },
      {
        text: "A mock encodes expectations",
        detail: "Mocks are useful, but overusing them ties tests to implementation details."
      },
      {
        text: "Mock at system boundaries, not every function call",
        detail: "Network, time, randomness, storage, filesystem, and third-party APIs are good mock points. Internal helper calls usually are not."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Test doubles",
        headers: [
          "Double",
          "Purpose",
          "Example"
        ],
        rows: [
          [
            "Stub",
            "Return predefined value",
            "fake API response"
          ],
          [
            "Fake",
            "Simplified working implementation",
            "in-memory repo"
          ],
          [
            "Spy",
            "Record calls",
            "was callback called?"
          ],
          [
            "Mock",
            "Pre-programmed expectation",
            "must call save once"
          ],
          [
            "Fixture",
            "Reusable test data",
            "sample user object"
          ]
        ]
      },
      {
        kind: "code",
        title: "Fake repository",
        code: "function createFakeUserRepo() {\n  const users = new Map()\n  return {\n    async save(user) {\n      users.set(user.id, user)\n    },\n    async findById(id) {\n      return users.get(id) ?? null\n    },\n  }\n}",
        caption: "A fake can support several tests without making every interaction brittle."
      },
      {
        kind: "pitfall",
        title: "Mocking the implementation, not the dependency",
        text: "If a test fails because you renamed a private helper but behavior is unchanged, the test is probably too coupled.",
        detail: "Mocks should protect boundaries. They should not fossilize implementation."
      },
      {
        kind: "bestPractice",
        title: "Prefer fakes for domain dependencies",
        text: "For repositories, queues, and service ports, a small fake often gives better tests than a mock because it lets the code behave normally."
      }
    ],
    refs: [
      {
        book: "vitest-docs",
        chapter: "Mocking"
      },
      {
        book: "node-docs",
        chapter: "Mocking in tests"
      },
      {
        book: "eslint-docs",
        chapter: "Testing integrations"
      }
    ],
    related: [
      "vitest-unit-tests",
      "async-testing",
      "type-safe-api-boundaries"
    ]
  },
  {
    id: "async-testing",
    domainId: "testing-quality",
    title: "Testing Async Code",
    summary: "Async tests must wait for the work they assert on. Promise returns, async functions, fake timers, microtasks, cancellation, and unhandled rejections all affect test reliability.",
    keyPoints: [
      {
        text: "Return or await the async work",
        detail: "If the test function finishes before the Promise settles, assertions may run too early or failures may escape the test."
      },
      {
        text: "Rejection paths need explicit assertions",
        detail: "Use rejection matchers or try/catch with assertions to prove failures happen as expected."
      },
      {
        text: "Fake timers control scheduled work",
        detail: "Debounce, throttle, retry, timeout, and polling logic should be tested without real sleeping."
      },
      {
        text: "Microtasks and timers are different queues",
        detail: "Advancing timers may not automatically flush every Promise callback depending on the framework and setup."
      },
      {
        text: "Unhandled rejections should fail tests",
        detail: "A test suite that ignores unhandled rejections is letting async bugs leak through the floorboards."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Async success and failure",
        code: "it(\"loads user\", async () => {\n  await expect(loadUser(\"u1\")).resolves.toMatchObject({ id: \"u1\" })\n})\n\nit(\"rejects invalid id\", async () => {\n  await expect(loadUser(\"\")).rejects.toThrow(\"Invalid\")\n})",
        caption: "The test awaits both success and failure assertions."
      },
      {
        kind: "code",
        title: "Fake timers for debounce",
        code: "import { afterEach, expect, it, vi } from \"vitest\"\n\nafterEach(() => vi.useRealTimers())\n\nit(\"debounces search\", () => {\n  vi.useFakeTimers()\n  const fn = vi.fn()\n  const search = debounce(fn, 300)\n\n  search(\"a\")\n  search(\"ab\")\n  vi.advanceTimersByTime(299)\n  expect(fn).not.toHaveBeenCalled()\n\n  vi.advanceTimersByTime(1)\n  expect(fn).toHaveBeenCalledWith(\"ab\")\n})",
        caption: "The test controls time instead of waiting 300 real milliseconds."
      },
      {
        kind: "pitfall",
        title: "Floating Promise in a test",
        text: "Calling an async function without awaiting it can make the test pass before the function fails.",
        detail: "Typed linting can catch this; so can a healthy fear of green tests that finish too quickly."
      },
      {
        kind: "bestPractice",
        title: "Make time and async boundaries explicit",
        text: "Use fake timers for scheduled work, await all promises, assert rejection paths, and avoid hidden async callbacks in test helpers."
      }
    ],
    refs: [
      {
        book: "vitest-docs",
        chapter: "Testing async code"
      },
      {
        book: "node-docs",
        chapter: "Testing and timers"
      },
      {
        book: "mdn-js",
        chapter: "Promises and async functions"
      }
    ],
    related: [
      "promises-and-error-handling",
      "timers-scheduling-and-debouncing",
      "vitest-unit-tests"
    ]
  },
  {
    id: "type-safe-api-boundaries",
    domainId: "testing-quality",
    title: "Type-Safe API Boundaries",
    summary: "TypeScript is strongest inside your codebase. Boundaries such as JSON, forms, URL params, localStorage, environment variables, and third-party libraries are unknown runtime data until validated.",
    keyPoints: [
      {
        text: "Boundary data should start as `unknown`",
        detail: "A network response is not a `User` because your client expects one. It becomes a User after validation."
      },
      {
        text: "Validation should happen once at the edge",
        detail: "Convert unsafe external data into trusted internal types at a boundary, then keep the rest of the codebase precise."
      },
      {
        text: "Wrappers contain unsafe interop",
        detail: "A typed wrapper around an untyped or loosely typed library prevents `any` from spreading through the app."
      },
      {
        text: "Boundary tests are high value",
        detail: "Test missing fields, wrong types, invalid strings, empty arrays, unexpected enum values, and malformed payloads."
      },
      {
        text: "Types and schemas can drift",
        detail: "If you define TypeScript types and runtime validators separately, keep them tested or generated from a shared source."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Safe boundary flow",
        code: "flowchart LR\n  External[External data] --> Unknown[unknown]\n  Unknown --> Validate[Runtime validation]\n  Validate -->|valid| Domain[Trusted domain type]\n  Validate -->|invalid| Error[Boundary error]\n  Domain --> App[Internal app code]\n",
        caption: "The unsafe value crosses the boundary once."
      },
      {
        kind: "code",
        title: "Unknown JSON boundary",
        code: "async function getJson(url: string): Promise<unknown> {\n  const res = await fetch(url)\n  if (!res.ok) throw new Error(`HTTP ${res.status}`)\n  return res.json()\n}\n\nconst raw = await getJson(\"/api/user/u1\")\nconst user = parseUser(raw)\n// user is now trusted User inside the app.",
        caption: "Avoid returning `Promise<User>` directly from unvalidated JSON parsing."
      },
      {
        kind: "table",
        caption: "Boundary protections",
        headers: [
          "Boundary",
          "Risk",
          "Protection"
        ],
        rows: [
          [
            "HTTP JSON",
            "Shape changed or invalid",
            "Schema/parser"
          ],
          [
            "Form input",
            "Strings and missing fields",
            "Field validation"
          ],
          [
            "URL params",
            "Everything is string",
            "Parse + validate"
          ],
          [
            "localStorage",
            "Stale/manual data",
            "Parser + fallback"
          ],
          [
            "env vars",
            "Missing/malformed config",
            "Startup validation"
          ],
          [
            "Untyped dependency",
            "`any` spread",
            "Small typed wrapper"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "`as ApiResponse` after `response.json()`",
        text: "That assertion only silences the compiler. It does not prove the server sent what the client expects.",
        detail: "This is probably the most common TypeScript boundary lie."
      },
      {
        kind: "bestPractice",
        title: "Keep unsafe code quarantined",
        text: "Any `unknown`, `any`, type assertion, or untyped package interop should live in a small boundary module with tests."
      }
    ],
    refs: [
      {
        book: "effective-typescript",
        chapter: "Type-safe boundaries"
      },
      {
        book: "ts-handbook",
        chapter: "unknown and narrowing"
      },
      {
        book: "vitest-docs",
        chapter: "Testing"
      }
    ],
    related: [
      "typescript-mental-model",
      "type-guards-and-assertion-functions",
      "runtime-validation"
    ]
  },
  {
    id: "runtime-validation",
    domainId: "testing-quality",
    title: "Runtime Validation",
    summary: "Runtime validation checks actual values while the program runs. It complements TypeScript by proving that untrusted input matches the type the rest of the code wants to use.",
    keyPoints: [
      {
        text: "Validation is runtime evidence",
        detail: "It checks actual values from users, APIs, config, files, databases, and third-party packages."
      },
      {
        text: "Parsing is better than checking-and-continuing",
        detail: "A parser should return a trusted value or throw/return an error. That creates a clean transition from unknown to known."
      },
      {
        text: "Validation should report useful errors",
        detail: "A good boundary error says which field failed and why, not just `invalid input`."
      },
      {
        text: "Schemas reduce type drift",
        detail: "Schema libraries can derive TypeScript types from runtime schemas or validate values against a single source of truth."
      },
      {
        text: "Validate as close to the boundary as possible",
        detail: "The deeper unknown data flows, the more code has to defensively handle impossible cases."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Small parser function",
        code: "type User = { id: string; name: string }\n\nfunction parseUser(value: unknown): User {\n  if (typeof value !== \"object\" || value === null) {\n    throw new Error(\"User must be an object\")\n  }\n\n  const candidate = value as { id?: unknown; name?: unknown }\n  if (typeof candidate.id !== \"string\") throw new Error(\"User.id must be string\")\n  if (typeof candidate.name !== \"string\") throw new Error(\"User.name must be string\")\n\n  return { id: candidate.id, name: candidate.name }\n}",
        caption: "Manual parsing is fine for small shapes; schema libraries help as shapes grow."
      },
      {
        kind: "table",
        caption: "Validation results",
        headers: [
          "Style",
          "Shape",
          "Use when"
        ],
        rows: [
          [
            "Throwing parser",
            "returns T or throws",
            "Invalid input is exceptional at this layer"
          ],
          [
            "Result parser",
            "success/error union",
            "Caller should recover or report multiple errors"
          ],
          [
            "Boolean guard",
            "value is T",
            "Simple branching"
          ],
          [
            "Assertion function",
            "asserts value is T",
            "Abort current path on invalid input"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Duplicated type and schema drift",
        text: "If the TypeScript type and runtime validator are maintained separately, one can change without the other.",
        detail: "Use tests, type inference from schemas, generated clients, or strict review around boundary types."
      },
      {
        kind: "bestPractice",
        title: "Parse, don't sprinkle checks",
        text: "Centralize validation in named parser functions. After parsing, the rest of the app should not keep rechecking the same shape."
      }
    ],
    refs: [
      {
        book: "effective-typescript",
        chapter: "Runtime checking"
      },
      {
        book: "ts-handbook",
        chapter: "unknown and narrowing"
      },
      {
        book: "javascript-info",
        chapter: "Error handling"
      }
    ],
    related: [
      "type-safe-api-boundaries",
      "type-guards-and-assertion-functions",
      "branded-and-opaque-types"
    ]
  },
  {
    id: "tsconfig-strictness",
    domainId: "testing-quality",
    title: "tsconfig Strictness",
    summary: "TypeScript strictness options determine how aggressively the compiler rejects unsafe patterns. `strict` is the baseline; additional flags catch indexing, optional-property, override, and unchecked access bugs.",
    keyPoints: [
      {
        text: "`strict` is the serious-project baseline",
        detail: "It enables a family of checks that make TypeScript much more useful, especially around nullability and implicit any."
      },
      {
        text: "`noUncheckedIndexedAccess` makes indexing honest",
        detail: "Array/object index access may produce undefined. This option forces code to handle that possibility."
      },
      {
        text: "`exactOptionalPropertyTypes` tightens optional semantics",
        detail: "It distinguishes an absent property from a property explicitly set to undefined, which often matches API/data modeling better."
      },
      {
        text: "`noImplicitOverride` protects inheritance",
        detail: "A method intended to override a base method must say so, catching typos and base-class changes."
      },
      {
        text: "Strictness migration should be planned",
        detail: "Turning everything on at once in a mature codebase can create a wall of errors. Ratchet gradually and prevent new unsafe code."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Strictness profile",
        code: "{\n  \"compilerOptions\": {\n    \"strict\": true,\n    \"noUncheckedIndexedAccess\": true,\n    \"exactOptionalPropertyTypes\": true,\n    \"noImplicitOverride\": true,\n    \"noFallthroughCasesInSwitch\": true\n  }\n}",
        caption: "These options move common runtime mistakes into compiler feedback."
      },
      {
        kind: "table",
        caption: "Strictness options",
        headers: [
          "Option",
          "Catches"
        ],
        rows: [
          [
            "strict",
            "Core strict checking family"
          ],
          [
            "noUncheckedIndexedAccess",
            "Possibly missing indexed values"
          ],
          [
            "exactOptionalPropertyTypes",
            "Ambiguous optional vs undefined"
          ],
          [
            "noImplicitOverride",
            "Accidental non-overrides"
          ],
          [
            "noFallthroughCasesInSwitch",
            "Unintentional switch fallthrough"
          ],
          [
            "noImplicitReturns",
            "Missing return paths"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Turning strictness off to save time",
        text: "Disabling strictness can feel faster today, but it makes every future refactor less trustworthy.",
        detail: "The bill arrives later, with interest, during the least convenient release."
      },
      {
        kind: "bestPractice",
        title: "Use a ratchet migration",
        text: "Enable strict rules for new code first, fix high-risk areas, track remaining debt, and avoid adding new `any`/assertion escape hatches without review."
      }
    ],
    refs: [
      {
        book: "ts-reference",
        chapter: "TSConfig strictness options"
      },
      {
        book: "effective-typescript",
        chapter: "Compiler configuration"
      },
      {
        book: "typescript-eslint-docs",
        chapter: "Typed linting"
      }
    ],
    related: [
      "typescript-mental-model",
      "tsconfig-and-module-resolution",
      "eslint-and-typescript-eslint"
    ]
  }
]
