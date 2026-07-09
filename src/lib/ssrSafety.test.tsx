// @vitest-environment node
import { describe, it, expect } from 'vitest'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'
import CompendiumPicker from '../pages/CompendiumPicker'

describe('components with no DOM globals available (simulates SSR)', () => {
  it('renders ThemeToggle without throwing', () => {
    expect(() => renderToString(<ThemeToggle />)).not.toThrow()
  })

  it('renders CompendiumPicker without throwing', () => {
    expect(() =>
      renderToString(
        <MemoryRouter>
          <CompendiumPicker />
        </MemoryRouter>,
      ),
    ).not.toThrow()
  })
})
