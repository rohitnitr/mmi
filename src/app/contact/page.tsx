import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact – MatchMyInterview',
  description: 'Reach us anytime for questions, support, or feedback.',
}

export default function ContactPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Contact MatchMyInterview</h1>
      <p style={{ fontSize: 16, color: '#3f3f46', marginBottom: 32 }}>We're Here to Help. Reach us anytime at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a></p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        Have a question, need support, or want to share feedback? The MatchMyInterview team is ready to assist you. We are committed to responding to all inquiries promptly and ensuring you have the best experience on our platform.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Contact Information</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          The primary way to reach us is via email:<br />
          📧 Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a><br />
          🌐 Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>What Can We Help You With?</h2>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>General Inquiries</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          For any questions about MatchMyInterview, how the platform works, which plan suits you best, or anything else — email us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> and our team will get back to you.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Technical Support</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Experiencing a bug, a login issue, or a problem with your mock interview session? Write to us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with a brief description of the issue, the device/browser you are using, and your registered email address. We aim to resolve all technical issues within 24–48 hours.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Billing & Subscription Queries</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          For questions related to your subscription, billing cycle, charges, or refunds, email us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with your order or transaction reference. Please see our Refund Policy for complete information on refund eligibility.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Partnership & Business Inquiries</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          If you are a business, university, coaching institute, or HR platform looking to partner with MatchMyInterview, we would love to explore opportunities. Reach out to us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with the subject line "Partnership Inquiry."
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Press & Media</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          For press releases, media kits, or journalist inquiries, please email <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with the subject line "Media Inquiry."
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 }}>Feedback & Suggestions</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Your feedback makes MatchMyInterview better. If you have a feature request, a suggestion, or simply want to share your experience, we genuinely want to hear from you. Email us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Response Times</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>General inquiries:</strong> Within 1–2 business days</li>
          <li><strong>Technical support:</strong> Within 24–48 hours</li>
          <li><strong>Billing queries:</strong> Within 1–2 business days</li>
          <li><strong>Partnership inquiries:</strong> Within 3–5 business days</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Tips for a Faster Resolution</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>When reaching out, please include the following to help us assist you more quickly:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Your registered email address on MatchMyInterview</li>
          <li>A clear description of your question or issue</li>
          <li>Any relevant screenshots or error messages</li>
          <li>Your preferred resolution or outcome</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We are committed to making your MatchMyInterview experience smooth, productive, and rewarding. Thank you for trusting us with your interview preparation.
        </p>
      </section>
    </main>
  )
}
