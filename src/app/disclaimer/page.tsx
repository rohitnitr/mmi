import type { Metadata } from 'next'
import LegalShell from '@/components/marketing/LegalShell'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'MatchMyInterview disclaimer: educational interview practice only. No job, income, or hiring guarantees.',
  alternates: { canonical: '/disclaimer' },
}

export default function DisclaimerPage() {
  return (
    <LegalShell title="Disclaimer">
      <h1>Disclaimer</h1>
      <p style={{ fontSize: 14, color: '#71717a', marginBottom: 32 }}>Last updated: October 2026</p>
      <section>
        <h2>Educational practice, not a hiring service</h2>
        <p>
          MatchMyInterview helps people practice interviews with peers. Nothing on this website is a job offer,
          placement guarantee, career counselling licence, or professional certification. Outcomes depend on your
          preparation, the roles you apply to, and decisions made by employers we do not control.
        </p>
      </section>
      <section>
        <h2>No financial, legal, or medical advice</h2>
        <p>
          Guides and blog posts are general information. They are not financial advice, legal advice, or medical
          advice. Do not treat peer scores as a substitute for independent judgement.
        </p>
      </section>
      <section>
        <h2>User-generated content</h2>
        <p>
          Profiles, messages, and feedback are created by members. We moderate policy violations when we learn of
          them, but we cannot verify every claim a peer makes about skills, employers, or results.
        </p>
      </section>
      <section>
        <h2>Advertising</h2>
        <p>
          Third-party ads, if shown, are the responsibility of the advertiser. MatchMyInterview is not affiliated
          with Google. AdSense approval is decided solely by Google.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>
          Questions: <a href="mailto:support@matchmyinterview.com">support@matchmyinterview.com</a>
        </p>
      </section>
    </LegalShell>
  )
}
