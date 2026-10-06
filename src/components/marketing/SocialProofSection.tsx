'use client'

import { Check } from 'lucide-react'
import { Reveal, SectionHeader } from './shared'

const practice = [
  'Peer matching by domain, experience and role',
  'Chat sessions with real peers',
  'Structured peer evaluations with written feedback',
  'Skill evidence on your professional profile',
]
const share = [
  'A public portfolio you can share, opt-in',
  'MMI score, XP, streaks and a leaderboard',
  'A talent directory of peer-rated members',
  'A blog with interview guides',
]

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mh-road-card" style={{ height: '100%' }}>
      <h3 className="mh-h3">{title}</h3>
      <ul style={{ marginTop: 10 }}>
        {items.map((x) => (
          <li key={x}>
            <span className="mh-tick-ico" style={{ background: '#D1FAE5', color: '#047857' }}><Check size={15} aria-hidden="true" /></span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function SocialProofSection() {
  return (
    <section className="mh-sec" style={{ background: 'var(--soft)' }}>
      <div className="mh-wrap">
        <SectionHeader eyebrow="Available today" title="Everything here is live" description="We would rather show you real features than invent numbers." />
        <div className="mh-road">
          <Reveal><Card title="Practice and build evidence" items={practice} /></Reveal>
          <Reveal delay={0.1}><Card title="Share and grow" items={share} /></Reveal>
        </div>
      </div>
    </section>
  )
}
