import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "values-types-and-primitives",
    domainId: "js-runtime",
    title: "Values, Types & Primitives",
    summary: "JavaScript values are either primitives or objects. Primitives are immutable values; objects are mutable identity-bearing containers. Variables are bindings that point at values, not boxes that contain them.",
    keyPoints: [
      {
        text: "The runtime has values, not TypeScript types",
        detail: "At runtime, JavaScript sees values and operations. TypeScript's static types are erased before execution. This is why `typeof` can inspect runtime categories, but cannot inspect a TypeScript interface."
      },
      {
        text: "Primitives are immutable values",
        detail: "Strings, numbers, booleans, bigint, symbol, null, and undefined cannot be mutated in place. Operations produce new values."
      },
      {
        text: "Objects have identity and can be mutated through references",
        detail: "Two object literals with the same fields are still different objects. Multiple variables can point at the same object, so mutation through one reference is visible through another."
      },
      {
        text: "`const` freezes the binding, not the object",
        detail: "`const user = {}` prevents rebinding `user`, but does not prevent `user.name = 'Ana'`. Use Object.freeze or immutable patterns if object mutation is the concern."
      },
      {
        text: "Arrays and functions are objects too",
        detail: "Arrays are special indexed objects; functions are callable objects. Both can have properties and identity."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Runtime categories",
        headers: [
          "Category",
          "Examples",
          "Key behavior"
        ],
        rows: [
          [
            "Primitive",
            "string, number, boolean, bigint, symbol, null, undefined",
            "Immutable value"
          ],
          [
            "Object",
            "plain object, array, function, Date, Map, Set",
            "Mutable identity"
          ],
          [
            "Binding",
            "let/const/var name",
            "Points at a value"
          ],
          [
            "Reference",
            "A way to reach an object",
            "Multiple references can reach same object"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Bindings point at values",
        code: "flowchart LR\n  A[const user] --> O[{ id: 1, name: 'Ana' }]\n  B[const sameUser] --> O\n  C[const otherUser] --> P[{ id: 1, name: 'Ana' }]\n",
        caption: "`user` and `sameUser` reference the same object; `otherUser` has the same shape but different identity."
      },
      {
        kind: "code",
        title: "Primitive value vs object identity",
        code: "const a = \"hello\"\nconst b = a.toUpperCase()\nconsole.log(a) // \"hello\"\nconsole.log(b) // \"HELLO\"\n\nconst user = { name: \"Ana\" }\nconst sameUser = user\nsameUser.name = \"Mila\"\nconsole.log(user.name) // \"Mila\"",
        caption: "String operations create new primitive values; object mutation changes the referenced object."
      },
      {
        kind: "pitfall",
        title: "`typeof null`",
        text: "`typeof null` returns `'object'`, a long-standing JavaScript oddity. Use `value === null` when you need to check null specifically.",
        detail: "This is one of those runtime facts that TypeScript cannot erase. It shows up in custom validators and type guards."
      },
      {
        kind: "bestPractice",
        title: "Model mutation deliberately",
        text: "Use immutable updates for shared UI/app state, mutation for local/private objects when it is clear, and explicit cloning when identity matters."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Grammar and types"
      },
      {
        book: "ecmascript-spec",
        chapter: "ECMAScript data types and values"
      },
      {
        book: "eloquent-js",
        chapter: "Values, Types, and Operators"
      }
    ],
    related: [
      "coercion-and-equality",
      "objects-and-property-descriptors",
      "type-inference-and-annotations"
    ]
  },
  {
    id: "coercion-and-equality",
    domainId: "js-runtime",
    title: "Coercion & Equality",
    summary: "JavaScript can convert values explicitly or implicitly. Strict equality avoids most implicit conversion, while loose equality follows a set of coercion rules that are precise but rarely obvious at a glance.",
    keyPoints: [
      {
        text: "Coercion is conversion between runtime value types",
        detail: "`String(value)`, `Number(value)`, and `Boolean(value)` are explicit conversions. Operators such as `+`, `==`, and `if (...)` can trigger implicit conversions."
      },
      {
        text: "`===` compares without type coercion",
        detail: "Strict equality is usually the right default because it keeps comparisons local and reviewable."
      },
      {
        text: "`==` is not random, but it is non-local",
        detail: "Loose equality has defined rules, but remembering them while reading business logic is wasted brain budget."
      },
      {
        text: "NaN and -0 require special sameness awareness",
        detail: "`NaN !== NaN`, while `Object.is(NaN, NaN)` is true. `Object.is(0, -0)` is false, while `0 === -0` is true."
      },
      {
        text: "TypeScript does not remove coercion from runtime",
        detail: "TS can warn about some suspicious comparisons, but emitted JavaScript still follows JavaScript equality and conversion semantics."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Comparison tools",
        headers: [
          "Tool",
          "Does coercion?",
          "Use for"
        ],
        rows: [
          [
            "==",
            "Yes",
            "Rare intentional nullish checks like x == null"
          ],
          [
            "===",
            "No type coercion",
            "Default equality"
          ],
          [
            "Object.is",
            "SameValue semantics",
            "NaN and -0-sensitive checks"
          ],
          [
            "Number.isNaN",
            "No coercion",
            "Check actual NaN"
          ],
          [
            "Boolean(value)",
            "Explicit truthiness",
            "Clear condition conversion"
          ]
        ]
      },
      {
        kind: "code",
        title: "Equality examples",
        code: "0 == false          // true\n0 === false         // false\nnull == undefined   // true\nnull === undefined  // false\nNaN === NaN         // false\nObject.is(NaN, NaN) // true\nObject.is(0, -0)    // false",
        caption: "The rules are deterministic. The question is whether the reader should have to simulate them."
      },
      {
        kind: "pitfall",
        title: "The `+` operator does two different jobs",
        text: "`+` means numeric addition or string concatenation. If either side becomes a string, you may get concatenation instead of arithmetic.",
        detail: "`1 + 2 + '3'` is `'33'`; `'1' + 2 + 3` is `'123'`. Parentheses and explicit conversion beat cleverness here."
      },
      {
        kind: "bestPractice",
        title: "Use explicit conversion at boundaries",
        text: "Parse URL params, form values, localStorage, and environment variables explicitly. Do not let arithmetic or equality operators silently decide your conversion policy."
      },
      {
        kind: "note",
        title: "The one common `==` exception",
        text: "`value == null` intentionally matches both null and undefined. Some teams allow exactly this pattern; others prefer `value === null || value === undefined` for maximum explicitness."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Expressions, operators, and equality comparisons"
      },
      {
        book: "ecmascript-spec",
        chapter: "Abstract Equality Comparison"
      },
      {
        book: "ydkjs-yet",
        chapter: "Types and Grammar"
      }
    ],
    related: [
      "values-types-and-primitives",
      "truthiness-and-control-flow",
      "any-unknown-never"
    ]
  },
  {
    id: "truthiness-and-control-flow",
    domainId: "js-runtime",
    title: "Truthiness & Control Flow",
    summary: "JavaScript conditionals evaluate truthiness, not only booleans. This is convenient for presence checks, but dangerous when `0`, `false`, or an empty string are valid values.",
    keyPoints: [
      {
        text: "Falsy values are a small fixed set",
        detail: "`false`, `0`, `-0`, `0n`, `''`, `null`, `undefined`, and `NaN` become false in boolean contexts. Everything else is truthy, including empty arrays and empty objects."
      },
      {
        text: "Truthiness is not the same as existence",
        detail: "A value can exist and still be falsy. `0` is a real number, `false` is a real boolean, and `''` can be a valid intentionally empty string."
      },
      {
        text: "`??` checks nullishness only",
        detail: "Nullish coalescing falls back only for `null` or `undefined`, preserving `0`, `false`, and `''`."
      },
      {
        text: "`||` falls back for any falsy value",
        detail: "Logical OR is fine for boolean logic, but risky for defaulting values where falsy values are valid."
      },
      {
        text: "Control flow affects TypeScript narrowing",
        detail: "TypeScript narrows types based on runtime checks, including truthiness, but it follows JavaScript semantics. A truthy check narrows out empty string and zero in some cases too."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Defaulting operators",
        headers: [
          "Expression",
          "Falls back when",
          "Preserves 0/false/''?"
        ],
        rows: [
          [
            "value || fallback",
            "Any falsy value",
            "No"
          ],
          [
            "value ?? fallback",
            "null or undefined",
            "Yes"
          ],
          [
            "condition ? a : b",
            "Explicit condition",
            "Depends on condition"
          ]
        ]
      },
      {
        kind: "code",
        title: "Defaulting bug",
        code: "function pageSize(input) {\n  return input || 20\n}\n\npageSize(0) // 20, maybe wrong\n\nfunction pageSizeSafe(input) {\n  return input ?? 20\n}\n\npageSizeSafe(0) // 0",
        caption: "Use `??` when zero, false, or empty string are valid values."
      },
      {
        kind: "pitfall",
        title: "Empty arrays and objects are truthy",
        text: "`if (items)` does not check whether an array has elements. It only checks that the array reference exists.",
        detail: "Use `items.length > 0` when you mean non-empty."
      },
      {
        kind: "bestPractice",
        title: "Name the condition you mean",
        text: "Prefer `count !== undefined`, `name.length > 0`, `items.length > 0`, or `user != null` over generic truthiness when the distinction matters."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Control flow and error handling"
      },
      {
        book: "javascript-info",
        chapter: "Type conversions and conditionals"
      },
      {
        book: "ecmascript-spec",
        chapter: "ToBoolean"
      }
    ],
    related: [
      "coercion-and-equality",
      "unions-and-narrowing",
      "type-guards-and-assertion-functions"
    ]
  },
  {
    id: "objects-and-property-descriptors",
    domainId: "js-runtime",
    title: "Objects & Property Descriptors",
    summary: "JavaScript objects are collections of properties. Each property has a descriptor that defines whether it is a data property or accessor, and whether it is writable, enumerable, and configurable.",
    keyPoints: [
      {
        text: "Objects are not just dictionaries",
        detail: "They have prototypes, inherited properties, descriptors, symbols, accessors, and internal behavior. Use `Map` when you need a clean arbitrary-key dictionary."
      },
      {
        text: "Property lookup checks own properties first, then prototypes",
        detail: "Reading `obj.x` may return an own property or an inherited one. Use `Object.hasOwn(obj, 'x')` when ownership matters."
      },
      {
        text: "Descriptors control property behavior",
        detail: "A data property has `value` and `writable`; an accessor property has `get` and/or `set`. Both can be enumerable and configurable."
      },
      {
        text: "Enumerability affects iteration and serialization",
        detail: "Object.keys, object spread, for...in, and JSON serialization have different rules about own/inherited and enumerable/non-enumerable properties."
      },
      {
        text: "Freezing is shallow",
        detail: "`Object.freeze(obj)` prevents top-level changes, but nested objects are still mutable unless also frozen."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Property descriptor fields",
        headers: [
          "Field",
          "Meaning",
          "Applies to"
        ],
        rows: [
          [
            "value",
            "Stored value",
            "Data property"
          ],
          [
            "writable",
            "Can value be changed?",
            "Data property"
          ],
          [
            "get / set",
            "Accessor functions",
            "Accessor property"
          ],
          [
            "enumerable",
            "Appears in enumeration?",
            "Both"
          ],
          [
            "configurable",
            "Can redefine/delete?",
            "Both"
          ]
        ]
      },
      {
        kind: "code",
        title: "Descriptor-defined property",
        code: "const user = {}\n\nObject.defineProperty(user, \"id\", {\n  value: \"u_123\",\n  writable: false,\n  enumerable: true,\n  configurable: false,\n})\n\nconsole.log(Object.keys(user)) // [\"id\"]",
        caption: "Descriptors explain behavior that normal property syntax hides."
      },
      {
        kind: "pitfall",
        title: "`for...in` walks inherited enumerable keys",
        text: "`for...in` is not the same as Object.keys. It includes enumerable inherited properties, which is often not what you want for plain data processing.",
        detail: "Use `Object.keys`, `Object.entries`, or `Object.hasOwn` when ownership matters."
      },
      {
        kind: "bestPractice",
        title: "Use Map for arbitrary dictionaries",
        text: "When keys are arbitrary values or user-provided strings, `Map` avoids prototype-key surprises and has clearer collection semantics."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Working with objects; enumerability and ownership"
      },
      {
        book: "ecmascript-spec",
        chapter: "Objects and property descriptors"
      },
      {
        book: "javascript-info",
        chapter: "Object properties configuration"
      }
    ],
    related: [
      "prototype-chain-and-inheritance",
      "object-composition",
      "map-set-weakmap-weakset"
    ]
  },
  {
    id: "prototype-chain-and-inheritance",
    domainId: "js-runtime",
    title: "Prototype Chain & Inheritance",
    summary: "JavaScript object inheritance is prototype-based. When a property is not found on an object, lookup continues through the object's prototype chain until the property is found or the chain ends at null.",
    keyPoints: [
      {
        text: "The prototype chain is delegation",
        detail: "Objects delegate missing property lookup to their prototype. This is not copying methods into each instance."
      },
      {
        text: "Class methods live on the prototype",
        detail: "Class syntax is friendlier than constructor functions, but methods are still placed on the prototype and shared by instances."
      },
      {
        text: "`this` is separate from where a method is found",
        detail: "A method can be found on a prototype but called with the receiver object as `this`. Lookup and call binding are different steps."
      },
      {
        text: "`instanceof` checks prototype relationships",
        detail: "It asks whether the constructor's prototype appears in the object's prototype chain."
      },
      {
        text: "Prototype mutation affects all delegating objects",
        detail: "Changing a shared prototype changes behavior for every object that delegates to it."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Prototype lookup",
        code: "flowchart LR\n  Dog[dog object\\nown: name] --> Animal[animal prototype\\nspeak method]\n  Animal --> ObjectProto[Object.prototype]\n  ObjectProto --> Null[null]\n",
        caption: "Property lookup walks right until it finds the property or reaches null."
      },
      {
        kind: "code",
        title: "Delegation example",
        code: "const animal = {\n  speak() {\n    return `${this.name} makes noise`\n  },\n}\n\nconst dog = Object.create(animal)\ndog.name = \"Milo\"\n\ndog.speak() // \"Milo makes noise\"",
        caption: "The method is found on `animal`; `this` is still `dog` because of the call expression."
      },
      {
        kind: "pitfall",
        title: "Mutable prototype state",
        text: "Putting mutable arrays or objects on a prototype shares that value across instances. Instance state belongs on the instance.",
        detail: "Methods on prototypes are great. Mutable data on prototypes is where the haunted furniture starts rattling."
      },
      {
        kind: "bestPractice",
        title: "Use class syntax for ordinary OOP",
        text: "Use `class` when it clarifies construction and methods; use `Object.create` and manual prototype work only when you deliberately need low-level delegation."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Inheritance and the prototype chain"
      },
      {
        book: "ydkjs-yet",
        chapter: "Objects and Classes"
      },
      {
        book: "ecmascript-spec",
        chapter: "Ordinary object internal methods"
      }
    ],
    related: [
      "classes-private-fields-and-methods",
      "this-binding",
      "objects-and-property-descriptors"
    ]
  },
  {
    id: "iteration-and-generators",
    domainId: "js-runtime",
    title: "Iterables, Iterators & Generators",
    summary: "The iterable protocol lets objects define how they are consumed by `for...of`, spread, destructuring, and many collection APIs. Generators provide a compact way to produce custom iterators.",
    keyPoints: [
      {
        text: "An iterable has `Symbol.iterator`",
        detail: "The method returns an iterator object. Arrays, strings, Maps, Sets, and many DOM/Node collections are iterable."
      },
      {
        text: "An iterator has `next()`",
        detail: "`next()` returns objects like `{ value, done }`. Consumers call this repeatedly until `done` is true."
      },
      {
        text: "Generators create iterators with `yield`",
        detail: "A generator function pauses and resumes, making lazy sequences much easier to write."
      },
      {
        text: "Iteration can be lazy",
        detail: "A generator can produce values on demand instead of allocating an entire array up front."
      },
      {
        text: "`for...of` and `for...in` are different",
        detail: "`for...of` consumes iterable values. `for...in` iterates enumerable property keys."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Iteration protocol terms",
        headers: [
          "Term",
          "Shape",
          "Used by"
        ],
        rows: [
          [
            "Iterable",
            "Has Symbol.iterator",
            "for...of, spread, destructuring"
          ],
          [
            "Iterator",
            "Has next()",
            "Protocol consumer"
          ],
          [
            "Generator",
            "function* with yield",
            "Lazy iterator authoring"
          ],
          [
            "Async iterable",
            "Has Symbol.asyncIterator",
            "for await...of"
          ]
        ]
      },
      {
        kind: "code",
        title: "Lazy range",
        code: "function* range(start, end) {\n  for (let i = start; i <= end; i++) {\n    yield i\n  }\n}\n\nconsole.log([...range(1, 3)]) // [1, 2, 3]",
        caption: "The generator yields values one at a time; spreading consumes it into an array."
      },
      {
        kind: "pitfall",
        title: "Using `for...in` for arrays",
        text: "`for...in` gives keys, not values, and includes enumerable inherited keys. Use `for...of`, array methods, or indexed loops for arrays.",
        detail: "This bug is easy to miss because indexes are strings and simple examples appear to work."
      },
      {
        kind: "bestPractice",
        title: "Expose custom collections as iterables",
        text: "If your object represents a sequence, implement `Symbol.iterator` so callers can use normal language tools instead of custom `.toArray()` APIs everywhere."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Iterators and generators"
      },
      {
        book: "ecmascript-spec",
        chapter: "Iterator objects"
      },
      {
        book: "javascript-info",
        chapter: "Generators and iteration"
      }
    ],
    related: [
      "arrays-collections-and-immutability",
      "async-iteration-and-streams",
      "objects-and-property-descriptors"
    ]
  },
  {
    id: "errors-exceptions-and-stack-traces",
    domainId: "js-runtime",
    title: "Errors, Exceptions & Stack Traces",
    summary: "JavaScript can throw any value, but production code should throw Error objects or subclasses so stack traces, names, causes, and handling stay useful.",
    keyPoints: [
      {
        text: "Thrown values interrupt normal control flow",
        detail: "A `throw` exits the current path until caught by a matching try/catch or rejected Promise handling path."
      },
      {
        text: "Throw Error objects, not strings",
        detail: "Error objects carry stack traces and a conventional shape. Strings lose debugging context and make handling inconsistent."
      },
      {
        text: "Use `cause` to preserve lower-level failures",
        detail: "Wrapping errors with `new Error('...', { cause })` adds context without destroying the original failure."
      },
      {
        text: "Async errors flow through Promises",
        detail: "An exception thrown inside an async function becomes a rejected Promise. It must be awaited/caught like any other rejection."
      },
      {
        text: "Domain errors should be distinguishable",
        detail: "Validation, authorization, network, not-found, and conflict errors often need different handling and user messaging."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Custom domain error",
        code: "class ValidationError extends Error {\n  constructor(message, details) {\n    super(message)\n    this.name = \"ValidationError\"\n    this.details = details\n  }\n}\n\ntry {\n  saveUser(input)\n} catch (err) {\n  if (err instanceof ValidationError) {\n    showFieldErrors(err.details)\n  } else {\n    throw err\n  }\n}",
        caption: "A domain-specific error lets callers handle expected failure differently from bugs."
      },
      {
        kind: "table",
        caption: "Error handling choices",
        headers: [
          "Pattern",
          "Use for",
          "Watch out"
        ],
        rows: [
          [
            "throw Error",
            "Exceptional failure",
            "Must be caught at boundary"
          ],
          [
            "Result object",
            "Expected recoverable failure",
            "Callers must check"
          ],
          [
            "Error subclass",
            "Domain-specific handling",
            "Keep inheritance simple"
          ],
          [
            "cause",
            "Wrap lower-level error",
            "Preserve original context"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Catching and swallowing",
        text: "A catch block that logs and continues can convert a clear failure into corrupted state or a misleading success.",
        detail: "Handle, translate, retry, or rethrow. Do not just make the red line disappear."
      },
      {
        kind: "bestPractice",
        title: "Catch at boundaries",
        text: "Catch errors where you can add context, recover, return an HTTP response, show UI feedback, or fail the job. Let lower layers throw meaningful errors upward."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Control flow and error handling; Error objects"
      },
      {
        book: "javascript-info",
        chapter: "Error handling"
      },
      {
        book: "node-docs",
        chapter: "Errors and diagnostics"
      }
    ],
    related: [
      "promises-and-error-handling",
      "async-await",
      "type-safe-api-boundaries"
    ]
  }
]
