import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BlogPost } from '@/lib/blog'

const GRADIENTS = [
  'linear-gradient(135deg,#1E3A5F,#2563EB)',
  'linear-gradient(135deg,#1E1B4B,#3730A3)',
  'linear-gradient(135deg,#134E4A,#0F766E)',
]

function fmt(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function BlogHero({ post }: { post: BlogPost }) {
  const grad = GRADIENTS[post.slug.length % GRADIENTS.length]

  return (
    <Link href={`/blog/${post.slug}`} className="group block w-full">
      <article
        className="relative overflow-hidden w-full transition-all duration-500 group-hover:-translate-y-0.5"
        style={{
          borderRadius: '12px',
          minHeight: '420px',
          display: 'flex',
          alignItems: 'flex-end',
          boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
        }}
      >
        {/* Background */}
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: grad }} />
        )}

        {/* Gradient overlay — strong at bottom, light at top */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.4) 50%,rgba(0,0,0,0.05) 100%)' }} />

        {/* Content */}
        <div className="relative z-10 w-full p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className="text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5"
              style={{ color: '#93C5FD', background: 'rgba(37,99,235,0.25)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '20px' }}
            >
              ⭐ Featured
            </span>
            <span
              className="text-[10px] font-semibold px-2.5 py-1.5"
              style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px' }}
            >
              {post.category}
            </span>
          </div>

          <h2
            className="font-extrabold leading-tight tracking-tight mb-3 transition-colors duration-300 group-hover:text-blue-100"
            style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', color: '#FFFFFF', maxWidth: '700px' }}
          >
            {post.title}
          </h2>

          <p className="text-sm sm:text-base leading-relaxed mb-7 line-clamp-2" style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '560px' }}>
            {post.excerpt}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <span>{fmt(post.published_at)}</span>
              {post.read_time > 0 && <><span>·</span><span>{post.read_time} min read</span></>}
            </div>
            <span
              className="flex items-center gap-2 text-sm font-bold transition-all duration-300 group-hover:gap-3"
              style={{ color: '#93C5FD', border: '1px solid rgba(37,99,235,0.35)', background: 'rgba(37,99,235,0.2)', padding: '8px 18px', borderRadius: '20px' }}
            >
              Read article <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
