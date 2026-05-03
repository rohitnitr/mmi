import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us – MatchMyInterview',
  description: 'Get in touch with the MatchMyInterview team for support, refunds, or partnership enquiries.',
}

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Contact Us</h1>
      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>We typically respond within 1 business day.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { label: 'General Enquiries', email: 'hello@matchmyinterview.in' },
          { label: 'Support & Account Issues', email: 'support@matchmyinterview.in' },
          { label: 'Payment & Refunds', email: 'refunds@matchmyinterview.in' },
          { label: 'Privacy & Data Requests', email: 'privacy@matchmyinterview.in' },
          { label: 'Legal & Partnerships', email: 'legal@matchmyinterview.in' },
        ].map(c => (
          <div key={c.email} style={{ background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{c.label}</p>
            <a href={`mailto:${c.email}`} style={{ fontSize: 15, fontWeight: 600, color: '#18181b', textDecoration: 'none' }}>{c.email}</a>
          </div>
        ))}
      </div>
    </main>
  )
}
