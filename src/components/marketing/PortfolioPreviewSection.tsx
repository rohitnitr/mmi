'use client'

import { Check } from 'lucide-react'
import { Meter, PreviewBadge, Reveal, SectionHeader } from './shared'

const parts = ['Name and photo', 'Username', 'Professional headline', 'Target role', 'About', 'Skills', 'Peer-validated skills', 'Interview history', 'Peer feedback', 'Achievements', 'MMI score and reputation', 'Education', 'Experience', 'Projects', 'LinkedIn and GitHub']

export default function PortfolioPreviewSection() {
  return (
    <section className="mh-sec" style={{ background: 'var(--soft)' }}>
      <div className="mh-wrap">
        <SectionHeader eyebrow="The outcome" title="Every interview makes your profile stronger." description="Your profile grows into a professional portfolio you can share, backed by evidence from real peers." />
        <div className="mh-pfx">
          <Reveal>
            <div className="mh-pf-card">
              <PreviewBadge label="Illustrative profile" />
              <div className="mh-fprof" style={{ marginTop: 16 }}>
                <span className="mh-photo" style={{ width: 56, height: 56 }} aria-hidden="true">SP</span>
                <div><p className="mh-num" style={{ fontSize: 18 }}>Sample Profile</p><p className="mh-small">Software Engineer · @sampleprofile</p></div>
              </div>
              <p className="mh-small" style={{ marginTop: 12 }}>Building skills through real peer interviews.</p>
              <div className="mh-stats"><div><b>842</b><span>MMI score</span></div><div><b>18</b><span>Interviews</span></div></div>
              <Meter label="React  4.6 ★" value={92} />
              <Meter label="Node.js  4.4 ★" value={88} />
              <Meter label="System Design  4.7 ★" value={94} />
              <p className="mh-ok" style={{ marginTop: 12 }}><Check size={13} style={{ verticalAlign: -2 }} aria-hidden="true" /> Peer validated</p>
              <div className="mh-fb">&ldquo;Strong analytical thinking and a clear way of explaining trade-offs.&rdquo;</div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mh-pf-card">
              <p className="mh-bold">What your portfolio brings together</p>
              <div className="mh-parts">{parts.map((p) => <span key={p}>{p}</span>)}</div>
              <p className="mh-small" style={{ marginTop: 16 }}>All values shown here are sample data for illustration. Richer profiles and portfolios are coming soon.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
