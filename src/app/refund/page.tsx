import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy – MatchMyInterview',
  description: 'MatchMyInterview refund and cancellation policy for coffee credit purchases.',
}

export default function RefundPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Refund & Cancellation Policy</h1>
      <p style={{ fontSize: 13, color: '#71717a', marginBottom: 32 }}>Last updated: May 3, 2026</p>

      {[
        { h: 'Coffee Credits', p: 'Coffee credits purchased on MatchMyInterview are generally non-refundable once used to initiate a peer session. Unused credits may be eligible for a refund within 7 days of purchase.' },
        { h: 'How to Request a Refund', p: 'Email refunds@matchmyinterview.in with your registered email address, the transaction ID (available in your payment confirmation), and the reason for the refund request. We will process eligible requests within 5-7 business days.' },
        { h: 'Payment Gateway Fees', p: 'Original payment gateway processing fees are non-refundable. Refunds will be credited back to the original payment method minus any applicable processing fees.' },
        { h: 'Failed Transactions', p: 'If a payment was deducted but credits were not added to your account, please contact us immediately at support@matchmyinterview.in with your transaction reference. We will resolve this within 24 hours.' },
        { h: 'Disputes', p: 'For payment disputes, contact us before raising a chargeback with your bank. Most issues are resolved quickly through direct contact.' },
        { h: 'Contact', p: 'Refund requests: refunds@matchmyinterview.in | General support: support@matchmyinterview.in' },
      ].map(s => (
        <section key={s.h} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.h}</h2>
          <p style={{ fontSize: 15, color: '#3f3f46' }}>{s.p}</p>
        </section>
      ))}
    </main>
  )
}
