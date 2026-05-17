import Link from 'next/link'
import { Clock, ArrowUpRight } from 'lucide-react'
import { BlogPost } from '@/lib/blog'

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  'Interview Tips':   { bg: 'rgba(239,246,255,1)', color: '#1D4ED8' },
  'Resume & CV':      { bg: 'rgba(245,243,255,1)', color: '#6D28D9' },
  'Behavioral & HR':  { bg: 'rgba(255,251,235,1)', color: '#B45309' },
  'Technical':        { bg: 'rgba(240,253,244,1)', color: '#15803D' },
  'Data Analytics':   { bg: 'rgba(236,254,255,1)', color: '#0E7490' },
  'Government Exams': { bg: 'rgba(254,242,242,1)', color: '#DC2626' },
  'Career Advice':    { bg: 'rgba(238,242,255,1)', color: '#4338CA' },
}

const GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#4F46E5)',
  'linear-gradient(135deg,#7C3AED,#DB2777)',
  'linear-gradient(135deg,#059669,#0891B2)',
  'linear-gradient(135deg,#D97706,#DC2626)',
  'linear-gradient(135deg,#E11D48,#9333EA)',
  'linear-gradient(135deg,#0284C7,#2563EB)',
]

function fmt(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export function BlogCard({ post, variant = 'default' }: { post: BlogPost; variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${post.slug}`} className="group flex items-start gap-3 py-3 border-b last:border-0" style={{ borderColor: '#F1F5F9' }}>
        <span className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 transition-colors duration-200 group-hover:bg-blue-500" style={{ background: '#CBD5E1' }} />
        <div>
          <p className="text-sm font-semibold leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-blue-600" style={{ color: '#1E293B' }}>
            {post.title}
          </p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#94A3B8' }}>
            <Clock size={10} />{post.read_time} min
          </p>
        </div>
      </Link>
    )
  }

  const cat = CAT_COLORS[post.category]
  const grad = GRADIENTS[post.slug.length % GRADIENTS.length]

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article
        className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px -8px rgba(37,99,235,0.15), 0 4px 12px rgba(0,0,0,0.08)'
          ;(e.currentTarget as HTMLElement).style.borderColor = '#BFDBFE'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
          ;(e.currentTarget as HTMLElement).style.borderColor = '#E2E8F0'
        }}
      >
        {/* Cover — fixed 16:9 */}
        <div className="relative overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/9' }}>
          {post.cover_image ? (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="w-full h-full" style={{ background: grad }} />
          )}
          {/* Category pill */}
          <span
            className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1"
            style={{
              ...cat,
              borderRadius: '6px',
              background: cat?.bg ?? '#F1F5F9',
              color: cat?.color ?? '#374151',
            }}
          >
            {post.category}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4">
          {post.tags.length > 0 && (
            <p className="text-[11px] font-medium mb-2" style={{ color: '#94A3B8' }}>
              {post.tags.slice(0, 2).map(t => `#${t}`).join(' · ')}
            </p>
          )}

          <h3 className="font-bold leading-snug tracking-tight line-clamp-2 mb-2 transition-colors duration-200 group-hover:text-blue-600"
            style={{ fontSize: '1rem', color: '#111827' }}>
            {post.title}
          </h3>

          <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-4" style={{ color: '#6B7280' }}>
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F8FAFC' }}>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>
              {fmt(post.published_at)}{post.read_time ? ` · ${post.read_time} min` : ''}
            </span>
            <span className="flex items-center gap-0.5 text-xs font-semibold opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" style={{ color: '#2563EB' }}>
              Read <ArrowUpRight size={12} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
