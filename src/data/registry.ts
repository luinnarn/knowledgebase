import type { Domain, Topic, GraphNode, GraphEdge, Book, JavaClass, ClassSummary } from '../types/content'

import { domains as javaDomains, domainById as javaDomainById } from './domains'
import { topicLoaders as javaTopicLoaders } from './topics/index'
import { graphNodes as javaGraphNodes, graphEdges as javaGraphEdges } from './graph'
import { books as javaBooks, bookByKey as javaBookByKey } from './books'
import { classLoaders as javaClassLoaders, classSummaries as javaClassSummaries, areaTitles as javaAreaTitles } from './classes/index'

import { domains as csDomains, domainById as csDomainById } from './cs/domains'
import { topicLoaders as csTopicLoaders } from './cs/topics/index'
import { graphNodes as csGraphNodes, graphEdges as csGraphEdges } from './cs/graph'
import { books as csBooks, bookByKey as csBookByKey } from './cs/books'

export interface CompendiumData {
  domains: Domain[]
  domainById: Map<string, Domain>
  topicLoaders: Record<string, () => Promise<{ topics: Topic[] }>>
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
  books: Book[]
  bookByKey: Map<string, Book>
  classLoaders: Record<string, () => Promise<{ classes: JavaClass[] }>>
  classSummaries: ClassSummary[]
  areaTitles: Record<string, string>
}

/**
 * One entry per compendium id (must match src/data/compendiums.ts). The Java entry binds the
 * original top-level data files; every later compendium lives in its own src/data/<id>/ folder
 * mirroring the same domains.ts / graph.ts / books.ts / topics/index.ts shape (+ classes/index.ts
 * if it has a class reference). Adding a compendium is: author that folder, add one entry here,
 * and add its metadata to compendiums.ts.
 */
export const compendiumRegistry: Record<string, CompendiumData> = {
  java: {
    domains: javaDomains,
    domainById: javaDomainById,
    topicLoaders: javaTopicLoaders,
    graphNodes: javaGraphNodes,
    graphEdges: javaGraphEdges,
    books: javaBooks,
    bookByKey: javaBookByKey,
    classLoaders: javaClassLoaders,
    classSummaries: javaClassSummaries,
    areaTitles: javaAreaTitles,
  },
  cs: {
    domains: csDomains,
    domainById: csDomainById,
    topicLoaders: csTopicLoaders,
    graphNodes: csGraphNodes,
    graphEdges: csGraphEdges,
    books: csBooks,
    bookByKey: csBookByKey,
    classLoaders: {},
    classSummaries: [],
    areaTitles: {},
  },
}
