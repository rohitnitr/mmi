import type { Metadata } from 'next'
import LegalShell from '@/components/marketing/LegalShell'

export const metadata: Metadata = {
  title: 'Refund and Cancellation Policy',
  description: 'When MatchMyInterview refunds a JEE mock test purchase, and how to ask. Finding and connecting with peers is free.',
  alternates: { canonical: '/refund' },
}

const H2 = { fontSize: 20, fontWeight: 700, marginBottom: 12 } as const
const P = { fontSize: 15, color: '#3f3f46', marginBottom: 12, lineHeight: 1.7 } as const
const UL = { fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.7 } as const
const SEC = { marginBottom: 32 } as const
const EMAIL = 'matchmyinterview@gmail.com'

export default function RefundPage() {
  return (
    <LegalShell title="Refund Policy">
      <h1>Refund and Cancellation Policy</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Last updated: October 2026</p>

      <section style={SEC}>
        <h2 style={H2}>What you pay for</h2>
        <p style={P}>
          Finding and connecting with peers on MatchMyInterview is free. Payments apply only to <strong>JEE mock tests</strong>, which are digital products.
          You pay per mock: the mock test, or the mock test with full analysis. One purchase gives you one sitting of that mock. There is no subscription and nothing renews.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>When we refund</h2>
        <ul style={UL}>
          <li><strong>Charged but not unlocked.</strong> You were charged and the mock did not unlock. We first try to fix the access. If we cannot, we refund in full.</li>
          <li><strong>Charged twice.</strong> A duplicate payment for the same item is refunded in full.</li>
          <li><strong>A fault on our side.</strong> If a technical fault on our platform stopped you from completing the test and getting your result, we will offer a free new sitting or a refund, whichever you prefer.</li>
        </ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>When a refund is not available</h2>
        <ul style={UL}>
          <li>Once you have started a test and it ran normally, because the digital content has been delivered.</li>
          <li>If you change your mind, or your score is lower than you hoped.</li>
          <li>Where a question or answer key was wrong. In that case we correct it and re-score your result instead.</li>
        </ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>Cancellation</h2>
        <p style={P}>Because access is delivered immediately, a purchase cannot be cancelled once it is paid, except in the cases listed above. Nothing renews automatically, so there is nothing to cancel later.</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>How to ask for a refund</h2>
        <p style={P}>
          Email <a href={`mailto:${EMAIL}`} style={{ color: '#18181b' }}>{EMAIL}</a> with your registered email address, the name of the mock, the payment ID and the date of payment.
          We reply within 1 to 2 business days. Approved refunds go back to the original payment method and usually reach you within 5 to 7 business days, depending on your bank.
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </LegalShell>
  )
}
