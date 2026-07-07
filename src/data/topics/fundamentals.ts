import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'program-anatomy',
    domainId: 'fundamentals',
    title: 'Anatomy of a Java Program',
    summary:
      'A Java program is a set of classes. Execution starts at `public static void main(String[] args)`; `javac` compiles source to bytecode that the JVM executes anywhere.',
    keyPoints: [
      'One **public** top-level class per `.java` file, named exactly after the file',
      '`main` must be `public static void` and takes a `String[]` of command-line arguments',
      '`javac` produces `.class` bytecode; `java` runs it on the JVM — compile once, run anywhere',
      'Since Java 11 you can run a single source file directly: `java Hello.java`',
      'JShell provides a REPL for interactive experimentation',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Java is **case-sensitive**, every statement lives inside a class, and every executable program needs an entry point: a `main` method with the exact signature below. The JVM calls it with the command-line arguments — note that unlike C, `args[0]` is the first argument, not the program name.',
      },
      {
        kind: 'code',
        title: 'HelloWorld.java',
        code: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
      },
      {
        kind: 'paragraph',
        text: 'The compiler turns source into **bytecode** — instructions for the Java Virtual Machine, not for any physical CPU. This is the root of Java\'s portability: the same `.class` file runs on any platform with a JVM. How the JVM executes and optimizes that bytecode is covered in [[jvm-architecture]] and [[jit-compilation]].',
      },
      {
        kind: 'code',
        title: 'Compile and run',
        code: '$ javac HelloWorld.java   // produces HelloWorld.class\n$ java HelloWorld         // runs the bytecode on the JVM\n$ java HelloWorld.java    // Java 11+: compile-and-run in one step',
      },
      { kind: 'subheading', text: 'Comments and documentation' },
      {
        kind: 'paragraph',
        text: 'Java has three comment forms: `// line`, `/* block */`, and `/** documentation */`. Javadoc comments placed before public classes and members are extracted by the `javadoc` tool into browsable API documentation — the same system that produces the official JDK docs.',
      },
      {
        kind: 'note',
        title: 'JShell',
        text: 'The `jshell` REPL (Java 9+) evaluates expressions and declarations interactively — no class or `main` ceremony. It is the fastest way to explore an API: type `"Ciao".repeat(3)` and see the result immediately.',
      },
      {
        kind: 'pitfall',
        title: 'File and class name must match',
        text: 'A public top-level class `HelloWorld` must live in `HelloWorld.java` — exact spelling and capitalization. Mismatches are compile errors. Only one public top-level class is allowed per file (Effective Java Item 25 recommends one top-level class per file, period).',
      },
      {
        kind: 'bestPractice',
        title: 'Naming conventions (EJ Item 68)',
        text: 'Classes use `UpperCamelCase`, methods and fields `lowerCamelCase`, constants `UPPER_SNAKE_CASE`, packages `all.lowercase` reverse-domain. Following these is not optional style — every Java reader relies on them.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 2–3 — Programming Environment; Fundamental Structures' },
      { book: 'learning-java', chapter: 'Ch. 2–3 — A First Application; Tools of the Trade' },
      { book: 'effective-java', chapter: 'Items 25, 68' },
    ],
    related: ['classes-objects', 'jvm-architecture'],
  },

  {
    id: 'primitive-types',
    domainId: 'fundamentals',
    title: 'Primitive Types & Variables',
    summary:
      'Java has exactly eight primitive types with fixed, platform-independent sizes. Everything else is an object reference. Choosing the right numeric type — and knowing where precision and overflow bite — is foundational.',
    keyPoints: [
      'Eight primitives: `byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean` — sizes are identical on every platform',
      'Integer overflow is **silent** — it wraps around with no exception',
      '`double` cannot represent most decimal fractions exactly — never use it for money (EJ 60)',
      'Conversions that can lose information require an explicit cast',
      'Local variables must be initialized before use; fields get default values',
      'Prefer primitives to boxed types (`Integer`, `Long`…) wherever possible (EJ 61)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The eight primitive types',
        headers: ['Type', 'Size', 'Range / values', 'Literal examples'],
        rows: [
          ['`int`', '4 bytes', '−2,147,483,648 … 2,147,483,647', '`42`, `1_000_000`, `0xFF`, `0b1010`'],
          ['`long`', '8 bytes', '±9.2 × 10¹⁸', '`42L`, `9_000_000_000L`'],
          ['`short`', '2 bytes', '−32,768 … 32,767', '`(short) 12`'],
          ['`byte`', '1 byte', '−128 … 127', '`(byte) 0x1F`'],
          ['`double`', '8 bytes', '~15–16 significant digits', '`3.14`, `2.5e3`, `1e-9`'],
          ['`float`', '4 bytes', '~6–7 significant digits', '`3.14F`'],
          ['`char`', '2 bytes', 'UTF-16 code unit', "`'A'`, `'\\u2122'`"],
          ['`boolean`', '—', '`true` / `false`', '`true`'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Underscores in literals (`1_000_000`) are purely visual. Hexadecimal (`0x`), binary (`0b`) and octal (leading `0`) literals exist — octal is a well-known trap, so avoid leading zeros. Since Java 10, local variables can use `var` when the type is obvious from the initializer (see [[var-type-inference]]).',
      },
      {
        kind: 'code',
        title: 'Declaration and initialization',
        code: 'int units = 3;\nlong worldPopulation = 8_000_000_000L; // L suffix required — int literal would overflow\ndouble ratio = units / 2.0;             // 1.5 — one operand is double\nvar message = "inferred as String";     // Java 10+ local variable type inference',
      },
      {
        kind: 'pitfall',
        title: 'Silent integer overflow',
        text: 'Java integers wrap on overflow — `Integer.MAX_VALUE + 1` is `Integer.MIN_VALUE`, no exception, no warning. When it matters, use `Math.addExact`/`multiplyExact` (they throw `ArithmeticException`) or `long`/`BigInteger`. See [[numbers-math]].',
        code: 'int big = Integer.MAX_VALUE;\nSystem.out.println(big + 1);            // -2147483648  (wraps!)\nSystem.out.println(Math.addExact(big, 1)); // ArithmeticException',
      },
      {
        kind: 'pitfall',
        title: 'Floating-point is binary, not decimal',
        text: '`System.out.println(2.0 - 1.1)` prints `0.8999999999999999`, because binary floating point cannot represent 1.1 exactly (IEEE 754). **Never** use `float`/`double` where exact answers are required — money, quantities in law or contracts. Use `BigDecimal`, or compute in cents with `int`/`long` (Effective Java Item 60).',
      },
      { kind: 'subheading', text: 'Conversions and casts' },
      {
        kind: 'paragraph',
        text: 'Widening conversions (`int` → `long` → `double`) happen automatically. Narrowing conversions require an explicit cast and can silently lose data: `(int) 300.99` is `300` (truncation, not rounding), and `(byte) 300` is `44`. When two different types meet in an expression, both are promoted to the "wider" one before the operation — and anything smaller than `int` is promoted to `int` first.',
      },
      {
        kind: 'paragraph',
        text: '`char` is technically an unsigned 16-bit number holding a UTF-16 **code unit** — not necessarily a whole character. Supplementary characters like emoji need two `char`s (a surrogate pair). For real text processing, work with strings and code points ([[strings-text]]), not raw `char`s.',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer primitives to boxed primitives (EJ Item 61)',
        text: 'Boxed types (`Integer`, `Double`…) are objects: they cost allocation, can be `null` (hello, unboxing `NullPointerException`), and `==` compares identity, not value. Use them only where objects are required — collections and generics — and let autoboxing be an implementation detail at the boundary.',
        code: 'Integer a = 1000, b = 1000;\nSystem.out.println(a == b);      // false! identity comparison of two boxes\nSystem.out.println(a.equals(b)); // true',
      },
      {
        kind: 'note',
        title: 'Constants',
        text: '`final` makes a variable single-assignment. Class-wide constants are `static final`, named in `UPPER_SNAKE_CASE`: `public static final double CM_PER_INCH = 2.54;`. An `enum` is usually better than a group of related `int` constants (EJ Item 34, see [[enums]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.3–3.4 — Data Types; Variables and Constants' },
      { book: 'learning-java', chapter: 'Ch. 4 — The Java Language (Types)' },
      { book: 'effective-java', chapter: 'Items 60, 61' },
    ],
    related: ['operators-expressions', 'numbers-math', 'var-type-inference'],
  },

  {
    id: 'operators-expressions',
    domainId: 'fundamentals',
    title: 'Operators & Expressions',
    summary:
      'Java\'s operators mostly follow C conventions — with well-defined evaluation order, integer division that truncates toward zero, short-circuit logical operators, and a distinct unsigned right shift.',
    keyPoints: [
      'Integer `/` truncates toward zero; `%` can be negative — use `Math.floorMod` for cyclic indexing',
      '`&&` and `||` short-circuit; `&` and `|` always evaluate both sides',
      '`>>` keeps the sign bit (arithmetic shift); `>>>` fills with zeros (logical shift)',
      'Operands are evaluated **left to right**, and mixed-type arithmetic promotes to the wider type',
      'The conditional operator `cond ? a : b` is an expression — use it for simple selections',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Arithmetic (`+ - * / %`), comparison (`== != < <= > >=`), logical (`&& || !`), bitwise (`& | ^ ~`), shifts (`<< >> >>>`), assignment and compound assignment (`+=` etc.), increment/decrement (`++ --`), and the ternary conditional. Precedence follows C; when in doubt, parenthesize — the reader benefits even when the compiler doesn\'t need it.',
      },
      {
        kind: 'pitfall',
        title: 'Integer division and remainder',
        text: '`15 / 2` is `7` (truncation toward zero) and `-7 % 3` is `-1`, not `2`. For "clock arithmetic" that must stay non-negative, use `Math.floorMod(-7, 3)` → `2`. Division by zero throws `ArithmeticException` for integers but produces `Infinity` or `NaN` for floating point.',
      },
      {
        kind: 'code',
        title: 'Truncation, remainder, floorMod',
        code: 'System.out.println(15 / 2);              // 7\nSystem.out.println(15 % 2);              // 1\nSystem.out.println(-7 % 3);              // -1 (sign follows dividend)\nSystem.out.println(Math.floorMod(-7, 3)); // 2\nSystem.out.println(1.0 / 0);             // Infinity (no exception!)',
      },
      {
        kind: 'paragraph',
        text: '`NaN` (not-a-number) results from `0.0/0` or `Math.sqrt(-1)`. **No `NaN` is equal to anything, including itself** — test with `Double.isNaN(x)`, never `x == Double.NaN`.',
      },
      { kind: 'subheading', text: 'Short-circuit evaluation' },
      {
        kind: 'paragraph',
        text: '`&&` and `||` evaluate the right operand only when needed — the idiomatic guard `if (list != null && !list.isEmpty())` depends on it. The single-character forms `&` and `|` on booleans always evaluate both sides; on integers they are bitwise operations.',
      },
      { kind: 'subheading', text: 'Bit manipulation' },
      {
        kind: 'code',
        title: 'Shifts and masks',
        code: 'int flags = 0b0110;\nboolean third = (flags & 0b0100) != 0;  // test a bit\nflags |= 0b0001;                        // set a bit\nflags &= ~0b0010;                       // clear a bit\n\nSystem.out.println(-8 >> 1);   // -4  (sign-extends)\nSystem.out.println(-8 >>> 1);  // 2147483644 (zero-fills)',
      },
      {
        kind: 'pitfall',
        title: 'Increment in complex expressions',
        text: '`x++` yields the old value, `++x` the new one. Code like `arr[i++] = arr[i]` is legal but hostile — Horstmann\'s advice: never use `++`/`--` inside larger expressions. The bugs saved outweigh the keystrokes.',
      },
      {
        kind: 'note',
        title: 'String + and precedence',
        text: '`+` with a string operand converts the other side to a string, left to right: `"You\'ll be " + age + 1` produces `"You\'ll be 421"`. Parenthesize arithmetic inside concatenations: `(age + 1)`.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.5 — Operators' },
      { book: 'learning-java', chapter: 'Ch. 4 — The Java Language (Operators)' },
    ],
    related: ['primitive-types', 'control-flow'],
  },

  {
    id: 'strings-text',
    domainId: 'fundamentals',
    title: 'Strings & Text',
    summary:
      'Java strings are immutable sequences of Unicode text. Compare with `equals`, never `==`; build repeatedly-modified text with `StringBuilder`; and treat indexes as opaque because one visible character may span multiple `char`s.',
    keyPoints: [
      '`String` is **immutable** — every "modification" returns a new string',
      'Compare content with `equals`/`equalsIgnoreCase`; `==` compares references',
      'Loop concatenation is O(n²) — use `StringBuilder` (EJ Item 63)',
      '`length()` counts UTF-16 code units, not visible characters — emoji count as 2+',
      'Text blocks (`"""`) hold multi-line literals without escape noise',
      'The compiler interns string literals: identical literals share one pooled instance',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Immutability makes strings safe to share, cache, and use as map keys — the compiler exploits it by **interning** literals, so `"Java" == "Java"` happens to be `true`. But strings computed at runtime are separate objects, which is why `==` on strings is a classic bug.',
      },
      {
        kind: 'pitfall',
        title: 'Never compare strings with ==',
        text: '`==` asks "same object?", not "same characters?". It works just often enough on literals to lull you before failing on runtime-built strings. Always `a.equals(b)` — or `Objects.equals(a, b)` when either side may be null, or `"literal".equals(variable)` to put the non-null side first.',
        code: 'String a = "Ja" + "va";          // compile-time constant → pooled\nString b = new String("Java");    // explicit new object\nSystem.out.println(a == "Java");      // true (both pooled) — misleading!\nSystem.out.println(b == "Java");      // false\nSystem.out.println(b.equals("Java")); // true — the correct question',
      },
      { kind: 'subheading', text: 'The essential API' },
      {
        kind: 'table',
        caption: 'Everyday String methods',
        headers: ['Method', 'What it does'],
        rows: [
          ['`substring(begin, end)`', 'Extract `[begin, end)` — end is exclusive, length is `end - begin`'],
          ['`indexOf` / `lastIndexOf`', 'Position of a substring, −1 if absent'],
          ['`contains`, `startsWith`, `endsWith`', 'Containment tests'],
          ['`strip()`', 'Remove leading/trailing whitespace (Unicode-aware `trim`)'],
          ['`toUpperCase()` / `toLowerCase()`', 'Case conversion (locale-sensitive overloads exist)'],
          ['`replace(old, new)`', 'Replace all occurrences (plain text, no regex)'],
          ['`split(regex)`', 'Split into an array — the argument is a **regex**'],
          ['`join(delim, parts...)`', 'Static: join pieces with a delimiter'],
          ['`repeat(n)`', 'Repeat the string n times'],
          ['`isEmpty()` / `isBlank()`', 'Zero length / only whitespace'],
          ['`formatted(args)` / `String.format`', 'printf-style formatting'],
          ['`chars()` / `codePoints()`', 'Stream over code units / code points'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'split takes a regex',
        text: '`"a.b.c".split(".")` returns an **empty array** — `.` matches everything in regex. Escape it: `split("\\\\.")` or use `Pattern.quote(".")`. See [[regex]].',
      },
      { kind: 'subheading', text: 'Building strings efficiently' },
      {
        kind: 'bestPractice',
        title: 'Beware the performance of string concatenation (EJ Item 63)',
        text: 'Concatenating n strings with `+` in a loop copies both operands every time — quadratic. Use `StringBuilder`. (Single-expression concatenations are fine: the compiler emits efficient code for those.)',
        code: 'StringBuilder sb = new StringBuilder();\nfor (String line : lines) {\n    sb.append(line).append(\'\\n\');\n}\nString result = sb.toString();',
      },
      {
        kind: 'paragraph',
        text: 'For joining with separators, skip the manual loop entirely: `String.join(", ", list)` or `list.stream().collect(Collectors.joining(", ", "[", "]"))` (see [[collectors]]).',
      },
      { kind: 'subheading', text: 'Unicode reality' },
      {
        kind: 'paragraph',
        text: 'A `char` is a UTF-16 code unit. Characters outside the Basic Multilingual Plane — emoji, many CJK ideographs — occupy **two** chars (a surrogate pair), and human-perceived characters (grapheme clusters, like flag emoji) can span several code points. So `"Ciao 🇮🇹".length()` is 9. Use `codePoints()` to iterate real code points, and treat `indexOf` results as opaque positions. Internally the JVM stores Latin-1-only strings compactly as bytes (compact strings) — an invisible optimization.',
      },
      {
        kind: 'code',
        title: 'Text blocks (Java 15+)',
        code: 'String query = """\n        SELECT id, name\n        FROM users\n        WHERE active = true\n        """;\n// Incidental indentation is stripped; no \\n escapes needed. See the Text Blocks topic.',
      },
      {
        kind: 'note',
        title: 'Formatting output',
        text: '`String.format("%,.2f", 10000.0 / 3)` → `"3,333.33"`. Conversions: `%d` `%f` `%s` `%x` `%e`; flags for width, precision, grouping, zero-padding. `System.out.printf` prints directly. For locale-aware formatting see [[internationalization]].',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.6 — Strings' },
      { book: 'learning-java', chapter: 'Ch. 8 — Text and Core Utilities' },
      { book: 'effective-java', chapter: 'Items 62, 63' },
    ],
    related: ['text-blocks', 'regex', 'language-performance'],
  },

  {
    id: 'control-flow',
    domainId: 'fundamentals',
    title: 'Control Flow',
    summary:
      'Conditionals, loops, and switches steer execution. Modern Java strongly favors the arrow-form `switch` — no fallthrough, and usable as an expression — plus the for-each loop for anything iterable.',
    keyPoints: [
      'Blocks define variable scope; you cannot redeclare a name in a nested block',
      'Classic `switch` falls through unless you `break` — arrow `case ->` never does',
      '`switch` can be an **expression** yielding a value (Java 14+)',
      'Prefer for-each over indexed loops when you don\'t need the index (EJ 58)',
      'Labeled `break`/`continue` escape nested loops without flags or goto',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The loop family',
        code: 'while (balance < goal) { balance += payment; }        // test first\ndo { input = readInput(); } while (!isValid(input));  // body at least once\nfor (int i = 1; i <= 10; i++) { sum += i; }            // counter idiom\nfor (String name : names) { greet(name); }             // for-each: any array or Iterable',
      },
      {
        kind: 'bestPractice',
        title: 'Prefer for-each loops (EJ Item 58)',
        text: 'The for-each loop eliminates index/iterator clutter and a whole class of off-by-one and wrong-variable bugs in nested loops. Use indexed loops only when you must mutate the collection, need the position, or iterate multiple collections in lockstep.',
      },
      { kind: 'subheading', text: 'switch — old and new' },
      {
        kind: 'code',
        title: 'Arrow switch as an expression (Java 14+)',
        code: 'int numLetters = switch (seasonName) {\n    case "SPRING", "SUMMER", "WINTER" -> 6;\n    case "FALL" -> 4;\n    default -> throw new IllegalArgumentException(seasonName);\n};',
      },
      {
        kind: 'paragraph',
        text: 'The arrow form has no fallthrough and each branch is a single expression or block (blocks produce a value with `yield`). When switching over an `enum` or sealed type and covering all cases, no `default` is needed — the compiler checks **exhaustiveness**, a major safety win. Pattern-matching switch extends this further; see [[switch-expressions-pattern-matching]].',
      },
      {
        kind: 'pitfall',
        title: 'Fallthrough in classic switch',
        text: 'In the colon form, a `case` without `break` continues into the next case. Occasionally intended, usually a bug. Compile with `-Xlint:fallthrough` to get warnings, or simply use the arrow form everywhere.',
      },
      {
        kind: 'code',
        title: 'Labeled break',
        code: 'search:\nfor (int i = 0; i < rows; i++) {\n    for (int j = 0; j < cols; j++) {\n        if (grid[i][j] == target) {\n            found = true;\n            break search;   // exits BOTH loops\n        }\n    }\n}',
      },
      {
        kind: 'bestPractice',
        title: 'Minimize variable scope (EJ Item 57)',
        text: 'Declare variables where first used, initialize at declaration, and prefer the `for` header for loop variables so they don\'t leak past the loop. A method that needs many long-lived locals is asking to be split.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.8 — Control Flow' },
      { book: 'learning-java', chapter: 'Ch. 4 — The Java Language (Statements)' },
      { book: 'effective-java', chapter: 'Items 57, 58' },
    ],
    related: ['switch-expressions-pattern-matching', 'operators-expressions'],
  },

  {
    id: 'arrays',
    domainId: 'fundamentals',
    title: 'Arrays',
    summary:
      'Arrays are fixed-length, zero-indexed containers of a single type, with fast index access and bounds checking. They are covariant (dangerously so) and low-level — collections are usually the better default.',
    keyPoints: [
      'Length is fixed at creation; elements get default values (`0`, `false`, `null`)',
      'Out-of-bounds access throws `ArrayIndexOutOfBoundsException` — no silent corruption',
      'Arrays are covariant: `String[]` **is a** `Object[]` — wrong writes fail only at runtime',
      '`Arrays` utility: `sort`, `binarySearch`, `copyOf`, `fill`, `equals`, `toString`, `stream`',
      'Multidimensional arrays are arrays of arrays — rows can be jagged',
      'Prefer `List` in APIs (EJ 28); use arrays at hot spots and for primitives',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Creating arrays',
        code: 'int[] counts = new int[100];                 // all zero\nString[] sizes = { "S", "M", "L", "XL" };    // initializer\nint[][] magic = {\n    { 16, 3, 2, 13 },\n    { 5, 10, 11, 8 },\n};\nint[] copy = Arrays.copyOf(counts, counts.length * 2); // grow via copy',
      },
      {
        kind: 'paragraph',
        text: 'An array variable is a **reference**; assignment aliases the same data. Copy with `Arrays.copyOf`/`copyOfRange` or `System.arraycopy`. `array.length` (a field, not a method) gives the size; iterate with for-each or `Arrays.stream(a)`.',
      },
      {
        kind: 'pitfall',
        title: 'Array covariance vs generics',
        text: '`Object[] objs = new String[1]; objs[0] = 42;` compiles but throws `ArrayStoreException` at runtime. Generics reject the equivalent at **compile time** — one core reason Effective Java Item 28 says *prefer lists to arrays*. Arrays and generics don\'t mix (`new List<String>[10]` is illegal); see [[generics-restrictions]].',
      },
      {
        kind: 'paragraph',
        text: '`Arrays.sort` uses dual-pivot quicksort for primitives and TimSort (stable) for objects. `binarySearch` requires a sorted array. `Arrays.equals`/`Arrays.deepEquals` compare contents — `==` and `equals()` on arrays compare references only, and `toString()` prints gibberish like `[I@1b6d3586`; use `Arrays.toString`.',
      },
      {
        kind: 'pitfall',
        title: 'Arrays.asList is a fixed-size view',
        text: '`Arrays.asList(a)` is backed by the array: `set` works (writes through), but `add`/`remove` throw `UnsupportedOperationException`. For a real independent list use `new ArrayList<>(Arrays.asList(a))` or `List.of(...)` for an immutable one.',
      },
      {
        kind: 'note',
        title: 'Jagged arrays',
        text: 'A `double[10][6]` is really 10 separate row arrays. You can build triangular or ragged shapes by allocating rows yourself — `new double[10][]` then `row[i] = new double[i + 1]`.',
      },
      {
        kind: 'paragraph',
        text: 'Performance-wise, primitive arrays are the densest data layout Java offers — contiguous, no per-element object headers, cache-friendly. That is why they remain the tool of choice in hot numeric code (see [[language-performance]] and [[hardware-memory]]).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.10 — Arrays' },
      { book: 'learning-java', chapter: 'Ch. 4 — The Java Language (Arrays)' },
      { book: 'effective-java', chapter: 'Item 28' },
    ],
    related: ['lists', 'generics-restrictions', 'hardware-memory'],
  },

  {
    id: 'numbers-math',
    domainId: 'fundamentals',
    title: 'Numbers, Math & Big Numbers',
    summary:
      'The `Math` class covers everyday numeric work; `Math.*Exact` methods turn silent overflow into exceptions; and `BigInteger`/`BigDecimal` trade speed for unlimited precision and exact decimal arithmetic.',
    keyPoints: [
      '`Math` methods: `min/max`, `abs`, `pow`, `sqrt`, `floor/ceil/round`, trig, `log`',
      '`Math.addExact`/`multiplyExact`/`toIntExact` throw on overflow instead of wrapping',
      '`BigDecimal` gives exact decimal arithmetic — construct from **String**, not double',
      '`BigInteger` handles arbitrarily large integers',
      'For randomness use `ThreadLocalRandom` (or `Random` with a seed for reproducibility)',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Exact arithmetic guards',
        code: 'long ns = Math.multiplyExact(seconds, 1_000_000_000L); // throws on overflow\nint idx = Math.toIntExact(longValue);                    // safe narrowing\nint wrapped = Math.floorMod(hash, buckets);              // always non-negative',
      },
      {
        kind: 'paragraph',
        text: '`Math` methods are `static` — with `import static java.lang.Math.*` you can write `sqrt(pow(x, 2) + pow(y, 2))`. `StrictMath` guarantees bit-identical results across platforms; `Math` may use faster hardware intrinsics.',
      },
      { kind: 'subheading', text: 'BigInteger and BigDecimal' },
      {
        kind: 'code',
        title: 'Exact money arithmetic',
        code: 'BigDecimal price = new BigDecimal("19.99");   // from String — exact\nBigDecimal qty = BigDecimal.valueOf(3);\nBigDecimal total = price.multiply(qty);        // 59.97, exactly\nBigDecimal each = total.divide(BigDecimal.valueOf(7), 2, RoundingMode.HALF_UP);',
      },
      {
        kind: 'pitfall',
        title: 'new BigDecimal(0.1) is already wrong',
        text: 'Constructing from a `double` copies its binary imprecision: `new BigDecimal(0.1)` is `0.1000000000000000055511151231257827…`. Always use the `String` constructor or `BigDecimal.valueOf(double)` (which round-trips through the string form). And remember `equals` distinguishes `2.0` from `2.00` — compare with `compareTo`.',
      },
      {
        kind: 'paragraph',
        text: 'Big numbers are immutable objects without operator support — `a.add(b.multiply(c))` instead of `a + b * c` — and orders of magnitude slower than primitives. Use them when correctness demands it (money, cryptography, combinatorics), not by default. Effective Java Item 60: `float`/`double` are for scientific measurement, not exact quantities.',
      },
      {
        kind: 'note',
        title: 'Random numbers',
        text: '`ThreadLocalRandom.current().nextInt(1, 7)` for general use (no contention across threads, see [[concurrent-performance]]); `new Random(seed)` for reproducible tests; `SecureRandom` for anything security-sensitive. Java 17 added `RandomGenerator` with modern algorithms (`L64X128MixRandom`).',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 3.5.4, 3.9 — Mathematical Functions; Big Numbers' },
      { book: 'learning-java', chapter: 'Ch. 8 — Text and Core Utilities' },
      { book: 'effective-java', chapter: 'Item 60' },
    ],
    related: ['primitive-types', 'operators-expressions'],
  },
]
