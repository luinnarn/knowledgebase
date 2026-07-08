import { render, screen, fireEvent } from '@testing-library/react'
import mermaid from 'mermaid'
import Diagram from './Diagram'

vi.mock('mermaid', () => ({
  default: { initialize: vi.fn(), render: vi.fn() },
}))

const renderMock = vi.mocked(mermaid.render)

test('renders the SVG Mermaid produces, with a title', async () => {
  renderMock.mockResolvedValue({ svg: '<svg data-testid="fake-svg" />', diagramType: 'flowchart' } as never)
  render(<Diagram code="graph TD; A-->B" title="Flow" />)
  expect(await screen.findByTestId('fake-svg')).toBeInTheDocument()
  expect(screen.getByText('Flow')).toBeInTheDocument()
})

test('falls back to the raw source when Mermaid fails to parse it', async () => {
  renderMock.mockRejectedValue(new Error('Parse error on line 1'))
  render(<Diagram code="not a real diagram" />)
  expect(await screen.findByText(/parse error/i)).toBeInTheDocument()
  expect(screen.getByText('not a real diagram')).toBeInTheDocument()
})

test('copy button writes the Mermaid source to the clipboard', async () => {
  renderMock.mockResolvedValue({ svg: '<svg />', diagramType: 'flowchart' } as never)
  const writeText = vi.fn().mockResolvedValue(undefined)
  Object.assign(navigator, { clipboard: { writeText } })
  render(<Diagram code="graph TD; A-->B" />)
  fireEvent.click(screen.getByRole('button', { name: /copy/i }))
  expect(writeText).toHaveBeenCalledWith('graph TD; A-->B')
})
