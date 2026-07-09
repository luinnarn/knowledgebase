import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'generics-why',
    domainId: 'generics',
    title: 'Why Generics',
    summary:
      'Generics move type errors from runtime to compile time: a `List<String>` can only ever hold strings, and reading from it needs no cast. Raw types exist only for backward compatibility — never write them.',
    keyPoints: [
      {
        text: 'Pre-generics collections held `Object` — every read needed a cast that could fail at runtime',
        detail:
          'The container itself provided zero guarantee about what was inside — `Object` accepts literally anything, so the compiler could not stop a `String` list from receiving an `Integer`. The cast at read time was really a promise the programmer made to the compiler, and `ClassCastException` was the compiler collecting on a broken promise, often in code far removed from where the wrong element was inserted.',
      },
      {
        text: 'Type parameters document intent and are enforced by the compiler',
        detail:
          "Documentation that isn't checked tends to rot — a comment saying \"this list holds only Strings\" can silently go stale the moment someone adds an Integer. A type parameter is documentation the compiler itself polices at every call site, so it can never drift from what the code actually does.",
      },
      {
        text: 'The diamond `<>` infers type arguments: `new ArrayList<>()`',
        detail:
          'Before Java 7 you had to repeat the type on both sides — `List<String> names = new ArrayList<String>()` — purely because the constructor call had no way to see the variable\'s declared type. The diamond lets the compiler copy the type argument from the left-hand side (or the surrounding context), which is why it only works where that context exists.',
      },
      {
        text: 'Raw types (`List` without `<...>`) silently opt out of type checking (EJ 26)',
        detail:
          'A raw type is not "generic with unknown type argument" — it deliberately reverts the class to its pre-Java-5, uninstantiated behavior, because that is what old bytecode compiled against. That backward-compatibility trick is the only reason raw types still compile at all; new code has no excuse to use them.',
      },
      {
        text: '`List<?>` is the safe "list of unknown" — raw `List` is not',
        detail:
          '`List<?>` still tells the compiler "this is definitely some List<T> for a specific, if unknown, T" — so it can safely refuse every add() except null, since it cannot know if a given object matches the hidden T. A raw List gives up that guarantee entirely and accepts any object, an unchecked List<Object> in disguise.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Before and after',
        code: '// Pre-Java-5: trust, then ClassCastException at a distance\nList files = new ArrayList();\nfiles.add("readme.txt");\nfiles.add(42);                              // compiles!\nString f = (String) files.get(1);           // BOOM — at runtime, far from the bug\n\n// Generics: the compiler rejects the bad add\nList<String> names = new ArrayList<>();\nnames.add("readme.txt");\n// names.add(42);                           // compile error — bug caught at source\nString first = names.get(0);                // no cast',
      },
      {
        kind: 'bestPractice',
        title: "Don't use raw types (EJ Item 26)",
        text: 'Raw types exist so pre-generics code keeps compiling. Using them discards the entire safety net: `List` accepts anything and defers the explosion to whoever reads. If the element type is truly unknown, say so with a wildcard: `List<?>` — the compiler then prevents you from adding anything but `null`.',
        detail:
          'This is the single riskiest thing you can do in generic code because the compiler entirely stops checking that container — every add() and get() becomes an unchecked operation, and the eventual ClassCastException can surface in a completely unrelated part of the codebase that merely reads the collection.',
      },
      {
        kind: 'paragraph',
        text: 'Generics also power the fluent APIs you use daily: `Stream<T>`, `Optional<T>`, `CompletableFuture<T>`, `Map<K,V>`. Understanding variance ([[wildcards-pecs]]) and [[type-erasure]] explains both their signatures and their few sharp edges.',
      },
      {
        kind: 'bestPractice',
        title: 'Eliminate unchecked warnings (EJ Item 27)',
        text: 'Every unchecked warning is a potential runtime `ClassCastException`. Eliminate them; when you provably can\'t, suppress with `@SuppressWarnings("unchecked")` on the **smallest possible scope** and add a comment proving safety.',
        detail:
          'An unchecked warning means the compiler could not prove type safety and is trusting you instead — which is exactly the situation that produces a ClassCastException at some later, unpredictable point. Suppressing at the smallest scope (a single variable, not a whole method) keeps the "trust me" surface area small enough that the accompanying safety-proof comment is actually checkable by a reviewer.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 8.1 — Why Generic Programming?' },
      { book: 'effective-java', chapter: 'Items 26, 27' },
    ],
    related: ['generic-classes-methods', 'collections-overview', 'type-erasure'],
  },

  {
    id: 'generic-classes-methods',
    domainId: 'generics',
    title: 'Generic Classes & Methods',
    summary:
      'Declare type parameters on classes (`class Box<T>`) or individual methods (`static <T> T pick(...)`). The compiler infers method type arguments from the call — you rarely spell them out.',
    keyPoints: [
      {
        text: 'Class-level parameter: `class Pair<T>` — one type variable for the whole instance',
        detail:
          'Every field and method of that instance shares the same T — once you write `new Pair<String>(...)`, every method call on that object is locked to String for its lifetime, because the type variable was substituted once, at construction.',
      },
      {
        text: 'Method-level parameter: `<T>` before the return type; independent per call',
        detail:
          "A method-level `<T>` binds fresh for every single invocation — calling the same generic method twice with different argument types is not just allowed, it is the normal case, since each call gets its own inferred T unrelated to any other call or to the enclosing class's type parameter (if any).",
      },
      {
        text: 'Type arguments are inferred: `Pair.of("a", 1)` figures out `Pair<String,Integer>`',
        detail:
          'Inference works backward from the arguments you actually pass — the compiler solves for whatever T (or T1, T2, ...) makes the parameter types match, the same way it solves for T in `List.of(1, 2, 3)` returning `List<Integer>`. You almost never write the type argument yourself because the compiler can derive it from information already at the call site.',
      },
      {
        text: 'Conventions: `T` type, `E` element, `K`/`V` key/value, `R` result',
        detail:
          'These are pure convention, not a language rule — the compiler is happy with `class Box<Banana>`. The point of the convention is that a reader instantly recognizes T/E/K/V/R as "generic placeholder" rather than mistaking it for a real, meaningful class name.',
      },
      {
        text: 'Favor generic types and methods over Object-based ones (EJ 29–30)',
        detail:
          'An Object-based API pushes the casting burden onto every single caller, forever; a generic API pays that design cost once, inside the class, and every caller gets a compiler-checked, cast-free result. The cost of writing the generic version is almost always smaller than the cumulative cost of every caller re-deriving the correct cast.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A generic class',
        code: 'public class Pair<T> {\n    private final T first;\n    private final T second;\n\n    public Pair(T first, T second) {\n        this.first = first;\n        this.second = second;\n    }\n\n    public T getFirst() { return first; }\n    public T getSecond() { return second; }\n}',
      },
      {
        kind: 'code',
        title: 'A generic method — type parameter belongs to the method',
        code: 'public static <T> T getMiddle(T... a) {\n    return a[a.length / 2];\n}\n\nString mid = getMiddle("John", "Q.", "Public");   // T inferred as String',
      },
      {
        kind: 'paragraph',
        text: 'Inference occasionally surprises: `getMiddle("Hello", 0, null)` infers the common supertype of `String` and `Integer` — a legal but unintended `Object`-ish type. When inference goes sideways, pass explicit type arguments: `Collections.<String>emptyList()`.',
      },
      {
        kind: 'paragraph',
        text: 'Generic **records** work too: `record Pair<T>(T first, T second) {}` — one line replaces the class above (see [[records]]). Generic constructors infer through the diamond: `new HashMap<String, List<Integer>>()` is just `new HashMap<>()` in assignment context.',
      },
      {
        kind: 'bestPractice',
        title: 'Favor generic types and methods (EJ Items 29–30)',
        text: 'If a class or method could work over many types with casts, make it generic instead — clients get safety and you keep one implementation. Internal `Object[]` storage with checked casts (the `ArrayList` approach) is the standard technique when arrays meet erasure.',
        detail:
          "The `ArrayList` source itself is the canonical example: internally it stores an `Object[]` and casts on read, so the unsafety is concentrated in one heavily-tested class instead of scattered across every piece of code that ever holds a list of some type. That trade — a little unsafety hidden inside a well-tested implementation, in exchange for total safety at every call site — is the generic-API bargain.",
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 8.2–8.3 — Generic Classes; Generic Methods' },
      { book: 'effective-java', chapter: 'Items 29, 30' },
    ],
    related: ['type-bounds', 'generics-why', 'records'],
  },

  {
    id: 'type-bounds',
    domainId: 'generics',
    title: 'Type Bounds',
    summary:
      'Bounds constrain type parameters so your code can actually call methods on them: `<T extends Comparable<T>>` promises order. Multiple bounds combine one class with any number of interfaces.',
    keyPoints: [
      {
        text: '`<T extends Bound>` — T must be a subtype of Bound (class or interface, "extends" covers both)',
        detail:
          'Generics reuse the keyword `extends` for both class inheritance and interface implementation because, from the type system\'s point of view, both just mean "is-a" — there is no separate `implements` keyword needed in a bound, which is why `<T extends Runnable>` reads naturally even though a class would normally `implements` Runnable.',
      },
      {
        text: 'Multiple bounds: `<T extends Runnable & Comparable<T>>`; the class (if any) comes first',
        detail:
          "At most one of the bounds can be a class (Java has no multiple inheritance of implementation), so the compiler requires it first if present, with any number of interface bounds following with `&`. This ordering rule exists purely so the compiler can unambiguously parse where the (at most one) class bound ends and the interface bounds begin.",
      },
      {
        text: "Without a bound, T is implicitly `Object` — only Object's methods are callable",
        detail:
          "An unbounded `<T>` is really shorthand for `<T extends Object>` — since every reference type is-a Object, the compiler can only guarantee equals/hashCode/toString and the like are callable on T, because that is all any possible substitution for T is guaranteed to support.",
      },
      {
        text: 'The recursive form `<T extends Comparable<? super T>>` is the production-grade signature',
        detail:
          'A plain `<T extends Comparable<T>>` rejects perfectly good types like `java.sql.Timestamp`, whose Comparable implementation actually comes from its superclass `java.util.Date` rather than from Timestamp itself. The `? super T` wildcard says "T\'s comparison logic may live in T or in any ancestor of T," which is what real class hierarchies actually look like.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Why bounds exist',
        code: 'public static <T extends Comparable<T>> T min(T[] a) {\n    T smallest = a[0];\n    for (T x : a)\n        if (x.compareTo(smallest) < 0) smallest = x;   // legal ONLY due to the bound\n    return smallest;\n}',
      },
      {
        kind: 'paragraph',
        text: 'Without `extends Comparable<T>`, the call `x.compareTo(...)` cannot compile — the compiler only knows T is an `Object`. The bound is both a **restriction** on callers and a **capability** inside the method.',
      },
      {
        kind: 'paragraph',
        text: 'The fully general form is `<T extends Comparable<? super T>>` — it accepts types whose *superclass* implements the comparison (e.g. `java.sql.Timestamp` extends `java.util.Date`, which implements `Comparable<Date>`). This "recursive type bound with a super wildcard" appears throughout `java.util.Collections`; the reasoning is pure [[wildcards-pecs|PECS]].',
      },
      {
        kind: 'note',
        title: 'Multiple bounds and erasure',
        text: 'With `<T extends A & B>`, [[type-erasure|erasure]] replaces T by the **first** bound (A) in the compiled signature. Putting an interface first when a class bound exists is a compile error; ordering also subtly affects binary compatibility.',
        detail:
          'Erasure has to pick exactly one runtime type to substitute for T in the compiled bytecode, and it always picks the leftmost bound — which is precisely why the class bound (if any) is required to come first: it is the type erasure actually erases to, while interface bounds after it are enforced only at compile time via inserted casts.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 8.4 — Bounds for Type Variables' },
      { book: 'effective-java', chapter: 'Item 30' },
    ],
    related: ['wildcards-pecs', 'type-erasure', 'object-contracts'],
  },

  {
    id: 'type-erasure',
    domainId: 'generics',
    title: 'Type Erasure',
    summary:
      'Generics are a compile-time construct: after compilation, `Pair<String>` and `Pair<Integer>` are the same class `Pair`, with type variables replaced by their bounds and casts inserted at use sites. Every generics limitation traces back to this.',
    keyPoints: [
      {
        text: 'One class file per generic type — type arguments vanish at runtime',
        detail:
          'Compare this to C++ templates, which generate a distinct compiled class per instantiation (`Pair<int>` and `Pair<string>` are genuinely different types in the binary) — Java generics instead compile down to a single class file regardless of how many different type arguments are used across the whole codebase, which is exactly why no type argument information survives to be inspected at runtime.',
      },
      {
        text: 'T erases to its first bound (`Object` if unbounded)',
        detail:
          "The compiler needs some concrete type to put in the erased bytecode wherever T appears — an unbounded T has no declared constraint, so `Object` (every reference type's ultimate supertype) is the only type guaranteed to be safe to substitute.",
      },
      {
        text: 'The compiler inserts synthetic casts at reads and **bridge methods** for inheritance',
        detail:
          'Since the erased class only knows about Object (or the first bound), every place your source code reads a T back out, the compiler must insert an invisible cast back to the type you declared — that cast is what throws `ClassCastException` if generic invariants were ever violated (e.g. via raw-type or unchecked-cast abuse elsewhere).',
      },
      {
        text: 'No runtime type argument info: `instanceof List<String>` is illegal',
        detail:
          'The JVM literally has no bytecode instruction capable of testing "is this list\'s element type String," because the class file for List does not encode an element type at all after erasure — there is nothing at runtime to test against, so the language forbids writing the check rather than silently making it meaningless.',
      },
      {
        text: 'Erasure bought seamless migration compatibility with pre-generics code',
        detail:
          "When generics shipped in Java 5, millions of lines of pre-generics code and compiled .class files already existed — erasure meant a generic `List<String>` compiles to the exact same bytecode shape as the old raw `List`, so old and new code could call into each other without recompilation. Reified generics (C#'s approach) would have broken that compatibility.",
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'What the JVM actually sees',
        code: '// You write:\nPair<Employee> buddies = new Pair<>(e1, e2);\nEmployee first = buddies.getFirst();\n\n// After erasure the JVM sees:\nPair buddies = new Pair(e1, e2);          // raw Pair — T became Object\nEmployee first = (Employee) buddies.getFirst();   // compiler-inserted cast',
      },
      {
        kind: 'paragraph',
        text: 'Java chose erasure so generic code could interoperate with a decade of existing libraries without recompilation — unlike C++ templates (a class per instantiation) or C# reified generics (runtime type info). The price: the runtime cannot distinguish `List<String>` from `List<Integer>`; both are just `List`.',
      },
      { kind: 'subheading', text: 'Bridge methods' },
      {
        kind: 'code',
        title: 'Why bridges exist',
        code: 'class DateInterval extends Pair<LocalDate> {\n    @Override\n    public LocalDate getSecond() { ... }        // your override\n}\n// Erased Pair has: Object getSecond()\n// The compiler synthesizes a bridge in DateInterval:\n//   Object getSecond() { return getSecond(); }  // calls YOUR LocalDate version\n// — preserving polymorphism across the erased signature.',
      },
      {
        kind: 'paragraph',
        text: 'Bridges surface in stack traces and reflection (`Method.isBridge()`). They also implement **covariant return types** for non-generic code — the same mechanism.',
      },
      {
        kind: 'pitfall',
        title: 'Runtime type tests see only the raw type',
        text: '`obj instanceof Pair<String>` does not compile; `getClass()` returns `Pair.class` for every instantiation. Where runtime type knowledge is genuinely needed, pass a `Class<T>` *type token* — the trick behind typesafe heterogeneous containers (EJ Item 33): `<T> T get(Class<T> type) { return type.cast(map.get(type)); }`.',
        detail:
          'The type-token trick works because `Class<T>` itself is an ordinary object that DOES carry real runtime identity — unlike a type argument, a Class object is a genuine value you can store, pass around, and query, so threading one through explicitly recovers exactly the runtime type information erasure otherwise throws away.',
      },
      {
        kind: 'note',
        title: 'Reflection can still read declarations',
        text: "Erasure removes type arguments from *objects*, not from *class files' signatures*: `Field.getGenericType()` and friends expose the declared `List<String>` for fields, parameters, and superclasses — which is how serialization libraries like Jackson do their job. See [[reflection]].",
        detail:
          "The distinction is between an object's runtime class (erased, always just List) and a field or method's declared signature (preserved in the class file's metadata for reflection to read) — erasure only removes the type argument from instances at runtime, it does not remove the source-level generic signature from the compiled .class file itself.",
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 8.5 — Generic Code and the Virtual Machine' },
      { book: 'effective-java', chapter: 'Item 33' },
    ],
    related: ['generics-restrictions', 'reflection', 'wildcards-pecs'],
  },

  {
    id: 'wildcards-pecs',
    domainId: 'generics',
    title: 'Wildcards & PECS',
    summary:
      "Generic types are invariant — a `List<Manager>` is not a `List<Employee>`. Wildcards restore flexibility at API boundaries: `? extends T` for inputs you read from (producers), `? super T` for outputs you write to (consumers).",
    keyPoints: [
      {
        text: '**PECS**: Producer → `extends`, Consumer → `super` (EJ 31)',
        detail:
          "The mnemonic describes the role the parameterized type plays from the method's point of view: if the method is going to pull T values out of the parameter (a producer of T), bound it with extends; if the method is going to push T values into it (a consumer), bound it with super. A parameter that genuinely does both should not be wildcarded at all — see the wildcard-capture pitfall below for what that looks like.",
      },
      {
        text: 'From a `List<? extends T>` you can only **read** T\'s — adds are rejected',
        detail:
          'The compiler cannot know the *actual* concrete list behind the wildcard — it might really be a `List<Manager>` — so it must refuse any add() that isn\'t provably safe for every possible subtype, and since only null is guaranteed compatible with any subtype, only null-adds are allowed.',
      },
      {
        text: 'Into a `List<? super T>` you can only **write** T\'s — reads give `Object`',
        detail:
          "Symmetric reasoning: the actual list could be a `List<Object>`, so the only thing the compiler can promise about a read is that it will be at least an Object — but writing a T is always safe, because whatever the real element type is, it's guaranteed to be T or an ancestor of T, so a T always fits.",
      },
      {
        text: 'Wildcards belong in method signatures, not return types or fields',
        detail:
          'A wildcarded return type pushes the wildcard-reasoning burden onto every single caller, forever — they would have to work out what they can and cannot do with a `List<? extends Number>` you handed back. Keeping wildcards at the input boundary means the flexibility benefits the method\'s implementation without leaking complexity to callers.',
      },
      {
        text: 'Unbounded `<?>`: "some specific type, unknown here" — read-only, null-add-only',
        detail:
          '`<?>` is not "any type mixed together" — it always denotes one specific, if unnamed, type argument, which is exactly why the same non-null-add restriction from `? extends Object` applies: the compiler must protect against whatever that hidden concrete type turns out to be.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Invariance and the fix',
        code: 'List<Manager> managers = List.of(boss);\n// List<Employee> staff = managers;              // compile error: invariant!\nList<? extends Employee> staff = managers;       // OK: covariant VIEW\n\nEmployee e = staff.get(0);      // reading produces Employee — safe\n// staff.add(new Employee());   // rejected: might be a List<Manager>!',
      },
      {
        kind: 'paragraph',
        text: 'The compiler\'s logic: `staff` might point at a `List<Manager>`, so inserting a plain `Employee` would poison it. Conversely `List<? super Manager>` might be a `List<Object>`, so reads only promise `Object` — but inserting a `Manager` is always safe. **Producers you read from: extends. Consumers you write into: super.**',
      },
      {
        kind: 'code',
        title: 'PECS in a real signature (java.util.Collections)',
        code: 'public static <T> void copy(List<? super T> dest,     // consumer of T\n                            List<? extends T> src) {  // producer of T\n    for (int i = 0; i < src.size(); i++)\n        dest.set(i, src.get(i));\n}\n\n// Callers get maximum flexibility:\nList<Number> numbers = ...;\nList<Integer> ints = ...;\nCollections.copy(numbers, ints);   // Integer source into Number destination — natural',
      },
      {
        kind: 'bestPractice',
        title: 'Use bounded wildcards to increase API flexibility (EJ Item 31)',
        text: 'If a parameter is a producer or consumer of `T`, wildcard it. Do **not** wildcard return types — that forces wildcards onto callers. Rule of thumb: if users of your class must think about wildcards, the API is wrong. Comparators are consumers: the canonical bound is `Comparator<? super T>`.',
        detail:
          'Comparator is the textbook case: a `Comparator<Employee>` cannot compare Managers even though Manager extends Employee, unless the parameter accepts `Comparator<? super T>` — allowing a comparator written for a broader type to be reused for every narrower subtype, which is exactly the flexibility PECS exists to unlock.',
      },
      {
        kind: 'pitfall',
        title: 'Wildcard capture',
        text: 'Inside a method taking `List<?>` you cannot even `list.set(0, list.get(0))` — the compiler treats each `?` use independently. The fix is a private generic helper `<T> void swapHelper(List<T> l, ...)` that "captures" the wildcard into a nameable T.',
        detail:
          'The compiler treats every occurrence of `?` in a signature as potentially a *different* hidden type, even within the same method body — so `list.set(0, list.get(0))` fails because the compiler cannot prove the value it just read out is assignment-compatible with what set() expects, even though logically it obviously is. A private generic helper method gives that hidden type an actual name (T), letting the compiler reason about it consistently across the whole helper body.',
      },
      {
        kind: 'note',
        title: 'Arrays chose the opposite trade-off',
        text: 'Arrays are covariant and pay with runtime `ArrayStoreException` ([[arrays]]); generics are invariant and pay with wildcard ceremony — but fail at compile time. This is why lists and arrays combine so poorly ([[generics-restrictions]]).',
        detail:
          'Arrays remember their element type at runtime and enforce it on every store, which is what makes them covariant-safe *at runtime* but means the failure (ArrayStoreException) only surfaces when the bad store actually happens, possibly long after the array was created. Generics chose the opposite: forbid the risky assignment entirely at compile time, at the cost of needing wildcard syntax to still express legitimate covariant/contravariant uses.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 8.6–8.8 — Inheritance Rules; Wildcard Types' },
      { book: 'effective-java', chapter: 'Item 31' },
    ],
    related: ['type-bounds', 'generics-best-practices', 'arrays', 'collections-overview'],
  },

  {
    id: 'generics-restrictions',
    domainId: 'generics',
    title: 'Generics Restrictions',
    summary:
      'Erasure imposes a fixed list of "cannots": no primitives as type arguments, no `new T()`, no generic arrays, no generic exceptions, no static fields of type T. Each has a standard workaround.',
    keyPoints: [
      {
        text: 'No primitive type arguments — `List<int>` is illegal; boxing or specialized streams instead',
        detail:
          'Generics were bolted onto a JVM whose generic machinery only ever deals in references (since T erases to Object or a bound, and primitives are not objects) — so `List<int>` has literally nowhere to erase to. Autoboxing papers over this at the source level, and IntStream/LongStream/DoubleStream exist specifically to avoid paying the boxing cost when it matters.',
      },
      {
        text: 'No `new T()` / `new T[]` — pass a `Class<T>` token or `IntFunction<T[]>` like `String[]::new`',
        detail:
          "`new T()` would need to call a specific class's constructor at runtime, but after erasure the compiler has no idea which class T actually was — there is nothing to call `new` on. A Class<T> token or a factory function threads the missing runtime information back in explicitly, which is exactly the type-token pattern from [[type-erasure]].",
      },
      {
        text: 'No generic array creation: `new List<String>[10]` is illegal (heap pollution)',
        detail:
          'Arrays check every store against their runtime element type — that is how ArrayStoreException works — but a generic array\'s "element type" (`List<String>`) has been erased away, so the JVM would silently allow storing a `List<Integer>` into what your source code believes is a `List<String>[]`. Forbidding the creation outright is the only way to prevent that silent corruption from ever being possible.',
      },
      {
        text: "Static fields/methods cannot use the class's type parameter",
        detail:
          "A static member belongs to the class itself, not to any particular instantiation of it — but there is only one erased class shared by every `Box<String>`, `Box<Integer>`, etc., so a static field of type T would have to simultaneously be every instantiation's T, which is incoherent. Static *methods* are fine as long as they declare their own independent `<T>`, unrelated to the class's.",
      },
      {
        text: 'No `catch (T e)`, no generic `Throwable` subclasses',
        detail:
          "The JVM's exception-dispatch mechanism identifies which catch block matches a thrown exception using the exception's actual runtime class — but after erasure there would be no way to distinguish a `MyException<String>` from a `MyException<Integer>` at the bytecode level that dispatch actually uses, so the language forbids the ambiguity from ever being created.",
      },
      {
        text: 'Overloads that erase to the same signature clash',
        detail:
          'Overload resolution is a source-level, pre-erasure concept, but the two overloads still have to coexist as distinct methods in the same compiled class file — once both `process(List<String>)` and `process(List<Integer>)` erase to the identical `process(List)`, the class file format has no way to represent two methods with the same name and erased signature.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'The array clash',
        code: '// Illegal: generic array creation\n// Pair<String>[] table = new Pair<String>[10];\n\n// Why: arrays check stores at runtime using the ELEMENT type,\n// which erasure has destroyed. This would compile and corrupt silently:\nObject[] objs = table;                    // arrays are covariant\nobjs[0] = new Pair<Employee>(...);        // ArrayStoreException CANNOT fire — erased!\n\n// Workarounds:\nList<Pair<String>> table2 = new ArrayList<>();      // best: use a list (EJ 28)\nPair<String>[] table3 = (Pair<String>[]) new Pair<?>[10]; // classic @SuppressWarnings dance',
      },
      {
        kind: 'paragraph',
        text: '**Varargs + generics** = "heap pollution" warnings, because varargs create an array of the erased type. `@SafeVarargs` (EJ Item 32) asserts your method only reads the array and never stores into it or leaks it — the JDK\'s own `List.of(...)` carries it.',
      },
      {
        kind: 'code',
        title: 'Instantiating T — the supplier pattern',
        code: '// Illegal: T could be abstract, and erasure loses the constructor anyway\n// public Pair() { first = new T(); }\n\n// Standard fixes:\npublic static <T> Pair<T> makePair(Supplier<T> constr) {\n    return new Pair<>(constr.get(), constr.get());\n}\nPair<String> p = makePair(String::new);\n\n// Or a type token:\npublic static <T> Pair<T> makePair(Class<T> cl) throws Exception {\n    return new Pair<>(cl.getConstructor().newInstance(), ...);\n}',
      },
      {
        kind: 'pitfall',
        title: 'Erasure clash in overloads',
        text: '`void process(List<String> l)` and `void process(List<Integer> l)` erase to the same `process(List)` — a compile error. Similarly, a generic class cannot implement `Comparable<X>` for two different X.',
        detail:
          'This is the same root cause as the array-clash pitfall above: the compiler enforces generic type safety only until erasure happens, and once two things erase to an identical signature, the class file format simply has no remaining way to tell them apart, regardless of how different they looked in source.',
      },
      {
        kind: 'note',
        title: 'Static context',
        text: '`class Box<T> { static T last; }` is illegal — statics are shared across *all* instantiations, and there is only one erased class. Generic *static methods* declaring their own `<T>` are fine.',
        detail:
          'It helps to picture the single erased class file as the one and only "Box" that ever exists at runtime — every `Box<Something>` you write in source is a view onto that same erased class, so a static field literally could not hold a different value per instantiation even if the language allowed declaring one.',
      },
    ],
    refs: [
      { book: 'core-java-1', chapter: 'Ch. 8.8 — Restrictions and Limitations' },
      { book: 'effective-java', chapter: 'Items 28, 32' },
    ],
    related: ['type-erasure', 'arrays', 'generics-best-practices'],
  },

  {
    id: 'generics-best-practices',
    domainId: 'generics',
    title: 'Generics Best Practices',
    summary:
      'The Effective Java generics doctrine in one place: no raw types, no unchecked warnings, lists over arrays, generify your own APIs, PECS at boundaries, and type tokens when runtime types are unavoidable.',
    keyPoints: [
      {
        text: "Don't use raw types (26); eliminate unchecked warnings (27)",
        detail:
          'These two are really one discipline: a raw type is what generates the unchecked warnings in the first place, so eliminating raw types from your own code (as opposed to code you\'re merely forced to interoperate with) usually eliminates most unchecked warnings as a side effect.',
      },
      {
        text: 'Prefer lists to arrays in APIs (28)',
        detail:
          'Arrays are covariant and check element types at every store, at runtime; generic lists are invariant and check at compile time. A List-based API converts what would be a runtime ArrayStoreException, discovered whenever it happens to occur in production, into a compile error the author sees immediately.',
      },
      {
        text: 'Favor generic types (29) and generic methods (30)',
        detail:
          'Both push the type-safety work into the one place — the class or method definition — that is written once, instead of leaving every caller to independently get the casting right, which is the same "pay once, benefit everywhere" logic that makes generics worth their syntactic overhead.',
      },
      {
        text: 'Bounded wildcards for flexible APIs — PECS (31)',
        detail:
          "Without wildcards, an invariant parameter type like `List<Number>` rejects a perfectly usable `List<Integer>` argument — bounded wildcards are the escape hatch that lets an API accept the wider range of arguments its implementation can actually handle safely.",
      },
      {
        text: 'Combine generics and varargs judiciously — `@SafeVarargs` (32)',
        detail:
          '`@SafeVarargs` is a manual, unenforced promise from the method author that the hidden array varargs creates behind the scenes is never stored into or leaked — shifting the safety proof that generic array creation would otherwise forbid from the compiler onto a human reviewer.',
      },
      {
        text: 'Typesafe heterogeneous containers via `Class<T>` keys (33)',
        detail:
          'A normal generic container like `Map<K,V>` can only hold one V type per instance — the type token pattern sidesteps that limit by making each individual entry carry its own type (via the Class<T> key), trading a single class-level type parameter for many independent per-entry types.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Effective Java Chapter 5 at a glance',
        headers: ['Item', 'Rule', 'Sound bite'],
        rows: [
          ['26', 'No raw types', 'Raw types opt out of the entire type system'],
          ['27', 'No unchecked warnings', 'Every warning is a deferred ClassCastException'],
          ['28', 'Lists over arrays', 'Fail at compile time, not at runtime'],
          ['29', 'Generify your classes', "Casts in client code are your API's failure"],
          ['30', 'Generify your methods', 'Inference makes them free to call'],
          ['31', 'Bounded wildcards', 'PECS: producer-extends, consumer-super'],
          ['32', 'Varargs with care', '@SafeVarargs, or take a List instead'],
          ['33', 'Type tokens', 'Class<T> keys make containers heterogeneous AND safe'],
        ],
      },
      {
        kind: 'code',
        title: 'Typesafe heterogeneous container (EJ Item 33)',
        code: 'public class Favorites {\n    private final Map<Class<?>, Object> favorites = new HashMap<>();\n\n    public <T> void put(Class<T> type, T instance) {\n        favorites.put(Objects.requireNonNull(type), type.cast(instance));\n    }\n\n    public <T> T get(Class<T> type) {\n        return type.cast(favorites.get(type));   // dynamic cast — provably safe\n    }\n}\n\nFavorites f = new Favorites();\nf.put(String.class, "Java");\nf.put(Integer.class, 42);\nString s = f.get(String.class);   // no cast in client code',
      },
      {
        kind: 'paragraph',
        text: 'The container works because the **key** carries the type: `Class<T>` is a parameterized type token, and `Class.cast` is a checked, type-safe cast. The same idea powers annotation lookups (`getAnnotation(Class<A>)`) and dependency-injection frameworks.',
      },
      {
        kind: 'bestPractice',
        title: 'API design rule of thumb',
        text: 'Generics complexity should concentrate **inside** libraries so client code reads plainly. If callers of your API need explicit type arguments, casts, or wildcard reasoning, redesign. The measure of generic API quality is the absence of generics noise at call sites.',
        detail:
          'This is the practical test for whether a generic API is well-designed: open any calling code and check whether it needs an explicit type witness, a cast, or a comment explaining a wildcard — if it does, the complexity that belongs inside the library has leaked out to every caller instead.',
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 26–33' },
      { book: 'core-java-1', chapter: 'Ch. 8 — Generic Programming' },
    ],
    related: ['wildcards-pecs', 'generics-restrictions', 'collections-overview'],
  },
]
