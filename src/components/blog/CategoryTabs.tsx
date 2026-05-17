'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function CategoryTabs({ categories, activeCategory }: {
  categories: { category: string; count: number }[]
  activeCategory?: string
}) {
  const pathname = usePathname()
  const all = [
    { category: 'All', count: categories.reduce((s, c) => s + c.count, 0) },
    ...categories,
  ]

  return (
    <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      {all.map(({ category, count }) => {
        const isAll = category === 'All'
        const href = isAll ? '/blog' : `/blog/category/${encodeURIComponent(category)}`
        const active = isAll ? !activeCategory && pathname === '/blog' : activeCategory === category

        return (
          <Link
            key={category}
            href={href}
            className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold whitespace-nowrap transition-all duration-200 px-3.5 py-1.5"
            style={{
              borderRadius: '8px',
              background: active ? '#2563EB' : 'transparent',
              color: active ? '#FFFFFF' : '#64748B',
              boxShadow: active ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
            }}
          >
            {category}
            <span style={{ color: active ? 'rgba(191,219,254,0.8)' : '#CBD5E1', fontSize: '11px', fontWeight: 400 }}>
              {count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
