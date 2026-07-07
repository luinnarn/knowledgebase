import { highlightJava, type Token } from './highlightJava'

const joined = (tokens: Token[]) => tokens.map((t) => t.text).join('')
const ofType = (tokens: Token[], type: Token['type']) => tokens.filter((t) => t.type === type).map((t) => t.text)

test('round-trips the exact source text', () => {
  const src = 'public class Foo {\n  int x = 42; // count\n}'
  expect(joined(highlightJava(src))).toBe(src)
})

test('tags keywords', () => {
  const tokens = highlightJava('public static final int x = 1;')
  expect(ofType(tokens, 'kw')).toEqual(['public', 'static', 'final', 'int'])
})

test('tags class-like identifiers as types', () => {
  const tokens = highlightJava('List<String> names = new ArrayList<>();')
  expect(ofType(tokens, 'type')).toEqual(['List', 'String', 'ArrayList'])
})

test('tags string literals including escapes', () => {
  const tokens = highlightJava('String s = "a \\"quoted\\" word";')
  expect(ofType(tokens, 'str')).toEqual(['"a \\"quoted\\" word"'])
})

test('tags char literals', () => {
  const tokens = highlightJava("char c = 'x';")
  expect(ofType(tokens, 'str')).toEqual(["'x'"])
})

test('tags line comments to end of line only', () => {
  const tokens = highlightJava('int a; // note\nint b;')
  expect(ofType(tokens, 'comment')).toEqual(['// note'])
  expect(ofType(tokens, 'kw')).toEqual(['int', 'int'])
})

test('tags block comments across lines', () => {
  const tokens = highlightJava('/* multi\nline */ int x;')
  expect(ofType(tokens, 'comment')).toEqual(['/* multi\nline */'])
})

test('tags annotations', () => {
  const tokens = highlightJava('@Override\npublic String toString() { return ""; }')
  expect(ofType(tokens, 'ann')).toEqual(['@Override'])
})

test('tags numeric literals including underscores, hex, and suffixes', () => {
  const tokens = highlightJava('long big = 1_000_000L; double d = 2.5e3; int h = 0xFF;')
  expect(ofType(tokens, 'num')).toEqual(['1_000_000L', '2.5e3', '0xFF'])
})

test('does not treat identifiers containing keywords as keywords', () => {
  const tokens = highlightJava('int internal = doThing();')
  expect(ofType(tokens, 'kw')).toEqual(['int'])
})

test('handles text blocks', () => {
  const src = 'String q = """\n  hello\n  """;'
  const tokens = highlightJava(src)
  expect(ofType(tokens, 'str')).toEqual(['"""\n  hello\n  """'])
  expect(joined(tokens)).toBe(src)
})
