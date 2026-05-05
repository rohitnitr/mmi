import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy – MatchMyInterview',
  description: 'MatchMyInterview refund policy for coffee credits. Learn when credits are auto-refunded and when purchases are non-refundable.',
  keywords: 'MatchMyInterview refund, coffee credit refund, mock interview refund policy',
}

export default function RefundPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Refund Policy</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: May 5, 2025 | Last Updated: May 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        At MatchMyInterview, our coffee credit system is designed to be fair and transparent. This policy explains when credits are automatically refunded and when purchases are non-refundable.
      </p>

      <section style={{ marginBottom: 32, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 14, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>☕ Coffee Credit Refunds</h2>
        <ul style={{ fontSize: 15, color: '#92400e', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li>
            <strong>Auto-refund (invite not accepted):</strong> If a peer does not accept your coffee invite within <strong>24 hours</strong>, the coffee credit is automatically refunded to your account. No action needed on your part.
          </li>
          <li>
            <strong>Non-refundable (invite accepted):</strong> If the peer accepts your invite and a mock interview session begins, the coffee credit is considered consumed and is non-refundable.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Purchase Refunds</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>All purchases of coffee credit packs are <strong>non-refundable once completed</strong>.</li>
          <li>Refunds will <strong>not</strong> be issued for unused credits remaining in your account.</li>
          <li>In exceptional circumstances (e.g., duplicate charges, billing errors), please contact us within 14 days of the transaction.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Exceptional Circumstances</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>We will review refund requests on a case-by-case basis for:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>A verified technical failure on our platform that prevented a session</li>
          <li>Duplicate charges or billing errors</li>
          <li>Accidental purchases made in error</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          For such cases, contact us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> within 14 days with your registered email and transaction details.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>How to Request a Refund</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>
          Email us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with:
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Your registered email address</li>
          <li>Date and amount of the purchase</li>
          <li>Reason for your refund request</li>
          <li>Any supporting screenshots or details</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We will review and respond within 5 business days. Approved refunds will be credited to your original payment method within 7–10 business days.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Changes to This Policy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We reserve the right to update this Refund Policy at any time. Changes will be posted on this page with a revised effective date.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Contact Us</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          📧 Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a><br />
          🌐 Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </main>
  )
}
