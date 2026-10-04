'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'
import './blog.css'
import { BlogCard } from './BlogCard'

export function BlogSidebar({ tags, popularPosts, activeTag, hideCTA }: {
  tags: { tag: string; count: number }[]
  popularPosts: BlogPost[]
  activeTag?: string
  hideCTA?: boolean
}) {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    try {
      const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, company }) })
      if (res.ok) return setState('done')
      const j = (await res.json().catch(() => ({}))) as { error?: string }
      setError(j.error ?? 'Something went wrong. Please try again.')
    } catch {
      setError('Network problem. Please try again.')
    }
    setState('error')
  }

  return (
    <aside className="bl-side">
      {popularPosts.length > 0 && (
        <div className="bl-box">
          <h3>Popular right now</h3>
          <div className="bl-pop">{popularPosts.map((p) => <BlogCard key={p.slug} post={p} variant="compact" />)}</div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="bl-box">
          <h3>Topics</h3>
          <div className="bl-topics">
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`} className={`bl-topic${activeTag === tag ? ' on' : ''}`}>
                #{tag}<i>{count}</i>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bl-news">
        <h3 style={{ margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#60A5FA' }}>Newsletter</h3>
        <h4>Interview tips, in your inbox</h4>
        <p>New articles from the MMI blog. We only use your email for this.</p>
        {state === 'done' ? (
          <div className="bl-ok"><CheckCircle2 size={15} style={{ verticalAlign: -3, marginRight: 6 }} aria-hidden="true" />You are on the list.</div>
        ) : (
          <form onSubmit={submit}>
            <input className="bl-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required aria-label="Email address" suppressHydrationWarning />
            <input className="bl-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={company} onChange={(e) => setCompany(e.target.value)} name="company" />
            <button className="bl-btn" type="submit" disabled={state === 'loading'}>{state === 'loading' ? 'Subscribing…' : 'Subscribe'}</button>
            {state === 'error' && <p className="bl-err" role="alert">{error}</p>}
          </form>
        )}
      </div>

      {!hideCTA && (
        <div className="bl-promo">
          <b>Turn practice into proof</b>
          <p>Interview real peers, get structured feedback, and build a portfolio of evidence.</p>
          <Link href="/">Build My Portfolio</Link>
        </div>
      )}
    </aside>
  )
}
