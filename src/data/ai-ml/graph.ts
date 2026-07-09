import type { GraphNode, GraphEdge } from '../../types/content'
import { domains } from './domains'

type TopicNodeSpec = [id: string, label: string, importance: 1 | 2 | 3]

const topicNodeSpecs: Record<string, TopicNodeSpec[]> = {
  'foundations': [
    [
      'ai-ml-landscape', 
      'AI vs ML vs Deep Learning vs Generative AI', 
      3
    ],
    [
      'learning-paradigms',
      'Supervised, Unsupervised & Reinforcement Learning',
      3
    ],
    [
      'data-splits',
      'Training, Validation & Test Sets',
      3
    ],
    [
      'loss-and-optimization',
      'Loss Functions & Optimization',
      3
    ],
    [
      'overfitting-generalization',
      'Overfitting & Generalization',
      3
    ],
    [
      'metrics-and-evaluation',
      'Metrics & Evaluation',
      3
    ]
  ],
  'classical-ml': [
    [
      'linear-and-logistic-regression',
      'Linear & Logistic Regression',
      3
    ],
    [
      'trees-forests-boosting',
      'Decision Trees, Random Forests & Gradient Boosting',
      3
    ],
    [
      'clustering-and-dimensionality-reduction',
      'Clustering & Dimensionality Reduction',
      2
    ],
    [
      'feature-engineering',
      'Feature Engineering',
      3
    ],
    [
      'model-selection-and-validation',
      'Model Selection & Validation',
      3
    ]
  ],
  'deep-learning': [
    [
      'neural-network-basics',
      'Neural Network Basics',
      3
    ],
    [
      'backpropagation-and-optimizers',
      'Backpropagation & Optimizers',
      3
    ],
    [
      'regularization-for-deep-nets',
      'Regularization for Deep Networks',
      2
    ],
    [
      'embeddings-and-representation-learning',
      'Embeddings & Representation Learning',
      3
    ],
    [
      'cnn-rnn-transformer-families',
      'CNNs, RNNs & Transformers',
      3
    ]
  ],
  'llms-generative-ai': [
    [
      'tokenization-and-context',
      'Tokenization & Context Windows',
      3
    ],
    [
      'transformer-architecture',
      'Transformer Architecture',
      3
    ],
    [
      'pretraining-finetuning-instruction-tuning',
      'Pretraining, Fine-Tuning & Instruction Tuning',
      3
    ],
    [
      'prompting-and-decoding',
      'Prompting & Decoding',
      3
    ],
    [
      'retrieval-augmented-generation',
      'Retrieval-Augmented Generation (RAG)',
      3
    ],
    [
      'tool-calling-and-agents',
      'Tool Calling & Agents',
      3
    ]
  ],
  'applied-ai-engineering': [
    [
      'choosing-ai-vs-code',
      'When to Use AI vs Normal Code',
      3
    ],
    [
      'structured-outputs-and-validation',
      'Structured Outputs & Validation',
      3
    ],
    [
      'retrieval-search-and-reranking',
      'Retrieval, Search & Reranking',
      3
    ],
    [
      'llm-evaluation',
      'LLM Evaluation',
      3
    ],
    [
      'cost-latency-and-reliability',
      'Cost, Latency & Reliability',
      3
    ]
  ],
  'production-ml': [
    [
      'ml-lifecycle',
      'ML System Lifecycle',
      3
    ],
    [
      'training-serving-skew',
      'Training-Serving Skew',
      3
    ],
    [
      'model-serving-and-inference',
      'Model Serving & Inference',
      3
    ],
    [
      'monitoring-and-drift',
      'Monitoring & Drift',
      3
    ],
    [
      'experimentation-and-rollouts',
      'Experimentation & Rollouts',
      3
    ]
  ],
  'responsible-ai': [
    [
      'fairness-and-bias',
      'Fairness & Bias',
      3
    ],
    [
      'privacy-and-data-governance',
      'Privacy & Data Governance',
      3
    ],
    [
      'interpretability-and-explainability',
      'Interpretability & Explainability',
      2
    ],
    [
      'prompt-injection-and-ai-security',
      'Prompt Injection & AI Security',
      3
    ],
    [
      'human-review-and-release-checklists',
      'Human Review & Release Checklists',
      3
    ]
  ]
}

