import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service – MatchMyInterview',
  description: 'Terms of Service governing your use of MatchMyInterview platform and services.',
}

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Terms of Service — MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: January 1, 2026 | Last Updated: 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        Welcome to MatchMyInterview. These Terms of Service ("Terms") govern your access to and use of our website at <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a> and all associated services (the "Platform"). Please read these Terms carefully before using the Platform.
        <br /><br />
        By accessing or using MatchMyInterview, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not use the Platform.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Eligibility</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          You must be at least 16 years of age to create an account and use the Platform. By registering, you represent that you meet this age requirement and that all information you provide is accurate and complete.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Account Registration</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>To access core features of MatchMyInterview, you must create an account. You agree to:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Provide accurate, complete, and up-to-date information during registration</li>
          <li>Keep your password secure and confidential</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
          <li>Accept responsibility for all activities that occur under your account</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We reserve the right to suspend or terminate accounts that contain inaccurate information or violate these Terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Use of the Platform</h2>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Permitted Use</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          You may use MatchMyInterview solely for lawful, personal, and non-commercial interview preparation purposes, unless you have entered into a separate agreement with us for commercial or institutional use.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Prohibited Conduct</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>You must not:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Use the Platform to cheat, deceive, or misrepresent your qualifications to employers</li>
          <li>Attempt to reverse engineer, copy, scrape, or extract any AI model, algorithm, or data from the Platform</li>
          <li>Upload or transmit harmful, offensive, illegal, or fraudulent content</li>
          <li>Impersonate any person or entity</li>
          <li>Use automated bots, scripts, or tools to access or interact with the Platform without our written consent</li>
          <li>Violate any applicable local, national, or international law or regulation</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Subscription & Payments</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          MatchMyInterview offers both free and paid subscription plans. Paid plans are billed on a recurring basis (monthly or annually) as selected at checkout.
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>All prices are listed in the applicable currency at the time of purchase</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>You can manage or cancel your subscription through your account dashboard</li>
          <li>We reserve the right to modify pricing with reasonable prior notice</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Please refer to our Refund Policy for details on cancellations and refunds.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Intellectual Property</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          All content on the Platform — including but not limited to AI models, interview questions, feedback systems, software, design, text, and graphics — is the exclusive intellectual property of MatchMyInterview or its licensors.
        </p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          You may not copy, reproduce, distribute, modify, or create derivative works from any part of the Platform without our express written permission. Your personal interview responses and practice data remain your own, subject to our Privacy Policy.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. AI-Generated Content Disclaimer</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          MatchMyInterview uses AI technology to simulate interviews and generate feedback. While we strive for accuracy and quality, AI-generated feedback is for educational purposes only and does not constitute professional career counseling, employment advice, or a guarantee of interview success. Results may vary by individual.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Limitation of Liability</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          To the fullest extent permitted by applicable law, MatchMyInterview and its directors, employees, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or opportunities, arising from your use of or inability to use the Platform.
        </p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Our total aggregate liability for any claim arising from these Terms shall not exceed the amount you paid to us in the 3 months preceding the claim.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Disclaimer of Warranties</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          The Platform is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Platform will be error-free, uninterrupted, or that AI feedback will be accurate for all users or interview scenarios.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Termination</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may suspend or terminate your account and access to the Platform at our sole discretion if you breach these Terms, engage in prohibited conduct, or if required by law. Upon termination, your right to use the Platform immediately ceases.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Changes to Terms</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may update these Terms from time to time. Material changes will be communicated via email or a prominent notice on the Platform. Your continued use after changes take effect constitutes acceptance of the revised Terms.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>11. Governing Law</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          These Terms are governed by and construed in accordance with applicable laws. Any disputes arising from these Terms shall be resolved through binding arbitration or in a court of competent jurisdiction, as applicable.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>12. Contact</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          For questions about these Terms:<br />
          Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a><br />
          Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
        </p>
      </section>
    </main>
  )
}
