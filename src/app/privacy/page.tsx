import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – MatchMyInterview',
  description: 'How MatchMyInterview collects, uses and protects your personal data.',
}

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: '#71717a', marginBottom: 32 }}>Last updated: May 3, 2026</p>

      {[
        { h: '1. Information We Collect', p: 'We collect your email address when you sign up, and any profile information you provide (username, experience level, domain, target role). We also collect usage data such as last active time and messages sent within sessions.' },
        { h: '2. How We Use Your Information', p: 'We use your information to match you with practice partners, operate the chat service, send important account emails, and improve the platform. We do not sell your personal data to third parties.' },
        { h: '3. Payments', p: 'Payments are processed by Razorpay. We do not store your card details. We store transaction metadata (amount, reference ID, credits issued) to credit your account.' },
        { h: '4. Cookies', p: 'We use essential cookies for authentication (Supabase session). We may use analytics cookies to understand usage patterns. You can disable non-essential cookies via your browser settings.' },
        { h: '5. Data Retention', p: 'Your account data is retained while your account is active. You may request deletion at any time by contacting us at privacy@matchmyinterview.in.' },
        { h: '6. Third-Party Services', p: 'We use Supabase (database and auth), Razorpay (payments), and Vercel (hosting). Each has its own privacy policy governing data it processes.' },
        { h: '7. Children', p: 'MatchMyInterview is not intended for users under 18 years of age. We do not knowingly collect data from minors.' },
        { h: '8. Changes', p: 'We may update this policy. Continued use of the platform after changes constitutes acceptance of the revised policy.' },
        { h: '9. Contact', p: 'Questions? Email us at privacy@matchmyinterview.in' },
      ].map(s => (
        <section key={s.h} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.h}</h2>
          <p style={{ fontSize: 15, color: '#3f3f46' }}>{s.p}</p>
        </section>
      ))}
    </main>
  )
}
