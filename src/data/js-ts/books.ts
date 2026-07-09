import type { Book } from '../../types/content'

export const books: Book[] = [
  { key: "mdn-js", title: "MDN JavaScript Guide and Reference", authors: "MDN contributors" },
  { key: "ecmascript-spec", title: "ECMAScript Language Specification", authors: "Ecma TC39" },
  { key: "tc39-process", title: "The TC39 Process", authors: "Ecma TC39" },
  { key: "ts-handbook", title: "The TypeScript Handbook", authors: "TypeScript contributors / Microsoft" },
  { key: "ts-reference", title: "TypeScript Reference", authors: "TypeScript contributors / Microsoft" },
  { key: "ts-release-notes", title: "TypeScript Release Notes", authors: "TypeScript contributors / Microsoft" },
  { key: "effective-typescript", title: "Effective TypeScript, 2nd Edition", authors: "Dan Vanderkam" },
  { key: "eloquent-js", title: "Eloquent JavaScript, 4th Edition", authors: "Marijn Haverbeke" },
  { key: "javascript-info", title: "The Modern JavaScript Tutorial", authors: "Ilya Kantor and contributors" },
  { key: "ydkjs-yet", title: "You Don’t Know JS Yet", authors: "Kyle Simpson" },
  { key: "node-docs", title: "Node.js Documentation and Learn Node.js", authors: "OpenJS Foundation and Node.js contributors" },
  { key: "vite-docs", title: "Vite Documentation", authors: "Vite contributors" },
  { key: "eslint-docs", title: "ESLint Documentation", authors: "ESLint contributors" },
  { key: "typescript-eslint-docs", title: "typescript-eslint Documentation", authors: "typescript-eslint contributors" },
  { key: "prettier-docs", title: "Prettier Documentation", authors: "Prettier contributors" },
  { key: "vitest-docs", title: "Vitest Documentation", authors: "Vitest contributors" },
  { key: "npm-docs", title: "npm Documentation", authors: "npm contributors" },
  { key: "pnpm-docs", title: "pnpm Documentation", authors: "pnpm contributors" },
]

export const bookByKey = new Map(books.map((b) => [b.key, b]))
