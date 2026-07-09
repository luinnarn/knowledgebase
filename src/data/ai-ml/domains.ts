import type { Domain } from '../../types/content'

export const domains: Domain[] = [
  {
    id: 'foundations',
    title: 'AI/ML Foundations',
    blurb: 'The vocabulary and mental models behind machine learning: data, labels, loss, optimization, generalization, and evaluation.',
    color: '#6366F1',
    topicIds: [
      'ai-ml-landscape',
      'learning-paradigms',
      'data-splits',
      'loss-and-optimization',
      'overfitting-generalization',
      'metrics-and-evaluation'
    ]
  },
  {
    id: 'classical-ml',
    title: 'Classical Machine Learning',
    blurb: 'The practical non-deep-learning toolbox: linear models, trees, ensembles, clustering, feature engineering, and validation.',
    color: '#22C55E',
    topicIds: [
      'linear-and-logistic-regression',
      'trees-forests-boosting',
      'clustering-and-dimensionality-reduction',
      'feature-engineering',
      'model-selection-and-validation'
    ]
  },
  {
    id: 'deep-learning',
    title: 'Deep Learning',
    blurb: 'Neural networks as representation learners: layers, backpropagation, optimizers, regularization, embeddings, and modern architectures.',
    color: '#A855F7',
    topicIds: [
      'neural-network-basics',
      'backpropagation-and-optimizers',
      'regularization-for-deep-nets',
      'embeddings-and-representation-learning',
      'cnn-rnn-transformer-families'
    ]
  },
  {
    id: 'llms-generative-ai',
    title: 'LLMs & Generative AI',
    blurb: 'How large language models work and how to reason about tokens, context, pretraining, prompting, RAG, tools, and agents.',
    color: '#EC4899',
    topicIds: [
      'tokenization-and-context',
      'transformer-architecture',
      'pretraining-finetuning-instruction-tuning',
      'prompting-and-decoding',
      'retrieval-augmented-generation',
      'tool-calling-and-agents'
    ]
  },
  {
    id: 'applied-ai-engineering',
    title: 'Applied AI Engineering',
    blurb: 'The developer-facing craft of shipping AI features: structured outputs, retrieval, evaluation, latency, cost, reliability, and observability.',
    color: '#F97316',
    topicIds: [
      'choosing-ai-vs-code',
      'structured-outputs-and-validation',
      'retrieval-search-and-reranking',
      'llm-evaluation',
      'cost-latency-and-reliability'
    ]
  },
  {
    id: 'production-ml',
    title: 'Production ML & MLOps',
    blurb: 'The systems side of ML: pipelines, serving, online inference, training-serving skew, monitoring, experiments, and rollout safety.',
    color: '#0EA5E9',
    topicIds: [
      'ml-lifecycle',
      'training-serving-skew',
      'model-serving-and-inference',
      'monitoring-and-drift',
      'experimentation-and-rollouts'
    ]
  },
  {
    id: 'responsible-ai',
    title: 'Responsible AI',
    blurb: 'Bias, privacy, explainability, prompt injection, provenance, and human review treated as engineering constraints, not side quests.',
    color: '#EF4444',
    topicIds: [
      'fairness-and-bias',
      'privacy-and-data-governance',
      'interpretability-and-explainability',
      'prompt-injection-and-ai-security',
      'human-review-and-release-checklists'
    ]
  }
]

export const domainById = new Map(domains.map((d) => [d.id, d]))
