import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us – MatchMyInterview | Peer Mock Interview Platform',
  description:
    'MatchMyInterview is a peer-to-peer mock interview platform where you practice with real people using a coffee credit system. Learn how it works.',
  keywords: 'mock interview, peer interview practice, coffee credits, interview preparation, MatchMyInterview',
  openGraph: {
    title: 'About MatchMyInterview – Real Practice with Real People',
    description:
      'A peer-to-peer mock interview platform that connects you with like-minded peers through a simple coffee credit system.',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>About MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Peer-to-Peer Mock Interview Platform</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Welcome to MatchMyInterview</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          MatchMyInterview is a <strong>peer-to-peer mock interview platform</strong> designed to help individuals practice and improve their interview skills in a realistic and collaborative environment.
        </p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We believe that the best way to prepare for interviews is by practicing with real people who are on the same journey as you. Our platform connects users with like-minded peers so they can conduct mock interviews, share feedback, and build confidence together.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>💡 How It Works</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li>Users can invite peers for a mock interview session.</li>
          <li>To send an invite, users offer a virtual <strong>"coffee"</strong> to their peer.</li>
          <li>Once the peer accepts the invite, both users are connected and can begin practicing.</li>
          <li>The goal is simple: <em>real practice with real people.</em></li>
        </ul>
      </section>

      <section style={{ marginBottom: 32, background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 14, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>☕ Coffee Credit System</h2>
        <ul style={{ fontSize: 15, color: '#92400e', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <li>Users can purchase coffee credits (e.g., <strong>5 coffees for ₹99</strong>).</li>
          <li>Sending an invite requires <strong>1 coffee credit</strong>.</li>
          <li>If the invited peer <strong>accepts within 24 hours</strong> → the session is confirmed and the coffee is consumed.</li>
          <li>If the peer <strong>does not accept</strong> → the coffee is automatically refunded to your account.</li>
        </ul>
        <p style={{ fontSize: 13, color: '#92400e', marginTop: 12 }}>New users receive 1 free coffee on sign-up — no card required.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>🎯 Our Mission</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 12 }}>
          To create a trusted space where individuals can:
        </p>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Practice interviews with real peers</li>
          <li>Improve communication and confidence</li>
          <li>Prepare effectively for real-world opportunities</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Who We Help</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Fresh graduates entering the job market for the first time</li>
          <li>Experienced professionals switching industries or roles</li>
          <li>Students targeting internships and campus placements</li>
          <li>Job seekers returning to work after a career break</li>
          <li>Anyone who wants to build confidence before a real interview</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Get in Touch</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We would love to hear from you — whether you have a question, feedback, or a partnership inquiry.<br /><br />
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
