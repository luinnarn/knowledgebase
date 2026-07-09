import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "choosing-ai-vs-code",
    domainId: "applied-ai-engineering",
    title: "When to Use AI vs Normal Code",
    summary: "Use AI for fuzzy, language-heavy, perceptual, or hard-to-specify work. Use normal code for explicit rules, calculations, invariants, permissions, and anything that must be deterministic.",
    keyPoints: [
      {
        text: "Deterministic rules belong in code",
        detail: "Billing, tax, permissions, validation, state transitions, and safety invariants should not depend on a probabilistic model."
      },
      {
        text: "AI helps when rules are hard to write",
        detail: "Summarization, semantic routing, fuzzy extraction, natural-language search, classification of messy text, and generation are good candidates."
      },
      {
        text: "Hybrid systems are usually best",
        detail: "Use code for orchestration and validation; use models for language understanding, fuzzy judgment, or generation."
      },
      {
        text: "A model call has product costs",
        detail: "Latency, API cost, reliability, privacy, monitoring, regression testing, and user trust all become part of the feature."
      },
      {
        text: "A prototype can hide production pain",
        detail: "A demo with one prompt and one happy-path document says almost nothing about edge cases, scale, cost, or support burden."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "AI or normal code?",
        headers: [
          "Task",
          "Prefer",
          "Why"
        ],
        rows: [
          [
            "Calculate invoice total",
            "Code",
            "Exact deterministic formula"
          ],
          [
            "Extract fields from varied invoices",
            "AI + schema validation",
            "Messy input, structured output"
          ],
          [
            "Check permission",
            "Code",
            "Security invariant"
          ],
          [
            "Summarize support thread",
            "AI",
            "Language-heavy compression"
          ],
          [
            "Route ticket by meaning",
            "AI + fallback",
            "Semantic classification"
          ],
          [
            "Decide whether to delete data",
            "Code + human approval",
            "Irreversible side effect"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Using an LLM as a very expensive if statement",
        text: "If a parser, regex, enum lookup, database query, or normal function solves the problem reliably, a model call adds nondeterminism for no benefit.",
        detail: "The best AI engineering often removes model calls from places they are not needed."
      },
      {
        kind: "bestPractice",
        title: "Make the model's job small",
        text: "Give the model a narrow task, clear context, explicit output schema, and deterministic validation. The surrounding software should carry as much certainty as possible."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Production best practices"
      },
      {
        book: "anthropic-docs",
        chapter: "Define success criteria and tests"
      },
      {
        book: "rules-of-ml",
        chapter: "ML engineering guidance"
      }
    ],
    related: [
      "structured-outputs-and-validation",
      "cost-latency-and-reliability",
      "human-review-and-release-checklists"
    ]
  },
  {
    id: "structured-outputs-and-validation",
    domainId: "applied-ai-engineering",
    title: "Structured Outputs & Validation",
    summary: "Structured output turns model responses into data your program can consume. The schema is the start; validation, authorization, business rules, and fallback behavior make it production-safe.",
    keyPoints: [
      {
        text: "A schema is an API contract",
        detail: "Downstream code should receive typed fields, not parse vibes from prose. Names, nullability, enums, and nested objects should be explicit."
      },
      {
        text: "Syntactic validity is not semantic correctness",
        detail: "Valid JSON can still contain invented values, invalid actions, unauthorized account IDs, or numbers outside business limits."
      },
      {
        text: "Unknown must be representable",
        detail: "For extraction, force the model to use null or an explicit error when evidence is missing. Otherwise it will often fill the blank."
      },
      {
        text: "Validation belongs outside the model",
        detail: "The model can propose; code must check types, ranges, permissions, invariants, and evidence."
      },
      {
        text: "Repair retries need limits",
        detail: "A retry can fix malformed output, but repeated repair attempts hide prompt/schema problems and multiply cost."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Treat model output as untrusted input",
        code: "raw = model.extract(document)\nparsed = InvoiceSchema.parse(raw)       // shape + type validation\nrequire_user_can_access(user, parsed.accountId)\nrequire(parsed.amount >= 0)\nrequire(evidence_supports(parsed, document))\nsave(parsed)",
        caption: "The schema gets you parseable data; it does not prove the data is true or allowed."
      },
      {
        kind: "table",
        caption: "Validation layers",
        headers: [
          "Layer",
          "Example"
        ],
        rows: [
          [
            "Syntax",
            "Valid JSON"
          ],
          [
            "Schema",
            "Required fields, enums, numeric types"
          ],
          [
            "Business rule",
            "Amount cannot be negative"
          ],
          [
            "Authorization",
            "User may access accountId"
          ],
          [
            "Evidence",
            "Extracted value appears in source"
          ],
          [
            "Safety",
            "Action is allowed without human approval"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Schema as a safety blanket",
        text: "A strict schema prevents malformed shape, not bad decisions. The model can produce perfectly valid data that is unsupported, unsafe, or unauthorized.",
        detail: "This is especially important for tool calls: argument validation and permission checks must be independent of the model."
      },
      {
        kind: "bestPractice",
        title: "Measure per-field accuracy",
        text: "For extraction, track each field separately. A 95% record-level success rate can hide a critical field that is wrong often enough to break the workflow."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Structured output; function calling"
      },
      {
        book: "anthropic-docs",
        chapter: "Prompt engineering and tool use"
      },
      {
        book: "made-with-ml",
        chapter: "Testing and evaluation"
      }
    ],
    related: [
      "tool-calling-and-agents",
      "llm-evaluation",
      "prompt-injection-and-ai-security"
    ]
  },
  {
    id: "retrieval-search-and-reranking",
    domainId: "applied-ai-engineering",
    title: "Retrieval, Search & Reranking",
    summary: "AI systems often need to find the right context before generating. Keyword search, vector search, metadata filters, hybrid retrieval, and reranking are complementary tools.",
    keyPoints: [
      {
        text: "Keyword search is strong for exact terms",
        detail: "Names, error codes, IDs, API methods, product SKUs, and rare phrases often work better lexically than semantically."
      },
      {
        text: "Vector search is strong for semantic similarity",
        detail: "It helps when the user asks in different words than the documents use, or when the match is conceptual rather than lexical."
      },
      {
        text: "Metadata filters are not optional",
        detail: "Tenant, permission, freshness, language, product, version, region, and document type filters prevent wrong or unauthorized context."
      },
      {
        text: "Hybrid retrieval increases recall",
        detail: "Combining lexical and semantic candidates often beats either method alone."
      },
      {
        text: "Reranking increases precision",
        detail: "A slower model can inspect the top candidates and reorder them for the exact query, improving final context quality."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Hybrid retrieval pipeline",
        code: "flowchart LR\n  Q[Query] --> K[Keyword retrieval]\n  Q --> V[Vector retrieval]\n  K --> M[Merge + dedupe]\n  V --> M\n  M --> F[Permission / metadata filters]\n  F --> R[Rerank]\n  R --> C[Top context chunks]",
        caption: "Retrieval is a ranking pipeline, not one vector lookup."
      },
      {
        kind: "table",
        caption: "Retrieval tools",
        headers: [
          "Tool",
          "Best at",
          "Weakness"
        ],
        rows: [
          [
            "Keyword / BM25",
            "Exact terms and rare phrases",
            "Misses paraphrases"
          ],
          [
            "Vector search",
            "Semantic similarity",
            "Can miss exact identifiers"
          ],
          [
            "Metadata filters",
            "Boundaries and freshness",
            "Only as good as metadata"
          ],
          [
            "Reranker",
            "Precision on candidates",
            "Adds latency/cost"
          ],
          [
            "Hybrid search",
            "Recall across query types",
            "More moving parts"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Embedding everything and calling it search",
        text: "Pure vector search often fails on exact IDs, versioned docs, permissions, freshness, and domain-specific ranking.",
        detail: "Great retrieval systems look boring: filters, lexical search, semantic search, reranking, deduping, and evaluation."
      },
      {
        kind: "bestPractice",
        title: "Build a retrieval eval set",
        text: "Collect real queries and known-good source chunks. Track recall@k, precision@k, freshness, permission correctness, and whether the final context is sufficient to answer."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "File search and retrieval"
      },
      {
        book: "sklearn-guide",
        chapter: "Feature extraction and nearest neighbors"
      },
      {
        book: "paper-rag",
        chapter: "Retrieval-Augmented Generation"
      }
    ],
    related: [
      "retrieval-augmented-generation",
      "embeddings-and-representation-learning",
      "llm-evaluation"
    ]
  },
  {
    id: "llm-evaluation",
    domainId: "applied-ai-engineering",
    title: "LLM Evaluation",
    summary: "LLM evaluation turns fuzzy behavior into repeatable evidence. It uses representative examples, rubrics, automated checks, model or human graders, regression tests, and production monitoring.",
    keyPoints: [
      {
        text: "Start with examples from real usage",
        detail: "An eval set should include ordinary cases, edge cases, adversarial inputs, missing-context cases, tool failures, and examples users actually send."
      },
      {
        text: "Separate evaluation dimensions",
        detail: "Format validity, factuality, grounding, helpfulness, safety, refusal behavior, citation support, latency, and cost are not one score."
      },
      {
        text: "Automated graders need calibration",
        detail: "Model-based judges are useful for scale, but they can be inconsistent, biased toward style, or wrong about domain facts."
      },
      {
        text: "Regression evals protect prompts and retrieval",
        detail: "Every prompt, model, chunking, retrieval, reranker, or schema change can fix one case and break another."
      },
      {
        text: "Production feedback closes the loop",
        detail: "Offline evals are necessary, but production traffic reveals distribution shifts, user phrasing, latency, cost, and workflow issues."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "LLM eval dimensions",
        headers: [
          "Dimension",
          "Example check"
        ],
        rows: [
          [
            "Format",
            "Valid JSON matching schema"
          ],
          [
            "Grounding",
            "Every factual claim supported by retrieved evidence"
          ],
          [
            "Task success",
            "User goal completed"
          ],
          [
            "Safety",
            "Refuses or escalates risky requests"
          ],
          [
            "Tool use",
            "Correct tool, valid args, authorized action"
          ],
          [
            "Cost/latency",
            "Within product budget"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Evaluation loop",
        code: "flowchart LR\n  A[Collect examples] --> B[Define rubric]\n  B --> C[Run candidate]\n  C --> D[Grade automatically]\n  C --> E[Human review sample]\n  D --> F[Compare to baseline]\n  E --> F\n  F --> G[Ship / revise]\n  G --> H[Monitor production]\n  H --> A",
        caption: "Good evals evolve with production failures."
      },
      {
        kind: "pitfall",
        title: "Only testing happy paths",
        text: "LLM systems usually fail at boundaries: missing context, contradictory evidence, malicious input, weird formatting, partial tool failures, or ambiguous instructions.",
        detail: "A five-example demo is not an eval. It is a sales pitch to yourself."
      },
      {
        kind: "bestPractice",
        title: "Create evals before prompt tuning",
        text: "Without a baseline eval set, prompt engineering becomes anecdote-driven. With one, each change either improves measured behavior or it does not."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Evals and production guidance"
      },
      {
        book: "anthropic-docs",
        chapter: "Define success criteria and empirical tests"
      },
      {
        book: "made-with-ml",
        chapter: "Evaluation"
      }
    ],
    related: [
      "prompting-and-decoding",
      "structured-outputs-and-validation",
      "retrieval-augmented-generation"
    ]
  },
  {
    id: "cost-latency-and-reliability",
    domainId: "applied-ai-engineering",
    title: "Cost, Latency & Reliability",
    summary: "AI features have systems constraints. Model choice, token count, retrieval size, retries, caching, streaming, batching, and fallbacks determine whether the feature is usable and affordable.",
    keyPoints: [
      {
        text: "Tokens are both cost and latency",
        detail: "Long instructions, huge retrieved context, verbose history, and long answers make every request slower and more expensive."
      },
      {
        text: "Model choice should match task difficulty",
        detail: "Use smaller models for routing, extraction, formatting, classification, or simple rewrite tasks when they meet quality bars."
      },
      {
        text: "Caching helps stable work",
        detail: "Cache embeddings, retrieved candidates, stable summaries, tool results, and model outputs when freshness rules allow."
      },
      {
        text: "Retries are not free reliability",
        detail: "Retries can handle transient failures and malformed output, but they multiply cost/latency and can mask systemic defects."
      },
      {
        text: "Fallback behavior is part of UX",
        detail: "Decide what happens when retrieval fails, validation fails, the model is uncertain, or the request exceeds budget."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Optimization levers",
        headers: [
          "Lever",
          "Reduces",
          "Trade-off"
        ],
        rows: [
          [
            "Shorter context",
            "Cost/latency",
            "May lose useful evidence"
          ],
          [
            "Smaller model",
            "Cost/latency",
            "May reduce quality"
          ],
          [
            "Caching",
            "Repeated cost",
            "Freshness complexity"
          ],
          [
            "Streaming",
            "Perceived latency",
            "Client complexity"
          ],
          [
            "Reranking fewer docs",
            "Latency",
            "May miss evidence"
          ],
          [
            "Bounded retries",
            "Tail failures",
            "May return fallback more often"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Optimizing cost per call instead of cost per successful task",
        text: "A cheap model that fails often may be more expensive per completed workflow than a stronger model that succeeds reliably.",
        detail: "Measure total task cost: model calls, retries, tool calls, human review, user correction, and support tickets."
      },
      {
        kind: "bestPractice",
        title: "Set budgets explicitly",
        text: "Define max latency, max tokens, max tool calls, max retries, and fallback behavior for each AI workflow. Do not let the loop discover the budget by accident."
      },
      {
        kind: "note",
        title: "Streaming improves perception, not total work",
        text: "Streaming can make users feel progress sooner, but the model still generates the same output and the system still pays for it."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Latency optimization; cost optimization; production best practices"
      },
      {
        book: "made-with-ml",
        chapter: "Serving and monitoring"
      },
      {
        book: "rules-of-ml",
        chapter: "ML system design"
      }
    ],
    related: [
      "tokenization-and-context",
      "choosing-ai-vs-code",
      "monitoring-and-drift"
    ]
  }
]
