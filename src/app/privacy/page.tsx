import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy – MatchMyInterview',
  description: 'Learn how MatchMyInterview collects, uses, stores, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Privacy Policy — MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: January 1, 2026 | Last Updated: 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        At MatchMyInterview ("we", "our", or "us"), your privacy is a foundational priority. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you access or use our website at <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a> and our mock interview services (collectively, the "Platform").
        <br /><br />
        By using MatchMyInterview, you agree to the practices described in this Privacy Policy. If you do not agree, please discontinue use of the Platform.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Information We Collect</h2>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>1.1 Information You Provide Directly</h3>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Account registration details:</strong> name, email address, password</li>
          <li><strong>Profile information:</strong> career preferences, job roles, industry, experience level</li>
          <li><strong>Payment information:</strong> processed securely through third-party payment providers — we do not store your card details</li>
          <li><strong>Mock interview responses:</strong> text and voice responses you submit during practice sessions</li>
          <li><strong>Support communications:</strong> messages, feedback, and support tickets you send us</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>1.2 Information We Collect Automatically</h3>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Usage data:</strong> pages visited, features used, session duration, click patterns</li>
          <li><strong>Device information:</strong> IP address, browser type, operating system, device identifiers</li>
          <li><strong>Cookies and tracking data:</strong> as described in our Cookie Policy</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. How We Use Your Information</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>We use your information for the following purposes:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>To create and manage your account</li>
          <li>To conduct mock interviews and deliver AI-generated performance feedback</li>
          <li>To personalize your interview preparation experience</li>
          <li>To process payments and manage subscriptions</li>
          <li>To send you service notifications, updates, and promotional communications (with your consent)</li>
          <li>To improve our AI models, platform features, and user experience</li>
          <li>To detect fraud, prevent abuse, and ensure platform security</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. How We Share Your Information</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>We do not sell your personal data. We may share your information with:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Service providers:</strong> third-party vendors who assist with hosting, analytics, payment processing, and customer support — all bound by data processing agreements</li>
          <li><strong>AI model partners:</strong> anonymized and aggregated data may be used to improve AI performance</li>
          <li><strong>Legal authorities:</strong> when required by applicable law, court order, or regulatory requirements</li>
          <li><strong>Business transfers:</strong> in the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Data Retention</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We retain your personal data for as long as your account is active or as necessary to provide our services. You may request deletion of your account and data at any time by contacting us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a>. Some data may be retained for legal, tax, or compliance purposes even after deletion.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Your Rights</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>Depending on your location, you may have the following rights regarding your personal data:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li><strong>Access:</strong> request a copy of the data we hold about you</li>
          <li><strong>Correction:</strong> request correction of inaccurate or incomplete data</li>
          <li><strong>Deletion:</strong> request erasure of your personal data</li>
          <li><strong>Portability:</strong> request your data in a portable, machine-readable format</li>
          <li><strong>Objection:</strong> object to certain types of processing</li>
          <li><strong>Withdrawal of consent:</strong> where processing is based on consent, you may withdraw it at any time</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          To exercise your rights, contact us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a>.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Data Security</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We implement industry-standard technical and organizational measures to protect your data from unauthorized access, loss, or misuse. These include encryption in transit (TLS), secure data storage, and access controls. However, no system is completely immune to breaches, and we encourage you to use a strong password and keep your credentials secure.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Children's Privacy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          MatchMyInterview is not directed at children under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with personal information, please contact us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> and we will promptly delete it.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Third-Party Links</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Our Platform may contain links to third-party websites. We are not responsible for the privacy practices of those sites and encourage you to review their policies independently.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Changes to This Policy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may update this Privacy Policy from time to time. We will notify you of material changes by posting the revised policy on our website with an updated effective date. Continued use of the Platform after changes constitutes your acceptance of the revised policy.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Contact Us</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          For privacy-related inquiries or to exercise your rights:<br />
          Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a><br />
          Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
        </p>
      </section>
    </main>
  )
}
