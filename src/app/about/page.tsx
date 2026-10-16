import type { Metadata } from 'next'
import Image from 'next/image'
import LegalShell from '@/components/marketing/LegalShell'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'MatchMyInterview lets you practise interviews with real peers for free, and take JEE Main mock tests with a full analysis. Built by Rohit Poddar, an NIT Rourkela graduate.',
  keywords: 'about MatchMyInterview, peer mock interview, JEE Main mock test, Rohit Poddar, NIT Rourkela',
  openGraph: {
    title: 'About MatchMyInterview',
    description: 'Free peer-to-peer mock interviews and JEE Main mock tests, built by an NIT Rourkela graduate.',
    type: 'website',
  },
  alternates: { canonical: '/about' },
}

const H2 = { fontSize: 20, fontWeight: 700, marginBottom: 12 } as const
const P = { fontSize: 15, color: '#3f3f46', marginBottom: 12, lineHeight: 1.7 } as const
const UL = { fontSize: 15, color: '#3f3f46', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8, lineHeight: 1.7 } as const
const SEC = { marginBottom: 32 } as const
const EMAIL = 'matchmyinterview@gmail.com'

export default function AboutPage() {
  return (
    <LegalShell title="About">
      <h1>About MatchMyInterview</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Practice interviews with real peers. Practise JEE Main with real mock tests.</p>

      <section style={SEC}>
        <h2 style={H2}>What we do</h2>
        <p style={P}>
          MatchMyInterview is a practice platform with two parts. The first is a <strong>peer-to-peer mock interview community</strong>,
          where people practise interviews with each other and give honest feedback. The second is a set of
          <strong> JEE Main mock tests</strong> that give students a realistic exam screen, a score, a rank and a detailed review of
          where they gained and lost marks.
        </p>
        <p style={P}>
          We started with interviews because the best way to prepare is to practise with real people who are on the same journey.
          We added JEE mock tests because the same idea applies: you improve fastest when you practise under real conditions and then learn exactly what to fix.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>Peer mock interviews</h2>
        <ul style={UL}>
          <li>Create a profile with your domain, role and experience.</li>
          <li>Browse peers and send a connection request. <strong>Finding and connecting with peers is free.</strong></li>
          <li>Once a peer accepts, you connect and practise a mock interview together.</li>
          <li>Share feedback after the session and keep a profile that records your practice.</li>
        </ul>
        <p style={{ ...P, marginTop: 12 }}>It suits fresh graduates, students preparing for campus placements, professionals changing roles, and anyone returning to work after a break.</p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>JEE Main mock tests</h2>
        <ul style={UL}>
          <li>Full-length papers in the JEE Main pattern: 75 questions across Physics, Chemistry and Mathematics, with the standard marking scheme.</li>
          <li>A timed exam screen with a question palette, section tabs, mark-for-review and an on-screen number keypad, on phone and desktop.</li>
          <li>Pay per mock: <strong>₹11</strong> for the mock, or <strong>₹49</strong> for the mock with a full analysis. There is no subscription.</li>
          <li>Your score, rank and percentile appear straight after you submit.</li>
        </ul>
        <p style={{ ...P, marginTop: 12 }}>
          Explore the tests on the <a href="/jee" style={{ color: '#18181b' }}>JEE mock test page</a>. We are an independent practice platform.
          We are not affiliated with, or endorsed by, the National Testing Agency (NTA).
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>How we create content</h2>
        <p style={P}>
          Our blog guides and test papers are prepared by our own team. We check facts and answer keys before anything is published, and we correct mistakes
          when readers report them. If you spot an error in an article or a test question, write to us at{' '}
          <a href={`mailto:${EMAIL}`} style={{ color: '#18181b' }}>{EMAIL}</a> and we will review it.
        </p>
      </section>

      <section style={SEC}>
        <h2 style={H2}>Who runs MatchMyInterview</h2>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <Image src="/founder.jpg" alt="Rohit Poddar, founder of MatchMyInterview" width={112} height={112} style={{ borderRadius: 20, objectFit: 'cover' }} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <p style={{ ...P, marginBottom: 6 }}>
              <strong>Rohit Poddar</strong>, founder. An NIT Rourkela graduate who builds practice tools for interviews and for JEE aspirants.
              MatchMyInterview is operated from India as an independent product, not affiliated with Google, LinkedIn or any employer shown on member profiles.
            </p>
            <p style={{ ...P, marginBottom: 0 }}>
              <a href="https://github.com/rohitnitr" target="_blank" rel="noopener noreferrer" style={{ color: '#18181b' }}>GitHub</a>
              {' · '}
              <a href="https://www.linkedin.com/in/rohitnitr/" target="_blank" rel="noopener noreferrer" style={{ color: '#18181b' }}>LinkedIn</a>
            </p>
          </div>
        </div>
      </section>

      <section style={SEC}>
        <h2 style={H2}>Get in touch</h2>
        <p style={P}>
          Questions, feedback or partnership ideas? Email <a href={`mailto:${EMAIL}`} style={{ color: '#18181b' }}>{EMAIL}</a> or use our{' '}
          <a href="/contact" style={{ color: '#18181b' }}>contact page</a>. Website:{' '}
          <a href="https://www.matchmyinterview.com" style={{ color: '#18181b' }}>https://www.matchmyinterview.com</a>
        </p>
      </section>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e4e4e7', fontSize: 13, color: '#71717a', textAlign: 'center' }}>
        © {new Date().getFullYear()} MatchMyInterview. All rights reserved.
      </div>
    </LegalShell>
  )
}
