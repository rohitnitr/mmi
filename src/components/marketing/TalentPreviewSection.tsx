'use client'

import { Lock } from 'lucide-react'
import { Reveal, StatusBadge } from './shared'

export default function TalentPreviewSection() {
  return (
    <section className="mh-sec" style={{ paddingTop: 0 }}>
      <div className="mh-wrap">
        <Reveal>
          <div className="mh-talent">
            <StatusBadge status="planned" />
            <h2 className="mh-h2" style={{ marginTop: 16, fontSize: 'clamp(1.6rem,3vw,2.3rem)' }}>Coming later</h2>
            <p className="mh-lead" style={{ maxWidth: 560, margin: '14px auto 0' }}>
              Recruiter search, company accounts and talent discovery are planned for a later stage, with you in control of what is shared. They are not available today.
            </p>
            <div aria-hidden="true" style={{ marginTop: 26 }}>
              {[70, 55, 62].map((w, k) => (
                <div className="mh-skel" key={k}><i style={{ width: 36, height: 36, borderRadius: '50%' }} /><i style={{ width: `${w}%` }} /></div>
              ))}
            </div>
            <p className="mh-small" style={{ marginTop: 18, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Lock size={14} aria-hidden="true" /> Opt-in only</p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
