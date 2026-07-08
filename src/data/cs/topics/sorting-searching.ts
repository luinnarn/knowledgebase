import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'elementary-sorts',
    domainId: 'sorting-searching',
    title: 'Elementary Sorts',
    summary:
      'Selection, insertion, and bubble sort are all O(n²) — but insertion sort is the one worth actually using: adaptive on nearly-sorted data and the fallback inside every hybrid sort for small partitions.',
    keyPoints: [
      'Selection sort: always O(n²) comparisons, but only O(n) swaps — good when writes are expensive',
      'Insertion sort: O(n) best case on nearly-sorted data; **adaptive** and **stable**',
      'Bubble sort: mostly pedagogical — dominated by insertion sort in every practical dimension',
      'All three are in-place, O(1) extra space, and simple enough to hand-verify',
      'Hybrid library sorts (Timsort, dual-pivot quicksort) fall back to insertion sort below a size threshold (~16–47 elements)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The three elementary sorts',
        headers: ['Sort', 'Comparisons', 'Swaps', 'Stable', 'Adaptive'],
        rows: [
          ['Selection', 'Θ(n²) always', 'O(n)', 'no', 'no'],
          ['Insertion', 'O(n) best, O(n²) worst', 'O(n) best, O(n²) worst', 'yes', 'yes'],
          ['Bubble', 'Θ(n²) typical', 'O(n²)', 'yes', 'yes (with early-exit flag)'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Insertion sort builds the sorted region one element at a time: each new element is slid backward past everything larger than it. On an already-sorted array that inner loop never runs — a single pass confirms order in O(n). That adaptiveness is why it beats [[mergesort]] and [[quicksort]] on small or nearly-sorted inputs, where their O(n log n) overhead (recursion, allocation, cache misses) costs more than it saves.',
      },
      {
        kind: 'code',
        title: 'Insertion sort',
        code: 'static void insertionSort(int[] a) {\n    for (int i = 1; i < a.length; i++) {\n        int key = a[i];\n        int j = i - 1;\n        while (j >= 0 && a[j] > key) {\n            a[j + 1] = a[j];\n            j--;\n        }\n        a[j + 1] = key;\n    }\n}',
      },
      {
        kind: 'note',
        title: 'Why hybrid sorts bottom out into insertion sort',
        text: 'Timsort (Java\'s `Arrays.sort` for objects) and dual-pivot quicksort (`Arrays.sort` for primitives) both switch to insertion sort once a partition shrinks below a small threshold. Below that size, insertion sort\'s low constant factor and excellent cache behavior — no recursive calls, no extra array, sequential access — beat the asymptotically-better algorithms outright. See [[analyzing-algorithms]] for why constants matter at small n.',
      },
      {
        kind: 'pitfall',
        title: '"O(n²) is always bad" is a beginner trap',
        text: 'For n below roughly 50, insertion sort typically outruns mergesort and quicksort despite the worse asymptotic bound — there simply isn\'t enough work for the divide-and-conquer overhead to pay for itself. Asymptotic complexity describes *growth rate*, not performance at any one n.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.1 — Elementary Sorts' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9 — Sorting and Selection' },
    ],
    related: ['mergesort', 'quicksort', 'analyzing-algorithms'],
  },

  {
    id: 'mergesort',
    domainId: 'sorting-searching',
    title: 'Mergesort',
    summary:
      'A divide-and-conquer sort with a guaranteed O(n log n) worst case and stable ordering — the price is an auxiliary array the size of the input, since merging cannot be done in place efficiently.',
    keyPoints: [
      'Split the array in half, sort each half recursively, merge the two sorted halves',
      'Guaranteed O(n log n) worst case — no adversarial input degrades it, unlike [[quicksort]]',
      '**Stable**: equal elements keep their relative order, because merge always takes from the left run on ties',
      'Needs Θ(n) auxiliary space for the merge step — not in-place',
      'Top-down (recursive) and bottom-up (iterative, merging runs of size 1, 2, 4, …) are equivalent in complexity',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Top-down mergesort',
        code: 'static void mergeSort(int[] a, int[] aux, int lo, int hi) {\n    if (hi - lo < 2) return;\n    int mid = lo + (hi - lo) / 2;\n    mergeSort(a, aux, lo, mid);\n    mergeSort(a, aux, mid, hi);\n    merge(a, aux, lo, mid, hi);\n}\n\nstatic void merge(int[] a, int[] aux, int lo, int mid, int hi) {\n    System.arraycopy(a, lo, aux, lo, hi - lo);\n    int i = lo, j = mid;\n    for (int k = lo; k < hi; k++) {\n        if (i >= mid) a[k] = aux[j++];\n        else if (j >= hi) a[k] = aux[i++];\n        else if (aux[j] < aux[i]) a[k] = aux[j++];   // < , not <=, keeps it stable\n        else a[k] = aux[i++];\n    }\n}',
      },
      {
        kind: 'table',
        caption: 'Mergesort vs quicksort vs heapsort',
        headers: ['', 'Mergesort', 'Quicksort', 'Heapsort'],
        rows: [
          ['Worst case', 'O(n log n)', 'O(n²)', 'O(n log n)'],
          ['Extra space', 'O(n)', 'O(log n) stack', 'O(1)'],
          ['Stable', 'yes', 'no', 'no'],
          ['Cache behavior', 'good (sequential merges)', 'excellent', 'poor (heap access pattern)'],
        ],
      },
      {
        kind: 'note',
        title: 'Timsort: mergesort\'s production-grade descendant',
        text: 'Java\'s `Collections.sort` and `Arrays.sort(Object[])` use **Timsort**, a merge sort that first scans for existing ascending/descending runs (real-world data is rarely random), extends short runs with insertion sort, then merges runs with galloping mode to skip ahead when one run is consistently winning. It keeps mergesort\'s stability and worst-case guarantee while exploiting existing order — exactly the adaptiveness elementary sorts have, at scale.',
      },
      {
        kind: 'pitfall',
        title: 'The auxiliary array is not optional',
        text: 'Unlike quicksort\'s in-place partition, merging two sorted runs in place is possible but requires far more comparisons/shifts and loses the O(n log n) guarantee in practice. Real implementations allocate one aux array up front and reuse it across all recursive calls — allocating fresh arrays per merge call, a common mistake, adds needless GC pressure.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.2 — Mergesort' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9.2 — Merge Sort' },
    ],
    related: ['divide-and-conquer', 'quicksort', 'heapsort', 'arrays-and-linked-lists'],
  },

  {
    id: 'quicksort',
    domainId: 'sorting-searching',
    title: 'Quicksort',
    summary:
      'An in-place divide-and-conquer sort with O(n log n) expected time and the smallest constants of any comparison sort in practice — but O(n²) worst case if the pivot is chosen badly and the input is adversarial.',
    keyPoints: [
      'Partition around a pivot: smaller elements left, larger right, then recurse on each side',
      'Expected O(n log n); worst case O(n²) on already-sorted input with a naive fixed pivot',
      'In-place: O(log n) stack space from recursion, no auxiliary array',
      '**Not stable** — partitioning swaps elements past each other regardless of original order',
      'Randomizing the pivot (or using median-of-three) makes the O(n²) worst case cryptographically unlikely rather than adversary-triggerable',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Quicksort with Hoare partitioning',
        code: 'static void quicksort(int[] a, int lo, int hi) {\n    if (hi - lo < 2) return;\n    int p = partition(a, lo, hi);\n    quicksort(a, lo, p + 1);\n    quicksort(a, p + 1, hi);\n}\n\nstatic int partition(int[] a, int lo, int hi) {\n    int pivot = a[lo + ThreadLocalRandom.current().nextInt(hi - lo)];\n    int i = lo - 1, j = hi;\n    while (true) {\n        do { i++; } while (a[i] < pivot);\n        do { j--; } while (a[j] > pivot);\n        if (i >= j) return j;\n        int tmp = a[i]; a[i] = a[j]; a[j] = tmp;\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: 'A fixed pivot turns sorted input into the worst case',
        text: 'Always picking `a[lo]` (or `a[hi-1]`) as the pivot means an already-sorted or reverse-sorted array partitions into a 1-vs-(n-1) split every time — O(n²) total, and an attacker who knows your pivot rule can construct that input on purpose. [[randomization-in-algorithms]] neutralizes this: with a random pivot, no fixed input can force worst-case behavior, only bad luck can, and bad luck is exponentially unlikely.',
      },
      {
        kind: 'table',
        caption: 'Why quicksort usually wins anyway',
        headers: ['Factor', 'Effect'],
        rows: [
          ['In-place partitioning', 'no allocation, excellent cache locality'],
          ['Small constant factor', 'fewer instructions per comparison than mergesort/heapsort'],
          ['Tail-call-friendly recursion', 'recurse into the smaller half first, iterate the larger — bounds stack depth to O(log n)'],
        ],
      },
      {
        kind: 'bestPractice',
        title: 'Use the library sort, not a hand-rolled one',
        text: 'Java\'s `Arrays.sort(int[])` already runs a tuned dual-pivot quicksort with insertion-sort fallback for small arrays; `Arrays.sort(Object[])` and `Collections.sort` run Timsort for stability. Reimplementing quicksort is a learning exercise, not a production decision — the standard library\'s version has been engineered and fuzzed far beyond what a first pass gets right (see the [[order-statistics-selection]] partition reuse, though, which the library can\'t give you directly).',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.3 — Quicksort' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9.3 — Quick Sort' },
      { book: 'crushing-tech-interview', chapter: 'Sorting Algorithms' },
    ],
    related: ['mergesort', 'randomization-in-algorithms', 'divide-and-conquer', 'order-statistics-selection'],
  },

  {
    id: 'heapsort',
    domainId: 'sorting-searching',
    title: 'Heapsort',
    summary:
      'An in-place O(n log n) sort built directly on a binary heap — the only elementary comparison sort with both a guaranteed worst case and O(1) extra space, at the cost of poor cache locality.',
    keyPoints: [
      'Build a max-heap from the array in O(n) (Floyd\'s bottom-up heapify, not n inserts at O(log n))',
      'Repeatedly swap the max to the end and sift-down the reduced heap — n times, O(log n) each',
      'O(n log n) worst case, guaranteed — no adversarial input degrades it',
      'O(1) extra space: the heap lives in the same array being sorted',
      '**Not stable**, and its array-as-tree access pattern jumps around memory — usually slower in practice than quicksort despite the same asymptotic bound',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Heapsort',
        code: 'static void heapSort(int[] a) {\n    int n = a.length;\n    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, i, n);   // build max-heap, O(n)\n    for (int end = n - 1; end > 0; end--) {\n        int tmp = a[0]; a[0] = a[end]; a[end] = tmp;\n        siftDown(a, 0, end);\n    }\n}\n\nstatic void siftDown(int[] a, int i, int size) {\n    while (true) {\n        int left = 2 * i + 1, largest = i;\n        if (left < size && a[left] > a[largest]) largest = left;\n        if (left + 1 < size && a[left + 1] > a[largest]) largest = left + 1;\n        if (largest == i) return;\n        int tmp = a[i]; a[i] = a[largest]; a[largest] = tmp;\n        i = largest;\n    }\n}',
      },
      {
        kind: 'table',
        caption: 'Heapsort vs quicksort vs mergesort',
        headers: ['', 'Heapsort', 'Quicksort', 'Mergesort'],
        rows: [
          ['Worst case', 'O(n log n)', 'O(n²)', 'O(n log n)'],
          ['Extra space', 'O(1)', 'O(log n)', 'O(n)'],
          ['Typical speed', 'slowest of the three', 'fastest', 'middle'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'The cache-locality tax',
        text: 'A heap laid out as an array still behaves like a tree for access purposes: sift-down touches `a[i]`, `a[2i+1]`, `a[2i+2]` — indices that scatter across memory as i grows, unlike quicksort\'s sequential partition scans or mergesort\'s sequential merges. Heapsort\'s clean O(n log n)-worst-case, O(1)-space profile mostly matters when memory is constrained or an adversarial-input guarantee is required (e.g. sorting inside a real-time system), not for everyday use.',
      },
      {
        kind: 'note',
        text: 'Heapsort\'s build-heap phase is where a `PriorityQueue` diverges from an array-based heap in practice: see [[heaps-and-priority-queues]] for the same sift-up/sift-down machinery used as a live, mutable structure rather than a one-shot sort.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.4 — Priority Queues' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9.4 — Heap-Sort' },
    ],
    related: ['heaps-and-priority-queues', 'mergesort', 'quicksort'],
  },

  {
    id: 'linear-time-sorting',
    domainId: 'sorting-searching',
    title: 'Linear-Time Sorting',
    summary:
      'Counting sort, radix sort, and bucket sort beat the Ω(n log n) comparison-sort lower bound by never comparing keys at all — they exploit structure in the keys instead, at the cost of generality.',
    keyPoints: [
      'Every comparison-based sort has an information-theoretic Ω(n log n) lower bound (a decision tree distinguishing n! orderings needs log₂(n!) ≈ n log n comparisons)',
      'Counting sort: O(n + k) for integer keys in a small range [0, k) — tally counts, then place directly',
      'Radix sort: sorts by one digit/byte at a time with a stable sub-sort, O(d·(n + k)) for d digits',
      'Bucket sort: distributes into buckets assuming roughly uniform input, then sorts each bucket',
      'All three trade "works on any comparable type" for "works on this key structure, fast"',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Choosing a linear-time sort',
        headers: ['Sort', 'Complexity', 'Assumes'],
        rows: [
          ['Counting', 'O(n + k)', 'integer keys in a known small range [0, k)'],
          ['Radix (LSD)', 'O(d·(n + k))', 'fixed-width keys (digits, bytes, fixed-length strings)'],
          ['Bucket', 'O(n) expected', 'roughly uniform distribution over the key range'],
        ],
      },
      {
        kind: 'code',
        title: 'Counting sort',
        code: 'static int[] countingSort(int[] a, int maxValue) {\n    int[] counts = new int[maxValue + 1];\n    for (int x : a) counts[x]++;\n    for (int i = 1; i <= maxValue; i++) counts[i] += counts[i - 1];   // prefix sums -> positions\n    int[] out = new int[a.length];\n    for (int i = a.length - 1; i >= 0; i--) {                          // right-to-left keeps it stable\n        out[--counts[a[i]]] = a[i];\n    }\n    return out;\n}',
      },
      {
        kind: 'note',
        title: 'The Ω(n log n) lower bound only binds comparison sorts',
        text: 'The lower bound is proved via a decision tree: any comparison-based algorithm\'s execution can be modeled as a binary tree of comparisons, and distinguishing all n! possible orderings needs a tree with n! leaves, hence depth ≥ log₂(n!) = Θ(n log n). Counting and radix sort sidestep the proof entirely because they never ask "is a[i] < a[j]?" — they compute array positions directly from key values, so the bound simply doesn\'t apply to them.',
      },
      {
        kind: 'pitfall',
        title: 'Counting sort\'s space is O(k), not O(n)',
        text: 'Counting sort over 32-bit integers with no range restriction would need a 4-billion-entry count array — it only pays off when the key range k is close to n. Sorting ages (0–120) or single bytes is a great fit; sorting arbitrary `int` values is not — use radix sort (which processes one byte/digit at a time, bounding the per-pass range) or fall back to [[quicksort]]/[[mergesort]].',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 5.1 — String Sorts (LSD/MSD radix sort)' },
      { book: 'algorithms-notes', chapter: 'Counting Sort, Radix Sort' },
    ],
    related: ['mergesort', 'hash-tables', 'analyzing-algorithms'],
  },

  {
    id: 'binary-search-and-variants',
    domainId: 'sorting-searching',
    title: 'Binary Search & Variants',
    summary:
      'The canonical O(log n) search over sorted, random-access data — and its disguises: first/last occurrence, lower/upper bound, and searching a rotated array.',
    keyPoints: [
      'Requires sorted order and O(1) random access — works on arrays and `List`s backed by arrays, not linked lists',
      'Halves the search space each step: O(log n) comparisons total',
      'Classic bug: `mid = (lo + hi) / 2` overflows for large `lo`/`hi`; use `lo + (hi - lo) / 2`',
      'Lower bound (first index ≥ target) and upper bound (first index > target) are different loop invariants than exact-match search',
      'Java\'s `Arrays.binarySearch`/`Collections.binarySearch` return `-(insertionPoint) - 1` on a miss — a negative encoding, not a plain -1',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Binary search — exact match',
        code: 'static int binarySearch(int[] a, int target) {\n    int lo = 0, hi = a.length - 1;\n    while (lo <= hi) {\n        int mid = lo + (hi - lo) / 2;      // avoids (lo + hi) overflow\n        if (a[mid] == target) return mid;\n        if (a[mid] < target) lo = mid + 1;\n        else hi = mid - 1;\n    }\n    return -1;\n}',
      },
      {
        kind: 'note',
        title: 'The lower-bound template',
        text: 'Most binary-search bugs come from mixing exact-match logic into a bound search. The clean lower-bound (first index where `a[i] >= target`) template keeps a half-open range `[lo, hi)` and always narrows it monotonically: `while (lo < hi) { mid = lo + (hi-lo)/2; if (a[mid] < target) lo = mid + 1; else hi = mid; }` — `lo` (== `hi`) is the answer when the loop ends. The same shape, with `<=` flipped to `>`, gives the upper bound.',
      },
      {
        kind: 'pitfall',
        title: 'Off-by-one bound updates cause infinite loops',
        text: 'Using `hi = mid` in the classic `[lo, hi]`-inclusive exact-match search (instead of `hi = mid - 1`) can loop forever when `lo == mid`. Pick one convention — inclusive `[lo, hi]` or half-open `[lo, hi)` — and keep every bound update consistent with it; mixing the two is the single most common binary-search bug.',
      },
      {
        kind: 'table',
        caption: 'Binary search, disguised',
        headers: ['Problem shape', 'What changes'],
        rows: [
          ['First/last occurrence of a duplicate', 'lower bound / upper bound instead of exact match'],
          ['Search in a rotated sorted array', 'determine which half is sorted, then decide which side to recurse into'],
          ['"Smallest X such that condition(X) holds"', 'binary search over the *answer*, not the array — see [[binary-search-on-answer]]'],
        ],
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 1.1, 3.1 — Binary Search' },
      { book: 'crushing-tech-interview', chapter: 'Binary Search' },
    ],
    related: ['order-statistics-selection', 'binary-search-on-answer', 'arrays-and-linked-lists'],
  },

  {
    id: 'order-statistics-selection',
    domainId: 'sorting-searching',
    title: 'Order Statistics & Selection',
    summary:
      'Finding the k-th smallest element doesn\'t require sorting the whole array — quickselect answers it in expected O(n) by reusing quicksort\'s partition and discarding the half that can\'t contain the answer.',
    keyPoints: [
      'Quickselect: partition like [[quicksort]], then recurse into only the side that contains the k-th index',
      'Expected O(n) — each partition eliminates a constant fraction of the remaining elements, giving a geometric series that sums to O(n), not O(n log n)',
      'Worst case O(n²) with a bad pivot, same failure mode as quicksort — randomization fixes it the same way',
      'Median-of-medians selection guarantees worst-case O(n) but with a large constant factor, so it\'s a theoretical result more than a practical default',
      'For a *stream* or when k is small and fixed, a size-k heap ([[heap-top-k-pattern]]) is simpler and often preferred',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Quickselect for the k-th smallest element',
        code: 'static int quickselect(int[] a, int lo, int hi, int k) {   // k is 0-indexed\n    if (lo == hi) return a[lo];\n    int p = partition(a, lo, hi);   // same partition as quicksort\n    if (k == p) return a[k];\n    if (k < p) return quickselect(a, lo, p - 1, k);\n    return quickselect(a, p + 1, hi, k);\n}',
      },
      {
        kind: 'table',
        caption: 'Finding the k-th smallest: three approaches',
        headers: ['Approach', 'Time', 'When to prefer it'],
        rows: [
          ['Sort then index', 'O(n log n)', 'need the full order anyway, or k varies repeatedly'],
          ['Quickselect', 'O(n) expected, O(n²) worst', 'one-shot query, array fits in memory'],
          ['Size-k heap', 'O(n log k)', 'streaming input, or k ≪ n'],
        ],
      },
      {
        kind: 'note',
        title: 'Median-of-medians: the worst-case-safe version',
        text: 'Median-of-medians picks a pivot guaranteed to discard at least 30% of the array every time, by recursively finding the median of medians of small groups. That guarantees O(n) worst case — but the constant factor (grouping, sorting groups of 5, recursing on medians) makes it slower than randomized quickselect in practice for anything but adversarial-input-safety requirements.',
      },
      {
        kind: 'pitfall',
        title: 'Don\'t sort for a single k-th-element query',
        text: 'Calling `Arrays.sort(a)` and reading `a[k]` costs O(n log n) to answer a question quickselect answers in expected O(n). It\'s the right call only if you need the full sorted order for other reasons, or if you\'ll query multiple different k values against the same array (amortizing the one-time sort).',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.5 — Selection' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9.5 — Selection' },
    ],
    related: ['quicksort', 'heap-top-k-pattern', 'heaps-and-priority-queues'],
  },
]
