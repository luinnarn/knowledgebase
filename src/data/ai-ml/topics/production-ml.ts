import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "ml-lifecycle",
    domainId: "production-ml",
    title: "ML System Lifecycle",
    summary: "A production ML system is not just a trained model. It is a loop around data collection, labeling, feature generation, training, evaluation, deployment, monitoring, retraining, rollback, and human operations.",
    keyPoints: [
      {
        text: "Data is the long-term asset",
        detail: "Model architectures and hyperparameters matter, but the durable value usually lives in curated data, labels, feature definitions, feedback loops, and evaluation sets."
      },
      {
        text: "Training is only one stage",
        detail: "A model that performs well in a notebook still needs reproducible training, versioned artifacts, serving infrastructure, monitoring, rollback, and ownership."
      },
      {
        text: "Evaluation gates deployment",
        detail: "Promotion criteria should include offline metrics, slice metrics, regression cases, calibration checks, safety checks, and operational constraints."
      },
      {
        text: "Production feedback changes the dataset",
        detail: "Users adapt, business rules change, upstream systems drift, and the model's own decisions can influence future training data."
      },
      {
        text: "Retraining is a controlled release process",
        detail: "A retrained model should be compared against the current production model and shipped through the same rollout discipline as any backend change."
      },
      {
        text: "Ownership must cover the whole loop",
        detail: "Someone has to own data quality, labeling, evals, deployment, monitoring, incident response, and deprecation — not just model code."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "ML lifecycle loop",
        code: "flowchart LR\n  A[Collect data] --> B[Label / validate]\n  B --> C[Build features]\n  C --> D[Train model]\n  D --> E[Evaluate]\n  E --> F[Deploy]\n  F --> G[Monitor]\n  G --> H[Collect feedback]\n  H --> B\n  E --> R[Reject / revise]\n  G --> Rollback[Rollback if needed]",
        caption: "The loop is continuous because data, users, and product requirements keep moving."
      },
      {
        kind: "table",
        caption: "Lifecycle artifacts",
        headers: [
          "Artifact",
          "Why it matters"
        ],
        rows: [
          [
            "Dataset version",
            "Reproduce what the model learned from"
          ],
          [
            "Feature definitions",
            "Keep training and serving aligned"
          ],
          [
            "Model artifact",
            "Deploy and roll back exact versions"
          ],
          [
            "Eval set",
            "Catch regressions before release"
          ],
          [
            "Experiment record",
            "Know what was tried and why"
          ],
          [
            "Monitoring dashboard",
            "Detect production behavior changes"
          ],
          [
            "Runbook",
            "Respond when quality or service degrades"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Treating model training as the project",
        text: "The trained model is often the easiest part to demo and the hardest part to keep correct in production. The surrounding system determines whether it stays useful.",
        detail: "This is why production ML feels more like product/platform engineering than isolated data science."
      },
      {
        kind: "bestPractice",
        title: "Define promotion criteria before training",
        text: "Write down what must improve, what must not regress, which slices matter, what latency/cost limits apply, and what rollback trigger stops the release."
      }
    ],
    refs: [
      {
        book: "rules-of-ml",
        chapter: "ML engineering lifecycle"
      },
      {
        book: "made-with-ml",
        chapter: "MLOps lifecycle"
      },
      {
        book: "google-mlcc",
        chapter: "Production ML systems"
      }
    ],
    related: [
      "model-serving-and-inference",
      "monitoring-and-drift",
      "experimentation-and-rollouts"
    ]
  },
  {
    id: "training-serving-skew",
    domainId: "production-ml",
    title: "Training-Serving Skew",
    summary: "Training-serving skew happens when the data or transformations used during training differ from what the model receives in production. It is one of the most common reasons strong offline metrics collapse after launch.",
    keyPoints: [
      {
        text: "Feature computation must match across environments",
        detail: "If training uses a notebook transformation and serving uses a rewritten backend implementation, tiny differences in null handling, scaling, encoding, or time windows can change model behavior."
      },
      {
        text: "Prediction-time availability is the real constraint",
        detail: "A feature is valid only if it exists before the model must make the prediction. Historical tables often contain fields that would not have been available in real time."
      },
      {
        text: "Default values are behavior",
        detail: "Missing values, unknown categories, empty text, delayed events, and malformed rows must be handled the same way in training and serving."
      },
      {
        text: "Vocabulary and schema drift create silent bugs",
        detail: "New categories, renamed fields, changed units, and upstream ETL changes can produce inputs the model never saw."
      },
      {
        text: "Skew should be tested and monitored directly",
        detail: "Compare feature distributions and transformed values between training, validation, shadow traffic, and production traffic."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Where skew enters",
        code: "flowchart TD\n  RawTrain[Historical raw data] --> TrainPipe[Training feature pipeline]\n  RawProd[Live raw data] --> ServePipe[Serving feature pipeline]\n  TrainPipe --> TrainFeatures[Training features]\n  ServePipe --> ProdFeatures[Production features]\n  TrainFeatures --> Model[Model]\n  ProdFeatures --> Model\n  TrainPipe -. mismatch .- ServePipe",
        caption: "The same conceptual feature can become different data if computed through different paths."
      },
      {
        kind: "table",
        caption: "Skew examples",
        headers: [
          "Skew type",
          "Example",
          "Impact"
        ],
        rows: [
          [
            "Time leakage",
            "Feature includes events after prediction time",
            "Offline score too optimistic"
          ],
          [
            "Preprocessing mismatch",
            "Training lowercases text, serving does not",
            "Different tokens/features"
          ],
          [
            "Missing-value mismatch",
            "Training drops nulls, serving fills zero",
            "Unexpected production behavior"
          ],
          [
            "Category drift",
            "New plan type unseen in training",
            "Bad encodings or fallbacks"
          ],
          [
            "Unit change",
            "Milliseconds become seconds upstream",
            "Predictions become nonsense"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Historical features that know the future",
        text: "A feature like `orders_next_7_days`, `final_status`, or an aggregate computed after the label date can make validation look magical and production useless.",
        detail: "The model is not smart; it is cheating because the dataset accidentally gave it tomorrow's information."
      },
      {
        kind: "bestPractice",
        title: "Feature parity tests",
        text: "Take the same raw example, run it through training and serving feature code, and assert the transformed features match exactly or within expected numeric tolerance."
      },
      {
        kind: "note",
        title: "Skew is not always dramatic",
        text: "Timezone handling, rounding, Unicode normalization, default currencies, late-arriving events, or category ordering can be enough to cause measurable degradation."
      }
    ],
    refs: [
      {
        book: "rules-of-ml",
        chapter: "Training-serving skew"
      },
      {
        book: "made-with-ml",
        chapter: "Data validation and monitoring"
      },
      {
        book: "google-mlcc",
        chapter: "Production ML systems"
      }
    ],
    related: [
      "feature-engineering",
      "data-splits",
      "monitoring-and-drift"
    ]
  },
  {
    id: "model-serving-and-inference",
    domainId: "production-ml",
    title: "Model Serving & Inference",
    summary: "Serving is the production path from request to prediction. It must satisfy latency, throughput, availability, versioning, security, observability, and rollback constraints — not just load a model artifact.",
    keyPoints: [
      {
        text: "Batch inference optimizes throughput",
        detail: "Use it when predictions can be precomputed: daily risk scores, recommendations, reports, offline enrichment, or scheduled backfills."
      },
      {
        text: "Online inference optimizes freshness",
        detail: "Use it when predictions depend on current request/session context or the result must be generated interactively."
      },
      {
        text: "Streaming improves perceived responsiveness",
        detail: "For generative outputs, streaming lets users start reading before the full answer is complete, even if total generation time is unchanged."
      },
      {
        text: "Versioning is non-negotiable",
        detail: "Every prediction should be traceable to model version, feature version, code version, prompt version if relevant, and configuration."
      },
      {
        text: "Serving hardware changes the economics",
        detail: "CPU vs GPU, batching, quantization, model size, warm starts, and autoscaling determine cost and latency more than offline accuracy tables suggest."
      },
      {
        text: "Prediction logging enables debugging",
        detail: "Log enough metadata to audit behavior while respecting privacy and retention rules."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Inference modes",
        headers: [
          "Mode",
          "Use when",
          "Trade-off"
        ],
        rows: [
          [
            "Batch",
            "Predictions can be precomputed",
            "Cheap and scalable, but stale"
          ],
          [
            "Online sync",
            "User waits for result",
            "Fresh, but latency-sensitive"
          ],
          [
            "Async online",
            "Result can arrive later",
            "More resilient, more workflow complexity"
          ],
          [
            "Streaming",
            "Partial output helps UX",
            "Client/server complexity"
          ],
          [
            "Edge/on-device",
            "Privacy/latency constraints",
            "Model size and update constraints"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Serving path",
        code: "flowchart LR\n  Req[Request] --> Auth[Auth + validation]\n  Auth --> Feat[Feature / context fetch]\n  Feat --> Model[Model inference]\n  Model --> Post[Post-processing / validation]\n  Post --> Log[Prediction log]\n  Post --> Resp[Response]\n  Model --> Metrics[Latency/cost/quality telemetry]",
        caption: "Inference is one step inside a larger service boundary."
      },
      {
        kind: "pitfall",
        title: "No rollback path",
        text: "A model deployment without versioned artifacts, traffic control, and previous-model fallback is a one-way door. That is not deployment; that is gambling.",
        detail: "Rollback should be tested before the first serious model launch."
      },
      {
        kind: "bestPractice",
        title: "Log prediction lineage",
        text: "For each prediction, record model version, feature version, important config, timestamp, request slice, and enough context to debug without violating privacy policy."
      }
    ],
    refs: [
      {
        book: "made-with-ml",
        chapter: "Serving"
      },
      {
        book: "rules-of-ml",
        chapter: "ML systems"
      },
      {
        book: "openai-docs",
        chapter: "Production best practices"
      }
    ],
    related: [
      "ml-lifecycle",
      "cost-latency-and-reliability",
      "experimentation-and-rollouts"
    ]
  },
  {
    id: "monitoring-and-drift",
    domainId: "production-ml",
    title: "Monitoring & Drift",
    summary: "ML monitoring tracks data, predictions, model quality, business outcomes, and operational health after deployment. Drift means production has moved away from the assumptions under which the model was trained or validated.",
    keyPoints: [
      {
        text: "Data drift means input distribution changes",
        detail: "Users, events, documents, languages, devices, traffic sources, or upstream systems now look different from training data."
      },
      {
        text: "Concept drift means the relationship changes",
        detail: "The same input patterns no longer imply the same label or outcome. Fraud behavior, user preferences, markets, and policies all shift."
      },
      {
        text: "Prediction drift can be an early warning",
        detail: "A sudden shift in class rates, scores, generated refusal rate, or output length often signals upstream or model behavior change."
      },
      {
        text: "Ground truth often arrives late",
        detail: "Fraud confirmation, churn, support satisfaction, medical outcomes, or chargebacks may lag predictions by days or months."
      },
      {
        text: "Slices reveal hidden regressions",
        detail: "Aggregate metrics can hide failures in a region, language, tenant, plan, device, document type, or protected group."
      },
      {
        text: "Operational monitoring is necessary but insufficient",
        detail: "CPU, memory, latency, and error rate can be healthy while model quality is deteriorating."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "What to monitor",
        headers: [
          "Signal",
          "Examples"
        ],
        rows: [
          [
            "Input data",
            "Feature distributions, missing rates, schema changes"
          ],
          [
            "Predictions",
            "Score distribution, class balance, output length"
          ],
          [
            "Quality",
            "Delayed labels, human review outcomes, eval samples"
          ],
          [
            "Slices",
            "Region, language, cohort, tenant, device, plan"
          ],
          [
            "Operations",
            "Latency, errors, cost, fallback rate"
          ],
          [
            "User outcomes",
            "Complaints, corrections, conversions, escalations"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Monitoring loop",
        code: "flowchart LR\n  Prod[Production traffic] --> Logs[Prediction + feature logs]\n  Logs --> Drift[Drift checks]\n  Logs --> Quality[Quality labels / review]\n  Drift --> Alert[Alert / investigate]\n  Quality --> Alert\n  Alert --> Action[Rollback, retrain, tune, or ignore]\n  Action --> Prod",
        caption: "Drift alerts should trigger investigation, not automatic panic."
      },
      {
        kind: "pitfall",
        title: "Only monitoring service health",
        text: "A model service can have perfect uptime and terrible predictions. ML services need quality and distribution monitoring, not just infrastructure dashboards.",
        detail: "This is the hidden SRE wrinkle of ML: 'up' does not mean 'right'."
      },
      {
        kind: "bestPractice",
        title: "Monitor inputs, outputs, and outcomes together",
        text: "Input drift without quality loss may be harmless; quality loss without obvious input drift may indicate concept drift or labeling change. You need the whole picture."
      },
      {
        kind: "note",
        title: "Not all drift is bad",
        text: "A successful product launch, seasonal shift, or new customer segment can change distributions. The job is to understand impact, not blindly roll back every distribution movement."
      }
    ],
    refs: [
      {
        book: "made-with-ml",
        chapter: "Monitoring"
      },
      {
        book: "rules-of-ml",
        chapter: "Monitoring and infrastructure"
      },
      {
        book: "google-mlcc",
        chapter: "Production ML systems"
      }
    ],
    related: [
      "training-serving-skew",
      "model-serving-and-inference",
      "experimentation-and-rollouts"
    ]
  },
  {
    id: "experimentation-and-rollouts",
    domainId: "production-ml",
    title: "Experimentation & Rollouts",
    summary: "A model that wins offline still needs controlled production validation. Shadow deployments, canaries, A/B tests, gradual rollouts, and rollback criteria turn model launches into safe experiments.",
    keyPoints: [
      {
        text: "Offline metrics are necessary, not sufficient",
        detail: "Historical data estimates behavior under past conditions. Production traffic tests user reaction, systems interaction, latency, cost, and unexpected inputs."
      },
      {
        text: "Shadow deployment observes without acting",
        detail: "The new model receives production-like requests but does not affect user-facing decisions. This is useful for latency, logging, and distribution checks."
      },
      {
        text: "Canaries limit blast radius",
        detail: "Send a small slice of real traffic first, watch guardrails, then ramp gradually if behavior is healthy."
      },
      {
        text: "A/B tests measure product impact",
        detail: "They capture user behavior and business outcomes that offline ML metrics cannot see."
      },
      {
        text: "Rollback criteria should be predeclared",
        detail: "Decide in advance which movement in quality, complaints, latency, fairness slices, cost, or fallback rate stops the rollout."
      },
      {
        text: "Guardrail metrics protect the system",
        detail: "Optimizing one metric can harm others. Always track safety, cost, latency, and user harm indicators."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Safe rollout ladder",
        code: "flowchart LR\n  A[Offline eval] --> B[Shadow deployment]\n  B --> C[Canary]\n  C --> D[A/B test]\n  D --> E[Gradual ramp]\n  E --> F[Full release]\n  C --> R[Rollback]\n  D --> R\n  E --> R",
        caption: "Each stage earns the right to expose more users."
      },
      {
        kind: "table",
        caption: "Rollout stages",
        headers: [
          "Stage",
          "Answers"
        ],
        rows: [
          [
            "Offline eval",
            "Does it beat baseline on historical examples?"
          ],
          [
            "Shadow",
            "Can it run on real traffic without acting?"
          ],
          [
            "Canary",
            "Does a tiny real slice look safe?"
          ],
          [
            "A/B test",
            "Does it improve product outcomes?"
          ],
          [
            "Gradual ramp",
            "Does quality hold at scale?"
          ],
          [
            "Full release",
            "Can we monitor and roll back continuously?"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Shipping because AUC improved",
        text: "A better offline ranking metric may not improve user trust, revenue, support workload, fairness, or safety. Production experiments test the actual product objective.",
        detail: "Offline ML metrics are proxies. Useful proxies, yes — but still proxies."
      },
      {
        kind: "bestPractice",
        title: "Use launch gates",
        text: "A model should pass predefined gates before traffic increases: quality metric, slice metric, latency, cost, fallback rate, review burden, and incident-free soak time."
      }
    ],
    refs: [
      {
        book: "rules-of-ml",
        chapter: "Launch and iterate"
      },
      {
        book: "made-with-ml",
        chapter: "Testing and CI/CD"
      },
      {
        book: "google-mlcc",
        chapter: "Production ML systems"
      }
    ],
    related: [
      "metrics-and-evaluation",
      "llm-evaluation",
      "monitoring-and-drift"
    ]
  }
]
