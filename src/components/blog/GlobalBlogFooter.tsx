import Link from 'next/link'
import { Logo } from '@/components/marketing/Brand'
import './blog.css'

const social = [
  { href: 'https://twitter.com/matchmyintervew', label: 'X (Twitter)', d: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z', fill: true },
  { href: 'https://linkedin.com/company/matchmyinterview', label: 'LinkedIn', d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z' },
  { href: 'https://instagram.com/matchmyinterview', label: 'Instagram', d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm5.5-2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z' },
  { href: 'https://youtube.com/@matchmyinterview', label: 'YouTube', d: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l5.75 3.27z' },
]

export function GlobalBlogFooter() {
  return (
    <footer className="bl-footer">
      <div className="bl-fgrid">
        <div>
          <Logo light />
          <p>Build your professional portfolio through real peer interviews, structured feedback, and evidence of what you can actually do.</p>
          <div className="bl-soc">
            {social.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={s.d} /></svg>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4>Explore</h4>
          <Link className="l" href="/">Home</Link>
          <Link className="l" href="/blog">Blog</Link>
          <Link className="l" href="/about">About</Link>
          <Link className="l" href="/contact">Contact</Link>
        </div>
        <div>
          <h4>Legal</h4>
          <Link className="l" href="/privacy">Privacy</Link>
          <Link className="l" href="/terms">Terms</Link>
          <Link className="l" href="/cookies">Cookies</Link>
          <a className="l" href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
      <div className="bl-copy">
        <span>&copy; {new Date().getFullYear()} MatchMyInterview. All rights reserved.</span>
        <a href="https://www.betterlaunch.co" target="_blank" rel="noopener noreferrer">Featured on Better Launch</a>
      </div>
    </footer>
  )
}
