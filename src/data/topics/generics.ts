import type { Topic } from '../../types/content'

export const topics: Topic[] = [
  {
    id: 'generics-why',
    domainId: 'generics',
    title: 'Why Generics',
    summary:
      'Generics move type errors from runtime to compile time: a `List<String>` can only ever hold strings, and reading from it needs no cast. Raw types exist only for backward compatibility — never write them.',
    keyPoints: [
      'Pre-generics collections held `Object` — every read needed a cast that could fail at runtime',
      'Type parameters document intent and are enforced by the compiler',
      'The diamond `<>` infers type arguments: `new ArrayList<>()`',
      'Raw types (`List` without `<...>`) silently opt out of type checking (EJ 26)',
      '`List<?>` is the safe "list of unknown" — raw `List` is not',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Before and after',
        code: '// Pre-Java-5: trust, then ClassCastException at a distance\nList files = new ArrayList();\nfiles.add("readme.txt");\nfiles.add(42);                              // compiles!\nString f = (String) files.get(1);           // BOOM — at runtime, far from the bug\n\n// Generics: the compiler rejects the bad add\nList<String> names = new ArrayList<>();\nnames.add("readme.txt");\n// names.add(42);                           // compile error — bug caught at source\nString first = names.get(0);                // no cast',
      },
      {
        kind: 'bestPractice',
        title: 'Don\'t use raw types (EJ Item 26)',
        text: 'Raw types exist so pre-generics code keeps compiling. Using them discards the entire safety net: `List` accepts anything and defers the explosion to whoever reads. If the element type is truly unknown, say so with a wildcard: `List<?>` — the compiler then prevents you from adding anything but `null`.',
      },
      {
        kind: 'paragraph',
        text: 'Generics also power the fluent APIs you use daily: `Stream<T>`, `Optional<T>`, `CompletableFuture<T>`, `Map<K,V>`. Understanding variance ([[wildcards-pecs]]) and [[type-erasure]] explains both their signatures and their few sharp edges.',
      },
      {
        kind: 'bestPractice',
        title: 'Eliminate unchecked warnings (EJ Item 27)',
        text: 'Every unchecked warning is a potential runtime `ClassCastException`. Eliminate them; when you provably can\'t, suppress with `@SuppressWarnings("unchecked")` on the **smallest possible scope** and add a comment proving safety.',
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
      'Class-level parameter: `class Pair<T>` — one type variable for the whole instance',
      'Method-level parameter: `<T>` before the return type; independent per call',
      'Type arguments are inferred: `Pair.of("a", 1)` figures out `Pair<String,Integer>`',
      'Conventions: `T` type, `E` element, `K`/`V` key/value, `R` result',
      'Favor generic types and methods over Object-based ones (EJ 29–30)',
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
      '`<T extends Bound>` — T must be a subtype of Bound (class or interface, "extends" covers both)',
      'Multiple bounds: `<T extends Runnable & Comparable<T>>`; the class (if any) comes first',
      'Without a bound, T is implicitly `Object` — only Object\'s methods are callable',
      'The recursive form `<T extends Comparable<? super T>>` is the production-grade signature',
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
      'One class file per generic type — type arguments vanish at runtime',
      'T erases to its first bound (`Object` if unbounded)',
      'The compiler inserts synthetic casts at reads and **bridge methods** for inheritance',
      'No runtime type argument info: `instanceof List<String>` is illegal',
      'Erasure bought seamless migration compatibility with pre-generics code',
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
      },
      {
        kind: 'note',
        title: 'Reflection can still read declarations',
        text: 'Erasure removes type arguments from *objects*, not from *class files\' signatures*: `Field.getGenericType()` and friends expose the declared `List<String>` for fields, parameters, and superclasses — which is how serialization libraries like Jackson do their job. See [[reflection]].',
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
      'Generic types are invariant — a `List<Manager>` is not a `List<Employee>`. Wildcards restore flexibility at API boundaries: `? extends T` for inputs you read from (producers), `? super T` for outputs you write to (consumers).',
    keyPoints: [
      '**PECS**: Producer → `extends`, Consumer → `super` (EJ 31)',
      'From a `List<? extends T>` you can only **read** T\'s — adds are rejected',
      'Into a `List<? super T>` you can only **write** T\'s — reads give `Object`',
      'Wildcards belong in method signatures, not return types or fields',
      'Unbounded `<?>`: "some specific type, unknown here" — read-only, null-add-only',
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
      },
      {
        kind: 'pitfall',
        title: 'Wildcard capture',
        text: 'Inside a method taking `List<?>` you cannot even `list.set(0, list.get(0))` — the compiler treats each `?` use independently. The fix is a private generic helper `<T> void swapHelper(List<T> l, ...)` that "captures" the wildcard into a nameable T.',
      },
      {
        kind: 'note',
        title: 'Arrays chose the opposite trade-off',
        text: 'Arrays are covariant and pay with runtime `ArrayStoreException` ([[arrays]]); generics are invariant and pay with wildcard ceremony — but fail at compile time. This is why lists and arrays combine so poorly ([[generics-restrictions]]).',
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
      'No primitive type arguments — `List<int>` is illegal; boxing or specialized streams instead',
      'No `new T()` / `new T[]` — pass a `Class<T>` token or `IntFunction<T[]>` like `String[]::new`',
      'No generic array creation: `new List<String>[10]` is illegal (heap pollution)',
      'Static fields/methods cannot use the class\'s type parameter',
      'No `catch (T e)`, no generic `Throwable` subclasses',
      'Overloads that erase to the same signature clash',
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
      },
      {
        kind: 'note',
        title: 'Static context',
        text: '`class Box<T> { static T last; }` is illegal — statics are shared across *all* instantiations, and there is only one erased class. Generic *static methods* declaring their own `<T>` are fine.',
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
      'Don\'t use raw types (26); eliminate unchecked warnings (27)',
      'Prefer lists to arrays in APIs (28)',
      'Favor generic types (29) and generic methods (30)',
      'Bounded wildcards for flexible APIs — PECS (31)',
      'Combine generics and varargs judiciously — `@SafeVarargs` (32)',
      'Typesafe heterogeneous containers via `Class<T>` keys (33)',
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
          ['29', 'Generify your classes', 'Casts in client code are your API\'s failure'],
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
      },
    ],
    refs: [
      { book: 'effective-java', chapter: 'Items 26–33' },
      { book: 'core-java-1', chapter: 'Ch. 8 — Generic Programming' },
    ],
    related: ['wildcards-pecs', 'generics-restrictions', 'collections-overview'],
  },
]
