import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service – MatchMyInterview',
  description: 'Terms and conditions for using the MatchMyInterview platform.',
}

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ fontSize: 13, color: '#71717a', marginBottom: 32 }}>Last updated: May 3, 2026</p>

      {[
        { h: '1. Acceptance', p: 'By accessing or using MatchMyInterview ("Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service.' },
        { h: '2. Description', p: 'MatchMyInterview is a peer-to-peer mock interview practice platform. Users can connect with other professionals to practice job interviews via text-based chat sessions.' },
        { h: '3. Eligibility', p: 'You must be at least 18 years old and capable of entering a binding contract to use the Service.' },
        { h: '4. User Accounts', p: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Report unauthorized access immediately.' },
        { h: '5. Conduct', p: 'You agree not to harass, abuse, or harm other users; post illegal content; attempt to reverse-engineer the platform; or use the Service for commercial solicitation without prior written consent.' },
        { h: '6. Payments and Credits', p: '"Coffee" credits are purchased to connect with peers. Credits are non-refundable except as required by applicable law. All prices are in INR and inclusive of applicable taxes.' },
        { h: '7. Intellectual Property', p: 'The platform, branding, and original content are owned by MatchMyInterview. User-generated content in chat sessions remains the property of the respective users.' },
        { h: '8. Disclaimers', p: 'The Service is provided "as is." We make no warranties regarding uptime, match quality, or interview outcomes. Use of the platform does not guarantee employment.' },
        { h: '9. Limitation of Liability', p: 'To the maximum extent permitted by law, MatchMyInterview shall not be liable for indirect, incidental, or consequential damages arising from your use of the Service.' },
        { h: '10. Termination', p: 'We reserve the right to suspend or terminate accounts that violate these Terms without prior notice.' },
        { h: '11. Governing Law', p: 'These Terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.' },
        { h: '12. Contact', p: 'Questions? Email legal@matchmyinterview.in' },
      ].map(s => (
        <section key={s.h} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.h}</h2>
          <p style={{ fontSize: 15, color: '#3f3f46' }}>{s.p}</p>
        </section>
      ))}
    </main>
  )
}
