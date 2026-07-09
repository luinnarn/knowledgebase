import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "ai-ml-landscape",
    domainId: "foundations",
    title: "AI vs ML vs Deep Learning vs Generative AI",
    summary: "AI is the broad goal of making machines behave intelligently; ML is the data-driven subset; deep learning is ML with layered neural networks; generative AI produces new content such as text, code, images, audio, or structured data.",
    keyPoints: [
      {
        text: "AI is the umbrella, not one specific technique",
        detail: "Search, planning, optimization, expert systems, robotics, and machine learning can all be AI. ML is only the branch where the behavior is learned from examples or experience rather than fully hand-coded."
      },
      {
        text: "Machine learning replaces explicit rules with learned patterns",
        detail: "Instead of writing every rule yourself, you define inputs, targets, a model family, a loss, and an optimization process. The result is powerful, but the behavior is statistical rather than guaranteed like ordinary code."
      },
      {
        text: "Deep learning learns representations, not just predictions",
        detail: "Classical ML often depends heavily on human-designed features. Deep models learn intermediate representations from rawer input: pixels, tokens, audio frames, event sequences, or graph neighborhoods."
      },
      {
        text: "Generative AI models produce artifacts, not just labels",
        detail: "A classifier chooses from a fixed label set; a generative model can synthesize a free-form answer, document, image, or plan. That flexibility is why it is useful — and why validation is harder."
      },
      {
        text: "LLMs are generative models trained mainly through token prediction",
        detail: "The base skill is predicting the next token from context. Instruction tuning, preference optimization, tools, retrieval, and product constraints then shape that raw capability into a usable application."
      },
      {
        text: "Use the narrowest accurate term",
        detail: "Calling everything AI makes design fuzzy. A fraud classifier, embedding search index, LLM summarizer, and tool-using agent have different data needs, metrics, and failure modes."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "The vocabulary stack",
        headers: [
          "Term",
          "What it means",
          "Concrete example"
        ],
        rows: [
          [
            "AI",
            "Broad goal: intelligent behavior",
            "Planning, search, robotics, ML"
          ],
          [
            "ML",
            "Behavior learned from data",
            "Spam classifier, price predictor"
          ],
          [
            "Deep learning",
            "ML with layered neural networks",
            "Image classifier, speech recognizer"
          ],
          [
            "Generative AI",
            "Models that synthesize new content",
            "LLM answer, generated image"
          ],
          [
            "LLM",
            "Generative language model over tokens",
            "Chat, summarization, code assistant"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Relationship between the terms",
        code: "flowchart TD\n  AI[Artificial Intelligence]\n  ML[Machine Learning]\n  DL[Deep Learning]\n  GenAI[Generative AI]\n  LLM[Large Language Models]\n  AI --> ML\n  ML --> DL\n  DL --> GenAI\n  GenAI --> LLM\n  AI --> Search[Search / Planning / Rules]",
        caption: "Not every AI system uses ML, and not every ML system is generative."
      },
      {
        kind: "pitfall",
        title: "Treating 'AI' as an architecture",
        text: "AI is not an architecture. Before designing anything, name the task: classification, regression, retrieval, ranking, extraction, generation, planning, or control.",
        detail: "The task type determines the data, evaluation, monitoring, and safety plan. A vague 'AI feature' usually becomes an expensive black box with no clear success criterion."
      },
      {
        kind: "bestPractice",
        title: "Start with the job-to-be-done",
        text: "Ask what decision or transformation the system must perform, what evidence it has, what a mistake costs, and whether the output must be deterministic, explainable, or auditable."
      }
    ],
    refs: [
      {
        book: "aima",
        chapter: "Ch. 1 — Introduction"
      },
      {
        book: "google-mlcc",
        chapter: "Introduction to ML"
      },
      {
        book: "hf-llm-course",
        chapter: "Understanding NLP and LLMs"
      }
    ],
    related: [
      "learning-paradigms",
      "tokenization-and-context",
      "choosing-ai-vs-code"
    ]
  },
  {
    id: "learning-paradigms",
    domainId: "foundations",
    title: "Supervised, Unsupervised & Reinforcement Learning",
    summary: "The major learning paradigms differ by feedback signal: supervised learning has labeled answers, unsupervised learning discovers structure, reinforcement learning learns from rewards, and self-supervised learning creates training targets from raw data itself.",
    keyPoints: [
      {
        text: "Supervised learning: examples come with targets",
        detail: "Use it when you can collect pairs like input → correct answer: document → category, features → price, transaction → fraudulent/not fraudulent."
      },
      {
        text: "Unsupervised learning: there is no target label",
        detail: "The model finds structure such as clusters, lower-dimensional projections, topics, or embeddings. The result needs interpretation; the algorithm does not know what is meaningful to humans."
      },
      {
        text: "Reinforcement learning: actions are judged by rewards over time",
        detail: "The system learns a policy by interacting with an environment. Delayed reward, exploration, simulation quality, and safety make RL much harder to deploy than supervised learning."
      },
      {
        text: "Self-supervised learning: labels are manufactured from the data",
        detail: "Predicting missing words, next tokens, image patches, or contrastive pairs turns huge unlabeled datasets into training material. Modern LLMs lean heavily on this."
      },
      {
        text: "Feedback signal determines the evaluation plan",
        detail: "Labeled classification has test metrics. Clustering may need downstream validation. RL needs environment evaluation. LLMs often need task-specific eval sets and human review."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Paradigms by feedback signal",
        headers: [
          "Paradigm",
          "Feedback",
          "Output",
          "Example"
        ],
        rows: [
          [
            "Supervised",
            "Known labels/targets",
            "Predictor",
            "Classify support ticket intent"
          ],
          [
            "Unsupervised",
            "No labels",
            "Structure",
            "Cluster customers by behavior"
          ],
          [
            "Self-supervised",
            "Targets derived from raw data",
            "Representation / generator",
            "Next-token pretraining"
          ],
          [
            "Reinforcement",
            "Reward from actions",
            "Policy",
            "Game-playing agent"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Using unsupervised results as if they were facts",
        text: "A clustering algorithm will produce clusters because you asked it to. That does not mean the clusters are stable, causal, ethical, or useful.",
        detail: "Unsupervised learning is excellent for exploration, compression, and representation learning. It is dangerous when directly converted into user-facing labels without validation."
      },
      {
        kind: "note",
        title: "Most production ML is less exotic than the headlines",
        text: "A huge amount of real business value still comes from supervised classification/regression, retrieval, ranking, anomaly detection, and simple decision support. RL and giant generative models are powerful, but they are not the default answer."
      },
      {
        kind: "bestPractice",
        title: "Choose the paradigm from the available feedback",
        text: "If you have labels, start supervised. If you have documents but no labels, consider embeddings or clustering. If the system takes actions and receives delayed reward, only then reach for reinforcement learning."
      }
    ],
    refs: [
      {
        book: "cs229",
        chapter: "Course description — supervised, unsupervised, reinforcement learning"
      },
      {
        book: "google-mlcc",
        chapter: "ML Concepts"
      },
      {
        book: "aima",
        chapter: "Learning"
      }
    ],
    related: [
      "data-splits",
      "clustering-and-dimensionality-reduction",
      "pretraining-finetuning-instruction-tuning"
    ]
  },
  {
    id: "data-splits",
    domainId: "foundations",
    title: "Training, Validation & Test Sets",
    summary: "A model learns from the training split, is tuned against the validation split, and is judged on a final held-out test split. The point is not to reward memorization, but to estimate future performance.",
    keyPoints: [
      {
        text: "Training data fits model parameters",
        detail: "The optimizer sees this data repeatedly. High performance here proves only that the model can fit what it has already seen."
      },
      {
        text: "Validation data guides choices",
        detail: "Features, model class, regularization, thresholds, prompts, retrieval settings, and hyperparameters are all chosen using validation evidence."
      },
      {
        text: "Test data is the final audit",
        detail: "Once you repeatedly check and react to test results, the test set becomes part of the design loop and stops being an honest estimate."
      },
      {
        text: "Splits must match production reality",
        detail: "Random row splits are often wrong for time-series, user histories, grouped records, duplicated documents, or entity-based data."
      },
      {
        text: "Cross-validation helps when data is limited",
        detail: "K-fold cross-validation gives a more stable estimate by training/evaluating across several folds, at the cost of more compute."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Split discipline",
        code: "flowchart LR\n  Raw[Raw dataset] --> Train[Training split]\n  Raw --> Val[Validation split]\n  Raw --> Test[Test split]\n  Train --> Fit[Fit parameters]\n  Val --> Tune[Tune model / prompt / threshold]\n  Test --> Audit[Final estimate]\n  Tune --> Audit",
        caption: "The test set validates the chosen process; it should not help choose it."
      },
      {
        kind: "table",
        caption: "Common splitting strategies",
        headers: [
          "Strategy",
          "Use when",
          "Avoids"
        ],
        rows: [
          [
            "Random row split",
            "IID examples with no grouping/time issues",
            "Basic train/test contamination"
          ],
          [
            "Time-based split",
            "Forecasting, event streams, historical prediction",
            "Training on the future"
          ],
          [
            "Group/user split",
            "Multiple rows per user/account/document",
            "Same entity in train and test"
          ],
          [
            "Stratified split",
            "Classification with class imbalance",
            "Missing rare classes in a split"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "The same entity appears in train and test",
        text: "If the same user, company, document, or product appears in both splits, the model may learn entity-specific quirks rather than general patterns.",
        detail: "This is especially common in recommendation, support, fraud, medical, and document datasets where many rows belong to the same real-world object."
      },
      {
        kind: "bestPractice",
        title: "Write down the prediction moment",
        text: "Before splitting data, define exactly when the prediction would be made in production and which information exists at that moment. Anything after that time is leakage."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Datasets, Generalization, and Overfitting"
      },
      {
        book: "sklearn-guide",
        chapter: "Model selection and evaluation"
      },
      {
        book: "isl-python",
        chapter: "Resampling Methods"
      }
    ],
    related: [
      "overfitting-generalization",
      "metrics-and-evaluation",
      "training-serving-skew"
    ]
  },
  {
    id: "loss-and-optimization",
    domainId: "foundations",
    title: "Loss Functions & Optimization",
    summary: "A loss function turns prediction mistakes into a number, and optimization changes model parameters to reduce that number. Training is the loop between model output, loss, gradient, and update.",
    keyPoints: [
      {
        text: "Loss is what the model actually optimizes",
        detail: "The product may care about revenue, safety, user trust, or time saved, but the optimizer only sees the mathematical loss you gave it."
      },
      {
        text: "Regression losses encode different tolerance for outliers",
        detail: "Squared error punishes large mistakes heavily; absolute error is more robust but less smooth; Huber-style losses split the difference."
      },
      {
        text: "Classification losses reward probability assigned to the correct class",
        detail: "Cross-entropy/log loss punishes confident wrong answers much more than uncertain wrong answers, which is exactly what you want when probabilities are used downstream."
      },
      {
        text: "Gradient descent follows local slope",
        detail: "The gradient points toward steepest increase in loss, so the optimizer moves the parameters in the opposite direction."
      },
      {
        text: "Learning rate controls step size",
        detail: "Too high and training diverges or bounces; too low and training crawls. Many deep-learning failures are boring learning-rate failures wearing fancy clothes."
      },
      {
        text: "Objective and reported metric can differ",
        detail: "You might train with cross-entropy because it is differentiable, then report F1, recall, calibration, cost-weighted error, or human preference scores."
      }
    ],
    blocks: [
      {
        kind: "code",
        title: "Training loop mental model",
        code: "parameters = initialize()\nfor batch in training_data:\n    predictions = model(batch.inputs, parameters)\n    loss = loss_fn(predictions, batch.targets)\n    gradients = derivative(loss, parameters)\n    parameters = parameters - learning_rate * gradients",
        caption: "Frameworks automate the derivative, not the choice of objective."
      },
      {
        kind: "table",
        caption: "Loss choice shapes behavior",
        headers: [
          "Problem",
          "Common loss",
          "What it encourages"
        ],
        rows: [
          [
            "Regression",
            "Mean squared error",
            "Avoid large numeric misses"
          ],
          [
            "Robust regression",
            "Mean absolute / Huber",
            "Reduce outlier dominance"
          ],
          [
            "Binary classification",
            "Binary cross-entropy",
            "Calibrated probability for positive class"
          ],
          [
            "Multi-class classification",
            "Softmax cross-entropy",
            "Probability mass on correct class"
          ],
          [
            "Ranking / retrieval",
            "Pairwise or contrastive losses",
            "Relevant items closer/higher than irrelevant ones"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Optimizing a proxy that users hate",
        text: "A recommender optimized only for clicks can learn clickbait. A support bot optimized for answer length can become verbose but wrong. A moderation model optimized for recall can over-remove legitimate content.",
        detail: "Loss design is product design in mathematical clothing. If the objective is misaligned, the optimizer will faithfully make the wrong thing better."
      },
      {
        kind: "bestPractice",
        title: "Pair optimization metrics with guardrails",
        text: "Pick one primary objective, then guard against unacceptable side effects: latency, cost, false positives, fairness slices, refusal behavior, and human complaint rate."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Linear Regression — loss and gradient descent"
      },
      {
        book: "cs229",
        chapter: "Supervised learning"
      },
      {
        book: "deep-learning-book",
        chapter: "Optimization for Training Deep Models"
      }
    ],
    related: [
      "metrics-and-evaluation",
      "backpropagation-and-optimizers",
      "model-selection-and-validation"
    ]
  },
  {
    id: "overfitting-generalization",
    domainId: "foundations",
    title: "Overfitting & Generalization",
    summary: "Overfitting happens when a model learns training-set quirks instead of reusable signal. Generalization is the real target: good behavior on future examples drawn from the problem.",
    keyPoints: [
      {
        text: "Training performance alone is not evidence of usefulness",
        detail: "A high-capacity model can memorize training examples, labels, document phrasing, or accidental shortcuts."
      },
      {
        text: "The train/validation gap is the classic signal",
        detail: "If training loss keeps improving while validation loss stalls or worsens, the model is learning patterns that do not transfer."
      },
      {
        text: "Underfitting is the opposite failure",
        detail: "When both training and validation performance are poor, the model may be too simple, undertrained, missing features, or trained with a bad objective."
      },
      {
        text: "Regularization limits effective capacity",
        detail: "Weight decay, dropout, smaller models, early stopping, pruning, and augmentation all make memorization less attractive."
      },
      {
        text: "More representative data is often the cleanest fix",
        detail: "Regularization helps, but nothing beats better coverage of the real cases the model must handle."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Learning curve diagnosis",
        headers: [
          "Train performance",
          "Validation performance",
          "Likely diagnosis",
          "What to try"
        ],
        rows: [
          [
            "Bad",
            "Bad",
            "Underfitting",
            "Better features, larger model, train longer"
          ],
          [
            "Good",
            "Bad",
            "Overfitting",
            "Regularize, add data, simplify"
          ],
          [
            "Good",
            "Good",
            "Promising",
            "Test once, then monitor production"
          ],
          [
            "Unstable",
            "Unstable",
            "Data/split/optimization issue",
            "Check labels, leakage, learning rate"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Memorization looks like intelligence on familiar examples",
        text: "A model can ace examples that share users, templates, documents, or time periods with training data. The illusion breaks when production distribution changes.",
        detail: "This is why split strategy and leakage checks matter as much as model choice."
      },
      {
        kind: "bestPractice",
        title: "Keep a small adversarial validation set",
        text: "Include edge cases, rare classes, messy inputs, and known failure modes. Average validation performance is not enough if the product fails on the exact cases users care about."
      },
      {
        kind: "note",
        title: "Overfitting is not only a model problem",
        text: "Prompts, retrieval settings, feature engineering, data cleaning rules, and threshold choices can all be overfit to validation examples too."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Datasets, Generalization, and Overfitting"
      },
      {
        book: "isl-python",
        chapter: "Statistical Learning"
      },
      {
        book: "deep-learning-book",
        chapter: "Regularization for Deep Learning"
      }
    ],
    related: [
      "data-splits",
      "regularization-for-deep-nets",
      "model-selection-and-validation"
    ]
  },
  {
    id: "metrics-and-evaluation",
    domainId: "foundations",
    title: "Metrics & Evaluation",
    summary: "Metrics convert model behavior into decision-making evidence. The right metric depends on the cost of mistakes, class imbalance, thresholds, slices, and the way the output is used.",
    keyPoints: [
      {
        text: "Accuracy is only safe when classes and mistake costs are balanced",
        detail: "If 99% of examples are negative, a model that always predicts negative is 99% accurate and useless for finding positives."
      },
      {
        text: "Precision answers: when the model says positive, how often is it right?",
        detail: "High precision matters when false positives are expensive: account bans, fraud investigations, escalations, alerts, or medical follow-ups."
      },
      {
        text: "Recall answers: of all real positives, how many did we catch?",
        detail: "High recall matters when missing a positive is expensive: safety incidents, urgent tickets, fraud, disease screening, or compliance violations."
      },
      {
        text: "Thresholds are product decisions",
        detail: "A probabilistic classifier becomes an action only after a threshold. Changing the threshold trades precision for recall without retraining the model."
      },
      {
        text: "Evaluate slices, not just aggregate score",
        detail: "A model can improve overall while getting worse for a language, geography, device type, customer segment, or protected group."
      },
      {
        text: "LLM evaluation is multi-dimensional",
        detail: "Format validity, factuality, grounding, helpfulness, refusal behavior, citation support, latency, and cost are separate checks."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Classification metric cheat sheet",
        headers: [
          "Metric",
          "Question it answers",
          "Watch out"
        ],
        rows: [
          [
            "Accuracy",
            "How often correct overall?",
            "Misleading on imbalance"
          ],
          [
            "Precision",
            "Can I trust positive predictions?",
            "Can hide missed positives"
          ],
          [
            "Recall",
            "Did we catch the positives?",
            "Can hide false alarms"
          ],
          [
            "F1",
            "Balance precision and recall?",
            "Assumes equal importance"
          ],
          [
            "PR-AUC",
            "Ranking quality for rare positives?",
            "Harder to explain"
          ],
          [
            "Calibration",
            "Do probabilities mean what they say?",
            "Different from accuracy"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Choosing the metric after seeing results",
        text: "If you pick whichever metric makes the model look best, evaluation becomes marketing. Decide the primary metric from the product risk before training.",
        detail: "This is especially tempting with LLM systems, where many subjective dimensions can be reweighted until the new version appears to win."
      },
      {
        kind: "bestPractice",
        title: "Use one primary metric and several guardrails",
        text: "For example: maximize recall for critical incidents, but require minimum precision, acceptable latency, stable fairness slices, and bounded review volume."
      },
      {
        kind: "note",
        title: "Offline metrics are not launch permission",
        text: "Offline evaluation is a filter. Production experiments and monitoring still decide whether the model improves the product under real usage."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Classification metrics"
      },
      {
        book: "sklearn-guide",
        chapter: "Metrics and scoring"
      },
      {
        book: "openai-docs",
        chapter: "Evaluation and production guidance"
      }
    ],
    related: [
      "loss-and-optimization",
      "llm-evaluation",
      "experimentation-and-rollouts"
    ]
  }
]
