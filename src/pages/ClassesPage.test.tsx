import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { classSummaries } from '../data/classes/index'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('class list shows every curated class and filters', () => {
  renderAt('/classes')
  expect(screen.getByRole('heading', { name: /class reference/i })).toBeInTheDocument()
  expect(screen.getAllByRole('link').length).toBeGreaterThan(classSummaries.length)
  fireEvent.change(screen.getByRole('searchbox', { name: /filter classes/i }), { target: { value: 'ConcurrentHash' } })
  expect(screen.getByText('ConcurrentHashMap')).toBeInTheDocument()
  expect(screen.queryByText('LocalDate')).not.toBeInTheDocument()
})

test('class detail loads lazily with methods and javadoc link', async () => {
  renderAt('/classes/java.util.HashMap')
  expect(await screen.findByRole('heading', { name: 'HashMap', level: 1 })).toBeInTheDocument()
  expect(screen.getByText(/key methods/i)).toBeInTheDocument()
  const javadoc = screen.getByRole('link', { name: /official javadoc/i })
  expect(javadoc).toHaveAttribute('href', expect.stringContaining('docs.oracle.com'))
})
