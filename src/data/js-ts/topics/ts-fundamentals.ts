import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "typescript-mental-model",
    domainId: "ts-fundamentals",
    title: "TypeScript Mental Model",
    summary: "TypeScript is a static typechecker for JavaScript. It analyzes your code before runtime, reports likely type mistakes, and then emits JavaScript; its types do not exist unless you also write runtime checks.",
    keyPoints: [
      {
        text: "TypeScript checks programs; JavaScript runs programs",
        detail: "The compiler can reject code before it ships, but the emitted program follows JavaScript runtime semantics."
      },
      {
        text: "Types are erased",
        detail: "Interfaces, type aliases, generics, conditional types, and most annotations do not exist at runtime."
      },
      {
        text: "Assertions are not validation",
        detail: "`value as User` changes what the compiler believes. It does not inspect the value."
      },
      {
        text: "Unknown data should enter as `unknown`",
        detail: "JSON, form input, localStorage, env vars, and third-party data should be validated before becoming trusted domain types."
      },
      {
        text: "TypeScript works best with strict project settings",
        detail: "`strict` and related options turn many runtime maybe-bugs into compile-time pressure."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Compile-time vs runtime",
        code: "flowchart LR\n  TS[TypeScript source] --> Check[Type checker]\n  Check --> Emit[JavaScript emit]\n  Emit --> Runtime[JavaScript runtime]\n  Types[Interfaces / aliases / generics] -. erased .-> Runtime\n  Input[JSON / user input] --> Runtime\n",
        caption: "The runtime never sees your TypeScript interface."
      },
      {
        kind: "code",
        title: "Assertion vs validation",
        code: "type User = { id: string; name: string }\n\nconst raw = await response.json()\n\nconst user1 = raw as User\n// Compiler is quiet, but runtime value may be anything.\n\nconst user2 = parseUser(raw)\n// Runtime validation proves the shape before returning User.",
        caption: "The type assertion is a claim; the parser is a check."
      },
      {
        kind: "table",
        caption: "What TypeScript can and cannot do",
        headers: [
          "Can help with",
          "Cannot prove by itself"
        ],
        rows: [
          [
            "Internal function calls",
            "External API response shape"
          ],
          [
            "Property names and return types",
            "Database contents are valid"
          ],
          [
            "Exhaustive union handling",
            "User input follows schema"
          ],
          [
            "Refactoring confidence",
            "Runtime environment has required APIs"
          ],
          [
            "Library API contracts",
            "Declaration files match implementation"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "The `as` escape hatch",
        text: "A type assertion is sometimes necessary, but it should feel like crossing a bridge with no railing. Keep it close to a real check or isolate it behind a safe API.",
        detail: "Repeated `as SomeType` around network responses is usually a smell that validation is missing."
      },
      {
        kind: "bestPractice",
        title: "Validate at boundaries, type internally",
        text: "Convert unknown external values into trusted internal types once, at the edge of the system. Keep the rest of the codebase strongly typed."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "About this Handbook"
      },
      {
        book: "effective-typescript",
        chapter: "TypeScript's type system"
      },
      {
        book: "mdn-js",
        chapter: "JavaScript runtime basics"
      }
    ],
    related: [
      "type-safe-api-boundaries",
      "unions-and-narrowing",
      "tsconfig-strictness"
    ]
  },
  {
    id: "type-inference-and-annotations",
    domainId: "ts-fundamentals",
    title: "Type Inference & Annotations",
    summary: "TypeScript infers types from values, assignments, control flow, and usage. Annotations are most valuable at boundaries where they document intent and prevent accidental API drift.",
    keyPoints: [
      {
        text: "Inference is usually best for local values",
        detail: "When the initializer is obvious, an annotation just repeats the compiler and adds noise."
      },
      {
        text: "Annotations are valuable at boundaries",
        detail: "Function parameters, exported functions, public object shapes, and API return values deserve explicit contracts."
      },
      {
        text: "Return annotations can prevent accidental widening",
        detail: "For exported functions, a return annotation catches implementation changes that accidentally alter the public API."
      },
      {
        text: "Contextual typing flows inward",
        detail: "Callbacks, object literals, and function arguments can be typed by where they are used."
      },
      {
        text: "`satisfies` checks without losing useful literals",
        detail: "It is often better than annotating a config object directly when exact keys and literal values still matter."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Where to annotate",
        headers: [
          "Location",
          "Default choice",
          "Why"
        ],
        rows: [
          [
            "Local const",
            "Infer",
            "Initializer is nearby"
          ],
          [
            "Function parameter",
            "Annotate",
            "Caller contract"
          ],
          [
            "Exported return",
            "Often annotate",
            "Public API stability"
          ],
          [
            "Callback parameter",
            "Let context infer",
            "Consumer API knows shape"
          ],
          [
            "Config object",
            "Use satisfies",
            "Check shape while preserving literals"
          ]
        ]
      },
      {
        kind: "code",
        title: "Boundary annotations, local inference",
        code: "type User = { id: string; name: string }\n\nexport function formatUser(user: User): string {\n  const label = `${user.name} (${user.id})` // inferred string\n  return label\n}\n\nconst routes = {\n  home: { path: \"/\", auth: false },\n  admin: { path: \"/admin\", auth: true },\n} satisfies Record<string, { path: string; auth: boolean }>",
        caption: "The API is explicit; local implementation stays clean."
      },
      {
        kind: "pitfall",
        title: "Annotation that widens away useful information",
        text: "Annotating a config as `Record<string, Route>` can lose exact key information. `satisfies` checks the shape while keeping literal keys.",
        detail: "This is the kind of modern TypeScript feature that quietly improves both safety and editor experience."
      },
      {
        kind: "bestPractice",
        title: "Annotate intent, not the obvious",
        text: "Let the compiler infer mechanical details, but write annotations where they communicate design or protect boundaries."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Everyday Types"
      },
      {
        book: "effective-typescript",
        chapter: "Type inference"
      },
      {
        book: "ts-reference",
        chapter: "Type compatibility"
      }
    ],
    related: [
      "typescript-mental-model",
      "interfaces-vs-type-aliases",
      "generics"
    ]
  },
  {
    id: "structural-typing",
    domainId: "ts-fundamentals",
    title: "Structural Typing",
    summary: "TypeScript is mostly structurally typed: compatibility is based on shape rather than declared name. If a value has the required properties, it can usually be used as that type.",
    keyPoints: [
      {
        text: "Shape matters more than names",
        detail: "Two types with different names are compatible if their required structures are compatible."
      },
      {
        text: "This matches JavaScript's object model",
        detail: "JavaScript functions usually care whether an object has the needed fields/methods, not where it was declared."
      },
      {
        text: "Structural typing makes APIs flexible",
        detail: "You can pass test doubles, object literals, and compatible objects without inheritance ceremony."
      },
      {
        text: "It can blur domain boundaries",
        detail: "A `UserId` and `ProductId` are both strings unless you introduce branding or wrapper objects."
      },
      {
        text: "Classes are not automatically nominal",
        detail: "Public class shape is structural too. Private/protected members introduce nominal-ish compatibility constraints."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Different names, same shape",
        code: "type User = { id: string }\ntype Product = { id: string }\n\nconst product: Product = { id: \"p1\" }\nconst user: User = product // allowed: same structure",
        caption: "This is convenient until two domain concepts share the same shape but should not mix."
      },
      {
        kind: "table",
        caption: "Typing models",
        headers: [
          "Model",
          "Compatibility based on",
          "Example"
        ],
        rows: [
          [
            "Nominal",
            "Declared identity/name",
            "Java class hierarchy"
          ],
          [
            "Structural",
            "Required shape",
            "TypeScript object types"
          ],
          [
            "Branded structural",
            "Shape + phantom marker",
            "UserId vs ProductId"
          ],
          [
            "Runtime validation",
            "Actual value check",
            "Parser/schema"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Domain values with identical structure",
        text: "If `UserId`, `ProductId`, and `OrderId` are all just `string`, TypeScript will let you mix them unless you add brands, wrappers, or API design that keeps them separate.",
        detail: "Structural typing is pragmatic. Domain modeling sometimes needs extra friction."
      },
      {
        kind: "bestPractice",
        title: "Use structural typing for capabilities",
        text: "Accept minimal shapes like `{ id: string }` when flexibility is desired. Use brands or wrappers when accidental substitution would be harmful."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Type Compatibility"
      },
      {
        book: "effective-typescript",
        chapter: "Structural typing"
      },
      {
        book: "ts-reference",
        chapter: "Assignability"
      }
    ],
    related: [
      "interfaces-vs-type-aliases",
      "branded-and-opaque-types",
      "classes-private-fields-and-methods"
    ]
  },
  {
    id: "unions-and-narrowing",
    domainId: "ts-fundamentals",
    title: "Union Types & Narrowing",
    summary: "A union means a value may be one of several types. Narrowing uses runtime checks and control flow to refine what TypeScript knows inside a branch.",
    keyPoints: [
      {
        text: "A union requires handling the possibilities",
        detail: "`string | number` means you cannot use string-only or number-only operations until the type is narrowed."
      },
      {
        text: "Runtime checks drive narrowing",
        detail: "`typeof`, `instanceof`, `in`, equality checks, discriminants, and custom guards all teach the compiler more about the value."
      },
      {
        text: "Truthiness narrows but can be too broad",
        detail: "A truthy check removes falsy values, not just nullish values. Be careful when `0`, `false`, or `''` are valid."
      },
      {
        text: "Narrowing follows control flow",
        detail: "TypeScript tracks returns, throws, assignments, and branches to refine types as code progresses."
      },
      {
        text: "Assertions bypass narrowing",
        detail: "`value as X` can silence the compiler without proving that the value is actually X."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Narrow before use",
        code: "function printId(id: string | number) {\n  if (typeof id === \"string\") {\n    return id.toUpperCase()\n  }\n\n  return id.toFixed(0)\n}",
        caption: "After the string branch returns, TypeScript knows the remaining path is number."
      },
      {
        kind: "table",
        caption: "Narrowing tools",
        headers: [
          "Check",
          "Narrows"
        ],
        rows: [
          [
            "typeof value === 'string'",
            "Primitive categories"
          ],
          [
            "value instanceof Error",
            "Class/constructor instances"
          ],
          [
            "'kind' in value",
            "Objects with property"
          ],
          [
            "value.kind === 'success'",
            "Discriminated union variant"
          ],
          [
            "isUser(value)",
            "Custom type guard"
          ],
          [
            "assertUser(value)",
            "Assertion function"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Truthiness hides valid values",
        text: "For `number | undefined`, `if (count)` rejects both undefined and 0. Use `count !== undefined` when zero is valid.",
        detail: "TypeScript narrows according to JavaScript truthiness, not according to your business meaning."
      },
      {
        kind: "bestPractice",
        title: "Prefer discriminants for domain states",
        text: "For multi-shape state, add a literal `kind` or `status` field. It makes narrowing obvious, exhaustive, and readable."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Narrowing"
      },
      {
        book: "effective-typescript",
        chapter: "Type design"
      },
      {
        book: "ts-reference",
        chapter: "Control flow analysis"
      }
    ],
    related: [
      "discriminated-unions",
      "type-guards-and-assertion-functions",
      "truthiness-and-control-flow"
    ]
  },
  {
    id: "interfaces-vs-type-aliases",
    domainId: "ts-fundamentals",
    title: "Interfaces vs Type Aliases",
    summary: "Interfaces and type aliases both name shapes. Interfaces are object-focused and can merge; type aliases can name any type expression, including unions, intersections, tuples, primitives, and mapped/conditional types.",
    keyPoints: [
      {
        text: "Both work for ordinary object shapes",
        detail: "For many app-level models, either `interface User` or `type User = {...}` is fine. Consistency matters more than dogma."
      },
      {
        text: "Interfaces support declaration merging",
        detail: "Multiple declarations with the same interface name can merge, which is useful for library augmentation but surprising in application code."
      },
      {
        text: "Type aliases handle unions and advanced expressions",
        detail: "A discriminated union, tuple alias, conditional type, or mapped type must be a type alias."
      },
      {
        text: "Public extension is a design signal",
        detail: "If consumers are expected to extend/augment a shape, interface can communicate that intent."
      },
      {
        text: "Avoid holy wars",
        detail: "The better question is not 'interface or type forever?' but 'what is this shape, who owns it, and how will it evolve?'"
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Use each where it fits",
        code: "interface User {\n  id: string\n  name: string\n}\n\ntype LoadState<T> =\n  | { kind: \"loading\" }\n  | { kind: \"success\"; data: T }\n  | { kind: \"error\"; error: Error }",
        caption: "Interfaces shine for object contracts; aliases are required for unions."
      },
      {
        kind: "table",
        caption: "Choosing interface or type",
        headers: [
          "Need",
          "Usually choose"
        ],
        rows: [
          [
            "Plain object model",
            "Either"
          ],
          [
            "Public augmentable API",
            "interface"
          ],
          [
            "Union type",
            "type"
          ],
          [
            "Tuple",
            "type"
          ],
          [
            "Mapped/conditional type",
            "type"
          ],
          [
            "Declaration merging",
            "interface"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Accidental declaration merging",
        text: "Interfaces with the same name in the same scope can merge. In library definitions this is powerful; in app code it can be surprising.",
        detail: "Type aliases error on duplicate names, which can be a feature if accidental merging would be confusing."
      },
      {
        kind: "bestPractice",
        title: "Pick a team convention",
        text: "Use a consistent convention, but allow exceptions for unions and advanced types. Consistency beats style debates."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Object Types"
      },
      {
        book: "effective-typescript",
        chapter: "Type design"
      },
      {
        book: "ts-reference",
        chapter: "Declaration merging"
      }
    ],
    related: [
      "structural-typing",
      "generics",
      "mapped-types"
    ]
  },
  {
    id: "generics",
    domainId: "ts-fundamentals",
    title: "Generics",
    summary: "Generics let types depend on other types. They preserve relationships between inputs, outputs, containers, callbacks, and API shapes without giving up reuse.",
    keyPoints: [
      {
        text: "Generics preserve relationships",
        detail: "The point is not just 'works with anything'; it is 'the output type is connected to the input type'."
      },
      {
        text: "Type parameters should appear more than once",
        detail: "If `T` appears in only one position, it may not be adding useful type information."
      },
      {
        text: "Constraints express required capabilities",
        detail: "`T extends { id: string }` lets code use `id` while preserving the rest of T."
      },
      {
        text: "Inference usually fills type arguments",
        detail: "Callers rarely need to write `<T>` manually when function parameters provide enough information."
      },
      {
        text: "Generics can become API surface area",
        detail: "Public generic APIs should be clear; overly clever type parameters turn editor help into a puzzle."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Relationship-preserving generic",
        code: "function first<T>(items: T[]): T | undefined {\n  return items[0]\n}\n\nconst a = first([1, 2, 3])       // number | undefined\nconst b = first([\"x\", \"y\"])   // string | undefined",
        caption: "`T` connects the array element type to the return type."
      },
      {
        kind: "code",
        title: "Constrained generic",
        code: "function byId<T extends { id: string }>(items: T[]): Map<string, T> {\n  return new Map(items.map((item) => [item.id, item]))\n}",
        caption: "The constraint allows `id` while preserving the full item type."
      },
      {
        kind: "table",
        caption: "Generic design smells",
        headers: [
          "Smell",
          "Why"
        ],
        rows: [
          [
            "T used only once",
            "May not express a relationship"
          ],
          [
            "Too many type parameters",
            "Hard to infer and explain"
          ],
          [
            "Manual type args required often",
            "API may be hard to infer"
          ],
          [
            "Generic returns unrelated T",
            "Likely unsafe or over-abstract"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Decorative generics",
        text: "A generic type parameter that does not connect inputs and outputs is often just a fancier `any` with better branding.",
        detail: "Good generics encode relationships. Bad generics create false confidence."
      },
      {
        kind: "bestPractice",
        title: "Design from caller experience",
        text: "A good generic API usually infers naturally at the call site and produces useful autocomplete without requiring the caller to understand type-level machinery."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Generics"
      },
      {
        book: "effective-typescript",
        chapter: "Generics"
      },
      {
        book: "ts-reference",
        chapter: "Type parameters"
      }
    ],
    related: [
      "conditional-types",
      "utility-types",
      "type-safe-api-boundaries"
    ]
  },
  {
    id: "any-unknown-never",
    domainId: "ts-fundamentals",
    title: "`any`, `unknown` & `never`",
    summary: "`any` disables type checking, `unknown` means a value must be checked before use, and `never` represents impossible values or unreachable paths.",
    keyPoints: [
      {
        text: "`any` opts out",
        detail: "Operations on `any` are allowed, and `any` can flow into other types. It is useful for migration, but dangerous when it becomes normal."
      },
      {
        text: "`unknown` is safe uncertainty",
        detail: "You can store an unknown value, but must narrow or validate it before using it as a specific type."
      },
      {
        text: "`never` means impossible",
        detail: "It appears in exhaustive checks, functions that never return, and impossible intersections."
      },
      {
        text: "Use `unknown` at boundaries",
        detail: "Network JSON, localStorage, env vars, and untyped libraries should start as unknown and become typed after validation."
      },
      {
        text: "Use `never` to make missed cases fail loudly",
        detail: "An `assertNever` helper turns a forgotten union variant into a compile-time error."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "The three escape/extreme types",
        headers: [
          "Type",
          "Meaning",
          "Use"
        ],
        rows: [
          [
            "any",
            "Compiler, stop checking this",
            "Isolated migration or unavoidable interop"
          ],
          [
            "unknown",
            "I do not know this yet",
            "Untrusted input"
          ],
          [
            "never",
            "This cannot happen",
            "Exhaustiveness and unreachable code"
          ]
        ]
      },
      {
        kind: "code",
        title: "Exhaustiveness with never",
        code: "function assertNever(value: never): never {\n  throw new Error(`Unexpected value: ${JSON.stringify(value)}`)\n}\n\nfunction render(state: LoadState<User>) {\n  switch (state.kind) {\n    case \"loading\": return \"Loading\"\n    case \"success\": return state.data.name\n    case \"error\": return state.error.message\n    default: return assertNever(state)\n  }\n}",
        caption: "Adding a new variant now forces this switch to be updated."
      },
      {
        kind: "pitfall",
        title: "`any` spreads",
        text: "Once `any` enters an expression, it can poison downstream inference. A single untyped API response can quietly erase safety across a whole feature.",
        detail: "Use linting to make `any` visible, and isolate it at wrapper boundaries."
      },
      {
        kind: "bestPractice",
        title: "`unknown` at the edge, precise types inside",
        text: "Treat external input as unknown, validate once, then pass strong domain types through the rest of the code."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Everyday Types; Narrowing"
      },
      {
        book: "effective-typescript",
        chapter: "any and unknown"
      },
      {
        book: "ts-reference",
        chapter: "never"
      }
    ],
    related: [
      "typescript-mental-model",
      "type-safe-api-boundaries",
      "discriminated-unions"
    ]
  }
]
