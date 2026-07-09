import { screen, fireEvent, within } from '@testing-library/react'
import GraphView from './GraphView'
import { renderWithCompendium } from '../test-utils'
import { graphNodes } from '../data/graph'

function renderGraph() {
  return renderWithCompendium(<GraphView />)
}

test('renders a node for every graph entry', () => {
  renderGraph()
  const svg = screen.getByRole('img', { name: /knowledge graph/i })
  expect(svg.querySelectorAll('.graph-node').length).toBe(graphNodes.length)
})

test('clicking a node opens the preview panel with a link to the topic', () => {
  renderGraph()
  fireEvent.click(screen.getByRole('button', { name: 'Type Erasure' }))
  expect(screen.getByRole('heading', { name: 'Type Erasure' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /open topic/i })).toHaveAttribute('href', '/java/topics/generics/type-erasure')
})

test('domain filter chips toggle', () => {
  renderGraph()
  const filters = screen.getByRole('group', { name: /filter by domain/i })
  const chip = within(filters).getByRole('button', { name: /^Generics$/ })
  fireEvent.click(chip)
  expect(chip).toHaveAttribute('aria-pressed', 'true')
})

test('link prefix follows the active compendium, not a hardcoded default', () => {
  renderWithCompendium(<GraphView />, { compendiumId: 'cs' })
  fireEvent.click(screen.getByRole('button', { name: 'Recursion & Recurrences' }))
  expect(screen.getByRole('link', { name: /open topic/i })).toHaveAttribute(
    'href',
    '/cs/topics/algo-foundations/recursion-and-recurrences',
  )
})
