import { render, screen, fireEvent } from '@testing-library/react'
import CodeBlock from './CodeBlock'

const sqlVariants = [
  { id: 'postgresql', label: 'PostgreSQL', language: 'sql' as const, code: 'INSERT INTO users(name) VALUES ($1) RETURNING id;' },
  { id: 'mysql', label: 'MySQL', language: 'sql' as const, code: 'INSERT INTO users(name) VALUES (?);' },
]

test('renders highlighted code with title', () => {
  render(<CodeBlock code={'int x = 1;'} title="Example.java" />)
  expect(screen.getByText('Example.java')).toBeInTheDocument()
  expect(screen.getByText('int')).toHaveClass('tok-kw')
})

test('copy button writes code to clipboard', async () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<CodeBlock code={'int x = 1;'} />)
  fireEvent.click(screen.getByRole('button', { name: /copy/i }))
  expect(writeText).toHaveBeenCalledWith('int x = 1;')
  expect(await screen.findByRole('button', { name: /copied/i })).toBeInTheDocument()
})

test('renders PostgreSQL as the initial selected variant', () => {
  render(<CodeBlock variants={sqlVariants} title="Generated keys" />)
  expect(screen.getByRole('tab', { name: 'PostgreSQL' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tabpanel')).toHaveTextContent(/RETURNING id/)
})

test('switches variants with click and copies active code', () => {
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<CodeBlock variants={sqlVariants} />)
  fireEvent.click(screen.getByRole('tab', { name: 'MySQL' }))
  fireEvent.click(screen.getByRole('button', { name: /copy/i }))
  expect(writeText).toHaveBeenCalledWith(sqlVariants[1].code)
})

test('moves selection and focus with arrow keys', () => {
  render(<CodeBlock variants={sqlVariants} />)
  fireEvent.keyDown(screen.getByRole('tab', { name: 'PostgreSQL' }), { key: 'ArrowRight' })
  expect(screen.getByRole('tab', { name: 'MySQL' })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('tab', { name: 'MySQL' })).toHaveFocus()
})

test('moves selection with Home and End keys and wraps at boundaries', () => {
  render(<CodeBlock variants={sqlVariants} />)
  const postgresql = screen.getByRole('tab', { name: 'PostgreSQL' })
  const mysql = screen.getByRole('tab', { name: 'MySQL' })

  fireEvent.keyDown(postgresql, { key: 'ArrowLeft' })
  expect(mysql).toHaveFocus()
  fireEvent.keyDown(mysql, { key: 'Home' })
  expect(postgresql).toHaveFocus()
  fireEvent.keyDown(postgresql, { key: 'End' })
  expect(mysql).toHaveFocus()
  fireEvent.keyDown(mysql, { key: 'ArrowRight' })
  expect(postgresql).toHaveFocus()
})

test('clipboard rejection does not show copied feedback', async () => {
  Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
  render(<CodeBlock code="SELECT 1" language="sql" />)
  fireEvent.click(screen.getByRole('button', { name: /copy/i }))
  expect(screen.queryByRole('button', { name: /copied/i })).not.toBeInTheDocument()
})

test('preserves the default Java label for single-source code', () => {
  render(<CodeBlock code="int x = 1;" />)
  expect(screen.getByText('Java')).toBeInTheDocument()
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
})
