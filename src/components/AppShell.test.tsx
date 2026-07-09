import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Link } from 'react-router-dom'
import AppShell from './AppShell'
import CompendiumProvider from '../lib/CompendiumProvider'

function Stub({ label, to }: { label: string; to?: string }) {
  return (
    <div>
      <h1>{label}</h1>
      {to && <Link to={to}>go</Link>}
    </div>
  )
}

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/topics/a']}>
      <CompendiumProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="topics/a" element={<Stub label="Page A" to="/topics/b" />} />
            <Route path="topics/b" element={<Stub label="Page B" />} />
          </Route>
        </Routes>
      </CompendiumProvider>
    </MemoryRouter>,
  )
}

test('scrolls to top when navigating to a different route', () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  renderShell()
  expect(screen.getByRole('heading', { name: 'Page A' })).toBeInTheDocument()

  scrollTo.mockClear()
  fireEvent.click(screen.getByRole('link', { name: 'go' }))

  expect(screen.getByRole('heading', { name: 'Page B' })).toBeInTheDocument()
  expect(scrollTo).toHaveBeenCalled()
})
