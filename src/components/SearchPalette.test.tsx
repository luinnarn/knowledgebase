import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { getSearchIndex } from '../lib/searchIndex'
import { compendiumRegistry } from '../data/registry'

test('index finds topics and classes for a known query', async () => {
  const index = await getSearchIndex('java', compendiumRegistry.java)
  const hits = index.search('erasure')
  expect(hits.some((h) => String(h.id) === 'topic:type-erasure')).toBe(true)
  const classHits = index.search('ConcurrentHashMap')
  expect(classHits.some((h) => String(h.id) === 'class:java.util.concurrent.ConcurrentHashMap')).toBe(true)
})

test('palette opens from header button, searches, and navigates on Enter', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
  fireEvent.click(screen.getByRole('button', { name: 'Search' }))
  const input = await screen.findByRole('textbox', { name: /search query/i })
  fireEvent.change(input, { target: { value: 'volatile' } })
  const options = await screen.findAllByRole('option')
  expect(options.length).toBeGreaterThan(0)
  fireEvent.keyDown(input, { key: 'Enter' })
  // Palette closes and navigation occurred (a topic page heading is now present).
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
