import type { Metadata } from 'next'
import Link from 'next/link'
import LegalShell from '@/components/marketing/LegalShell'
import { getPosts } from '@/lib/blog'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search MatchMyInterview guides and interview blog posts.',
  alternates: { canonical: '/search' },
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: raw } = await searchParams
  const q = (raw || '').trim()
  const needle = q.toLowerCase()

  const posts = needle ? await getPosts() : []
  const blogHits = posts.filter((p) =>
    [p.title, p.excerpt, p.category, ...(p.tags || [])].join(' ').toLowerCase().includes(needle)
  )
  const guideHits = needle
    ? GUIDES.filter((g) => `${g.title} ${g.description} ${g.body.join(' ')}`.toLowerCase().includes(needle))
    : GUIDES

  return (
    <LegalShell title="Search">
      <h1>Search</h1>
      <form action="/search" method="get" role="search" className="mh-form">
        <label htmlFor="q">Find guides and articles</label>
        <input id="q" name="q" type="search" defaultValue={q} placeholder="Try mock interview, feedback, SQL…" />
        <button className="mh-btn mh-btn-primary" type="submit">Search</button>
      </form>

      {q && (
        <p style={{ marginTop: 20 }}>
          Results for “{q}”: {guideHits.length + blogHits.length} found
        </p>
      )}

      <section style={{ marginTop: 28 }}>
        <h2>Guides</h2>
        <ul>
          {guideHits.map((g) => (
            <li key={g.slug} style={{ marginBottom: 12 }}>
              <Link href={`/guides/${g.slug}`}>{g.title}</Link>
              <p>{g.description}</p>
            </li>
          ))}
        </ul>
      </section>

      {q && (
        <section style={{ marginTop: 28 }}>
          <h2>Blog</h2>
          {blogHits.length === 0 ? <p>No blog matches.</p> : (
            <ul>
              {blogHits.map((p) => (
                <li key={p.slug} style={{ marginBottom: 12 }}>
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                  <p>{p.excerpt}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </LegalShell>
  )
}
