import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy – MatchMyInterview',
  description: 'Learn how MatchMyInterview uses cookies to improve functionality, analyze traffic, and enhance your user experience.',
  keywords: 'MatchMyInterview cookie policy, cookies, tracking, analytics',
}

export default function CookiesPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Cookie Policy</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: May 5, 2025 | Last Updated: May 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        This Cookie Policy explains how MatchMyInterview uses cookies and similar tracking technologies when you visit{' '}
        <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>matchmyinterview.com</a>.
        By continuing to use our platform, you consent to our use of cookies as described in this policy.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>What Are Cookies?</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Cookies are small files stored on your device that help improve your browsing experience. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>How We Use Cookies</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>We use cookies to:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Improve website functionality</strong> — keep you logged in and remember your preferences</li>
          <li><strong>Analyze traffic and usage</strong> — understand how users navigate the platform so we can improve it</li>
          <li><strong>Enhance user experience</strong> — deliver a faster, more personalized experience</li>
          <li><strong>Security</strong> — prevent fraudulent activity and protect your session</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Types of Cookies We Use</h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Strictly Necessary Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          Essential for the platform to function. These include session authentication and security cookies. They cannot be disabled.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Performance &amp; Analytics Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          Collect anonymous data about how visitors use our platform — pages visited, session duration, and feature usage — to help us improve performance and user experience.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Functional Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          Allow the platform to remember your settings and preferences for a more personalized experience.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Managing Cookies</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          You can disable cookies through your browser settings. However, some features of the platform (such as staying logged in) may not function properly if cookies are disabled. Most browsers allow you to manage cookie preferences through their settings menu.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Third-Party Cookies</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 10 }}>We may use third-party services that set their own cookies, including:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Google Analytics</strong> — for website usage analytics</li>
          <li><strong>Payment processors</strong> — for secure transaction handling</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46', marginTop: 10 }}>
          These third parties have their own privacy and cookie policies, which we encourage you to review.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Changes to This Policy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may update this Cookie Policy from time to time. We will post the updated policy on this page with a revised effective date.
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
