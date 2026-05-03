import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy – MatchMyInterview',
  description: 'How MatchMyInterview uses cookies and similar tracking technologies.',
}

export default function CookiesPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Cookie Policy</h1>
      <p style={{ fontSize: 13, color: '#71717a', marginBottom: 32 }}>Last updated: May 3, 2026</p>

      {[
        { h: 'What Are Cookies', p: 'Cookies are small text files stored in your browser when you visit a website. They help the site remember your preferences and login state.' },
        { h: 'Essential Cookies', p: 'We use Supabase authentication cookies to keep you logged in. These are strictly necessary and cannot be disabled without logging you out.' },
        { h: 'Analytics Cookies', p: 'We may use Google Analytics or similar services to understand how users interact with our platform. These cookies collect anonymous usage data such as pages visited and time spent.' },
        { h: 'Advertising Cookies (Google AdSense)', p: 'We may display ads via Google AdSense. Google uses cookies to serve ads based on your prior visits to this and other websites. You can opt out via Google\'s Ad Settings at adssettings.google.com.' },
        { h: 'Managing Cookies', p: 'You can control cookies via your browser settings. Disabling essential cookies will prevent login functionality. Disabling analytics/advertising cookies will not affect core functionality.' },
        { h: 'Contact', p: 'Questions about our cookie use? Email privacy@matchmyinterview.in' },
      ].map(s => (
        <section key={s.h} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.h}</h2>
          <p style={{ fontSize: 15, color: '#3f3f46' }}>{s.p}</p>
        </section>
      ))}
    </main>
  )
}