const hubId = (domainId: string) => `d-${domainId}`

const hubNodes: GraphNode[] = domains.map((d) => ({
  id: hubId(d.id),
  label: d.title,
  domainId: d.id,
  importance: 3,
  kind: 'domain',
}))

const topicNodes: GraphNode[] = Object.entries(topicNodeSpecs).flatMap(([domainId, specs]) =>
  specs.map(([id, label, importance]) => ({ id, label, domainId, importance, kind: 'topic' as const })),
)

export const graphNodes: GraphNode[] = [...hubNodes, ...topicNodes]

const partOfEdges: GraphEdge[] = topicNodes.map((n) => ({
  source: n.id,
  target: hubId(n.domainId),
  type: 'part-of',
}))

/** [source, target] — source should be learned before target. */
const prerequisites: Array<[string, string]> = [
  [
    'ai-ml-landscape',
    'learning-paradigms'
  ],
  [
    'learning-paradigms',
    'data-splits'
  ],
  [
    'data-splits',
    'overfitting-generalization'
  ],
  [
    'loss-and-optimization',
    'backpropagation-and-optimizers'
  ],
  [
    'overfitting-generalization',
    'metrics-and-evaluation'
  ],
  [
    'metrics-and-evaluation',
    'model-selection-and-validation'
  ],
  [
    'linear-and-logistic-regression',
    'trees-forests-boosting'
  ],
  [
    'feature-engineering',
    'model-selection-and-validation'
  ],
  [
    'neural-network-basics',
    'backpropagation-and-optimizers'
  ],
  [
    'backpropagation-and-optimizers',
    'regularization-for-deep-nets'
  ],
  [
    'neural-network-basics',
    'embeddings-and-representation-learning'
  ],
  [
    'cnn-rnn-transformer-families',
    'transformer-architecture'
  ],
  [
    'tokenization-and-context',
    'transformer-architecture'
  ],
  [
    'transformer-architecture',
    'pretraining-finetuning-instruction-tuning'
  ],
  [
    'pretraining-finetuning-instruction-tuning',
    'prompting-and-decoding'
  ],
  [
    'embeddings-and-representation-learning',
    'retrieval-augmented-generation'
  ],
  [
    'retrieval-augmented-generation',
    'tool-calling-and-agents'
  ],
  [
    'prompting-and-decoding',
    'structured-outputs-and-validation'
  ],
  [
    'retrieval-augmented-generation',
    'retrieval-search-and-reranking'
  ],
  [
    'structured-outputs-and-validation',
    'llm-evaluation'
  ],
  [
    'llm-evaluation',
    'cost-latency-and-reliability'
  ],
  [
    'ml-lifecycle',
    'training-serving-skew'
  ],
  [
    'training-serving-skew',
    'model-serving-and-inference'
  ],
  [
    'model-serving-and-inference',
    'monitoring-and-drift'
  ],
  [
    'monitoring-and-drift',
    'experimentation-and-rollouts'
  ],
  [
    'fairness-and-bias',
    'human-review-and-release-checklists'
  ],
  [
    'privacy-and-data-governance',
    'prompt-injection-and-ai-security'
  ]
]

