'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import './blog.css'

export function CategoryTabs({ categories, activeCategory }: { categories: { category: string; count: number }[]; activeCategory?: string }) {
  const pathname = usePathname()
  const all = [{ category: 'All', count: categories.reduce((s, c) => s + c.count, 0) }, ...categories]
  return (
    <nav className="bl-tabs" aria-label="Blog categories">
      {all.map(({ category, count }) => {
        const isAll = category === 'All'
        const href = isAll ? '/blog' : `/blog/category/${encodeURIComponent(category)}`
        const active = isAll ? !activeCategory && pathname === '/blog' : activeCategory === category
        return (
          <Link key={category} href={href} className={`bl-tab${active ? ' on' : ''}`} aria-current={active ? 'page' : undefined}>
            {category}<small>{count}</small>
          </Link>
        )
      })}
    </nav>
  )
}
