import type { Domain } from '../../types/content'

export const domains: Domain[] = [
  {
    id: "js-runtime",
    title: "JavaScript Runtime Semantics",
    blurb: "The behavior that actually happens when JavaScript runs: values, coercion, equality, objects, properties, prototypes, classes, iteration, and errors.",
    color: "#FACC15",
    topicIds: [
      "values-types-and-primitives",
      "coercion-and-equality",
      "truthiness-and-control-flow",
      "objects-and-property-descriptors",
      "prototype-chain-and-inheritance",
      "iteration-and-generators",
      "errors-exceptions-and-stack-traces"
    ]
  },
  {
    id: "functions-scope-objects",
    title: "Functions, Scope & Object Model",
    blurb: "Closures, this-binding, callables, object composition, classes, private fields, descriptors, references, and collection semantics.",
    color: "#F59E0B",
    topicIds: [
      "lexical-scope-and-closures",
      "functions-as-values",
      "this-binding",
      "object-composition",
      "classes-private-fields-and-methods",
      "arrays-collections-and-immutability",
      "map-set-weakmap-weakset",
      "memory-references-and-garbage-collection"
    ]
  },
  {
    id: "async-js",
    title: "Async JavaScript",
    blurb: "The event loop, promises, async/await, microtasks, timers, cancellation, fetch, streams, and practical concurrency patterns.",
    color: "#22C55E",
    topicIds: [
      "event-loop-microtasks-and-macrotasks",
      "promises-and-error-handling",
      "async-await",
      "promise-combinators",
      "fetch-abortcontroller-and-cancellation",
      "timers-scheduling-and-debouncing",
      "concurrency-limits-and-backpressure",
      "async-iteration-and-streams"
    ]
  },
  {
    id: "ts-fundamentals",
    title: "TypeScript Fundamentals",
    blurb: "The practical type-system core: inference, annotations, structural typing, unions, narrowing, generics, interfaces, and safer boundary types.",
    color: "#3B82F6",
    topicIds: [
      "typescript-mental-model",
      "type-inference-and-annotations",
      "structural-typing",
      "unions-and-narrowing",
      "interfaces-vs-type-aliases",
      "generics",
      "any-unknown-never"
    ]
  },
  {
    id: "advanced-typescript",
    title: "Advanced TypeScript",
    blurb: "Conditional types, mapped types, utility types, discriminated unions, type guards, declaration files, brands, and modern type operators.",
    color: "#6366F1",
    topicIds: [
      "discriminated-unions",
      "type-guards-and-assertion-functions",
      "conditional-types",
      "mapped-types",
      "utility-types",
      "satisfies-as-const-and-literal-types",
      "branded-and-opaque-types",
      "declaration-files-and-ambient-types"
    ]
  },
  {
    id: "modules-runtime-tooling",
    title: "Modules, Runtime & Tooling",
    blurb: "Node.js, browser vs server runtimes, package managers, ESM/CJS, tsconfig, module resolution, Vite, targets, and configuration.",
    color: "#8B5CF6",
    topicIds: [
      "node-runtime-and-evented-io",
      "browser-vs-node-environments",
      "esm-cjs-and-module-interoperability",
      "tsconfig-and-module-resolution",
      "package-managers-lockfiles-and-scripts",
      "vite-and-dev-build-tooling",
      "transpilation-targets-and-polyfills",
      "environment-variables-and-config",
      "publishing-packages"
    ]
  },
  {
    id: "testing-quality",
    title: "Testing & Code Quality",
    blurb: "ESLint, typescript-eslint, Prettier, Vitest, mocks, async tests, runtime validation, strictness, and maintainable TS discipline.",
    color: "#EC4899",
    topicIds: [
      "eslint-and-typescript-eslint",
      "prettier-and-formatting",
      "vitest-unit-tests",
      "mocking-and-test-doubles",
      "async-testing",
      "type-safe-api-boundaries",
      "runtime-validation",
      "tsconfig-strictness"
    ]
  }
]

export const domainById = new Map(domains.map((d) => [d.id, d]))