/** Cross-domain and intra-domain conceptual links. */
const related: Array<[string, string]> = [
  [
    'ai-ml-landscape',
    'tokenization-and-context'
  ],
  [
    'ai-ml-landscape',
    'choosing-ai-vs-code'
  ],
  [
    'learning-paradigms',
    'clustering-and-dimensionality-reduction'
  ],
  [
    'learning-paradigms',
    'pretraining-finetuning-instruction-tuning'
  ],
  [
    'data-splits',
    'metrics-and-evaluation'
  ],
  [
    'data-splits',
    'training-serving-skew'
  ],
  [
    'loss-and-optimization',
    'metrics-and-evaluation'
  ],
  [
    'loss-and-optimization',
    'model-selection-and-validation'
  ],
  [
    'overfitting-generalization',
    'regularization-for-deep-nets'
  ],
  [
    'overfitting-generalization',
    'model-selection-and-validation'
  ],
  [
    'metrics-and-evaluation',
    'llm-evaluation'
  ],
  [
    'metrics-and-evaluation',
    'experimentation-and-rollouts'
  ],
  [
    'linear-and-logistic-regression',
    'feature-engineering'
  ],
  [
    'linear-and-logistic-regression',
    'model-selection-and-validation'
  ],
  [
    'linear-and-logistic-regression',
    'metrics-and-evaluation'
  ],
  [
    'trees-forests-boosting',
    'feature-engineering'
  ],
  [
    'trees-forests-boosting',
    'model-selection-and-validation'
  ],
  [
    'trees-forests-boosting',
    'interpretability-and-explainability'
  ],
  [
    'clustering-and-dimensionality-reduction',
    'embeddings-and-representation-learning'
  ],
  [
    'clustering-and-dimensionality-reduction',
    'retrieval-search-and-reranking'
  ],
  [
    'feature-engineering',
    'data-splits'
  ],
  [
    'feature-engineering',
    'training-serving-skew'
  ],
  [
    'model-selection-and-validation',
    'experimentation-and-rollouts'
  ],
  [
    'neural-network-basics',
    'regularization-for-deep-nets'
  ],
  [
    'neural-network-basics',
    'cnn-rnn-transformer-families'
  ],
  [
    'regularization-for-deep-nets',
    'model-selection-and-validation'
  ],
  [
    'embeddings-and-representation-learning',
    'retrieval-search-and-reranking'
  ],
  [
    'cnn-rnn-transformer-families',
    'embeddings-and-representation-learning'
  ],
  [
    'tokenization-and-context',
    'prompting-and-decoding'
  ],
  [
    'tokenization-and-context',
    'retrieval-augmented-generation'
  ],
  [
    'tokenization-and-context',
    'cost-latency-and-reliability'
  ],
  [
    'pretraining-finetuning-instruction-tuning',
    'retrieval-augmented-generation'
  ],
  [
    'pretraining-finetuning-instruction-tuning',
    'llm-evaluation'
  ],
  [
    'prompting-and-decoding',
    'llm-evaluation'
  ],
  [
    'retrieval-augmented-generation',
    'llm-evaluation'
  ],
  [
    'tool-calling-and-agents',
    'structured-outputs-and-validation'
  ],
  [
    'tool-calling-and-agents',
    'prompt-injection-and-ai-security'
  ],
  [
    'tool-calling-and-agents',
    'llm-evaluation'
  ],
  [
    'choosing-ai-vs-code',
    'structured-outputs-and-validation'
  ],
  [
    'choosing-ai-vs-code',
    'cost-latency-and-reliability'
  ],
  [
    'choosing-ai-vs-code',
    'human-review-and-release-checklists'
  ],
  [
    'structured-outputs-and-validation',
    'prompt-injection-and-ai-security'
  ],
  [
    'retrieval-search-and-reranking',
    'llm-evaluation'
  ],
  [
    'cost-latency-and-reliability',
    'monitoring-and-drift'
  ],
  [
    'ml-lifecycle',
    'model-serving-and-inference'
  ],
  [
    'ml-lifecycle',
    'monitoring-and-drift'
  ],
  [
    'ml-lifecycle',
    'experimentation-and-rollouts'
  ],
  [
    'training-serving-skew',
    'monitoring-and-drift'
  ],
  [
    'model-serving-and-inference',
    'cost-latency-and-reliability'
  ],
  [
    'model-serving-and-inference',
    'experimentation-and-rollouts'
  ],
  [
    'experimentation-and-rollouts',
    'llm-evaluation'
  ],
  [
    'fairness-and-bias',
    'metrics-and-evaluation'
  ],
  [
    'fairness-and-bias',
    'privacy-and-data-governance'
  ],
  [
    'privacy-and-data-governance',
    'retrieval-augmented-generation'
  ],
  [
    'privacy-and-data-governance',
    'human-review-and-release-checklists'
  ],
  [
    'interpretability-and-explainability',
    'fairness-and-bias'
  ],
  [
    'interpretability-and-explainability',
    'human-review-and-release-checklists'
  ],
  [
    'human-review-and-release-checklists',
    'llm-evaluation'
  ]
]

export const graphEdges: GraphEdge[] = [
  ...partOfEdges,
  ...prerequisites.map(([source, target]): GraphEdge => ({ source, target, type: 'prerequisite-of' })),
  ...related.map(([source, target]): GraphEdge => ({ source, target, type: 'related-to' })),
]
