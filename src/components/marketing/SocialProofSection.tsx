'use client'

import { Check, Clock } from 'lucide-react'
import { Reveal, SectionHeader } from './shared'

const live = ['Peer matching by domain and role', 'Interview sessions with chat', 'Invites and session flow', 'Blog with interview guides']
const next = ['Richer professional profiles', 'Structured peer feedback', 'Peer-validated skill evidence', 'MMI score and reputation', 'Shareable portfolio']

export default function SocialProofSection() {
  return (
    <section className="mh-sec" style={{ background: 'var(--soft)' }}>
      <div className="mh-wrap">
        <SectionHeader eyebrow="Built in public" title="What works today, and what is next" description="We would rather show you our progress than invent numbers." />
        <div className="mh-road">
          <Reveal>
            <div className="mh-road-card" style={{ height: '100%' }}>
              <h3 className="mh-h3">Live now</h3>
              <ul style={{ marginTop: 10 }}>
                {live.map((x) => <li key={x}><span className="mh-tick-ico" style={{ background: '#D1FAE5', color: '#047857' }}><Check size={15} aria-hidden="true" /></span>{x}</li>)}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mh-road-card" style={{ height: '100%' }}>
              <h3 className="mh-h3">Coming next</h3>
              <ul style={{ marginTop: 10 }}>
                {next.map((x) => <li key={x} style={{ color: '#475569' }}><span className="mh-tick-ico"><Clock size={14} aria-hidden="true" /></span>{x}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
