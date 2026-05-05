import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service – MatchMyInterview',
  description: 'Terms of Service for MatchMyInterview: rules governing coffee credits, peer invites, and platform usage for mock interview practice.',
  keywords: 'MatchMyInterview terms of service, coffee credits, platform rules',
}

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: May 5, 2025 | Last Updated: May 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        By using MatchMyInterview, you agree to the following terms. Please read them carefully before using our platform at{' '}
        <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>matchmyinterview.com</a>.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Platform Usage</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>You must use the platform only for mock interview practice purposes.</li>
          <li>Misuse, harassment, or inappropriate behavior toward other users is strictly prohibited.</li>
          <li>You must be at least 16 years of age to create an account.</li>
          <li>You agree to provide accurate information during registration and onboarding.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Coffee Credit System</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Coffee credits are required to send a mock interview invite to a peer.</li>
          <li><strong>1 coffee credit is deducted per invite sent.</strong></li>
          <li>If the invite is <strong>not accepted within 24 hours</strong>, the credit is automatically refunded to your account.</li>
          <li>If the invite is <strong>accepted</strong>, the coffee credit is considered consumed and is non-refundable.</li>
          <li>New users receive <strong>1 free coffee credit</strong> on sign-up — no card required.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Account Registration &amp; User Responsibility</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You agree to provide accurate, complete, and up-to-date information.</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
          <li>You are responsible for all activities that occur under your account.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. No Guarantee of Results</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          MatchMyInterview does not guarantee job placements or interview success. The platform is purely for <strong>mock interview practice</strong> purposes. Outcomes depend on individual effort and preparation.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Intellectual Property</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          All content on the platform — including design, software, and branding — is the exclusive intellectual property of MatchMyInterview. You may not copy, reproduce, or distribute any part of the platform without our express written permission.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Limitation of Liability</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          To the fullest extent permitted by applicable law, MatchMyInterview shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Termination</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We reserve the right to suspend or terminate accounts that violate these terms, engage in prohibited conduct, or misuse the coffee credit system. Upon termination, your right to use the platform immediately ceases.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Changes to Terms</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may update these Terms from time to time. Material changes will be communicated via email or a prominent notice on the platform. Your continued use after changes constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Contact</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          For questions about these Terms:<br />
          📧 Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a>
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </main>
  )
}
