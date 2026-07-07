import { useMemo, useState } from 'react'
import { highlightJava } from '../lib/highlightJava'
import './CodeBlock.css'

interface Props {
  code: string
  title?: string
  caption?: string
}

export default function CodeBlock({ code, title, caption }: Props) {
  const tokens = useMemo(() => highlightJava(code), [code])
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — silently ignore.
    }
  }

  return (
    <figure className="codeblock">
      <div className="codeblock-bar">
        <span className="codeblock-title">{title ?? 'Java'}</span>
        <button className="codeblock-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>
          {tokens.map((t, i) =>
            t.type === 'plain' ? t.text : <span key={i} className={`tok-${t.type}`}>{t.text}</span>,
          )}
        </code>
      </pre>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
