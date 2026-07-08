import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: 'pragmatic-mindset',
    domainId: 'craftsmanship-practice',
    title: 'Pragmatic Mindset: DRY, Orthogonality, Reversibility',
    summary:
      'Three lenses from *The Pragmatic Programmer* for keeping a codebase changeable over years, not just working on day one: don\'t duplicate knowledge, keep components independent, and avoid decisions that can\'t be undone.',
    keyPoints: [
      'DRY — "every piece of knowledge must have a single, unambiguous, authoritative representation" — broader than "don\'t copy-paste code": it covers docs, schemas, config, and business rules stated twice in different forms',
      'Orthogonality — two components are orthogonal if changing one has no effect on the other; the practical test is "can I change X without understanding Y?"',
      'Reversibility — requirements *will* change, so prefer decisions that are cheap to undo over ones that lock in a direction',
      '"No broken windows" — small, visible quality lapses left unfixed normalize further decay quickly',
      'DRY is about *knowledge*, not literal text — two pieces of code that happen to look similar today but change for unrelated reasons are not a DRY violation',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'DRY is the most quoted and most misapplied of the three. It does not say "delete duplicate-looking code" — it says a given piece of *knowledge* (a business rule, a constant, a format) should live in exactly one authoritative place. A tax rate hard-coded in three files is a DRY violation even though the three occurrences don\'t look like "duplicated code" in an IDE\'s sense; two unrelated methods that happen to contain a similar four-line loop, for different reasons that will diverge over time, are *not* a DRY violation even though they look identical today.',
      },
      {
        kind: 'code',
        title: 'The same knowledge, stated twice, drifting apart',
        code: '// DRY violation: the discount rule is knowledge, stated in two places.\nclass Checkout {\n    double total(Cart cart) {\n        double t = cart.subtotal();\n        if (cart.itemCount() > 10) t *= 0.9;   // bulk discount, stated here...\n        return t;\n    }\n}\nclass ReceiptEmail {\n    String preview(Cart cart) {\n        double est = cart.subtotal();\n        if (cart.itemCount() > 10) est *= 0.9; // ...and again here. One will drift.\n        return "Estimated: $" + est;\n    }\n}\n\n// Fixed: one authoritative place for the rule.\nclass DiscountPolicy {\n    static double apply(Cart cart, double amount) {\n        return cart.itemCount() > 10 ? amount * 0.9 : amount;\n    }\n}',
      },
      {
        kind: 'note',
        title: 'The orthogonality test',
        text: 'Ask two questions about any pair of components: "if I change this one, does the other one need to change too?" and "can I understand this one without understanding the other?" If either answer trends toward yes, the two are coupled, not orthogonal — see [[coupling-and-cohesion]] for the vocabulary architecture uses for the same idea at a larger scale.',
      },
      {
        kind: 'pitfall',
        title: 'DRY taken too far: coupling things that merely look alike',
        text: 'Two validation rules that happen to both check "is this string non-empty and under 50 characters" today are easy to merge into one shared helper — until one of them needs to become "under 100 characters" for unrelated business reasons, and now the shared helper needs a parameter, then a flag, then a second flag, and the abstraction has become harder to read than the two originals ever were. If two pieces of code don\'t represent the *same knowledge*, merging them on looks alone creates coupling where none should exist.',
      },
      {
        kind: 'bestPractice',
        title: 'No broken windows',
        text: 'A codebase with one visibly sloppy corner (an inconsistent naming convention left unfixed, a failing test left ignored, a hack left un-flagged) invites the next person to add another one — the bar for "acceptable" has visibly dropped. Fixing small quality lapses promptly, even ones that aren\'t urgent, keeps that bar from sliding; it is cheaper to maintain a clean reputation than to restore one.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 2, 3 — A Pragmatic Approach; The Basic Tools' }],
    related: ['coupling-and-cohesion', 'tracer-bullets-and-prototyping', 'technical-debt'],
  },

  {
    id: 'tracer-bullets-and-prototyping',
    domainId: 'craftsmanship-practice',
    title: 'Tracer Bullets & Prototyping',
    summary:
      'Two techniques get conflated under "build something quick to find out" — a tracer bullet is real, thin, end-to-end code you keep and grow; a prototype is throwaway code built purely to answer one uncertain question, then discarded.',
    keyPoints: [
      'Tracer bullet: a thin slice through every layer of the real system, using real (if minimal) code — validates the whole pipeline works together early',
      'Prototype: quick, disposable code built to answer one specific risky question ("will this rendering approach even work?"), explicitly thrown away afterward',
      'Tracer bullets are grown into the finished feature; prototypes are deleted, not "cleaned up into production"',
      'Choose a tracer bullet to de-risk integration across the whole stack; choose a prototype to de-risk one uncertain technique or idea cheaply',
      'The failure mode for both is the same promise broken in different directions: skipping the tracer bullet (integration surprises discovered late) or keeping the prototype (throwaway quality shipped to production)',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Tracer bullet vs. prototype',
        headers: ['', 'Tracer bullet', 'Prototype'],
        rows: [
          ['Goal', 'Prove the whole pipeline connects, end to end', 'Answer one specific uncertain question'],
          ['Code quality', 'Real, if minimal — production code that will grow', 'Deliberately disposable — not held to production standards'],
          ['Fate', 'Kept, extended into the finished feature', 'Thrown away once the question is answered'],
          ['Use when', 'You need early, visible progress across all layers', 'You need to de-risk one uncertain piece cheaply'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'A tracer bullet for a new feature might be: UI button → API endpoint → business logic stub → database write, all wired together and deployed, doing the absolute minimum at each layer — but doing it for real. It answers "does this architecture actually fit together" days before the feature is feature-complete, and every layer it touches then gets filled in incrementally, in place. This also doubles as a communication tool: stakeholders can see something running end-to-end almost immediately, long before the polish is done (see [[requirements-and-communication]]).',
      },
      {
        kind: 'pitfall',
        title: '"We\'ll clean up the prototype later"',
        text: 'The most common and most expensive failure here is treating a prototype\'s fate as negotiable. Prototype code is written under an explicit understanding that it will be deleted — corners are cut on purpose, error handling is skipped, and it is validated only against the one question it exists to answer. Once it "basically works," the temptation to ship it as-is is enormous, and the corners cut to build it quickly are still there, now permanently, in production. Decide whether something is a tracer bullet or a prototype *before* writing it, not after it happens to work.',
      },
      {
        kind: 'note',
        title: 'Prototypes can be even more disposable than the code they resemble',
        text: 'A UI prototype might be static images with no working logic behind them; an algorithm prototype might hard-code the input instead of reading real data. The point is answering the one question as cheaply as possible — if a prototype takes as long to build as the real thing, it has stopped being a prototype.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 4 — Pragmatic Paranoia (Tracer Bullets)' }],
    related: ['pragmatic-mindset', 'requirements-and-communication', 'estimating'],
  },

  {
    id: 'requirements-and-communication',
    domainId: 'craftsmanship-practice',
    title: 'Requirements & Communication',
    summary:
      'Requirements are discovered through conversation and concrete examples, not gathered once and handed off as a frozen document — a spec written too early just ossifies the team\'s current misunderstanding of the problem.',
    keyPoints: [
      '"Work with a user to think like a user" — the best way to understand a requirement is alongside the people who\'ll live with it, not through a one-time interview',
      'Concrete examples surface edge cases a description never would — "show me an example of that report" beats "describe the report format"',
      'Document requirements as a shared project vocabulary/glossary — capture the intent behind terms, not implementation detail that will drift out of sync',
      'Abstractions live longer than the details built on them — capture *why*, since the *how* will keep changing',
      'A detailed early spec feels like reduced risk but is often a frozen misunderstanding — see [[tracer-bullets-and-prototyping]] for getting something real in front of users instead',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'The instinct to "gather requirements" as a discrete upfront phase treats understanding the problem as a one-time data-collection exercise, when in practice a project\'s understanding of what it actually needs keeps sharpening the entire way through — new edge cases surface once real users touch a real (even partial) system, and a document frozen at kickoff has no mechanism for absorbing that. Treating requirements as an ongoing conversation, not a phase that ends at a sign-off, means the team\'s understanding stays current instead of stale.',
      },
      {
        kind: 'note',
        title: 'Ask for examples, not descriptions',
        text: '"The report should show monthly totals" sounds unambiguous until someone asks for one: does a month with zero activity get a row, or is it omitted? Are refunds shown as negative totals or excluded entirely? A concrete example (an actual sample report, even a hand-drawn one) surfaces these questions in minutes; a written description usually doesn\'t surface them until the code that assumed one answer meets a user who assumed the other.',
      },
      {
        kind: 'bestPractice',
        title: 'Maintain a project glossary',
        text: 'When "customer," "account," and "subscriber" have precise, distinct meanings that everyone on the project uses consistently, whole categories of requirements bugs (built against the wrong meaning of an ambiguous term) disappear. A short glossary of project-specific terms, kept current, is disproportionately cheap insurance against that class of miscommunication.',
      },
      {
        kind: 'pitfall',
        title: 'Mistaking a detailed early spec for reduced risk',
        text: 'A hundred-page requirements document written before anyone has seen working software *feels* like diligence, but every assumption in it was made with the least information the project will ever have. The more precisely a wrong assumption is specified, the more expensive it is to unwind once reality disagrees — a short spec plus an early tracer bullet ([[tracer-bullets-and-prototyping]]) usually surfaces the same problems for far less sunk cost.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 4 — Pragmatic Paranoia (Requirements)' }],
    related: ['tracer-bullets-and-prototyping', 'estimating', 'use-case-driven-design'],
  },

  {
    id: 'tooling-and-automation',
    domainId: 'craftsmanship-practice',
    title: 'Tooling & Automation',
    summary:
      'Invest in your tools deliberately: automate anything done more than once, favor plain text for its longevity and tool-agnosticism, and treat editor/shell fluency as a compounding investment rather than an afterthought.',
    keyPoints: [
      '"Don\'t use manual procedures" — a script that runs the release/build/setup steps is more reliable than a remembered or documented sequence',
      'A script *is* accurate documentation — it cannot silently drift out of date the way a wiki page describing the same steps can',
      'The power of plain text: greppable, diffable, versionable, and outlives whatever tool first produced it',
      'Editor and shell fluency compound over a career — minutes saved per interaction, thousands of interactions',
      'Automation pays for itself the moment a manual step is run for the third time — the break-even point is usually much sooner than it feels',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: 'A checklist titled "How to deploy" that lives on a wiki page describes what deploying *should* look like at the moment someone wrote it down — and nothing keeps it in sync as the actual process changes. A deploy *script* cannot have this problem: if it\'s wrong, deploys fail loudly, so it gets fixed. The script is simultaneously the automation and the only documentation that is provably still accurate.',
      },
      {
        kind: 'note',
        title: 'Why plain text keeps winning',
        text: 'Config in a proprietary binary format is stuck with whatever tool wrote it; config in a plain-text format (JSON, YAML, even a flat key-value file) can be diffed in a code review, greeped across an entire codebase, generated by a script, and read by a tool that doesn\'t exist yet. This is a large part of why version control, most modern config systems, and most data interchange formats converged on plain text despite the extra parsing cost.',
      },
      {
        kind: 'bestPractice',
        title: 'Script the release process before you need it under pressure',
        text: 'The worst time to discover a deploy step only one person remembers is during an incident, at 2am, when that person is unreachable. Scripting routine operational procedures — setup, deploy, rollback, common debugging queries — while there\'s no pressure means they\'re reliable exactly when pressure shows up.',
      },
      {
        kind: 'pitfall',
        title: 'Tribal-knowledge processes',
        text: 'A process that lives only in one person\'s head (or in stale wiki instructions nobody trusts enough to follow literally) is a single point of failure disguised as institutional knowledge. Every manual step repeated more than a couple of times is a candidate for automation — see [[refactoring-workflow-and-tooling]] for the same principle applied specifically to the refactoring/release workflow.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 3 — The Basic Tools' }],
    related: ['refactoring-workflow-and-tooling', 'testing-philosophy', 'debugging-and-problem-solving'],
  },

  {
    id: 'estimating',
    domainId: 'craftsmanship-practice',
    title: 'Estimating',
    summary:
      'An estimate is a probabilistic statement about the future, not a promise — communicated honestly as a range with explicit assumptions, and calibrated over time against how your own past estimates actually turned out.',
    keyPoints: [
      'State an estimate as a range (best-case / most-likely / worst-case) rather than a single number that inevitably gets treated as a deadline',
      'Break a large, uncertain task into smaller pieces — each piece can be estimated with tighter confidence than the whole',
      'Track estimate-vs-actual over time; most people are systematically optimistic, and only measurement reveals your own personal bias',
      '"It depends" is a legitimate, useful answer — followed immediately by *what* it depends on',
      'The tighter the estimate demanded, the more it costs to produce — a rough order-of-magnitude answer is cheap; a precise one requires doing much of the design work first',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'Granularity vs. credible precision',
        headers: ['Task size', 'Credible range', 'Why'],
        rows: [
          ['A few hours', '±20–30%', 'Small enough to reason about directly'],
          ['A few days', '±50% or wider', 'Unknowns start compounding'],
          ['Weeks, unbroken down', 'Barely more than a guess', 'Too many hidden sub-tasks to have accounted for them all'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'The instinct to demand (or give) a single number — "how long will this take?" / "three weeks" — discards the uncertainty that was actually there and replaces it with false precision. A range communicates the same information honestly: "most likely three weeks, could slip to five if the migration turns out to be harder than expected, could be two if it goes smoothly." Whoever receives that estimate can plan around the uncertainty instead of being blindsided when reality lands anywhere other than exactly the single number given.',
      },
      {
        kind: 'note',
        title: 'Calibrate against your own track record',
        text: 'Most engineers, asked to estimate, are optimistic by a fairly consistent factor — not because they\'re bad at estimating, but because an estimate is implicitly "how long if nothing unexpected happens," and something unexpected almost always does. Tracking actual-vs-estimated over enough tasks reveals your personal correction factor, which is a far better calibration tool than any general advice, including this one.',
      },
      {
        kind: 'pitfall',
        title: 'A single number given under pressure becomes a commitment',
        text: 'Pressed for "just give me a number" in a meeting, a hedge like "probably around two weeks, but I haven\'t looked closely" gets remembered, repeated, and eventually treated as a promise — the hedge quietly disappears from the retelling. Insisting on stating the range and the caveat every time, even when it feels like friction, is what keeps a rough guess from calcifying into an unearned deadline.',
      },
      {
        kind: 'bestPractice',
        title: 'Decompose before estimating anything non-trivial',
        text: 'Breaking "add search to the app" into its actual sub-tasks (indexing strategy, query API, ranking, UI, pagination, empty states) before estimating turns one huge, low-confidence guess into several smaller, higher-confidence ones — and often reveals scope nobody had considered yet, which is valuable information on its own, independent of the resulting number.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 2 — Estimating' }],
    related: ['requirements-and-communication', 'technical-debt', 'tracer-bullets-and-prototyping'],
  },

  {
    id: 'testing-philosophy',
    domainId: 'craftsmanship-practice',
    title: 'Testing Philosophy',
    summary:
      'Testing is as much a design activity as a verification one — code that resists being tested is usually poorly decoupled — and the test pyramid balances speed against confidence rather than prescribing one "correct" ratio.',
    keyPoints: [
      'Test pyramid: many fast, isolated unit tests; fewer, slower integration tests; a handful of end-to-end tests — a cost/confidence trade-off, not a rulebook',
      'Test-induced design pressure: code that is hard to unit test is usually too coupled to its collaborators — see [[dependency-inversion-and-injection]] as the fix',
      'Example-based tests assert specific input→output pairs; property-based tests assert an invariant holds across generated inputs, often finding edge cases nobody thought to hand-pick',
      '"Test early, test often, test automatically" — a suite that isn\'t run continuously isn\'t a safety net, it\'s a false sense of one',
      'An inverted pyramid ("ice-cream cone" — mostly slow, brittle end-to-end tests, few unit tests) is slow to run and flaky to maintain',
    ],
    blocks: [
      {
        kind: 'table',
        caption: 'The pyramid, layer by layer',
        headers: ['Layer', 'Speed', 'Isolation', 'Typical count'],
        rows: [
          ['Unit', 'Milliseconds', 'One class/function, collaborators faked', 'Hundreds to thousands'],
          ['Integration', 'Seconds', 'Several real components together (e.g. DB access)', 'Dozens to hundreds'],
          ['End-to-end', 'Seconds to minutes', 'The whole system, as a user would exercise it', 'A handful of critical paths'],
        ],
      },
      {
        kind: 'paragraph',
        text: 'A class that is hard to unit test — it needs a real database connection, a live network call, three collaborators constructed just so — is very often exhibiting a coupling problem, not a "this kind of code just can\'t be tested" problem. Following the resistance back to its source and fixing the coupling (usually via [[dependency-inversion-and-injection]], substituting a test double for the awkward collaborator) tends to improve the production design too: the two goals point the same direction more often than not.',
      },
      {
        kind: 'note',
        title: 'Property-based testing finds what you didn\'t think to test',
        text: 'An example-based test for a sort function might check `sort([3,1,2]) == [1,2,3]` — correct, but only tells you that one input. A property-based test instead asserts an invariant ("the output is always sorted, and always the same multiset of elements as the input") and lets the framework generate hundreds of random inputs, including edge cases (empty lists, duplicate values, already-sorted input) a human likely wouldn\'t have hand-picked.',
      },
      {
        kind: 'pitfall',
        title: 'The ice-cream-cone anti-pattern',
        text: 'A suite dominated by slow, brittle end-to-end tests with only a thin layer of unit tests underneath is expensive to run (minutes to hours), flaky (network/UI timing issues cause false failures), and slow to pinpoint what actually broke when something fails, since a single end-to-end failure could stem from any layer of the system. Rebalancing toward the pyramid shape — more fast, isolated tests, fewer slow, broad ones — usually finds regressions faster *and* cheaper.',
      },
    ],
    refs: [
      { book: 'pragmatic-programmer', chapter: 'Ch. 5 — Bend, or Break (Testing)' },
      { book: 'refactoring-fowler', chapter: 'Ch. 4 — Building Tests' },
    ],
    related: ['refactoring-and-testing-safety', 'dependency-inversion-and-injection', 'debugging-and-problem-solving'],
  },

  {
    id: 'debugging-and-problem-solving',
    domainId: 'craftsmanship-practice',
    title: 'Debugging & Problem Solving',
    summary:
      'Treat debugging as a disciplined search for a root cause, not a guessing game: reproduce the failure reliably, bisect toward its source, and fix the actual cause rather than the symptom in front of you.',
    keyPoints: [
      '"select isn\'t broken" — assume the bug is in your code, not the platform, standard library, or compiler, until you have specific evidence otherwise',
      'Reproduce reliably first — a bug you can\'t reliably trigger can\'t be verified fixed, only hoped-fixed',
      'Binary search / bisection narrows down *where* a bug lives — halve the search space each time, including `git bisect` for "when did this regress"',
      'Fix the root cause, not the symptom — patching where a bug is *visible* instead of where it *originates* tends to have it resurface elsewhere',
      '"Rubber duck debugging" — explaining the problem out loud, step by step, to anything (a colleague, a rubber duck) frequently surfaces the wrong assumption before the explanation even finishes',
    ],
    blocks: [
      {
        kind: 'paragraph',
        text: '"select() isn\'t broken" is a decades-old piece of Unix folklore that generalizes well: the standard library function, the compiler, the framework you\'re using has been run by millions of people before you and almost certainly works as documented. The bug — the overwhelming majority of the time — is in an assumption your own code made. Starting the search there first, rather than "it must be a platform bug," resolves nearly every debugging session faster.',
      },
      {
        kind: 'note',
        title: 'Bisection: halve the search space, every time',
        text: 'Whether it\'s a value in a data structure, a commit in history (`git bisect`), or a stage in a pipeline, the fastest way to localize an unknown failure point is to test the midpoint and discard half the remaining possibilities each time — turning a search that\'s linear in the size of the problem into one that\'s logarithmic. This is the same idea as [[binary-search-and-variants]], applied to a search space that isn\'t sorted data but "which of these N things is responsible."',
      },
      {
        kind: 'bestPractice',
        title: 'Reproduce reliably, then write the regression test first',
        text: 'Before attempting a fix, get the failure to happen on demand — an intermittent bug "fixed" without a reliable repro can\'t actually be verified fixed, only hoped-fixed. Once it reproduces, write a failing test that encodes it (a form of characterization test, see [[refactoring-and-testing-safety]]) *before* changing the code — the test now proves the fix works, and prevents the same bug from silently coming back later.',
      },
      {
        kind: 'pitfall',
        title: 'Patching the symptom instead of the cause',
        text: 'Catching and silently swallowing a `NullPointerException` where it surfaces makes the crash go away without answering why the value was null in the first place — the underlying bad state persists and typically resurfaces somewhere else, often somewhere harder to diagnose than the original crash was. Trace back to where the invalid state was introduced ([[correctness-and-invariants]]) and fix it there.',
      },
      {
        kind: 'note',
        title: 'Rubber duck debugging',
        text: 'Explaining a bug out loud, line by line, to a colleague — or to a literal inanimate object, if no one\'s free — forces you to state assumptions explicitly instead of skipping over them in your head. Very often the explanation stalls exactly at the assumption that turns out to be wrong, before the listener (or duck) has said a word.',
      },
    ],
    refs: [{ book: 'pragmatic-programmer', chapter: 'Ch. 5 — Bend, or Break (Debugging)' }],
    related: ['testing-philosophy', 'correctness-and-invariants', 'tooling-and-automation'],
  },
]
