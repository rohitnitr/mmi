export function GlobalBlogFooter() {
  return (
    <footer className="footer" style={{ borderTop: 'none', background: 'transparent', width: '100%', maxWidth: '1240px', margin: '40px auto 0' }}>
      <div className="container footer-inner" style={{ padding: '0' }}>
        <div className="footer-brand">
          <span className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo.png" alt="MatchMyInterview logo" style={{ width: 28, height: 28, borderRadius: 6 }} /> 
            MatchMyInterview
          </span>
          <span className="footer-note">The premium mock interview platform for ambitious candidates.</span>
          
          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <a href="https://twitter.com/matchmyinterview" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-500)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a href="https://linkedin.com/company/matchmyinterview" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-500)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://instagram.com/matchmyinterview" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-500)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/@matchmyinterview" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--gray-500)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
            </a>
          </div>
        </div>
        <nav className="footer-links">
          <a href="/about">About</a>
          <a href="/contact">Contact</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/sitemap.xml">Sitemap</a>
        </nav>
      </div>
      <div className="container" style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--gray-400)', padding: '0' }}>
        &copy; {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </footer>
  )
}
