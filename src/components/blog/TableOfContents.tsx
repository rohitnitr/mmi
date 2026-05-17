'use client'

import { useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Parse headings from the rendered DOM
    const article = document.querySelector('.blog-prose')
    if (!article) return

    const els = article.querySelectorAll('h2, h3, h4')
    const parsed: Heading[] = Array.from(els).map((el) => ({
      id: el.id || el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || '',
      text: el.textContent || '',
      level: parseInt(el.tagName[1]),
    }))

    // Assign ids if missing
    els.forEach((el, i) => {
      if (!el.id && parsed[i].id) el.id = parsed[i].id
    })

    setHeadings(parsed)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        })
      },
      { rootMargin: '-80px 0px -70% 0px' }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">On this page</p>
      <nav className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <a
            key={id}
            href={`#${id}`}
            onClick={(e) => {
              e.preventDefault()
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className={`block text-sm leading-snug py-1 transition-all duration-200 border-l-2 ${
              level === 2 ? 'pl-3' : level === 3 ? 'pl-5 text-xs' : 'pl-7 text-xs'
            } ${
              activeId === id
                ? 'border-blue-500 text-blue-600 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {text}
          </a>
        ))}
      </nav>
    </div>
  )
}
