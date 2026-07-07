import type { Book } from '../types/content'

export const books: Book[] = [
  { key: 'core-java-1', title: 'Core Java, Volume I: Fundamentals (13th ed.)', authors: 'Cay S. Horstmann' },
  { key: 'core-java-2', title: 'Core Java, Volume II: Advanced Features (13th ed.)', authors: 'Cay S. Horstmann' },
  { key: 'effective-java', title: 'Effective Java (3rd ed.)', authors: 'Joshua Bloch' },
  { key: 'jcip', title: 'Java Concurrency in Practice', authors: 'Brian Goetz et al.' },
  { key: 'learning-java', title: 'Learning Java (6th ed.)', authors: 'Marc Loy, Patrick Niemeyer, Daniel Leuck' },
  { key: 'optimizing-java', title: 'Optimizing Java', authors: 'Benjamin J. Evans, James Gough, Chris Newland' },
  { key: 'ocnj', title: 'Optimizing Cloud Native Java (2nd ed.)', authors: 'Benjamin J. Evans, James Gough' },
  { key: 'java-secrets', title: 'Java Secrets: High Performance and Scalability', authors: 'Alex Harrison' },
]

export const bookByKey = new Map(books.map((b) => [b.key, b]))
