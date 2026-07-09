import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CompendiumPicker from './CompendiumPicker'

function renderPicker() {
  return render(
    <MemoryRouter>
      <CompendiumPicker />
    </MemoryRouter>,
  )
}

test('links to every compendium', () => {
  renderPicker()
  expect(screen.getByRole('link', { name: /^Java/ })).toHaveAttribute('href', '/java')
  expect(screen.getByRole('link', { name: /^CS/ })).toHaveAttribute('href', '/cs')
  expect(screen.getByRole('link', { name: /^SysDesign/ })).toHaveAttribute('href', '/system-design')
})

test('marks the last-used compendium from localStorage', () => {
  localStorage.setItem('jkb-compendium', 'cs')
  renderPicker()
  expect(screen.getByRole('link', { name: /^CS/ })).toHaveClass('is-last-used')
  localStorage.removeItem('jkb-compendium')
})

test('does not mark any card when nothing is stored', () => {
  localStorage.removeItem('jkb-compendium')
  renderPicker()
  expect(screen.getByRole('link', { name: /^Java/ })).not.toHaveClass('is-last-used')
  expect(screen.getByRole('link', { name: /^CS/ })).not.toHaveClass('is-last-used')
  expect(screen.getByRole('link', { name: /^SysDesign/ })).not.toHaveClass('is-last-used')
})
