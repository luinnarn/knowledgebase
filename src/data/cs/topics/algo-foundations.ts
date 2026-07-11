import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'analyzing-algorithms',
    domainId: 'algo-foundations',
    title: 'Analyzing Algorithms',
    summary:
      'Asymptotic notation — **O**, **Ω**, and **Θ** — describes how running time or memory grows as input size *n* grows, stripped of machine-specific constants. It lets you compare algorithms, not benchmarks.',
    keyPoints: [
      {
        text: '`O(f(n))` is an upper bound on growth; `Ω(f(n))` a lower bound; `Θ(f(n))` means both match — the tight bound',
        detail: 'These three are a family of inequalities, not three different notations for the same idea: `O` says "grows no faster than," `Ω` says "grows no slower than," and only when both hold simultaneously — `Θ` — do you have a bound that is actually tight in both directions. Most casual usage of "O(n)" in conversation actually means the `Θ(n)` claim.',
      },
      {
        text: 'Constants and low-order terms are dropped: `3n² + 100n + 5` is `Θ(n²)`',
        detail: 'This is justified because as *n* grows without bound, the `n²` term eventually dominates both the `100n` term and the constant `5`, regardless of the leading coefficient — the ratio of the full expression to `n²` converges to a constant (3). Dropping them loses information about small-*n* behavior but captures exactly the large-*n* trend the notation is designed to describe.',
      },
      {
        text: 'Worst case is the default lens; average case and best case need to be stated explicitly',
        detail: 'Worst case is the default because it is the only one that gives an unconditional guarantee — it holds no matter what the input turns out to be, which is what most engineering decisions actually need. Average case requires committing to an input distribution (uniformly random? adversarial-but-typical?) that may not match reality, and best case is rarely useful for anything beyond curiosity.',
      },
      {
        text: 'Common orders, cheapest to priciest: `O(1)`, `O(log n)`, `O(n)`, `O(n log n)`, `O(n²)`, `O(2ⁿ)`',
        detail: 'This ladder is worth memorizing because it maps directly onto recognizable algorithm shapes: `O(1)` is a hash lookup, `O(log n)` is binary search or a balanced tree, `O(n)` is a single scan, `O(n log n)` is comparison sorting, `O(n²)` is a nested loop over the same data, and `O(2ⁿ)` is brute-force enumeration of subsets — recognizing which shape a piece of code has is most of the work of estimating its cost.',
      },
      {
        text: 'Define *n* precisely — number of elements, bits, vertices + edges — before quoting a bound',
        detail: 'A bound like `O(n)` is meaningless without agreeing on what *n* counts — an algorithm that is linear in the number of graph vertices can be exponential in the number of bits needed to represent a large numeric input, and vice versa. Ambiguity about *n* is a common source of bounds that sound comparable but are not actually measuring the same thing.',
      },
      {
        text: 'A bound describes a trend for large *n*; it says nothing about which algorithm wins at *n* = 10',
        detail: 'Asymptotic notation deliberately hides constant factors, and for small *n* those hidden constants can dominate — a `Θ(n²)` algorithm with a tiny constant can easily outrun a `Θ(n log n)` algorithm with a large one until *n* grows large enough for the asymptotic trend to take over. This is precisely why insertion sort (quadratic) still wins over mergesort on small arrays in practice, and why many production sorts switch strategies below a size threshold.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Growth rates at n = 1,000,000 (relative operation counts)',
        headers: ['Order', 'Name', 'Operations at n = 10⁶'],
        rows: [
          ['`O(log n)`', 'Logarithmic', '~20'],
          ['`O(n)`', 'Linear', '1,000,000'],
          ['`O(n log n)`', 'Linearithmic', '~20,000,000'],
          ['`O(n²)`', 'Quadratic', '10¹²'],
          ['`O(2ⁿ)`', 'Exponential', 'unfathomable'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Asymptotic analysis counts the dominant operation — comparisons in a sort, array accesses in a scan — as a function of input size, then asks how that count *scales*. It deliberately ignores constant factors and hardware, because those change with every machine and every JIT warm-up; what does not change is that a `Θ(n²)` algorithm will eventually lose to a `Θ(n log n)` one as *n* grows, no matter how well-tuned the constant is.',
      },
      {
        kind: 'code',
        title: 'Counting the dominant operation',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              'static boolean hasDuplicateLinear(int[] a) {           // O(n) extra space, O(n) time\n    Set<Integer> seen = new HashSet<>();\n    for (int x : a) {\n        if (!seen.add(x)) return true;                     // O(1) amortized per check\n    }\n    return false;\n}\n\nstatic boolean hasDuplicateQuadratic(int[] a) {        // O(1) extra space, O(n^2) time\n    for (int i = 0; i < a.length; i++) {\n        for (int j = i + 1; j < a.length; j++) {\n            if (a[i] == a[j]) return true;                 // n*(n-1)/2 comparisons\n        }\n    }\n    return false;\n}',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              'function hasDuplicateLinear(a) {                        // O(n) extra space, O(n) time\n  const seen = new Set()\n  for (const x of a) {\n    if (seen.has(x)) return true\n    seen.add(x)                                          // O(1) amortized per check\n  }\n  return false\n}\n\nfunction hasDuplicateQuadratic(a) {                      // O(1) extra space, O(n^2) time\n  for (let i = 0; i < a.length; i++) {\n    for (let j = i + 1; j < a.length; j++) {\n      if (a[i] === a[j]) return true                     // n*(n-1)/2 comparisons\n    }\n  }\n  return false\n}',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              'function hasDuplicateLinear(a: number[]): boolean {     // O(n) extra space, O(n) time\n  const seen = new Set<number>()\n  for (const x of a) {\n    if (seen.has(x)) return true\n    seen.add(x)                                          // O(1) amortized per check\n  }\n  return false\n}\n\nfunction hasDuplicateQuadratic(a: number[]): boolean {   // O(1) extra space, O(n^2) time\n  for (let i = 0; i < a.length; i++) {\n    for (let j = i + 1; j < a.length; j++) {\n      if (a[i] === a[j]) return true                     // n*(n-1)/2 comparisons\n    }\n  }\n  return false\n}',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              'def has_duplicate_linear(a):                # O(n) extra space, O(n) time\n    seen = set()\n    for x in a:\n        if x in seen:\n            return True\n        seen.add(x)                         # O(1) amortized per check\n    return False\n\n\ndef has_duplicate_quadratic(a):             # O(1) extra space, O(n^2) time\n    for i in range(len(a)):\n        for j in range(i + 1, len(a)):\n            if a[i] == a[j]:\n                return True                 # n*(n-1)/2 comparisons\n    return False',
          },
        ],
        caption: 'Same answer, different growth rate — the space/time trade-off in miniature.',
      },
      {
        kind: 'pitfall',
        title: 'Hidden work inside a "simple" line',
        text: 'A single line can smuggle in linear or worse cost. `String` concatenation in a loop (`result += s`) copies the whole accumulated string every iteration, turning an apparent `O(n)` loop into `O(n²)`; `list.contains(x)` on an `ArrayList` is `O(n)`, so calling it inside another loop is quadratic even though neither loop looks suspicious on its own.',
        code: 'String bad = "";\nfor (String s : words) bad += s;   // O(n^2) — use a StringBuilder instead',
        detail: 'The danger is specifically that each individual line reads as `O(1)` in isolation — a concatenation, a `contains` call — so the quadratic behavior only becomes visible when you account for what that "O(1)-looking" line actually costs when it is really `O(n)` and sits inside another `O(n)` loop. Reading code for asymptotic cost means checking every method call\'s real complexity, not just counting loop nesting.',
      },
      {
        kind: 'note',
        title: 'Θ vs the informal "O" everyone actually means',
        text: 'In casual conversation "O(n)" almost always means Θ(n) — a tight bound, not just an upper one (technically `O(n²)` is also a correct-but-useless upper bound for a linear algorithm). Sedgewick\'s *Algorithms* leans on **tilde notation** (`~cn`) instead, keeping the leading constant so two `Θ(n)` algorithms with very different constants can still be told apart before amortized costs ([[amortized-analysis]]) are folded in.',
        detail: 'Tilde notation is a deliberate departure from the usual constant-dropping convention: `~cn` keeps the leading coefficient visible specifically because two algorithms that are both `Θ(n)` can still differ by a large, practically important constant factor — information plain `Θ` notation throws away by design. It is a middle ground between full asymptotic abstraction and an exact operation count.',
      },
      {
        kind: 'bestPractice',
        title: 'Profile before you optimize',
        text: 'Asymptotic analysis tells you how an algorithm scales, not whether today\'s bottleneck is that algorithm at all. Identify the actual hot path — usually with a profiler, not intuition — before trading a clear `O(n²)` for a harder-to-maintain `O(n log n)` that only matters past a size the program never reaches. See [[interview-problem-solving-method]] for the discipline of establishing correctness before optimizing.',
        detail: 'Asymptotic analysis answers "how does this scale" but says nothing about "is this actually where the time goes" — a program can spend 95% of its wall-clock time in an `O(n)` I/O call and 5% in an `O(n²)` in-memory loop that never runs on inputs large enough to matter. Optimizing the mathematically worse complexity first, without measuring, routinely wastes effort on code that was never the bottleneck.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.4 — Analysis of Algorithms' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4 — Algorithm Analysis' },
    ],
    related: ['recursion-and-recurrences', 'amortized-analysis', 'complexity-classes', 'interview-problem-solving-method'],
  },

  {
    id: 'recursion-and-recurrences',
    domainId: 'algo-foundations',
    title: 'Recursion & Recurrences',
    summary:
      'A recursive algorithm solves a problem by solving smaller instances of itself; a recurrence relation is the equation describing its running time in terms of those smaller instances.',
    keyPoints: [
      {
        text: 'Every recursive method needs a base case that terminates without recursing, and progress toward it on every call',
        detail: 'Both halves are required, not just the base case: a method that has a base case but does not strictly shrink the problem on every recursive call (e.g. recursing on the same value, or the wrong half of a range) can recurse forever despite technically "having" a stopping condition it never actually reaches.',
      },
      {
        text: 'The call stack is real memory: depth *n* recursion uses `O(n)` stack frames and can overflow',
        detail: 'Each recursive call pushes a real stack frame — local variables, the return address, saved registers — onto a fixed-size region of memory, so recursion depth is not a free abstraction the way it might feel while writing it. A recursive algorithm whose depth scales with input size needs the same space-complexity accounting as any other memory usage, and risks `StackOverflowError` on large enough input.',
      },
      {
        text: 'A recurrence like `T(n) = 2T(n/2) + O(n)` describes divide-and-conquer cost; the Master Theorem solves the common shapes directly',
        detail: 'The recurrence directly encodes the algorithm\'s shape: "2T(n/2)" means two recursive calls each on half the input, and "+O(n)" is the work done to split the problem and combine the two results. The Master Theorem is a lookup table for exactly this common family of recurrences, sparing you from re-deriving the closed-form growth rate from scratch every time.',
      },
      {
        text: 'Tail-recursive-looking Java code is **not** optimized away — the JVM keeps every frame, unlike languages with guaranteed tail-call elimination',
        detail: 'In languages that guarantee tail-call elimination, a recursive call in tail position reuses the current stack frame instead of pushing a new one, making deep tail recursion effectively free in stack space. The JVM specification makes no such guarantee — every call, tail-positioned or not, gets its own frame — so code that "looks" tail-recursive still accumulates stack depth exactly like any other recursion in Java.',
      },
      {
        text: 'Memoization turns exponential naive recursion into polynomial time by caching subproblem results ([[dynamic-programming]])',
        detail: 'Naive recursion re-derives the same subproblem\'s answer every time it is reached through a different call path, and when subproblems overlap heavily (as in naive Fibonacci) that repeated work compounds exponentially. Caching each subproblem\'s result the first time it is computed, and returning the cached value on every subsequent request, collapses the total work down to the number of *distinct* subproblems — usually polynomial.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Recursion is a direct translation of an inductive proof into code: establish a base case, assume the recursive call correctly solves a smaller instance, then show how to combine that result into a solution for the current instance ([[correctness-and-invariants]]). The two failure modes are symmetric: no base case (infinite recursion, `StackOverflowError`) and a recursive call that does not shrink the problem (same failure, disguised).',
      },
      {
        kind: 'table',
        caption: 'Master Theorem cheat sheet for T(n) = aT(n/b) + f(n)',
        headers: ['Compare f(n) to n^(log_b a)', 'Result', 'Example'],
        rows: [
          ['f(n) smaller', 'T(n) = Θ(n^(log_b a))', 'T(n) = 8T(n/2) + n² → Θ(n³)'],
          ['f(n) equal', 'T(n) = Θ(n^(log_b a) · log n)', 'T(n) = 2T(n/2) + n → Θ(n log n) (mergesort)'],
          ['f(n) larger', 'T(n) = Θ(f(n))', 'T(n) = T(n/2) + n² → Θ(n²)'],
        ],
      },
      {
        kind: 'code',
        title: 'Naive vs memoized Fibonacci — the recurrence made visible',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              'static long fibNaive(int n) {                 // T(n) = T(n-1) + T(n-2) + O(1) -> Θ(φ^n)\n    if (n <= 1) return n;                      // base case\n    return fibNaive(n - 1) + fibNaive(n - 2);  // two smaller instances\n}\n\nstatic long fibMemo(int n, long[] cache) {    // Θ(n) — each subproblem solved once\n    if (n <= 1) return n;\n    if (cache[n] != 0) return cache[n];\n    return cache[n] = fibMemo(n - 1, cache) + fibMemo(n - 2, cache);\n}',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              'function fibNaive(n) {                         // T(n) = T(n-1) + T(n-2) + O(1) -> Θ(φ^n)\n  if (n <= 1) return n                         // base case\n  return fibNaive(n - 1) + fibNaive(n - 2)     // two smaller instances\n}\n\nfunction fibMemo(n, cache = new Map()) {       // Θ(n) — each subproblem solved once\n  if (n <= 1) return n\n  if (cache.has(n)) return cache.get(n)\n  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)\n  cache.set(n, result)\n  return result\n}',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              'function fibNaive(n: number): number {         // T(n) = T(n-1) + T(n-2) + O(1) -> Θ(φ^n)\n  if (n <= 1) return n                         // base case\n  return fibNaive(n - 1) + fibNaive(n - 2)     // two smaller instances\n}\n\nfunction fibMemo(n: number, cache: Map<number, number> = new Map()): number {  // Θ(n) — each subproblem solved once\n  if (n <= 1) return n\n  if (cache.has(n)) return cache.get(n)!\n  const result = fibMemo(n - 1, cache) + fibMemo(n - 2, cache)\n  cache.set(n, result)\n  return result\n}',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              'def fib_naive(n):                    # T(n) = T(n-1) + T(n-2) + O(1) -> Θ(φ^n)\n    if n <= 1:\n        return n                     # base case\n    return fib_naive(n - 1) + fib_naive(n - 2)   # two smaller instances\n\n\ndef fib_memo(n, cache=None):         # Θ(n) — each subproblem solved once\n    if cache is None:\n        cache = {}\n    if n <= 1:\n        return n\n    if n in cache:\n        return cache[n]\n    cache[n] = fib_memo(n - 1, cache) + fib_memo(n - 2, cache)\n    return cache[n]',
          },
        ],
      },
      {
        kind: 'pitfall',
        title: 'Exponential blowup from re-solving subproblems',
        text: 'Naive recursion that branches into overlapping subproblems — `fib(n-1)` and `fib(n-2)` both eventually recompute `fib(n-3)` — re-derives the same answer exponentially many times. The fix is either memoization (top-down, cache as you recurse) or tabulation (bottom-up, build a table in a loop); both turn `Θ(φⁿ)` into `Θ(n)` here. See [[dynamic-programming]].',
        detail: 'The exponential blowup comes specifically from *overlapping* subproblems — divide-and-conquer recursion (like mergesort) that splits into genuinely disjoint subproblems does not have this issue, because no subproblem is ever solved twice. Recognizing whether subproblems overlap is exactly the test for whether memoization/tabulation will help or whether the recursion was already efficient as written.',
      },
      {
        kind: 'note',
        title: 'No guaranteed tail-call elimination on the JVM',
        text: 'Writing a "tail-recursive" Java method — where the recursive call is the very last operation — does not save stack frames the way it would in Scheme or Scala (with `@tailrec`). Deep tail recursion in Java still risks `StackOverflowError`; converting to an explicit loop with an accumulator, or an explicit stack ([[stacks-and-queues]]), is the reliable fix for genuinely deep recursion.',
        detail: 'An explicit loop with an accumulator variable is doing by hand exactly what a tail-call-eliminating compiler would do automatically — carrying the "running result" forward instead of building up a chain of pending stack frames waiting to combine their results. It is more verbose than the recursive version but uses `O(1)` stack space instead of `O(n)`.',
      },
      {
        kind: 'bestPractice',
        title: 'State the recurrence before you code the recursion',
        text: 'Write `T(n) = ...` on paper first: how many subproblems, how much smaller, how much work to combine. If you cannot state it, you likely cannot argue the algorithm terminates or bound its cost — and the Master Theorem only applies once the recurrence is in its standard form.',
        detail: 'This is a forcing function for design clarity: if you cannot say how many recursive calls there are and how much smaller each subproblem is, you likely have not actually worked out the algorithm\'s structure yet, only a vague idea of "solve it recursively." Writing the recurrence first surfaces that gap before any code is written, when it is cheap to fix.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.3 — Mergesort (recurrence derivation)' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4.3 — Recursion' },
      { book: 'crushing-tech-interview', chapter: 'Recursion Fundamentals' },
    ],
    related: ['analyzing-algorithms', 'divide-and-conquer', 'dynamic-programming', 'backtracking', 'correctness-and-invariants'],
  },

  {
    id: 'amortized-analysis',
    domainId: 'algo-foundations',
    title: 'Amortized Analysis',
    summary:
      'Amortized analysis bounds the *average* cost per operation over a worst-case **sequence** of operations, even when individual operations occasionally cost much more than that average.',
    keyPoints: [
      {
        text: 'A single expensive operation is fine if it is rare enough that cheap operations pay for it over the whole sequence',
        detail: 'The key insight is that amortized analysis looks at *total* cost over a sequence divided by the number of operations, not the cost of any individual operation — an occasional `O(n)` operation is invisible in the average as long as it is followed by enough `O(1)` operations to dilute it back down.',
      },
      {
        text: 'Dynamic array growth (`ArrayList.add`) is `O(1)` amortized: doubling capacity makes resizes exponentially rarer as the array grows',
        detail: 'Because each resize doubles capacity, the array must roughly double in size again before the next resize is needed — resizes happen at sizes 1, 2, 4, 8, 16, geometrically spaced apart. The total copying work across all resizes up to size *n* sums to a geometric series bounded by `O(n)`, which spread evenly across *n* `add` calls gives `O(1)` per call on average.',
      },
      {
        text: 'The **accounting method**: overcharge cheap operations a little, bank the credit, spend it on the rare expensive one',
        detail: 'This is a bookkeeping technique for *proving* an amortized bound, not a runtime mechanism — you assign each operation a fixed "charge" higher than its immediate cost, deposit the surplus as credit, and then show the accumulated credit is always enough to cover the occasional expensive operation without the balance ever going negative.',
      },
      {
        text: 'Amortized bounds are about a sequence starting from empty — a single worst-case call can still be `O(n)`',
        detail: 'Amortized `O(1)` for `add` does not mean every individual call is fast — the one call that triggers a resize is genuinely `O(n)` in that instant. The guarantee is only about the *average* over a full sequence of operations starting from an empty structure, which matters for anyone assuming every single call meets a real-time deadline.',
      },
      {
        text: 'Different from average-case analysis: amortized bounds require no assumption about input distribution, only about the operation sequence',
        detail: 'Average-case analysis needs a probability distribution over inputs and can be defeated by an adversarially chosen input that falls outside the assumed distribution. Amortized analysis makes no such assumption — the `O(1)` amortized bound for `ArrayList.add` holds for literally any sequence of adds, chosen by anyone, with no probabilistic hand-waving involved.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'When an `ArrayList` (see [[arrays-and-linked-lists]]) is full and `add` is called, it allocates a new backing array — typically 1.5–2× the size — and copies every existing element, an `O(n)` operation. Naively this looks like *n* calls to `add` could cost `O(n²)` total. It does not, because resizes happen at sizes 1, 2, 4, 8, 16, ... — geometrically rarer — so the total copying work across *n* inserts is a geometric series summing to `O(n)`, i.e. `O(1)` **amortized** per `add`.',
      },
      {
        kind: 'code',
        title: 'The accounting-method argument, made concrete',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              '// Charge $3 per add(): $1 pays for the insert itself,\n// $2 is banked as credit on the newly-inserted element.\n// When the array of size k doubles to 2k, the resize must copy k elements;\n// those k elements each still hold their $2 credit -> exactly $2k available,\n// covering the O(k) copy with $0 left over. Credit never goes negative,\n// so the $3 flat rate is a valid amortized bound: add() is O(1) amortized.',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              '// Charge $3 per push(): $1 pays for the insert itself,\n// $2 is banked as credit on the newly-inserted element.\n// When the array of size k doubles to 2k, the resize must copy k elements;\n// those k elements each still hold their $2 credit -> exactly $2k available,\n// covering the O(k) copy with $0 left over. Credit never goes negative,\n// so the $3 flat rate is a valid amortized bound: push() is O(1) amortized.',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              '// Charge $3 per push(): $1 pays for the insert itself,\n// $2 is banked as credit on the newly-inserted element.\n// When the array of size k doubles to 2k, the resize must copy k elements;\n// those k elements each still hold their $2 credit -> exactly $2k available,\n// covering the O(k) copy with $0 left over. Credit never goes negative,\n// so the $3 flat rate is a valid amortized bound: push() is O(1) amortized.',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              '# Charge $3 per append(): $1 pays for the insert itself,\n# $2 is banked as credit on the newly-inserted element.\n# When the list of size k doubles to 2k, the resize must copy k elements;\n# those k elements each still hold their $2 credit -> exactly $2k available,\n# covering the O(k) copy with $0 left over. Credit never goes negative,\n# so the $3 flat rate is a valid amortized bound: append() is O(1) amortized.',
          },
        ],
        caption: 'A proof sketch, not runnable — the comments carry the argument.',
      },
      {
        kind: 'table',
        caption: 'Amortized cost of common dynamic-array operations',
        headers: ['Operation', 'Worst single call', 'Amortized over n calls'],
        rows: [
          ['`add` (append)', 'O(n) — on resize', 'O(1)'],
          ['`add(i, e)` (middle)', 'O(n) — shift', 'O(n) (no amortized win — every call shifts)'],
          ['`get(i)` / `set(i, e)`', 'O(1)', 'O(1)'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Growing by a fixed amount instead of a fixed factor',
        text: 'If a dynamic array grew by adding a constant *k* elements each resize instead of multiplying capacity by a constant factor, the number of resizes over *n* inserts becomes `n/k` — linear, not logarithmic — and each resize still costs `O(current size)`, so total cost becomes `Θ(n²)`. Geometric (multiplicative) growth is what makes amortized `O(1)` possible at all; this is why every serious dynamic array implementation doubles (or 1.5×s) rather than adding a fixed chunk.',
        detail: 'The difference between additive and multiplicative growth is the difference between an arithmetic and a geometric series of resize costs — additive growth means resize cost grows linearly with the number of resizes already performed, summing to `Θ(n²)` total, while multiplicative growth means each resize costs roughly as much as all previous resizes combined, summing to only `Θ(n)` total. This is a small implementation choice with a large asymptotic consequence.',
      },
      {
        kind: 'note',
        title: 'Amortized ≠ average case',
        text: 'Average-case analysis assumes a probability distribution over inputs and asks about expected cost — it can be defeated by an adversarial input. Amortized analysis makes no probabilistic assumption at all: it is a worst-case guarantee over any sequence of operations, which is why it is the right tool for justifying `ArrayList`, hash-table resizing ([[hash-tables]]), and the union-find path-compression bound ([[disjoint-sets-union-find]]).',
        detail: 'This distinction matters in practice because an average-case bound can be quietly invalidated by a workload that does not match the assumed distribution, while an amortized bound keeps holding regardless of what sequence of operations actually occurs — which is exactly the stronger guarantee you want before relying on it for a general-purpose library data structure used by unknown callers.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 7.2 — Array-Based Sequences: Amortization' },
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.4 — Amortized Analysis of Resizing Arrays' },
    ],
    related: ['arrays-and-linked-lists', 'hash-tables', 'disjoint-sets-union-find', 'analyzing-algorithms'],
  },

  {
    id: 'abstract-data-types',
    domainId: 'algo-foundations',
    title: 'Abstract Data Types',
    summary:
      'An abstract data type (ADT) is a contract — what operations exist and what they guarantee — decoupled from any specific data structure that implements it. `List`, `Stack`, and `Map` are ADTs; `ArrayList`, `ArrayDeque`, and `HashMap` are implementations.',
    keyPoints: [
      {
        text: 'An ADT specifies *behavior* (operations and their pre/post-conditions), never *how* it is stored',
        detail: 'The definition of a `Stack` — push, pop, peek, LIFO order — says nothing about arrays, linked nodes, or memory layout at all. That silence is deliberate: it is what lets the same contract be satisfied by implementations with completely different internal representations and performance characteristics.',
      },
      {
        text: 'The same ADT can have wildly different implementations with different performance shapes — a `Stack` can sit on an array or a linked list',
        detail: 'Both an array-backed and a linked-node-backed stack satisfy the exact same push/pop/peek contract with the same LIFO ordering guarantee, yet they differ meaningfully in memory locality, per-operation allocation, and cache behavior — the ADT contract is silent on all of that, leaving it entirely to the implementation choice.',
      },
      {
        text: 'Java interfaces (`List`, `Queue`, `Map`) are the language mechanism for expressing an ADT; classes (`ArrayList`, `LinkedList`) are implementations',
        detail: 'This maps the abstract concept directly onto Java syntax: the interface declares the operations (the ADT), and each implementing class provides a concrete strategy for storing the data and executing those operations. The language enforces the separation — code can only call what the interface declares, never anything implementation-specific, unless it explicitly downcasts.',
      },
      {
        text: 'Programming against the ADT, not the implementation, is what lets you swap implementations later without touching callers',
        detail: 'A variable declared as `List<String>` can be reassigned from `ArrayList` to `LinkedList` (or any other `List` implementation) without changing a single line at any call site, because every call site only ever invoked operations the `List` interface guarantees. Declaring it as `ArrayList<String>` instead quietly permits callers to depend on `ArrayList`-specific behavior, closing off that flexibility.',
      },
      {
        text: 'Choosing a data structure is really choosing an ADT first, then an implementation whose performance profile matches the workload',
        detail: 'These are two genuinely different questions best asked in order: "what operations do I need" (which ADT) determines correctness, and only after that is answered does "what are my performance constraints" (which implementation) matter. Skipping straight to picking a concrete class without first identifying the needed operations is how a mismatched implementation — like an `ArrayList` used for frequent middle-insertion — ends up buried in otherwise-reasonable-looking code.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The distinction matters because it separates two different design questions. "What can I do with this collection?" is answered by the ADT — a `Queue` supports enqueue and dequeue, full stop. "How fast is each operation, and what is the memory shape?" is answered by the implementation — a queue backed by a circular array behaves very differently under contention or cache pressure than one backed by linked nodes, even though both satisfy the exact same `Queue` contract.',
      },
      {
        kind: 'table',
        caption: 'ADT vs. representative Java implementations',
        headers: ['ADT', 'Core operations', 'Example implementations'],
        rows: [
          ['Stack', 'push, pop, peek (LIFO)', 'array-backed, `ArrayDeque` used as a stack'],
          ['Queue', 'enqueue, dequeue, peek (FIFO)', 'circular array, singly-linked list'],
          ['Priority Queue', 'insert, extract-min/max', 'binary heap, balanced BST'],
          ['Map', 'put, get, remove by key', 'hash table, balanced BST (sorted map)'],
          ['Set', 'add, contains, remove, no duplicates', 'hash table, balanced BST'],
        ],
      },
      {
        kind: 'code',
        title: 'One ADT, two implementations, identical contract',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              'interface IntStack {                 // the ADT: the contract, nothing about storage\n    void push(int x);\n    int pop();\n    boolean isEmpty();\n}\n\nclass ArrayIntStack implements IntStack {   // implementation A: contiguous array\n    private int[] data = new int[16];\n    private int size = 0;\n    public void push(int x) { data[size++] = x; }   // O(1) amortized\n    public int pop() { return data[--size]; }\n    public boolean isEmpty() { return size == 0; }\n}\n\nclass LinkedIntStack implements IntStack {  // implementation B: linked nodes\n    private Node top;\n    private record Node(int val, Node next) {}\n    public void push(int x) { top = new Node(x, top); }  // O(1) worst case, one allocation\n    public int pop() { int v = top.val(); top = top.next(); return v; }\n    public boolean isEmpty() { return top == null; }\n}',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              '// the ADT: push, pop, isEmpty — enforced only by convention, JS has no interfaces\n\nclass ArrayIntStack {                // implementation A: a dynamic array\n  #data = []\n  push(x) { this.#data.push(x) }             // O(1) amortized\n  pop() { return this.#data.pop() }\n  isEmpty() { return this.#data.length === 0 }\n}\n\nclass LinkedIntStack {               // implementation B: linked nodes\n  #top = null\n  push(x) { this.#top = { val: x, next: this.#top } }   // O(1) worst case, one allocation\n  pop() { const v = this.#top.val; this.#top = this.#top.next; return v }\n  isEmpty() { return this.#top === null }\n}',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              'interface IntStack {                 // the ADT: the contract, nothing about storage\n  push(x: number): void\n  pop(): number\n  isEmpty(): boolean\n}\n\nclass ArrayIntStack implements IntStack {   // implementation A: contiguous array\n  private data: number[] = []\n  push(x: number): void { this.data.push(x) }        // O(1) amortized\n  pop(): number { return this.data.pop()! }\n  isEmpty(): boolean { return this.data.length === 0 }\n}\n\ninterface Node { val: number; next: Node | null }\n\nclass LinkedIntStack implements IntStack {  // implementation B: linked nodes\n  private top: Node | null = null\n  push(x: number): void { this.top = { val: x, next: this.top } }  // O(1) worst case, one allocation\n  pop(): number { const v = this.top!.val; this.top = this.top!.next; return v }\n  isEmpty(): boolean { return this.top === null }\n}',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              'from abc import ABC, abstractmethod\n\n\nclass IntStack(ABC):                 # the ADT: the contract, nothing about storage\n    @abstractmethod\n    def push(self, x): ...\n    @abstractmethod\n    def pop(self): ...\n    @abstractmethod\n    def is_empty(self): ...\n\n\nclass ArrayIntStack(IntStack):       # implementation A: a dynamic array\n    def __init__(self):\n        self._data = []\n\n    def push(self, x):\n        self._data.append(x)          # O(1) amortized\n\n    def pop(self):\n        return self._data.pop()\n\n    def is_empty(self):\n        return len(self._data) == 0\n\n\nclass _Node:\n    __slots__ = ("val", "next")\n\n    def __init__(self, val, next):\n        self.val = val\n        self.next = next\n\n\nclass LinkedIntStack(IntStack):      # implementation B: linked nodes\n    def __init__(self):\n        self._top = None\n\n    def push(self, x):\n        self._top = _Node(x, self._top)   # O(1) worst case, one allocation\n\n    def pop(self):\n        v = self._top.val\n        self._top = self._top.next\n        return v\n\n    def is_empty(self):\n        return self._top is None',
          },
        ],
      },
      {
        kind: 'pitfall',
        title: 'Coding against the implementation, not the ADT',
        text: 'Declaring `ArrayList<String> names = new ArrayList<>()` instead of `List<String> names = new ArrayList<>()` looks harmless until a caller starts depending on `ArrayList`-specific behavior (like index-based `get` being fast) that a future swap to a different `List` would silently break. Program to the ADT\'s interface type — this is the whole idea behind [[collections-overview|the Collections Framework]]\'s interface hierarchy.',
        detail: 'The failure mode is silent by nature: nothing fails to compile when a `List<String>` reassigned from `ArrayList` to `LinkedList` gets a lot slower, only the performance changes — which is exactly the kind of regression that is hard to catch in review and easy to miss until it shows up as a production slowdown.',
      },
      {
        kind: 'bestPractice',
        title: 'Pick the ADT from the operations you need, then the implementation from the performance you need',
        text: 'Ask "do I need order? duplicates? fast lookup by key? fast lookup by position?" first — that selects the ADT. Only then ask about growth patterns, memory locality, and concurrency to select an implementation. Skipping straight to "I\'ll just use an `ArrayList`" without asking the first question is how `O(n)` `contains` calls end up buried in a hot loop.',
        detail: 'Answering the ADT question first (List? Set? Map?) is what surfaces requirements like "no duplicates" or "fast membership check" before any code is written — skip it, and a default reach for `ArrayList` bakes in `O(n)` `contains` semantics that were never actually the requirement, just the path of least resistance at the moment of writing the code.',
      },
    ],
    refs: [
      { book: 'dsa-goodrich', chapter: 'Ch. 1.3 — Introduction to Object-Oriented Design (ADTs)' },
      { book: 'dsa-myers', chapter: 'Ch. 2 — Abstract Data Types' },
    ],
    related: ['arrays-and-linked-lists', 'stacks-and-queues', 'graph-representations'],
  },

  {
    id: 'correctness-and-invariants',
    domainId: 'algo-foundations',
    title: 'Correctness & Invariants',
    summary:
      'An invariant is a property that stays true across every iteration of a loop or every level of a recursion. Proving an algorithm correct almost always means finding the right invariant and showing it holds at the start, is preserved by each step, and implies the answer at the end.',
    keyPoints: [
      {
        text: 'A loop invariant must hold: (1) before the first iteration, (2) if true before an iteration then true after it, (3) at termination in a form that implies correctness',
        detail: 'All three parts are necessary and none is optional: initialization alone just says the starting point is fine, preservation alone says nothing ever breaks the property once true (but never establishes it was true to begin with), and only termination connects the maintained property back to the actual claim you wanted to prove about the finished computation.',
      },
      {
        text: 'This is induction in disguise — the invariant is the inductive hypothesis, the loop step is the inductive step',
        detail: 'Mathematical induction proves a statement for all *n* by proving it for a base case and showing each case implies the next; a loop invariant proof is the exact same structure applied to a running program — the invariant is the statement being inducted on, and each loop iteration is one step of the induction, which is why loop-invariant reasoning feels like second nature to anyone comfortable with induction.',
      },
      {
        text: 'Termination must be argued separately from correctness: a variant (a value that strictly decreases and is bounded) proves the loop ends',
        detail: 'A loop can maintain a perfectly valid invariant forever without ever terminating — invariant preservation says nothing about progress toward the exit condition. A variant closes that gap by identifying a quantity that strictly shrinks every iteration and cannot go below some bound, which is what actually guarantees the loop cannot run forever.',
      },
      {
        text: 'Off-by-one bugs are almost always an invariant that was never stated precisely — "sorted up to index i" vs "sorted up to and including index i" are different invariants',
        detail: 'These two phrasings differ by exactly one index, and that single-index ambiguity is precisely where boundary bugs live — code written against a fuzzy mental model of the invariant tends to get the loop bounds or update step wrong in exactly the way a precisely stated invariant would have prevented, because the precise version makes the exact boundary an explicit, checkable claim.',
      },
      {
        text: 'Recursive correctness proofs mirror loop invariants: base case = initialization, recursive case = preservation, assuming smaller instances are already correct',
        detail: 'This mapping is not a loose analogy — it is the same proof technique wearing different clothes: the recursive case gets to *assume* the recursive call on a smaller instance already produces a correct answer (the inductive hypothesis) and only needs to show how to combine that into a correct answer for the current instance, exactly mirroring how a loop invariant proof assumes the property held before the current iteration.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The classic example is insertion sort: the invariant is "at the start of each outer-loop iteration, `a[0..i-1]` is sorted." Initialization is trivial (a single element is sorted). Preservation is the inner loop: it inserts `a[i]` into the correct position among `a[0..i-1]`, restoring the invariant for `i+1`. Termination: when `i` reaches `a.length`, the invariant says `a[0..n-1]` is sorted — exactly the goal. This is the entire correctness proof, and it is also exactly how you would explain the algorithm to a colleague.',
      },
      {
        kind: 'code',
        title: 'The invariant made visible as a comment at the loop boundary',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              'static void insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        // invariant: a[0..i-1] is sorted\n        int key = a[i];\n        int j = i - 1;\n        while (j >= 0 && a[j] > key) {\n            a[j + 1] = a[j];\n            j--;\n        }\n        a[j + 1] = key;\n        // invariant restored: a[0..i] is sorted\n    }\n    // loop exit: i == a.length, so a[0..n-1] is sorted\n}',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              'function insertionSort(a) {\n  for (let i = 1; i < a.length; i++) {\n    // invariant: a[0..i-1] is sorted\n    const key = a[i]\n    let j = i - 1\n    while (j >= 0 && a[j] > key) {\n      a[j + 1] = a[j]\n      j--\n    }\n    a[j + 1] = key\n    // invariant restored: a[0..i] is sorted\n  }\n  // loop exit: i === a.length, so a[0..n-1] is sorted\n}',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              'function insertionSort(a: number[]): void {\n  for (let i = 1; i < a.length; i++) {\n    // invariant: a[0..i-1] is sorted\n    const key = a[i]\n    let j = i - 1\n    while (j >= 0 && a[j] > key) {\n      a[j + 1] = a[j]\n      j--\n    }\n    a[j + 1] = key\n    // invariant restored: a[0..i] is sorted\n  }\n  // loop exit: i === a.length, so a[0..n-1] is sorted\n}',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              'def insertion_sort(a):\n    for i in range(1, len(a)):\n        # invariant: a[0..i-1] is sorted\n        key = a[i]\n        j = i - 1\n        while j >= 0 and a[j] > key:\n            a[j + 1] = a[j]\n            j -= 1\n        a[j + 1] = key\n        # invariant restored: a[0..i] is sorted\n    # loop exit: i == len(a), so a[0..n-1] is sorted',
          },
        ],
      },
      {
        kind: 'table',
        caption: 'The three-part invariant proof structure',
        headers: ['Step', 'Question answered', 'Insertion-sort example'],
        rows: [
          ['Initialization', 'Is it true before the first iteration?', 'a[0..0] (one element) is trivially sorted'],
          ['Maintenance', 'If true before an iteration, is it true after?', 'Inner loop inserts a[i] into its sorted position'],
          ['Termination', 'Does it imply correctness when the loop ends?', 'i = n ⟹ a[0..n-1] sorted ⟹ done'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'A vague invariant hides an off-by-one bug',
        text: '"The array is mostly sorted by index i" is not an invariant — it is not precise enough to check. Binary search bugs almost always trace back to sloppiness about whether `lo`/`hi` are inclusive or exclusive bounds of the remaining search range; state the invariant as a precise set membership (`answer ∈ a[lo..hi]`) and the loop condition and update falls out mechanically.',
        code: '// imprecise: "somewhere in the middle part"\n// precise:   answer index is in a[lo..hi] inclusive, on every iteration',
        detail: 'A precise invariant is checkable in a way a vague one is not — "somewhere in the middle" gives no way to verify whether a particular update statement preserves it, while "answer ∈ a[lo..hi] inclusive" tells you exactly what `lo`/`hi` must become after each comparison to keep the claim true, which is why the loop update code "falls out mechanically" once the invariant is stated this way.',
      },
      {
        kind: 'note',
        title: 'Termination needs its own argument',
        text: 'Correctness (the invariant holds) and termination (the loop actually ends) are logically independent claims. The standard termination argument exhibits a **variant**: an integer expression that strictly decreases every iteration and is bounded below (usually by 0). For a `while (lo <= hi)` binary search, `hi - lo` is the variant — it strictly shrinks each iteration and cannot go negative, so the loop must end.',
        detail: 'It is entirely possible to write a loop that maintains a correct invariant on every iteration it happens to run, while never actually terminating — invariant preservation is a statement about *if* another iteration happens, not about *whether* one will. The variant is what rules out the infinite-loop case by giving a concrete, boundable measure of progress toward the exit condition.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.1 — Basic Programming Model (loop invariants)' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4.1 — Recursion and Induction' },
    ],
    related: ['recursion-and-recurrences', 'binary-search-and-variants', 'debugging-and-problem-solving'],
  },

  {
    id: 'randomization-in-algorithms',
    domainId: 'algo-foundations',
    title: 'Randomization in Algorithms',
    summary:
      'Introducing randomness deliberately — a random pivot, a random hash seed, a random sample — can turn an algorithm\'s worst case from likely-to-happen into vanishingly-unlikely, trading a guarantee for an *expected* bound that holds regardless of input.',
    keyPoints: [
      {
        text: 'A randomized algorithm\'s running time is a random variable; "expected `O(n log n)`" means averaged over the algorithm\'s own coin flips, not over input distribution',
        detail: 'This is a subtle but crucial distinction from average-case analysis: the expectation here is taken over the algorithm\'s internal random choices for a single *fixed* input, not over a distribution of possible inputs. The same input, run many times, produces a random distribution of running times, and it is that distribution\'s average the "expected" bound describes.',
      },
      {
        text: 'Randomized quicksort with a random pivot has expected `O(n log n)` time on **every** input, because no adversary can target the randomness in advance',
        detail: 'A deterministic pivot rule (always the first element, say) has a *fixed* worst-case input — an adversary who knows the rule can construct it. A random pivot removes that predictability entirely: the badness now depends on private coin flips the adversary cannot see or influence in advance, so there is no longer any single input that reliably triggers the worst case.',
      },
      {
        text: 'Reservoir sampling picks a uniform-random sample of unknown-size streaming data in one pass with `O(k)` memory',
        detail: 'The elegant part is that it works without ever knowing the stream\'s total length in advance — each new element is accepted into the sample with a probability that decreases as more elements are seen, calculated so that by the time the stream ends, every element that has passed through had exactly equal probability of ending up in the final sample.',
      },
      {
        text: 'Randomized algorithms are either Las Vegas (always correct, random running time — randomized quicksort) or Monte Carlo (bounded time, small chance of a wrong answer)',
        detail: 'These represent two different places to put the uncertainty: a Las Vegas algorithm never sacrifices correctness, only predictability of running time, while a Monte Carlo algorithm caps the running time but accepts a small, quantifiable probability of an incorrect answer — which one is appropriate depends entirely on whether your application can tolerate occasional wrong answers in exchange for a hard time bound.',
      },
      {
        text: 'Never use `java.util.Random` for anything security-sensitive; use `SecureRandom` there — this domain is about algorithmic randomness, not cryptographic randomness',
        detail: '`java.util.Random`\'s output is fully predictable from its seed via a public, documented algorithm, which is exactly the property algorithmic randomization exploits (defeating an adversary who cannot see the coin flips) but exactly the property that makes it unsafe for tokens, keys, or anything where an attacker predicting future "random" values would be a security failure — that is what `SecureRandom` exists for instead.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Plain [[quicksort]] with a fixed pivot rule (e.g. always the first element) has an adversarial worst case: already-sorted input drives it to `Θ(n²)`. Picking the pivot **uniformly at random** each call does not change the worst-case input — sorted arrays still exist — but it makes the *probability* of hitting the bad case on any particular random choice vanishingly small, so the **expected** running time is `Θ(n log n)` no matter what the input is. The adversary can no longer choose a bad input, because the badness now depends on the algorithm\'s private coin flips, not on the data.',
      },
      {
        kind: 'code',
        title: 'Reservoir sampling — a uniform random sample from an unknown-length stream',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              'static int reservoirSample(Iterator<Integer> stream, Random rnd) {\n    int reservoir = stream.next();       // first element is the initial sample\n    int i = 1;\n    while (stream.hasNext()) {\n        int x = stream.next();\n        i++;\n        if (rnd.nextInt(i) == 0) {       // replace with probability 1/i\n            reservoir = x;\n        }\n    }\n    return reservoir;                    // every element seen so far had equal probability 1/i\n}',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              'function reservoirSample(stream, randInt) {   // randInt(bound) returns an int in [0, bound)\n  const iterator = stream[Symbol.iterator]()\n  let reservoir = iterator.next().value        // first element is the initial sample\n  let i = 1\n  let next = iterator.next()\n  while (!next.done) {\n    i++\n    if (randInt(i) === 0) {                     // replace with probability 1/i\n      reservoir = next.value\n    }\n    next = iterator.next()\n  }\n  return reservoir                              // every element seen so far had equal probability 1/i\n}',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              'function reservoirSample(stream: Iterable<number>, randInt: (bound: number) => number): number {\n  const iterator = stream[Symbol.iterator]()\n  let reservoir = iterator.next().value!       // first element is the initial sample\n  let i = 1\n  let next = iterator.next()\n  while (!next.done) {\n    i++\n    if (randInt(i) === 0) {                     // replace with probability 1/i\n      reservoir = next.value\n    }\n    next = iterator.next()\n  }\n  return reservoir                              // every element seen so far had equal probability 1/i\n}',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              'import random\n\n\ndef reservoir_sample(stream):\n    iterator = iter(stream)\n    reservoir = next(iterator)          # first element is the initial sample\n    i = 1\n    for x in iterator:\n        i += 1\n        if random.randrange(i) == 0:    # replace with probability 1/i\n            reservoir = x\n    return reservoir                    # every element seen so far had equal probability 1/i',
          },
        ],
        caption: 'One pass, O(1) extra memory for a sample of size 1 — extends to size k by keeping k slots.',
      },
      {
        kind: 'table',
        caption: 'Las Vegas vs. Monte Carlo randomized algorithms',
        headers: ['Kind', 'Correctness', 'Running time', 'Example'],
        rows: [
          ['Las Vegas', 'Always correct', 'Random (expected bound)', 'Randomized quicksort'],
          ['Monte Carlo', 'Correct with high probability', 'Fixed/bounded', 'Miller–Rabin primality test'],
        ],
      },
      {
        kind: 'pitfall',
        title: '"Expected" is not "guaranteed"',
        text: 'An expected `O(n log n)` bound describes the average over the algorithm\'s internal randomness; a specific unlucky run can still be slow (though astronomically improbable for reasonable *n*). For hard real-time guarantees, expected-case analysis is not enough — that calls for an algorithm with a true worst-case bound (e.g. median-of-medians selection instead of randomized quickselect, [[order-statistics-selection]]).',
        detail: 'The gap between "expected" and "guaranteed" matters most exactly where it is least likely to be tested: an application with a hard deadline (real-time control, a latency SLA with a strict cutoff) cannot accept "astronomically unlikely to be slow" as a substitute for "provably never slow," even though the astronomically-unlikely case may never surface in testing or years of production use.',
      },
      {
        kind: 'note',
        title: 'Randomization also defangs hash-flooding attacks',
        text: 'Java\'s `HashMap` uses a randomized hash seed partly to prevent an attacker who knows the hash function from crafting inputs that all collide into one bucket, degrading lookups to `O(n)` ([[hash-tables]]). The same idea — using randomness to neutralize an adversary\'s ability to target a worst case — underlies both randomized quicksort and hash-table seed randomization.',
        detail: 'Without a randomized seed, the hash function is a fixed, publicly known mapping, so an attacker submitting untrusted input (form field names, JSON keys) to a service can precompute a set of strings that all hash to the same bucket, deliberately degrading a hash table from `O(1)` to `O(n)` lookups and creating a denial-of-service vector. Randomizing the seed per JVM instance means the attacker cannot precompute that colliding set in advance.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.3 — Quicksort: Randomization' },
      { book: 'dsa-goodrich', chapter: 'Ch. 4.4 — Randomization Case Study' },
    ],
    related: ['quicksort', 'hash-tables', 'order-statistics-selection'],
  },

  {
    id: 'complexity-classes',
    domainId: 'algo-foundations',
    title: 'Complexity Classes',
    summary:
      '**P** is the class of problems solvable in polynomial time; **NP** is the class whose solutions can be *verified* in polynomial time. Whether P = NP is the central open question of computer science — and in practice, treating a problem as NP-hard changes how you approach it.',
    keyPoints: [
      {
        text: 'P: solvable in polynomial time. NP: a proposed solution can be checked in polynomial time (not necessarily found quickly)',
        detail: 'The asymmetry between "solve" and "check" is the entire point of the definition — for a problem in P, finding and verifying a solution are both fast; for a problem believed to be outside P but inside NP, verification stays fast even though no fast way to find the solution in the first place is known.',
      },
      {
        text: 'Every problem in P is in NP — if you can solve it quickly, you can trivially verify a solution quickly',
        detail: 'This containment is almost definitional: if you already have a polynomial-time algorithm that solves the problem, you can "verify" any proposed solution by simply re-solving it from scratch and comparing — which is itself a polynomial-time verification procedure, satisfying NP\'s requirement trivially.',
      },
      {
        text: 'NP-complete problems are the hardest problems in NP: every NP problem reduces to them in polynomial time',
        detail: '"Reduces to" means any instance of any other NP problem can be transformed, in polynomial time, into an equivalent instance of the NP-complete problem — which is what makes NP-complete problems universal hardness benchmarks: a fast algorithm for even one of them would give a fast algorithm for every problem in NP, via the reduction.',
      },
      {
        text: 'No polynomial-time algorithm is known for any NP-complete problem, and finding one would prove P = NP',
        detail: 'Because every NP problem reduces to any NP-complete problem, a polynomial algorithm for just one NP-complete problem would immediately transfer, via those reductions, into a polynomial algorithm for every problem in NP — collapsing the entire class NP down into P. This is exactly why the P vs NP question can be settled by resolving the status of a single NP-complete problem.',
      },
      {
        text: 'Recognizing a problem is NP-hard is actionable: stop searching for an exact polynomial algorithm, switch to heuristics, approximation, or restricting the input',
        detail: 'This is the practical payoff of complexity theory for working engineers: proving a problem NP-hard does not mean "impossible," it means "redirect effort" — toward heuristics that work well in practice, approximation algorithms with a provable quality bound, or restricting to a special case of the input that happens to be tractable, rather than continuing to search for an exact polynomial algorithm that almost certainly does not exist.',
      },
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The asymmetry between P and NP is the whole story: for a problem like the Traveling Salesman Problem, nobody knows how to *find* a shortest route faster than roughly trying all permutations, but given a candidate route, *checking* that it is under some length budget and visits every city once is trivially fast — sum the edge weights, compare. NP is exactly this class of "easy to check, seemingly hard to solve."',
      },
      {
        kind: 'table',
        caption: 'Where familiar problems sit',
        headers: ['Class', 'Meaning', 'Examples'],
        rows: [
          ['P', 'Solvable in polynomial time', 'Sorting, shortest paths ([[shortest-paths]]), matching'],
          ['NP', 'Solution verifiable in polynomial time', 'Everything in P, plus SAT, TSP decision version, subset sum'],
          ['NP-complete', 'The hardest problems in NP; all of NP reduces to them', '3-SAT, vertex cover, knapsack (decision version)'],
          ['NP-hard', 'At least as hard as NP-complete, not necessarily in NP itself', 'The optimization (not decision) version of TSP'],
        ],
      },
      {
        kind: 'code',
        title: 'Easy to verify, believed hard to solve — subset sum',
        variants: [
          {
            id: 'java',
            label: 'Java',
            language: 'java',
            code:
              '// Given a candidate subset, VERIFYING it sums to the target is O(n): trivially in NP.\nstatic boolean verifySubset(int[] chosen, int target) {\n    int sum = 0;\n    for (int x : chosen) sum += x;\n    return sum == target;\n}\n\n// SOLVING (finding such a subset) has no known polynomial algorithm in general —\n// the brute-force search below is O(2^n), one bit per element for "in / out".\nstatic boolean subsetSumExists(int[] a, int target) {\n    int n = a.length;\n    for (int mask = 0; mask < (1 << n); mask++) {\n        int sum = 0;\n        for (int i = 0; i < n; i++) if ((mask & (1 << i)) != 0) sum += a[i];\n        if (sum == target) return true;\n    }\n    return false;\n}',
          },
          {
            id: 'javascript',
            label: 'JavaScript',
            language: 'javascript',
            code:
              '// Given a candidate subset, VERIFYING it sums to the target is O(n): trivially in NP.\nfunction verifySubset(chosen, target) {\n  let sum = 0\n  for (const x of chosen) sum += x\n  return sum === target\n}\n\n// SOLVING (finding such a subset) has no known polynomial algorithm in general —\n// the brute-force search below is O(2^n), one bit per element for "in / out".\nfunction subsetSumExists(a, target) {\n  const n = a.length\n  for (let mask = 0; mask < (1 << n); mask++) {\n    let sum = 0\n    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += a[i]\n    if (sum === target) return true\n  }\n  return false\n}',
          },
          {
            id: 'typescript',
            label: 'TypeScript',
            language: 'typescript',
            code:
              '// Given a candidate subset, VERIFYING it sums to the target is O(n): trivially in NP.\nfunction verifySubset(chosen: number[], target: number): boolean {\n  let sum = 0\n  for (const x of chosen) sum += x\n  return sum === target\n}\n\n// SOLVING (finding such a subset) has no known polynomial algorithm in general —\n// the brute-force search below is O(2^n), one bit per element for "in / out".\nfunction subsetSumExists(a: number[], target: number): boolean {\n  const n = a.length\n  for (let mask = 0; mask < (1 << n); mask++) {\n    let sum = 0\n    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += a[i]\n    if (sum === target) return true\n  }\n  return false\n}',
          },
          {
            id: 'python',
            label: 'Python',
            language: 'python',
            code:
              '# Given a candidate subset, VERIFYING it sums to the target is O(n): trivially in NP.\ndef verify_subset(chosen, target):\n    return sum(chosen) == target\n\n\n# SOLVING (finding such a subset) has no known polynomial algorithm in general —\n# the brute-force search below is O(2^n), one bit per element for "in / out".\ndef subset_sum_exists(a, target):\n    n = len(a)\n    for mask in range(1 << n):\n        total = sum(a[i] for i in range(n) if mask & (1 << i))\n        if total == target:\n            return True\n    return False',
          },
        ],
      },
      {
        kind: 'pitfall',
        title: '"NP" does not mean "not polynomial"',
        text: 'A common misreading: NP stands for "nondeterministic polynomial time," not "not polynomial." P is a subset of NP (every polynomial-time problem is also polynomial-time verifiable) — the open question is whether that containment is strict. Calling a problem simply "NP" says nothing about its difficulty by itself; the interesting claims are "NP-complete" or "NP-hard."',
        detail: 'The naming is genuinely confusing on first encounter, and the misreading has real consequences: calling an easy, polynomial-time problem "an NP problem" is technically true but misleadingly implies difficulty it does not have, since P is entirely contained within NP — the actual hardness claim only kicks in with "NP-complete" or "NP-hard," which are much stronger and much rarer statements.',
      },
      {
        kind: 'bestPractice',
        title: 'Prove NP-hardness, then stop looking for an exact fast algorithm',
        text: 'If a problem reduces from a known NP-complete problem ([[reductions-and-intractability]]), that is a strong signal to redirect effort: exact exponential/backtracking solutions for small instances ([[backtracking]]), approximation algorithms with a provable ratio, heuristics tuned to the problem\'s structure, or restricting to a tractable special case — rather than continuing to search for a polynomial exact algorithm that almost certainly does not exist.',
        detail: 'This is a genuine engineering decision point, not just theory: an NP-hardness proof tells you with high confidence that continued effort spent searching for an exact polynomial algorithm is very likely wasted, and that effort is better redirected toward the practical options — which one depends on whether the actual instances you face are small (exact search is fine), need a quality guarantee (approximation), or have exploitable structure (specialized heuristics).',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 6.4 — Intractability' },
      { book: 'dsa-goodrich', chapter: 'Ch. 13.4 — NP-Completeness' },
    ],
    related: ['reductions-and-intractability', 'backtracking', 'dynamic-programming', 'analyzing-algorithms'],
  },
]
