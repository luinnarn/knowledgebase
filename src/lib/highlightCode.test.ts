import { highlightCode, type Token } from './highlightCode'

const joined = (tokens: Token[]) => tokens.map((token) => token.text).join('')

test.each([
  ['java', 'public record User(long id) {}'],
  ['javascript', 'const answer = 42'],
  ['typescript', 'type Id = string | number'],
  ['python', 'def answer():\n    return 42'],
  ['sql', 'SELECT id FROM users WHERE active = TRUE;'],
  ['bash', 'psql --dbname app'],
  ['json', '{"active": true}'],
  ['markup', '<table><tr></tr></table>'],
  ['text', 'literal <>& text'],
])('round-trips %s source', (language, code) => {
  expect(joined(highlightCode(code, language))).toBe(code)
})

test('marks SQL keywords', () => {
  expect(highlightCode('SELECT id FROM users', 'sql').filter((t) => t.type === 'kw').map((t) => t.text.toUpperCase()))
    .toEqual(['SELECT', 'FROM'])
})

test('marks Python keywords', () => {
  expect(highlightCode('def f():\n    return 1', 'python').filter((t) => t.type === 'kw').map((t) => t.text))
    .toEqual(['def', 'return'])
})

test('unknown languages fall back to plain text', () => {
  expect(highlightCode('<unsafe>', 'unknown')).toEqual([{ text: '<unsafe>', type: 'plain' }])
})
