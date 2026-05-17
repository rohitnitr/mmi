import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { getPostBySlug, getPosts, getRelatedPosts, getAllTags } from '@/lib/blog'
import { BlogCTA } from '@/components/blog/BlogCTA'
import { RelatedPosts } from '@/components/blog/RelatedPosts'
import { ShareButtons } from '@/components/blog/ShareButtons'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { ViewCounter } from '@/components/blog/ViewCounter'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { GlobalBlogFooter } from '@/components/blog/GlobalBlogFooter'

export const revalidate = 60

export async function generateStaticParams() {
  return (await getPosts()).map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}
  const img = post.cover_image || '/og-image.jpg'
  return {
    title: `${post.title} | MatchMyInterview Blog`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title, description: post.excerpt, type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: [post.author],
      url: `https://matchmyinterview.com/blog/${post.slug}`,
      images: [{ url: img, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [img] },
    alternates: { canonical: `/blog/${post.slug}` },
  }
}

function fmt(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [post, tags] = await Promise.all([getPostBySlug(slug), getAllTags()])
  if (!post) notFound()

  const related = await getRelatedPosts(post.slug, post.category, post.tags)

  return (
    <div className="min-h-screen" style={{ background: '#F1F5F9', padding: 'min(8vw, 80px) min(4vw, 40px) 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ReadingProgress />
      <ViewCounter slug={post.slug} />

      {/* BOXED CONTAINER (The actual "App" window) */}
      <div className="bg-white shadow-2xl overflow-hidden flex flex-col relative" style={{ width: '100%', maxWidth: '1240px', margin: '0 auto', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>

        {/* ── ARTICLE HEADER ─────────────────────────────── */}
        <header style={{ background: '#0F172A', padding: 'min(6vw, 64px) min(5vw, 56px)', width: '100%', position: 'relative', overflow: 'hidden' }}>
          {/* Dim cover as texture */}
          {post.cover_image && (
            <>
              <img src={post.cover_image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.1 }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(15,23,42,0.6), #0F172A)' }} />
            </>
          )}
          <div className="absolute top-0 left-1/3 w-80 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse,rgba(37,99,235,0.1),transparent 70%)' }} />

          <div className="relative">
            {/* Breadcrumb */}
            <nav style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '24px', color: '#64748B' }}>
              <Link href="/" className="hover:text-white transition-colors" style={{ display: 'inline-block' }}>Home</Link>
              <span style={{ color: '#334155' }}>›</span>
              <Link href="/blog" className="hover:text-white transition-colors" style={{ display: 'inline-block' }}>Blog</Link>
              <span style={{ color: '#334155' }}>›</span>
              <Link href={`/blog/category/${encodeURIComponent(post.category)}`} className="transition-colors hover:text-blue-300" style={{ color: '#60A5FA', display: 'inline-block' }}>
                {post.category}
              </Link>
            </nav>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
                {post.tags.map(t => (
                  <Link key={t} href={`/blog/tag/${encodeURIComponent(t)}`}
                    style={{ fontSize: '12px', fontWeight: 600, padding: '4px 12px', color: '#93C5FD', background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '6px', whiteSpace: 'nowrap', display: 'inline-block' }}>
                    #{t}
                  </Link>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="font-extrabold leading-tight tracking-tight mb-5"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#FFFFFF', maxWidth: '900px', paddingRight: '20px' }}>
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-base sm:text-lg leading-relaxed mb-8" style={{ color: '#94A3B8', maxWidth: '750px', paddingRight: '20px' }}>
              {post.excerpt}
            </p>

            {/* Author row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold', background: 'linear-gradient(135deg,#2563EB,#4338CA)', boxShadow: '0 2px 8px rgba(37,99,235,0.4)', flexShrink: 0 }}>
                  {post.author.slice(0, 2).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFFFFF', lineHeight: 1.2 }}>{post.author}</span>
                  <span style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{fmt(post.published_at)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>
                <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{post.read_time} min read</span>
                {post.views > 0 && <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>{post.views.toLocaleString()} views</span>}
              </div>
            </div>
          </div>
        </header>

        {/* ── ARTICLE BODY ───────────────────────────────── */}
        <div style={{ padding: 'min(6vw, 56px)', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-10 xl:gap-16">

            {/* Main content */}
            <div style={{ width: '100%', maxWidth: '820px', margin: '0 auto' }}>
              <article
                className="blog-prose prose prose-lg max-w-none
                  prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-gray-900 prose-headings:scroll-mt-24
                  prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-100
                  prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-[1.9] prose-p:my-6
                  prose-a:text-blue-600 prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-blue-200 hover:prose-a:border-blue-500 prose-a:transition-colors
                  prose-strong:text-gray-900 prose-strong:font-bold
                  prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-5 prose-blockquote:px-7 prose-blockquote:my-8 prose-blockquote:rounded-r-lg
                  prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-semibold prose-code:before:content-none prose-code:after:content-none
                  prose-pre:bg-[#0F172A] prose-pre:rounded-xl prose-pre:shadow-lg prose-pre:border prose-pre:border-white/5 prose-pre:my-8 prose-pre:p-5
                  prose-img:rounded-xl prose-img:shadow-md prose-img:my-8
                  prose-ul:space-y-2 prose-ol:space-y-2 prose-li:text-gray-700 prose-li:leading-[1.9]
                  prose-hr:border-gray-100 prose-hr:my-12"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Share */}
              <div style={{ marginTop: '56px', paddingTop: '32px', borderTop: '1px solid #E2E8F0' }}>
                <p style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94A3B8', marginBottom: '20px' }}>Share this article</p>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '32px' }}>
                  {post.tags.map(t => (
                    <Link key={t} href={`/blog/tag/${encodeURIComponent(t)}`}
                      style={{ fontSize: '13px', fontWeight: 600, padding: '6px 14px', color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', display: 'inline-block', whiteSpace: 'nowrap' }}>
                      #{t}
                    </Link>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div style={{ marginTop: '64px' }}><BlogCTA /></div>

              {/* Related */}
              <RelatedPosts posts={related} />
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <div className="sticky top-10 space-y-6">
                <TableOfContents content={post.content} />
                <BlogSidebar tags={tags} popularPosts={[]} />
              </div>
            </div>
          </div>
        </div>

      </div>

      <GlobalBlogFooter />
    </div>
  )
}
