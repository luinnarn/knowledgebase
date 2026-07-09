import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "linear-and-logistic-regression",
    domainId: "classical-ml",
    title: "Linear & Logistic Regression",
    summary: "Linear regression predicts a numeric value by fitting a weighted sum of features; logistic regression predicts class probability by passing a weighted sum through a sigmoid or softmax. They are boring in the best way: fast, interpretable, and excellent baselines.",
    keyPoints: [
      {
        text: "Linear regression models a continuous target as a weighted sum",
        detail: "The model assumes the target can be approximated by adding feature contributions. That assumption is simple, but the model is often strong when features already capture the important structure."
      },
      {
        text: "Logistic regression is a classifier despite the name",
        detail: "It models the log-odds of a class and outputs probabilities. A threshold then turns probability into an action or label."
      },
      {
        text: "Coefficients are useful but easy to misread",
        detail: "Feature scaling, correlated variables, interaction terms, and encoding choices all affect coefficient size. A large coefficient is not automatically a causal explanation."
      },
      {
        text: "Regularization turns simple linear models into practical tools",
        detail: "L2/Ridge shrinks weights smoothly; L1/Lasso can drive some weights to zero; elastic net mixes both. Regularization is often the difference between a fragile linear model and a useful one."
      },
      {
        text: "Linear models are calibration-friendly baselines",
        detail: "For classification, logistic regression often produces useful probabilities, not just labels. That matters when downstream systems choose different thresholds for different costs."
      },
      {
        text: "Use them before heavier models",
        detail: "A complex model that only barely beats a linear baseline is making a trade-off. It may still be worth it, but the baseline makes the trade visible."
      }
    ],
    blocks: [
      {
        kind: "paragraph",
        text: "Linear/logistic regression should usually be the first thing you try on tabular data. Not because they are always best, but because they expose whether the signal is simple, whether features are sane, and whether the extra complexity of tree ensembles or neural networks is actually buying anything."
      },
      {
        kind: "table",
        caption: "Linear vs logistic regression",
        headers: [
          "Model",
          "Target",
          "Output",
          "Typical loss"
        ],
        rows: [
          [
            "Linear regression",
            "Continuous number",
            "Numeric prediction",
            "Mean squared error / absolute error"
          ],
          [
            "Logistic regression",
            "Class label",
            "Class probability",
            "Cross-entropy / log loss"
          ]
        ]
      },
      {
        kind: "code",
        title: "Baseline classifier with validation",
        code: "from sklearn.compose import ColumnTransformer\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\nfrom sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import OneHotEncoder, StandardScaler\n\npreprocess = ColumnTransformer([\n    (\"num\", StandardScaler(), numeric_columns),\n    (\"cat\", OneHotEncoder(handle_unknown=\"ignore\"), categorical_columns),\n])\n\nmodel = Pipeline([\n    (\"prep\", preprocess),\n    (\"clf\", LogisticRegression(max_iter=1000, class_weight=\"balanced\")),\n])\n\nscores = cross_val_score(model, X, y, cv=5, scoring=\"f1\")\nprint(scores.mean())",
        caption: "Keep preprocessing inside the pipeline so validation measures the real training path."
      },
      {
        kind: "pitfall",
        title: "Coefficient interpretation without preprocessing context",
        text: "If one feature is measured in cents and another in years, coefficient magnitudes are not directly comparable. Scaling, encoding, and collinearity decide what a coefficient means.",
        detail: "This is the classic 'interpretable model' trap: the model class is simple, but the feature pipeline can still make interpretation misleading."
      },
      {
        kind: "bestPractice",
        title: "Keep the linear baseline in the report",
        text: "When a random forest, boosted tree, or neural net wins, show how much it beats the linear/logistic baseline and what complexity it adds: latency, explainability, deployment size, tuning burden, and monitoring risk."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Linear Regression; Logistic Regression"
      },
      {
        book: "isl-python",
        chapter: "Linear Regression; Classification"
      },
      {
        book: "sklearn-guide",
        chapter: "Linear Models"
      }
    ],
    related: [
      "feature-engineering",
      "model-selection-and-validation",
      "metrics-and-evaluation"
    ]
  },
  {
    id: "trees-forests-boosting",
    domainId: "classical-ml",
    title: "Decision Trees, Random Forests & Gradient Boosting",
    summary: "Tree models learn decision rules by splitting feature space. A single tree is readable but unstable; random forests reduce variance by averaging many trees; gradient boosting builds trees sequentially to fix the current ensemble's errors.",
    keyPoints: [
      {
        text: "A decision tree is nested if/else logic learned from data",
        detail: "Each split chooses a feature and threshold/category that improves a purity or loss criterion. The resulting path from root to leaf is easy to inspect."
      },
      {
        text: "Single trees overfit easily",
        detail: "A deep tree can create tiny leaves that memorize accidental patterns. Depth, minimum leaf size, pruning, and validation are essential."
      },
      {
        text: "Random forests average many noisy trees",
        detail: "Each tree is trained on a bootstrapped sample and random feature subsets. The individual trees overfit differently, so averaging reduces variance."
      },
      {
        text: "Gradient boosting learns corrections",
        detail: "Boosting adds weak learners one by one, each focusing on residual errors from the current model. This often gives excellent tabular performance."
      },
      {
        text: "Tree ensembles handle nonlinearity and interactions well",
        detail: "They naturally capture threshold effects and feature interactions without requiring you to manually create every interaction term."
      },
      {
        text: "Interpretability decreases as performance rises",
        detail: "A shallow tree can be read directly. A large boosted ensemble needs feature importance, partial dependence, SHAP-style explanations, or example-based debugging."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Tree-family trade-offs",
        headers: [
          "Model",
          "Main strength",
          "Main weakness",
          "Good default?"
        ],
        rows: [
          [
            "Decision tree",
            "Readable rules",
            "High variance / overfits",
            "For explanation, not usually accuracy"
          ],
          [
            "Random forest",
            "Robust with little tuning",
            "Larger and less interpretable",
            "Yes"
          ],
          [
            "Gradient boosting",
            "Excellent tabular accuracy",
            "Tuning-sensitive",
            "Yes, with validation"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "From one tree to ensembles",
        code: "flowchart LR\n  A[Single decision tree] --> B[High variance]\n  B --> C[Random forest: average many decorrelated trees]\n  B --> D[Gradient boosting: add trees that fix errors]\n  C --> E[Stable general-purpose model]\n  D --> F[Strong tabular model]",
        caption: "Forests fight variance by averaging; boosting fights bias/residual error by sequencing."
      },
      {
        kind: "code",
        title: "Tree ensemble baseline",
        code: "from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier\nfrom sklearn.model_selection import cross_validate\n\nmodels = {\n    \"forest\": RandomForestClassifier(n_estimators=300, min_samples_leaf=5),\n    \"boosting\": HistGradientBoostingClassifier(max_leaf_nodes=31, learning_rate=0.05),\n}\n\nfor name, model in models.items():\n    result = cross_validate(model, X, y, cv=5, scoring=[\"f1\", \"roc_auc\"])\n    print(name, result[\"test_f1\"].mean(), result[\"test_roc_auc\"].mean())",
        caption: "Compare ensembles against a simple baseline and each other; don't pick by vibes."
      },
      {
        kind: "pitfall",
        title: "Feature importance as causal explanation",
        text: "Tree feature importance can tell you which features helped prediction, but not that changing the feature would change the outcome. Correlated features and proxy variables can distort the story.",
        detail: "This matters in product decisions: 'the model uses this feature' is not the same as 'this feature causes the behavior'."
      },
      {
        kind: "bestPractice",
        title: "Constrain leaves before trusting metrics",
        text: "Set max depth, minimum samples per leaf, or similar constraints. A tree that creates leaves with one or two examples is probably memorizing."
      }
    ],
    refs: [
      {
        book: "isl-python",
        chapter: "Tree-Based Methods"
      },
      {
        book: "sklearn-guide",
        chapter: "Decision Trees; Ensemble Methods"
      },
      {
        book: "google-mlcc",
        chapter: "Decision Forests"
      }
    ],
    related: [
      "feature-engineering",
      "model-selection-and-validation",
      "interpretability-and-explainability"
    ]
  },
  {
    id: "clustering-and-dimensionality-reduction",
    domainId: "classical-ml",
    title: "Clustering & Dimensionality Reduction",
    summary: "Clustering groups examples by similarity; dimensionality reduction compresses many features into fewer coordinates. Both are powerful for exploration and representation, but neither gives truth by itself.",
    keyPoints: [
      {
        text: "K-means finds compact clusters around centroids",
        detail: "It is fast and useful when clusters are roughly spherical in the chosen feature space, but it requires choosing k and is sensitive to scale and initialization."
      },
      {
        text: "Hierarchical clustering shows nested structure",
        detail: "It can reveal groupings at several levels of granularity, but it is typically more expensive and harder to scale."
      },
      {
        text: "PCA finds directions of maximum variance",
        detail: "It is a linear projection that preserves variance, not semantic meaning. High-variance directions can be noise, and low-variance directions can matter."
      },
      {
        text: "t-SNE/UMAP-style projections are visualization tools, not proof",
        detail: "They can reveal useful neighborhood structure, but distances and cluster shapes in 2D plots are easy to over-interpret."
      },
      {
        text: "Embedding models are learned dimensionality reduction",
        detail: "They compress text, images, users, or items into vectors where task-relevant similarity becomes geometric."
      },
      {
        text: "Unsupervised outputs need external validation",
        detail: "Validate with labels if available, downstream task performance, domain review, stability checks, or user/business outcomes."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "What each method is for",
        headers: [
          "Method",
          "Best use",
          "Watch out"
        ],
        rows: [
          [
            "K-means",
            "Fast grouping around centroids",
            "Must choose k; scale-sensitive"
          ],
          [
            "Hierarchical clustering",
            "Exploring nested group structure",
            "Expensive at scale"
          ],
          [
            "PCA",
            "Linear compression / noise reduction",
            "Variance is not meaning"
          ],
          [
            "t-SNE / UMAP",
            "Visualization",
            "2D shapes are easy to overread"
          ],
          [
            "Embeddings",
            "Semantic retrieval / recommendation",
            "Similarity depends on training objective"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Unsupervised workflow",
        code: "flowchart LR\n  A[Raw features] --> B[Scale / clean]\n  B --> C[Cluster or reduce dimensions]\n  C --> D[Inspect patterns]\n  D --> E[Validate externally]\n  E --> F[Use cautiously downstream]",
        caption: "The algorithm proposes structure; validation decides whether the structure matters."
      },
      {
        kind: "pitfall",
        title: "Clusters are not customer segments by default",
        text: "A clustering algorithm optimizes a mathematical objective over your feature space. It does not know whether the result is stable, actionable, ethical, or meaningful.",
        detail: "This is how teams end up naming arbitrary clusters and building product strategy on statistical lint."
      },
      {
        kind: "bestPractice",
        title: "Check stability",
        text: "Rerun clustering with different seeds, samples, time windows, and feature sets. If the clusters collapse or rename themselves every time, do not productize them."
      },
      {
        kind: "note",
        title: "Scale changes geometry",
        text: "Distance-based methods care deeply about feature scale. A salary feature ranging 0–200000 will dominate an age feature ranging 0–100 unless you scale intentionally."
      }
    ],
    refs: [
      {
        book: "cs229",
        chapter: "Unsupervised learning"
      },
      {
        book: "isl-python",
        chapter: "Unsupervised Learning"
      },
      {
        book: "sklearn-guide",
        chapter: "Clustering; Decomposition"
      }
    ],
    related: [
      "learning-paradigms",
      "embeddings-and-representation-learning",
      "retrieval-search-and-reranking"
    ]
  },
  {
    id: "feature-engineering",
    domainId: "classical-ml",
    title: "Feature Engineering",
    summary: "Feature engineering turns raw data into model-usable signal. In classical ML, better features often beat fancier algorithms; in deep learning, learned representations reduce but do not eliminate feature thinking.",
    keyPoints: [
      {
        text: "Features define what the model can notice",
        detail: "A model cannot use information that is missing, delayed, incorrectly encoded, or thrown away during preprocessing."
      },
      {
        text: "Categorical variables need deliberate encoding",
        detail: "One-hot encoding, ordinal encoding, target encoding, hashing, and embeddings each make different assumptions and carry different leakage risks."
      },
      {
        text: "Aggregates are often high-value features",
        detail: "Counts, rates, rolling windows, recency, frequency, and ratios often express behavior better than raw events."
      },
      {
        text: "Time awareness prevents leakage",
        detail: "A feature must be computed only from information available at prediction time. Otherwise validation becomes a time-travel fantasy."
      },
      {
        text: "Pipelines protect train/serve consistency",
        detail: "Preprocessing should be part of the fitted pipeline, not a notebook side quest manually repeated in production."
      },
      {
        text: "Feature quality is often product knowledge",
        detail: "The best features usually come from understanding the domain: what behavior matters, what is known when, and what signals are proxies for the target."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Feature engineering moves",
        headers: [
          "Move",
          "Example",
          "Risk"
        ],
        rows: [
          [
            "Scaling",
            "Standardize numeric inputs",
            "Fitting scaler on all data leaks validation/test"
          ],
          [
            "Encoding",
            "One-hot country or product tier",
            "High-cardinality explosion"
          ],
          [
            "Rolling aggregate",
            "purchases_last_30_days",
            "Future leakage"
          ],
          [
            "Ratio",
            "price_per_square_meter",
            "Divide-by-zero / noisy denominator"
          ],
          [
            "Text feature",
            "TF-IDF or embedding",
            "Vocabulary drift / privacy"
          ],
          [
            "Interaction",
            "plan_type × region",
            "Overfitting rare combinations"
          ]
        ]
      },
      {
        kind: "code",
        title: "Keep preprocessing inside the validation path",
        code: "from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler, OneHotEncoder\nfrom sklearn.compose import ColumnTransformer\nfrom sklearn.linear_model import LogisticRegression\n\npreprocess = ColumnTransformer([\n    (\"num\", StandardScaler(), numeric_cols),\n    (\"cat\", OneHotEncoder(handle_unknown=\"ignore\"), categorical_cols),\n])\n\npipeline = Pipeline([\n    (\"features\", preprocess),\n    (\"model\", LogisticRegression(max_iter=1000)),\n])\n\n# cross_val_score fits preprocessing separately inside each fold.\nscores = cross_val_score(pipeline, X, y, cv=5)",
        caption: "This avoids fitting preprocessing on validation/test data by accident."
      },
      {
        kind: "pitfall",
        title: "Leaky historical aggregates",
        text: "`user_total_spend` is only valid if computed up to the prediction moment. If it includes future purchases, the model learns the answer from tomorrow.",
        detail: "Leakage is not always obvious; it often hides inside ETL jobs, reporting tables, late-arriving labels, or convenience fields."
      },
      {
        kind: "bestPractice",
        title: "Write feature definitions as temporal contracts",
        text: "For every feature, document: what entity it belongs to, how it is computed, what time window it uses, and whether it is available before prediction."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Working with numerical and categorical data"
      },
      {
        book: "sklearn-guide",
        chapter: "Preprocessing data"
      },
      {
        book: "rules-of-ml",
        chapter: "Feature engineering guidance"
      }
    ],
    related: [
      "data-splits",
      "training-serving-skew",
      "linear-and-logistic-regression"
    ]
  },
  {
    id: "model-selection-and-validation",
    domainId: "classical-ml",
    title: "Model Selection & Validation",
    summary: "Model selection chooses the model family, features, hyperparameters, and threshold using validation evidence. Validation is where you compare ideas without lying to yourself.",
    keyPoints: [
      {
        text: "Validation is part of the design loop",
        detail: "Every feature choice, hyperparameter search, model swap, threshold move, and prompt change learns from validation results."
      },
      {
        text: "Cross-validation reduces split luck",
        detail: "K-fold validation trains/evaluates multiple times, giving a more stable estimate when a single split could be lucky or unlucky."
      },
      {
        text: "Hyperparameter tuning can overfit validation",
        detail: "Trying hundreds of configurations increases the chance that the winner is tuned to validation quirks rather than true signal."
      },
      {
        text: "Threshold tuning is model selection too",
        detail: "For classifiers, the threshold determines the operational trade-off between false positives and false negatives."
      },
      {
        text: "Baselines prevent complexity theater",
        detail: "A new model should beat simple baselines by enough to justify added complexity, not merely by enough to win a spreadsheet cell."
      },
      {
        text: "The final test set should be boring",
        detail: "If the final test result surprises you wildly, either validation was not representative or the process overfit validation."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Honest model-selection loop",
        code: "flowchart LR\n  A[Candidate features/models] --> B[Train on train split]\n  B --> C[Score on validation]\n  C --> D[Choose model + threshold]\n  D --> E[Lock choice]\n  E --> F[Test once]\n  F --> G[Production experiment]",
        caption: "Do not use the test set to keep shopping."
      },
      {
        kind: "table",
        caption: "Validation tools",
        headers: [
          "Tool",
          "Use when",
          "Cost"
        ],
        rows: [
          [
            "Holdout validation",
            "Enough data, quick iteration",
            "One split can be lucky"
          ],
          [
            "K-fold cross-validation",
            "Limited data / stable estimate",
            "More training runs"
          ],
          [
            "Time-series validation",
            "Historical prediction",
            "Less randomization"
          ],
          [
            "Nested validation",
            "Heavy tuning / honest comparison",
            "Much more compute"
          ],
          [
            "Final test set",
            "One-time audit",
            "Must be protected"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Leaderboard-driven development",
        text: "If you keep trying ideas until one wins on the same validation set, the validation set slowly becomes training data for your decisions.",
        detail: "This is true for classical ML, deep learning, LLM prompts, RAG settings, and agent workflows."
      },
      {
        kind: "bestPractice",
        title: "Report delta over baseline",
        text: "Show absolute metric, baseline metric, confidence/variance when available, and operational cost. A tiny gain may not be worth a much harder system."
      }
    ],
    refs: [
      {
        book: "sklearn-guide",
        chapter: "Model selection and evaluation"
      },
      {
        book: "isl-python",
        chapter: "Resampling Methods"
      },
      {
        book: "google-mlcc",
        chapter: "Generalization"
      }
    ],
    related: [
      "metrics-and-evaluation",
      "experimentation-and-rollouts",
      "linear-and-logistic-regression"
    ]
  }
]
