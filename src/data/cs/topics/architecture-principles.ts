import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'solid-principles',
    domainId: 'architecture-principles',
    title: 'SOLID Principles',
    summary:
      'Five guidelines for object-oriented design — SRP, OCP, LSP, ISP, DIP — aimed at one goal: let the system change without every change rippling outward. They are heuristics to weigh, not laws to obey blindly.',
    keyPoints: [
      {
        text: 'SRP — a module should have one reason to change: one responsibility, one *actor* it answers to',
        detail: '"Actor" is the operative word, not "thing" — two pieces of logic can look like the same responsibility to a programmer while actually serving two different stakeholders who change their requirements independently. The class only has one reason to change when it answers to exactly one of them.',
      },
      {
        text: 'OCP — open for extension, closed for modification: add behavior without editing working code',
        detail: 'Editing working, already-tested code to add a new case is what reintroduces risk into something that was previously verified — every edit is a chance to break a case that used to work. OCP\'s bet is that a well-chosen abstraction lets new behavior arrive as new code (a new subclass, a new implementation) that cannot disturb the old, unedited code at all.',
      },
      {
        text: 'LSP — subtypes must be substitutable for their base type without surprising callers',
        detail: 'Substitutability is about behavior, not just matching method signatures — a subtype can satisfy the compiler completely while still violating LSP if it does something a caller of the base type would never expect (throwing where the base type never did, silently changing shared state). The type system checks the shape of the contract; LSP is about honoring its spirit.',
      },
      {
        text: 'ISP — many small, client-specific interfaces beat one fat interface nobody fully needs',
        detail: 'A fat interface forces every implementer to provide (or stub out) methods it has no use for, and forces every client to depend — and potentially recompile — on methods it never calls. Splitting it along client needs means a class only depends on, and only breaks because of, the slice of behavior it actually uses.',
      },
      {
        text: 'DIP — depend on abstractions, not concretions (see [[dependency-inversion-and-injection]])',
        detail: 'A high-level policy that directly instantiates and calls a low-level detail is coupled to every future change in that detail — swap the database driver or the notification mechanism and the policy code has to change too, even though the actual business rule never did. Depending on an interface the policy owns lets the detail change freely underneath it.',
      },
      {
        text: 'Applied dogmatically to code that never changes, SOLID is pure overhead — it earns its keep on code under active change',
        detail: 'Every one of these principles buys flexibility at the cost of an extra layer of indirection (an interface, a smaller class, an injected dependency) — a real cost paid up front. Code that will never be touched again pays that cost for a flexibility benefit it will never collect; SOLID is a bet on future change, and the bet only pays off where change is actually likely.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The five principles, and the smell each one prevents',
        headers: ['Principle', 'Rule', 'Smell it prevents'],
        rows: [
          ['SRP', 'One reason to change', 'Divergent Change — unrelated edits keep colliding in one class'],
          ['OCP', 'Extend without modifying', 'Every new case means editing (and re-testing) old, working code'],
          ['LSP', 'Subtypes honor the base contract', 'Callers riddled with `instanceof` checks to work around a subtype'],
          ['ISP', 'Slim, client-specific interfaces', 'Implementers forced to stub methods they have no use for'],
          ['DIP', 'Depend on abstractions', 'High-level policy wired directly to low-level, volatile detail'],
        ],
      },
      {
        kind: 'paragraph',
        text: '**SRP** is the most misquoted: it does not mean "a class should do one *thing*" in some atomic sense, but that it should answer to one *actor* — one stakeholder or reason to change. A class that both formats a report for Finance and validates it for Compliance has two actors; a change requested by one can break the other\'s expectations without anyone noticing until it ships.',
      },
      {
        kind: 'code',
        title: 'SRP: two actors, one class → split by reason to change',
        code: 'class Invoice {\n    double calculateTotal() { /* business rule Finance owns */ }\n    String toHtml() { /* presentation Marketing owns */ }\n    void saveToDatabase() { /* persistence Ops owns */ }\n}\n\n// Three actors, three reasons to change → three classes:\nclass Invoice { double calculateTotal() { /* ... */ } }\nclass InvoiceHtmlView { String render(Invoice invoice) { /* ... */ } }\nclass InvoiceRepository { void save(Invoice invoice) { /* ... */ } }',
      },
      {
        kind: 'paragraph',
        text: '**OCP** is achieved through abstraction, not foresight: you don\'t need to predict every future case, just make sure new cases can be *added* as new code (a new subclass, a new `Strategy`) rather than edits to existing, tested code. A `switch` on a type code that keeps growing new `case`s is the opposite of OCP — see [[composing-methods-and-conditionals]] for the refactoring that replaces it with polymorphism.',
      },
      {
        kind: 'pitfall',
        title: 'LSP: the classic Square-extends-Rectangle trap',
        text: 'Mathematically a square is a rectangle, so `Square extends Rectangle` looks reasonable — until `setWidth`/`setHeight` on a `Rectangle` reference silently also change the other dimension on a `Square`, breaking any code that assumed setting one didn\'t affect the other. LSP violations hide in behavior, not signatures: the types check out, but the *contract* — what callers are entitled to assume — doesn\'t hold. If a subtype needs `instanceof` checks or narrows preconditions/widens postconditions in surprising ways, it isn\'t really substitutable.',
        detail: 'The trap is specifically that this compiles cleanly and looks conceptually correct (squares genuinely are rectangles, mathematically) — nothing in the type signatures reveals the problem. It only surfaces at runtime, in a caller that held a `Rectangle` reference and never expected setting one dimension to silently move the other, which is exactly the kind of contract violation LSP exists to name.',
      },
      {
        kind: 'note',
        title: 'ISP guards the blast radius of interface change',
        text: 'A fat interface with twelve methods means every implementer depends on all twelve, even if it only uses two — and every implementer recompiles/redeploys when any of the twelve changes. Splitting it into narrow, role-specific interfaces (`Readable`, `Writable` instead of one `Storage`) means a class depends only on what it actually calls, shrinking its blast radius when unrelated methods change.',
        detail: '"Blast radius" is the key idea: a change to method #7 of a twelve-method interface should only affect implementers and callers who actually use method #7, but a fat interface makes it affect all twelve implementers whether they touch that method or not, since they all formally depend on the whole interface.',
      },
      {
        kind: 'bestPractice',
        title: 'Treat DIP as the mechanism that makes the other four affordable',
        text: 'SRP, OCP, and ISP all ask for more, smaller units — which only stays manageable if those units are wired together through abstractions instead of concrete `new`s scattered everywhere. DIP (depend on interfaces; let something else supply the implementation) is what keeps that decomposition from turning into a tangle. See [[dependency-inversion-and-injection]] for the mechanics.',
        detail: 'Splitting a system into many small, single-responsibility pieces (per SRP/ISP) only reduces coupling if those pieces reference each other through stable abstractions — wire them together with direct concrete references instead, and the "many small classes" just becomes many small classes tightly wired to each other, which is arguably worse than fewer, larger ones.',
      },
    ],
    refs: [
      { book: 'clean-architecture', chapter: 'Part III — Design Principles (Ch. 7–11)' },
      { book: 'head-first-patterns', chapter: 'Ch. 1 — Intro to Design Patterns (OO principles)' },
    ],
    related: ['coupling-and-cohesion', 'dependency-inversion-and-injection', 'code-smells', 'creational-patterns'],
  },

  {
    id: 'coupling-and-cohesion',
    domainId: 'architecture-principles',
    title: 'Coupling & Cohesion',
    summary:
      'Cohesion measures how tightly a module\'s own responsibilities belong together; coupling measures how tightly it is bound to other modules. Every durable design heuristic — SRP, layering, component boundaries — is really an argument for raising one and lowering the other.',
    keyPoints: [
      {
        text: 'High cohesion: everything inside a module serves one purpose and changes together',
        detail: '"Changes together" is the practical test — if two pieces of a class are only ever edited for unrelated reasons, on unrelated schedules, that is a sign they do not actually belong in the same module regardless of how related they seem conceptually.',
      },
      {
        text: 'Low coupling: modules interact through narrow, stable interfaces and know little about each other\'s internals',
        detail: '"Know little" is what makes independent change possible — a module that only knows another\'s narrow public interface can have that other module\'s internals rewritten entirely without noticing, while a module that knows internal details breaks the moment those details change, even if the externally-visible behavior did not.',
      },
      {
        text: 'Coupling spectrum (tightest → loosest): content, common, control, stamp, data',
        detail: 'The spectrum is ordered by how much of the other module a dependency actually exposes itself to — content coupling reaches directly into internals (maximum exposure), while data coupling passes only the specific primitive values needed (minimum exposure) — and every step down the list is a strictly safer way to share information between two modules.',
      },
      {
        text: 'Cohesion spectrum (weakest → strongest): coincidental, logical, temporal, procedural, communicational, functional',
        detail: 'Each level up this spectrum ties the module\'s contents together for a stronger reason: coincidental cohesion means the contents share nothing but a file (weakest), while functional cohesion means every piece exists to accomplish one single, well-defined purpose (strongest) — the spectrum is effectively a ranked list of "why do these things live together," from no reason to the best possible reason.',
      },
      {
        text: 'Afferent (Ca) / efferent (Ce) coupling counts and instability I = Ce / (Ca + Ce) make coupling measurable, not just a feeling',
        detail: 'Turning coupling into a ratio means two components can be objectively compared instead of just eyeballed — a component with I close to 0 has many dependents and few dependencies (safe to keep stable), while one with I close to 1 has few dependents and many dependencies (safe to change often), and the formula gives a number instead of an opinion.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Coupling, tightest to loosest',
        headers: ['Kind', 'What\'s shared', 'Why it\'s costly'],
        rows: [
          ['Content', 'One module reaches into another\'s internals directly', 'Any internal change breaks the caller — no encapsulation at all'],
          ['Common', 'Modules share global/mutable state', 'Hidden channel of influence; order-of-execution bugs'],
          ['Control', 'One module passes a flag telling another *how* to behave', 'Caller must know callee\'s internal logic to pick the flag'],
          ['Stamp', 'A whole object passed when only a few fields are used', 'Caller depends on fields it doesn\'t need — any of them changing risks breakage'],
          ['Data', 'Only primitive/simple data passed, exactly what\'s needed', 'The loosest practical form — the goal to aim for'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Cohesion is the mirror image: a class with **functional cohesion** does one well-defined thing end to end (a `TaxCalculator`); one with **coincidental cohesion** bundles unrelated methods that happen to live in the same file (a `Utils` class with string helpers, date helpers, and network helpers). Low cohesion doesn\'t crash anything — it just means the class has no reason to exist as a unit, and every change to it risks disturbing unrelated callers.',
      },
      {
        kind: 'code',
        title: 'Stamp coupling → data coupling',
        code: '// Stamp coupling: whole Customer passed, only the email is used —\n// this method now depends on every field Customer has.\nvoid sendReceipt(Customer customer, Order order) {\n    mailer.send(customer.getEmail(), order.toReceiptText());\n}\n\n// Data coupling: depends only on the data it actually needs.\nvoid sendReceipt(String recipientEmail, String receiptText) {\n    mailer.send(recipientEmail, receiptText);\n}',
      },
      {
        kind: 'note',
        title: 'Making coupling a number: Ca, Ce, and instability',
        text: 'Afferent coupling (Ca) counts classes *outside* a component that depend on it; efferent coupling (Ce) counts classes *inside* it that depend on something outside. Instability I = Ce / (Ca + Ce) ranges from 0 (maximally stable — many depend on it, it depends on nothing, so it should rarely change) to 1 (maximally unstable — depends on everything, nothing depends on it, safe to change often). Stable components should be abstract; volatile ones concrete — see [[component-principles]] (the Stable Dependencies and Stable Abstractions principles) for the design rule this metric backs.',
        detail: 'The two counts capture opposite risks: high Ca means many things break if this component changes (so it had better be stable), while high Ce means this component breaks whenever any of the things it depends on changes (so it is inherently volatile regardless of intent). A component with both high Ca and high Ce is in the worst position — depended on heavily while also depending on much — and the instability formula makes that tension visible as a single number instead of leaving it implicit.',
      },
      {
        kind: 'pitfall',
        title: 'Low cohesion causes shotgun surgery',
        text: 'When responsibilities that logically belong together are scattered across unrelated classes, one conceptual change (e.g. "add a new payment method") requires touching a dozen files instead of one. This is the **Shotgun Surgery** smell ([[code-smells]]) — it is a cohesion problem wearing a change-management costume, and the fix is almost always to move the scattered pieces back together (Move Method/Field, see [[refactoring-catalog-core]]).',
        detail: 'The symptom (many small edits scattered across many files for one logical change) is easy to notice; the cause (low cohesion — pieces that belong together were never grouped together) is easy to miss, because each individual scattered edit looks small and reasonable in isolation. Recognizing the pattern across several "simple" changes is what reveals the real, structural problem.',
      },
    ],
    refs: [
      { book: 'clean-architecture', chapter: 'Ch. 12–14 — Component Coupling' },
      { book: 'refactoring-fowler', chapter: 'Ch. 3 — Bad Smells in Code' },
    ],
    related: ['solid-principles', 'component-principles', 'code-smells'],
  },

  {
    id: 'component-principles',
    domainId: 'architecture-principles',
    title: 'Component Principles',
    summary:
      'Six principles for grouping classes into deployable components and wiring the components together: three about what belongs in a component (REP, CCP, CRP), three about how components should depend on each other (ADP, SDP, SAP).',
    keyPoints: [
      {
        text: 'REP — the granule of reuse is the granule of release: a component is a unit you can version and release, not just a folder',
        detail: 'The unit you can version, release, and hand to another team as a coherent whole is the real granule of reuse — if pulling in one class means dragging along a dozen others that happen to share a folder but not a release cadence, the "component" is just a directory, not something anyone can safely depend on in isolation.',
      },
      {
        text: 'CCP — classes that change for the same reason, at the same time, belong in the same component (a packaging-level SRP)',
        detail: 'This is SRP scaled up from class to component: a component that mixes classes with different reasons to change forces its dependents to accept a release for change A when they only wanted the fix for change B — grouping by "changes together" keeps a release meaningful as a single, coherent unit.',
      },
      {
        text: 'CRP — don\'t force clients to depend on classes they don\'t use just because they share a component with ones they do',
        detail: 'If a component bundles classes with unrelated purposes, every client is forced to depend on — and get a new release for — bug fixes and changes to classes it never even imports, purely because they happen to live in the same jar. CRP is the argument for splitting a component along client usage rather than convenience.',
      },
      {
        text: 'ADP — the component dependency graph must have no cycles',
        detail: 'A cycle means neither component can be built, tested, or released without the other — the two are effectively one component wearing two names, and any attempt to change one in isolation ripples through the cycle indefinitely. Breaking the cycle (usually via an extracted interface, per DIP) is what makes independent release possible again.',
      },
      {
        text: 'SDP — depend in the direction of stability (toward components with low instability I)',
        detail: 'Depending toward a less-stable component means a component with many dependents (hard to change safely) is now also relying on something volatile — the worst combination, because instability upstream becomes instability everywhere downstream. Pointing dependencies toward lower-I components keeps the parts that are hardest to change insulated from the parts most likely to change.',
      },
      {
        text: 'SAP — a component should be as abstract as it is stable; stable-and-concrete components become rigid',
        detail: 'A component that is both stable (many things depend on it) and concrete is stuck: it cannot easily change because too much depends on it, yet it offers no abstraction that lets dependents tolerate the parts of it that do change. Pairing high stability with high abstractness (mostly interfaces) is what lets a stable component keep evolving its implementation details without breaking anyone.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Cohesion trio vs. coupling trio',
        headers: ['Group', 'Principle', 'Tension'],
        rows: [
          ['Cohesion', 'REP, CCP, CRP', 'REP/CCP push components *larger* (bundle what changes together); CRP pushes them *smaller* (don\'t bundle what unrelated clients don\'t need)'],
          ['Coupling', 'ADP, SDP, SAP', 'Keep the dependency graph acyclic, pointed toward stability, and keep stable things abstract'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The three cohesion principles are in real tension, and every component design is a trade-off between them: maximize REP/CCP and you get large components that are easy to release together but drag in classes a given client doesn\'t need (hurting CRP); maximize CRP and you get many tiny, precisely-scoped components with release-coordination overhead. Early in a project, teams typically favor CCP (fewer components, less release ceremony); as reuse grows, the balance shifts toward CRP.',
      },
      {
        kind: 'note',
        title: 'Breaking a dependency cycle (ADP)',
        text: 'If component A depends on B and B depends on A, changes ripple in both directions forever and neither can be released independently. The standard fix is the **Dependency Inversion Principle** applied at component scale: extract the interface that B actually needs from A into a new component (or into B itself) so A depends on that abstraction instead of on B directly — turning the cycle into a directed acyclic graph. This is the same move as [[dependency-inversion-and-injection]], one level up.',
        detail: 'The fix works because the new interface is something A already needed conceptually — it just wasn\'t explicit — so extracting it doesn\'t add new behavior, only redirects the dependency arrow. The cycle disappears not by removing a relationship, but by inserting an abstraction between the two concrete sides of it.',
      },
      {
        kind: 'paragraph',
        text: 'SDP formalizes "depend on things more stable than you": using the instability metric I = Ce/(Ca+Ce) from [[coupling-and-cohesion]], every dependency arrow should point from a higher-I component to a lower-I one. SAP then says a component\'s abstractness should track its stability — a stable component (many depend on it) that is also concrete becomes **rigid**: hard to change, and everyone depending on it feels every change. The fix is to push abstractions (interfaces) into the stable component and concrete, volatile implementations into unstable ones that depend on it — which is exactly the shape [[clean-architecture-boundaries]] describes at the whole-system scale.',
      },
      {
        kind: 'pitfall',
        title: 'The "zone of pain" and the "zone of uselessness"',
        text: 'Plotting components by abstractness against instability reveals two danger zones: maximally stable-and-concrete components (the *zone of pain* — rigid, everyone depends on them, they never change but are painful when they must) and maximally unstable-and-abstract components (the *zone of uselessness* — interfaces nobody implements or depends on). Healthy components sit near the "main sequence" line connecting stable-abstract to unstable-concrete.',
        detail: 'Neither zone is intrinsically wrong in isolation — some genuinely stable, concrete code (a well-tested date library) is fine to sit in the zone of pain because it truly never changes — but a stable-concrete component that *does* need to evolve, or an abstract-unstable one nobody ever implements, is a sign the component\'s abstractness and stability were never deliberately matched.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 12–14 — Component Cohesion and Coupling' }],
    related: ['coupling-and-cohesion', 'clean-architecture-boundaries', 'dependency-inversion-and-injection'],
  },

  {
    id: 'clean-architecture-boundaries',
    domainId: 'architecture-principles',
    title: 'Clean Architecture Boundaries',
    summary:
      'The Dependency Rule: source-code dependencies may only point inward, from mechanism toward policy. Concentric layers — Entities, Use Cases, Interface Adapters, Frameworks & Drivers — keep business rules ignorant of the database, the UI, and the framework du jour.',
    keyPoints: [
      {
        text: 'Dependency Rule: nothing in an inner circle may know anything about an outer circle',
        detail: 'The rule is directional on purpose: an inner circle knowing about an outer one would mean business rules depend on — and break when — the database schema or UI framework changes, which is exactly backwards from what should be volatile versus stable. Nothing forbids an outer ring from knowing about an inner one; that direction is how the whole architecture holds together.',
      },
      {
        text: 'Entities = enterprise-wide business rules; Use Cases = application-specific business rules that orchestrate entities',
        detail: 'The split matters because these two kinds of rule change for different reasons and at different rates: Entities encode truths that would hold even if the specific application didn\'t exist (what a loan is), while Use Cases encode this particular system\'s workflow (how this application originates a loan) — conflating them means a workflow tweak risks corrupting a rule that should have been stable forever.',
      },
      {
        text: 'Interface Adapters translate between use-case-friendly data and framework/DB/UI-friendly data',
        detail: 'This ring exists so neither side has to compromise its own natural shape for the other\'s sake — the use case doesn\'t contort its inputs to match an HTTP request format, and the framework doesn\'t have to understand domain vocabulary. Controllers and Presenters do the translation work so both the domain and the delivery mechanism can stay idiomatic to themselves.',
      },
      {
        text: 'Frameworks & Drivers (web framework, database, UI toolkit) are the outermost, most volatile, most replaceable ring',
        detail: 'Volatility is exactly why this ring sits outermost: the web framework version, the database vendor, and the UI toolkit are the things most likely to change over a system\'s lifetime for reasons that have nothing to do with the business rules, so isolating them at the boundary means those changes stay contained instead of rippling into Use Cases or Entities.',
      },
      {
        text: 'Crossing a boundary inward-to-outward uses an interface owned by the inner ring; the outer ring implements it (dependency inversion in practice)',
        detail: 'Ownership of the interface is the crux — it belongs to the inner ring because the inner ring defines what it needs, not how the outer ring provides it. This inverts what would otherwise be a naive outward dependency (a use case importing a concrete `SqlUserRepository`) into an inward one (both sides depend on `UserRepository`, which the use case owns), keeping the Dependency Rule intact across the boundary.',
      },
      {
        text: 'Data crossing boundaries should be simple structures (DTOs), never framework/ORM entities leaking into business rules',
        detail: 'A DTO carries no behavior tied to a framework and no lazy-loading traps — it\'s inert data, so passing it across a boundary can\'t accidentally drag the framework\'s runtime assumptions along with it. An ORM entity or framework request object, by contrast, is often unusable outside the context (open transaction, active HTTP request) that created it, which is precisely the kind of hidden coupling the boundary is supposed to prevent.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The four rings, outside in',
        headers: ['Ring', 'Contains', 'Knows about'],
        rows: [
          ['Frameworks & Drivers', 'Web framework, DB driver, UI, external services', 'Everything inward'],
          ['Interface Adapters', 'Controllers, Presenters, Gateways', 'Use Cases\' interfaces; converts to/from framework shapes'],
          ['Use Cases', 'Application-specific business rules (interactors)', 'Entities only'],
          ['Entities', 'Enterprise-wide business rules and data', 'Nothing outward — pure domain logic'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The Dependency Rule is the one non-negotiable constraint: "source code dependencies can only point inwards." A `UserRepository` interface lives with the use case that needs it (inner ring); a `SqlUserRepository` implementation lives in the outer ring and implements that interface. The use case never imports anything from the persistence framework — it depends on an abstraction it owns, and the database code depends on that abstraction too, just from the other side. This is [[dependency-inversion-and-injection]] applied at the architectural seam, and it is what makes the business rules testable without a real database ([[testing-philosophy]]).',
      },
      {
        kind: 'code',
        title: 'Crossing the boundary through an owned interface',
        code: '// Inner ring (use case) defines what it needs, in its own vocabulary:\npublic interface UserRepository {\n    Optional<User> findById(String id);\n}\n\npublic class RegisterUserInteractor {\n    private final UserRepository users;   // depends on the abstraction, not on SQL\n    RegisterUserInteractor(UserRepository users) { this.users = users; }\n    // ... business rule uses `users` without knowing it is Postgres, Mongo, or memory\n}\n\n// Outer ring (frameworks & drivers) implements it:\npublic class PostgresUserRepository implements UserRepository {\n    public Optional<User> findById(String id) { /* SQL here */ }\n}',
      },
      {
        kind: 'note',
        title: 'The Humble Object pattern at the boundary',
        text: 'Some things are inherently hard to unit test — a UI widget, a database gateway. The Humble Object pattern splits such code into two: a thin, "humble" piece with almost no logic (hard to test, but there\'s barely anything to get wrong) and a testable piece holding all the actual decisions. A `Presenter` that computes what to display (testable) feeding a `View` that just paints it (humble) is the classic instance. It is how boundary code stays honest to the Dependency Rule without sacrificing testability.',
        detail: 'Splitting rather than trying to test the hard-to-test piece directly is the key move: instead of fighting to unit-test a UI widget or DB gateway (slow, brittle, requires the real infrastructure), all the actual logic is pulled out into a plain object that needs no infrastructure to test, leaving behind a "humble" shell so simple that manual or integration testing of it is enough.',
      },
      {
        kind: 'pitfall',
        title: 'Leaking the ORM entity into the business rules',
        text: 'Passing a JPA `@Entity` or a framework request/response object straight into use-case logic silently violates the Dependency Rule: the business rule now depends on the ORM\'s annotations and lifecycle (lazy loading, detached-entity exceptions) even though no `import` makes that obvious. Map to plain domain objects at the boundary — the extra mapping code is the cost of keeping business rules ignorant of infrastructure, and it is cheap compared to the alternative of a domain model that can\'t be instantiated without a database connection.',
        detail: 'The danger is that this compiles and often even works in the demo — the mapping code is exactly the boilerplate that looks safe to skip under deadline pressure — but it means a unit test of the business rule now needs a real (or heavily mocked) persistence context just to construct the objects it operates on, which quietly destroys the testability the whole boundary was built to protect.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 22 — The Clean Architecture' }],
    related: ['dependency-inversion-and-injection', 'component-principles', 'use-case-driven-design'],
  },

  {
    id: 'dependency-inversion-and-injection',
    domainId: 'architecture-principles',
    title: 'Dependency Inversion & Injection',
    summary:
      'Three related but distinct ideas get conflated under "DI": the Dependency Inversion **Principle** (depend on abstractions), Dependency **Injection** (a technique for supplying those abstractions from outside), and an IoC **container** (one optional tool for wiring injections automatically). You can have the first two without ever touching a container.',
    keyPoints: [
      {
        text: 'DIP: high-level modules should not depend on low-level modules — both should depend on abstractions',
        detail: '"Both should depend on abstractions" is the part that gets lost in casual retellings — it isn\'t enough for the low-level module to implement an interface if the high-level module still imports the low-level module\'s package to get it. The abstraction has to be owned by (or at least sit alongside) the high-level policy, so the dependency arrow actually inverts rather than just adding an interface on top of the same direction.',
      },
      {
        text: 'Dependency Injection: a class receives its collaborators (via constructor, ideally) rather than constructing them itself',
        detail: 'Constructing a collaborator internally (`new SmtpMailer()`) welds the class to that specific concrete choice forever, invisibly — nothing in the class\'s public surface reveals the dependency. Receiving it as a parameter makes the dependency part of the class\'s declared contract, visible to every caller and swappable by every caller, without touching the class\'s own code.',
      },
      {
        text: 'An IoC container automates wiring injections but is a convenience, not a requirement — "poor man\'s DI" (plain constructors) works fine at small scale',
        detail: 'A container\'s job is purely mechanical — instantiate objects in dependency order and wire them together — which is exactly what a `main` method or a handful of factory methods already do for a small object graph. The container starts earning its keep when that wiring becomes large, conditional, or scoped enough that doing it by hand would itself become an error-prone, hard-to-navigate piece of code.',
      },
      {
        text: 'Constructor injection over field/setter injection: dependencies become explicit, final, and impossible to forget',
        detail: 'A `final` field set only in the constructor cannot exist half-initialized — the compiler refuses to build an object missing a required collaborator. Setter injection has no equivalent guarantee: the object is fully constructed and handed out the moment `new` returns, dependency or no dependency, and the missing piece only surfaces later as a null-pointer failure at the call site that needed it.',
      },
      {
        text: 'DI is what makes swapping a real collaborator for a test double trivial — the core enabler behind [[testing-philosophy]]',
        detail: 'Because the dependency arrives from outside rather than being constructed inside, a test can hand the class a fake, stub, or mock implementing the same interface with zero changes to the class under test — the class has no way to tell the difference between the real collaborator and the test double, which is precisely what makes true unit isolation possible.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Inverted: the high-level class depends on an interface it owns',
        code: '// Before: OrderService is welded to a concrete, volatile detail.\nclass OrderService {\n    private final SmtpMailer mailer = new SmtpMailer();  // hard-coded, untestable\n    void placeOrder(Order o) { /* ... */ mailer.send(o.confirmationEmail()); }\n}\n\n// After: depends on an abstraction; the concrete choice is supplied from outside.\ninterface Notifier { void send(String message); }\n\nclass OrderService {\n    private final Notifier notifier;\n    OrderService(Notifier notifier) { this.notifier = notifier; }   // constructor injection\n    void placeOrder(Order o) { /* ... */ notifier.send(o.confirmationEmail()); }\n}',
      },
      {
        kind: 'table',
        caption: 'Three ideas, one abbreviation',
        headers: ['Term', 'What it is', 'Required?'],
        rows: [
          ['DIP', 'A design principle: depend on abstractions, not concretions', 'Foundational — the goal'],
          ['Dependency Injection', 'A technique: pass collaborators in instead of constructing them', 'The mechanism — usually via constructor'],
          ['IoC Container', 'A tool that constructs the object graph and injects automatically', 'Optional — helpful at scale, unnecessary for a small app'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Service Locator hides dependencies instead of exposing them',
        text: 'An alternative to injection is having a class reach into a global registry (`ServiceLocator.get(Mailer.class)`) to fetch what it needs. It looks like it solves the same problem, but it doesn\'t: the class\'s dependencies are no longer visible in its constructor signature, so nothing forces callers (or tests) to notice what it needs, and swapping an implementation for a test means manipulating global state instead of passing an argument. Prefer injection — dependencies that show up in the constructor are dependencies you cannot forget.',
        detail: 'The failure mode is specifically that everything still compiles and runs — the missing dependency only surfaces at runtime, inside whatever method first calls `ServiceLocator.get(...)`, often far from the class\'s own construction. Tests inherit the same problem: isolating a class under test means resetting or stubbing global registry state instead of simply passing an argument, which is strictly more fragile.',
      },
      {
        kind: 'bestPractice',
        title: 'Make missing dependencies a compile error, not a runtime surprise',
        text: 'Constructor injection with `final` fields means an object can never exist in a half-wired state — leave out a required collaborator and the code doesn\'t compile. Setter injection allows a fully-constructed-but-not-ready object to exist, silently, until something calls a method that needed the missing setter.',
        detail: 'The gap between the two failure modes is the whole argument: a missing constructor argument is caught by the compiler before the code ever runs, on every build, for every developer — a missing setter call is caught only if and when some test or production path happens to exercise the method that needed it, which for a rarely-hit branch could be a long time after the bug shipped.',
      },
      {
        kind: 'note',
        title: 'When a container earns its complexity',
        text: 'A handful of classes can be wired by hand in a `main` method ("poor man\'s DI") with zero extra machinery — completely legitimate. A container (Spring, Guice, ...) starts paying for itself once the object graph is large enough that manual wiring becomes its own maintenance burden, or when lifecycle concerns (scopes, lazy proxies, configuration profiles) are genuinely needed. Reaching for one on a small app just to "do DI properly" adds indirection with no matching benefit.',
        detail: 'The cost of a container isn\'t the dependency it adds to the build — it\'s the loss of a plain, click-able "who constructs this" trail, replaced by classpath scanning, annotations, and configuration that require understanding the container\'s own conventions to trace. That trade only pays off once manual wiring has itself become the harder thing to maintain.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 11 — DIP; Ch. 25 — Layers and Boundaries' }],
    related: ['solid-principles', 'clean-architecture-boundaries', 'architectural-styles'],
  },

  {
    id: 'architectural-styles',
    domainId: 'architecture-principles',
    title: 'Architectural Styles',
    summary:
      'Layered, hexagonal (ports and adapters), and microservices are different granularities of the same underlying move — isolate policy from mechanism — trading simplicity for deployability, and in-process coupling for network coupling.',
    keyPoints: [
      {
        text: 'Layered: simplest to reason about; risk is layers becoming leaky ("just this once, skip the service layer")',
        detail: 'The layering itself is easy to draw on a whiteboard — the risk lives entirely in discipline over time. Each individual "just this once" shortcut (a controller calling the repository directly, skipping the service layer) looks harmless in isolation, but a codebase accumulates enough of them and the layers stop meaning anything, leaving the diagram as documentation of an architecture the code no longer follows.',
      },
      {
        text: 'Hexagonal / ports & adapters: the domain core exposes ports (interfaces); adapters plug in UI, DB, messaging around it — same intent as [[clean-architecture-boundaries]]',
        detail: 'The renaming is largely cosmetic — "ports" are the interfaces the domain core owns, "adapters" are the outer-ring implementations that plug into them — but the vocabulary shift is useful because it frames the domain core as something that should be pluggable on *every* side (UI in, DB out, messaging either direction), not just insulated from one specific layer below it.',
      },
      {
        text: 'Microservices: independently deployable services, each owning its data; buys team/deployment autonomy, taxes you with distributed-systems problems (network failure, eventual consistency, versioning across services)',
        detail: 'The autonomy is real — a team can deploy, scale, and even choose a different tech stack for their service without coordinating with anyone else — but it\'s paid for with problems a monolith never has to solve at all: what happens when a network call times out mid-request, how two services\' data stays consistent without a shared transaction, and how to change a service\'s API without breaking every other service still calling the old one.',
      },
      {
        text: '"Monolith first": most systems don\'t know their true service boundaries on day one — starting modular-monolith and extracting services once boundaries are proven is often cheaper than guessing upfront',
        detail: 'Drawing service boundaries requires already knowing which parts of the system change together and which don\'t — information a young system usually doesn\'t have yet, because the domain itself is still being discovered. A modular monolith keeps the option to redraw a wrong boundary cheap (move some classes between packages); a wrong microservice boundary is expensive to undo (renegotiate an API, migrate data, redeploy two teams\' services in lockstep).',
      },
      {
        text: 'A distributed monolith — services that must deploy together and share a database — has all of microservices\' operational cost with none of its independence benefit',
        detail: 'It ends up with the worst of both worlds because deployment coupling didn\'t actually go away — it just moved from "one build, one deploy" (cheap, atomic) to "several builds that must land together" (the same coordination burden, now spread across separate CI/CD pipelines and prone to partial rollout failures) — while still paying microservices\' full network and operational tax for no independence in return.',
      },
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Same intent, different granularity',
        headers: ['Style', 'Unit of isolation', 'Deployability', 'Main tax'],
        rows: [
          ['Layered', 'In-process layer (UI / service / data)', 'One deployable unit', 'Layers leak under time pressure'],
          ['Hexagonal', 'Domain core vs. adapters', 'One deployable unit (usually)', 'Discipline to keep the core pure'],
          ['Microservices', 'Independently deployable service', 'Each service deploys alone', 'Network calls, partial failure, data consistency across services'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Hexagonal architecture and Clean Architecture are close cousins: both put the domain model at the center, both forbid it from depending on infrastructure, both use interfaces ("ports" in hexagonal terms) to let infrastructure ("adapters") plug in from the outside. The vocabulary differs; the Dependency Rule ([[clean-architecture-boundaries]]) is the same idea either way.',
      },
      {
        kind: 'note',
        title: 'Microservices trade coupling, they don\'t remove it',
        text: 'Splitting a monolith into services doesn\'t eliminate coupling between the pieces of a system that genuinely depend on each other — it moves that coupling from an in-process method call (fast, transactional, type-checked) to a network call (slow, partial-failure-prone, versioned separately). That trade is worth it when the boundary really is a natural seam — different scaling needs, different teams, different release cadence — and expensive overhead when it isn\'t.',
        detail: 'This is the point most "should we do microservices" arguments miss: the total amount of coupling in a system that genuinely has interdependent parts does not shrink just because those parts moved into different processes — it just changes shape and cost, from a compiler-checked, transactional call to a network call that can fail, be slow, or be answered by a different version than the caller expects.',
      },
      {
        kind: 'pitfall',
        title: 'The distributed monolith',
        text: 'Splitting code into separately-deployed services while they still share a database, must be deployed together to avoid breaking each other, or communicate through synchronous chains several services deep, produces a system with microservices\' full operational cost (network calls, service discovery, monitoring N processes) and none of the payoff (you still can\'t deploy or scale them independently). This usually means the service boundaries were drawn along technical lines, not along real business/data-ownership boundaries — see [[use-case-driven-design]] for how boundaries should actually be found.',
        detail: 'The tell is almost always in the deploy process — if shipping a change to one service regularly requires also shipping changes to two or three others in the same release window to avoid breakage, the boundaries were drawn somewhere other than along the seams where the data and the responsibility naturally split, and the split bought operational overhead without buying the independence it was meant to buy.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 15–17, 34 — Boundaries; The Missing Chapter' }],
    related: ['clean-architecture-boundaries', 'use-case-driven-design', 'component-principles'],
  },

  {
    id: 'use-case-driven-design',
    domainId: 'architecture-principles',
    title: 'Use-Case-Driven Design',
    summary:
      'A codebase\'s top-level structure should announce what the system *does*, not which framework renders it — "screaming architecture." Organizing around use cases rather than technical layers keeps intent visible and framework choices genuinely swappable.',
    keyPoints: [
      {
        text: 'Screaming architecture: the top-level package layout should scream "shopping cart" or "loan origination," not "controllers/services/repositories"',
        detail: 'The test is literal: could you swap the folder names of this codebase with those of an unrelated system in a different domain and have it still look plausible? If `controllers/services/repositories` works equally well as the top level for a shopping cart, a loan originator, or a chat app, the layout is announcing the framework\'s conventions rather than what this particular system does.',
      },
      {
        text: 'A use case (interactor) is a first-class object: one class, one application-specific business operation, orchestrating entities to fulfill it',
        detail: 'Making the use case an explicit class — rather than a method scattered across a `Service` that also handles four other operations — means the operation can be found, read, and tested as one coherent unit, with its own inputs, outputs, and single responsibility, instead of being reconstructed mentally from fragments spread across a shared service class.',
      },
      {
        text: 'Package-by-feature over package-by-layer keeps everything one use case touches physically close together (raising cohesion, see [[coupling-and-cohesion]])',
        detail: 'This is cohesion applied to package structure: a use case that touches its interactor, request/response types, and adapter code is, under package-by-layer, scattered across four sibling top-level folders, so a single feature change means navigating and editing in four unrelated places. Package-by-feature collapses that distance to zero — everything the change touches lives in one directory.',
      },
      {
        text: 'Frameworks are details — a web framework is a delivery mechanism plugged into use cases, not the thing the architecture is organized around',
        detail: 'Calling the framework "a detail" is the practical consequence of the Dependency Rule, not a dismissal of its importance — the web framework, chosen because it does the delivery job well, still shouldn\'t dictate how the business logic is organized, any more than the choice of database should dictate how the domain model\'s classes are shaped.',
      },
      {
        text: 'This is what makes a system\'s intent legible to a new developer from the folder structure alone, before reading a line of logic',
        detail: 'A new developer reading `registration/`, `checkout/`, `refunds/` at the top level learns what the system *does* before opening a single file — versus `controllers/`, `services/`, `repositories/`, which only tells them what technical pattern was used, leaving the actual purpose of the system to be reverse-engineered from reading code inside each layer.',
      },
    ],
    blocks: [
      {
        kind: 'code',
        title: 'A use case as an explicit, testable object',
        code: 'public interface RegisterUser {\n    Result execute(RegisterUserRequest request);\n}\n\npublic class RegisterUserInteractor implements RegisterUser {\n    private final UserRepository users;\n    private final Notifier notifier;\n\n    RegisterUserInteractor(UserRepository users, Notifier notifier) {\n        this.users = users;\n        this.notifier = notifier;\n    }\n\n    public Result execute(RegisterUserRequest request) {\n        // application-specific business rule, orchestrating entities —\n        // no HTTP, no SQL, no framework import in sight\n        if (users.findByEmail(request.email()).isPresent()) return Result.duplicateEmail();\n        User user = User.register(request.email(), request.password());\n        users.save(user);\n        notifier.send(user.welcomeMessage());\n        return Result.success(user.id());\n    }\n}',
      },
      {
        kind: 'pitfall',
        title: '"Package by layer" hides what the app does',
        text: 'A top level of `controllers/`, `services/`, `repositories/`, `models/` tells you the *tech stack*, not the *product* — you could paste the same four folder names onto a payroll system or a chat app. Worse, adding one feature ("cancel a subscription") means touching one file in each of four different top-level folders, scattering a single cohesive change across the whole tree — the packaging mirror image of the Shotgun Surgery smell ([[code-smells]]).',
        detail: 'The scattering compounds with every feature added: each new capability adds one file to each of the layer folders, so after a dozen features the codebase has a dozen `*Controller`s, a dozen `*Service`s, and a dozen `*Repository`s, all interleaved — finding everything related to one feature means filtering by filename prefix across four folders instead of opening one.',
      },
      {
        kind: 'bestPractice',
        title: 'Package by feature, not by layer',
        text: 'A folder per use case or feature (`registration/`, `checkout/`, `refunds/`) — each containing its own interactor, its own request/response types, and its own narrow slice of controller/gateway code — keeps everything one change touches in one place, and makes the folder tree double as a map of what the system does.',
        detail: 'The interactor, its request/response types, and its slice of adapter code have exactly one reason to change together — the feature\'s own requirements — so co-locating them isn\'t just tidiness, it\'s making the package boundary match the boundary that SRP already says should exist at the class level, one level up in granularity.',
      },
      {
        kind: 'note',
        title: 'The framework is a plugin, not the foundation',
        text: 'Screaming architecture is the practical test of the Dependency Rule ([[clean-architecture-boundaries]]): if replacing the web framework, the database, or the UI toolkit would require restructuring the use cases themselves, the architecture was organized around the framework, not the application. A system organized around its use cases can swap any of those delivery mechanisms by writing new adapters, leaving the use cases untouched.',
        detail: 'This is a concrete, checkable test rather than a vague ideal: try actually swapping the framework (or imagine doing so) and see whether the use case classes need to change at all. If they do, some framework-specific assumption leaked into the use case layer somewhere, and the architecture has a Dependency Rule violation worth finding and fixing.',
      },
    ],
    refs: [{ book: 'clean-architecture', chapter: 'Ch. 21 — Screaming Architecture' }],
    related: ['clean-architecture-boundaries', 'architectural-styles', 'dependency-inversion-and-injection'],
  },
]
