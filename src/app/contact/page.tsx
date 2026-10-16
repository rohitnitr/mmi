import type { Metadata } from 'next'
import LegalShell from '@/components/marketing/LegalShell'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Contact MatchMyInterview for help with peer mock interviews, JEE mock tests, payments or feedback. Email matchmyinterview@gmail.com. We reply within 1 to 2 business days.',
  keywords: 'MatchMyInterview contact, support, JEE mock test help, feedback',
  openGraph: {
    title: 'Contact MatchMyInterview',
    description: 'Reach the MatchMyInterview team. We reply within 1 to 2 business days.',
    type: 'website',
  },
  alternates: { canonical: '/contact' },
}

const H2 = { fontSize: 20, fontWeight: 700, marginBottom: 12 } as const
const H3 = { fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 4 } as const
const P = { fontSize: 15, color: '#3f3f46', marginBottom: 16, lineHeight: 1.7 } as const
const EMAIL = 'matchmyinterview@gmail.com'

export default function ContactPage() {
  return (
    <LegalShell title="Contact">
      <h1>Contact Us</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>
        We are here to help. Write to us at <a href={`mailto:${EMAIL}`} style={{ color: '#18181b' }}>{EMAIL}</a>
      </p>

      <ContactForm />

      <section style={{ marginBottom: 32, background: '#f4f4f5', borderRadius: 14, padding: '20px 24px', marginTop: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>Email</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          The quickest way to reach us is by email:<br /><br />
          <a href={`mailto:${EMAIL}`} style={{ color: '#18181b', fontWeight: 700, fontSize: 16 }}>{EMAIL}</a>
        </p>
        <p style={{ fontSize: 13, color: '#71717a', marginTop: 10 }}>We reply to every message within <strong>1 to 2 business days</strong>.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>What can we help you with?</h2>

        <h3 style={H3}>Peer mock interviews</h3>
        <p style={P}>Trouble finding peers, sending a connection request, or joining a session? Tell us what happened and the email you signed up with.</p>

        <h3 style={H3}>JEE mock tests</h3>
        <p style={P}>
          A question that looks wrong, a test that would not load, or a score that does not add up? Send the name of the mock and the question number.
          If we find a mistake in a question or an answer key, we correct it and re-score affected results.
        </p>

        <h3 style={H3}>Payments and refunds</h3>
        <p style={P}>
          If you were charged but your mock did not unlock, include your registered email, the payment ID and the time of payment.
          See our <a href="/refund" style={{ color: '#18181b' }}>Refund Policy</a> for details.
        </p>

        <h3 style={H3}>Technical support</h3>
        <p style={P}>Login problems or bugs: describe the issue, your device and browser, and attach a screenshot if you can.</p>

        <h3 style={H3}>Feedback and suggestions</h3>
        <p style={P}>Your feedback shapes what we build next. We read every message.</p>

        <h3 style={H3}>Partnerships</h3>
        <p style={P}>Coaching institutes, colleges and educators are welcome to write with the subject line <em>Partnership enquiry</em>.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Response times</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.7 }}>
          <li><strong>General and technical questions:</strong> within 1 to 2 business days</li>
          <li><strong>Payment problems:</strong> within 1 to 2 business days</li>
          <li><strong>Partnership enquiries:</strong> within 3 to 5 business days</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={H2}>Grievance contact</h2>
        <p style={P}>For privacy or data requests, contact Rohit Poddar, founder, at <a href={`mailto:${EMAIL}`} style={{ color: '#18181b' }}>{EMAIL}</a>. See our <a href="/privacy" style={{ color: '#18181b' }}>Privacy Policy</a>.</p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </LegalShell>
  )
}
