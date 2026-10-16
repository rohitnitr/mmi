import Link from 'next/link'
import LegalShell from '@/components/marketing/LegalShell'

export default function NotFound() {
  return (
    <LegalShell title="Page not found">
      <h1>This page is missing</h1>
      <p>The link may be old. Try the homepage, search, or the sitemap.</p>
      <p style={{ marginTop: 16 }}>
        <Link href="/">Home</Link> · <Link href="/search">Search</Link> · <Link href="/sitemap">Sitemap</Link> · <Link href="/contact">Contact</Link>
      </p>
    </LegalShell>
  )
}
