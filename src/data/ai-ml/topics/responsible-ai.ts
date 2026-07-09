import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "fairness-and-bias",
    domainId: "responsible-ai",
    title: "Fairness & Bias",
    summary: "Bias can enter through data, labels, objectives, deployment context, and feedback loops. Fairness is not one universal metric; it is a product, policy, and measurement decision shaped by the harm model.",
    keyPoints: [
      {
        text: "Historical data can encode historical unfairness",
        detail: "If past decisions were biased, a model trained to imitate them may automate the same pattern with more speed and apparent objectivity."
      },
      {
        text: "Labels can be biased proxies",
        detail: "Arrests are not crime, complaints are not harm, clicks are not satisfaction, and performance reviews are not pure ability. Labels reflect measurement systems."
      },
      {
        text: "Removing sensitive attributes is not enough",
        detail: "Location, school, income, language, device, and behavior can act as proxy variables for protected or sensitive characteristics."
      },
      {
        text: "Fairness metrics can conflict",
        detail: "Equal false positive rates, equal false negative rates, calibration, and equal accuracy cannot always all hold at once across groups."
      },
      {
        text: "Slice evaluation is the minimum bar",
        detail: "Track performance and error types across meaningful cohorts, especially groups likely to be harmed or underrepresented."
      },
      {
        text: "Fairness requires governance, not just model tuning",
        detail: "Policy choices, documentation, escalation paths, user recourse, human review, and accountability matter as much as metrics."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Bias entry points",
        headers: [
          "Stage",
          "How bias enters"
        ],
        rows: [
          [
            "Data collection",
            "Some groups are underrepresented or measured differently"
          ],
          [
            "Labels",
            "Human/system labels encode prior decisions"
          ],
          [
            "Features",
            "Proxy variables reconstruct sensitive attributes"
          ],
          [
            "Objective",
            "Metric rewards behavior that harms a group"
          ],
          [
            "Deployment",
            "Users interact with the system differently"
          ],
          [
            "Feedback loop",
            "Model decisions shape future data"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Fairness by deletion",
        text: "Dropping protected attributes does not guarantee fairness. The model may infer the same information from proxies and still produce disparate outcomes.",
        detail: "Sometimes sensitive attributes are needed during evaluation specifically to detect unfair behavior, even if they are not used for prediction."
      },
      {
        kind: "bestPractice",
        title: "Define the harm model",
        text: "Before choosing a fairness metric, describe who can be harmed, how, by which mistake type, and what recourse they have. The metric should follow the harm model, not the other way around."
      },
      {
        kind: "note",
        title: "Fairness is contextual",
        text: "The right fairness target depends on domain, law, product purpose, user expectation, and social risk. There is no universal fairness checkbox."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "ML Fairness"
      },
      {
        book: "aima",
        chapter: "AI ethics and risks"
      },
      {
        book: "made-with-ml",
        chapter: "Responsible AI"
      }
    ],
    related: [
      "metrics-and-evaluation",
      "human-review-and-release-checklists",
      "privacy-and-data-governance"
    ]
  },
  {
    id: "privacy-and-data-governance",
    domainId: "responsible-ai",
    title: "Privacy & Data Governance",
    summary: "AI systems concentrate sensitive data in prompts, logs, retrieved context, embeddings, training sets, fine-tuning files, and human feedback. Governance defines what data can be used, where it flows, who can see it, and how long it lives.",
    keyPoints: [
      {
        text: "Prompts and outputs are production data",
        detail: "They may contain personal information, secrets, customer records, internal decisions, or regulated content. Treat them as sensitive logs, not harmless text."
      },
      {
        text: "Training data provenance matters",
        detail: "You need to know where data came from, what rights apply, whether consent exists, and whether the data is appropriate for the intended use."
      },
      {
        text: "Minimization reduces blast radius",
        detail: "Send the model only what it needs. Redact, hash, aggregate, or retrieve narrower context where possible."
      },
      {
        text: "Embeddings can be sensitive",
        detail: "Even when not raw text, embeddings can encode information about the original content and should inherit its access and retention rules."
      },
      {
        text: "Retrieval must enforce permissions",
        detail: "A RAG system that retrieves across tenants or access boundaries can leak data through semantic similarity."
      },
      {
        text: "Retention is an architectural decision",
        detail: "Prompt logs, eval examples, review notes, fine-tuning files, vector indexes, and traces need lifecycle rules."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "AI data surfaces",
        code: "flowchart TD\n  User[User input] --> Prompt[Prompt/context]\n  Docs[Private documents] --> Retrieval[Retrieval index]\n  Retrieval --> Prompt\n  Prompt --> Model[Model/API]\n  Model --> Output[Output]\n  Prompt --> Logs[Logs/traces]\n  Output --> Logs\n  Output --> Review[Human review]\n  Review --> Evals[Eval/training examples]",
        caption: "Every box needs access, retention, and sensitivity rules."
      },
      {
        kind: "table",
        caption: "Governance checklist",
        headers: [
          "Question",
          "Why it matters"
        ],
        rows: [
          [
            "What data enters prompts?",
            "Controls exposure to model/API/logging path"
          ],
          [
            "What is stored?",
            "Defines retention and breach surface"
          ],
          [
            "Who can retrieve it?",
            "Prevents cross-user/tenant leakage"
          ],
          [
            "Can it be used for training?",
            "Requires consent/legal basis"
          ],
          [
            "How is it deleted?",
            "Supports lifecycle and compliance"
          ],
          [
            "How is it audited?",
            "Supports incident response"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Vector index without authorization",
        text: "Semantic search still needs permissions. If the index ignores user/tenant boundaries, the system can retrieve confidential content that a user could never access directly.",
        detail: "The embedding layer does not magically erase access-control obligations."
      },
      {
        kind: "bestPractice",
        title: "Classify data before AI use",
        text: "Mark data as public, internal, confidential, personal, regulated, or forbidden before it enters prompts, indexes, logs, fine-tuning sets, or eval datasets."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Safety and production guidance"
      },
      {
        book: "aima",
        chapter: "Risks and ethics"
      },
      {
        book: "made-with-ml",
        chapter: "Data management"
      }
    ],
    related: [
      "retrieval-augmented-generation",
      "prompt-injection-and-ai-security",
      "human-review-and-release-checklists"
    ]
  },
  {
    id: "interpretability-and-explainability",
    domainId: "responsible-ai",
    title: "Interpretability & Explainability",
    summary: "Interpretability is understanding how a model works; explainability is communicating why a particular output happened. The need depends on risk, debugging needs, user trust, and regulation.",
    keyPoints: [
      {
        text: "Simple models can be inherently interpretable",
        detail: "Linear models and small decision trees can often be inspected directly, though preprocessing can still complicate interpretation."
      },
      {
        text: "Global explanations are not local explanations",
        detail: "Feature importance can show which features matter overall, but not necessarily why one specific prediction happened."
      },
      {
        text: "Local explanation tools are approximations",
        detail: "LIME/SHAP-style tools can be useful, but they are not perfect windows into model causality and can be unstable."
      },
      {
        text: "Explanations must fit the audience",
        detail: "A data scientist, regulator, support agent, end user, and executive need different levels of detail and different language."
      },
      {
        text: "LLM explanations may be post-hoc narratives",
        detail: "A model can generate a plausible explanation even when it is unsupported by evidence or not faithful to its internal computation."
      },
      {
        text: "Evidence beats eloquence",
        detail: "For high-impact systems, show source documents, feature values, thresholds, tool traces, or decision rules where possible."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Explanation types",
        headers: [
          "Type",
          "Example",
          "Useful for"
        ],
        rows: [
          [
            "Model-intrinsic",
            "Small tree path, linear coefficients",
            "Debugging and audit"
          ],
          [
            "Global post-hoc",
            "Feature importance",
            "Understanding broad behavior"
          ],
          [
            "Local post-hoc",
            "SHAP/LIME for one prediction",
            "Case review"
          ],
          [
            "Evidence-based",
            "Source passages / tool traces",
            "Grounded user explanation"
          ],
          [
            "Counterfactual",
            "What would need to change?",
            "Recourse and decision support"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Plausible explanation as faithful explanation",
        text: "A natural-language explanation can sound convincing while being generated after the fact. Do not confuse fluency with truth.",
        detail: "This is especially risky with LLMs: a model can explain a wrong answer in a way that sounds more coherent than the right debugging trace."
      },
      {
        kind: "bestPractice",
        title: "Attach explanations to evidence",
        text: "For RAG, cite passages. For classifiers, show key feature values and uncertainty. For agents, show tool calls and validation results. For high-stakes decisions, include human-review notes and recourse."
      },
      {
        kind: "note",
        title: "Interpretability is a requirement, not garnish",
        text: "If the domain requires explanation, choose model family and logging strategy accordingly before training or launching."
      }
    ],
    refs: [
      {
        book: "isl-python",
        chapter: "Interpretable models"
      },
      {
        book: "sklearn-guide",
        chapter: "Inspection"
      },
      {
        book: "aima",
        chapter: "AI risks and explainability"
      }
    ],
    related: [
      "trees-forests-boosting",
      "fairness-and-bias",
      "human-review-and-release-checklists"
    ]
  },
  {
    id: "prompt-injection-and-ai-security",
    domainId: "responsible-ai",
    title: "Prompt Injection & AI Security",
    summary: "Prompt injection is when untrusted text tries to override instructions, leak data, or manipulate tool use. Any AI system that reads external content and can act on it needs a security model.",
    keyPoints: [
      {
        text: "External text is untrusted input",
        detail: "Emails, webpages, tickets, documents, PDFs, calendar invites, Slack messages, and retrieved snippets can contain instructions aimed at the model rather than the user."
      },
      {
        text: "Authority must not come from text content",
        detail: "A document may provide facts, but it should not gain permission to override system policy or trigger actions."
      },
      {
        text: "Tool calls require independent checks",
        detail: "The model can request a tool; code must validate schema, permissions, tenant boundaries, side effects, and risk."
      },
      {
        text: "Data exfiltration is a core risk",
        detail: "A malicious prompt may ask the model to reveal hidden instructions, private context, retrieved documents, tool outputs, or other users' data."
      },
      {
        text: "Sandbox dangerous capabilities",
        detail: "Network, filesystem, shell, email, payments, account changes, and deletion tools need strict boundaries and often human approval."
      },
      {
        text: "Security evaluation needs adversarial cases",
        detail: "Test with malicious documents, conflicting instructions, indirect prompt injection, encoded payloads, and tool-abuse attempts."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Unsafe pattern",
        code: "page = fetch_url(user_url)\nprompt = system_rules + page.text + user_request\nanswer = model(prompt, tools=[send_email, delete_file, fetch_private_docs])",
        caption: "Untrusted page text now shares context with powerful tools unless the app enforces boundaries."
      },
      {
        kind: "diagram",
        title: "Separate data from authority",
        code: "flowchart LR\n  U[User/session policy] --> Auth[Authorization layer]\n  D[Untrusted document text] --> Model[Model]\n  Model --> Request[Tool call request]\n  Request --> Auth\n  Auth -->|allowed| Tool[Run tool]\n  Auth -->|denied| Refuse[Refuse / ask approval]",
        caption: "External text can inform answers, but authorization comes from the application."
      },
      {
        kind: "pitfall",
        title: "Thinking prompt injection is just rude input",
        text: "Prompt injection is closer to SQL injection than bad manners: untrusted data is being interpreted by a component that influences behavior.",
        detail: "The fix is not one magic instruction. You need least privilege, typed tools, validation, separation of trusted/untrusted context, and monitoring."
      },
      {
        kind: "bestPractice",
        title: "Least privilege for tools",
        text: "Expose the smallest tool set needed for the task, with narrow schemas, permission checks, confirmation gates for side effects, and no raw 'execute anything' escape hatch."
      },
      {
        kind: "note",
        title: "RAG increases the attack surface",
        text: "The system is now reading third-party or user-controlled text and feeding it to the model. That text can attack the model, the prompt, or the tool layer."
      }
    ],
    refs: [
      {
        book: "openai-docs",
        chapter: "Safety best practices; cybersecurity checks"
      },
      {
        book: "anthropic-docs",
        chapter: "Mitigate jailbreaks and prompt injection"
      },
      {
        book: "made-with-ml",
        chapter: "Security considerations"
      }
    ],
    related: [
      "tool-calling-and-agents",
      "structured-outputs-and-validation",
      "privacy-and-data-governance"
    ]
  },
  {
    id: "human-review-and-release-checklists",
    domainId: "responsible-ai",
    title: "Human Review & Release Checklists",
    summary: "Human review is a control for uncertain, high-impact, or low-confidence cases. A release checklist makes AI risk explicit before users discover it the hard way.",
    keyPoints: [
      {
        text: "Escalation defines safe failure",
        detail: "If context is missing, confidence is low, evidence conflicts, policy is unclear, or the action is high-impact, the system should ask for review or refuse."
      },
      {
        text: "Reviewers need evidence, not just output",
        detail: "Show source passages, model answer, uncertainty signals, tool traces, policy flags, and suggested actions so humans can actually judge the case."
      },
      {
        text: "Review data improves the system",
        detail: "Corrections can become eval examples, labels, prompt regression tests, retrieval tests, or training data if governance allows."
      },
      {
        text: "Checklists prevent demo blindness",
        detail: "Happy-path demos hide privacy, security, bias, latency, cost, monitoring, and rollback gaps."
      },
      {
        text: "High-stakes domains need stronger gates",
        detail: "Medical, legal, financial, hiring, education, safety, and access decisions require domain-specific review and accountability."
      },
      {
        text: "Review must have authority",
        detail: "Human-in-the-loop is useless if reviewers are rushed, ignored, or unable to override the model."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "AI release checklist",
        headers: [
          "Area",
          "Question"
        ],
        rows: [
          [
            "Task fit",
            "Why is AI needed instead of deterministic code?"
          ],
          [
            "Eval",
            "Do we have representative and adversarial examples?"
          ],
          [
            "Grounding",
            "Can outputs be tied to evidence where needed?"
          ],
          [
            "Safety",
            "What should the system refuse or escalate?"
          ],
          [
            "Privacy",
            "What enters prompts, logs, indexes, and review queues?"
          ],
          [
            "Security",
            "Can untrusted text influence tools or leak data?"
          ],
          [
            "Fairness",
            "Which slices must be checked?"
          ],
          [
            "Operations",
            "Can we monitor, roll back, and audit?"
          ],
          [
            "Human review",
            "Who reviews uncertain/high-impact cases?"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Review routing",
        code: "flowchart TD\n  A[AI output] --> B{Risk / confidence / policy}\n  B -->|low risk + valid| C[Auto-approve]\n  B -->|uncertain| D[Human review]\n  B -->|high risk| E[Require explicit approval]\n  B -->|disallowed| F[Refuse]\n  D --> G[Correction becomes eval/feedback]",
        caption: "Review should be targeted at cases where human judgment changes the outcome."
      },
      {
        kind: "pitfall",
        title: "Human-in-the-loop as rubber stamp",
        text: "If reviewers lack evidence, time, authority, or clear criteria, review becomes theater. The workflow must make disagreement and correction easy.",
        detail: "A review process that always approves the model is not a control; it is latency."
      },
      {
        kind: "bestPractice",
        title: "Design review around uncertainty and impact",
        text: "Automate the safe middle. Escalate cases that are risky, novel, low-confidence, contradictory, regulated, irreversible, or user-impacting."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "ML Fairness and responsible engineering"
      },
      {
        book: "openai-docs",
        chapter: "Production checklist and safety"
      },
      {
        book: "made-with-ml",
        chapter: "Testing, monitoring, human-in-the-loop"
      }
    ],
    related: [
      "fairness-and-bias",
      "privacy-and-data-governance",
      "llm-evaluation"
    ]
  }
]
