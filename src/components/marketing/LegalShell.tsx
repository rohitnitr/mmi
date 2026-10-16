import Link from 'next/link'
import MarketingChrome from './MarketingChrome'

export default function LegalShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <MarketingChrome>
      <main className="mh-legal">
        <nav className="mh-crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> / </span>
          <span>{title}</span>
        </nav>
        {children}
      </main>
    </MarketingChrome>
  )
}
