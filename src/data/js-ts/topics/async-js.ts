import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "event-loop-microtasks-and-macrotasks",
    domainId: "async-js",
    title: "Event Loop, Microtasks & Macrotasks",
    summary: "JavaScript executes synchronous code on a call stack and uses an event loop to resume queued work later. Promise reactions run as microtasks, which are drained before the next task such as a timer or event callback.",
    keyPoints: [
      {
        text: "JavaScript execution is run-to-completion",
        detail: "Once a synchronous function starts running, no other JavaScript callback interrupts it. Queued work waits until the current stack finishes."
      },
      {
        text: "The call stack must empty before queued work runs",
        detail: "Timers, I/O callbacks, UI events, and Promise callbacks do not jump into the middle of currently running synchronous code."
      },
      {
        text: "Microtasks run before the next task",
        detail: "Promise `.then`, `catch`, `finally`, and `queueMicrotask` callbacks run after the stack clears and before the next timer/event task."
      },
      {
        text: "Long synchronous work blocks everything",
        detail: "A CPU-heavy loop can delay timers, rendering, I/O callbacks, and user input even though the code contains no obvious 'blocking' API."
      },
      {
        text: "Node and browsers have host-specific details",
        detail: "The broad model is shared, but rendering, I/O phases, `process.nextTick`, and host APIs introduce environment-specific behavior."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "One event-loop turn",
        code: "flowchart TD\n  Stack[Run current call stack] --> Empty{Stack empty?}\n  Empty --> Micro[Drain microtask queue]\n  Micro --> Host[Host work / rendering / I/O bookkeeping]\n  Host --> Task[Run next task callback]\n  Task --> Stack\n",
        caption: "Microtasks run after the current stack, before the next task."
      },
      {
        kind: "code",
        title: "Ordering example",
        code: "console.log(\"A\")\n\nsetTimeout(() => console.log(\"timer\"), 0)\n\nPromise.resolve().then(() => console.log(\"promise\"))\n\nconsole.log(\"B\")\n\n// A\n// B\n// promise\n// timer",
        caption: "The Promise reaction is a microtask; the timer callback is a later task."
      },
      {
        kind: "table",
        caption: "Queues and work",
        headers: [
          "Thing",
          "Examples",
          "When it runs"
        ],
        rows: [
          [
            "Call stack",
            "Current synchronous function",
            "Immediately"
          ],
          [
            "Microtask",
            "Promise reactions, queueMicrotask",
            "After stack clears, before next task"
          ],
          [
            "Task",
            "Timers, events, I/O callbacks",
            "One per event-loop turn"
          ],
          [
            "Rendering",
            "Browser paint/layout",
            "Between turns, host-specific"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Microtask starvation",
        text: "A chain that continually schedules more microtasks can delay timers and rendering. Microtasks are powerful, but they are not a free background thread.",
        detail: "If the UI feels frozen, check for long sync work and runaway microtask chains."
      },
      {
        kind: "bestPractice",
        title: "Yield intentionally for heavy work",
        text: "Break CPU-heavy work into chunks, use Web Workers or worker threads where appropriate, and measure responsiveness rather than assuming async syntax makes work non-blocking."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Promises timing and async behavior"
      },
      {
        book: "node-docs",
        chapter: "The Node.js Event Loop"
      },
      {
        book: "javascript-info",
        chapter: "Event loop"
      }
    ],
    related: [
      "promises-and-error-handling",
      "timers-scheduling-and-debouncing",
      "node-runtime-and-evented-io"
    ]
  },
  {
    id: "promises-and-error-handling",
    domainId: "async-js",
    title: "Promises & Error Handling",
    summary: "A Promise represents an eventual fulfillment or rejection. Promise chains propagate returned values and thrown errors, letting async work be composed without nested callbacks.",
    keyPoints: [
      {
        text: "A Promise has a settled outcome",
        detail: "It starts pending, then becomes fulfilled with a value or rejected with a reason. Once settled, it does not change."
      },
      {
        text: "Returning from `then` transforms the chain",
        detail: "A returned value fulfills the next Promise; a returned Promise is adopted; a thrown error rejects the next Promise."
      },
      {
        text: "Errors propagate until caught",
        detail: "A `catch` handles rejections from earlier in the chain. If it throws or returns a rejected Promise, the chain remains rejected."
      },
      {
        text: "Floating promises are invisible work",
        detail: "If you start a Promise and neither return nor await it, the caller cannot know when it finishes or whether it failed."
      },
      {
        text: "Promise errors are not synchronous try/catch unless awaited",
        detail: "A try/catch around a Promise constructor call does not catch future rejections unless the Promise is awaited or chained."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Promise chain propagation",
        code: "flowchart LR\n  P[Promise] --> T[then transform]\n  T -->|return value| F[Fulfilled next]\n  T -->|throw error| R[Rejected next]\n  R --> C[catch]\n  C -->|recover| F2[Fulfilled next]\n  C -->|rethrow| R2[Rejected next]\n",
        caption: "A chain is a pipeline of fulfillment and rejection states."
      },
      {
        kind: "code",
        title: "Propagating useful async errors",
        code: "async function loadUser(id) {\n  try {\n    const res = await fetch(`/api/users/${id}`)\n    if (!res.ok) throw new Error(`HTTP ${res.status}`)\n    return await res.json()\n  } catch (err) {\n    throw new Error(`Failed to load user ${id}`, { cause: err })\n  }\n}",
        caption: "Add context at the boundary, but preserve the original cause."
      },
      {
        kind: "pitfall",
        title: "Forgotten return in a Promise chain",
        text: "If a `.then` callback starts async work but does not return it, the outer chain continues before that work finishes.",
        detail: "This bug often causes tests that pass early, loading spinners that disappear too soon, and errors that surface outside the expected catch."
      },
      {
        kind: "bestPractice",
        title: "Return or await every Promise",
        text: "Enable lint rules like `no-floating-promises` in TypeScript projects. Fire-and-forget work should be rare, named, and internally error-handled."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Promises"
      },
      {
        book: "javascript-info",
        chapter: "Promises, async/await"
      },
      {
        book: "node-docs",
        chapter: "Discover Promises in Node.js"
      }
    ],
    related: [
      "async-await",
      "event-loop-microtasks-and-macrotasks",
      "async-testing"
    ]
  },
  {
    id: "async-await",
    domainId: "async-js",
    title: "async/await",
    summary: "`async` functions always return Promises, and `await` pauses the current async function until a Promise settles while allowing the event loop to continue running other work.",
    keyPoints: [
      {
        text: "`async` wraps return values in Promises",
        detail: "Returning `42` from an async function fulfills the returned Promise with `42`. Throwing rejects it."
      },
      {
        text: "`await` unwraps fulfillment or throws rejection",
        detail: "An awaited rejected Promise behaves like a thrown error at that line, so normal try/catch works inside async functions."
      },
      {
        text: "Await pauses the function, not the whole runtime",
        detail: "Other queued work can run while the async function waits. This is not a blocking sleep."
      },
      {
        text: "Sequential awaits serialize work",
        detail: "If two operations are independent, start them before awaiting both. If one depends on the other, sequential await is correct."
      },
      {
        text: "Top-level await changes module loading",
        detail: "In ESM, top-level await can delay dependent module execution. Use it carefully in shared libraries."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Sequential vs concurrent awaits",
        headers: [
          "Pattern",
          "Behavior",
          "Use when"
        ],
        rows: [
          [
            "await a(); await b();",
            "b starts after a finishes",
            "b depends on a"
          ],
          [
            "const pa = a(); const pb = b(); await Promise.all([pa, pb])",
            "a and b run concurrently",
            "independent work"
          ],
          [
            "for await (...) ",
            "Consumes async sequence",
            "Stream/incremental data"
          ]
        ]
      },
      {
        kind: "code",
        title: "Avoid accidental serialization",
        code: "// Slower if independent:\nconst user = await loadUser(id)\nconst projects = await loadProjects(id)\n\n// Faster if independent:\nconst [user2, projects2] = await Promise.all([\n  loadUser(id),\n  loadProjects(id),\n])",
        caption: "The best async code says which operations depend on which."
      },
      {
        kind: "pitfall",
        title: "`await` in array methods",
        text: "`array.map(async item => ...)` returns an array of Promises, not resolved values. You usually need `await Promise.all(...)` around it.",
        detail: "This one is sneaky because the code reads like a synchronous transformation."
      },
      {
        kind: "bestPractice",
        title: "Make dependency structure visible",
        text: "Group independent work with Promise combinators; keep dependent steps sequential; avoid hiding async operations inside callbacks that nobody awaits."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Async functions"
      },
      {
        book: "javascript-info",
        chapter: "Async/await"
      },
      {
        book: "node-docs",
        chapter: "Asynchronous work"
      }
    ],
    related: [
      "promises-and-error-handling",
      "promise-combinators",
      "fetch-abortcontroller-and-cancellation"
    ]
  },
  {
    id: "promise-combinators",
    domainId: "async-js",
    title: "Promise Combinators",
    summary: "Promise combinators coordinate multiple async operations. `all`, `allSettled`, `race`, and `any` encode different success and failure strategies.",
    keyPoints: [
      {
        text: "`Promise.all` is all-or-fail-fast",
        detail: "It fulfills when every input fulfills and rejects as soon as one input rejects."
      },
      {
        text: "`Promise.allSettled` waits for every outcome",
        detail: "It is useful when you need partial success, full error reporting, cleanup, or batch processing."
      },
      {
        text: "`Promise.race` uses first settled result",
        detail: "It can implement timeouts or choose whichever operation settles first, whether success or failure."
      },
      {
        text: "`Promise.any` uses first fulfillment",
        detail: "It ignores rejections until every input rejects, then rejects with an AggregateError."
      },
      {
        text: "Combinators do not cancel the losers automatically",
        detail: "If you need cancellation after a race or timeout, use AbortController or an API-specific cancellation mechanism."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Promise combinators",
        headers: [
          "Combinator",
          "Fulfillment",
          "Rejection",
          "Good for"
        ],
        rows: [
          [
            "Promise.all",
            "All fulfill",
            "First rejection",
            "Independent required work"
          ],
          [
            "Promise.allSettled",
            "Always after all settle",
            "Never from child rejection",
            "Batch reports"
          ],
          [
            "Promise.race",
            "First settled fulfills",
            "First settled rejects",
            "Timeouts / first response"
          ],
          [
            "Promise.any",
            "First fulfillment",
            "All reject",
            "Fallback mirrors"
          ]
        ]
      },
      {
        kind: "code",
        title: "Partial success with allSettled",
        code: "const results = await Promise.allSettled(urls.map(fetchJson))\n\nconst successes = []\nconst failures = []\n\nfor (const result of results) {\n  if (result.status === \"fulfilled\") successes.push(result.value)\n  else failures.push(result.reason)\n}",
        caption: "Use allSettled when failure of one item should not hide the rest."
      },
      {
        kind: "pitfall",
        title: "Using `Promise.all` for best-effort work",
        text: "If one request fails, `Promise.all` rejects and you lose direct access to later successes unless you catch per item or use allSettled.",
        detail: "The combinator should match the product requirement, not just the shortest code snippet."
      },
      {
        kind: "bestPractice",
        title: "Choose the failure policy first",
        text: "Before writing the combinator, decide: do all tasks need to succeed, can partial success continue, should the fastest result win, or should the first successful fallback win?"
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Promise composition"
      },
      {
        book: "javascript-info",
        chapter: "Promise API"
      },
      {
        book: "node-docs",
        chapter: "Promises in Node.js"
      }
    ],
    related: [
      "async-await",
      "concurrency-limits-and-backpressure",
      "async-testing"
    ]
  },
  {
    id: "fetch-abortcontroller-and-cancellation",
    domainId: "async-js",
    title: "Fetch, AbortController & Cancellation",
    summary: "Fetch returns a Promise for an HTTP response, and AbortController provides a standard cancellation signal for requests and other abort-aware APIs.",
    keyPoints: [
      {
        text: "Fetch resolves for HTTP error statuses",
        detail: "A 404 or 500 is still a successful network response. Check `response.ok` or status explicitly."
      },
      {
        text: "Network failures reject the Promise",
        detail: "DNS failure, CORS failure, aborts, and certain network errors reject. HTTP error responses do not."
      },
      {
        text: "AbortController communicates cancellation",
        detail: "Pass `controller.signal` to fetch or any abort-aware API. Calling `controller.abort()` tells the operation it is no longer needed."
      },
      {
        text: "Cancellation is cleanup, not just optimization",
        detail: "Cancel stale searches, abandoned navigation, component cleanup, job shutdown, and request timeouts to prevent wasted work and stale updates."
      },
      {
        text: "Timeouts are application policy",
        detail: "Fetch does not choose your business timeout for you; combine timers and abort signals deliberately."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Fetch with timeout and status check",
        code: "async function fetchJson(url, timeoutMs = 5000) {\n  const controller = new AbortController()\n  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)\n\n  try {\n    const res = await fetch(url, { signal: controller.signal })\n    if (!res.ok) throw new Error(`HTTP ${res.status}`)\n    return await res.json()\n  } finally {\n    clearTimeout(timeoutId)\n  }\n}",
        caption: "Timeouts should clean up their own timer too."
      },
      {
        kind: "table",
        caption: "Fetch outcomes",
        headers: [
          "Situation",
          "Fetch behavior",
          "Your code should"
        ],
        rows: [
          [
            "2xx response",
            "Promise fulfills",
            "Parse expected body"
          ],
          [
            "404/500 response",
            "Promise fulfills",
            "Check response.ok/status"
          ],
          [
            "Network/CORS failure",
            "Promise rejects",
            "Catch/translate error"
          ],
          [
            "Abort",
            "Promise rejects",
            "Handle cancellation separately"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Stale response overwrites fresh state",
        text: "If request A starts, then request B starts, A can finish last and overwrite B's newer result unless you cancel or check freshness.",
        detail: "This is a classic search box and React effect bug."
      },
      {
        kind: "bestPractice",
        title: "Make cancellation part of the API",
        text: "Accept an AbortSignal in async functions that perform cancellable work. Let callers compose cancellation policies instead of hiding them inside the function."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Fetch API and AbortController"
      },
      {
        book: "javascript-info",
        chapter: "Network requests"
      },
      {
        book: "node-docs",
        chapter: "Fetching data with Node.js"
      }
    ],
    related: [
      "async-await",
      "promises-and-error-handling",
      "async-testing"
    ]
  },
  {
    id: "timers-scheduling-and-debouncing",
    domainId: "async-js",
    title: "Timers, Scheduling & Debouncing",
    summary: "Timers schedule future tasks, but they are not precise clocks. Debouncing and throttling shape frequent events so expensive work runs at a controlled rate.",
    keyPoints: [
      {
        text: "Timer delay is a minimum, not a guarantee",
        detail: "The callback cannot run until the current stack clears and queued microtasks finish. Browsers may also clamp timers."
      },
      {
        text: "Debounce waits for quiet",
        detail: "A debounced function runs after events stop arriving for a delay. This is ideal for search input and resize completion."
      },
      {
        text: "Throttle enforces a maximum rate",
        detail: "A throttled function runs at most once per interval. This is useful for scroll, drag, resize, and telemetry sampling."
      },
      {
        text: "Intervals can overlap conceptually",
        detail: "If the work takes longer than the interval, calls can pile up or drift. Recursive timeout loops often give more control."
      },
      {
        text: "Fake timers make time testable",
        detail: "Testing debounce/retry/timeout logic should not require real sleeping; test frameworks can control scheduled time."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Scheduling patterns",
        headers: [
          "Pattern",
          "Behavior",
          "Best for"
        ],
        rows: [
          [
            "setTimeout",
            "Run once after delay",
            "Timeouts, delayed work"
          ],
          [
            "setInterval",
            "Run repeatedly",
            "Simple polling"
          ],
          [
            "Debounce",
            "Run after quiet period",
            "Search input"
          ],
          [
            "Throttle",
            "Run at most every N ms",
            "Scroll/drag events"
          ],
          [
            "requestAnimationFrame",
            "Before browser paint",
            "Visual updates"
          ]
        ]
      },
      {
        kind: "code",
        title: "Debounce",
        code: "function debounce(fn, delay) {\n  let id\n  return (...args) => {\n    clearTimeout(id)\n    id = setTimeout(() => fn(...args), delay)\n  }\n}\n\nconst search = debounce((query) => fetchResults(query), 300)",
        caption: "Every call resets the timer; only the final quiet-period call runs."
      },
      {
        kind: "pitfall",
        title: "`setTimeout(fn, 0)` is not immediate",
        text: "It schedules a task for a future event-loop turn. Promise microtasks and currently running synchronous code still happen first.",
        detail: "This matters in tests and UI code where ordering assumptions become flaky."
      },
      {
        kind: "bestPractice",
        title: "Prefer named scheduling policies",
        text: "A function named `debouncedSearch` or `pollEveryThirtySeconds` communicates intent better than scattered raw timers."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Timers and scheduling APIs"
      },
      {
        book: "javascript-info",
        chapter: "Scheduling"
      },
      {
        book: "node-docs",
        chapter: "Discover JavaScript Timers"
      }
    ],
    related: [
      "event-loop-microtasks-and-macrotasks",
      "concurrency-limits-and-backpressure",
      "async-testing"
    ]
  },
  {
    id: "concurrency-limits-and-backpressure",
    domainId: "async-js",
    title: "Concurrency Limits & Backpressure",
    summary: "JavaScript can start many async operations, but remote services, memory, CPU, file descriptors, queues, and databases are finite. Concurrency limits and backpressure keep throughput from becoming self-inflicted denial-of-service.",
    keyPoints: [
      {
        text: "Async is not unlimited parallelism",
        detail: "A thousand Promises can be created quickly, but the work behind them still consumes real resources."
      },
      {
        text: "Concurrency limits cap in-flight work",
        detail: "Instead of starting everything at once, keep only N operations running and start the next when one finishes."
      },
      {
        text: "Backpressure lets consumers slow producers",
        detail: "Streams and queues use backpressure to prevent producers from filling memory faster than consumers can process."
      },
      {
        text: "Retries need budgets",
        detail: "Unbounded retry loops amplify outages. Use retry limits, jitter, exponential backoff, and circuit-breaker style protection when appropriate."
      },
      {
        text: "Rate limits are external constraints",
        detail: "APIs may reject bursts even when your local machine is happy. Respect server limits and product-level quotas."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Limited concurrency",
        code: "flowchart LR\n  Queue[Work queue] --> Slot1[Worker slot 1]\n  Queue --> Slot2[Worker slot 2]\n  Queue --> Slot3[Worker slot 3]\n  Slot1 --> Done[Done]\n  Slot2 --> Done\n  Slot3 --> Done\n  Done --> Queue\n",
        caption: "Only a fixed number of tasks are in flight at once."
      },
      {
        kind: "code",
        title: "Simple mapLimit",
        code: "async function mapLimit(items, limit, fn) {\n  const results = []\n  const executing = new Set()\n\n  for (const item of items) {\n    const p = Promise.resolve().then(() => fn(item))\n    results.push(p)\n    executing.add(p.finally(() => executing.delete(p)))\n\n    if (executing.size >= limit) {\n      await Promise.race(executing)\n    }\n  }\n\n  return Promise.all(results)\n}",
        caption: "A small limiter is often better than a surprise stampede."
      },
      {
        kind: "pitfall",
        title: "Retry storms",
        text: "When a service is unhealthy, immediate retries from many clients can multiply traffic and keep it unhealthy.",
        detail: "This is where backoff, jitter, concurrency limits, and circuit breakers earn their keep."
      },
      {
        kind: "bestPractice",
        title: "Set limits where the resource is constrained",
        text: "Limit API calls by remote rate limit, DB work by connection pool, file work by I/O pressure, and CPU work by worker capacity."
      }
    ],
    refs: [
      {
        book: "node-docs",
        chapter: "Concurrency and streams backpressure"
      },
      {
        book: "javascript-info",
        chapter: "Async iteration"
      },
      {
        book: "mdn-js",
        chapter: "Promises"
      }
    ],
    related: [
      "promise-combinators",
      "async-iteration-and-streams",
      "node-runtime-and-evented-io"
    ]
  },
  {
    id: "async-iteration-and-streams",
    domainId: "async-js",
    title: "Async Iteration & Streams",
    summary: "Async iterables represent values that arrive over time, and streams represent chunked data flow with backpressure. They are useful when data is large, incremental, or unbounded.",
    keyPoints: [
      {
        text: "Async iterables are consumed with `for await...of`",
        detail: "Each iteration awaits the next value, making incremental async data feel like a loop."
      },
      {
        text: "Streams process chunks instead of whole payloads",
        detail: "Files, network responses, logs, and generated output can be processed piece by piece."
      },
      {
        text: "Backpressure prevents memory blowups",
        detail: "A well-designed stream pipeline lets slower consumers signal producers to slow down."
      },
      {
        text: "Chunk boundaries are not semantic boundaries",
        detail: "A text chunk may split in the middle of a line, token, or multibyte character depending on encoding and source."
      },
      {
        text: "Collecting everything defeats streaming",
        detail: "If you read the whole stream into an array/string, you lose the memory and latency benefits."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Consume async chunks",
        code: "for await (const chunk of stream) {\n  await processChunk(chunk)\n}",
        caption: "The loop waits for each chunk and can apply backpressure through awaited processing."
      },
      {
        kind: "table",
        caption: "Streaming concepts",
        headers: [
          "Concept",
          "Meaning",
          "Example"
        ],
        rows: [
          [
            "Async iterable",
            "Values arrive over time",
            "for await...of"
          ],
          [
            "Readable stream",
            "Source of chunks",
            "HTTP response body"
          ],
          [
            "Writable stream",
            "Sink for chunks",
            "File upload target"
          ],
          [
            "Transform stream",
            "Chunk-to-chunk processing",
            "Compression / parsing"
          ],
          [
            "Backpressure",
            "Consumer slows producer",
            "Avoid memory growth"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Assuming chunks are complete records",
        text: "A chunk is transport-level data, not necessarily a full line, JSON object, or message. You often need buffering/parsing across chunks.",
        detail: "Streaming bugs love to hide in the boundary between chunks."
      },
      {
        kind: "bestPractice",
        title: "Use streams for size or latency reasons",
        text: "Stream when the data is too large to buffer comfortably, when partial results improve latency, or when producer/consumer speed must be coordinated."
      }
    ],
    refs: [
      {
        book: "mdn-js",
        chapter: "Async iterators"
      },
      {
        book: "node-docs",
        chapter: "Streams and backpressure"
      },
      {
        book: "javascript-info",
        chapter: "Async iterators and generators"
      }
    ],
    related: [
      "iteration-and-generators",
      "concurrency-limits-and-backpressure",
      "node-runtime-and-evented-io"
    ]
  }
]
