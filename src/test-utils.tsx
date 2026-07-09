import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import CompendiumProvider from './lib/CompendiumProvider'

/** Renders the real App at a given path — for integration-style tests that exercise routing,
 *  lazy content loading, and navigation end to end. */
export function renderApp(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

/** Renders a single component inside a working CompendiumProvider, for tests that don't need
 *  the rest of the app's routing (e.g. a component rendered in isolation with a fixture). Mirrors
 *  App.tsx's real `:compendiumId` route nesting so useCompendium() resolves correctly. */
export function renderWithCompendium(ui: ReactElement, { compendiumId = 'java' }: { compendiumId?: string } = {}) {
  return render(
    <MemoryRouter initialEntries={[`/${compendiumId}`]}>
      <Routes>
        <Route path=":compendiumId" element={<CompendiumProvider>{ui}</CompendiumProvider>} />
      </Routes>
    </MemoryRouter>,
  )
}
