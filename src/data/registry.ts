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

import { domains as sdDomains, domainById as sdDomainById } from './system-design/domains'
import { topicLoaders as sdTopicLoaders } from './system-design/topics/index'
import { graphNodes as sdGraphNodes, graphEdges as sdGraphEdges } from './system-design/graph'
import { books as sdBooks, bookByKey as sdBookByKey } from './system-design/books'

import { domains as aiMlDomains, domainById as aiMlDomainById } from './ai-ml/domains'
import { topicLoaders as aiMlTopicLoaders } from './ai-ml/topics/index'
import { graphNodes as aiMlGraphNodes, graphEdges as aiMlGraphEdges } from './ai-ml/graph'
import { books as aiMlBooks, bookByKey as aiMlBookByKey } from './ai-ml/books'

import { domains as jsTsDomains, domainById as jsTsDomainById } from './js-ts/domains'
import { topicLoaders as jsTsTopicLoaders } from './js-ts/topics/index'
import { graphNodes as jsTsGraphNodes, graphEdges as jsTsGraphEdges } from './js-ts/graph'
import { books as jsTsBooks, bookByKey as jsTsBookByKey } from './js-ts/books'

import { domains as databaseDomains, domainById as databaseDomainById } from './databases/domains'
import { topicLoaders as databaseTopicLoaders } from './databases/topics/index'
import { graphNodes as databaseGraphNodes, graphEdges as databaseGraphEdges } from './databases/graph'
import { books as databaseBooks, bookByKey as databaseBookByKey } from './databases/books'

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
  'js-ts': { 
    domains: jsTsDomains, 
    domainById: jsTsDomainById, 
    topicLoaders: jsTsTopicLoaders, 
    graphNodes: jsTsGraphNodes, 
    graphEdges: jsTsGraphEdges, 
    books: jsTsBooks, 
    bookByKey: jsTsBookByKey, 
    classLoaders: {}, 
    classSummaries: [], 
    areaTitles: {} 
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
  'system-design': {
    domains: sdDomains,
    domainById: sdDomainById,
    topicLoaders: sdTopicLoaders,
    graphNodes: sdGraphNodes,
    graphEdges: sdGraphEdges,
    books: sdBooks,
    bookByKey: sdBookByKey,
    classLoaders: {},
    classSummaries: [],
    areaTitles: {},
  },
  'ai-ml': {
    domains: aiMlDomains,
    domainById: aiMlDomainById,
    topicLoaders: aiMlTopicLoaders,
    graphNodes: aiMlGraphNodes,
    graphEdges: aiMlGraphEdges,
    books: aiMlBooks,
    bookByKey: aiMlBookByKey,
    classLoaders: {},
    classSummaries: [],
    areaTitles: {},
  },
  databases: {
    domains: databaseDomains,
    domainById: databaseDomainById,
    topicLoaders: databaseTopicLoaders,
    graphNodes: databaseGraphNodes,
    graphEdges: databaseGraphEdges,
    books: databaseBooks,
    bookByKey: databaseBookByKey,
    classLoaders: {},
    classSummaries: [],
    areaTitles: {},
  },
}
