import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "discriminated-unions",
    domainId: "advanced-typescript",
    title: "Discriminated Unions",
    summary: "A discriminated union models alternatives using a shared literal field such as `kind`, `type`, or `status`. It makes invalid combinations unrepresentable and gives TypeScript reliable narrowing.",
    keyPoints: [
      {
        text: "One field identifies the variant",
        detail: "Every member has a shared property with a different literal value. Checking that property narrows to the matching shape."
      },
      {
        text: "Model states as alternatives, not flags",
        detail: "Booleans like `isLoading`, `hasError`, and `hasData` allow impossible combinations. A union says exactly which states exist."
      },
      {
        text: "Payload belongs only where valid",
        detail: "A success variant has data; an error variant has error; a loading variant has neither. This removes optional-property guesswork."
      },
      {
        text: "Exhaustiveness protects future changes",
        detail: "An `assertNever` default makes TypeScript complain when a new variant is added but not handled."
      },
      {
        text: "Discriminants work beautifully with reducers and events",
        detail: "Action objects, domain events, command handlers, and async state all benefit from explicit variants."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Async state as a discriminated union",
        code: "type LoadState<T> =\n  | { kind: \"idle\" }\n  | { kind: \"loading\" }\n  | { kind: \"success\"; data: T }\n  | { kind: \"error\"; error: Error }\n\nfunction message(state: LoadState<User>) {\n  switch (state.kind) {\n    case \"idle\": return \"Not loaded\"\n    case \"loading\": return \"Loading...\"\n    case \"success\": return state.data.name\n    case \"error\": return state.error.message\n  }\n}",
        caption: "Each branch gets only the fields that make sense for that state."
      },
      {
        kind: "table",
        caption: "Flags vs union",
        headers: [
          "Approach",
          "Problem/Benefit"
        ],
        rows: [
          [
            "Boolean flags",
            "Can represent impossible states"
          ],
          [
            "Optional fields",
            "Caller must guess which fields exist"
          ],
          [
            "Discriminated union",
            "Only valid states are representable"
          ],
          [
            "assertNever",
            "Future variants force handling"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Optional-property soup",
        text: "A type like `{ loading?: boolean; data?: T; error?: Error }` allows loading with data and error all at once. That is not flexible; it is under-modeled.",
        detail: "When the domain has distinct states, make them distinct types."
      },
      {
        kind: "bestPractice",
        title: "Use a boring discriminant name",
        text: "`kind`, `type`, and `status` are all fine. Pick one team convention and make variants literal, readable, and exhaustive."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Discriminated unions"
      },
      {
        book: "effective-typescript",
        chapter: "Type design"
      },
      {
        book: "ts-reference",
        chapter: "Narrowing"
      }
    ],
    related: [
      "unions-and-narrowing",
      "any-unknown-never",
      "type-safe-api-boundaries"
    ]
  },
  {
    id: "type-guards-and-assertion-functions",
    domainId: "advanced-typescript",
    title: "Type Guards & Assertion Functions",
    summary: "Type guards and assertion functions connect runtime checks to TypeScript's control-flow narrowing. They let the compiler understand that an unknown value has been validated.",
    keyPoints: [
      {
        text: "A type guard returns a type predicate",
        detail: "`value is User` tells TypeScript that a true result narrows the value to User."
      },
      {
        text: "An assertion function narrows or throws",
        detail: "`asserts value is User` says that if the function returns normally, the value has that type."
      },
      {
        text: "The runtime check must be real",
        detail: "The compiler trusts your predicate. If the predicate lies, the rest of the code becomes unsafely typed."
      },
      {
        text: "Guards are boundary tools",
        detail: "They are most valuable around JSON, forms, env vars, localStorage, package interop, and other unknown values."
      },
      {
        text: "Schema libraries formalize this pattern",
        detail: "Many teams use runtime schema parsers to avoid manually keeping guards and types in sync."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Type guard",
        code: "type User = { id: string; name: string }\n\nfunction isUser(value: unknown): value is User {\n  return typeof value === \"object\" && value !== null\n    && typeof (value as { id?: unknown }).id === \"string\"\n    && typeof (value as { name?: unknown }).name === \"string\"\n}\n\nconst data: unknown = await response.json()\nif (isUser(data)) {\n  console.log(data.name)\n}",
        caption: "The guard performs runtime checks and teaches TypeScript about the result."
      },
      {
        kind: "code",
        title: "Assertion function",
        code: "function assertUser(value: unknown): asserts value is User {\n  if (!isUser(value)) {\n    throw new Error(\"Invalid User\")\n  }\n}\n\nconst raw: unknown = await response.json()\nassertUser(raw)\nraw.name // User",
        caption: "Assertions are useful when invalid input should abort the current path."
      },
      {
        kind: "pitfall",
        title: "Lying guard",
        text: "A function that returns `value is User` but only checks `typeof value === 'object'` gives the compiler false confidence.",
        detail: "A weak reusable guard is worse than a local assertion because it spreads the lie across the codebase."
      },
      {
        kind: "bestPractice",
        title: "Keep guards small and tested",
        text: "Test successful cases, missing fields, wrong field types, null, arrays when inappropriate, and extra data policy. Boundary code deserves tests."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Narrowing"
      },
      {
        book: "effective-typescript",
        chapter: "Type guards"
      },
      {
        book: "ts-reference",
        chapter: "Assertion functions"
      }
    ],
    related: [
      "unions-and-narrowing",
      "type-safe-api-boundaries",
      "runtime-validation"
    ]
  },
  {
    id: "conditional-types",
    domainId: "advanced-typescript",
    title: "Conditional Types",
    summary: "Conditional types choose one type or another based on assignability. They are the foundation for many TypeScript utility types and library-level type transformations.",
    keyPoints: [
      {
        text: "Conditional types are type-level branches",
        detail: "`T extends U ? A : B` asks whether T is assignable to U, then produces A or B."
      },
      {
        text: "`infer` extracts part of a type",
        detail: "Inside a conditional type, `infer` can capture a function return type, Promise value, tuple element, or other structural piece."
      },
      {
        text: "Naked type parameters distribute over unions",
        detail: "When `T` is a union and appears naked on the left side of `extends`, the conditional applies to each union member."
      },
      {
        text: "They are best for reusable type helpers",
        detail: "Application code rarely needs deep conditional types. Libraries and framework helpers need them more often."
      },
      {
        text: "Type cleverness has maintenance cost",
        detail: "A type that requires a whiteboard can make code harder to change even if it is technically impressive."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Extract awaited value",
        code: "type AwaitedValue<T> = T extends Promise<infer U> ? U : T\n\ntype A = AwaitedValue<Promise<string>> // string\ntype B = AwaitedValue<number>          // number",
        caption: "`infer U` captures the value inside Promise<U>."
      },
      {
        kind: "code",
        title: "Distributive conditional type",
        code: "type OnlyStrings<T> = T extends string ? T : never\n\ntype Result = OnlyStrings<string | number | \"ok\">\n// string | \"ok\" simplifies to string",
        caption: "The conditional is applied to each union member."
      },
      {
        kind: "table",
        caption: "Conditional type pieces",
        headers: [
          "Piece",
          "Meaning"
        ],
        rows: [
          [
            "T extends U",
            "Assignability test"
          ],
          [
            "? A : B",
            "Type-level branch"
          ],
          [
            "infer X",
            "Capture part of matched type"
          ],
          [
            "never",
            "Remove impossible union branch"
          ],
          [
            "[T] extends [U]",
            "Prevent distributive behavior"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Type puzzle as public API",
        text: "If users have to debug your conditional type to call a function, the abstraction is leaking.",
        detail: "Advanced type programming should make the call site simpler, not turn every error into compiler archaeology."
      },
      {
        kind: "bestPractice",
        title: "Hide complexity behind named helpers",
        text: "If a conditional type is worth using, give it a meaningful name and a few tests or examples. Treat type helpers like API surface."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Conditional Types"
      },
      {
        book: "effective-typescript",
        chapter: "Type-level programming"
      },
      {
        book: "ts-reference",
        chapter: "Conditional types"
      }
    ],
    related: [
      "generics",
      "mapped-types",
      "utility-types"
    ]
  },
  {
    id: "mapped-types",
    domainId: "advanced-typescript",
    title: "Mapped Types",
    summary: "Mapped types transform object types by iterating over keys. They are how TypeScript expresses mechanical object-shape changes such as readonly, optional, required, picked, omitted, and remapped properties.",
    keyPoints: [
      {
        text: "Mapped types iterate over keys",
        detail: "`[K in keyof T]` builds a new object type by visiting each key from T."
      },
      {
        text: "Indexed access gets property value types",
        detail: "`T[K]` means the value type of property K on T."
      },
      {
        text: "Modifiers can be added or removed",
        detail: "Mapped types can add/remove `readonly` and optional modifiers using `+` and `-` modifier syntax."
      },
      {
        text: "Keys can be remapped",
        detail: "The `as` clause can rename keys, filter keys to never, or build template-literal-based property names."
      },
      {
        text: "Mechanical transformation is not semantic design",
        detail: "A mapped type can derive a type that is technically correct but not meaningful as a domain model."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Basic mapped types",
        code: "type Mutable<T> = {\n  -readonly [K in keyof T]: T[K]\n}\n\ntype Nullable<T> = {\n  [K in keyof T]: T[K] | null\n}",
        caption: "The new type follows the keys of the original type."
      },
      {
        kind: "code",
        title: "Key remapping",
        code: "type Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]\n}\n\ntype UserGetters = Getters<{ id: string; name: string }>\n// { getId: () => string; getName: () => string }",
        caption: "Mapped types can generate new property names from old ones."
      },
      {
        kind: "table",
        caption: "Mapped type tools",
        headers: [
          "Tool",
          "Use"
        ],
        rows: [
          [
            "keyof T",
            "Get key union"
          ],
          [
            "K in keyof T",
            "Iterate keys"
          ],
          [
            "T[K]",
            "Read property value type"
          ],
          [
            "readonly / -readonly",
            "Add/remove readonly"
          ],
          [
            "? / -?",
            "Add/remove optional"
          ],
          [
            "as",
            "Remap/filter keys"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Derived type drift",
        text: "A type like `Partial<User>` may be mechanically convenient but too loose for a specific form, patch endpoint, or domain workflow.",
        detail: "Derived utility types are great for infrastructure; domain types often deserve explicit names and rules."
      },
      {
        kind: "bestPractice",
        title: "Use mapped types for mechanical relationships",
        text: "Reach for mapped types when the new shape should always follow the old shape. If the new shape has its own business meaning, name it explicitly."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Mapped Types"
      },
      {
        book: "effective-typescript",
        chapter: "Type-level programming"
      },
      {
        book: "ts-reference",
        chapter: "Keyof and indexed access"
      }
    ],
    related: [
      "utility-types",
      "conditional-types",
      "interfaces-vs-type-aliases"
    ]
  },
  {
    id: "utility-types",
    domainId: "advanced-typescript",
    title: "Utility Types",
    summary: "TypeScript utility types are standard reusable transformations such as Partial, Required, Pick, Omit, Record, ReturnType, Parameters, Extract, Exclude, NonNullable, and Awaited.",
    keyPoints: [
      {
        text: "Utility types encode common transformations",
        detail: "They save you from rewriting common mapped and conditional type patterns."
      },
      {
        text: "Pick/Omit are shape tools, not DTO design strategy",
        detail: "They are useful, but public request/response types often deserve explicit names and documentation."
      },
      {
        text: "Partial is easy to overuse",
        detail: "`Partial<T>` says every property is optional. Many update flows allow only specific fields, and some fields are optional for different reasons."
      },
      {
        text: "Record is useful for dictionaries with known key sets",
        detail: "`Record<Status, Handler>` can force every status to have a handler."
      },
      {
        text: "ReturnType and Parameters couple to implementation",
        detail: "They are great for wrappers but can make public types change when implementation changes."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Common utility types",
        headers: [
          "Utility",
          "Meaning",
          "Example use"
        ],
        rows: [
          [
            "Partial<T>",
            "All properties optional",
            "Draft/update object"
          ],
          [
            "Required<T>",
            "All properties required",
            "Normalized config"
          ],
          [
            "Pick<T, K>",
            "Keep selected properties",
            "Preview DTO"
          ],
          [
            "Omit<T, K>",
            "Remove selected properties",
            "Public shape without secret"
          ],
          [
            "Record<K, T>",
            "Map keys to values",
            "Handler table"
          ],
          [
            "ReturnType<F>",
            "Function return type",
            "Wrapper/helper"
          ],
          [
            "Extract<T, U>",
            "Keep union members assignable to U",
            "Filter variants"
          ],
          [
            "Exclude<T, U>",
            "Remove union members assignable to U",
            "Filter variants"
          ]
        ]
      },
      {
        kind: "code",
        title: "Handler table with Record",
        code: "type Status = \"idle\" | \"loading\" | \"success\" | \"error\"\n\ntype Handler = () => void\n\nconst handlers: Record<Status, Handler> = {\n  idle: () => {},\n  loading: () => {},\n  success: () => {},\n  error: () => {},\n}",
        caption: "Adding a new status forces the table to be updated."
      },
      {
        kind: "pitfall",
        title: "`Partial<T>` as patch API",
        text: "`Partial<User>` may allow updates to fields that should never be user-editable, such as id, createdAt, role, or accountId.",
        detail: "Use `Partial<Pick<User, 'name' | 'email'>>` or a named `UpdateUserRequest` instead."
      },
      {
        kind: "bestPractice",
        title: "Use utilities to express intent, not avoid naming",
        text: "A utility type is great when the relationship is the point. A named type is better when the business concept is the point."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Utility Types"
      },
      {
        book: "effective-typescript",
        chapter: "Type design"
      },
      {
        book: "ts-reference",
        chapter: "Utility types"
      }
    ],
    related: [
      "mapped-types",
      "conditional-types",
      "type-safe-api-boundaries"
    ]
  },
  {
    id: "satisfies-as-const-and-literal-types",
    domainId: "advanced-typescript",
    title: "`satisfies`, `as const` & Literal Types",
    summary: "Literal types preserve exact values. `as const` freezes inference to readonly literal shapes. `satisfies` checks a value against a target type without widening away its precise inferred type.",
    keyPoints: [
      {
        text: "Literal types represent exact values",
        detail: "`'admin'` is narrower than `string`; `42` is narrower than `number`. Literal types are how TypeScript models exact variants and config values."
      },
      {
        text: "`as const` preserves literals deeply",
        detail: "It makes object/array literals readonly and prevents values from widening to general string/number/boolean types."
      },
      {
        text: "`satisfies` checks without replacing inference",
        detail: "It verifies that a value conforms to a type while keeping the specific inferred shape of the value."
      },
      {
        text: "This is ideal for configuration objects",
        detail: "Routes, command maps, action tables, design tokens, feature flags, and permission matrices often need both shape checking and exact keys."
      },
      {
        text: "`as Type` is not the same",
        detail: "A type assertion can suppress errors that `satisfies` would catch."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "`satisfies` keeps exact keys",
        code: "type Route = { path: string; auth: boolean }\n\nconst routes = {\n  home: { path: \"/\", auth: false },\n  admin: { path: \"/admin\", auth: true },\n} satisfies Record<string, Route>\n\ntype RouteName = keyof typeof routes\n// \"home\" | \"admin\"",
        caption: "The object is checked as a route map, but its exact keys are preserved."
      },
      {
        kind: "code",
        title: "`as const` for literal arrays",
        code: "const statuses = [\"idle\", \"loading\", \"success\", \"error\"] as const\n\ntype Status = typeof statuses[number]\n// \"idle\" | \"loading\" | \"success\" | \"error\"",
        caption: "`as const` turns a normal string array into a source of literal union types."
      },
      {
        kind: "table",
        caption: "Literal-preserving tools",
        headers: [
          "Tool",
          "What it does",
          "Use for"
        ],
        rows: [
          [
            "literal type",
            "Exact value type",
            "Variants and constants"
          ],
          [
            "as const",
            "Readonly literal inference",
            "Arrays/config values"
          ],
          [
            "satisfies",
            "Check shape, keep inference",
            "Config maps"
          ],
          [
            "as Type",
            "Force compiler belief",
            "Last resort / interop"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Assertion hiding a broken config",
        text: "`as Record<string, Route>` can force a bad config through. `satisfies Record<string, Route>` checks the config and keeps its precise type.",
        detail: "For config objects, `satisfies` is usually the adult in the room."
      },
      {
        kind: "bestPractice",
        title: "Derive unions from canonical values",
        text: "For status lists, action names, routes, and feature flags, define the values once and derive the type from them."
      }
    ],
    refs: [
      {
        book: "ts-release-notes",
        chapter: "satisfies operator and const inference"
      },
      {
        book: "ts-handbook",
        chapter: "Literal Types"
      },
      {
        book: "effective-typescript",
        chapter: "Type inference"
      }
    ],
    related: [
      "type-inference-and-annotations",
      "mapped-types",
      "tsconfig-strictness"
    ]
  },
  {
    id: "branded-and-opaque-types",
    domainId: "advanced-typescript",
    title: "Branded & Opaque Types",
    summary: "Branded types add a phantom marker to structurally identical values so TypeScript treats them as distinct domain concepts, such as UserId and ProductId even when both are strings at runtime.",
    keyPoints: [
      {
        text: "Branding adds nominal friction to structural typing",
        detail: "TypeScript is structural by default. A brand adds an artificial property that prevents accidental substitution."
      },
      {
        text: "The brand is compile-time only unless validated",
        detail: "A branded string is still a string at runtime. You need a constructor/parser to prove an arbitrary string deserves the brand."
      },
      {
        text: "Use brands for domain identifiers and units",
        detail: "IDs, currencies, milliseconds vs seconds, validated emails, tokens, and normalized strings are common examples."
      },
      {
        text: "Do not brand everything",
        detail: "Brands add ceremony. Use them where accidental mixing is likely and costly."
      },
      {
        text: "Keep brand construction centralized",
        detail: "If everyone can write `as UserId`, the brand becomes decorative."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Branded IDs",
        code: "type Brand<T, B extends string> = T & { readonly __brand: B }\n\ntype UserId = Brand<string, \"UserId\">\ntype ProductId = Brand<string, \"ProductId\">\n\nfunction parseUserId(value: string): UserId {\n  if (!value.startsWith(\"user_\")) throw new Error(\"Invalid UserId\")\n  return value as UserId\n}\n\nfunction loadUser(id: UserId) {}\n\nconst id = parseUserId(\"user_123\")\nloadUser(id)",
        caption: "The parser is the trusted place where runtime value becomes branded type."
      },
      {
        kind: "table",
        caption: "Good branding candidates",
        headers: [
          "Concept",
          "Runtime shape",
          "Why brand"
        ],
        rows: [
          [
            "UserId vs ProductId",
            "string",
            "Prevent ID mixups"
          ],
          [
            "Milliseconds vs seconds",
            "number",
            "Prevent unit bugs"
          ],
          [
            "Email",
            "string",
            "Require validation"
          ],
          [
            "Access token",
            "string",
            "Avoid logging/mixing"
          ],
          [
            "Normalized path",
            "string",
            "Ensure canonicalization"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Brand-by-assertion everywhere",
        text: "If call sites casually write `value as UserId`, the brand no longer protects anything. It just hides unsafe conversions.",
        detail: "Brands only work when construction is controlled."
      },
      {
        kind: "bestPractice",
        title: "Pair brands with constructors",
        text: "Create branded values through parsing, validation, or trusted database boundaries. Keep the assertion inside that small trusted function."
      }
    ],
    refs: [
      {
        book: "effective-typescript",
        chapter: "Structural typing and branding"
      },
      {
        book: "ts-handbook",
        chapter: "Type compatibility"
      },
      {
        book: "ts-reference",
        chapter: "Intersection types"
      }
    ],
    related: [
      "structural-typing",
      "type-safe-api-boundaries",
      "runtime-validation"
    ]
  },
  {
    id: "declaration-files-and-ambient-types",
    domainId: "advanced-typescript",
    title: "Declaration Files & Ambient Types",
    summary: "Declaration files describe the types of JavaScript code to TypeScript. Ambient declarations tell TypeScript about values, globals, or modules that exist at runtime but are not defined in the current TypeScript source.",
    keyPoints: [
      {
        text: "`.d.ts` files contain types only",
        detail: "They do not emit runtime code. They are promises about runtime code that exists elsewhere."
      },
      {
        text: "Declarations can type JavaScript libraries",
        detail: "A package can ship its own declarations or rely on community `@types/...` packages."
      },
      {
        text: "`declare` means 'trust me, this exists at runtime'",
        detail: "TypeScript will believe the declaration, but your runtime must actually provide the value."
      },
      {
        text: "Module declarations bridge untyped packages",
        detail: "You can declare a module shape for legacy libraries or non-code imports such as CSS modules and assets."
      },
      {
        text: "Bad declarations create confident bugs",
        detail: "If the declaration says a function returns string but runtime returns null, TypeScript will happily let you call string methods and crash."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Ambient module declaration",
        code: "declare module \"legacy-parser\" {\n  export function parse(input: string): unknown\n}\n\ndeclare const __APP_VERSION__: string",
        caption: "These declarations tell TypeScript about runtime values supplied elsewhere."
      },
      {
        kind: "table",
        caption: "Declaration concepts",
        headers: [
          "Concept",
          "Meaning",
          "Example"
        ],
        rows: [
          [
            ".d.ts",
            "Type declarations",
            "index.d.ts"
          ],
          [
            "declare module",
            "Describe external module",
            "legacy package"
          ],
          [
            "declare global",
            "Augment global scope",
            "window flags"
          ],
          [
            "@types package",
            "Community declarations",
            "@types/node"
          ],
          [
            "types field",
            "Package declaration entry",
            "package.json"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Types that do not match runtime",
        text: "Declaration files are not automatically verified against implementation. A wrong declaration can be worse than no declaration because it creates false confidence.",
        detail: "This is why package authors need declaration tests or API-extractor style validation."
      },
      {
        kind: "bestPractice",
        title: "Keep declarations near the runtime boundary",
        text: "When typing an untyped dependency, declare the smallest surface you actually use, then wrap it in a safer local API if the package is risky."
      }
    ],
    refs: [
      {
        book: "ts-handbook",
        chapter: "Declaration Files"
      },
      {
        book: "ts-reference",
        chapter: "Modules .d.ts"
      },
      {
        book: "effective-typescript",
        chapter: "Type declarations"
      }
    ],
    related: [
      "esm-cjs-and-module-interoperability",
      "type-safe-api-boundaries",
      "publishing-packages"
    ]
  }
]
