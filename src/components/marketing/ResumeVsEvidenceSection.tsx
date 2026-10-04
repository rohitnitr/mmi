'use client'

import { PreviewBadge, Reveal, SectionHeader } from './shared'

const claims = [['SQL', 'Advanced'], ['Python', 'Advanced'], ['Communication', 'Excellent'], ['Problem Solving', 'Strong']]
const proof = [
  ['SQL', '4.6', 'Peer validated', '12 evaluations · 8 independent peers'],
  ['Python', '4.4', 'Peer validated', '7 evaluations'],
  ['Communication', '4.7', 'Peer evaluated', '10 evaluations'],
]

export default function ResumeVsEvidenceSection() {
  return (
    <section className="mh-sec">
      <div className="mh-wrap">
        <SectionHeader
          eyebrow="The difference"
          title={<>LinkedIn tells people what you can do.<br /><span className="mh-grad">MMI shows the evidence.</span></>}
        />
        <div className="mh-cmp2">
          <Reveal>
            <div className="mh-cmp2-a" style={{ height: '100%' }}>
              <h3 style={{ color: '#64748B' }}>Traditional profile <span className="mh-badge mh-b-planned">Self-declared</span></h3>
              {claims.map(([s, l]) => (
                <div className="mh-sr" key={s}><b>{s}</b><span style={{ color: '#94A3B8' }}>{l}</span></div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mh-cmp2-b" style={{ height: '100%' }}>
              <h3 style={{ color: '#2563EB' }}>MMI profile <PreviewBadge label="Example" /></h3>
              {proof.map(([s, v, st, m]) => (
                <div className="mh-sr" key={s}>
                  <div><b>{s}</b><p className="m">{m}</p></div>
                  <div style={{ textAlign: 'right' }}><span className="mh-score">{v} / 5</span><p className="mh-ok">{st}</p></div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
        <Reveal>
          <p className="mh-quote">Your resume and professional profile tell your story. MMI adds evidence from real peer interactions.</p>
        </Reveal>
      </div>
    </section>
  )
}
