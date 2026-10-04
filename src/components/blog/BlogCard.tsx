import Link from 'next/link'
import { ArrowUpRight, Clock } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'
import './blog.css'
import { catTheme, fmtDate } from './blog-theme'

export function BlogCard({ post, variant = 'default' }: { post: BlogPost; variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="bl-compact">
        <div>
          <p>{post.title}</p>
          <small><Clock size={11} aria-hidden="true" />{post.read_time} min read</small>
        </div>
      </Link>
    )
  }

  const t = catTheme(post.category)
  const tags = (post.tags ?? []).slice(0, 2)
  return (
    <Link href={`/blog/${post.slug}`} className="bl-card" style={{ animationDelay: `${(post.slug.length % 5) * 70}ms` }}>
      <div className="bl-cover">
        {post.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image} alt={post.title} loading="lazy" />
        ) : (
          <div className="bl-fallback" style={{ background: `linear-gradient(135deg,${t.from},${t.to})` }}><span>{t.emoji}</span></div>
        )}
        <span className="bl-chip" style={{ background: t.bg, color: t.fg }}>{post.category}</span>
        {post.read_time ? <span className="bl-time"><Clock size={11} aria-hidden="true" />{post.read_time} min</span> : null}
      </div>
      <div className="bl-body">
        {tags.length > 0 && <p className="bl-tags">{tags.map((x) => `#${x}`).join(' · ')}</p>}
        <h3 className="bl-title">{post.title}</h3>
        <p className="bl-excerpt">{post.excerpt}</p>
        <div className="bl-foot">
          <span>{fmtDate(post.published_at)}</span>
          <span className="bl-more">Read <ArrowUpRight size={13} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  )
}
