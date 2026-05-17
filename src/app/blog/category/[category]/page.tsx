import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPosts, getAllCategories, getAllTags, CATEGORIES } from '@/lib/blog'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { CategoryTabs } from '@/components/blog/CategoryTabs'
import { GlobalBlogFooter } from '@/components/blog/GlobalBlogFooter'
import Link from 'next/link'

export const revalidate = 60

export async function generateStaticParams() {
  return CATEGORIES.map(category => ({ category: encodeURIComponent(category) }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await params
  const cat = decodeURIComponent(category)
  return {
    title: `${cat} Articles | MatchMyInterview Blog`,
    description: `Browse all ${cat} articles on MatchMyInterview — expert tips to help you prepare and succeed.`,
    alternates: { canonical: `/blog/category/${category}` },
  }
}

export default async function CategoryPage(
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params
  const cat = decodeURIComponent(category)
  if (!CATEGORIES.includes(cat)) notFound()

  const [posts, categories, tags] = await Promise.all([
    getPosts({ category: cat }),
    getAllCategories(),
    getAllTags(),
  ])

  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    /* OUTER PAGE BACKGROUND (Provides margins on all sides) */
    <div className="min-h-screen" style={{ background: '#F1F5F9', padding: 'min(8vw, 80px) min(4vw, 40px) 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* BOXED CONTAINER (The actual "App" window) */}
      <div className="bg-white shadow-2xl overflow-hidden flex flex-col relative min-h-[calc(100vh-4rem)]" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>

        {/* Header */}
        <div style={{ background: '#0F172A', padding: 'min(6vw, 64px) min(5vw, 56px)', width: '100%', position: 'relative', overflow: 'hidden' }} className="shrink-0">
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          <div className="relative">
            <Link href="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginBottom: '28px', color: '#64748B', transition: 'color 0.2s' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
              All Articles
            </Link>
            <h1 className="font-extrabold tracking-tight text-white mb-3" style={{ fontSize: 'clamp(2rem,5vw,3.5rem)' }}>
              {cat}
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B' }}>
              {posts.length} article{posts.length !== 1 ? 's' : ''} in this category
            </p>
          </div>
        </div>

        {/* Category tabs */}
        {categories.length > 0 && (
          <div className="sticky top-0 z-40"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #F1F5F9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ padding: '12px min(5vw, 56px)' }}>
              <CategoryTabs categories={categories} activeCategory={cat} />
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: 'min(5vw, 56px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] xl:grid-cols-[1fr_320px] gap-8 xl:gap-14">

            {/* Articles */}
            <div>
              {posts.length === 0 ? (
                <div style={{ padding: '80px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '48px', marginBottom: '16px' }}>📭</p>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>No articles yet in {cat}</h2>
                  <p style={{ fontSize: '15px', marginBottom: '24px', color: '#6B7280' }}>Check back soon or browse other categories.</p>
                  <Link href="/blog" style={{ fontSize: '15px', fontWeight: 600, color: '#2563EB' }}>← View all articles</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6">
                  {posts.map(post => <BlogCard key={post.slug} post={post} />)}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <BlogSidebar tags={tags} popularPosts={popularPosts} />
              </div>
            </div>
          </div>
        </div>

      </div>

      <GlobalBlogFooter />
    </div>
  )
}
