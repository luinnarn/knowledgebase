import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test-utils'

test('scrolls to top when navigating to a different route', async () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  const user = userEvent.setup()
  renderApp('/java/topics/generics/type-erasure')
  expect(await screen.findByRole('heading', { name: /type erasure/i, level: 1 })).toBeInTheDocument()

  scrollTo.mockClear()
  await user.click(screen.getByRole('link', { name: 'Graph' }))

  expect(await screen.findByRole('heading', { name: /knowledge graph/i })).toBeInTheDocument()
  expect(scrollTo).toHaveBeenCalled()
})

test('sets the document title to the active compendium, not a fixed string', () => {
  renderApp('/cs')
  expect(document.title).toBe('CS::Compendium')
})
