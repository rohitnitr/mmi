import type { Metadata } from 'next'
import Link from 'next/link'
import LegalShell from '@/components/marketing/LegalShell'
import { FOOTER_GROUPS } from '@/lib/site'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Sitemap',
  description: 'HTML sitemap of MatchMyInterview public pages, guides, and legal documents.',
  alternates: { canonical: '/sitemap' },
}

export default function HtmlSitemapPage() {
  return (
    <LegalShell title="Sitemap">
      <h1>Sitemap</h1>
      <p>All major public pages on MatchMyInterview.</p>
      {FOOTER_GROUPS.map((group) => (
        <section key={group.title} style={{ marginTop: 28 }}>
          <h2>{group.title}</h2>
          <ul>
            {group.links.map((l) => (
              <li key={l.href}><Link href={l.href}>{l.label}</Link></li>
            ))}
          </ul>
        </section>
      ))}
      <section style={{ marginTop: 28 }}>
        <h2>Guides</h2>
        <ul>
          {GUIDES.map((g) => (
            <li key={g.slug}><Link href={`/guides/${g.slug}`}>{g.title}</Link></li>
          ))}
        </ul>
      </section>
    </LegalShell>
  )
}
