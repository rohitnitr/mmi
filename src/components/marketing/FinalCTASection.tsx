'use client'

import { ArrowRight } from 'lucide-react'
import { Reveal, type CtaProps } from './shared'

export default function FinalCTASection({ onAuth }: CtaProps) {
  return (
    <section className="mh-sec">
      <div className="mh-wrap">
        <Reveal>
          <div className="mh-cta">
            <h2>Start building your proof.</h2>
            <p>Create your profile, find a peer, and turn every interview into evidence.</p>
            <button className="mh-btn mh-btn-white" onClick={onAuth}>Build My Portfolio <ArrowRight size={18} aria-hidden="true" /></button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
