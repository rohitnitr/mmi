'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeftRight, ArrowRight, Check, Link2 } from 'lucide-react'
import { careers } from './careers'
import { PreviewBadge, Reveal, Waveform, type CtaProps } from './shared'

const DONE = 5

function FlowCard({ k, step, title, children }: { k: number; step: number; title: string; children: ReactNode }) {
  const on = step >= k
  const cur = step === k
  return (
    <>
      {k > 0 && (
        <div className="mh-fconn">
          <i style={{ height: on ? '100%' : '0%' }} />
          {cur && <b />}
        </div>
      )}
      <div className={`mh-fcard${on ? ' on' : ''}${cur ? ' cur' : ''}`}>
        <div className="mh-ftop">
          <p className="mh-ftitle">{title}</p>
          <span className={`mh-fdone${step > k ? ' show' : ''}`}><Check size={12} aria-hidden="true" /></span>
        </div>
        {children}
      </div>
    </>
  )
}

function FlowMeter({ label, value, score, on }: { label: string; value: number; score: string; on: boolean }) {
  return (
    <div className="mh-meter">
      <div className="mh-meter-top"><span>{label}</span><span className="mh-num">{score}</span></div>
      <div className="mh-meter-bar"><i style={{ width: on ? `${value}%` : '0%', transition: 'width .9s ease' }} /></div>
    </div>
  )
}

export default function HeroSection({ onAuth }: CtaProps) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [s, setS] = useState(0)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % careers.length), 3800)
    return () => clearInterval(t)
  }, [reduce])

  useEffect(() => {
    if (reduce) return
    const t = setTimeout(() => setS((v) => (v >= DONE ? 0 : v + 1)), s >= DONE ? 2800 : 1400)
    return () => clearTimeout(t)
  }, [s, reduce])

  const c = careers[i]
  const step = reduce ? DONE : s
  const scores = ['4.6', '4.4', '4.7']
  const vals = [92, 88, 94]
  const ticker = [...careers, ...careers]

  return (
    <section className="mh-hero">
      <div className="mh-blob" style={{ width: 380, height: 380, background: '#93C5FD', top: -80, right: '8%' }} />
      <div className="mh-blob" style={{ width: 320, height: 320, background: '#C4B5FD', top: 160, left: '-4%', animationDelay: '-5s' }} />
      <div className="mh-blob" style={{ width: 260, height: 260, background: '#A5F3FC', bottom: 60, right: '32%', animationDelay: '-9s' }} />

      <div className="mh-wrap mh-hero-grid">
        <Reveal>
          <span className="mh-pill"><span className="mh-dot" /> A professional network built on peer evidence</span>
          <h1 className="mh-h1">
            Don&apos;t Just List Your Skills. <span className="mh-grad">Prove Them.</span>
          </h1>
          <p className="mh-sub">
            Build your professional portfolio through real peer interviews, structured feedback, and evidence of what you can actually do.
          </p>
          <div className="mh-cta-row">
            <button className="mh-btn mh-btn-primary" onClick={onAuth}>Build My Portfolio <ArrowRight size={18} aria-hidden="true" /></button>
            <a className="mh-btn mh-btn-ghost" href="#how-it-works">See How It Works</a>
          </div>
          <p className="mh-trust">Real people · Real interviews · Real feedback · Real evidence</p>

          <div className="mh-career" aria-live="polite">
            <p className="mh-career-lbl">Build your proof for</p>
            <AnimatePresence mode="wait">
              <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <p className="mh-career-name">{c.name}</p>
                <div className="mh-roles-row">{c.roles.map((r) => <span className="mh-role" key={r}>{r}</span>)}</div>
                <div className="mh-skill-row">
                  {c.skills.map((x, n) => <span className="mh-sk mh-pop" style={{ animationDelay: `${n * 0.1}s` }} key={x}>{x}</span>)}
                </div>
              </motion.div>
            </AnimatePresence>
            {!reduce && <span className="mh-cprog"><i key={c.id} /></span>}
            <div className="mh-dots">
              {careers.map((x, k) => (
                <button key={x.id} className={k === i ? 'on' : ''} aria-label={`Show ${x.name}`} aria-pressed={k === i} onClick={() => setI(k)} />
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mh-flow" aria-label="Illustration of how an MMI profile builds evidence">
            <div className="mh-flow-tag"><PreviewBadge label="Illustrative example" /></div>
            <FlowCard k={0} step={step} title="Your MMI profile">
              <div className="mh-fprof">
                <span className="mh-photo" aria-hidden="true">You</span>
                <div><p className="mh-num">Your Name</p><p className="mh-small">{c.roles[0]} · @username</p></div>
              </div>
              <div className="mh-skill-row" key={c.id}>
                {c.skills.map((x, n) => <span className="mh-sk mh-pop" style={{ animationDelay: `${n * 0.1}s` }} key={x}>{x}</span>)}
              </div>
            </FlowCard>
            <FlowCard k={1} step={step} title="Peer interview">
              <div className="mh-row" style={{ fontWeight: 700, fontSize: 14 }}>
                <span>You</span><ArrowLeftRight size={16} color="#2563EB" aria-hidden="true" /><span>Your peer</span>
              </div>
              <Waveform bars={28} />
            </FlowCard>
            <FlowCard k={2} step={step} title="Peer feedback">
              {c.skills.map((x, n) => <FlowMeter key={x} label={x} value={vals[n]} score={`${scores[n]} / 5`} on={step >= 2} />)}
            </FlowCard>
            <FlowCard k={3} step={step} title="Skill evidence">
              <div className="mh-frow" style={{ marginTop: 0 }}>
                <span>{c.skills[0]}</span>
                {step >= 3 && <span className="mh-ok mh-pop"><Check size={13} style={{ verticalAlign: -2 }} aria-hidden="true" /> Peer validated · 12 evaluations</span>}
              </div>
            </FlowCard>
            <FlowCard k={4} step={step} title="Professional portfolio">
              <div className="mh-frow" style={{ marginTop: 0 }}>
                <span>Share your proof</span><Link2 size={16} color="#2563EB" aria-hidden="true" />
              </div>
            </FlowCard>
          </div>
        </Reveal>
      </div>

      <div className="mh-marquee" aria-hidden="true">
        <div className="mh-track">
          {ticker.map((x, k) => <span className="mh-tick" key={k}>{x.name}</span>)}
        </div>
      </div>
    </section>
  )
}
