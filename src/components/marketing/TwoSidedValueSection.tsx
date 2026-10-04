'use client'

import { Check } from 'lucide-react'
import { GlowCard, Reveal, SectionHeader, StaggerItem } from './shared'

const sides = [
  { t: 'As a candidate', p: ['Practice answering', 'Demonstrate your skills', 'Receive peer feedback', 'Build evidence', 'Improve your portfolio'] },
  { t: 'As an interviewer', p: ['Practice interviewing', 'Help another professional', 'Build interviewer reputation', 'Earn XP and achievements', 'Strengthen your own professional profile'] },
]

export default function TwoSidedValueSection() {
  return (
    <section className="mh-sec">
      <div className="mh-wrap">
        <SectionHeader eyebrow="Both sides" title="Build your portfolio from both sides of the interview." />
        <div className="mh-two">
          {sides.map((s, k) => (
            <Reveal key={s.t} delay={k * 0.1}>
              <GlowCard>
                <h3 className="mh-h3">{s.t}</h3>
                <ul className="mh-list" style={{ marginTop: 8 }}>
                  {s.p.map((x, n) => (
                    <StaggerItem key={x} i={n}>
                      <span className="mh-tick-ico"><Check size={15} aria-hidden="true" /></span>{x}
                    </StaggerItem>
                  ))}
                </ul>
              </GlowCard>
            </Reveal>
          ))}
        </div>
        <Reveal><p className="mh-banner">Every session helps both people build their professional reputation.</p></Reveal>
      </div>
    </section>
  )
}
