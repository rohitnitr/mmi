import type { Metadata } from 'next'
import LegalShell from '@/components/marketing/LegalShell'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How MatchMyInterview collects, uses and protects your information across peer mock interviews and JEE mock tests, including cookies, advertising and students under 18.',
  keywords: 'MatchMyInterview privacy policy, data protection, JEE mock test privacy, cookies, Google AdSense',
  alternates: { canonical: '/privacy' },
}

const H2 = { fontSize: 20, fontWeight: 700, marginBottom: 12 } as const
const P = { fontSize: 15, color: '#3f3f46', marginBottom: 10, lineHeight: 1.7 } as const
const UL = { fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.7 } as const
const SEC = { marginBottom: 32 } as const
const A = { color: '#18181b' } as const
const EMAIL = 'matchmyinterview@gmail.com'

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy">
      <h1>Privacy Policy</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective date: May 5, 2025 | Last updated: October 2026</p>

      <p style={{ ...P, marginBottom: 32 }}>
        MatchMyInterview values your privacy. This policy explains what we collect, why, who we share it with, and the choices you have.
        It covers our peer mock interview community and our JEE mock tests at{' '}
        <a href="https://www.matchmyinterview.com" style={A}>www.matchmyinterview.com</a>.
      </p>

      <section style={SEC}>
        <h2 style={H2}>1. Who we are</h2>
        <p style={P}>
          MatchMyInterview is operated from India by Rohit Poddar. For anything in this policy, write to{' '}
          <a href={`mailto:${EMAIL}`} style={A}>{EMAIL}</a>.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>2. Information we collect</h2>
        <ul style={UL}>
          <li><strong>Sign-in details.</strong> When you sign in with Google we receive your name, email address and profile photo.</li>
          <li><strong>Profile information.</strong> Your domain, role, experience, skills and any details you choose to add, used for peer matching.</li>
          <li><strong>Peer activity.</strong> Connection requests, sessions, feedback and messages you exchange.</li>
          <li><strong>JEE student details.</strong> Your mobile number, your JEE attempt year, and whether you want your name shown on a leaderboard.</li>
          <li><strong>Test activity.</strong> Your answers, time spent on each question, scores, rank and percentile.</li>
          <li><strong>Payments.</strong> Payments are handled by Razorpay. We receive an order ID, a payment ID and the payment status. We never see or store your card, UPI or bank details.</li>
          <li><strong>Messages to us.</strong> What you send through the contact form or by email.</li>
          <li><strong>Technical data.</strong> Device, browser and approximate location from your IP address, and cookies (see section 5).</li>
        </ul>
      </section>

      <section style={SEC}>
        <h2 style={H2}>3. How we use your information</h2>
        <ul style={UL}>
          <li>Create your account and keep you signed in</li>
          <li>Match you with peers and run mock interview sessions</li>
          <li>Deliver JEE mock tests, score them and show your result, rank and analysis</li>
          <li>Process payments, unlock purchases and handle refunds</li>
          <li>Reply to your questions and fix problems</li>
          <li>Keep the platform safe and prevent fraud and cheating</li>
          <li>Understand how the site is used so we can improve it</li>
          <li>Meet our legal obligations</li>
        </ul>
        <p style={{ ...P, marginTop: 10 }}>We do not sell your personal data.</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>4. Your consent</h2>
        <p style={P}>
          We process your information based on your consent, given when you sign up, and where needed to provide the service you asked for.
          You can withdraw consent at any time by deleting your account or writing to us. Withdrawing consent does not affect processing done before.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>5. Cookies and analytics</h2>
        <p style={P}>
          <strong>Essential cookies</strong> keep you signed in and keep the site working. They are always on.
          <strong> Analytics and advertising cookies</strong> are optional. We use them only after you accept them on our cookie banner.
          See our <a href="/cookies" style={A}>Cookie Policy</a> for the list.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>6. Advertising and Google AdSense</h2>
        <p style={P}>
          We may show third-party ads, including Google AdSense, on public content pages such as our blog and guides.
          <strong> We do not show ads inside the JEE exam screen, the store, your dashboard or the sign-in pages.</strong>
          Google and its partners may use cookies to show ads based on your visits to this and other sites. You can opt out of personalised ads at{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={A}>Google Ads Settings</a>,
          and read how Google uses data at{' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" style={A}>Google advertising technologies</a>.
          Advertising cookies are used only after you accept them.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>7. Who we share data with</h2>
        <p style={P}>We share data only with providers that help us run the service, under their own privacy terms:</p>
        <ul style={UL}>
          <li><strong>Supabase</strong> for our database and sign-in</li>
          <li><strong>Vercel</strong> for hosting</li>
          <li><strong>Razorpay</strong> for payments</li>
          <li><strong>Google</strong> for sign-in, analytics and advertising</li>
          <li><strong>Agora</strong> for live video in peer sessions</li>
          <li><strong>Authorities</strong>, when the law requires it</li>
        </ul>
        <p style={{ ...P, marginTop: 10 }}>
          Your name appears on a JEE leaderboard only if you choose to show it. Your profile is visible to other members as set in your profile settings.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>8. How long we keep data</h2>
        <p style={P}>
          We keep your data while your account is active so that your results and history stay available. When you delete your account we delete or anonymise your personal data,
          except records we must keep by law, such as payment records.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>9. Security</h2>
        <p style={P}>
          We use HTTPS, restricted database access and secure payment handling. No online service is perfectly secure, but we work to protect your data and fix problems quickly.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>10. Your rights</h2>
        <p style={P}>You can ask us to:</p>
        <ul style={UL}>
          <li>Show you the data we hold about you</li>
          <li>Correct anything that is wrong</li>
          <li>Delete your account and data</li>
          <li>Stop using your data where you have withdrawn consent</li>
        </ul>
        <p style={{ ...P, marginTop: 10 }}>
          Email <a href={`mailto:${EMAIL}`} style={A}>{EMAIL}</a>. We aim to reply within 30 days. If you are not satisfied with our response, you may also complain to the relevant data protection authority.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>11. Students under 18</h2>
        <p style={P}>
          Many JEE aspirants are under 18. If you are under 18, please sign up only with the knowledge and consent of a parent or guardian.
          We collect only what we need to run your tests, we do not show advertising in the JEE section, and we do not use students&apos; data for targeted advertising.
          A parent or guardian can ask us to access or delete a child&apos;s data at <a href={`mailto:${EMAIL}`} style={A}>{EMAIL}</a>.
          Our peer interview community is intended for users aged 18 and over.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>12. Where data is processed</h2>
        <p style={P}>Our providers may process data on servers outside India. We choose providers that protect data to a reasonable standard.</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>13. Changes to this policy</h2>
        <p style={P}>If we make a material change we will update the date above and, where appropriate, tell you on the site.</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>14. Contact and grievances</h2>
        <p style={P}>
          Grievance contact: Rohit Poddar, founder. Email <a href={`mailto:${EMAIL}`} style={A}>{EMAIL}</a>. See also our <a href="/contact" style={A}>contact page</a>.
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </LegalShell>
  )
}
