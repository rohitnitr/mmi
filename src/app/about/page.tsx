import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About – MatchMyInterview',
  description: 'MatchMyInterview is an AI-driven mock interview preparation platform designed to help job seekers confidently land their dream jobs.',
}

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'Inter,system-ui,sans-serif', color: '#18181b', lineHeight: 1.75 }}>
      <a href="/" style={{ fontSize: 13, color: '#71717a', textDecoration: 'none' }}>← Back to MatchMyInterview</a>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 24, marginBottom: 8 }}>About MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>AI-Powered Mock Interview Preparation Platform | Last updated: 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Who We Are</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          MatchMyInterview is an AI-driven mock interview preparation platform designed to help job seekers, students, and professionals confidently land their dream jobs. We believe that every candidate deserves a fair shot — and the best way to get there is through smart, realistic, and personalized practice.
        </p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          Whether you are preparing for a technical coding interview, a behavioral HR round, a case study discussion, or a domain-specific role, MatchMyInterview adapts to your needs and helps you improve with every session.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Our Mission</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          Our mission is simple: to democratize interview preparation and give every candidate — regardless of background, location, or resources — access to world-class interview coaching powered by artificial intelligence.
        </p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We combine cutting-edge AI technology with real-world interview intelligence to simulate true interview conditions, provide instant feedback, and track your improvement over time.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>What Makes Us Different</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <li><strong>1. Realistic AI-Powered Mock Interviews:</strong> MatchMyInterview conducts immersive mock interviews that closely replicate how real interviewers think and respond. Our AI adapts follow-up questions based on your answers — just like a human interviewer would.</li>
          <li><strong>2. Personalized Feedback in Real Time:</strong> After every session, you receive a detailed performance report covering communication clarity, technical accuracy, confidence indicators, and areas for improvement — giving you actionable insights, not generic tips.</li>
          <li><strong>3. Interview Matching Technology:</strong> Our proprietary matching engine aligns your mock interview sessions with actual job descriptions, company cultures, and industry expectations. You practice specifically for the roles you want — not generic scenarios.</li>
          <li><strong>4. Wide Coverage Across Roles and Industries:</strong> From software engineering and data science to product management, finance, consulting, marketing, and healthcare — MatchMyInterview supports hundreds of job roles across every major industry.</li>
          <li><strong>5. Progress Tracking & Analytics:</strong> Your MatchMyInterview dashboard shows a complete timeline of your preparation journey — session scores, improvement trends, weak spots, and readiness scores before you walk into your actual interview.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Who We Help</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li>Fresh graduates entering the job market for the first time</li>
          <li>Experienced professionals switching industries or climbing the career ladder</li>
          <li>International candidates preparing for interviews in new countries</li>
          <li>Students targeting internships and campus placements</li>
          <li>Job seekers returning to work after a career break</li>
          <li>Professionals preparing for high-stakes executive-level interviews</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Our Technology</h2>
        <p style={{ fontSize: 15, color: '#3f3f46', marginBottom: 16 }}>
          MatchMyInterview is built on state-of-the-art large language models (LLMs) and natural language processing (NLP) technology. Our AI evaluates tone, content, structure, and relevance of your answers, and provides coaching that goes beyond simple keyword matching.
        </p>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We continuously train and update our models based on the latest hiring trends, real interview question databases, and feedback from successful candidates — ensuring you are always practicing with the most current and relevant content.
        </p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Our Core Values</h2>
        <ul style={{ fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <li><strong>Accessibility</strong> — Interview coaching should be available to everyone, everywhere.</li>
          <li><strong>Accuracy</strong> — Our feedback is grounded in real interview standards and measurable benchmarks.</li>
          <li><strong>Privacy</strong> — Your data, practice sessions, and personal information are always secure.</li>
          <li><strong>Continuous Improvement</strong> — We evolve constantly so your preparation never goes stale.</li>
          <li><strong>Empowerment</strong> — We build your confidence so you walk into every interview ready to succeed.</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Get in Touch</h2>
        <p style={{ fontSize: 15, color: '#3f3f46' }}>
          We would love to hear from you — whether you have a question, feedback, or a partnership inquiry.
          <br /><br />
          Website: <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a><br />
          Email: <a href="mailto:support@matchmyinterview.com" style={{ color: '#18181b' }}>support@matchmyinterview.com</a>
        </p>
      </section>
    </main>
  )
}
