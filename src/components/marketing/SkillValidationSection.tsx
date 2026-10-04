'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { CountUp, PreviewBadge, SectionHeader } from './shared'

const stages = [['Self-declared', 'You list the skill'], ['Interviewed', 'A peer asks about it'], ['Peer evaluated', 'Feedback is recorded'], ['Peer validated', 'Evidence accumulates']]

export default function SkillValidationSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const [s, setS] = useState(0)
  const stage = reduce ? 3 : s

  useEffect(() => {
    if (!inView || reduce || s >= 3) return
    const t = setTimeout(() => setS(s + 1), 1300)
    return () => clearTimeout(t)
  }, [inView, reduce, s])

  return (
    <section id="skills" className="mh-sec mh-dark" style={{ scrollMarginTop: 70 }}>
      <div className="mh-wrap">
        <SectionHeader eyebrow="Skill evidence" title="Anyone can declare a skill. Evidence is earned." description="Users can declare their skills, but they cannot declare their own validation score. Only completed peer interactions generate validation evidence." />
        <div className="mh-demo" ref={ref}>
          <div className="mh-demo-top">
            <span style={{ fontWeight: 700 }}>Example: one skill, four stages</span>
            <PreviewBadge label="Illustrative, not real data" />
          </div>
          <div className="mh-ladder">
            {stages.map(([a, b], k) => (
              <div key={a} className={`mh-stage${stage >= k ? ' on' : ''}`}>{a}<small>{b}</small></div>
            ))}
          </div>
          <div className="mh-ladbar"><i style={{ width: `${(stage / 3) * 100}%` }} /></div>
          <div className="mh-big" style={{ opacity: stage === 3 ? 1 : 0.35, transition: 'opacity .5s' }}>
            <strong>{stage === 3 ? <CountUp to={4.6} decimals={1} /> : '0.0'} / 5</strong>
            <span>SQL · 12 evaluations · 8 independent peers</span>
          </div>
          {!reduce && <button className="mh-btn mh-btn-glass mh-btn-sm" style={{ marginTop: 18 }} onClick={() => setS(0)}><RotateCcw size={15} aria-hidden="true" /> Replay</button>}
          <p className="mh-demo-note">Peer-evaluated evidence based on completed MMI interviews. It is not a formal professional certification. This feature is coming soon.</p>
        </div>
      </div>
    </section>
  )
}
