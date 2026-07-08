import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'code-smells',
    domainId: 'refactoring-quality',
    title: 'Code Smells',
    summary:
      'A smell is a surface symptom pointing at a deeper design problem — not a bug, and not always wrong, but a signal worth investigating. Naming them gives a team shared vocabulary for "something here is making change harder than it should be."',
    keyPoints: [
      'A smell doesn\'t mean the code is incorrect — it means it *resists change*, which is where the real cost shows up',
      'Duplicated Code is the most fundamental smell — nearly every other smell either causes it or is caused by it',
      'Long Method / Large Class: size alone isn\'t the problem, low cohesion inside that size is',
      'Feature Envy: a method more interested in another class\'s data than its own — a sign it\'s living in the wrong place',
      'Divergent Change (one class changes for many unrelated reasons) and Shotgun Surgery (one reason to change touches many classes) are mirror-image cohesion problems',
      'Smells guide *which* refactoring to reach for — see [[refactoring-catalog-core]] for the mechanics',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Common smells and their usual fix',
        headers: ['Smell', 'What it looks like', 'Likely refactoring'],
        rows: [
          ['Duplicated Code', 'Same expression/structure copy-pasted', 'Extract Method, then call it from both places'],
          ['Long Method', 'A method that needs scrolling to read', 'Extract Method on cohesive chunks'],
          ['Long Parameter List', 'Four, five, six positional parameters', 'Introduce Parameter Object'],
          ['Feature Envy', 'Method reaches into another object\'s data repeatedly', 'Move Method to the object it envies'],
          ['Data Clumps', 'The same 3–4 fields always travel together as parameters', 'Extract a class for the clump'],
          ['Primitive Obsession', 'A `String`/`int` standing in for a real concept (money, email)', 'Replace primitive with a small value type'],
          ['Switch Statements', 'The same type-code switch repeated at several call sites', 'Replace Conditional with Polymorphism'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Smells are heuristics, not indictments — a 40-line method that reads top-to-bottom as one clear narrative is not automatically a "Long Method" problem; a `Utils` class gathering three unrelated one-line helpers might be a pragmatic trade-off, not a crisis. The judgment call smells demand is: *does this shape make the next change harder than it needs to be?* If the answer is no, leave it — refactoring for its own sake, on code nobody is touching, is pure cost with no payoff (see [[technical-debt]] on when paying down debt is actually worth it).',
      },
      {
        kind: 'code',
        title: 'Feature Envy — the method is jealous of the wrong class',
        code: '// Envious: OrderPrinter cares more about Order\'s internals than its own.\nclass OrderPrinter {\n    String describe(Order order) {\n        return order.getCustomerName() + " ordered " + order.getItems().size()\n             + " items totaling $" + order.getItems().stream().mapToDouble(Item::getPrice).sum();\n    }\n}\n\n// Fixed: the logic moves to live with the data it uses (Move Method).\nclass Order {\n    String describe() {\n        return customerName + " ordered " + items.size()\n             + " items totaling $" + items.stream().mapToDouble(Item::getPrice).sum();\n    }\n}',
      },
      {
        kind: 'note',
        title: 'Divergent Change vs. Shotgun Surgery — opposite symptoms, same root cause',
        text: 'Divergent Change: one class gets edited for many unrelated reasons (low cohesion — it\'s doing too many jobs). Shotgun Surgery: one conceptual change requires editing many classes (the pieces of one job are scattered — also low cohesion, viewed from the other direction). Both point back to [[coupling-and-cohesion]]: responsibilities and the classes that hold them are misaligned, just in opposite ways.',
      },
      {
        kind: 'pitfall',
        title: 'Chasing smells with no tests underneath',
        text: 'A smell tells you *where* to refactor; it says nothing about whether you can do so safely. Refactoring — by definition — must not change observable behavior, and the only way to know you haven\'t is a test suite that exercises that behavior before and after. Fixing a smell in code with no regression tests is not refactoring, it\'s just editing and hoping — see [[refactoring-and-testing-safety]].',
      },
    ],
    refs: [{ book: 'refactoring-fowler', chapter: 'Ch. 3 — Bad Smells in Code' }],
    related: ['refactoring-catalog-core', 'technical-debt', 'coupling-and-cohesion'],
  },

  {
    id: 'refactoring-catalog-core',
    domainId: 'refactoring-quality',
    title: 'Refactoring Catalog: Core Mechanics',
    summary:
      'Refactoring is the disciplined technique of restructuring code without changing its observable behavior, in small, independently verifiable steps. A handful of mechanical moves — Extract, Inline, Rename, Move — cover the large majority of real refactoring work.',
    keyPoints: [
      'Extract Method/Function: pull a cohesive fragment out into a well-named method, replacing it with a call',
      'Extract Variable: name an expression so the code reads as intent rather than arithmetic',
      'Inline Method/Variable: the reverse move — when the indirection adds no clarity, fold it back in',
      'Rename: the highest-leverage, lowest-risk refactoring there is — a name is documentation that never goes stale if it stays accurate',
      'Move Method/Field: relocate behavior or data to the class it is most cohesive with (the fix for Feature Envy, see [[code-smells]])',
      'Every refactoring is reversible — Extract has an Inline, Move has a Move-back — which is what makes "try it and see" a legitimate way to explore a design',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Core refactorings and their intent',
        headers: ['Refactoring', 'Intent'],
        rows: [
          ['Extract Method', 'Turn an unnamed fragment into a named, reusable, independently testable unit'],
          ['Extract Variable', 'Replace an opaque expression with a name that explains what it means'],
          ['Inline Method / Variable', 'Remove indirection that has stopped paying for itself'],
          ['Rename', 'Make the name match what the thing actually is, now'],
          ['Move Method / Field', 'Put behavior or data next to what it is most cohesive with'],
        ],
      },
      {
        kind: 'code',
        title: 'Extract Method, before and after',
        code: '// Before: one method, two responsibilities buried inside it.\nvoid printInvoice(Invoice invoice) {\n    double total = 0;\n    for (LineItem item : invoice.getItems()) {\n        total += item.getPrice() * item.getQuantity();\n    }\n    System.out.println("Total: $" + total);\n    for (LineItem item : invoice.getItems()) {\n        System.out.println(item.getName() + " x" + item.getQuantity());\n    }\n}\n\n// After: each cohesive fragment gets a name.\nvoid printInvoice(Invoice invoice) {\n    System.out.println("Total: $" + calculateTotal(invoice));\n    printLineItems(invoice);\n}\ndouble calculateTotal(Invoice invoice) { /* the sum, extracted */ }\nvoid printLineItems(Invoice invoice) { /* the loop, extracted */ }',
      },
      {
        kind: 'bestPractice',
        title: 'One tiny step, one test run, one commit',
        text: 'Fowler\'s discipline is stricter than it looks from the outside: make one small mechanical change, run the tests, and only then make the next one. Skipping the test-run between steps is how a "safe" refactor turns into an afternoon of debugging three tangled changes at once — see [[refactoring-and-testing-safety]] for why the test suite is what makes any of this safe at all.',
      },
      {
        kind: 'pitfall',
        title: 'The big-bang refactor',
        text: 'Rewriting a class wholesale over a few hours without running tests in between feels efficient in the moment, but when something breaks, there is no way to know which of the dozen changes caused it — the entire session becomes one un-bisectable diff. Small refactorings composed one at a time are slower per-step and faster overall, because every step is independently verified.',
      },
      {
        kind: 'note',
        title: 'IDE-automated vs. manual refactoring',
        text: 'Modern IDEs automate Rename, Extract Method/Variable, and Move reliably — the tool rewrites every reference correctly, which is both faster and safer than doing it by hand with find-and-replace. Reach for the automated refactoring whenever one exists; reserve manual, step-by-step editing (with tests run after each step) for restructurings no tool covers, like Replace Conditional with Polymorphism (see [[composing-methods-and-conditionals]]).',
      },
    ],
    refs: [{ book: 'refactoring-fowler', chapter: 'Ch. 6, 7 — A First Set of Refactorings; Encapsulation' }],
    related: ['code-smells', 'composing-methods-and-conditionals', 'refactoring-and-testing-safety'],
  },

  {
    id: 'composing-methods-and-conditionals',
    domainId: 'refactoring-quality',
    title: 'Composing Methods & Conditionals',
    summary:
      'A family of refactorings targets conditional logic specifically: flattening nested ifs with guard clauses, decomposing a tangled condition into named pieces, and — when a type-code switch keeps growing — replacing it with polymorphic dispatch.',
    keyPoints: [
      'Guard clauses: handle the exceptional/early-exit cases first and return immediately, so the main logic isn\'t nested inside an `if`',
      'Decompose Conditional: extract the condition, the then-branch, and the else-branch each into a well-named method',
      'Replace Conditional with Polymorphism: turn a type-code switch into one method per subtype, each overriding a common method',
      'The "one level of indentation" heuristic — deeply nested conditionals are themselves a smell (Long Method\'s conditional cousin)',
      'Polymorphism wins when the same switch is duplicated at several call sites and the set of types keeps growing; a single, stable, local `if` is often clearer left alone',
    ],
    blocks: [
      {
        kind: 'code',
        title: 'Nested conditionals → guard clauses',
        code: '// Before: the "normal" case is buried three levels deep.\ndouble getPayAmount(Employee e) {\n    double result;\n    if (e.isSeparated()) {\n        result = 0;\n    } else {\n        if (e.isRetired()) {\n            result = pension(e);\n        } else {\n            result = normalPay(e);\n        }\n    }\n    return result;\n}\n\n// After: guard clauses handle exceptions first; the main path is flat.\ndouble getPayAmount(Employee e) {\n    if (e.isSeparated()) return 0;\n    if (e.isRetired())  return pension(e);\n    return normalPay(e);\n}',
      },
      {
        kind: 'code',
        title: 'Type-code switch → polymorphic dispatch',
        code: '// Before: repeated at every call site that needs a rate.\ndouble rateFor(Employee e) {\n    switch (e.getType()) {\n        case ENGINEER: return 1.0;\n        case MANAGER:  return 1.5;\n        case DIRECTOR: return 2.0;\n        default: throw new IllegalArgumentException();\n    }\n}\n\n// After: each subtype knows its own rate; no switch anywhere.\nabstract class Employee { abstract double rate(); }\nclass Engineer extends Employee { double rate() { return 1.0; } }\nclass Manager  extends Employee { double rate() { return 1.5; } }\nclass Director extends Employee { double rate() { return 2.0; } }',
      },
      {
        kind: 'table',
        caption: 'Conditional or polymorphism?',
        headers: ['Signal', 'Prefer'],
        rows: [
          ['One call site, stable set of cases, unlikely to grow', 'Plain conditional — polymorphism would be needless indirection'],
          ['Same switch duplicated at several call sites', 'Polymorphism — one dispatch point instead of N copies to keep in sync'],
          ['New cases get added regularly (OCP pressure, see [[solid-principles]])', 'Polymorphism — a new case is a new subclass, no existing code edited'],
        ],
      },
      {
        kind: 'pitfall',
        title: 'Polymorphism for a condition that will never grow',
        text: 'Turning a simple, stable two-branch `if` into a class hierarchy "on principle" adds a layer of indirection — a reader now has to find the right subclass to see what happens — with no matching benefit, since there was never a proliferation problem to solve. Reach for [[behavioral-patterns-ii]] (State/Strategy) when the *number of cases* is the pain, not as a reflex for every conditional.',
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 9, 10 — Simplifying Conditional Logic; Moving Features' },
      { book: 'head-first-patterns', chapter: 'Ch. 1 — Strategy Pattern' },
    ],
    related: ['refactoring-catalog-core', 'behavioral-patterns-ii', 'code-smells'],
  },

  {
    id: 'refactoring-and-testing-safety',
    domainId: 'refactoring-quality',
    title: 'Refactoring & Testing Safety',
    summary:
      'Refactoring is only as safe as the test suite underneath it: tests are what turn "I\'m fairly sure this is equivalent" into "I verified this is equivalent." Without them, the same edits are just changes made on faith.',
    keyPoints: [
      'A regression suite is the harness that makes small, frequent refactoring steps verifiable rather than hopeful',
      'Legacy code with no tests needs characterization tests first — tests that pin down *current* behavior (bugs included) before anything is restructured',
      'Red-Green-Refactor (from TDD, see [[testing-philosophy]]) is refactoring\'s most disciplined form: never restructure and add behavior in the same step',
      'Coverage percentage is a floor, not a guarantee — 100% coverage with weak assertions can still miss a broken refactor',
      'Mutation testing (deliberately introducing small bugs and checking the suite catches them) measures whether tests actually *assert* something, not just execute the code',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A **characterization test** doesn\'t test "correct" behavior — it tests *current* behavior, quirks and all, so that a refactor of unfamiliar legacy code has something to check itself against. Write the test, run it against the untouched code, and record whatever it produces as the expected result — even if that result looks wrong. Only after the refactor is safely underway, with the suite green throughout, does fixing the actual bug become a separate, deliberate step.',
      },
      {
        kind: 'note',
        title: 'Coverage measures execution, not verification',
        text: 'A line can execute under a test and still be effectively untested if the test never asserts anything meaningful about its output — coverage tools count the former, not the latter. Mutation testing closes that gap: it flips a comparison, off-by-ones a loop bound, or negates a condition, then reruns the suite. A mutant that survives (no test fails) reveals an assertion gap that plain coverage would never show.',
      },
      {
        kind: 'pitfall',
        title: 'Refactoring and behavior change in the same commit',
        text: 'Mixing "restructure this" with "and also fix this bug while I\'m in here" in one commit destroys the one property that makes refactoring low-risk: if something breaks, there is no way to tell whether the restructuring or the behavior change caused it, and reverting either change in isolation isn\'t possible. Keep them in separate commits — ideally separate steps entirely — even when it\'s tempting to bundle them because "you\'re already in the file."',
      },
      {
        kind: 'bestPractice',
        title: 'Separate "refactor" commits from "feature" commits',
        text: 'A commit history where pure-refactor commits (message: "extract method, no behavior change") are distinguishable from feature/fix commits gives reviewers and future archaeologists (`git bisect`, see [[debugging-and-problem-solving]]) a much easier job: a regression search can skip every commit labeled as a behavior-preserving refactor.',
      },
      {
        kind: 'table',
        caption: 'The TDD cycle, refactoring\'s strictest discipline',
        headers: ['Step', 'Rule'],
        rows: [
          ['Red', 'Write a failing test for the next tiny bit of behavior — nothing else'],
          ['Green', 'Write the simplest code that makes it pass — no more'],
          ['Refactor', 'Clean up the result *with tests green throughout* — no new behavior added here'],
        ],
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 4 — Building Tests' },
      { book: 'pragmatic-programmer', chapter: 'Ch. 5 — Bend, or Break (Testing section)' },
    ],
    related: ['testing-philosophy', 'refactoring-catalog-core', 'refactoring-workflow-and-tooling'],
  },

  {
    id: 'refactoring-workflow-and-tooling',
    domainId: 'refactoring-quality',
    title: 'Refactoring Workflow & Tooling',
    summary:
      'Refactoring works as a practiced discipline, not a one-off event: wear one hat at a time, lean on version control as an undo button, and prefer automated tool support over manual edits wherever it exists.',
    keyPoints: [
      '"Two hats" — adding function and refactoring are different modes of work; switch consciously between them, never blend',
      'Commit after every small, green refactoring step — version control becomes a reliable undo button, not just a backup',
      'Automated IDE refactorings (Rename, Extract, Move) rewrite every reference correctly and are safer than manual find-and-replace',
      'Continuous integration turns "did this break anything" from an end-of-week surprise into immediate feedback',
      'A refactor buried inside a large feature PR is effectively unreviewable — nobody can tell what changed for what reason',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The "two hats" metaphor: when adding a feature, you\'re not supposed to be restructuring existing code, and when refactoring, you\'re not supposed to be adding behavior. In practice these interleave constantly — add a feature, notice the code resists it, switch hats and refactor to make room, switch back — but at any given moment only one hat is on. Losing track of which hat you\'re wearing is exactly how "just a quick refactor" grows a new feature nobody asked for review on, or "just a quick feature" quietly restructures something without test coverage for the restructuring.',
      },
      {
        kind: 'note',
        title: 'Version control as an undo button, not just a backup',
        text: 'Committing after each small, verified refactoring step means any step that turns out to be wrong can be reverted precisely, without losing the steps before or after it. This is what makes exploratory refactoring ("let me try moving this and see if it\'s cleaner") low-risk — the worst case is a `git reset` to the last good commit, not a scramble to remember what the code looked like an hour ago.',
      },
      {
        kind: 'bestPractice',
        title: 'Keep refactor PRs small and separate from feature PRs',
        text: 'A pull request titled "extract payment validation" that touches only that extraction is reviewable in minutes, because the reviewer can verify "no behavior changed" by inspection. The same extraction buried inside a 40-file feature PR forces the reviewer to either trust it blindly or re-derive the whole refactor themselves — neither is a good use of anyone\'s time.',
      },
      {
        kind: 'pitfall',
        title: 'Large, mixed refactor-and-feature PRs',
        text: 'When a PR both restructures existing code and adds new behavior, a reviewer cannot separate "is the new logic correct" from "did the restructuring preserve the old behavior" — the two questions get conflated, review quality drops, and if something breaks in production the mixed diff makes `git bisect` far less useful (see [[debugging-and-problem-solving]]).',
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 2 — Principles in Refactoring' },
      { book: 'pragmatic-programmer', chapter: 'Ch. 3 — The Basic Tools (source control)' },
    ],
    related: ['refactoring-and-testing-safety', 'tooling-and-automation', 'technical-debt'],
  },

  {
    id: 'technical-debt',
    domainId: 'refactoring-quality',
    title: 'Technical Debt',
    summary:
      'Ward Cunningham\'s metaphor: a shortcut taken now accrues interest as slower, riskier future changes — useful precisely because it reframes "messy code" as a deliberate, trackable financial trade-off rather than a moral failing.',
    keyPoints: [
      'The 2×2: reckless/prudent crossed with deliberate/inadvertent — only one quadrant (reckless-and-inadvertent) is pure carelessness',
      'Interest is the ongoing cost of working around the debt — every future change in that area takes longer than it would on clean code',
      'Debt should be visible and tracked (a backlog item, a `TODO` with a ticket link), not silently absorbed into "how things are"',
      'Pay down debt when the interest it\'s accruing exceeds the cost of fixing it — not on a fixed schedule and not out of tidiness alone',
      'A full rewrite is rarely the cheapest way to pay off debt — incremental refactoring under test coverage usually costs less and never leaves you without a working system',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The debt quadrant',
        headers: ['', 'Deliberate', 'Inadvertent'],
        rows: [
          ['Reckless', '"We don\'t have time for design"', '"What\'s layering?"'],
          ['Prudent', '"We must ship now and deal with consequences" (a real, informed trade-off)', '"Now we know how we should have done it" (learning is normal)'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'Cunningham\'s original point is often flattened into "sloppy code is debt," but his actual metaphor was about *learning as you build*: you ship your best understanding of the design today, and as the system teaches you more, some of that understanding turns out to be wrong — the gap between what you shipped and what you\'d build knowing what you know now is the debt, and it is a completely normal byproduct of building anything non-trivial, not a sign anyone did something wrong. The reckless/deliberate quadrant ("we know this is bad, ship it anyway, no plan to fix it") is the only genuinely blameworthy one.',
      },
      {
        kind: 'note',
        title: 'Debt is a trade-off, not always a mistake',
        text: 'Taking on debt deliberately — hard-coding a value instead of building a config system, skipping an abstraction you\'re not sure you need yet — can be the *correct* engineering call under a real deadline, provided it\'s visible and provided someone intends to revisit it once the interest catches up with the savings. Debt becomes a problem when it\'s invisible, or when nobody ever intends to repay it.',
      },
      {
        kind: 'pitfall',
        title: '"Let\'s just rewrite it" as a debt-repayment strategy',
        text: 'A full rewrite promises a clean slate but discards the accumulated bug fixes, edge-case handling, and tacit knowledge embedded in the existing system — then takes months during which the business gets zero new value and the old system still needs maintenance in parallel. Incremental refactoring, backed by characterization tests (see [[refactoring-and-testing-safety]]), pays down the same debt in pieces without ever leaving the system in a non-working state.',
      },
    ],
    refs: [
      { book: 'refactoring-fowler', chapter: 'Ch. 1 — Refactoring, a First Example' },
      { book: 'clean-architecture', chapter: 'Ch. 1 — What Is Design and Architecture?' },
    ],
    related: ['code-smells', 'refactoring-workflow-and-tooling', 'estimating'],
  },
]
