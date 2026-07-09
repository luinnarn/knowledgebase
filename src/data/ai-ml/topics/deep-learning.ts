import type { Topic } from '../../../types/content'

export const topics: Topic[] = [
  {
    id: "neural-network-basics",
    domainId: "deep-learning",
    title: "Neural Network Basics",
    summary: "A neural network is a stack of parameterized transformations. Each layer converts one representation into another, and training adjusts the parameters so the final representation solves the task.",
    keyPoints: [
      {
        text: "A neuron computes weighted input plus nonlinearity",
        detail: "The weighted sum is linear; the activation function makes the network capable of learning nonlinear relationships. Without nonlinearities, many layers collapse into one linear model."
      },
      {
        text: "Hidden layers learn intermediate representations",
        detail: "A network does not merely memorize input-output pairs; it learns internal features that make the target easier to predict."
      },
      {
        text: "Depth and width increase capacity",
        detail: "More layers/units can represent more complex functions, but require more data, compute, regularization, and debugging discipline."
      },
      {
        text: "Neural nets are differentiable programs",
        detail: "They are built from operations whose gradients can be computed, allowing backpropagation to adjust parameters."
      },
      {
        text: "Architecture encodes assumptions",
        detail: "CNNs assume locality, RNNs assume sequential state, Transformers assume token-to-token attention, and MLPs assume much less structure."
      },
      {
        text: "The training data distribution is part of the model",
        detail: "A neural network's behavior is shaped as much by data coverage and labels as by architecture."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Feed-forward network",
        code: "flowchart LR\n  I[Input features] --> L1[Linear layer]\n  L1 --> A1[Activation]\n  A1 --> L2[Hidden layer]\n  L2 --> A2[Activation]\n  A2 --> O[Output layer]\n  O --> Loss[Loss]",
        caption: "Training updates the layer parameters so output loss decreases."
      },
      {
        kind: "code",
        title: "Minimal layer stack",
        code: "x = input\nx = linear_1(x)\nx = relu(x)\nx = linear_2(x)\nx = relu(x)\ny = output_layer(x)\nloss = loss_fn(y, target)",
        caption: "Real models add normalization, residuals, attention, convolutions, dropout, and batching, but the core pattern remains transformations plus loss."
      },
      {
        kind: "table",
        caption: "Core terms",
        headers: [
          "Term",
          "Meaning"
        ],
        rows: [
          [
            "Parameter",
            "Learned value, such as a weight or bias"
          ],
          [
            "Activation",
            "Nonlinear function between layers"
          ],
          [
            "Layer",
            "Parameterized transformation"
          ],
          [
            "Forward pass",
            "Compute prediction from input"
          ],
          [
            "Loss",
            "Numeric measure of mistake"
          ],
          [
            "Backward pass",
            "Compute gradients for parameters"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Bigger model as first fix",
        text: "If training is broken, a larger model often makes the mess more expensive. Check data, labels, loss, learning rate, preprocessing, and baseline performance first.",
        detail: "Capacity helps only after the pipeline is capable of learning the right thing."
      },
      {
        kind: "bestPractice",
        title: "Overfit a tiny batch first",
        text: "A neural network should be able to memorize a tiny dataset. If it cannot, the training loop, labels, loss, or optimizer is probably wrong."
      }
    ],
    refs: [
      {
        book: "deep-learning-book",
        chapter: "Deep Feedforward Networks"
      },
      {
        book: "d2l",
        chapter: "Multilayer Perceptrons"
      },
      {
        book: "google-mlcc",
        chapter: "Neural Networks"
      }
    ],
    related: [
      "backpropagation-and-optimizers",
      "regularization-for-deep-nets",
      "cnn-rnn-transformer-families"
    ]
  },
  {
    id: "backpropagation-and-optimizers",
    domainId: "deep-learning",
    title: "Backpropagation & Optimizers",
    summary: "Backpropagation computes how each parameter contributed to loss; optimizers use those gradients to update parameters. This is the engine that makes deep learning trainable.",
    keyPoints: [
      {
        text: "Backpropagation is the chain rule applied to a computation graph",
        detail: "The model records how outputs were computed from inputs and parameters, then propagates derivatives backward from the loss to every parameter."
      },
      {
        text: "Gradients point uphill, so optimizers step downhill",
        detail: "The gradient shows the direction of steepest loss increase. Gradient descent subtracts a scaled gradient to reduce loss."
      },
      {
        text: "Mini-batches trade accuracy for efficiency",
        detail: "A batch gradient estimates the full-data gradient. It is noisy, but fast enough to update frequently and often helps generalization."
      },
      {
        text: "Momentum smooths noisy updates",
        detail: "It accumulates a velocity so training keeps moving in consistent directions and dampens oscillation."
      },
      {
        text: "Adam is a strong practical default",
        detail: "It adapts learning rates per parameter using estimates of first and second moments of gradients. It is not magic, but it often works well quickly."
      },
      {
        text: "Learning-rate schedules matter",
        detail: "Warmup, decay, cosine schedules, and step schedules can make the difference between unstable training and convergence."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Forward and backward pass",
        code: "flowchart LR\n  X[Input] --> M[Model]\n  M --> Y[Prediction]\n  Y --> L[Loss]\n  L --> G[Backprop gradients]\n  G --> U[Optimizer update]\n  U --> M",
        caption: "Training is a repeated feedback loop, not a one-time fit."
      },
      {
        kind: "code",
        title: "Training step sketch",
        code: "pred = model(batch_x)\nloss = loss_fn(pred, batch_y)\nloss.backward()        # compute gradients\noptimizer.step()       # update parameters\noptimizer.zero_grad()  # clear old gradients",
        caption: "The API is small; the debugging surface is not."
      },
      {
        kind: "table",
        caption: "Optimizer intuition",
        headers: [
          "Optimizer",
          "Intuition",
          "Common use"
        ],
        rows: [
          [
            "SGD",
            "Step opposite gradient",
            "Simple baseline, often strong with schedules"
          ],
          [
            "Momentum",
            "SGD with velocity",
            "Smoother progress"
          ],
          [
            "Adam",
            "Adaptive per-parameter steps",
            "Default for many deep-learning tasks"
          ],
          [
            "AdamW",
            "Adam with decoupled weight decay",
            "Common for Transformers"
          ]
        ]
      },
      {
        kind: "pitfall",
        title: "Ignoring exploding or vanishing gradients",
        text: "If gradients become huge, training can diverge. If they shrink toward zero, early layers barely learn. Architecture, normalization, initialization, residuals, and clipping all help.",
        detail: "This is one reason modern architectures contain so many 'stabilizing' pieces beyond plain layers."
      },
      {
        kind: "bestPractice",
        title: "Watch loss and gradient norms early",
        text: "Before training for hours, confirm that loss decreases, gradients are finite, and a tiny batch can be overfit."
      }
    ],
    refs: [
      {
        book: "deep-learning-book",
        chapter: "Back-Propagation and Other Differentiation Algorithms; Optimization"
      },
      {
        book: "d2l",
        chapter: "Optimization Algorithms"
      },
      {
        book: "google-mlcc",
        chapter: "Gradient Descent"
      }
    ],
    related: [
      "loss-and-optimization",
      "neural-network-basics",
      "regularization-for-deep-nets"
    ]
  },
  {
    id: "regularization-for-deep-nets",
    domainId: "deep-learning",
    title: "Regularization for Deep Networks",
    summary: "Regularization reduces overfitting by making memorization harder or less attractive. In deep learning, the main tools are weight decay, dropout, data augmentation, early stopping, and capacity control.",
    keyPoints: [
      {
        text: "Weight decay discourages large weights",
        detail: "It adds a penalty for large parameter values, nudging the model toward smoother, simpler solutions."
      },
      {
        text: "Dropout prevents brittle co-adaptation",
        detail: "Randomly disabling activations during training forces the network not to rely too heavily on one exact path through the model."
      },
      {
        text: "Data augmentation encodes invariances",
        detail: "If the label should survive small crops, rotations, noise, paraphrases, or brightness changes, augmentation teaches that invariance directly."
      },
      {
        text: "Early stopping uses validation behavior",
        detail: "Stop when validation performance stops improving instead of training until the model minimizes training loss."
      },
      {
        text: "Smaller models regularize directly",
        detail: "Reducing depth, width, embedding size, or trainable parameters lowers the capacity to memorize."
      },
      {
        text: "Regularization follows diagnosis",
        detail: "If training performance is also bad, you are likely underfitting; adding regularization makes that worse."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Regularization toolkit",
        headers: [
          "Technique",
          "What it does",
          "Best when"
        ],
        rows: [
          [
            "Weight decay",
            "Penalizes large weights",
            "Model overfits smoothly"
          ],
          [
            "Dropout",
            "Randomly removes activations during training",
            "Dense networks over-rely on paths"
          ],
          [
            "Data augmentation",
            "Adds label-preserving variations",
            "Input has known invariances"
          ],
          [
            "Early stopping",
            "Stops before memorization dominates",
            "Validation curve turns upward"
          ],
          [
            "Smaller model",
            "Reduces capacity",
            "Model is too flexible for data"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Overfit signal",
        code: "flowchart TD\n  A[Train loss decreasing] --> B{Validation loss?}\n  B -->|also decreases| C[Keep training / monitor]\n  B -->|flat or rising| D[Overfitting likely]\n  D --> E[Regularize / add data / simplify]",
        caption: "Regularization is a response to a train-validation gap."
      },
      {
        kind: "pitfall",
        title: "Augmenting labels into nonsense",
        text: "Data augmentation must preserve the label. If a crop removes the object or a rotation turns a 6 into a 9, augmentation injects label noise instead of robustness.",
        detail: "Augmentation is a domain assumption. It should be treated as such, not as a generic performance spell."
      },
      {
        kind: "bestPractice",
        title: "Prefer data-quality fixes before clever regularization",
        text: "If labels are noisy, splits are leaky, or validation is not representative, dropout will not save the system."
      }
    ],
    refs: [
      {
        book: "deep-learning-book",
        chapter: "Regularization for Deep Learning"
      },
      {
        book: "d2l",
        chapter: "Regularization"
      },
      {
        book: "google-mlcc",
        chapter: "Overfitting"
      }
    ],
    related: [
      "overfitting-generalization",
      "backpropagation-and-optimizers",
      "model-selection-and-validation"
    ]
  },
  {
    id: "embeddings-and-representation-learning",
    domainId: "deep-learning",
    title: "Embeddings & Representation Learning",
    summary: "An embedding maps an item into a dense vector so useful relationships become geometric. Text, images, users, products, code, and documents can all be represented this way.",
    keyPoints: [
      {
        text: "Embeddings turn sparse symbols into dense vectors",
        detail: "A word ID, product ID, user ID, or document ID becomes a learned coordinate in a vector space."
      },
      {
        text: "The training objective defines similarity",
        detail: "Embeddings trained for search, recommendation, classification, clustering, and paraphrase detection organize the space differently."
      },
      {
        text: "Vector distance is not semantic truth",
        detail: "Cosine similarity means the embedding model placed vectors near each other according to its training objective. It does not prove relevance, accuracy, or safety."
      },
      {
        text: "Embeddings enable retrieval at scale",
        detail: "Nearest-neighbor search over vectors makes semantic search, RAG, recommendations, duplicate detection, and clustering practical."
      },
      {
        text: "Representation learning reduces manual feature work",
        detail: "Instead of hand-building every feature, the model learns useful intermediate representations from data."
      },
      {
        text: "Embedding systems need evaluation and governance",
        detail: "They can retrieve stale, biased, unauthorized, or low-quality content unless indexing, filtering, and monitoring are designed well."
      }
    ],
    blocks: [
      {
        kind: "diagram",
        title: "Embedding retrieval",
        code: "flowchart LR\n  Q[Query text] --> E1[Embedding model]\n  D[Documents] --> E2[Embedding model]\n  E2 --> I[Vector index]\n  E1 --> S[Nearest-neighbor search]\n  I --> S\n  S --> R[Top similar items]",
        caption: "The same model should usually embed queries and documents into the same space."
      },
      {
        kind: "code",
        title: "Semantic search shape",
        code: "query_vec = embed(query)\nids = vector_index.search(query_vec, k=20)\ncandidates = load_documents(ids)\nfiltered = apply_permissions_and_freshness(candidates)\nranked = rerank(query, filtered)",
        caption: "Vector search is one stage in a retrieval pipeline, not the whole product."
      },
      {
        kind: "pitfall",
        title: "Nearest means relevant",
        text: "The nearest vector can be off-topic, stale, unauthorized, too generic, or contradicted by a better source. Treat embedding similarity as evidence, not verdict.",
        detail: "This is why RAG systems need filters, reranking, citations, and retrieval evals."
      },
      {
        kind: "bestPractice",
        title: "Evaluate embeddings on your own queries",
        text: "Generic embedding benchmarks are useful, but retrieval success depends on your corpus, language, metadata, query style, and relevance definition."
      }
    ],
    refs: [
      {
        book: "google-mlcc",
        chapter: "Embeddings"
      },
      {
        book: "d2l",
        chapter: "Representation Learning"
      },
      {
        book: "openai-docs",
        chapter: "Embeddings"
      }
    ],
    related: [
      "retrieval-search-and-reranking",
      "retrieval-augmented-generation",
      "clustering-and-dimensionality-reduction"
    ]
  },
  {
    id: "cnn-rnn-transformer-families",
    domainId: "deep-learning",
    title: "CNNs, RNNs & Transformers",
    summary: "CNNs exploit local spatial patterns, RNNs process sequences through state, and Transformers use attention so tokens can interact directly. Each architecture family encodes a different assumption about the data.",
    keyPoints: [
      {
        text: "CNNs are built for locality and translation",
        detail: "A convolutional filter scans local neighborhoods and reuses the same weights across positions, which is ideal for images and grid-like signals."
      },
      {
        text: "RNNs process sequences step by step",
        detail: "They maintain hidden state across time, making them natural for sequential data but harder to parallelize and weaker at very long-range dependencies."
      },
      {
        text: "LSTMs and GRUs gate memory",
        detail: "Gates decide what to keep, forget, and expose, which helps sequence models preserve information over longer spans than vanilla RNNs."
      },
      {
        text: "Transformers use attention over tokens",
        detail: "They allow each token to mix information from other tokens directly and support parallel training, which made them scale extremely well."
      },
      {
        text: "Architecture choice is an inductive-bias choice",
        detail: "The right architecture makes the problem easier by baking in assumptions that match the data."
      },
      {
        text: "Transformers are not automatically best for everything",
        detail: "For small tabular data, simple classical models or tree ensembles often win in cost, stability, and interpretability."
      }
    ],
    blocks: [
      {
        kind: "table",
        caption: "Architecture-family cheat sheet",
        headers: [
          "Family",
          "Assumption",
          "Typical use"
        ],
        rows: [
          [
            "CNN",
            "Nearby values form local patterns",
            "Images, spectrograms, grids"
          ],
          [
            "RNN/LSTM/GRU",
            "Order matters and state evolves",
            "Sequences, time series, older NLP"
          ],
          [
            "Transformer",
            "Tokens need flexible pairwise interaction",
            "LLMs, modern NLP, multimodal models"
          ],
          [
            "MLP",
            "No special structure assumed",
            "Dense features, simple baselines"
          ]
        ]
      },
      {
        kind: "diagram",
        title: "Different ways to use structure",
        code: "flowchart TD\n  Data[Input data shape]\n  Data --> Local[Local spatial structure]\n  Data --> Seq[Sequential state]\n  Data --> Tokens[Token interactions]\n  Local --> CNN[CNN]\n  Seq --> RNN[RNN / LSTM / GRU]\n  Tokens --> Transformer[Transformer]\n",
        caption: "Architecture is how the model exploits known structure in the input."
      },
      {
        kind: "pitfall",
        title: "Architecture by hype cycle",
        text: "Transformers dominate modern language modeling, but that does not make them the right first choice for every small dataset, tabular feature set, or deterministic workflow.",
        detail: "The boring question still wins: what structure does the input have, how much data exists, and what constraints must the system meet?"
      },
      {
        kind: "bestPractice",
        title: "Match model family to data shape",
        text: "Use tree ensembles or linear models for tabular baselines, CNNs for spatial locality, Transformers for token interactions, and specialized architectures only when the assumptions fit."
      }
    ],
    refs: [
      {
        book: "deep-learning-book",
        chapter: "Convolutional Networks; Sequence Modeling"
      },
      {
        book: "d2l",
        chapter: "CNNs; RNNs; Attention"
      },
      {
        book: "paper-transformers",
        chapter: "Transformer architecture"
      }
    ],
    related: [
      "transformer-architecture",
      "neural-network-basics",
      "embeddings-and-representation-learning"
    ]
  }
]
