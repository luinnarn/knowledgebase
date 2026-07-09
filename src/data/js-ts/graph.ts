import type { GraphNode, GraphEdge } from '../../types/content'
import { domains } from './domains'

type TopicNodeSpec = [id: string, label: string, importance: 1 | 2 | 3]

const topicNodeSpecs: Record<string, TopicNodeSpec[]> = {
  js-runtime: [
    [
      "values-types-and-primitives",
      "Values, Types & Primitives",
      3
    ],
    [
      "coercion-and-equality",
      "Coercion & Equality",
      3
    ],
    [
      "truthiness-and-control-flow",
      "Truthiness & Control Flow",
      2
    ],
    [
      "objects-and-property-descriptors",
      "Objects & Property Descriptors",
      3
    ],
    [
      "prototype-chain-and-inheritance",
      "Prototype Chain & Inheritance",
      3
    ],
    [
      "iteration-and-generators",
      "Iterables, Iterators & Generators",
      2
    ],
    [
      "errors-exceptions-and-stack-traces",
      "Errors, Exceptions & Stack Traces",
      2
    ]
  ],
  functions-scope-objects: [
    [
      "lexical-scope-and-closures",
      "Lexical Scope & Closures",
      3
    ],
    [
      "functions-as-values",
      "Functions as Values",
      3
    ],
    [
      "this-binding",
      "`this` Binding",
      3
    ],
    [
      "object-composition",
      "Object Composition",
      2
    ],
    [
      "classes-private-fields-and-methods",
      "Classes, Private Fields & Methods",
      2
    ],
    [
      "arrays-collections-and-immutability",
      "Arrays, Collections & Immutability",
      2
    ],
    [
      "map-set-weakmap-weakset",
      "Map, Set, WeakMap & WeakSet",
      2
    ],
    [
      "memory-references-and-garbage-collection",
      "Memory, References & Garbage Collection",
      2
    ]
  ],
  async-js: [
    [
      "event-loop-microtasks-and-macrotasks",
      "Event Loop, Microtasks & Macrotasks",
      3
    ],
    [
      "promises-and-error-handling",
      "Promises & Error Handling",
      3
    ],
    [
      "async-await",
      "async/await",
      3
    ],
    [
      "promise-combinators",
      "Promise Combinators",
      2
    ],
    [
      "fetch-abortcontroller-and-cancellation",
      "Fetch, AbortController & Cancellation",
      2
    ],
    [
      "timers-scheduling-and-debouncing",
      "Timers, Scheduling & Debouncing",
      2
    ],
    [
      "concurrency-limits-and-backpressure",
      "Concurrency Limits & Backpressure",
      2
    ],
    [
      "async-iteration-and-streams",
      "Async Iteration & Streams",
      1
    ]
  ],
  ts-fundamentals: [
    [
      "typescript-mental-model",
      "TypeScript Mental Model",
      3
    ],
    [
      "type-inference-and-annotations",
      "Type Inference & Annotations",
      3
    ],
    [
      "structural-typing",
      "Structural Typing",
      3
    ],
    [
      "unions-and-narrowing",
      "Union Types & Narrowing",
      3
    ],
    [
      "interfaces-vs-type-aliases",
      "Interfaces vs Type Aliases",
      2
    ],
    [
      "generics",
      "Generics",
      3
    ],
    [
      "any-unknown-never",
      "`any`, `unknown` & `never`",
      3
    ]
  ],
  advanced-typescript: [
    [
      "discriminated-unions",
      "Discriminated Unions",
      3
    ],
    [
      "type-guards-and-assertion-functions",
      "Type Guards & Assertion Functions",
      3
    ],
    [
      "conditional-types",
      "Conditional Types",
      2
    ],
    [
      "mapped-types",
      "Mapped Types",
      2
    ],
    [
      "utility-types",
      "Utility Types",
      2
    ],
    [
      "satisfies-as-const-and-literal-types",
      "`satisfies`, `as const` & Literal Types",
      2
    ],
    [
      "branded-and-opaque-types",
      "Branded & Opaque Types",
      1
    ],
    [
      "declaration-files-and-ambient-types",
      "Declaration Files & Ambient Types",
      2
    ]
  ],
  modules-runtime-tooling: [
    [
      "node-runtime-and-evented-io",
      "Node.js Runtime & Evented I/O",
      3
    ],
    [
      "browser-vs-node-environments",
      "Browser vs Node Environments",
      2
    ],
    [
      "esm-cjs-and-module-interoperability",
      "ESM, CommonJS & Module Interop",
      3
    ],
    [
      "tsconfig-and-module-resolution",
      "tsconfig & Module Resolution",
      3
    ],
    [
      "package-managers-lockfiles-and-scripts",
      "Package Managers, Lockfiles & Scripts",
      2
    ],
    [
      "vite-and-dev-build-tooling",
      "Vite & Modern Build Tooling",
      2
    ],
    [
      "transpilation-targets-and-polyfills",
      "Transpilation Targets & Polyfills",
      2
    ],
    [
      "environment-variables-and-config",
      "Environment Variables & Config",
      2
    ],
    [
      "publishing-packages",
      "Publishing Packages",
      1
    ]
  ],
  testing-quality: [
    [
      "eslint-and-typescript-eslint",
      "ESLint & typescript-eslint",
      3
    ],
    [
      "prettier-and-formatting",
      "Prettier & Formatting",
      2
    ],
    [
      "vitest-unit-tests",
      "Vitest Unit Tests",
      3
    ],
    [
      "mocking-and-test-doubles",
      "Mocking & Test Doubles",
      2
    ],
    [
      "async-testing",
      "Testing Async Code",
      3
    ],
    [
      "type-safe-api-boundaries",
      "Type-Safe API Boundaries",
      3
    ],
    [
      "runtime-validation",
      "Runtime Validation",
      2
    ],
    [
      "tsconfig-strictness",
      "tsconfig Strictness",
      2
    ]
  ]
}

