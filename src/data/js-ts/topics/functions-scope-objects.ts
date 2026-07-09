import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "lexical-scope-and-closures",
    domainId: "functions-scope-objects",
    title: "Lexical Scope & Closures",
    summary: "JavaScript uses lexical scope: where a function is written determines which variables it can access. A closure is a function retaining access to variables from its outer lexical environment even after that outer function has returned.",
    keyPoints: [
      {
        text: "Scope is based on code location, not caller",
        detail: "A function does not gain access to the caller's local variables just because the caller invokes it. It sees variables from where the function was created."
      },
      {
        text: "A closure captures variables, not snapshots",
        detail: "The closed-over binding stays alive and can be read or updated later. This is why counters and factories work — and why loop/callback bugs can happen."
      },
      {
        text: "Closures are ordinary, not exotic",
        detail: "Every callback that reads an outer variable is using a closure: event handlers, Promise callbacks, array methods, React hooks, factory functions, and middleware."
      },
      {
        text: "Closures can be a clean encapsulation tool",
        detail: "They let you keep state private without a class, module global, or object property."
      },
      {
        text: "Closures can retain memory",
        detail: "If a long-lived function closes over a large object, that object stays reachable. Event listeners, caches, and global registries are common leak paths."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Closure keeps the environment alive",
        code: "flowchart LR\n  Outer[createCounter call] --> Env[count binding]\n  Env --> Fn[returned function]\n  Fn --> Later[called later]\n  Later --> Env\n",
        caption: "The returned function keeps access to the `count` binding after `createCounter` returns."
      },
      {
        kind: "code",
        title: "Private state with a closure",
        code: "function createCounter() {\n  let count = 0\n\n  return {\n    next() {\n      count += 1\n      return count\n    },\n    reset() {\n      count = 0\n    },\n  }\n}\n\nconst counter = createCounter()\ncounter.next() // 1\ncounter.next() // 2",
        caption: "`count` is not reachable except through the returned methods."
      },
      {
        kind: "table",
        caption: "Closure uses",
        headers: [
          "Use",
          "Example",
          "Watch out"
        ],
        rows: [
          [
            "Encapsulation",
            "Factory with private state",
            "Hidden state can still become hard to test"
          ],
          [
            "Callbacks",
            "Event handler reads outer variable",
            "Stale values in long-lived callbacks"
          ],
          [
            "Memoization",
            "Cache closed over by function",
            "Unbounded memory growth"
          ],
          [
            "Configuration",
            "Function factory",
            "Too many layers can obscure flow"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Stale closure",
        text: "A callback may keep using the value it closed over when it was created, while the rest of the program has moved on.",
        detail: "This shows up in UI frameworks, timers, and event listeners. It is not that closures are broken; it is that the callback's lifetime is longer than the value's relevance."
      },
      {
        kind: "bestPractice",
        title: "Match closure lifetime to data lifetime",
        text: "A closure is safest when the data it captures should live as long as the function. For long-lived listeners or caches, add cleanup and avoid capturing giant objects accidentally."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Functions; closures"
      },
      {
        book: "ydkjs-yet",
        chapter: "Scope and Closures"
      },
      {
        book: "eloquent-js",
        chapter: "Functions"
      }
    ],
    related: [
      "functions-as-values",
      "this-binding",
      "memory-references-and-garbage-collection"
    ]
  },
  {
    id: "functions-as-values",
    domainId: "functions-scope-objects",
    title: "Functions as Values",
    summary: "Functions are first-class objects in JavaScript: they can be passed, returned, stored, decorated, bound, and composed. This is the foundation of callbacks, middleware, event handlers, array methods, and functional-style APIs.",
    keyPoints: [
      {
        text: "A function value can move independently from its original name",
        detail: "Assigning a function to a variable, passing it to another function, or returning it does not copy its code. It passes a callable object."
      },
      {
        text: "Higher-order functions take or return functions",
        detail: "Array methods, decorators, dependency injection, middleware, and factories are all higher-order patterns."
      },
      {
        text: "A function can carry a closure",
        detail: "When you pass a function around, it may bring access to variables from where it was created."
      },
      {
        text: "Call signature and object identity are separate ideas",
        detail: "Two functions with the same body are different values. A function can also have properties because functions are objects."
      },
      {
        text: "Detached methods can lose `this`",
        detail: "Passing `obj.method` as a callback passes the function value, not the object-method call expression."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Higher-order function",
        code: "function withTiming(fn) {\n  return async (...args) => {\n    const start = performance.now()\n    try {\n      return await fn(...args)\n    } finally {\n      console.log(`took ${performance.now() - start}ms`)\n    }\n  }\n}\n\nconst timedFetchUser = withTiming(fetchUser)",
        caption: "The wrapper returns a new function that adds behavior around the original one."
      },
      {
        kind: "table",
        caption: "Common function-as-value patterns",
        headers: [
          "Pattern",
          "Shape",
          "Example"
        ],
        rows: [
          [
            "Callback",
            "Pass function to run later",
            "button.addEventListener('click', handler)"
          ],
          [
            "Mapper/filter",
            "Pass transformation/predicate",
            "items.map(fn), items.filter(fn)"
          ],
          [
            "Factory",
            "Return configured function",
            "createValidator(schema)"
          ],
          [
            "Decorator",
            "Wrap another function",
            "withRetry(fetcher)"
          ],
          [
            "Middleware",
            "Chain functions around request",
            "auth → handler → logger"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Callback that nobody awaits",
        text: "If a higher-order API does not expect a Promise, passing an async callback may create unhandled or ignored async work.",
        detail: "This happens with some event APIs, array methods, and custom callback contracts. Know whether the caller uses the return value."
      },
      {
        kind: "bestPractice",
        title: "Document callback contracts",
        text: "A callback API should make it clear whether callbacks are sync or async, whether their return value matters, how errors are handled, and when they are called."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Functions"
      },
      {
        book: "eloquent-js",
        chapter: "Higher-order functions"
      },
      {
        book: "javascript-info",
        chapter: "Advanced working with functions"
      }
    ],
    related: [
      "this-binding",
      "lexical-scope-and-closures",
      "object-composition"
    ]
  },
  {
    id: "this-binding",
    domainId: "functions-scope-objects",
    title: "`this` Binding",
    summary: "`this` in a normal JavaScript function is determined by how the function is called, not where it is written. Arrow functions do not bind their own `this`; they capture it lexically.",
    keyPoints: [
      {
        text: "Call form determines `this`",
        detail: "`obj.method()` sets `this` to `obj`; `fn()` in strict mode has `this` as undefined; `call`, `apply`, and `bind` set it explicitly."
      },
      {
        text: "Method extraction loses the receiver",
        detail: "`const fn = obj.method` detaches the function from the object call expression. Calling `fn()` is no longer the same as `obj.method()`."
      },
      {
        text: "Arrow functions capture lexical `this`",
        detail: "They are great for callbacks that need the surrounding `this`, but wrong for prototype methods that should receive a dynamic receiver."
      },
      {
        text: "`bind` creates a permanently-bound function",
        detail: "It is useful for stable callbacks, but produces a new function value."
      },
      {
        text: "Class methods are not auto-bound",
        detail: "A class method passed as a callback can lose `this` unless bound, wrapped, or written as a field arrow function."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "`this` binding rules",
        headers: [
          "Call form",
          "`this` value"
        ],
        rows: [
          [
            "obj.method()",
            "obj"
          ],
          [
            "fn()",
            "undefined in strict mode"
          ],
          [
            "fn.call(value)",
            "value"
          ],
          [
            "fn.apply(value, args)",
            "value"
          ],
          [
            "fn.bind(value)",
            "permanently value"
          ],
          [
            "arrow function",
            "lexical surrounding this"
          ]
        ]
      },
      {
        kind: "code",
        title: "Detached method bug",
        code: "const user = {\n  name: \"Ana\",\n  greet() {\n    return `Hi ${this.name}`\n  },\n}\n\nconst greet = user.greet\n// greet() fails or returns wrong result because `this` is lost.\n\nconst safeGreet = user.greet.bind(user)\nsafeGreet() // \"Hi Ana\"",
        caption: "The receiver is part of the call expression, not stored inside the function automatically."
      },
      {
        kind: "pitfall",
        title: "Arrow method on a prototype",
        text: "Arrow functions do not have dynamic `this`, so they usually do not belong on prototypes when the method should work with the receiver object.",
        detail: "Arrow functions are excellent for lexical callbacks. They are not a universal replacement for methods."
      },
      {
        kind: "bestPractice",
        title: "Prefer explicit receiver handling",
        text: "For object methods, call through the object or bind once. For callbacks, use arrow wrappers when lexical behavior is intended. Do not rely on readers guessing the call site."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "this; arrow functions"
      },
      {
        book: "javascript-info",
        chapter: "Object methods and this"
      },
      {
        book: "ydkjs-yet",
        chapter: "Objects and Classes"
      }
    ],
    related: [
      "functions-as-values",
      "classes-private-fields-and-methods",
      "prototype-chain-and-inheritance"
    ]
  },
  {
    id: "object-composition",
    domainId: "functions-scope-objects",
    title: "Object Composition",
    summary: "Composition builds behavior by combining smaller capabilities rather than relying on deep inheritance. JavaScript makes composition natural because objects and functions are flexible runtime values.",
    keyPoints: [
      {
        text: "Composition favors small capabilities",
        detail: "Instead of a large base class, combine focused functions, wrappers, services, or objects that each do one thing."
      },
      {
        text: "Decorators wrap behavior without changing the original",
        detail: "A decorator can add logging, caching, retries, metrics, authorization, or validation around another function/object."
      },
      {
        text: "Dependency injection is composition",
        detail: "Passing collaborators in makes behavior replaceable in tests and configurable in production."
      },
      {
        text: "Mixins are composition with sharp edges",
        detail: "Copying methods into objects/classes can create hidden dependencies, name collisions, and unclear initialization."
      },
      {
        text: "Composition is easier to test when boundaries are explicit",
        detail: "If dependencies are passed in, tests can provide fakes without monkey-patching globals."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Composition over deep inheritance",
        code: "flowchart LR\n  Core[Core service] --> Logging[withLogging]\n  Logging --> Retry[withRetry]\n  Retry --> Metrics[withMetrics]\n  Metrics --> App[Application uses composed service]\n",
        caption: "Each wrapper adds one behavior around a smaller core."
      },
      {
        kind: "code",
        title: "Composed service wrapper",
        code: "function withRetry(service, retries = 3) {\n  return {\n    async save(data) {\n      let lastError\n      for (let attempt = 0; attempt < retries; attempt++) {\n        try {\n          return await service.save(data)\n        } catch (err) {\n          lastError = err\n        }\n      }\n      throw lastError\n    },\n  }\n}",
        caption: "The wrapper composes retry behavior without changing the original service."
      },
      {
        kind: "table",
        caption: "Reuse strategies",
        headers: [
          "Strategy",
          "Strength",
          "Weakness"
        ],
        rows: [
          [
            "Class inheritance",
            "Shared API and polymorphism",
            "Can become rigid/deep"
          ],
          [
            "Composition",
            "Flexible behavior assembly",
            "Needs clear boundaries"
          ],
          [
            "Decorator",
            "Wrap behavior locally",
            "Too many wrappers can obscure flow"
          ],
          [
            "Mixin",
            "Reuse method groups",
            "Name collisions and hidden assumptions"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "God mixin",
        text: "A mixin that assumes specific fields, lifecycle order, or other mixins creates an inheritance problem wearing a composition hat.",
        detail: "Composition should reduce coupling. If it hides coupling instead, it is just sneakier inheritance."
      },
      {
        kind: "bestPractice",
        title: "Compose at explicit seams",
        text: "Use function parameters, constructor arguments, factory options, and small interfaces so the dependency graph is visible and testable."
      }
    ],
    refs: [
      {
        book: "javascript-info",
        chapter: "Objects and prototypes"
      },
      {
        book: "ydkjs-yet",
        chapter: "Objects and Classes"
      },
      {
        book: "mdn-js",
        chapter: "Working with objects"
      }
    ],
    related: [
      "prototype-chain-and-inheritance",
      "functions-as-values",
      "classes-private-fields-and-methods"
    ]
  },
  {
    id: "classes-private-fields-and-methods",
    domainId: "functions-scope-objects",
    title: "Classes, Private Fields & Methods",
    summary: "JavaScript classes are syntax over the prototype-based object model, with modern support for private fields and methods enforced by the runtime.",
    keyPoints: [
      {
        text: "Class methods are prototype methods",
        detail: "Methods declared in the class body are stored on the prototype and shared by instances, not recreated per instance."
      },
      {
        text: "Instance fields live on each object",
        detail: "Public and private fields belong to the individual instance. They are initialized as part of construction."
      },
      {
        text: "`#private` fields are runtime-private",
        detail: "They are not just naming convention. Code outside the class body cannot access them."
      },
      {
        text: "Constructors establish invariants",
        detail: "Use the constructor to require valid dependencies and initial state, not to perform unrelated global side effects."
      },
      {
        text: "Classes still use JavaScript `this` rules",
        detail: "Passing a method as a bare callback still loses the receiver unless you bind or wrap it."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Class with runtime-private state",
        code: "class RateLimiter {\n  #remaining\n\n  constructor(limit) {\n    this.#remaining = limit\n  }\n\n  tryConsume() {\n    if (this.#remaining <= 0) return false\n    this.#remaining -= 1\n    return true\n  }\n}\n\nconst limiter = new RateLimiter(2)",
        caption: "`#remaining` is enforced by the language runtime."
      },
      {
        kind: "table",
        caption: "Class pieces",
        headers: [
          "Piece",
          "Where it lives",
          "Notes"
        ],
        rows: [
          [
            "constructor",
            "Called by new",
            "Initialize instance"
          ],
          [
            "method",
            "Prototype",
            "Shared by instances"
          ],
          [
            "public field",
            "Instance",
            "Per-object state"
          ],
          [
            "#private field",
            "Instance, private brand",
            "Runtime enforced"
          ],
          [
            "static method",
            "Constructor function",
            "Class-level helper"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Assuming class means Java-style semantics",
        text: "JavaScript class syntax looks familiar, but inheritance, method binding, fields, prototypes, and runtime privacy have JavaScript-specific behavior.",
        detail: "Do not import expectations from Java/C# wholesale. The furniture looks similar; the screws are different."
      },
      {
        kind: "bestPractice",
        title: "Use classes for identity and invariants",
        text: "A class is a good fit when instances have identity, state, lifecycle, and invariant-preserving methods. For stateless transformations, plain functions are usually simpler."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Using classes"
      },
      {
        book: "ecmascript-spec",
        chapter: "Class definitions"
      },
      {
        book: "javascript-info",
        chapter: "Classes"
      }
    ],
    related: [
      "prototype-chain-and-inheritance",
      "this-binding",
      "objects-and-property-descriptors"
    ]
  },
  {
    id: "arrays-collections-and-immutability",
    domainId: "functions-scope-objects",
    title: "Arrays, Collections & Immutability",
    summary: "Arrays are ordered indexed objects; Maps and Sets provide clearer collection semantics for key-value lookup and uniqueness. Immutable update patterns reduce accidental shared-state bugs.",
    keyPoints: [
      {
        text: "Arrays preserve order and support indexed access",
        detail: "They are ideal for ordered sequences, but not always for arbitrary key-value lookup."
      },
      {
        text: "Objects are records, Maps are collections",
        detail: "Use objects for known property shapes and Maps for dynamic keys or frequent add/remove/lookup operations."
      },
      {
        text: "Sets model uniqueness",
        detail: "A Set is better than an array when membership and uniqueness matter more than order/index operations."
      },
      {
        text: "Immutable updates preserve old references",
        detail: "Instead of mutating an existing object/array, create a new one that shares unchanged data. This helps UI rendering, undo/redo, memoization, and debugging."
      },
      {
        text: "Shallow copies are shallow",
        detail: "Array spread and object spread copy the top level only; nested objects are still shared."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Collection choice",
        headers: [
          "Need",
          "Use",
          "Reason"
        ],
        rows: [
          [
            "Ordered sequence",
            "Array",
            "Indexing and order"
          ],
          [
            "Known object shape",
            "Object",
            "Named properties"
          ],
          [
            "Dynamic key-value collection",
            "Map",
            "Arbitrary keys and clear size/iteration"
          ],
          [
            "Unique values",
            "Set",
            "Membership and dedupe"
          ],
          [
            "Object metadata without preventing GC",
            "WeakMap",
            "Weak object keys"
          ]
        ]
      },
      {
        kind: "code",
        title: "Immutable update by id",
        code: "const nextUsers = users.map((user) =>\n  user.id === changed.id ? { ...user, ...changed } : user\n)\n\nconst usersById = new Map(nextUsers.map((user) => [user.id, user]))",
        caption: "Create a new array and new changed object; reuse unchanged objects."
      },
      {
        kind: "pitfall",
        title: "Shallow clone surprise",
        text: "`const copy = { ...original }` does not clone nested objects. Mutating `copy.settings.theme` can still mutate data shared with `original`.",
        detail: "This is not a spread bug; it is reference semantics."
      },
      {
        kind: "bestPractice",
        title: "Choose collection by operation",
        text: "If you keep writing `array.find(x => x.id === id)` in hot paths, you probably want a Map. If you keep checking membership with `includes`, you probably want a Set."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Indexed collections; keyed collections"
      },
      {
        book: "javascript-info",
        chapter: "Arrays; Map and Set"
      },
      {
        book: "eloquent-js",
        chapter: "Data Structures"
      }
    ],
    related: [
      "values-types-and-primitives",
      "objects-and-property-descriptors",
      "memory-references-and-garbage-collection"
    ]
  },
  {
    id: "memory-references-and-garbage-collection",
    domainId: "functions-scope-objects",
    title: "Memory, References & Garbage Collection",
    summary: "JavaScript automatically frees values that are no longer reachable, but automatic garbage collection does not prevent leaks. A leak is unneeded data that remains reachable.",
    keyPoints: [
      {
        text: "Reachability determines collection",
        detail: "If a value can be reached from roots such as globals, current stack, closures, DOM references, or active timers/listeners, it cannot be collected."
      },
      {
        text: "References make mutation visible",
        detail: "Two variables pointing at the same object see the same mutations. This is both useful and a common source of spooky action at a distance."
      },
      {
        text: "Closures can keep data alive",
        detail: "A long-lived callback can retain the variables it closes over, even if the original function finished long ago."
      },
      {
        text: "Caches need eviction",
        detail: "A Map used as an unbounded cache is a leak with a nicer API. Add size limits, TTLs, lifecycle clearing, or WeakMap where appropriate."
      },
      {
        text: "Event listeners need cleanup",
        detail: "Listeners keep references to callbacks, and callbacks keep references to their closed-over state."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Reachability",
        code: "flowchart LR\n  Root[Global / stack / active listener] --> Fn[callback function]\n  Fn --> Env[closed-over environment]\n  Env --> Big[large object]\n  Lost[unreferenced object] -. no path .-> Root\n",
        caption: "The large object stays alive because a root can still reach it through the callback."
      },
      {
        kind: "code",
        title: "Unbounded cache smell",
        code: "const cache = new Map()\n\nfunction remember(key, value) {\n  cache.set(key, value)\n}\n\n// Unless entries are removed, this grows for the lifetime of the process/page.",
        caption: "A cache without eviction is just a leak with better marketing."
      },
      {
        kind: "table",
        caption: "Common leak sources",
        headers: [
          "Source",
          "Why it leaks",
          "Mitigation"
        ],
        rows: [
          [
            "Global Map cache",
            "Entries never removed",
            "TTL/size limit/clear"
          ],
          [
            "Event listener",
            "Callback retained",
            "remove listener / abort signal"
          ],
          [
            "Timer/interval",
            "Callback retained",
            "clear timeout/interval"
          ],
          [
            "Closure",
            "Captures large object",
            "Capture less / cleanup"
          ],
          [
            "Detached DOM",
            "JS still references node",
            "Release references"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Automatic GC as memory strategy",
        text: "Garbage collection frees unreachable objects. It does not know which reachable objects your product no longer needs.",
        detail: "If your app still has a reference, the runtime assumes you meant it."
      },
      {
        kind: "bestPractice",
        title: "Design ownership and cleanup",
        text: "For long-lived objects, define who owns the reference and when it is released. For caches, define eviction. For listeners and timers, define cleanup."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Memory management"
      },
      {
        book: "javascript-info",
        chapter: "Garbage collection"
      },
      {
        book: "node-docs",
        chapter: "Diagnostics and memory"
      }
    ],
    related: [
      "lexical-scope-and-closures",
      "arrays-collections-and-immutability",
      "node-runtime-and-evented-io"
    ]
  },
  {
    id: "map-set-weakmap-weakset",
    domainId: "functions-scope-objects",
    title: "Map, Set, WeakMap & WeakSet",
    summary: "Map and Set are purpose-built collections for key-value lookup and uniqueness. WeakMap and WeakSet hold object keys weakly, making them useful for metadata that should not prevent garbage collection.",
    keyPoints: [
      {
        text: "Map is better than object for arbitrary key-value collections",
        detail: "Map supports arbitrary key types, reliable size, predictable iteration, and no prototype-key surprises."
      },
      {
        text: "Set models uniqueness and membership",
        detail: "Use Set when checking whether a value exists matters more than ordering or indexing."
      },
      {
        text: "WeakMap keys are weakly held objects",
        detail: "If the only remaining reference to an object is as a WeakMap key, it can still be garbage-collected."
      },
      {
        text: "WeakMap is excellent for private metadata",
        detail: "You can associate metadata with objects you do not own without mutating them or preventing collection."
      },
      {
        text: "Weak collections are not iterable",
        detail: "Because keys can disappear due to garbage collection, WeakMap and WeakSet do not expose iteration or size."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Collection choice",
        headers: [
          "Collection",
          "Keys / values",
          "Iterable?",
          "Best use"
        ],
        rows: [
          [
            "Map",
            "Any key → value",
            "Yes",
            "Dynamic dictionaries and lookup tables"
          ],
          [
            "Set",
            "Unique values",
            "Yes",
            "Membership and deduplication"
          ],
          [
            "WeakMap",
            "Object key → value",
            "No",
            "Object metadata without preventing GC"
          ],
          [
            "WeakSet",
            "Object values",
            "No",
            "Track object membership weakly"
          ]
        ]
      },
      {
        kind: "code",
        title: "Map and Set basics",
        code: "const usersById = new Map(users.map((user) => [user.id, user]))\nconst user = usersById.get(\"u_123\")\n\nconst seen = new Set()\nfor (const item of items) {\n  if (seen.has(item.id)) continue\n  seen.add(item.id)\n  process(item)\n}",
        caption: "Use Map for lookup and Set for membership instead of repeatedly scanning arrays."
      },
      {
        kind: "code",
        title: "WeakMap metadata",
        code: "const metadata = new WeakMap()\n\nfunction attachMetadata(node, info) {\n  metadata.set(node, info)\n}\n\nfunction getMetadata(node) {\n  return metadata.get(node)\n}\n\n// When `node` becomes unreachable elsewhere, WeakMap does not keep it alive.",
        caption: "WeakMap is useful when the object owns the lifetime, not the metadata table."
      },
      {
        kind: "pitfall",
        title: "Using object as a dictionary for arbitrary keys",
        text: "Plain objects have prototypes, string/symbol keys, and descriptor behavior. For arbitrary runtime keys, Map is usually clearer and safer.",
        detail: "Objects are great records. Maps are great collections. Different furniture, fewer splinters."
      },
      {
        kind: "bestPractice",
        title: "Choose by semantics",
        text: "Use objects for known property shapes, Map for dynamic lookup, Set for uniqueness, and WeakMap for metadata tied to object lifetime."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Keyed collections"
      },
      {
        book: "javascript-info",
        chapter: "Map and Set; WeakMap and WeakSet"
      },
      {
        book: "eloquent-js",
        chapter: "Data Structures"
      }
    ],
    related: [
      "arrays-collections-and-immutability",
      "memory-references-and-garbage-collection",
      "objects-and-property-descriptors"
    ]
  }

]
