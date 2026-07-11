import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from './test-utils'

beforeEach(() => {
  localStorage.clear()
})

test('bare root shows the compendium picker', () => {
  renderApp('/')
  expect(screen.getByRole('heading', { name: /choose a compendium/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /^Java/ })).toHaveAttribute('href', '/java')
})

test('renders the shell with brand and primary nav', () => {
  renderApp('/java')
  expect(screen.getByText('Compendium')).toBeInTheDocument()
  const nav = screen.getByRole('navigation', { name: /primary/i })
  expect(nav).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Topics' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Graph' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Classes' })).toBeInTheDocument()
})

test('renders the relational databases home with topic navigation', () => {
  renderApp('/databases')
  expect(screen.getByRole('heading', { name: 'Relational databases, understood.' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Topics' })).toHaveAttribute('href', '/databases/topics')
  expect(screen.queryByRole('link', { name: 'Classes' })).not.toBeInTheDocument()
})

test('navigates between sections', async () => {
  const user = userEvent.setup()
  renderApp('/java')
  await user.click(screen.getByRole('link', { name: 'Graph' }))
  expect(screen.getByRole('heading', { name: /knowledge graph/i })).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Classes' }))
  expect(screen.getByRole('heading', { name: /class reference/i })).toBeInTheDocument()
})

test('theme toggle flips the document theme', async () => {
  const user = userEvent.setup()
  renderApp('/java')
  const initial = document.documentElement.dataset.theme
  await user.click(screen.getByRole('button', { name: /switch to/i }))
  expect(document.documentElement.dataset.theme).not.toBe(initial)
})

test('invalid compendium segment shows not found', () => {
  renderApp('/bogus')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})

test('unmatched multi-segment path shows not found', () => {
  renderApp('/foo/bar/baz')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})

test('legacy unprefixed link redirects into the default compendium', async () => {
  renderApp('/topics/generics/type-erasure')
  expect(await screen.findByRole('heading', { name: /type erasure/i, level: 1 })).toBeInTheDocument()
})
