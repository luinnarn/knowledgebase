import type { Book } from '../../types/content'

export const books: Book[] = [
  { key: 'algorithms-sedgewick', title: 'Algorithms (4th ed.)', authors: 'Robert Sedgewick, Kevin Wayne' },
  { key: 'algorithms-notes', title: 'Algorithms Notes for Professionals', authors: 'Stack Overflow Documentation' },
  { key: 'clean-architecture', title: 'Clean Architecture', authors: 'Robert C. Martin' },
  { key: 'crushing-tech-interview', title: 'Crushing the Technical Interview: Data Structures and Algorithms', authors: 'Keith Henning' },
  { key: 'dsa-goodrich', title: 'Data Structures and Algorithms in Java (6th ed.)', authors: 'Michael T. Goodrich, Roberto Tamassia, Michael H. Goldwasser' },
  { key: 'dsa-myers', title: 'Data Structures and Algorithms in Java: A Project-Based Approach', authors: 'Dan S. Myers' },
  { key: 'head-first-patterns', title: 'Head First Design Patterns (2nd ed.)', authors: 'Eric Freeman, Elisabeth Robson' },
  { key: 'refactoring-fowler', title: 'Refactoring: Improving the Design of Existing Code (2nd ed.)', authors: 'Martin Fowler' },
  { key: 'pragmatic-programmer', title: 'The Pragmatic Programmer (20th Anniversary ed.)', authors: 'David Thomas, Andrew Hunt' },
]

export const bookByKey = new Map(books.map((b) => [b.key, b]))
