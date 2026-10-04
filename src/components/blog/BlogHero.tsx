import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'
import './blog.css'
import { catTheme, fmtDate } from './blog-theme'

export function BlogHero({ post }: { post: BlogPost }) {
  const t = catTheme(post.category)
  return (
    <Link href={`/blog/${post.slug}`} className="bl-hero">
      {post.cover_image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover_image} alt={post.title} loading="eager" />
      ) : (
        <div className="bl-hero-bg" style={{ background: `linear-gradient(135deg,${t.from},${t.to})` }} />
      )}
      <div className="bl-hero-shade" />
      <div className="bl-hero-in">
        <div className="bl-pills">
          <span className="bl-pill hot">✦ Featured</span>
          <span className="bl-pill">{post.category}</span>
        </div>
        <h2>{post.title}</h2>
        <p className="ex">{post.excerpt}</p>
        <div className="bl-hero-row">
          <div className="bl-meta">
            <span>{fmtDate(post.published_at, true)}</span>
            {post.read_time > 0 && <><span>·</span><span>{post.read_time} min read</span></>}
          </div>
          <span className="bl-read">Read article <ArrowRight size={16} aria-hidden="true" /></span>
        </div>
      </div>
    </Link>
  )
}
