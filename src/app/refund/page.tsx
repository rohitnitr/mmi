import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy – MatchMyInterview',
  description: 'Refund options and policy details for MatchMyInterview subscriptions.',
}

export default function RefundPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>Refund Policy — MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Effective Date: January 1, 2026 | Last Updated: 2026</p>

      <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 32 }}>
        At MatchMyInterview, we are committed to delivering exceptional value for your interview preparation. We understand that circumstances change, and this Refund Policy outlines your options if you are not satisfied with your purchase or need to make changes to your subscription.
        <br /><br />
        By purchasing a subscription or any paid feature on <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>, you agree to this Refund Policy.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Subscription Plans</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          MatchMyInterview offers monthly and annual subscription plans. Each plan provides access to a defined set of features, mock interview sessions, and AI feedback tools during the subscription period.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>2. Free Trial</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Where applicable, MatchMyInterview may offer a free trial period. If you cancel before the free trial ends, you will not be charged. If you do not cancel before the trial ends, your subscription will automatically convert to a paid plan and the applicable fee will be charged.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>3. Refund Eligibility</h2>
        
        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Monthly Subscriptions</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Monthly subscription payments are non-refundable once the billing cycle has begun. You may cancel at any time, and your access will continue until the end of the current billing period. No partial-month refunds are issued.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Annual Subscriptions</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          If you cancel an annual subscription within 7 days of your initial purchase date and have not used more than 3 mock interview sessions, you are eligible for a full refund. After 7 days or after exceeding 3 sessions, annual subscriptions are non-refundable.
        </p>

        <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 16, marginBottom: 8 }}>Exceptional Circumstances</h3>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>We evaluate refund requests on a case-by-case basis for exceptional circumstances, such as:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>A verified technical failure on our platform that prevented you from accessing your sessions</li>
          <li>Duplicate charges or billing errors</li>
          <li>Accidental purchases made in error with no sessions used</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          In such cases, please contact us within 14 days of the charge at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with your order details and a description of the issue.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>4. Non-Refundable Items</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>The following are not eligible for refunds:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Partially used subscriptions beyond the 7-day window for annual plans</li>
          <li>Add-on credits or session packs that have been fully or partially used</li>
          <li>Purchases made through third-party platforms or app stores (governed by the respective platform's refund policy)</li>
          <li>Accounts suspended or terminated for violations of our Terms of Service</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>5. How to Request a Refund</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>To request a refund, email us at <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a> with:</p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <li>Your full name and registered email address</li>
          <li>Your order ID or transaction reference number</li>
          <li>The reason for your refund request</li>
          <li>Any supporting documentation (e.g., screenshots of billing errors)</li>
        </ul>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We will review your request and respond within 5 business days. Approved refunds will be credited to your original payment method within 7–10 business days, depending on your bank or payment provider.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>6. Subscription Cancellation</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          You can cancel your subscription at any time from your account settings. Cancellation stops future billing immediately but does not trigger a refund for the current subscription period. You will retain full access until your current billing cycle ends.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>7. Changes to This Policy</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We reserve the right to update this Refund Policy at any time. Changes will be posted on this page with a revised effective date. We encourage you to review this policy periodically.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>8. Contact Us</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          For refund requests or billing questions:<br />
          Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a><br />
          Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
        </p>
      </section>
    </main>
  )
}
