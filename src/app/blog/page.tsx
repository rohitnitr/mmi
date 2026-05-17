import { Metadata } from 'next'
import Link from 'next/link'
import { getPosts, getAllCategories, getAllTags } from '@/lib/blog'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { CategoryTabs } from '@/components/blog/CategoryTabs'
import { GlobalBlogFooter } from '@/components/blog/GlobalBlogFooter'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'The Interview Playbook | MatchMyInterview Blog',
  description: 'Expert interview tips, resume guides, and career strategies to help you land your dream job.',
  openGraph: {
    title: 'The Interview Playbook',
    description: 'Expert interview tips, resume guides, and career strategies.',
    url: 'https://matchmyinterview.com/blog',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  alternates: { canonical: '/blog' },
}

const PER_PAGE = 9

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: p } = await searchParams
  const page = Math.max(1, parseInt(p || '1'))

  const [all, categories, tags] = await Promise.all([
    getPosts(),
    getAllCategories(),
    getAllTags(),
  ])

  const featured = all[0]
  const rest = all.slice(1)
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE))
  const paged = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const popular = [...all].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    /* OUTER PAGE BACKGROUND (Provides margins on all sides) */
    <div className="min-h-screen" style={{ background: '#F1F5F9', padding: 'min(8vw, 80px) min(4vw, 40px) 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* BOXED CONTAINER (The actual "App" window) */}
      <div className="bg-white shadow-2xl overflow-hidden flex flex-col relative" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>

        {/* ━━━ HERO ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section style={{ background: '#0F172A', padding: 'min(7vw, 80px) min(5vw, 56px)', width: '100%', position: 'relative', overflow: 'hidden' }}>
          {/* Dot grid overlay */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }} />
          {/* Ambient glows */}
          <div className="absolute top-0 left-1/4 w-96 h-72 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.2) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-72 h-60 pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

          <div className="relative">
            {/* Back link */}
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '32px', color: '#64748B', transition: 'color 0.2s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              MatchMyInterview
            </Link>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px', padding: '6px 12px', borderRadius: '6px', color: '#93C5FD', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.22)' }}>
              ✦ Interview Playbook
            </div>

            {/* Headline */}
            <h1 className="font-black tracking-tighter leading-[1.05] mb-6 text-white"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
              Land your<br />
              <span style={{ background: 'linear-gradient(90deg, #60A5FA, #A5F3FC)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                dream job.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg leading-relaxed mb-12" style={{ color: '#94A3B8', maxWidth: '440px' }}>
              Expert strategies, real interview tips, and career insights — written for ambitious candidates.
            </p>

            {/* Stats */}
            {all.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
                {[
                  { n: all.length, l: 'Articles' },
                  { n: categories.length, l: 'Topics' },
                  { n: all.reduce((s, post) => s + post.views, 0).toLocaleString(), l: 'Total Reads' },
                ].map(({ n, l }) => (
                  <div key={l} style={{ display: 'flex', flexDirection: 'column' }}>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2 }}>{n}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '4px' }}>{l}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ━━━ STICKY CATEGORY NAV ━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {categories.length > 0 && (
          <div className="sticky top-0 z-40"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '12px min(5vw, 56px)' }}>
              <CategoryTabs categories={categories} />
            </div>
          </div>
        )}

        {/* ━━━ MAIN CONTENT ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{ padding: 'min(5vw, 56px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', width: '100%' }}>

          {all.length === 0 ? (
            /* ── Empty State ── */
            <div style={{ padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', background: '#EFF6FF', border: '1px solid #BFDBFE', fontSize: '28px' }}>
                ✍️
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>No articles yet</h2>
              <p style={{ fontSize: '15px', marginBottom: '28px', color: '#6B7280' }}>The first article is coming soon. Check back shortly!</p>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', fontWeight: 'bold', padding: '12px 24px', fontSize: '14px', borderRadius: '10px', background: '#2563EB', transition: 'background-color 0.2s' }}>
                Explore Platform →
              </Link>
            </div>
          ) : (
            <>
              {/* ── Featured ── */}
              {featured && page === 1 && (
                <div style={{ paddingBottom: '48px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ height: '1px', flex: 1, background: '#F1F5F9' }} />
                    <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94A3B8', flexShrink: 0 }}>
                      Featured Article
                    </span>
                    <div style={{ height: '1px', flex: 1, background: '#F1F5F9' }} />
                  </div>
                  <BlogHero post={featured} />
                </div>
              )}

              {/* ── Section header ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <div style={{ height: '1px', flex: 1, background: '#F1F5F9' }} />
                <span style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#94A3B8', flexShrink: 0 }}>
                  {page === 1 ? 'Latest Articles' : `Page ${page} of ${totalPages}`}
                </span>
                <div style={{ height: '1px', flex: 1, background: '#F1F5F9' }} />
              </div>

              {/* ── Grid + Sidebar ── */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 xl:gap-14 pb-16">

                {/* Articles column */}
                <div>
                  {paged.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6">
                      {paged.map(post => <BlogCard key={post.slug} post={post} />)}
                    </div>
                  ) : (
                    <p style={{ fontSize: '15px', textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>
                      No articles on this page.
                    </p>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '40px' }}>
                      {page > 1 && (
                        <Link href={`/blog?page=${page - 1}`}
                          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#374151' }}>
                          ← Previous
                        </Link>
                      )}
                      <span style={{ fontSize: '13px', padding: '10px 16px', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#64748B', fontFamily: 'monospace' }}>
                        {page} / {totalPages}
                      </span>
                      {page < totalPages && (
                        <Link href={`/blog?page=${page + 1}`}
                          style={{ padding: '10px 20px', fontSize: '14px', fontWeight: 600, borderRadius: '8px', border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#374151' }}>
                          Next →
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block">
                  <div className="sticky top-24">
                    <BlogSidebar tags={tags} popularPosts={popular} hideCTA={true} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ━━━ BOTTOM CTA BANNER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          {all.length > 0 && (
            <div style={{ paddingBottom: '32px' }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '20px', padding: 'min(6vw, 48px) min(5vw, 48px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px', background: 'linear-gradient(135deg, #1D4ED8 0%, #4338CA 100%)' }}>
                {/* Dot texture */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }} />
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                  <p style={{ fontWeight: 900, fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', letterSpacing: '-0.02em', marginBottom: '8px', color: '#FFFFFF', lineHeight: 1.2 }}>
                    Turn reading into results.
                  </p>
                  <p style={{ fontSize: '15px', color: 'rgba(191,219,254,0.85)', lineHeight: 1.5 }}>
                    Practice with real peers on MatchMyInterview — 100% free, forever.
                  </p>
                </div>
                <Link href="/"
                  style={{ position: 'relative', flexShrink: 0, fontWeight: 700, padding: '14px 28px', borderRadius: '10px', fontSize: '15px', whiteSpace: 'nowrap', background: '#FFFFFF', color: '#1D4ED8', boxShadow: '0 4px 14px rgba(0,0,0,0.15)', display: 'inline-block' }}>
                  Start Practicing →
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ━━━ GLOBAL FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <GlobalBlogFooter />
    </div>
  )
}
