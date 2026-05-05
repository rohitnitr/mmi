import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact Us – MatchMyInterview',
  description:
    'Get in touch with MatchMyInterview. For support, feedback, or billing queries, email us at support@matchmyinterview.com. We respond within 24–48 hours.',
  keywords: 'MatchMyInterview contact, support, feedback, mock interview help',
  openGraph: {
    title: 'Contact MatchMyInterview',
    description: 'Reach out to our support team. We respond within 24–48 hours.',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Contact Us</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>We're here to help — reach us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a></p>

      <section style={{ marginBottom: 32, background: '#f4f4f5', borderRadius: 14, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>📧 Email Support</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          The primary way to reach us is via email:<br /><br />
          <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b', fontWeight: 700, fontSize: 16 }}>support@matchmyinterview.com</a>
        </p>
        <p style={{ fontSize: 13, color: '#71717a', marginTop: 10 }}>
          We aim to respond to all queries within <strong>24–48 hours</strong>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>What Can We Help You With?</h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>General Inquiries</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Questions about how MatchMyInterview works, the coffee credit system, or getting started? Email us and we'll help you out.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Technical Support</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Experiencing a bug, login issue, or a problem with your mock interview session? Write to us with a brief description of the issue and your registered email address. We aim to resolve technical issues within 24–48 hours.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Coffee Credits &amp; Billing</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          For questions about coffee credit purchases, refunds, or billing, please email us with your registered email and transaction details. See our <a href="/refund" style={{ color: '#18181b' }}>Refund Policy</a> for full details.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Feedback &amp; Suggestions</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Your feedback makes MatchMyInterview better. If you have a feature request or want to share your experience, we genuinely want to hear from you.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Partnership &amp; Business Inquiries</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          If you are a business, university, coaching institute, or HR platform looking to partner with MatchMyInterview, reach out with the subject line <em>"Partnership Inquiry."</em>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Response Times</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>General inquiries:</strong> Within 1–2 business days</li>
          <li><strong>Technical support:</strong> Within 24–48 hours</li>
          <li><strong>Billing &amp; credit queries:</strong> Within 1–2 business days</li>
          <li><strong>Partnership inquiries:</strong> Within 3–5 business days</li>
        </ul>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </main>
  )
}
