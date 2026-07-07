/** Tiny Java tokenizer for syntax highlighting. Tokens concatenate back to the exact source. */

export interface Token {
  text: string
  type: 'kw' | 'type' | 'str' | 'num' | 'comment' | 'ann' | 'plain'
}

const KEYWORDS = new Set([
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const',
  'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final', 'finally', 'float',
  'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int', 'interface', 'long', 'native',
  'new', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'strictfp',
  'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'try', 'void',
  'volatile', 'while', 'var', 'record', 'sealed', 'permits', 'yield', 'non-sealed',
  'true', 'false', 'null',
])

const RULES: Array<[RegExp, Token['type']]> = [
  [/^\/\/[^\n]*/, 'comment'],
  [/^\/\*[\s\S]*?\*\//, 'comment'],
  [/^"""[\s\S]*?"""/, 'str'],
  [/^"(?:\\.|[^"\\\n])*"/, 'str'],
  [/^'(?:\\.|[^'\\\n])'/, 'str'],
  [/^@[A-Za-z_][A-Za-z0-9_]*/, 'ann'],
  [/^0[xX][0-9a-fA-F_]+[lL]?/, 'num'],
  [/^0[bB][01_]+[lL]?/, 'num'],
  [/^\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?[fFdDlL]?/, 'num'],
]

const WORD = /^[A-Za-z_$][A-Za-z0-9_$]*/

export function highlightJava(code: string): Token[] {
  const tokens: Token[] = []
  let rest = code
  let plain = ''

  const flushPlain = () => {
    if (plain) {
      tokens.push({ text: plain, type: 'plain' })
      plain = ''
    }
  }

  outer: while (rest.length > 0) {
    for (const [re, type] of RULES) {
      const m = re.exec(rest)
      if (m) {
        flushPlain()
        tokens.push({ text: m[0], type })
        rest = rest.slice(m[0].length)
        continue outer
      }
    }
    const w = WORD.exec(rest)
    if (w) {
      const word = w[0]
      flushPlain()
      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, type: 'kw' })
      } else if (/^[A-Z]/.test(word)) {
        tokens.push({ text: word, type: 'type' })
      } else {
        tokens.push({ text: word, type: 'plain' })
      }
      rest = rest.slice(word.length)
      continue
    }
    plain += rest[0]
    rest = rest.slice(1)
  }
  flushPlain()

  // Merge adjacent plain tokens for a smaller DOM.
  const merged: Token[] = []
  for (const t of tokens) {
    const last = merged[merged.length - 1]
    if (last && last.type === 'plain' && t.type === 'plain') last.text += t.text
    else merged.push({ ...t })
  }
  return merged
}