const hubId = (domainId: string) => `d-${domainId}`

const hubNodes: GraphNode[] = domains.map((d) => ({
  id: hubId(d.id),
  label: d.title,
  domainId: d.id,
  importance: 3,
  kind: 'domain',
}))

const topicNodes: GraphNode[] = Object.entries(topicNodeSpecs).flatMap(([domainId, specs]) =>
  specs.map(([id, label, importance]) => ({ id, label, domainId, importance, kind: 'topic' as const })),
)

export const graphNodes: GraphNode[] = [...hubNodes, ...topicNodes]

const partOfEdges: GraphEdge[] = topicNodes.map((n) => ({
  source: n.id,
  target: hubId(n.domainId),
  type: 'part-of',
}))

/** [source, target] — source should be learned before target. */
const prerequisites: Array<[string, string]> = [
  [
    "values-types-and-primitives",
    "coercion-and-equality"
  ],
  [
    "values-types-and-primitives",
    "objects-and-property-descriptors"
  ],
  [
    "objects-and-property-descriptors",
    "prototype-chain-and-inheritance"
  ],
  [
    "prototype-chain-and-inheritance",
    "classes-private-fields-and-methods"
  ],
  [
    "values-types-and-primitives",
    "lexical-scope-and-closures"
  ],
  [
    "lexical-scope-and-closures",
    "functions-as-values"
  ],
  [
    "functions-as-values",
    "this-binding"
  ],
  [
    "event-loop-microtasks-and-macrotasks",
    "promises-and-error-handling"
  ],
  [
    "promises-and-error-handling",
    "async-await"
  ],
  [
    "async-await",
    "promise-combinators"
  ],
  [
    "async-await",
    "fetch-abortcontroller-and-cancellation"
  ],
  [
    "promise-combinators",
    "concurrency-limits-and-backpressure"
  ],
  [
    "iteration-and-generators",
    "async-iteration-and-streams"
  ],
  [
    "typescript-mental-model",
    "type-inference-and-annotations"
  ],
  [
    "type-inference-and-annotations",
    "structural-typing"
  ],
  [
    "structural-typing",
    "interfaces-vs-type-aliases"
  ],
  [
    "interfaces-vs-type-aliases",
    "generics"
  ],
  [
    "unions-and-narrowing",
    "discriminated-unions"
  ],
  [
    "unions-and-narrowing",
    "type-guards-and-assertion-functions"
  ],
  [
    "generics",
    "conditional-types"
  ],
  [
    "generics",
    "mapped-types"
  ],
  [
    "mapped-types",
    "utility-types"
  ],
  [
    "typescript-mental-model",
    "type-safe-api-boundaries"
  ],
  [
    "type-safe-api-boundaries",
    "runtime-validation"
  ],
  [
    "node-runtime-and-evented-io",
    "browser-vs-node-environments"
  ],
  [
    "node-runtime-and-evented-io",
    "esm-cjs-and-module-interoperability"
  ],
  [
    "esm-cjs-and-module-interoperability",
    "tsconfig-and-module-resolution"
  ],
  [
    "package-managers-lockfiles-and-scripts",
    "vite-and-dev-build-tooling"
  ],
  [
    "tsconfig-and-module-resolution",
    "transpilation-targets-and-polyfills"
  ],
  [
    "vite-and-dev-build-tooling",
    "environment-variables-and-config"
  ],
  [
    "package-managers-lockfiles-and-scripts",
    "publishing-packages"
  ],
  [
    "vitest-unit-tests",
    "mocking-and-test-doubles"
  ],
  [
    "vitest-unit-tests",
    "async-testing"
  ],
  [
    "eslint-and-typescript-eslint",
    "tsconfig-strictness"
  ]
]

