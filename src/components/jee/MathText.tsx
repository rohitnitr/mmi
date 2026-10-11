'use client'
import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Renders text with $inline$ and $$block$$ LaTeX. Everything outside the dollar signs is plain text (React escapes it).
const SPLIT = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g

type Part = { kind: 'text'; v: string } | { kind: 'math'; html: string }

function toParts(text: string): Part[] {
  return text
    .split(SPLIT)
    .filter((p) => p !== '')
    .map((p): Part => {
      const block = p.startsWith('$$') && p.endsWith('$$') && p.length > 4
      const inline = !block && p.startsWith('$') && p.endsWith('$') && p.length > 2
      if (!block && !inline) return { kind: 'text', v: p }
      try {
        const html = katex.renderToString(p.slice(block ? 2 : 1, block ? -2 : -1), { displayMode: block, throwOnError: true, strict: 'ignore', trust: false })
        return { kind: 'math', html }
      } catch {
        return { kind: 'text', v: p }
      }
    })
}

export default function MathText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => toParts(text), [text])
  return (
    <span className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((p, i) => (p.kind === 'text' ? <span key={i}>{p.v}</span> : <span key={i} dangerouslySetInnerHTML={{ __html: p.html }} />))}
    </span>
  )
}
