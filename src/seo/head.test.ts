import { buildHead } from './head'
import type { RouteMeta } from './routes'

const topicRoute: RouteMeta = {
  path: '/java/topics/collections/arraylist',
  kind: 'topic',
  title: 'ArrayList · Collections · Java::Compendium',
  description: 'A resizable-array List implementation backed by an array.',
  compendiumId: 'java',
  compendiumLabel: 'Java',
  domainId: 'collections',
  domainTitle: 'Collections',
  topicId: 'arraylist',
}

test('includes the exact title, description, and canonical URL', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('<title>ArrayList · Collections · Java::Compendium</title>')
  expect(head).toContain('content="A resizable-array List implementation backed by an array."')
  expect(head).toContain('<link rel="canonical" href="https://referencehub.dev/java/topics/collections/arraylist/">')
})

test('includes Open Graph and Twitter tags pointing at the domain OG image', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('property="og:type" content="article"')
  expect(head).toContain('property="og:image" content="https://referencehub.dev/og/java/collections.png"')
  expect(head).toContain('name="twitter:card" content="summary_large_image"')
})

test('emits a TechArticle and a BreadcrumbList for a topic route', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('"@type":"TechArticle"')
  expect(head).toContain('"@type":"BreadcrumbList"')
})

test('og:url matches the trailing-slash canonical URL', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('property="og:url" content="https://referencehub.dev/java/topics/collections/arraylist/"')
})

test('every BreadcrumbList item URL has a trailing slash (except the root)', () => {
  const head = buildHead(topicRoute)
  expect(head).toContain('"item":"https://referencehub.dev/"')
  expect(head).toContain('"item":"https://referencehub.dev/java/"')
  expect(head).toContain('"item":"https://referencehub.dev/java/topics/collections/"')
  expect(head).toContain('"item":"https://referencehub.dev/java/topics/collections/arraylist/"')
})

test('emits an ItemList of domains for a compendium-home route', () => {
  const homeRoute: RouteMeta = {
    path: '/java',
    kind: 'compendium-home',
    title: 'Java::Compendium',
    description: 'd',
    compendiumId: 'java',
    compendiumLabel: 'Java',
    domains: [{ id: 'fundamentals', title: 'Language Fundamentals' }],
  }
  const head = buildHead(homeRoute)
  expect(head).toContain('"@type":"ItemList"')
  expect(head).toContain('Language Fundamentals')
  expect(head).toContain('"url":"https://referencehub.dev/java/topics/fundamentals/"')
})

test('emits only a WebSite entry (no BreadcrumbList) for the root picker route', () => {
  const pickerRoute: RouteMeta = { path: '/', kind: 'picker', title: 'Choose a Compendium · Compendium', description: 'd' }
  const head = buildHead(pickerRoute)
  expect(head).toContain('"@type":"WebSite"')
  expect(head).not.toContain('"@type":"BreadcrumbList"')
})

test('root picker route canonical is exactly the origin with a single trailing slash', () => {
  const pickerRoute: RouteMeta = { path: '/', kind: 'picker', title: 'Choose a Compendium · Compendium', description: 'd' }
  const head = buildHead(pickerRoute)
  expect(head).toContain('<link rel="canonical" href="https://referencehub.dev/">')
  expect(head).not.toContain('https://referencehub.dev//')
})

test('escapes HTML-special characters in title and description', () => {
  const route: RouteMeta = {
    path: '/java/topics/oop/generics-wildcards',
    kind: 'topic',
    title: 'Generics & Wildcards · OOP · Java::Compendium',
    description: 'Covers "extends" and <T> bounds.',
    compendiumId: 'java',
    compendiumLabel: 'Java',
    domainId: 'oop',
  }
  const head = buildHead(route)
  expect(head).toContain('Generics &amp; Wildcards')
  expect(head).toContain('&quot;extends&quot; and &lt;T&gt; bounds')
})
