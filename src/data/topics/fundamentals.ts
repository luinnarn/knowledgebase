import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'program-anatomy',
    domainId: 'fundamentals',
    title: 'Anatomy of a Java Program',
    summary:
      'A Java program is a set of classes. Execution starts at `public static void main(String[] args)`; `javac` compiles source to bytecode that the JVM executes anywhere.',
    keyPoints: [
      {
        text: 'One **public** top-level class per `.java` file, named exactly after the file',
        detail: 'The compiler and the class loader both rely on filename-to-class-name matching to find things: `javac` reports an error if they disagree, and at runtime the class loader locates a `.class` file by turning the fully-qualified class name into a path. A file may still contain other, non-public top-level classes — the rule only pins down the one that matches the filename.',
      },
      {
        text: '`main` must be `public static void` and takes a `String[]` of command-line arguments',
        detail: 'Every keyword earns its place: `public` because the JVM launcher calls it from outside your class entirely; `static` because no instance exists yet when the program starts — there is nothing to call an instance method on; `void` because the JVM does not consume a return value, it reads the process exit code instead (set via `System.exit(code)`); `String[] args` because command-line tokens arrive as raw, unparsed text, and turning `"42"` into an `int` is your job.',
      },
      {
        text: '`javac` produces `.class` bytecode; `java` runs it on the JVM — compile once, run anywhere',
        detail: 'Bytecode is a platform-neutral instruction set for a virtual machine, not for any real CPU — the JVM you run it on (Windows, Linux, an embedded device) is what varies, not the `.class` file. This is the whole basis of Java portability: ship one artifact, run it wherever a compliant JVM exists.',
      },
      {
        text: 'Since Java 11 you can run a single source file directly: `java Hello.java`',
        detail: 'This does not write a `.class` file to disk — the source is compiled to bytecode in memory and executed immediately, purely for convenience. It is meant for scripts, quick experiments, and teaching; anything beyond a single file still needs the normal `javac` then `java` two-step (or a build tool).',
      },
      {
        text: 'JShell provides a REPL for interactive experimentation',
        detail: 'JShell drops the class-and-main ceremony entirely: type an expression or a statement and it evaluates immediately, printing the result and inferring a type for it. It is the fastest way to check "what does this method actually do" without creating a throwaway project.',
      },
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
        detail: 'JShell keeps a running session of declarations, so you can define a variable or method in one line and reuse it in the next — behaving more like a scripting language than compiled Java. It even auto-imports the common `java.lang`/`java.util`/`java.io` packages, so exploratory snippets need less boilerplate than a real class would.',
      },
      {
        kind: 'pitfall',
        title: 'File and class name must match',
        text: 'A public top-level class `HelloWorld` must live in `HelloWorld.java` — exact spelling and capitalization. Mismatches are compile errors. Only one public top-level class is allowed per file (Effective Java Item 25 recommends one top-level class per file, period).',
        detail: 'The restriction exists because the class loader needs a deterministic way to map a class name to a file: if two public classes could share a file, or a public class could live in a differently-named file, the loader would have no way to know which file to open. One-top-level-class-per-file also keeps a file\'s job legible at a glance — Effective Java\'s Item 25 argues this is worth following even for non-public classes, for the same reason.',
      },
      {
        kind: 'bestPractice',
        title: 'Naming conventions (EJ Item 68)',
        text: 'Classes use `UpperCamelCase`, methods and fields `lowerCamelCase`, constants `UPPER_SNAKE_CASE`, packages `all.lowercase` reverse-domain. Following these is not optional style — every Java reader relies on them.',
        detail: 'The casing itself carries information: seeing `MAX_RETRIES` versus `maxRetries` versus `MaxRetries` tells a reader "constant", "field or local", or "type", respectively, before they even look up the declaration. Break the convention and every reader (and every tool that generates docs or refactors code) has to fall back to reading context instead of pattern-matching the name.',
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
      {
        text: 'Eight primitives: `byte`, `short`, `int`, `long`, `float`, `double`, `char`, `boolean` — sizes are identical on every platform',
        detail: 'This is unlike C/C++, where `int`\'s size depends on the compiler and platform — Java fixed the sizes as part of the language specification precisely to make bytecode behave identically everywhere a JVM runs. There is no `unsigned` variant of any of them either (Java only added unsigned *helper methods* later, on `Integer`/`Long`, not a real unsigned type).',
      },
      {
        text: 'Integer overflow is **silent** — it wraps around with no exception',
        detail: 'The JVM performs modular arithmetic on fixed-width integers: adding 1 past `Integer.MAX_VALUE` wraps to `Integer.MIN_VALUE` the same way an odometer rolls over, with no flag or exception raised. This is a deliberate performance tradeoff — checking every arithmetic operation for overflow would cost real cycles — so the burden falls on you to reach for `Math.addExact` or a wider type when the domain range is genuinely at risk.',
      },
      {
        text: '`double` cannot represent most decimal fractions exactly — never use it for money (EJ 60)',
        detail: 'Floating point stores numbers in binary fractions, and most base-10 decimals (like 0.1) have no exact binary representation, the same way 1/3 has no exact decimal representation. The error is tiny per operation but accumulates across many additions, and for money even a one-cent discrepancy is a bug, not a rounding curiosity — hence Effective Java\'s blanket recommendation to use `BigDecimal` or integer cents instead.',
      },
      {
        text: 'Conversions that can lose information require an explicit cast',
        detail: 'The compiler will not silently narrow a `double` to an `int` or an `int` to a `byte`, because doing so can throw away real information (truncating the fractional part, or the high-order bits). Requiring an explicit `(int)`/`(byte)` cast forces the possibility of loss to be visible in the source rather than hidden in an assignment — it is a marker, not a fix.',
      },
      {
        text: 'Local variables must be initialized before use; fields get default values',
        detail: 'The compiler tracks "definite assignment" for locals and rejects any code path where a local variable could be read before being written — a compile-time safety net C famously lacks. Fields don\'t get this check because they always have *some* value (`0`, `false`, `null`) the instant the object is allocated, before any constructor code runs.',
      },
      {
        text: 'Prefer primitives to boxed types (`Integer`, `Long`…) wherever possible (EJ 61)',
        detail: 'Boxed types trade the primitive\'s stack-allocated, always-valid value for a heap-allocated object that can be `null` and is compared by identity with `==` — two entire categories of bugs a primitive cannot have. Reach for boxed types only where the language forces it: generics and collections can\'t hold primitives directly, so a `List<Integer>` is unavoidable, but a local counter should still be a plain `int`.',
      },
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
        detail: 'This bites hardest in code that multiplies two large-ish `int`s expecting a bigger result — e.g. `width * height` for an image size — where the true product exceeds `Integer.MAX_VALUE` (about 2.1 billion) and wraps to a small or negative number with no symptom until something downstream indexes an array with it. The `*Exact` methods cost nothing in the common case and turn that silent corruption into an immediate, loud exception.',
      },
      {
        kind: 'pitfall',
        title: 'Floating-point is binary, not decimal',
        text: '`System.out.println(2.0 - 1.1)` prints `0.8999999999999999`, because binary floating point cannot represent 1.1 exactly (IEEE 754). **Never** use `float`/`double` where exact answers are required — money, quantities in law or contracts. Use `BigDecimal`, or compute in cents with `int`/`long` (Effective Java Item 60).',
        detail: 'IEEE 754 doubles store a sign, an exponent, and a fraction over powers of two — so any value that isn\'t exactly a sum of negative powers of two (like 0.5, 0.25) gets rounded to the nearest representable double. 1.1 rounds to something a hair off 1.1, and subtracting shows the residue. This is not a Java bug or a precision setting to fix — it is how every IEEE 754 language behaves, which is exactly why financial code needs a decimal type instead.',
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
        detail: 'The example works differently for small values only by accident: the JVM caches boxed `Integer`s from −128 to 127, so `Integer a = 100, b = 100` would print `true` for `==` while the exact same code at 1000 prints `false` — a cache-size implementation detail masquerading as correct behavior. That inconsistency alone is reason enough to never use `==` on boxed types; always use `.equals()`, or better, avoid boxing in the first place.',
      },
      {
        kind: 'note',
        title: 'Constants',
        text: '`final` makes a variable single-assignment. Class-wide constants are `static final`, named in `UPPER_SNAKE_CASE`: `public static final double CM_PER_INCH = 2.54;`. An `enum` is usually better than a group of related `int` constants (EJ Item 34, see [[enums]]).',
        detail: 'A group of `int` constants (the classic "int enum pattern") has no type safety — a method expecting a "size" constant will happily accept any `int`, including one from a completely unrelated set of constants, and the compiler cannot catch the mistake. An `enum` constant is its own type, so passing the wrong kind of constant is a compile error instead of a runtime surprise.',
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
      {
        text: 'Integer `/` truncates toward zero; `%` can be negative — use `Math.floorMod` for cyclic indexing',
        detail: 'Truncation toward zero (rather than toward negative infinity) means `-7 / 2` is `-3`, not `-4`, and the remainder follows from that: `%` is defined so that `(a / b) * b + (a % b) == a`, which forces `%`\'s sign to match the dividend\'s. `Math.floorMod` instead rounds toward negative infinity, which is what wrapping an index into `[0, n)` — like a circular buffer or day-of-week arithmetic — actually needs.',
      },
      {
        text: '`&&` and `||` short-circuit; `&` and `|` always evaluate both sides',
        detail: 'Short-circuiting is not just an optimization — it is a correctness tool: `list != null && !list.isEmpty()` relies on the right side never running when `list` is null, or it would throw. `&`/`|` on booleans exist mainly for the (rare) cases where you specifically want both sides evaluated regardless — e.g. because both have side effects you need to happen.',
      },
      {
        text: '`>>` keeps the sign bit (arithmetic shift); `>>>` fills with zeros (logical shift)',
        detail: 'Arithmetic right shift (`>>`) replicates the sign bit into the vacated high bits, so shifting a negative number right keeps it negative — useful because it preserves the "divide by a power of two, rounding toward negative infinity" meaning of a shift. Logical shift (`>>>`) always fills with zero regardless of sign, which is what you want when treating the bits as an unsigned pattern rather than a signed number.',
      },
      {
        text: 'Operands are evaluated **left to right**, and mixed-type arithmetic promotes to the wider type',
        detail: 'Left-to-right evaluation is guaranteed by the Java Language Specification (unlike C, where some evaluation orders are unspecified), so `f() + g()` always calls `f()` before `g()` — a property code can safely depend on. Type promotion means anything narrower than `int` (byte, short, char) is widened to `int` before any arithmetic runs, and if a `long`/`float`/`double` is involved, both operands widen to match it.',
      },
      {
        text: 'The conditional operator `cond ? a : b` is an expression — use it for simple selections',
        detail: 'Being an expression (not a statement) means it can appear anywhere a value is expected — inside a method argument, a field initializer, string concatenation — where an `if`/`else` block cannot. It reads well for a single, simple choice; nesting it (`a ? b : c ? d : e`) trades that readability away fast and is usually a sign an `if` chain or a `switch` expression would communicate the intent better.',
      },
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
        detail: 'The asymmetry between integer and floating-point division by zero surprises people who expect consistency: integers have no representation for "infinity" so the JVM has no choice but to throw, while IEEE 754 floating point defines `Infinity` and `NaN` as legitimate values specifically so that a chain of floating-point computations can keep running instead of crashing on every zero.',
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
        detail: 'The trap in `arr[i++] = arr[i]` is that Java evaluates the left-hand side\'s index *before* the right-hand side is read, so the assignment reads `arr[i]` using the already-incremented `i`, not the one that was just used to compute the write location — the two `i`s in that single line do not refer to the same value. Splitting it into `arr[i] = arr[i]; i++;` (or just not combining them) removes the ambiguity entirely.',
      },
      {
        kind: 'note',
        title: 'String + and precedence',
        text: '`+` with a string operand converts the other side to a string, left to right: `"You\'ll be " + age + 1` produces `"You\'ll be 421"`. Parenthesize arithmetic inside concatenations: `(age + 1)`.',
        detail: 'Because `+` associates left to right, `"You\'ll be " + age + 1` is parsed as `("You\'ll be " + age) + 1` — the first `+` is already string concatenation once its left operand is a `String`, so the `1` at the end just gets appended as text rather than added arithmetically. Once any operand in a left-to-right `+` chain is a `String`, every `+` after it is concatenation, not addition.',
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
      {
        text: '`String` is **immutable** — every "modification" returns a new string',
        detail: 'Every method that looks like it modifies a string — `toUpperCase()`, `substring()`, `trim()` — actually allocates and returns a brand-new `String` object, leaving the original untouched. This is why `s.toUpperCase();` on its own line silently does nothing useful: the result is thrown away, and `s` still holds the original value.',
      },
      {
        text: 'Compare content with `equals`/`equalsIgnoreCase`; `==` compares references',
        detail: 'Two `String` objects can hold identical characters while being different objects in memory — `==` only ever answers "is this the same object," which is rarely the question anyone means to ask about text. `equals` is the content comparison, and it is safe to call even when strings came from different sources (concatenation, user input, deserialization).',
      },
      {
        text: 'Loop concatenation is O(n²) — use `StringBuilder` (EJ Item 63)',
        detail: 'Because strings are immutable, `result = result + piece` inside a loop does not append in place — it allocates an entirely new string each iteration and copies everything from both operands into it. Copying grows with the accumulated length every time, so n concatenations copy roughly 1 + 2 + ... + n characters in total, which is quadratic in n.',
      },
      {
        text: '`length()` counts UTF-16 code units, not visible characters — emoji count as 2+',
        detail: 'Java strings are stored as sequences of `char`, and each `char` is one UTF-16 code unit — but a single visible character outside the Basic Multilingual Plane (many emoji, some CJK ideographs) needs two code units, a surrogate pair, to represent. `length()` counts those units, not what a human would call "one character," so it systematically overcounts text containing such characters.',
      },
      {
        text: 'Text blocks (`"""`) hold multi-line literals without escape noise',
        detail: 'Before text blocks, embedding multi-line content like SQL or JSON meant escaping every embedded quote and joining lines with `"\\n" +` — noise that obscured the actual content being embedded. A text block lets you paste the content in roughly as it would look in its native file, with the compiler handling line joining and indentation stripping.',
      },
      {
        text: 'The compiler interns string literals: identical literals share one pooled instance',
        detail: 'Every occurrence of the literal `"Java"` anywhere in a compilation unit resolves to the exact same object at runtime, pulled from a JVM-maintained string pool — this is a memory optimization (no point storing the same immutable text twice), and it is also precisely why `==` on two literal strings can misleadingly return `true`, encouraging the `==` mistake this topic warns about elsewhere.',
      },
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
        detail: 'The bug is insidious specifically because it works during development, where strings are often literal or compiler-folded constants that happen to be pooled — then fails in production once the same code runs on strings that came from user input, file reads, or network calls, none of which are pooled. Putting the known-non-null literal first (`"literal".equals(variable)`) also sidesteps a NullPointerException if the variable happens to be null.',
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
        detail: 'In regex, an unescaped `.` matches any single character, so splitting on `"."` treats every character in the input as a delimiter — the result is a sequence of empty strings between each match, which Java\'s `split` then trims from the end, leaving an empty array for most inputs. This trips up developers who reach for `split` expecting plain-text behavior, since most of `String`\'s other methods (`replace`, `contains`) are not regex-based.',
      },
      { kind: 'subheading', text: 'Building strings efficiently' },
      {
        kind: 'bestPractice',
        title: 'Beware the performance of string concatenation (EJ Item 63)',
        text: 'Concatenating n strings with `+` in a loop copies both operands every time — quadratic. Use `StringBuilder`. (Single-expression concatenations are fine: the compiler emits efficient code for those.)',
        code: 'StringBuilder sb = new StringBuilder();\nfor (String line : lines) {\n    sb.append(line).append(\'\\n\');\n}\nString result = sb.toString();',
        detail: 'A single-expression concatenation like `"Hello, " + name + "!"` compiles to one efficient `StringBuilder` sequence under the hood, so there is no performance argument against writing readable one-line concatenations — the danger is specifically the *loop* case, where each iteration\'s `+` becomes its own separate allocate-and-copy instead of one accumulating builder.',
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
        detail: 'The `%,.2f` example packs three decisions into a few characters: `,` groups thousands, `.2` rounds to two decimal places, and `f` picks fixed-point notation over scientific — the format-string mini-language trades a bit of upfront learning for output formatting that would otherwise take several lines of manual string manipulation to get exactly right.',
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
      {
        text: 'Blocks define variable scope; you cannot redeclare a name in a nested block',
        detail: 'Java rejects shadowing a local variable name inside a nested block, unlike some C-family languages that allow it — this is a deliberate safety choice: shadowing is a well-documented source of "which `x` did I actually just modify" bugs, so the compiler simply refuses the redeclaration rather than letting a nested block silently hide an outer variable of the same name.',
      },
      {
        text: 'Classic `switch` falls through unless you `break` — arrow `case ->` never does',
        detail: 'The colon-form `switch` was modeled directly on C\'s, where execution falls through to the next case unless explicitly stopped — convenient for the rare case that wants shared logic across several cases, but a footgun by default since forgetting one `break` is the single most common `switch` bug in the language\'s history. The arrow form fixes this by making each case an isolated branch with no fallthrough possible.',
      },
      {
        text: '`switch` can be an **expression** yielding a value (Java 14+)',
        detail: 'Before this, assigning a value based on a multi-way branch meant either a chain of `if`/`else if` or a `switch` statement that assigned to a variable from inside each case — both more verbose and more error-prone (a missing assignment in one branch) than a `switch` expression, which the compiler forces to produce a value on every possible path.',
      },
      {
        text: 'Prefer for-each over indexed loops when you don\'t need the index (EJ 58)',
        detail: 'An indexed loop introduces an index variable that has nothing to do with the actual goal (visiting each element) and creates room for off-by-one errors, wrong-variable typos in nested loops (using `i` where `j` was meant), and unnecessary boilerplate. For-each removes the index entirely when the goal never needed it in the first place.',
      },
      {
        text: 'Labeled `break`/`continue` escape nested loops without flags or goto',
        detail: 'Without a label, `break` only exits the innermost loop — escaping two or three levels at once traditionally meant introducing a boolean flag checked by each enclosing loop, extra state that exists purely to work around the language\'s lack of a multi-level break. A label attached to the outer loop lets `break label;` jump straight out of all of them in one statement.',
      },
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
        detail: 'The three exceptions listed are exhaustive, not just examples: for-each gives you no handle to call `remove()` safely (you need an explicit `Iterator`), no index to report or compute with, and no way to advance two sequences in parallel — the moment any of those is genuinely needed, an indexed loop or explicit iterator is the correct, not merely acceptable, choice.',
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
        detail: 'The rare *intended* use — several consecutive case labels sharing one body, like grouping months into seasons — is exactly what the arrow form\'s comma-separated case list (`case "SPRING", "SUMMER" ->`) already expresses directly and safely, without relying on fallthrough at all. That leaves essentially no remaining reason to write new code in the colon form.',
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
        detail: 'A variable declared far above where it is actually initialized and used forces a reader to hold its eventual purpose in mind across all the code in between — narrowing scope to exactly where it is needed means the declaration, initialization, and every use are visible together, which is most of what makes a method easy to read without tracing state through it mentally.',
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
      {
        text: 'Length is fixed at creation; elements get default values (`0`, `false`, `null`)',
        detail: 'Unlike a `List`, which grows as elements are added, an array\'s size is committed the moment `new int[n]` runs and cannot change afterward — growing means allocating a new, larger array and copying, which is exactly what `ArrayList` does internally on your behalf. Default-zeroing every slot (rather than leaving them uninitialized, as C would) is what makes reading an unset element safe instead of undefined behavior.',
      },
      {
        text: 'Out-of-bounds access throws `ArrayIndexOutOfBoundsException` — no silent corruption',
        detail: 'Every array access is bounds-checked by the JVM before it happens — an index outside `[0, length)` throws immediately rather than reading or writing whatever memory happens to sit past the array\'s end, the class of bug that gives C and C++ their reputation for exploitable buffer overruns. The JIT can often prove bounds are safe in tight loops and eliminate the check\'s runtime cost.',
      },
      {
        text: 'Arrays are covariant: `String[]` **is a** `Object[]` — wrong writes fail only at runtime',
        detail: 'This was a deliberate design choice in Java 1.0, made before generics existed, specifically so that one method like `Arrays.sort(Object[])` could operate on arrays of any reference type. The cost of that flexibility is that the type system can no longer catch a wrong-type write at compile time — the check is deferred to a runtime `ArrayStoreException`, which generics were later designed to avoid entirely by rejecting the equivalent mistake at compile time.',
      },
      {
        text: '`Arrays` utility: `sort`, `binarySearch`, `copyOf`, `fill`, `equals`, `toString`, `stream`',
        detail: 'Arrays have no methods of their own beyond the `length` field — every operation you would expect a collection to support natively (sorting, searching, copying, comparing, printing, streaming) instead lives as a static method on this one utility class, mirroring how `Collections` provides the equivalent algorithms for the collection interfaces.',
      },
      {
        text: 'Multidimensional arrays are arrays of arrays — rows can be jagged',
        detail: 'Java has no true multidimensional array type the way some languages do (a single contiguous block indexed by multiple coordinates) — `int[][]` is really an array of `int[]` references, each row a fully independent array object that can have its own length. This is what makes triangular or ragged shapes possible, at the cost of one extra pointer indirection per row compared to a flat contiguous layout.',
      },
      {
        text: 'Prefer `List` in APIs (EJ 28); use arrays at hot spots and for primitives',
        detail: 'Arrays leak their covariance hazard and fixed-size limitation into every API that exposes them, while `List` gives callers a richer, safer interface (immutability options, dynamic growth, the full Collections algorithm library) with no equivalent downside for typical code. The exception is genuinely hot numeric code, where a primitive array\'s lack of per-element boxing and contiguous memory layout is a real, measurable performance win.',
      },
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
        detail: 'The compiler happily accepts `objs[0] = 42` because, statically, `objs` is typed `Object[]` and `42` (boxed to `Integer`) is a valid `Object` — the actual runtime array remembers it is really a `String[]` and rejects the write the moment it executes. This is precisely the class of bug generics were designed to catch earlier, at the line that is actually wrong, instead of at some later line that merely happens to trigger the runtime check.',
      },
      {
        kind: 'paragraph',
        text: '`Arrays.sort` uses dual-pivot quicksort for primitives and TimSort (stable) for objects. `binarySearch` requires a sorted array. `Arrays.equals`/`Arrays.deepEquals` compare contents — `==` and `equals()` on arrays compare references only, and `toString()` prints gibberish like `[I@1b6d3586`; use `Arrays.toString`.',
      },
      {
        kind: 'pitfall',
        title: 'Arrays.asList is a fixed-size view',
        text: '`Arrays.asList(a)` is backed by the array: `set` works (writes through), but `add`/`remove` throw `UnsupportedOperationException`. For a real independent list use `new ArrayList<>(Arrays.asList(a))` or `List.of(...)` for an immutable one.',
        detail: 'The method name suggests a normal, independent `List`, which is what makes this surprising in practice — it is really just a thin `List`-shaped wrapper over the *same* array, sized to match it exactly. `set` mutates the underlying array in place (and is safe because it does not change the size), while `add`/`remove` would require resizing the backing array, which the view has no ability to do, so it throws instead of silently failing.',
      },
      {
        kind: 'note',
        title: 'Jagged arrays',
        text: 'A `double[10][6]` is really 10 separate row arrays. You can build triangular or ragged shapes by allocating rows yourself — `new double[10][]` then `row[i] = new double[i + 1]`.',
        detail: 'Because each row is an independently-allocated array, nothing requires the rows to be the same length — `new double[10][]` allocates only the outer array of 10 row *references*, all initially null, leaving you free to give each row whatever length actually makes sense (a triangular matrix, for instance, where row i only needs i+1 columns) instead of wasting space on a full rectangular grid.',
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
      {
        text: '`Math` methods: `min/max`, `abs`, `pow`, `sqrt`, `floor/ceil/round`, trig, `log`',
        detail: 'These cover the everyday numeric vocabulary every language needs and Java\'s primitive operators do not provide directly — there is no `**` for exponentiation or built-in `sqrt`, so `Math` fills that gap as a library of static functions operating on primitives, deliberately kept separate from any particular numeric type.',
      },
      {
        text: '`Math.addExact`/`multiplyExact`/`toIntExact` throw on overflow instead of wrapping',
        detail: 'Ordinary `+`/`*` on `int`/`long` silently wrap around on overflow — `Integer.MAX_VALUE + 1` becomes `Integer.MIN_VALUE` with no warning, a bug class that can go unnoticed for a long time because the result is still a valid-looking number. The `*Exact` methods perform the identical arithmetic but throw `ArithmeticException` the instant the true result would not fit, turning a silent wraparound into an immediate, loud failure.',
      },
      {
        text: '`BigDecimal` gives exact decimal arithmetic — construct from **String**, not double',
        detail: 'A `double` cannot represent most decimal fractions exactly in binary floating point — `0.1` is already an approximation before any arithmetic even happens — so constructing a `BigDecimal` from a `double` bakes that pre-existing imprecision in permanently. Constructing from the `String` `"0.1"` instead parses the exact decimal value the text represents, with no binary rounding step in between.',
      },
      {
        text: '`BigInteger` handles arbitrarily large integers',
        detail: 'Primitive integers are capped at a fixed bit width (64 bits for `long`) no matter how the arithmetic is written, so a computation whose true result exceeds that — a large factorial, an RSA-sized modular exponentiation — has no correct primitive representation at all. `BigInteger` stores digits in a growable internal array instead of a fixed register, so its range is limited only by available memory.',
      },
      {
        text: 'For randomness use `ThreadLocalRandom` (or `Random` with a seed for reproducibility)',
        detail: 'A single shared `Random` instance accessed from multiple threads serializes internally on a compare-and-swap of its seed, becoming a contention point under concurrent load — `ThreadLocalRandom` sidesteps this entirely by giving each thread its own independent generator state, no shared mutable seed to contend over. `Random(seed)` trades that performance property away deliberately, in exchange for the same sequence of "random" numbers on every run, which is exactly what a reproducible test needs.',
      },
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
        detail: 'The whole point of reaching for `BigDecimal` is exact decimal arithmetic, so constructing it from a `double` — which already lost exactness the moment `0.1` was written as a double literal — defeats the purpose before any arithmetic even runs. `equals` treating `2.0` and `2.00` as different values (because it compares scale as well as numeric value) is a related trap: two values a human would call equal can fail an `equals` check while `compareTo` correctly reports them as numerically the same.',
      },
      {
        kind: 'paragraph',
        text: 'Big numbers are immutable objects without operator support — `a.add(b.multiply(c))` instead of `a + b * c` — and orders of magnitude slower than primitives. Use them when correctness demands it (money, cryptography, combinatorics), not by default. Effective Java Item 60: `float`/`double` are for scientific measurement, not exact quantities.',
      },
      {
        kind: 'note',
        title: 'Random numbers',
        text: '`ThreadLocalRandom.current().nextInt(1, 7)` for general use (no contention across threads, see [[concurrent-performance]]); `new Random(seed)` for reproducible tests; `SecureRandom` for anything security-sensitive. Java 17 added `RandomGenerator` with modern algorithms (`L64X128MixRandom`).',
        detail: 'The three choices map to three different goals that are easy to conflate: `ThreadLocalRandom` optimizes for uncontended speed under concurrency, `Random` with a fixed seed optimizes for reproducibility (the same "random" sequence every run, essential for deterministic tests), and `SecureRandom` optimizes for unpredictability against an adversary — using the wrong one for the goal at hand (e.g. `Random` for a security token) is a real, common vulnerability.',
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
