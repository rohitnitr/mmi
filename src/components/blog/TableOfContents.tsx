'use client'

import { useEffect, useState } from 'react'
import './blog.css'

type Heading = { id: string; text: string; level: number }

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const article = document.querySelector('.blog-prose')
      if (!article) return
      const els = Array.from(article.querySelectorAll('h2, h3, h4'))
      const parsed = els.map((el) => {
        const text = el.textContent ?? ''
        const id = el.id || text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        if (!el.id && id) el.id = id
        return { id, text, level: parseInt(el.tagName[1], 10) }
      })
      setHeadings(parsed)
    })
    return () => cancelAnimationFrame(frame)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id) }),
      { rootMargin: '-80px 0px -70% 0px' },
    )
    headings.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [headings])

  if (headings.length === 0) return null
  return (
    <nav className="bl-toc" aria-label="On this page">
      <h3>On this page</h3>
      {headings.map(({ id, text, level }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`${level === 3 ? 'l3' : level === 4 ? 'l4' : ''}${activeId === id ? ' on' : ''}`}
          onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
        >
          {text}
        </a>
      ))}
    </nav>
  )
}
