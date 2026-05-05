import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – MatchMyInterview',
  description: 'Learn how MatchMyInterview collects, uses, and protects your personal information on our peer-to-peer mock interview platform.',
  keywords: 'MatchMyInterview privacy policy, data protection, personal information',
}

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: May 5, 2025 | Last Updated: May 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        At MatchMyInterview, we value your privacy and are committed to protecting your personal information.
        This Privacy Policy explains what data we collect, how we use it, and your rights as a user of our
        peer-to-peer mock interview platform at{' '}
        <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>matchmyinterview.com</a>.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Information We Collect</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>We may collect:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Name and email address</strong> — collected during registration</li>
          <li><strong>Profile information</strong> — experience level, domain, and target role for peer matching</li>
          <li><strong>Account activity</strong> — invites sent/received, connections, mock interview sessions</li>
          <li><strong>Payment-related information</strong> — processed securely via third-party providers; we do not store card details</li>
          <li><strong>Usage data and cookies</strong> — to improve our platform (see our <a href="/cookies" style={{ color: '#18181b' }}>Cookie Policy</a>)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. How We Use Your Information</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>We use your information to:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Provide and improve our services</li>
          <li>Enable peer matching and communication</li>
          <li>Manage coffee credit transactions and balances</li>
          <li>Process transactions and refunds</li>
          <li>Respond to user queries and support requests</li>
          <li>Detect fraud and ensure platform security</li>
          <li>Comply with legal obligations</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Data Sharing</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>
          <strong>We do not sell or rent your personal data.</strong> We may share data with:
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Payment processors</strong> — for secure transactions</li>
          <li><strong>Legal authorities</strong> — if required by law</li>
          <li><strong>Service providers</strong> — hosting and support tools bound by data agreements</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Data Security</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We implement reasonable security measures to protect your data, including encryption in transit (HTTPS) and secure data storage.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Your Rights</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>You can request:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Access to your data</li>
          <li>Correction of inaccurate data</li>
          <li>Deletion of your account</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          For any privacy concerns, contact: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a>
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Children&apos;s Privacy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          MatchMyInterview is not directed at children under 13. We do not knowingly collect personal data from minors. Contact us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> if you believe a minor has registered.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Changes to This Policy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may update this Privacy Policy from time to time. Material changes will be posted on this page with a revised effective date. Continued use of the platform after changes constitutes your acceptance.
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </main>
  )
}
