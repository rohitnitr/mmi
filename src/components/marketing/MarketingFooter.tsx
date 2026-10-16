import Link from 'next/link'
import { Logo } from './Brand'
import { FOOTER_GROUPS, SITE_EMAIL, SOCIAL_LINKS } from '@/lib/site'

export default function MarketingFooter() {
  return (
    <footer className="mh-footer">
      <div className="mh-wrap mh-foot-grid">
        <div>
          <Logo light />
          <p className="mh-foot-blurb">
            Peer mock interviews, structured feedback, and a professional portfolio built on evidence. Built in India.
          </p>
          <p className="mh-foot-blurb">
            Email: <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a>
          </p>
          <nav aria-label="Social media" className="mh-soc">
            {SOCIAL_LINKS.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">
                {s.label}
              </a>
            ))}
          </nav>
        </div>
        {FOOTER_GROUPS.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="mh-foot-h">{group.title}</p>
            {group.links.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="mh-wrap mh-foot-copy">
        <span>&copy; {new Date().getFullYear()} MatchMyInterview. All rights reserved.</span>
        <form action="/search" method="get" role="search" className="mh-foot-search">
          <label htmlFor="footer-search" className="sr-only">Search MatchMyInterview</label>
          <input id="footer-search" name="q" type="search" placeholder="Search guides and blog" />
          <button type="submit">Search</button>
        </form>
      </div>
    </footer>
  )
}
