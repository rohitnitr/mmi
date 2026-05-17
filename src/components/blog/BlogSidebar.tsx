'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { BlogPost } from '@/lib/blog'
import { BlogCard } from './BlogCard'

export function BlogSidebar({ tags, popularPosts, activeTag, hideCTA }: {
  tags: { tag: string; count: number }[]
  popularPosts: BlogPost[]
  activeTag?: string
  hideCTA?: boolean
}) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    setDone(true)
    setLoading(false)
  }

  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Popular posts */}
      {popularPosts.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '18px' }}>
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
            🔥 Popular
          </h3>
          {popularPosts.map(p => <BlogCard key={p.slug} post={p} variant="compact" />)}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '18px' }}>
          <h3 className="text-[11px] font-black uppercase tracking-widest mb-3" style={{ color: '#94A3B8' }}>
            # Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/blog/tag/${encodeURIComponent(tag)}`}
                className="text-xs font-medium px-2.5 py-1 transition-colors duration-200"
                style={{
                  borderRadius: '6px',
                  border: `1px solid ${activeTag === tag ? '#BFDBFE' : '#E2E8F0'}`,
                  background: activeTag === tag ? '#EFF6FF' : '#F8FAFC',
                  color: activeTag === tag ? '#1D4ED8' : '#6B7280',
                }}
              >
                #{tag} <span style={{ color: '#CBD5E1', fontWeight: 400 }}>{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="relative overflow-hidden" style={{ background: '#0F172A', borderRadius: '10px', padding: '20px' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.2),transparent 70%)' }} />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-2" style={{ color: '#60A5FA' }}>Newsletter</p>
          <h4 className="text-sm font-bold mb-1" style={{ color: '#FFFFFF' }}>Never miss a tip</h4>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#64748B' }}>Expert interview advice, twice a month.</p>
          {done ? (
            <div className="flex items-center gap-2 text-sm font-bold px-3 py-2.5" style={{ color: '#34D399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '8px' }}>
              <CheckCircle2 size={14} /> Subscribed!
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-2">
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com" required suppressHydrationWarning
                className="w-full text-sm placeholder:text-gray-400 outline-none"
                style={{ background: '#FFFFFF', borderRadius: '8px', border: 'none', padding: '10px 14px', color: '#111827' }}
              />
              <button
                type="submit" disabled={loading}
                className="w-full text-sm font-bold transition-colors duration-200 disabled:opacity-60"
                style={{ background: '#2563EB', color: '#FFFFFF', borderRadius: '8px', border: 'none', cursor: loading ? 'wait' : 'pointer', padding: '10px 16px' }}
              >
                {loading ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Platform CTA */}
      {!hideCTA && (
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#2563EB,#4338CA)', borderRadius: '10px', padding: '18px' }}
        >
          <div className="relative">
            <p className="text-sm font-bold mb-1" style={{ color: '#FFFFFF' }}>Practice makes perfect</p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(191,219,254,0.8)' }}>Live mock interviews with real peers. Free forever.</p>
            <Link
              href="/"
              className="block text-center text-sm font-bold transition-colors duration-200"
              style={{ background: '#FFFFFF', color: '#2563EB', borderRadius: '8px', padding: '10px 16px' }}
            >
              Start Practicing →
            </Link>
          </div>
        </div>
      )}
    </aside>
  )
}
