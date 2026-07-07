import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

test('renders the shell with brand and primary nav', () => {
  renderAt('/')
  expect(screen.getByText('Compendium')).toBeInTheDocument()
  const nav = screen.getByRole('navigation', { name: /primary/i })
  expect(nav).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Topics' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Graph' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Classes' })).toBeInTheDocument()
})

test('navigates between sections', async () => {
  const user = userEvent.setup()
  renderAt('/')
  await user.click(screen.getByRole('link', { name: 'Graph' }))
  expect(screen.getByRole('heading', { name: /knowledge graph/i })).toBeInTheDocument()
  await user.click(screen.getByRole('link', { name: 'Classes' }))
  expect(screen.getByRole('heading', { name: /class reference/i })).toBeInTheDocument()
})

test('theme toggle flips the document theme', async () => {
  const user = userEvent.setup()
  renderAt('/')
  const initial = document.documentElement.dataset.theme
  await user.click(screen.getByRole('button', { name: /switch to/i }))
  expect(document.documentElement.dataset.theme).not.toBe(initial)
})