/** Cross-domain and intra-domain conceptual links. */
const related: Array<[string, string]> = [
  [
    "values-types-and-primitives",
    "type-inference-and-annotations"
  ],
  [
    "coercion-and-equality",
    "truthiness-and-control-flow"
  ],
  [
    "coercion-and-equality",
    "any-unknown-never"
  ],
  [
    "truthiness-and-control-flow",
    "unions-and-narrowing"
  ],
  [
    "truthiness-and-control-flow",
    "type-guards-and-assertion-functions"
  ],
  [
    "objects-and-property-descriptors",
    "object-composition"
  ],
  [
    "objects-and-property-descriptors",
    "map-set-weakmap-weakset"
  ],
  [
    "prototype-chain-and-inheritance",
    "this-binding"
  ],
  [
    "iteration-and-generators",
    "arrays-collections-and-immutability"
  ],
  [
    "iteration-and-generators",
    "objects-and-property-descriptors"
  ],
  [
    "errors-exceptions-and-stack-traces",
    "promises-and-error-handling"
  ],
  [
    "errors-exceptions-and-stack-traces",
    "async-await"
  ],
  [
    "errors-exceptions-and-stack-traces",
    "type-safe-api-boundaries"
  ],
  [
    "lexical-scope-and-closures",
    "this-binding"
  ],
  [
    "lexical-scope-and-closures",
    "memory-references-and-garbage-collection"
  ],
  [
    "functions-as-values",
    "object-composition"
  ],
  [
    "this-binding",
    "classes-private-fields-and-methods"
  ],
  [
    "object-composition",
    "prototype-chain-and-inheritance"
  ],
  [
    "object-composition",
    "classes-private-fields-and-methods"
  ],
  [
    "classes-private-fields-and-methods",
    "objects-and-property-descriptors"
  ],
  [
    "arrays-collections-and-immutability",
    "values-types-and-primitives"
  ],
  [
    "arrays-collections-and-immutability",
    "objects-and-property-descriptors"
  ],
  [
    "arrays-collections-and-immutability",
    "map-set-weakmap-weakset"
  ],
  [
    "map-set-weakmap-weakset",
    "memory-references-and-garbage-collection"
  ],
  [
    "memory-references-and-garbage-collection",
    "arrays-collections-and-immutability"
  ],
  [
    "memory-references-and-garbage-collection",
    "node-runtime-and-evented-io"
  ],
  [
    "event-loop-microtasks-and-macrotasks",
    "timers-scheduling-and-debouncing"
  ],
  [
    "event-loop-microtasks-and-macrotasks",
    "node-runtime-and-evented-io"
  ],
  [
    "promises-and-error-handling",
    "async-testing"
  ],
  [
    "promise-combinators",
    "async-testing"
  ],
  [
    "fetch-abortcontroller-and-cancellation",
    "promises-and-error-handling"
  ],
  [
    "fetch-abortcontroller-and-cancellation",
    "async-testing"
  ],
  [
    "timers-scheduling-and-debouncing",
    "concurrency-limits-and-backpressure"
  ],
  [
    "timers-scheduling-and-debouncing",
    "async-testing"
  ],
  [
    "concurrency-limits-and-backpressure",
    "async-iteration-and-streams"
  ],
  [
    "concurrency-limits-and-backpressure",
    "node-runtime-and-evented-io"
  ],
  [
    "async-iteration-and-streams",
    "node-runtime-and-evented-io"
  ],
  [
    "typescript-mental-model",
    "unions-and-narrowing"
  ],
  [
    "typescript-mental-model",
    "tsconfig-strictness"
  ],
  [
    "type-inference-and-annotations",
    "interfaces-vs-type-aliases"
  ],
  [
    "type-inference-and-annotations",
    "generics"
  ],
  [
    "structural-typing",
    "branded-and-opaque-types"
  ],
  [
    "structural-typing",
    "classes-private-fields-and-methods"
  ],
  [
    "interfaces-vs-type-aliases",
    "mapped-types"
  ],
  [
    "generics",
    "utility-types"
  ],
  [
    "generics",
    "type-safe-api-boundaries"
  ],
  [
    "any-unknown-never",
    "typescript-mental-model"
  ],
  [
    "any-unknown-never",
    "type-safe-api-boundaries"
  ],
  [
    "any-unknown-never",
    "discriminated-unions"
  ],
  [
    "discriminated-unions",
    "type-safe-api-boundaries"
  ],
  [
    "type-guards-and-assertion-functions",
    "type-safe-api-boundaries"
  ],
  [
    "type-guards-and-assertion-functions",
    "runtime-validation"
  ],
  [
    "conditional-types",
    "mapped-types"
  ],
  [
    "conditional-types",
    "utility-types"
  ],
  [
    "utility-types",
    "type-safe-api-boundaries"
  ],
  [
    "satisfies-as-const-and-literal-types",
    "type-inference-and-annotations"
  ],
  [
    "satisfies-as-const-and-literal-types",
    "mapped-types"
  ],
  [
    "satisfies-as-const-and-literal-types",
    "tsconfig-strictness"
  ],
  [
    "branded-and-opaque-types",
    "type-safe-api-boundaries"
  ],
  [
    "branded-and-opaque-types",
    "runtime-validation"
  ],
  [
    "declaration-files-and-ambient-types",
    "esm-cjs-and-module-interoperability"
  ],
  [
    "declaration-files-and-ambient-types",
    "type-safe-api-boundaries"
  ],
  [
    "declaration-files-and-ambient-types",
    "publishing-packages"
  ],
  [
    "node-runtime-and-evented-io",
    "package-managers-lockfiles-and-scripts"
  ],
  [
    "browser-vs-node-environments",
    "vite-and-dev-build-tooling"
  ],
  [
    "browser-vs-node-environments",
    "environment-variables-and-config"
  ],
  [
    "esm-cjs-and-module-interoperability",
    "publishing-packages"
  ],
  [
    "esm-cjs-and-module-interoperability",
    "vite-and-dev-build-tooling"
  ],
  [
    "tsconfig-and-module-resolution",
    "tsconfig-strictness"
  ],
  [
    "package-managers-lockfiles-and-scripts",
    "eslint-and-typescript-eslint"
  ],
  [
    "vite-and-dev-build-tooling",
    "transpilation-targets-and-polyfills"
  ],
  [
    "transpilation-targets-and-polyfills",
    "browser-vs-node-environments"
  ],
  [
    "environment-variables-and-config",
    "type-safe-api-boundaries"
  ],
  [
    "eslint-and-typescript-eslint",
    "type-safe-api-boundaries"
  ],
  [
    "prettier-and-formatting",
    "eslint-and-typescript-eslint"
  ],
  [
    "prettier-and-formatting",
    "package-managers-lockfiles-and-scripts"
  ],
  [
    "prettier-and-formatting",
    "vite-and-dev-build-tooling"
  ],
  [
    "vitest-unit-tests",
    "type-safe-api-boundaries"
  ],
  [
    "mocking-and-test-doubles",
    "async-testing"
  ],
  [
    "mocking-and-test-doubles",
    "type-safe-api-boundaries"
  ]
]

export const graphEdges: GraphEdge[] = [
  ...partOfEdges,
  ...prerequisites.map(([source, target]): GraphEdge => ({ source, target, type: 'prerequisite-of' })),
  ...related.map(([source, target]): GraphEdge => ({ source, target, type: 'related-to' })),
]
