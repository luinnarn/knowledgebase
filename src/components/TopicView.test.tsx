import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TopicView from './TopicView'
import CompendiumProvider from '../lib/CompendiumProvider'
import type { Topic } from '../types/content'

const fixture: Topic = {
  id: 'program-anatomy',
  domainId: 'fundamentals',
  title: 'Anatomy of a Java Program',
  summary: 'Every program is a set of **classes** linked to [[arrays]].',
  keyPoints: [
    'Entry point is `main`',
    'Compiled to bytecode',
    {
      text: 'One public class per file',
      detail: 'The compiler only enforces this for the public top-level type; package-private classes may share the file.',
    },
  ],
  blocks: [
    { kind: 'paragraph', text: 'See [[strings-text|the strings topic]] for more.' },
    { kind: 'subheading', text: 'Compilation' },
    { kind: 'code', title: 'Hello.java', code: 'class Hello {}' },
    {
      kind: 'pitfall',
      title: 'Classpath confusion',
      text: 'The classpath is not the module path.',
      detail: 'The classpath is a flat, order-sensitive search list; the module path is graph-based and enforces encapsulation.',
    },
    { kind: 'bestPractice', title: 'Item 1', text: 'Consider static factories.' },
    { kind: 'note', text: 'JShell is great for exploration.' },
    { kind: 'table', caption: 'Kinds', headers: ['Kind', 'Use'], rows: [['class', 'state + behavior']] },
  ],
  refs: [{ book: 'core-java-1', chapter: 'Ch. 3' }],
  related: ['primitive-types'],
}

function renderTopic() {
  return render(
    <MemoryRouter>
      <CompendiumProvider>
        <TopicView topic={fixture} />
      </CompendiumProvider>
    </MemoryRouter>,
  )
}

test('renders all skim layers: title, summary, key points', () => {
  renderTopic()
  expect(screen.getByRole('heading', { name: /anatomy of a java program/i })).toBeInTheDocument()
  expect(screen.getByTestId('topic-summary')).toHaveTextContent('Every program is a set of classes')
  expect(screen.getByText('Compiled to bytecode')).toBeInTheDocument()
})

test('renders every block kind', () => {
  renderTopic()
  expect(screen.getByRole('heading', { name: 'Compilation' })).toBeInTheDocument()
  expect(screen.getByText('Hello.java')).toBeInTheDocument()
  expect(screen.getByText('Classpath confusion')).toBeInTheDocument()
  expect(screen.getByText('Item 1')).toBeInTheDocument()
  expect(screen.getByText(/JShell is great/)).toBeInTheDocument()
  expect(screen.getByRole('table')).toBeInTheDocument()
})

test('[[topic-id]] links resolve to routed links, with optional label', () => {
  renderTopic()
  const summaryLink = screen.getByRole('link', { name: 'Arrays' })
  expect(summaryLink).toHaveAttribute('href', '/topics/fundamentals/arrays')
  const labeled = screen.getByRole('link', { name: 'the strings topic' })
  expect(labeled).toHaveAttribute('href', '/topics/fundamentals/strings-text')
})

test('renders related chips and source references', () => {
  renderTopic()
  expect(screen.getByRole('link', { name: /primitive types/i })).toBeInTheDocument()
  expect(screen.getByText(/core java, volume i/i)).toBeInTheDocument()
})

test('key points and callouts with a detail reveal it on toggle, and stay collapsed otherwise', () => {
  renderTopic()
  // A plain-string key point has no toggle at all.
  expect(screen.getByText('Compiled to bytecode').closest('li')?.querySelector('.explain-toggle')).toBeNull()

  const detailText = /compiler only enforces this for the public top-level type/i
  expect(screen.queryByText(detailText)).not.toBeInTheDocument()
  const keyPointLi = screen.getByText('One public class per file').closest('li')!
  fireEvent.click(within(keyPointLi).getByRole('button', { name: 'More' }))
  expect(screen.getByText(detailText)).toBeInTheDocument()

  const pitfallDetail = /graph-based and enforces encapsulation/i
  expect(screen.queryByText(pitfallDetail)).not.toBeInTheDocument()
  fireEvent.click(screen.getByText('Classpath confusion').closest('.callout')!.querySelector('.explain-toggle')!)
  expect(screen.getByText(pitfallDetail)).toBeInTheDocument()

  // A callout with no detail gets no toggle button.
  expect(screen.getByText('Item 1').closest('.callout')?.querySelector('.explain-toggle')).toBeNull()
})
