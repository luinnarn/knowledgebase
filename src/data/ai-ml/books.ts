import type { Book } from '../../types/content'

export const books: Book[] = [
  { key: 'aima', title: 'Artificial Intelligence: A Modern Approach', authors: 'Stuart Russell, Peter Norvig' },
  { key: 'cs229', title: 'CS229: Machine Learning', authors: 'Stanford University' },
  { key: 'isl-python', title: 'An Introduction to Statistical Learning with Python', authors: 'Gareth James, Daniela Witten, Trevor Hastie, Rob Tibshirani, Jonathan Taylor' },
  { key: 'mml', title: 'Mathematics for Machine Learning', authors: 'Marc Peter Deisenroth, A. Aldo Faisal, Cheng Soon Ong' },
  { key: 'deep-learning-book', title: 'Deep Learning', authors: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville' },
  { key: 'd2l', title: 'Dive into Deep Learning', authors: 'Aston Zhang, Zachary C. Lipton, Mu Li, Alexander J. Smola' },
  { key: 'google-mlcc', title: 'Machine Learning Crash Course', authors: 'Google' },
  { key: 'sklearn-guide', title: 'scikit-learn User Guide', authors: 'scikit-learn developers' },
  { key: 'hf-llm-course', title: 'Hugging Face LLM Course', authors: 'Hugging Face' },
  { key: 'openai-docs', title: 'OpenAI API Documentation', authors: 'OpenAI' },
  { key: 'anthropic-docs', title: 'Claude Prompt Engineering and Evaluation Docs', authors: 'Anthropic' },
  { key: 'rules-of-ml', title: 'Rules of Machine Learning', authors: 'Martin Zinkevich, Google' },
  { key: 'made-with-ml', title: 'Made With ML', authors: 'Goku Mohandas / Anyscale' },
  { key: 'paper-transformers', title: 'Attention Is All You Need', authors: 'Ashish Vaswani et al.' },
  { key: 'paper-instructgpt', title: 'Training Language Models to Follow Instructions with Human Feedback', authors: 'Long Ouyang et al.' },
  { key: 'paper-rag', title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', authors: 'Patrick Lewis et al.' },
]

export const bookByKey = new Map(books.map((b) => [b.key, b]))
