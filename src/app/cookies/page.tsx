import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy – MatchMyInterview',
  description: 'Information about how MatchMyInterview uses cookies and tracking technologies.',
}

export default function CookiesPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Cookie Policy — MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: January 1, 2026 | Last Updated: 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        This Cookie Policy explains how MatchMyInterview ("we", "our", or "us") uses cookies and similar tracking technologies when you visit <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a> or use our Platform. It explains what these technologies are, why we use them, and your rights to control their use.
        <br /><br />
        By continuing to use our Platform, you consent to our use of cookies as described in this policy.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. What Are Cookies?</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners. Cookies cannot access other files on your device or cause any harm.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Types of Cookies We Use</h2>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>2.1 Strictly Necessary Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          These cookies are essential for the Platform to function properly. They enable core features such as user authentication, session management, and security. Without these cookies, the services you have requested cannot be provided. These cookies do not require your consent.
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Session cookies to keep you logged in</li>
          <li>Security cookies to prevent cross-site request forgery (CSRF)</li>
          <li>Load-balancing cookies to ensure performance</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>2.2 Performance & Analytics Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          These cookies collect information about how visitors use our Platform — such as which pages are visited most, how long users stay, and any error messages encountered. This data helps us improve the Platform's performance and user experience. All data collected is aggregated and anonymous.
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Page view and session duration tracking</li>
          <li>Feature usage analytics</li>
          <li>Platform performance monitoring</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>2.3 Functional Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          These cookies allow the Platform to remember choices you make — such as your preferred language, mock interview settings, or accessibility preferences — and provide a more personalized experience.
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Language and region preferences</li>
          <li>Interview session preferences</li>
          <li>Notification settings</li>
        </ul>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>2.4 Marketing & Targeting Cookies</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          With your consent, we may use cookies to deliver relevant advertisements, track the effectiveness of marketing campaigns, and limit how many times you see an ad. These cookies may track your browsing activity across different websites.
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Retargeting cookies to show relevant ads on third-party platforms</li>
          <li>Conversion tracking for marketing campaigns</li>
          <li>Social media integration cookies</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Third-Party Cookies</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>We may use third-party services that set their own cookies on your device, including:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li><strong>Google Analytics</strong> — for website usage analytics</li>
          <li><strong>Payment processors</strong> — for secure transaction handling</li>
          <li><strong>Customer support tools</strong> — for live chat and support functionality</li>
          <li><strong>Social media platforms</strong> — for sharing and login functionality</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          These third parties have their own privacy and cookie policies, which we encourage you to review.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Cookie Duration</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Cookies can be either session cookies (deleted when you close your browser) or persistent cookies (remaining on your device for a set period or until manually deleted). Most of our strictly necessary cookies are session cookies. Analytics and functional cookies may persist for up to 12 months.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. Managing Your Cookie Preferences</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>You have the right to accept, decline, or manage cookies at any time. You can control cookies through:</p>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Browser Settings</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Most web browsers allow you to manage cookie preferences through their settings. You can choose to block all cookies, delete existing cookies, or be notified when a cookie is being set. Blocking certain cookies may affect the functionality of our Platform.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Cookie Consent Banner</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          When you first visit <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>, you will be presented with a cookie consent banner allowing you to accept or decline non-essential cookies. You can revisit and update your preferences at any time through the cookie settings link in our website footer.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Opt-Out Tools</h3>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          You can opt out of Google Analytics tracking by installing the Google Analytics Opt-out Browser Add-on. For interest-based advertising, you may opt out through the Digital Advertising Alliance, the Network Advertising Initiative, or your device's advertising settings.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Do Not Track</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Some browsers offer a "Do Not Track" (DNT) signal that notifies websites of your preference not to be tracked. At this time, MatchMyInterview does not respond to DNT signals, as there is no universal standard for how these signals should be interpreted. We will update this policy if industry standards change.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Changes to This Cookie Policy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. We will post the updated policy on this page with a revised effective date. We encourage you to check this page periodically.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Contact Us</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>If you have any questions about our use of cookies:</p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a><br />
          Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
          <br /><br />
          We are happy to help clarify how we use cookies and to assist you in managing your preferences.
        </p>
      </section>
      
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © 2026 MatchMyInterview. All rights reserved.
      </div>
    </main>
  )
}
