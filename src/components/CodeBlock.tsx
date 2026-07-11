import { useEffect, useId, useMemo, useState } from 'react'
import { highlightCode } from '../lib/highlightCode'
import type { CodeLanguage, CodeVariant } from '../types/content'
import './CodeBlock.css'

type Props =
  | { code: string; language?: CodeLanguage; variants?: never; title?: string; caption?: string }
  | { code?: never; language?: never; variants: CodeVariant[]; title?: string; caption?: string }

const LANGUAGE_LABELS: Record<CodeLanguage, string> = {
  java: 'Java',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  sql: 'SQL',
  bash: 'Bash',
  json: 'JSON',
  markup: 'Markup',
  text: 'Text',
}

function languageLabel(language: CodeLanguage) {
  return LANGUAGE_LABELS[language]
}

export default function CodeBlock(props: Props) {
  const { title, caption } = props
  const sources = useMemo<CodeVariant[]>(
    () => props.variants ?? [{ id: 'single', label: languageLabel(props.language ?? 'java'), language: props.language ?? 'java', code: props.code }],
    [props.code, props.language, props.variants],
  )
  const variantIdentity = sources.map(({ id }) => id).join('\0')
  const [activeIndex, setActiveIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const id = useId()

  useEffect(() => {
    setActiveIndex(0)
  }, [variantIdentity])

  const activeSource = sources[Math.min(activeIndex, sources.length - 1)] ?? {
    id: 'empty',
    label: 'Code',
    language: 'text' as const,
    code: '',
  }
  const tokens = useMemo(
    () => highlightCode(activeSource.code, activeSource.language),
    [activeSource.code, activeSource.language],
  )
  const hasVariants = sources.length >= 2
  const selectId = `${id}-select`

  const onSelectVariant = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = sources.findIndex((source) => source.id === event.target.value)
    if (index !== -1) setActiveIndex(index)
  }

  const copy = async () => {
    setCopied(false)
    try {
      await navigator.clipboard.writeText(activeSource.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <figure className="codeblock">
      <div className="codeblock-bar">
        {hasVariants ? (
          <>
            {title && <span className="codeblock-title">{title}</span>}
            <select
              className="codeblock-select"
              id={selectId}
              aria-label={title ? `${title} — code variant` : 'Code variant'}
              value={activeSource.id}
              onChange={onSelectVariant}
            >
              {sources.map((source) => (
                <option key={source.id} value={source.id}>{source.label}</option>
              ))}
            </select>
          </>
        ) : (
          <span className="codeblock-title">{title ?? languageLabel(activeSource.language)}</span>
        )}
        <button className="codeblock-copy" type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>
          {tokens.map((token, index) =>
            token.type === 'plain'
              ? token.text
              : <span key={index} className={`tok-${token.type}`}>{token.text}</span>,
          )}
        </code>
      </pre>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
