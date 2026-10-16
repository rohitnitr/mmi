import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import LegalShell from '@/components/marketing/LegalShell'
import { GUIDES, getGuide } from '@/lib/guides'

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return { title: 'Guide' }
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    authors: [{ name: 'MatchMyInterview Team' }],
  }
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()

  const wordCount = guide.body.join(' ').split(/\s+/).length

  return (
    <LegalShell title={guide.title}>
      <article>
        <h1>{guide.title}</h1>
        <p style={{ color: '#71717a' }}>Updated {guide.updated} · {wordCount}+ words · By MatchMyInterview Team</p>
        {guide.body.map((p) => (
          <p key={p.slice(0, 24)} style={{ marginTop: 16 }}>{p}</p>
        ))}
      </article>
    </LegalShell>
  )
}
