import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('topics index lists all twelve domains', () => {
  renderAt('/topics')
  expect(screen.getByRole('heading', { name: 'Topics', level: 1 })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /language fundamentals/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /concurrency/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /jvm internals/i })).toBeInTheDocument()
})

test('domain landing lists its topics', () => {
  renderAt('/topics/generics')
  expect(screen.getByRole('heading', { name: 'Generics', level: 1 })).toBeInTheDocument()
  // Appears in both the sidebar (auto-expanded active domain) and the landing list.
  expect(screen.getAllByRole('link', { name: 'Wildcards & PECS' }).length).toBeGreaterThanOrEqual(2)
})

test('sidebar shows domain tree', () => {
  renderAt('/topics')
  const nav = screen.getByRole('navigation', { name: 'Topics' })
  expect(nav).toBeInTheDocument()
})

test('authored topic loads via its lazy chunk and renders the full view', async () => {
  renderAt('/topics/generics/type-erasure')
  expect(await screen.findByRole('heading', { name: /type erasure/i, level: 1 })).toBeInTheDocument()
  expect(screen.getByTestId('topic-summary')).toHaveTextContent(/compile-time construct/i)
  expect(screen.getByText('Sources')).toBeInTheDocument()
})

test('unknown topic shows not found', () => {
  renderAt('/topics/generics/nope')
  expect(screen.getByRole('heading', { name: /not found/i })).toBeInTheDocument()
})
