import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About – MatchMyInterview',
  description: 'MatchMyInterview connects job seekers for peer-to-peer mock interview practice. Learn our story and mission.',
}

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>About MatchMyInterview</h1>
      <p style={{ fontSize: 16, color: '#3f3f46', marginBottom: 32, maxWidth: 560 }}>
        We believe the best interview prep happens with a real person — not a chatbot, not flashcards. MatchMyInterview connects job seekers across industries so they can practice together, stay accountable, and get hired.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Our Mission</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Democratize quality interview practice. Whether you are a fresher applying for your first role or an experienced professional eyeing a senior position, you deserve a practice partner who understands your journey.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>How It Works</h2>
        <ol style={{ fontSize: 15, color: '#3f3f46', display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 20 }}>
          <li><strong>Sign up for free</strong> — get 1 coffee credit instantly, no card needed.</li>
          <li><strong>Find a peer</strong> — browse by domain, experience, or target role.</li>
          <li><strong>Offer a coffee</strong> — your way of saying "let's practice together."</li>
          <li><strong>Chat and practice</strong> — take turns as interviewer and candidate in a live session.</li>
        </ol>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Contact</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          General enquiries: <a href="mailto:hello@matchmyinterview.in" style={{ color: '#18181b' }}>hello@matchmyinterview.in</a><br />
          Support: <a href="mailto:support@matchmyinterview.in" style={{ color: '#18181b' }}>support@matchmyinterview.in</a>
        </p>
      </section>
    </main>
  )
}
