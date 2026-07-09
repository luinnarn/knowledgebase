import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "node-runtime-and-evented-io",
    domainId: "modules-runtime-tooling",
    title: "Node.js Runtime & Evented I/O",
    summary: "Node.js runs JavaScript outside the browser and provides host APIs for files, networking, processes, diagnostics, packages, and server-side execution. Its I/O model is evented: many operations are asynchronous so the process can keep handling other work.",
    keyPoints: [
      {
        text: "Node is a runtime, not the language",
        detail: "JavaScript defines syntax and semantics; Node supplies host APIs like `fs`, `process`, `Buffer`, streams, HTTP, test runner, and package execution."
      },
      {
        text: "Evented I/O keeps one process responsive",
        detail: "File, network, timer, and process operations can complete later while JavaScript callbacks/promises continue through the event loop."
      },
      {
        text: "CPU-heavy JavaScript still blocks the event loop",
        detail: "Async I/O helps with waiting. It does not make CPU-bound work magically parallel."
      },
      {
        text: "Node has browser-like APIs but not a browser environment",
        detail: "Modern Node includes APIs like `fetch`, but there is no DOM, document, layout, or browser security model."
      },
      {
        text: "Operational Node code needs runtime discipline",
        detail: "Logging, diagnostics, memory, unhandled rejections, signal handling, graceful shutdown, dependency management, and environment config all matter in production."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Node runtime layers",
        code: "flowchart LR\n  JS[JavaScript language] --> V8[V8 engine]\n  V8 --> Node[Node.js runtime]\n  Node --> APIs[fs / net / http / streams / process]\n  APIs --> OS[Operating system]\n",
        caption: "The language is only one layer; Node adds runtime APIs and OS integration."
      },
      {
        kind: "code",
        title: "Async file I/O",
        code: "import { readFile } from \"node:fs/promises\"\n\nexport async function readConfig(path: string) {\n  const text = await readFile(path, \"utf8\")\n  return JSON.parse(text) as unknown\n}",
        caption: "The file operation is asynchronous; parsing is synchronous and can still throw."
      },
      {
        kind: "table",
        caption: "Node vs language concepts",
        headers: [
          "Concept",
          "Owned by",
          "Example"
        ],
        rows: [
          [
            "Syntax and semantics",
            "ECMAScript",
            "let, class, Promise, modules"
          ],
          [
            "Engine",
            "V8",
            "Parses and executes JavaScript"
          ],
          [
            "Runtime APIs",
            "Node",
            "fs, process, Buffer, streams"
          ],
          [
            "Package tooling",
            "Node/npm ecosystem",
            "npm scripts, node_modules"
          ],
          [
            "OS integration",
            "Host system",
            "signals, sockets, files"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Async I/O mistaken for parallel CPU",
        text: "Node can handle many waiting operations efficiently, but one long CPU-bound loop still blocks the JavaScript thread.",
        detail: "Use worker threads, child processes, native addons, separate services, or chunked work when CPU is the bottleneck."
      },
      {
        kind: "bestPractice",
        title: "Design Node services around boundaries",
        text: "Keep I/O async, validate external input, handle shutdown signals, log failures with context, and treat unhandled rejections as production bugs."
      }
    ],
    refs: [
      {
        book: "node-docs",
        chapter: "Introduction to Node.js; asynchronous work; diagnostics"
      },
      {
        book: "mdn-js",
        chapter: "JavaScript modules"
      },
      {
        book: "javascript-info",
        chapter: "Modules"
      }
    ],
    related: [
      "event-loop-microtasks-and-macrotasks",
      "esm-cjs-and-module-interoperability",
      "package-managers-lockfiles-and-scripts"
    ]
  },
  {
    id: "browser-vs-node-environments",
    domainId: "modules-runtime-tooling",
    title: "Browser vs Node Environments",
    summary: "Browsers and Node both run JavaScript, but they expose different host APIs, globals, security models, module-loading behavior, and deployment constraints.",
    keyPoints: [
      {
        text: "The same language runs in different hosts",
        detail: "JavaScript syntax may be shared, but `window`, `document`, `process`, `fs`, CORS, cookies, filesystem access, and module resolution are environment-specific."
      },
      {
        text: "Browser code runs in a user-agent sandbox",
        detail: "Browser APIs are designed around documents, events, rendering, network restrictions, storage quotas, and user permissions."
      },
      {
        text: "Node code runs with server/process capabilities",
        detail: "Node can access files, environment variables, sockets, subprocesses, and server-side resources — assuming permissions and deployment allow it."
      },
      {
        text: "SSR and edge runtimes blur the boundary",
        detail: "UI code may run first on a server or edge runtime with no DOM. Client-only assumptions can break during rendering."
      },
      {
        text: "Tooling may inject or replace values",
        detail: "Bundlers can replace environment constants or polyfill some APIs, but relying on invisible replacement makes code harder to reason about."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Environment differences",
        headers: [
          "Concern",
          "Browser",
          "Node"
        ],
        rows: [
          [
            "Global object",
            "window / globalThis",
            "global / globalThis"
          ],
          [
            "UI APIs",
            "DOM, events, layout",
            "None by default"
          ],
          [
            "Filesystem",
            "Restricted / user mediated",
            "fs module"
          ],
          [
            "Networking",
            "fetch with CORS rules",
            "fetch/http without browser CORS model"
          ],
          [
            "Config",
            "Bundled public env",
            "process.env at runtime"
          ],
          [
            "Security boundary",
            "User sandbox",
            "Server/process permissions"
          ]
        ]
      },
      {
        kind: "code",
        title: "Environment guard",
        code: "export function isBrowser() {\n  return typeof window !== \"undefined\" && typeof document !== \"undefined\"\n}\n\nif (isBrowser()) {\n  // Safe to use DOM APIs here.\n}",
        caption: "Guard environment-specific code; do not assume every runtime has every global."
      },
      {
        kind: "pitfall",
        title: "`process.env` in browser code",
        text: "Browser bundles cannot read server environment variables at runtime. Tools may replace selected values during build, and those values become visible in the client bundle.",
        detail: "If a secret is present in browser JavaScript, it is not a secret."
      },
      {
        kind: "bestPractice",
        title: "Separate environment-specific modules",
        text: "Keep server-only, browser-only, and shared code in clear files or adapters. This avoids sprinkling environment checks everywhere and makes tests more realistic."
      }
    ],
    refs: [
      {
        book: "node-docs",
        chapter: "Differences between Node.js and the Browser"
      },
      {
        book: "mdn-js",
        chapter: "Web APIs"
      },
      {
        book: "vite-docs",
        chapter: "Environment and client code"
      }
    ],
    related: [
      "node-runtime-and-evented-io",
      "vite-and-dev-build-tooling",
      "environment-variables-and-config"
    ]
  },
  {
    id: "esm-cjs-and-module-interoperability",
    domainId: "modules-runtime-tooling",
    title: "ESM, CommonJS & Module Interop",
    summary: "ES modules are the JavaScript standard module system, while CommonJS is Node's older module format. Interop depends on runtime rules, package metadata, file extensions, compiler options, and bundler behavior.",
    keyPoints: [
      {
        text: "ESM uses static import/export syntax",
        detail: "Static imports allow better analysis, tree-shaking, and browser-native module loading. ESM is the standard language module system."
      },
      {
        text: "CommonJS uses runtime require/module.exports",
        detail: "CommonJS is dynamic and historically dominant in Node. A lot of the ecosystem still contains it."
      },
      {
        text: "Package type and file extension matter",
        detail: "`type: module`, `.mjs`, `.cjs`, `.mts`, `.cts`, and TypeScript `module` settings influence how files are interpreted."
      },
      {
        text: "Default import interop is a footgun",
        detail: "A package's CommonJS export shape may not match the TypeScript or bundler default import you write."
      },
      {
        text: "Libraries have harder compatibility choices than apps",
        detail: "Apps can pick one toolchain; libraries must decide which formats and type declarations consumers can use."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Module systems",
        headers: [
          "System",
          "Syntax",
          "Resolution/behavior"
        ],
        rows: [
          [
            "ESM",
            "import/export",
            "Standard, static, async-capable loading"
          ],
          [
            "CommonJS",
            "require/module.exports",
            "Node legacy, dynamic"
          ],
          [
            "Dual package",
            "Exports ESM and CJS",
            "Consumer compatibility, more complexity"
          ],
          [
            "Bundler output",
            "Tool-generated",
            "May hide runtime details until publishing"
          ]
        ]
      },
      {
        kind: "code",
        title: "ESM vs CommonJS",
        code: "// ESM\nexport function parse(input) {\n  return JSON.parse(input)\n}\n\nimport { parse } from \"./parse.js\"\n\n// CommonJS\nmodule.exports = { parse }\nconst { parse } = require(\"./parse\")",
        caption: "Similar intent, different runtime/module-system rules."
      },
      {
        kind: "pitfall",
        title: "Works in Vite, fails in Node",
        text: "A bundler may smooth over ESM/CJS differences that raw Node will not. Published packages and Node scripts need to obey the runtime's actual module rules.",
        detail: "The dev server is not the spec. Suspiciously smooth tooling can delay the pain until CI or users."
      },
      {
        kind: "bestPractice",
        title: "Pick one module story for apps",
        text: "For applications, prefer a coherent ESM-first setup unless a dependency forces otherwise. For libraries, test real consumers for every format you claim to support."
      }
    ],
    refs: [
      {
        book: "node-docs",
        chapter: "Modules"
      },
      {
        book: "mdn-js",
        chapter: "JavaScript modules"
      },
      {
        book: "ts-reference",
        chapter: "Module resolution"
      }
    ],
    related: [
      "tsconfig-and-module-resolution",
      "publishing-packages",
      "vite-and-dev-build-tooling"
    ]
  },
  {
    id: "tsconfig-and-module-resolution",
    domainId: "modules-runtime-tooling",
    title: "tsconfig & Module Resolution",
    summary: "`tsconfig.json` controls how TypeScript checks and emits a project: target, module system, strictness, JSX, included files, path aliases, library types, and resolution rules.",
    keyPoints: [
      {
        text: "`target` controls emitted JavaScript syntax",
        detail: "It decides what language features TypeScript rewrites. It does not automatically polyfill missing runtime APIs."
      },
      {
        text: "`module` controls emitted module format",
        detail: "This affects whether output uses ESM-like syntax, CommonJS, NodeNext behavior, or bundler-oriented output."
      },
      {
        text: "`moduleResolution` controls how imports are found",
        detail: "Bundler, NodeNext, and older Node resolution modes make different assumptions about package exports and extensions."
      },
      {
        text: "`lib` controls available ambient types",
        detail: "Including `DOM` gives browser API types. Including newer ES libs gives type declarations for newer built-ins, whether your runtime supports them or not."
      },
      {
        text: "Strictness is part of architecture",
        detail: "A lax tsconfig makes unsafe patterns feel normal. A strict one moves ambiguity into visible code."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "App-oriented tsconfig shape",
        code: "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"module\": \"ESNext\",\n    \"moduleResolution\": \"Bundler\",\n    \"lib\": [\"ES2022\", \"DOM\", \"DOM.Iterable\"],\n    \"strict\": true,\n    \"noUncheckedIndexedAccess\": true,\n    \"exactOptionalPropertyTypes\": true\n  },\n  \"include\": [\"src\"]\n}",
        caption: "The right settings depend on runtime, bundler, and project type."
      },
      {
        kind: "table",
        caption: "Important tsconfig options",
        headers: [
          "Option",
          "Controls",
          "Common mistake"
        ],
        rows: [
          [
            "target",
            "Output syntax",
            "Assuming it polyfills APIs"
          ],
          [
            "module",
            "Output module format",
            "Mismatch with runtime"
          ],
          [
            "moduleResolution",
            "How imports resolve",
            "Using old mode with modern exports"
          ],
          [
            "lib",
            "Available ambient types",
            "Typing APIs not present in runtime"
          ],
          [
            "strict",
            "Type-checking baseline",
            "Leaving it off indefinitely"
          ],
          [
            "paths",
            "Compile-time aliases",
            "Forgetting runtime/bundler support"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Path aliases only TypeScript understands",
        text: "`paths` can make TypeScript resolve `@/foo`, but your runtime, bundler, test runner, and IDE all need compatible configuration.",
        detail: "An alias is not real until the whole toolchain agrees it is real."
      },
      {
        kind: "bestPractice",
        title: "Treat tsconfig as a contract",
        text: "Keep separate configs for app, tests, Node scripts, and libraries when their runtime assumptions differ. Do not cargo-cult one tsconfig into every project."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Project Configuration"
      },
      {
        book: "ts-reference",
        chapter: "TSConfig Reference"
      },
      {
        book: "node-docs",
        chapter: "TypeScript in Node.js"
      }
    ],
    related: [
      "esm-cjs-and-module-interoperability",
      "transpilation-targets-and-polyfills",
      "tsconfig-strictness"
    ]
  },
  {
    id: "package-managers-lockfiles-and-scripts",
    domainId: "modules-runtime-tooling",
    title: "Package Managers, Lockfiles & Scripts",
    summary: "Package managers install dependency graphs, run scripts, maintain lockfiles, and shape reproducible builds. npm, pnpm, Yarn, and Bun differ in details, but the core concerns are dependency boundaries and repeatability.",
    keyPoints: [
      {
        text: "A package manifest declares intent",
        detail: "`package.json` describes scripts, dependencies, exports, package type, engines, metadata, and sometimes workspace structure."
      },
      {
        text: "A lockfile records resolution",
        detail: "It pins the exact dependency tree chosen by the package manager so CI and teammates install the same graph."
      },
      {
        text: "Dependency categories matter",
        detail: "Runtime dependencies, dev dependencies, peer dependencies, optional dependencies, and workspace packages have different installation and publishing semantics."
      },
      {
        text: "Scripts are project API",
        detail: "`dev`, `build`, `test`, `lint`, and `typecheck` become the stable interface for contributors and CI."
      },
      {
        text: "pnpm-style strictness exposes hidden dependency assumptions",
        detail: "Tools that isolate dependencies more strictly can reveal packages that accidentally import undeclared transitive dependencies."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Useful package scripts",
        code: "{\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"tsc -b && vite build\",\n    \"typecheck\": \"tsc --noEmit\",\n    \"test\": \"vitest run\",\n    \"lint\": \"eslint .\",\n    \"format:check\": \"prettier --check .\"\n  }\n}",
        caption: "Scripts are the command surface for humans and CI."
      },
      {
        kind: "table",
        caption: "Dependency categories",
        headers: [
          "Field",
          "Meaning",
          "Example"
        ],
        rows: [
          [
            "dependencies",
            "Needed at runtime",
            "react, express"
          ],
          [
            "devDependencies",
            "Needed to build/test/dev",
            "vite, vitest, typescript"
          ],
          [
            "peerDependencies",
            "Provided by consumer",
            "react for a React library"
          ],
          [
            "optionalDependencies",
            "May be absent",
            "platform-specific package"
          ],
          [
            "workspace deps",
            "Local packages",
            "monorepo modules"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Deleting lockfiles because installs are annoying",
        text: "The lockfile is what makes dependency resolution reproducible. Removing it can turn a deterministic build into a vibes-based ritual.",
        detail: "For apps, commit lockfiles. For libraries, use them for development even if published consumers resolve their own tree."
      },
      {
        kind: "bestPractice",
        title: "Make CI run the boring commands",
        text: "CI should install from lockfile, typecheck, lint, test, and build using the same scripts developers run locally."
      }
    ],
    refs: [
      {
        book: "npm-docs",
        chapter: "npm package management"
      },
      {
        book: "pnpm-docs",
        chapter: "pnpm workspaces and lockfiles"
      },
      {
        book: "node-docs",
        chapter: "Package management"
      }
    ],
    related: [
      "publishing-packages",
      "vite-and-dev-build-tooling",
      "eslint-and-typescript-eslint"
    ]
  },
  {
    id: "vite-and-dev-build-tooling",
    domainId: "modules-runtime-tooling",
    title: "Vite & Modern Build Tooling",
    summary: "Vite uses native ES modules during development for fast startup and bundles optimized assets for production. It treats `index.html` as part of the module graph rather than just a static shell.",
    keyPoints: [
      {
        text: "Dev server and production build are different modes",
        detail: "The dev server optimizes feedback speed; the production build optimizes output size, compatibility, and deployment assets."
      },
      {
        text: "`index.html` is an entrypoint in Vite",
        detail: "Scripts referenced from HTML are part of the graph, which affects env replacement, asset handling, and module loading."
      },
      {
        text: "Vite relies on ESM-friendly workflows",
        detail: "Native module loading in dev is why dependency pre-bundling and source transforms feel fast compared with older full-bundle dev workflows."
      },
      {
        text: "Plugins define framework behavior",
        detail: "React, Vue, Svelte, legacy browser support, SVG transforms, markdown, and other behavior often comes from plugins."
      },
      {
        text: "Build-time env values are public in client code",
        detail: "Client env replacement is not secret storage. Only expose values intended for users to see."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Vite dev vs build",
        code: "flowchart TD\n  Source[src files + index.html] --> Dev[Vite dev server]\n  Source --> Build[Vite production build]\n  Dev --> Browser[Browser loads ESM on demand]\n  Build --> Dist[Optimized dist assets]\n",
        caption: "Fast dev and optimized production are separate execution paths."
      },
      {
        kind: "code",
        title: "Vite HTML entry",
        code: "<div id=\"root\"></div>\n<script type=\"module\" src=\"/src/main.tsx\"></script>",
        caption: "`index.html` participates in the module graph in Vite projects."
      },
      {
        kind: "table",
        caption: "Vite concepts",
        headers: [
          "Concept",
          "Meaning"
        ],
        rows: [
          [
            "Dev server",
            "Fast local ESM serving"
          ],
          [
            "Production build",
            "Bundled optimized assets"
          ],
          [
            "Dependency pre-bundling",
            "Optimizes dependencies for dev"
          ],
          [
            "import.meta.env",
            "Build-time env replacement"
          ],
          [
            "Plugin",
            "Toolchain extension"
          ],
          [
            "Preview",
            "Serve built output locally"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Dev server success as production proof",
        text: "A feature can work in dev and fail in production build because of dynamic imports, asset paths, env values, dependency quirks, or SSR assumptions.",
        detail: "Always run the real production build before trusting the result."
      },
      {
        kind: "bestPractice",
        title: "Test build output early",
        text: "Make `npm run build` part of ordinary development and CI, not a deployment surprise at the end."
      }
    ],
    refs: [
      {
        book: "vite-docs",
        chapter: "Getting Started and features"
      },
      {
        book: "ts-handbook",
        chapter: "Integrating with build tools"
      },
      {
        book: "node-docs",
        chapter: "Package management"
      }
    ],
    related: [
      "browser-vs-node-environments",
      "transpilation-targets-and-polyfills",
      "environment-variables-and-config"
    ]
  },
  {
    id: "transpilation-targets-and-polyfills",
    domainId: "modules-runtime-tooling",
    title: "Transpilation Targets & Polyfills",
    summary: "Transpilation rewrites syntax for older runtimes; polyfills provide missing runtime APIs. They solve different compatibility problems and are easy to confuse.",
    keyPoints: [
      {
        text: "Transpilation rewrites syntax",
        detail: "Optional chaining, nullish coalescing, class fields, and module syntax can be transformed into older JavaScript forms depending on tools and target."
      },
      {
        text: "Polyfills provide APIs",
        detail: "If a runtime lacks `fetch`, `Promise.any`, `Array.prototype.at`, or `structuredClone`, syntax rewriting alone will not add that API."
      },
      {
        text: "Type declarations are not runtime support",
        detail: "Including a newer `lib` in tsconfig tells TypeScript the API exists; it does not make the runtime actually implement it."
      },
      {
        text: "Targets should reflect supported environments",
        detail: "A browser app, Node service, library, and embedded webview may need different compatibility strategies."
      },
      {
        text: "Polyfills affect global behavior",
        detail: "Global polyfills can change the environment for all code. Ponyfills or local helpers can be safer for libraries."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Compatibility tools",
        headers: [
          "Tool",
          "Solves",
          "Does not solve"
        ],
        rows: [
          [
            "Transpilation",
            "Unsupported syntax",
            "Missing built-in APIs"
          ],
          [
            "Polyfill",
            "Missing global/runtime API",
            "Syntax parsing errors"
          ],
          [
            "Ponyfill",
            "Local implementation",
            "Global compatibility expectations"
          ],
          [
            "Browserslist/target",
            "Environment selection",
            "Actual user measurement"
          ],
          [
            "tsconfig lib",
            "Compile-time API types",
            "Runtime support"
          ]
        ]
      },
      {
        kind: "code",
        title: "Syntax vs API",
        code: "// Syntax can be transpiled:\nconst name = user?.profile?.name ?? \"Unknown\"\n\n// Missing API needs runtime support or polyfill:\nconst copy = structuredClone(value)",
        caption: "The first is syntax; the second is a runtime API."
      },
      {
        kind: "pitfall",
        title: "`target` as magical compatibility switch",
        text: "Changing TypeScript's `target` can rewrite emitted syntax, but it does not guarantee that every API your code calls exists in the target runtime.",
        detail: "This is one of the classic 'it compiled, therefore it works' traps."
      },
      {
        kind: "bestPractice",
        title: "Define supported runtimes explicitly",
        text: "Write down Node versions, browser targets, webview constraints, or edge runtime limits. Then configure transpilation and polyfills to match that reality."
      }
    ],
    refs: [
      {
        book: "ts-reference",
        chapter: "target and lib options"
      },
      {
        book: "vite-docs",
        chapter: "Build target"
      },
      {
        book: "mdn-js",
        chapter: "JavaScript reference and compatibility"
      }
    ],
    related: [
      "tsconfig-and-module-resolution",
      "browser-vs-node-environments",
      "vite-and-dev-build-tooling"
    ]
  },
  {
    id: "environment-variables-and-config",
    domainId: "modules-runtime-tooling",
    title: "Environment Variables & Config",
    summary: "Configuration can exist at build time, server runtime, client runtime, and test runtime. In browser bundles, exposed environment variables are public values baked into shipped JavaScript.",
    keyPoints: [
      {
        text: "Build-time config is substituted into output",
        detail: "Vite-style client env values are replaced when the app is built. Changing the server environment later will not update an already-built static bundle."
      },
      {
        text: "Server runtime config is read by the process",
        detail: "Node services can read `process.env` at startup or request time, depending on how the app is written."
      },
      {
        text: "Client config is visible to users",
        detail: "Anything included in browser JavaScript can be inspected. Prefixes like `VITE_` are exposure controls, not secrecy controls."
      },
      {
        text: "Config should be validated",
        detail: "Missing or malformed env vars should fail fast at startup/build time, not halfway through a user workflow."
      },
      {
        text: "Tests need isolated config",
        detail: "Tests should not accidentally depend on local secrets, developer machines, or production-like env values."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Config locations",
        headers: [
          "Location",
          "When resolved",
          "Visible to"
        ],
        rows: [
          [
            "Build-time client env",
            "During build",
            "Anyone with the bundle"
          ],
          [
            "Server env",
            "At process runtime",
            "Server process"
          ],
          [
            "Test env",
            "During test run",
            "Test process"
          ],
          [
            "Runtime public config endpoint",
            "When client loads",
            "Anyone who calls endpoint"
          ],
          [
            "Secrets manager",
            "At deploy/runtime",
            "Authorized server code"
          ]
        ]
      },
      {
        kind: "code",
        title: "Validate server config once",
        code: "function requiredEnv(name: string): string {\n  const value = process.env[name]\n  if (!value) throw new Error(`Missing environment variable: ${name}`)\n  return value\n}\n\nexport const config = {\n  databaseUrl: requiredEnv(\"DATABASE_URL\"),\n  apiSecret: requiredEnv(\"API_SECRET\"),\n}",
        caption: "Fail fast when config is invalid."
      },
      {
        kind: "pitfall",
        title: "Secret in a client env var",
        text: "If a variable is embedded into browser code, users can read it. There is no frontend-only secret.",
        detail: "Put secrets behind server APIs, not inside client bundles."
      },
      {
        kind: "bestPractice",
        title: "Separate public config from secrets",
        text: "Name and validate public client config separately from server-only secrets. Make exposure intentional and reviewable."
      }
    ],
    refs: [
      {
        book: "vite-docs",
        chapter: "Env variables and modes"
      },
      {
        book: "node-docs",
        chapter: "Environment variables"
      },
      {
        book: "ts-reference",
        chapter: "Project configuration"
      }
    ],
    related: [
      "vite-and-dev-build-tooling",
      "browser-vs-node-environments",
      "type-safe-api-boundaries"
    ]
  },
  {
    id: "publishing-packages",
    domainId: "modules-runtime-tooling",
    title: "Publishing Packages",
    summary: "Publishing a JS/TS package means defining runtime entrypoints, type entrypoints, dependency boundaries, exports, files, versioning, compatibility, and consumer expectations.",
    keyPoints: [
      {
        text: "Package exports define the public surface",
        detail: "The `exports` field controls which entrypoints consumers can import and how runtime/type entrypoints map."
      },
      {
        text: "Declarations must match emitted JavaScript",
        detail: "Your `.d.ts` files are a contract. If they describe a different API than the runtime output, consumers get confident breakage."
      },
      {
        text: "Peer dependencies express host-provided packages",
        detail: "Libraries that plug into React, ESLint, Vite, or other host ecosystems often should not bundle their own duplicate host dependency."
      },
      {
        text: "Files should be intentionally published",
        detail: "Use `files`, `.npmignore`, or package tooling to avoid shipping source junk, secrets, tests, local configs, or giant artifacts."
      },
      {
        text: "Semver is a communication tool",
        detail: "Breaking changes, feature additions, and patches should be visible to consumers through versioning and release notes."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "ESM package entrypoint",
        code: "{\n  \"name\": \"@acme/utils\",\n  \"version\": \"1.0.0\",\n  \"type\": \"module\",\n  \"exports\": {\n    \".\": {\n      \"types\": \"./dist/index.d.ts\",\n      \"import\": \"./dist/index.js\"\n    }\n  },\n  \"files\": [\"dist\"]\n}",
        caption: "The package declares both runtime and type entrypoints."
      },
      {
        kind: "table",
        caption: "Publishing checklist",
        headers: [
          "Concern",
          "Question"
        ],
        rows: [
          [
            "Entrypoints",
            "What can consumers import?"
          ],
          [
            "Types",
            "Do declarations match emitted JS?"
          ],
          [
            "Dependencies",
            "Which packages are runtime, dev, peer?"
          ],
          [
            "Files",
            "What actually gets published?"
          ],
          [
            "Module format",
            "ESM, CJS, or both?"
          ],
          [
            "Versioning",
            "Is this change breaking?"
          ],
          [
            "Consumer tests",
            "Did a real consuming project import it?"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Testing only the source repo",
        text: "A package can pass tests in its own repo and fail when installed because exports, files, declarations, or module format are wrong.",
        detail: "Always test the packed artifact, not just the source tree."
      },
      {
        kind: "bestPractice",
        title: "Test `npm pack` output",
        text: "Create the package tarball and install it into a tiny consumer project. That catches missing files, bad exports, and type/runtime mismatches before users do."
      }
    ],
    refs: [
      {
        book: "npm-docs",
        chapter: "Publishing packages"
      },
      {
        book: "ts-handbook",
        chapter: "Publishing declaration files"
      },
      {
        book: "node-docs",
        chapter: "Publishing a package"
      }
    ],
    related: [
      "declaration-files-and-ambient-types",
      "esm-cjs-and-module-interoperability",
      "package-managers-lockfiles-and-scripts"
    ]
  }
]
