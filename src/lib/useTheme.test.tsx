import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTheme } from './useTheme'

function Harness() {
  const [theme, toggle] = useTheme()
  return (
    <button onClick={toggle} data-testid="toggle">
      {theme}
    </button>
  )
}

test('reflects the theme stored in localStorage', () => {
  localStorage.setItem('jkb-theme', 'dark')
  render(<Harness />)
  expect(screen.getByTestId('toggle')).toHaveTextContent('dark')
  expect(document.documentElement.dataset.theme).toBe('dark')
  localStorage.removeItem('jkb-theme')
})

test('toggle flips the theme and persists it', async () => {
  localStorage.setItem('jkb-theme', 'light')
  render(<Harness />)
  await userEvent.click(screen.getByTestId('toggle'))
  expect(screen.getByTestId('toggle')).toHaveTextContent('dark')
  expect(localStorage.getItem('jkb-theme')).toBe('dark')
  localStorage.removeItem('jkb-theme')
})
