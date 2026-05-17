import Link from 'next/link'
import { BlogPost } from '@/lib/blog'

const GRAD = [
  'linear-gradient(135deg,#2563EB,#4338CA)',
  'linear-gradient(135deg,#7C3AED,#DB2777)',
  'linear-gradient(135deg,#059669,#0891B2)',
  'linear-gradient(135deg,#D97706,#DC2626)',
]

function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : ''
}

export function RelatedPosts({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null
  return (
    <section className="mt-16 pt-10" style={{ borderTop: '1px solid #E2E8F0' }}>
      <div className="flex items-center gap-3 mb-7">
        <div className="h-px flex-1" style={{ background: '#E2E8F0' }} />
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#94A3B8' }}>Continue Reading</h2>
        <div className="h-px flex-1" style={{ background: '#E2E8F0' }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <article className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(37,99,235,0.12)'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#BFDBFE'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'
              }}
            >
              <div className="relative h-32 overflow-hidden">
                {post.cover_image
                  ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                  : <div className="w-full h-full" style={{ background: GRAD[i % GRAD.length] }} />}
                <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151', borderRadius: '4px' }}>
                  {post.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-bold leading-snug line-clamp-2 mb-2 transition-colors group-hover:text-blue-600" style={{ color: '#111827' }}>{post.title}</h3>
                <p className="text-xs" style={{ color: '#94A3B8' }}>{fmt(post.published_at)} · {post.read_time} min</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
