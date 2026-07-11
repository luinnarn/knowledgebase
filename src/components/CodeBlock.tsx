import { useEffect, useId, useMemo, useRef, useState } from 'react'
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
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
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
  const panelId = `${id}-panel`

  const selectTab = (index: number) => {
    setActiveIndex(index)
    tabRefs.current[index]?.focus()
  }

  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined

    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + sources.length) % sources.length
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % sources.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = sources.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    selectTab(nextIndex)
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
            <div className="codeblock-tabs" role="tablist" aria-label={title ?? 'Code variants'}>
              {sources.map((source, index) => (
                <button
                  className="codeblock-tab"
                  id={`${id}-tab-${source.id}`}
                  key={source.id}
                  type="button"
                  role="tab"
                  aria-controls={panelId}
                  aria-selected={index === activeIndex}
                  tabIndex={index === activeIndex ? 0 : -1}
                  ref={(element) => { tabRefs.current[index] = element }}
                  onClick={() => setActiveIndex(index)}
                  onKeyDown={(event) => onTabKeyDown(event, index)}
                >
                  {source.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <span className="codeblock-title">{title ?? languageLabel(activeSource.language)}</span>
        )}
        <button className="codeblock-copy" type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        id={hasVariants ? panelId : undefined}
        role={hasVariants ? 'tabpanel' : undefined}
        aria-labelledby={hasVariants ? `${id}-tab-${activeSource.id}` : undefined}
      >
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
