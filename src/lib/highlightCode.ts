import Prism from 'prismjs'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-python'
import type { CodeLanguage } from '../types/content'

export interface Token {
  text: string
  type: 'kw' | 'type' | 'str' | 'num' | 'comment' | 'ann' | 'plain'
}

const GRAMMARS: Record<CodeLanguage, string | null> = {
  java: 'java',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  sql: 'sql',
  bash: 'bash',
  json: 'json',
  markup: 'markup',
  text: null,
}

const TOKEN_TYPES: Partial<Record<string, Token['type']>> = {
  keyword: 'kw',
  'class-name': 'type',
  string: 'str',
  char: 'str',
  'triple-quoted-string': 'str',
  number: 'num',
  comment: 'comment',
  annotation: 'ann',
}

function append(tokens: Token[], text: string, type: Token['type']) {
  if (!text) return

  const previous = tokens[tokens.length - 1]
  if (previous?.type === type) previous.text += text
  else tokens.push({ text, type })
}

function flatten(content: string | Prism.Token | Array<string | Prism.Token>, tokens: Token[], inheritedType: Token['type'] = 'plain') {
  if (typeof content === 'string') {
    append(tokens, content, inheritedType)
    return
  }

  if (Array.isArray(content)) {
    for (const part of content) flatten(part, tokens, inheritedType)
    return
  }

  flatten(content.content, tokens, TOKEN_TYPES[content.type] ?? inheritedType)
}

export function highlightCode(code: string, language: CodeLanguage | string): Token[] {
  const grammarName = GRAMMARS[language as CodeLanguage]
  const grammar = grammarName ? Prism.languages[grammarName] : undefined

  if (!grammar) return [{ text: code, type: 'plain' }]

  const tokens: Token[] = []
  flatten(Prism.tokenize(code, grammar), tokens)
  return tokens
}
