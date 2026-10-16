import type { Metadata } from 'next'
import Link from 'next/link'
import LegalShell from '@/components/marketing/LegalShell'
import { GUIDES } from '@/lib/guides'

export const metadata: Metadata = {
  title: 'Interview Guides',
  description: 'Free guides on mock interviews, peer feedback, and building an evidence-based interview portfolio.',
  alternates: { canonical: '/guides' },
}

export default function GuidesPage() {
  return (
    <LegalShell title="Guides">
      <h1>Interview guides</h1>
      <p>
        Original, practical writing for people who want live interview practice. These pages are educational.
        They are not a promise of a job.
      </p>
      <ul style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} style={{ fontWeight: 700, color: '#1D4ED8' }}>{g.title}</Link>
            <p>{g.description}</p>
          </li>
        ))}
      </ul>
    </LegalShell>
  )
}
