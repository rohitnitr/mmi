'use client'

import { ArrowRight } from 'lucide-react'
import { Reveal, type CtaProps } from './shared'

export default function FinalCTASection({ onAuth }: CtaProps) {
  return (
    <section className="mh-sec">
      <div className="mh-wrap">
        <Reveal>
          <div className="mh-cta">
            <div className="mh-blob" style={{ width: 300, height: 300, background: '#60A5FA', top: -100, left: -60 }} />
            <div className="mh-blob" style={{ width: 300, height: 300, background: '#C084FC', bottom: -120, right: -60, animationDelay: '-7s' }} />
            <h2>Start building your proof.</h2>
            <p>Create your profile, find a peer, and turn every interview into evidence.</p>
            <button className="mh-btn mh-btn-white" onClick={onAuth}>Build My Portfolio <ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
