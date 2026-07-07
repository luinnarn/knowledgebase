import { render, screen, fireEvent } from '@testing-library/react'
import CodeBlock from './CodeBlock'

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
