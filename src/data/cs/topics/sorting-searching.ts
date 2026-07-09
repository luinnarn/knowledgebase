import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'elementary-sorts',
    domainId: 'sorting-searching',
    title: 'Elementary Sorts',
    summary:
      'Selection, insertion, and bubble sort are all O(n²) — but insertion sort is the one worth actually using: adaptive on nearly-sorted data and the fallback inside every hybrid sort for small partitions.',
    keyPoints: [
      {
        text: 'Selection sort: always O(n²) comparisons, but only O(n) swaps — good when writes are expensive',
        detail: 'Selection sort scans the whole unsorted region every pass to find the minimum, so comparisons never drop below O(n²) regardless of input order — but it only ever swaps once per pass, n times total. That makes it a rare good fit when a write is expensive relative to a comparison, e.g. sorting data on flash storage where each write costs real wear.',
      },
      {
        text: 'Insertion sort: O(n) best case on nearly-sorted data; **adaptive** and **stable**',
        detail: 'Adaptive means its running time responds to how sorted the input already is — a fully sorted array costs O(n) because the inner while-loop never fires. Stable means two equal elements never swap past each other, since an element only shifts backward past strictly-larger values, which matters whenever "equal" keys carry different associated data that must preserve order.',
      },
      {
        text: 'Bubble sort: mostly pedagogical — dominated by insertion sort in every practical dimension',
        detail: 'Bubble sort and insertion sort share the same O(n²) worst case and O(n) best case, but bubble sort does far more swaps to achieve the same result (an element migrates one position per pass instead of sliding directly to its resting place), so there is no input on which it beats insertion sort — it survives in curricula for how easy it is to visualize, not for use.',
      },
      {
        text: 'All three are in-place, O(1) extra space, and simple enough to hand-verify',
        detail: 'In-place means the sort rearranges the array using only a constant number of extra variables (an index, a temp value) rather than allocating a second array proportional to the input — a real advantage over [[mergesort]] when memory is tight, even though all three lose on time complexity for large n.',
      },
      {
        text: 'Hybrid library sorts (Timsort, dual-pivot quicksort) fall back to insertion sort below a size threshold (~16–47 elements)',
        detail: 'At small sizes, insertion sort\'s lack of recursion overhead and excellent cache behavior outweigh its worse asymptotic bound — there just isn\'t enough work for [[quicksort]]\'s or [[mergesort]]\'s divide-and-conquer machinery to pay for itself. Production sorts exploit this by switching strategies once a partition shrinks below the threshold instead of recursing all the way down.',
      },
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
        detail: 'This is a deliberate engineering tradeoff baked into every production sort, not an oversight: the crossover threshold (commonly somewhere between 16 and 47 elements depending on the implementation) was tuned empirically by measuring where insertion sort\'s constant-factor advantage stops outweighing quicksort/mergesort\'s better asymptotic growth.',
      },
      {
        kind: 'pitfall',
        title: '"O(n²) is always bad" is a beginner trap',
        text: 'For n below roughly 50, insertion sort typically outruns mergesort and quicksort despite the worse asymptotic bound — there simply isn\'t enough work for the divide-and-conquer overhead to pay for itself. Asymptotic complexity describes *growth rate*, not performance at any one n.',
        detail: 'Big-O notation deliberately drops constant factors and lower-order terms because it describes what happens as n grows without bound — but at small, fixed n those dropped constants are exactly what determines real performance. An O(n²) algorithm with a tiny constant factor can easily beat an O(n log n) algorithm with a larger one until n grows large enough for the asymptotic difference to dominate.',
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
      {
        text: 'Split the array in half, sort each half recursively, merge the two sorted halves',
        detail: 'The recursion bottoms out at single-element (trivially sorted) subarrays, and all the actual work happens in the merge step — combining two already-sorted runs into one sorted run is O(n) per level, and there are O(log n) levels of splitting, which is exactly where the O(n log n) bound comes from.',
      },
      {
        text: 'Guaranteed O(n log n) worst case — no adversarial input degrades it, unlike [[quicksort]]',
        detail: 'The split point is always the midpoint, chosen purely by array position rather than by comparing key values — there is no notion of a "bad pivot" for an adversary to exploit, since the algorithm\'s shape never depends on the data\'s actual ordering the way quicksort\'s partition does.',
      },
      {
        text: '**Stable**: equal elements keep their relative order, because merge always takes from the left run on ties',
        detail: 'The merge step\'s tie-breaking rule is the entire stability guarantee: when the next elements of the left and right run are equal, always taking from the left run first preserves whichever one appeared earlier in the original array. Flip that tie-break to favor the right run and the sort becomes unstable while still producing a correctly-ordered result.',
      },
      {
        text: 'Needs Θ(n) auxiliary space for the merge step — not in-place',
        detail: 'Merging two sorted runs that live in the same array requires somewhere to write the combined result without overwriting values not yet read — an auxiliary array the size of the input provides that scratch space. A true in-place merge exists but is far slower in practice, which is why every production mergesort just pays the O(n) space cost.',
      },
      {
        text: 'Top-down (recursive) and bottom-up (iterative, merging runs of size 1, 2, 4, …) are equivalent in complexity',
        detail: 'Top-down splits first and merges on the way back up the recursion; bottom-up starts by treating every single element as a sorted run of size 1 and repeatedly merges adjacent runs, doubling the run size each pass. Both perform the same O(n log n) total work — bottom-up simply avoids recursion overhead entirely, trading a small constant-factor win for code that is less immediately intuitive to read.',
      },
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
        detail: '"Galloping mode" kicks in when one run keeps winning several merge comparisons in a row — instead of comparing one element at a time, it binary-searches ahead into the losing run to find how many elements the winning run can consume at once. That optimization is what lets Timsort blow past plain mergesort on partially-sorted real-world data, which is extremely common (already-sorted prefixes, reverse-sorted suffixes, a few out-of-place elements).',
      },
      {
        kind: 'pitfall',
        title: 'The auxiliary array is not optional',
        text: 'Unlike quicksort\'s in-place partition, merging two sorted runs in place is possible but requires far more comparisons/shifts and loses the O(n log n) guarantee in practice. Real implementations allocate one aux array up front and reuse it across all recursive calls — allocating fresh arrays per merge call, a common mistake, adds needless GC pressure.',
        detail: 'Allocating a fresh `aux` array inside every recursive call means O(log n) separate allocations per element as the recursion unwinds — each one eligible for garbage collection almost immediately, which is pure overhead. Allocating one array up front at the top level and passing the same reference down through every recursive call turns that into a single allocation for the entire sort.',
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
      {
        text: 'Partition around a pivot: smaller elements left, larger right, then recurse on each side',
        detail: 'Partitioning does the real sorting work — after one pass, the pivot sits at its final resting position with everything smaller to its left and everything larger to its right, so recursion only needs to sort within each side independently. No merge step is needed afterward, unlike mergesort, because partitioning already leaves the array globally ordered relative to the pivot.',
      },
      {
        text: 'Expected O(n log n); worst case O(n²) on already-sorted input with a naive fixed pivot',
        detail: 'A "good" pivot splits the array roughly in half, giving the same O(log n) recursion depth as mergesort; a "bad" pivot (the smallest or largest element) splits it 1-vs-(n-1), giving O(n) recursion depth instead. Expected O(n log n) assumes pivots are good on average — worst case is what happens when every single pivot is bad, which is exactly what a naive fixed-position pivot risks on already-sorted input.',
      },
      {
        text: 'In-place: O(log n) stack space from recursion, no auxiliary array',
        detail: 'Partitioning rearranges elements within the original array using index swaps, so the only extra memory is the call stack itself — and recursing into the smaller half first bounds that stack depth to O(log n) even in cases that would otherwise risk deeper recursion, since the smaller half can\'t exceed half the remaining elements.',
      },
      {
        text: '**Not stable** — partitioning swaps elements past each other regardless of original order',
        detail: 'The partition step swaps elements purely based on their value relative to the pivot, with no memory of original position — two equal elements can easily end up swapped past each other during partitioning, which is the opposite of mergesort\'s carefully tie-broken merge step.',
      },
      {
        text: 'Randomizing the pivot (or using median-of-three) makes the O(n²) worst case cryptographically unlikely rather than adversary-triggerable',
        detail: 'A fixed pivot rule means an adversary who knows the rule can always construct an input that triggers it — but a *randomly* chosen pivot means the adversary would have to predict the random choice itself to construct a bad case, which they cannot do. The worst case still technically exists, it just becomes vanishingly unlikely rather than something a specific input can force.',
      },
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
        detail: 'This is not a hypothetical: sorted or nearly-sorted input is extremely common in real systems (re-sorting already-sorted data, sorting a mostly-appended log), so a fixed first/last-element pivot rule hits its worst case far more often than "adversarial" suggests — it degrades on ordinary, benign input, not just on inputs specifically crafted to attack it.',
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
        detail: 'The library implementations differ by array type for a real reason: primitive arrays have no object identity to preserve, so an unstable but faster dual-pivot quicksort is the right default; object arrays often hold records where equal keys should keep their relative order, so Timsort\'s stability guarantee matters there in a way it cannot for `int[]`.',
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
      {
        text: 'Build a max-heap from the array in O(n) (Floyd\'s bottom-up heapify, not n inserts at O(log n))',
        detail: 'Inserting n elements one at a time into an empty heap costs O(n log n) total, since each insert can sift up O(log n) levels. Floyd\'s bottom-up method instead starts from the middle of the array and sifts *down* from every internal node toward the leaves — most nodes processed this way are near the bottom of the tree and sift down only a short distance, which sums to O(n) overall, not O(n log n).',
      },
      {
        text: 'Repeatedly swap the max to the end and sift-down the reduced heap — n times, O(log n) each',
        detail: 'Each swap places the current maximum in its final sorted position at the end of the shrinking heap region, then sift-down restores the heap property over the one remaining out-of-place element (the one just swapped to the root) — a single O(log n) operation, repeated n times for a total O(n log n) selection phase.',
      },
      {
        text: 'O(n log n) worst case, guaranteed — no adversarial input degrades it',
        detail: 'Unlike quicksort\'s partition, sift-down\'s cost depends only on the heap\'s current size and shape (both fully determined by n), never on the relative order of the values being compared — there is no input arrangement that can make any sift-down take longer than O(log n), so the O(n log n) bound holds unconditionally.',
      },
      {
        text: 'O(1) extra space: the heap lives in the same array being sorted',
        detail: 'A binary heap has a well-known array encoding — a node at index i has children at 2i+1 and 2i+2 — so no separate tree structure with pointers is ever needed; the same array being sorted doubles as the heap\'s storage throughout, which is what gives heapsort its O(1) space guarantee that neither quicksort nor mergesort can match simultaneously with a worst-case time guarantee.',
      },
      {
        text: '**Not stable**, and its array-as-tree access pattern jumps around memory — usually slower in practice than quicksort despite the same asymptotic bound',
        detail: 'Sift-down compares and swaps elements based purely on heap-order value, with no tracking of original position, so equal elements can end up reordered — the same instability source as quicksort\'s partition. The bigger practical cost is cache behavior: index 2i+1 and 2i+2 land far apart in memory for large i, unlike the sequential scans quicksort\'s partition and mergesort\'s merge both perform.',
      },
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
        detail: 'Modern CPUs fetch memory in cache-line-sized chunks and predict sequential access patterns well — quicksort\'s and mergesort\'s scans exploit that heavily, while heapsort\'s parent-to-child index jumps defeat both the cache and the prefetcher on every comparison. That is why heapsort loses in wall-clock time to algorithms with the *same or worse* asymptotic bound, purely on constant-factor hardware behavior.',
      },
      {
        kind: 'note',
        text: 'Heapsort\'s build-heap phase is where a `PriorityQueue` diverges from an array-based heap in practice: see [[heaps-and-priority-queues]] for the same sift-up/sift-down machinery used as a live, mutable structure rather than a one-shot sort.',
        detail: 'A `PriorityQueue` needs to support ongoing inserts and removals interleaved over the structure\'s lifetime, so it sifts up on every `add` and sifts down on every `poll` individually — it never gets the O(n) bulk-heapify advantage heapsort\'s one-shot build phase does, because there is no fixed initial array to heapify all at once.',
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
      {
        text: 'Every comparison-based sort has an information-theoretic Ω(n log n) lower bound (a decision tree distinguishing n! orderings needs log₂(n!) ≈ n log n comparisons)',
        detail: 'The argument is purely combinatorial, not about any specific algorithm: there are n! possible orderings of n elements, and each comparison in the algorithm can only ever split the remaining possibilities roughly in half — so distinguishing all n! outcomes needs at least log₂(n!) comparisons in the worst case, which works out to Θ(n log n) by Stirling\'s approximation.',
      },
      {
        text: 'Counting sort: O(n + k) for integer keys in a small range [0, k) — tally counts, then place directly',
        detail: 'Because keys are integers in a known small range, counting sort can compute each element\'s final position directly from a running count of smaller keys, with zero comparisons between elements — it asks "how many keys are less than this one?" rather than "is this key less than that one?", which is precisely the trick that sidesteps the comparison-sort lower bound.',
      },
      {
        text: 'Radix sort: sorts by one digit/byte at a time with a stable sub-sort, O(d·(n + k)) for d digits',
        detail: 'Sorting least-significant-digit first and using a *stable* sub-sort at each pass is what makes this work: after sorting by the last digit, then the second-to-last, stability guarantees that ties from the previous pass stay in their already-correctly-sorted relative order, so by the time the most significant digit is processed the whole key is correctly ordered.',
      },
      {
        text: 'Bucket sort: distributes into buckets assuming roughly uniform input, then sorts each bucket',
        detail: 'If keys are roughly uniformly distributed over a known range, mapping each one to a bucket by its approximate value scatters them into small, roughly-equal-sized groups — sorting each small bucket (with any sort, even a comparison sort) is fast, and the expected O(n) total time only holds because uniformity keeps any single bucket from growing large.',
      },
      {
        text: 'All three trade "works on any comparable type" for "works on this key structure, fast"',
        detail: 'A comparison sort only needs a `compareTo`/`Comparator` and works on anything orderable — strings, custom objects, anything. Counting/radix/bucket sort all require the keys to have specific exploitable structure (a small integer range, fixed-width digits, a known distribution), so the speed gain is paid for with a hard requirement that does not hold for arbitrary comparable types.',
      },
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
        detail: 'This is a common source of confusion: it can look like counting sort "beats" the lower bound, but it doesn\'t — the proof only constrains algorithms whose only source of information about the input is pairwise comparisons. Counting sort extracts *more* information per key (its actual integer value, usable as a direct array index), which is a strictly stronger assumption the proof never covers.',
      },
      {
        kind: 'pitfall',
        title: 'Counting sort\'s space is O(k), not O(n)',
        text: 'Counting sort over 32-bit integers with no range restriction would need a 4-billion-entry count array — it only pays off when the key range k is close to n. Sorting ages (0–120) or single bytes is a great fit; sorting arbitrary `int` values is not — use radix sort (which processes one byte/digit at a time, bounding the per-pass range) or fall back to [[quicksort]]/[[mergesort]].',
        detail: 'Radix sort can be understood as counting sort applied repeatedly to a bounded slice of the key (one byte or digit) instead of the whole thing — each pass only ever needs a count array sized to that slice\'s range (256 for a byte), sidestepping the huge-k problem entirely at the cost of needing multiple passes, one per digit/byte of the full key.',
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
      {
        text: 'Requires sorted order and O(1) random access — works on arrays and `List`s backed by arrays, not linked lists',
        detail: 'Binary search jumps straight to the middle index and decides which half to discard — that jump is O(1) only if the underlying structure supports random access. On a `LinkedList`, reaching the middle element requires walking O(n) nodes from an end, which erases the entire benefit of halving the search space each step.',
      },
      {
        text: 'Halves the search space each step: O(log n) comparisons total',
        detail: 'Each comparison against the midpoint eliminates exactly half of the remaining candidates regardless of which half is discarded, so after k comparisons only n/2^k elements remain — solving n/2^k = 1 gives k = log₂(n), which is why binary search on a billion elements takes at most 30 comparisons.',
      },
      {
        text: 'Classic bug: `mid = (lo + hi) / 2` overflows for large `lo`/`hi`; use `lo + (hi - lo) / 2`',
        detail: 'This became famous as a real bug in production binary-search implementations (including, historically, one in the JDK itself): if `lo` and `hi` are both large ints, their sum can exceed `Integer.MAX_VALUE` and silently wrap to a negative number before the division ever happens. Computing the midpoint as an offset from `lo` instead of a sum avoids ever adding two large values together.',
      },
      {
        text: 'Lower bound (first index ≥ target) and upper bound (first index > target) are different loop invariants than exact-match search',
        detail: 'Exact-match search can stop the moment it finds any element equal to the target; lower/upper bound search must keep narrowing even after finding a match, because there might be an earlier (or later) occurrence of the same value still to find — that changes which branch of the loop the "equal" case falls into, which is the most common source of bugs when adapting one template into the other.',
      },
      {
        text: 'Java\'s `Arrays.binarySearch`/`Collections.binarySearch` return `-(insertionPoint) - 1` on a miss — a negative encoding, not a plain -1',
        detail: 'Encoding the insertion point into the negative return value means a single call answers both "is it there?" and "where would it go?" without a second search — `-1` alone would only answer the first question. The `- 1` offset exists so that even an insertion point of 0 (insert at the very front) still produces a negative number distinguishable from a successful match at index 0.',
      },
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
        detail: 'The half-open convention `[lo, hi)` is deliberately chosen because it makes the loop invariant trivial to state and preserve: "the answer is always somewhere in `[lo, hi)`" stays true after every iteration by construction, since `hi = mid` (not `mid - 1`) never excludes a candidate that might still be the answer, and `lo = mid + 1` never includes one that has been proven too small.',
      },
      {
        kind: 'pitfall',
        title: 'Off-by-one bound updates cause infinite loops',
        text: 'Using `hi = mid` in the classic `[lo, hi]`-inclusive exact-match search (instead of `hi = mid - 1`) can loop forever when `lo == mid`. Pick one convention — inclusive `[lo, hi]` or half-open `[lo, hi)` — and keep every bound update consistent with it; mixing the two is the single most common binary-search bug.',
        detail: 'The infinite loop happens specifically when the range narrows to two elements (`lo`, `lo+1`) and `mid` computes to `lo`: if the branch taken sets `hi = mid`, `hi` becomes `lo` again — nothing has changed, and the loop repeats forever. The inclusive convention\'s `hi = mid - 1` avoids this because it always strictly shrinks the range, which is precisely the property the half-open convention gets for free from `hi = mid` instead.',
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
      {
        text: 'Quickselect: partition like [[quicksort]], then recurse into only the side that contains the k-th index',
        detail: 'Quicksort must recurse into *both* sides after partitioning because the whole array needs sorting; quickselect only cares about a single index k, so the moment partitioning places the pivot, it can tell which single side (if either) still needs work and discard the other side\'s subproblem entirely — that discarding is the whole source of the speedup over sorting.',
      },
      {
        text: 'Expected O(n) — each partition eliminates a constant fraction of the remaining elements, giving a geometric series that sums to O(n), not O(n log n)',
        detail: 'Sorting does O(log n) rounds of work each costing O(n) (mergesort) — quickselect instead does one partition per round, and because only one side is recursed into, the total work across all rounds forms a geometric series (n + n/2 + n/4 + ...) that sums to O(n) overall, not O(n log n), even though each individual partition still costs O(current size).',
      },
      {
        text: 'Worst case O(n²) with a bad pivot, same failure mode as quicksort — randomization fixes it the same way',
        detail: 'A consistently bad pivot (always the min or max of the remaining range) shrinks the problem by only one element per partition instead of by a constant fraction, turning the geometric series into a linear one that sums to O(n²) — exactly quicksort\'s worst case, and exactly why the same random-pivot fix applies unchanged.',
      },
      {
        text: 'Median-of-medians selection guarantees worst-case O(n) but with a large constant factor, so it\'s a theoretical result more than a practical default',
        detail: 'Grouping the array into fives, finding each group\'s median, then recursively finding the median of those medians is what guarantees a good pivot every time — but the bookkeeping to do all that grouping and sub-median-finding costs far more per element than randomized quickselect\'s simple "pick one at random," so the theoretically superior worst-case bound loses to randomization in every practical benchmark.',
      },
      {
        text: 'For a *stream* or when k is small and fixed, a size-k heap ([[heap-top-k-pattern]]) is simpler and often preferred',
        detail: 'Quickselect assumes the whole array is available up front and fits in memory for in-place partitioning — a streaming input violates that assumption entirely. A fixed-size heap processes one element at a time, discarding the worst candidate whenever the heap exceeds size k, which handles unbounded or one-pass data that quickselect fundamentally cannot.',
      },
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
        detail: 'The "at least 30%" guarantee comes directly from the group size of 5: at least half the group medians are ≥ the median-of-medians, and each of those groups contributes at least 3 of its 5 elements (including the group median itself) that are provably ≥ the pivot too — working through the arithmetic gives a guaranteed discard fraction around 3/10, which is what makes the worst case provably linear rather than merely likely.',
      },
      {
        kind: 'pitfall',
        title: 'Don\'t sort for a single k-th-element query',
        text: 'Calling `Arrays.sort(a)` and reading `a[k]` costs O(n log n) to answer a question quickselect answers in expected O(n). It\'s the right call only if you need the full sorted order for other reasons, or if you\'ll query multiple different k values against the same array (amortizing the one-time sort).',
        detail: 'The break-even point is about repeated use, not raw speed: one sort costs O(n log n) regardless of how many k-queries follow, so if there will be many different k-th-element queries against the same static array, paying the sort cost once and then answering each query in O(1) beats paying quickselect\'s O(n) cost separately for every single query.',
      },
    ],
    refs: [
      { book: 'algorithms-sedgewick', chapter: 'Ch. 2.5 — Selection' },
      { book: 'dsa-goodrich', chapter: 'Ch. 9.5 — Selection' },
    ],
    related: ['quicksort', 'heap-top-k-pattern', 'heaps-and-priority-queues'],
  },
]
