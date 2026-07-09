import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "tokenization-and-context",
    domainId: "llms-generative-ai",
    title: "Tokenization & Context Windows",
    summary: "LLMs operate on tokens, not raw characters or words directly. The context window is the maximum token budget the model can condition on during one request.",
    keyPoints: [
      {
        text: "A token is a model-facing chunk of text",
        detail: "Tokens may be whole words, word pieces, punctuation, spaces, or byte-like fragments. The visible length of text and token count are related, but not identical."
      },
      {
        text: "Context is working memory, not permanent memory",
        detail: "The model can use what is inside the current context window. Anything outside the window is unavailable unless retrieved, summarized, or stored elsewhere and reintroduced."
      },
      {
        text: "Long context has real costs",
        detail: "More tokens increase latency and cost, and may reduce focus because relevant facts are buried in more noise."
      },
      {
        text: "Ordering and formatting matter",
        detail: "Instructions, examples, retrieved evidence, tool results, and chat history compete for attention. The context builder is part of your application logic."
      },
      {
        text: "Different languages and code tokenize differently",
        detail: "Non-English text, identifiers, whitespace, and symbols can consume more tokens than expected. Measure token usage for your actual content."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Context budget",
        code: "flowchart LR\n  A[System/developer instructions] --> W[Context window]\n  B[User request] --> W\n  C[Conversation state] --> W\n  D[Retrieved evidence] --> W\n  E[Tool results] --> W\n  W --> M[Model output]",
        caption: "Everything useful must fit inside the current request's context."
      },
      {
        kind: "table",
        caption: "What spends tokens",
        headers: [
          "Context ingredient",
          "Why include it",
          "Risk if overused"
        ],
        rows: [
          [
            "Instructions",
            "Define behavior and constraints",
            "Long policies become hard to follow"
          ],
          [
            "Examples",
            "Teach output pattern",
            "Too many examples crowd evidence"
          ],
          [
            "Retrieved chunks",
            "Ground answers in facts",
            "Noise causes wrong grounding"
          ],
          [
            "Chat history",
            "Preserve state",
            "Old state conflicts with current task"
          ],
          [
            "Tool outputs",
            "Fresh external data",
            "Large raw outputs hide key facts"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Using the context window as a database",
        text: "Dumping a whole manual, repo, chat log, or document collection into context is expensive and brittle. Use retrieval, summaries, and explicit state instead.",
        detail: "Long-context models are useful, but they do not remove the need for information architecture."
      },
      {
        kind: "bestPractice",
        title: "Build context intentionally",
        text: "Prefer small, relevant, well-labeled context blocks. Put source metadata near evidence, remove stale history, and reserve output budget."
      }
    ],
    refs: [
      {
        book: "hf-llm-course",
        chapter: "Tokenizers library; LLM basics"
      },
      {
        book: "google-mlcc",
        chapter: "Intro to Large Language Models"
      },
      {
        book: "openai-docs",
        chapter: "Text generation and context management"
      }
    ],
    related: [
      "prompting-and-decoding",
      "retrieval-augmented-generation",
      "cost-latency-and-reliability"
    ]
  },
  {
    id: "transformer-architecture",
    domainId: "llms-generative-ai",
    title: "Transformer Architecture",
    summary: "A Transformer processes tokens through repeated attention and feed-forward blocks. Attention lets each token mix information from other tokens, which made large-scale language modeling dramatically more effective.",
    keyPoints: [
      {
        text: "Self-attention computes token-to-token relevance",
        detail: "Each token produces query, key, and value vectors. Attention compares queries to keys and uses the resulting weights to mix values from relevant tokens."
      },
      {
        text: "Multi-head attention learns multiple relationship types",
        detail: "Different heads can track different patterns: syntax, references, position, formatting, entity relationships, or task-specific cues."
      },
      {
        text: "Position information is added explicitly",
        detail: "Attention alone does not know order. Positional encodings or embeddings let the model distinguish 'dog bites man' from 'man bites dog'."
      },
      {
        text: "Feed-forward layers transform each token representation",
        detail: "Attention moves information across positions; feed-forward networks process and reshape the representation at each position."
      },
      {
        text: "Residual connections and normalization make deep stacks trainable",
        detail: "They stabilize optimization and preserve useful signals across many layers."
      },
      {
        text: "Decoder-only Transformers predict the next token",
        detail: "Most chat LLMs are trained so each position can attend to previous context and predict what comes next."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "One Transformer block",
        code: "flowchart TD\n  I[Token representation] --> A[Self-attention]\n  A --> R1[Add residual + normalize]\n  R1 --> F[Feed-forward network]\n  F --> R2[Add residual + normalize]\n  R2 --> O[Next layer]\n",
        caption: "The block repeats many times; scale comes from stacking and training on huge corpora."
      },
      {
        kind: "table",
        caption: "Important moving parts",
        headers: [
          "Part",
          "Job"
        ],
        rows: [
          [
            "Embeddings",
            "Represent tokens as vectors"
          ],
          [
            "Position encoding",
            "Expose token order"
          ],
          [
            "Attention",
            "Route information between tokens"
          ],
          [
            "Feed-forward network",
            "Transform token representations"
          ],
          [
            "Residuals",
            "Preserve signal across depth"
          ],
          [
            "Layer normalization",
            "Stabilize training"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Saying 'attention' explains everything",
        text: "Attention is the signature idea, but the model's behavior also depends on data, tokenizer, objective, architecture details, scaling, instruction tuning, tools, and retrieval.",
        detail: "A Transformer architecture is necessary for modern LLM behavior, not a complete explanation of product behavior."
      },
      {
        kind: "bestPractice",
        title: "Use attention as routing intuition",
        text: "The useful mental model: each token asks which other tokens matter for updating its own representation."
      }
    ],
    refs: [
      {
        book: "paper-transformers",
        chapter: "Attention Is All You Need"
      },
      {
        book: "hf-llm-course",
        chapter: "How do Transformers work?"
      },
      {
        book: "d2l",
        chapter: "Attention Mechanisms and Transformers"
      }
    ],
    related: [
      "cnn-rnn-transformer-families",
      "tokenization-and-context",
      "pretraining-finetuning-instruction-tuning"
    ]
  },
  {
    id: "pretraining-finetuning-instruction-tuning",
    domainId: "llms-generative-ai",
    title: "Pretraining, Fine-Tuning & Instruction Tuning",
    summary: "Pretraining learns broad capability from massive data; fine-tuning specializes behavior; instruction tuning and preference optimization shape the model toward useful human-facing responses.",
    keyPoints: [
      {
        text: "Pretraining creates general language capability",
        detail: "The model learns statistical structure by predicting tokens or otherwise reconstructing parts of data. It absorbs broad patterns but not necessarily truthfulness, obedience, or domain policy."
      },
      {
        text: "Fine-tuning changes weights for a narrower distribution",
        detail: "It can teach domain terminology, stable formats, task style, or narrow behavior, but it requires high-quality examples and regression evaluation."
      },
      {
        text: "Instruction tuning teaches task-following",
        detail: "Examples of instructions and desired responses make a base model more likely to behave like an assistant rather than just continue text."
      },
      {
        text: "Preference optimization ranks outputs by human preference",
        detail: "RLHF and related methods train the model toward responses humans or preference models judge as better."
      },
      {
        text: "RAG is often better than fine-tuning for changing knowledge",
        detail: "If the problem is missing, private, or frequently updated facts, retrieval is easier to inspect, cite, update, and roll back."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Which adaptation lever?",
        headers: [
          "Need",
          "Usually prefer",
          "Why"
        ],
        rows: [
          [
            "Add current/private facts",
            "RAG",
            "Knowledge stays inspectable and updateable"
          ],
          [
            "Enforce strict shape",
            "Structured output + validation",
            "Format can be checked in code"
          ],
          [
            "Teach stable style/domain behavior",
            "Fine-tuning",
            "Examples become behavior"
          ],
          [
            "Improve instruction-following",
            "Instruction tuning / prompt design",
            "Task behavior becomes clearer"
          ],
          [
            "Improve subjective preference",
            "Preference optimization",
            "Learns ranking of outputs"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Fine-tuning as a database",
        text: "Fine-tuning is not a good place to store facts that change weekly or need citations. It makes knowledge harder to inspect and harder to remove.",
        detail: "A common RAG-vs-fine-tuning rule: retrieve facts, fine-tune behavior."
      },
      {
        kind: "bestPractice",
        title: "Diagnose the failure first",
        text: "Missing context, weak instructions, wrong model, bad retrieval, wrong output schema, and domain style gaps require different fixes."
      },
      {
        kind: "note",
        title: "Fine-tuning still needs evals",
        text: "A fine-tuned model can improve the target task while regressing refusal behavior, formatting, latency, or adjacent tasks. Keep regression tests."
      }
    ],
    refs: [
      {
        book: "hf-llm-course",
        chapter: "Fine-tuning a pretrained model; Fine-tune LLMs"
      },
      {
        book: "paper-instructgpt",
        chapter: "Instruction following with human feedback"
      },
      {
        book: "openai-docs",
        chapter: "Fine-tuning guidance"
      }
    ],
    related: [
      "retrieval-augmented-generation",
      "prompting-and-decoding",
      "llm-evaluation"
    ]
  },
  {
    id: "prompting-and-decoding",
    domainId: "llms-generative-ai",
    title: "Prompting & Decoding",
    summary: "Prompting defines task, context, constraints, and examples; decoding controls how the model chooses output tokens through settings such as temperature and top-p.",
    keyPoints: [
      {
        text: "A prompt is an interface contract",
        detail: "Good prompts specify role, task, evidence, constraints, output format, uncertainty behavior, and examples when the behavior is subtle."
      },
      {
        text: "Examples beat vague style instructions",
        detail: "Few-shot examples make the target pattern concrete, especially for formatting, tone, edge cases, and classification boundaries."
      },
      {
        text: "Temperature controls randomness",
        detail: "Lower temperature is more deterministic; higher temperature increases variety and risk. Extraction and classification usually want low temperature."
      },
      {
        text: "Top-p limits sampling to a probability mass",
        detail: "It controls diversity by considering only tokens whose cumulative probability reaches the chosen threshold."
      },
      {
        text: "Prompt changes are code changes",
        detail: "They can fix one case and break another. Version prompts and run regression evals."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Prompt skeleton for extraction",
        code: "Task: Extract invoice fields from the text.\nRules:\n- Use only values explicitly present in the document.\n- Return JSON only.\n- Use null for missing fields.\n- Do not guess.\nSchema:\n{ \"invoiceNumber\": string|null, \"amount\": number|null, \"currency\": string|null }\nDocument:\n<text here>",
        caption: "Make uncertainty and output shape explicit."
      },
      {
        kind: "table",
        caption: "Decoding controls",
        headers: [
          "Setting",
          "Lower value",
          "Higher value"
        ],
        rows: [
          [
            "Temperature",
            "More deterministic",
            "More varied / creative"
          ],
          [
            "Top-p",
            "Smaller candidate pool",
            "Broader candidate pool"
          ],
          [
            "Max tokens",
            "Shorter output / cheaper",
            "More complete / costlier"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Prompt folklore",
        text: "Magic phrases may appear to help on a few examples, but without an eval set you cannot tell whether the improvement is real, general, or worth the added prompt complexity.",
        detail: "Prompt engineering without evals becomes superstition quickly."
      },
      {
        kind: "bestPractice",
        title: "Put examples near the failure boundary",
        text: "If the model confuses two categories, include examples around that boundary rather than generic easy examples."
      }
    ],
    refs: [
      {
        book: "anthropic-docs",
        chapter: "Prompt engineering overview"
      },
      {
        book: "openai-docs",
        chapter: "Prompting and text generation"
      },
      {
        book: "hf-llm-course",
        chapter: "Inference with LLMs"
      }
    ],
    related: [
      "structured-outputs-and-validation",
      "llm-evaluation",
      "tokenization-and-context"
    ]
  },
  {
    id: "retrieval-augmented-generation",
    domainId: "llms-generative-ai",
    title: "Retrieval-Augmented Generation (RAG)",
    summary: "RAG retrieves external evidence at answer time and gives it to the model as context. It separates knowledge storage from language generation, making answers more current, inspectable, and citeable.",
    keyPoints: [
      {
        text: "RAG is for knowledge outside the model",
        detail: "Private docs, fresh policies, user-specific records, long-tail support material, and auditable sources belong in retrieval rather than model weights."
      },
      {
        text: "Retrieval quality dominates answer quality",
        detail: "If the right evidence is absent, stale, buried, or unauthorized, the generator is forced to guess or answer from weak context."
      },
      {
        text: "Chunking defines the unit of memory",
        detail: "Chunks too small lose surrounding meaning; chunks too large add noise and waste tokens. Good chunking follows document structure."
      },
      {
        text: "Reranking improves precision after broad retrieval",
        detail: "A fast first-stage retriever can gather candidates; a slower reranker can choose the best evidence for the exact query."
      },
      {
        text: "Citations require source tracking",
        detail: "The system must preserve source IDs and spans from retrieval into generation. A model cannot reliably invent citations after answering."
      },
      {
        text: "RAG does not guarantee truth",
        detail: "It reduces hallucination only if retrieval, prompt instructions, evidence formatting, and answer validation are designed well."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "RAG pipeline",
        code: "flowchart LR\n  Q[User question] --> EQ[Embed / parse query]\n  EQ --> R[Retrieve candidate chunks]\n  R --> F[Filter permissions + freshness]\n  F --> RR[Rerank]\n  RR --> P[Build prompt with evidence]\n  P --> G[Generate grounded answer]\n  G --> C[Return answer + citations]",
        caption: "Every step can be evaluated separately."
      },
      {
        kind: "table",
        caption: "RAG failure modes",
        headers: [
          "Failure",
          "Symptom",
          "Fix"
        ],
        rows: [
          [
            "Bad chunking",
            "Relevant answer split or missing context",
            "Chunk by sections, include headings"
          ],
          [
            "Low recall",
            "Correct source not in top-k",
            "Hybrid retrieval, better embeddings"
          ],
          [
            "Low precision",
            "Context full of distractors",
            "Reranking, filters, metadata"
          ],
          [
            "Stale source",
            "Answer uses old policy",
            "Freshness filters, source versioning"
          ],
          [
            "No grounding check",
            "Answer goes beyond evidence",
            "Require citations / abstain behavior"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Blaming the LLM for retrieval bugs",
        text: "Many RAG hallucinations are retrieval bugs. The model cannot ground an answer in evidence that was never retrieved.",
        detail: "Debug RAG from left to right: query understanding, retrieval recall, filters, reranking, context formatting, generation, citation validation."
      },
      {
        kind: "bestPractice",
        title: "Evaluate retrieval before generation",
        text: "Create test queries with known-good evidence and measure whether the right chunks appear in the top-k. If retrieval fails, generation evals will only tell you the final answer is bad, not why."
      }
    ],
    refs: [
      {
        book: "paper-rag",
        chapter: "Retrieval-Augmented Generation"
      },
      {
        book: "openai-docs",
        chapter: "File search and retrieval"
      },
      {
        book: "hf-llm-course",
        chapter: "Using Transformers and datasets"
      }
    ],
    related: [
      "embeddings-and-representation-learning",
      "retrieval-search-and-reranking",
      "llm-evaluation"
    ]
  },
  {
    id: "tool-calling-and-agents",
    domainId: "llms-generative-ai",
    title: "Tool Calling & Agents",
    summary: "Tool calling lets a model request typed external operations. An agent is an application loop that lets the model plan, call tools, observe results, update state, and continue until done or stopped.",
    keyPoints: [
      {
        text: "Tools are typed capabilities exposed by your application",
        detail: "The model proposes a tool name and arguments; application code validates arguments, checks permission, executes the operation, and returns results."
      },
      {
        text: "The model should not own authorization",
        detail: "A tool call is not proof that the action is allowed. Auth, policy, tenant isolation, idempotency, and audit logging must live outside the model."
      },
      {
        text: "Agents are control loops",
        detail: "The loop decides when to call a model, when to run tools, how to update state, when to ask a human, and when to stop."
      },
      {
        text: "Long-horizon agents need budgets",
        detail: "Max tool calls, timeouts, token limits, cost budgets, retry limits, and human-confirmation gates prevent runaway behavior."
      },
      {
        text: "Agent evals measure task completion",
        detail: "For agents, answer quality is not enough. Evaluate whether the task was completed correctly, safely, and within budget."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Agent loop sketch",
        code: "state = initial_task\nwhile not state.done and budget.remaining():\n    step = model.plan(state, available_tools)\n    if step.kind == \"tool_call\":\n        args = validate_schema(step.args)\n        authorize(user, step.tool, args)\n        result = run_tool(step.tool, args)\n        state = state.with_observation(result)\n    else:\n        return validate_answer(step.answer)",
        caption: "The model proposes; the application enforces."
      },
      {
        kind: "table",
        caption: "Tool safety checklist",
        headers: [
          "Concern",
          "Application responsibility"
        ],
        rows: [
          [
            "Schema",
            "Validate types, required fields, ranges"
          ],
          [
            "Authorization",
            "Check user/session/tenant permissions"
          ],
          [
            "Side effects",
            "Confirm risky actions, make idempotent"
          ],
          [
            "Observability",
            "Log tool name, args summary, result, cost"
          ],
          [
            "Failure",
            "Handle timeouts, retries, partial results"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "One giant 'do anything' tool",
        text: "A broad shell/database/browser/email tool gives the model too much ambiguous power. Narrow tools with explicit schemas are safer, easier to evaluate, and easier to debug.",
        detail: "Tool design is API design. If the API is vague, the agent's behavior will be vague too."
      },
      {
        kind: "bestPractice",
        title: "Require human approval for irreversible actions",
        text: "Sending emails, deleting records, spending money, changing permissions, or publishing content should usually require confirmation unless the workflow is extremely constrained."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Function calling; Agents SDK"
      },
      {
        book: "anthropic-docs",
        chapter: "Tool use and prompt engineering"
      },
      {
        book: "hf-llm-course",
        chapter: "Advanced LLM topics"
      }
    ],
    related: [
      "structured-outputs-and-validation",
      "prompt-injection-and-ai-security",
      "llm-evaluation"
    ]
  }
]
