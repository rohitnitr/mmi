import Link from 'next/link'
import { Logo } from './Brand'

const links = [
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/cookies', label: 'Cookies' },
  { href: '/refund', label: 'Refunds' },
]

export default function MarketingFooter() {
  return (
    <footer className="mh-footer">
      <div className="mh-wrap mh-foot-in">
        <div><Logo light /><p style={{ fontSize: 14, marginTop: 8 }}>&copy; MatchMyInterview. Built in India.</p></div>
        <nav aria-label="Footer" className="mh-foot-links">
          {links.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
        </nav>
      </div>
    </footer>
  )
}
