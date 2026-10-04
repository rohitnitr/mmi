'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeftRight, ArrowRight, Check, Link2 } from 'lucide-react'
import { careers } from './careers'
import { PreviewBadge, Reveal, type CtaProps } from './shared'

function FlowNode({ title, lit, first, children }: { title: string; lit: boolean; first?: boolean; children: ReactNode }) {
  return (
    <>
      {!first && <div className={`mh-fconn${lit ? ' lit' : ''}`} />}
      <div className={`mh-fcard${lit ? ' lit' : ''}`}>
        <p className="mh-ftitle">{title}</p>
        {children}
      </div>
    </>
  )
}

export default function HeroSection({ onAuth }: CtaProps) {
  const reduce = useReducedMotion()
  const [i, setI] = useState(0)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setI((v) => (v + 1) % careers.length), 3800)
    return () => clearInterval(t)
  }, [reduce])
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setStep((v) => (v + 1) % 5), 1500)
    return () => clearInterval(t)
  }, [reduce])

  const c = careers[i]
  const lit = (k: number) => !reduce && step === k
  const scores = ['4.6', '4.4', '4.7']

  return (
    <section className="mh-hero">
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
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <p className="mh-career-name">{c.name}</p>
                <div className="mh-roles-row">{c.roles.map((r) => <span className="mh-role" key={r}>{r}</span>)}</div>
                <div className="mh-skill-row">{c.skills.map((s) => <span className="mh-sk" key={s}>{s}</span>)}</div>
              </motion.div>
            </AnimatePresence>
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
            <FlowNode first title="Your MMI profile" lit={lit(0)}>
              <div className="mh-fprof">
                <span className="mh-photo" aria-hidden="true">You</span>
                <div>
                  <p className="mh-num">Your Name</p>
                  <p className="mh-small">{c.roles[0]} · @username</p>
                </div>
              </div>
              <div className="mh-skill-row">{c.skills.map((s) => <span className="mh-sk" key={s}>{s}</span>)}</div>
            </FlowNode>
            <FlowNode title="Peer interview" lit={lit(1)}>
              <div className="mh-row" style={{ fontWeight: 700, fontSize: 14 }}>
                <span>You</span><ArrowLeftRight size={16} color="#2563EB" aria-hidden="true" /><span>Your peer</span>
              </div>
            </FlowNode>
            <FlowNode title="Peer feedback" lit={lit(2)}>
              {c.skills.map((s, k) => (
                <div className="mh-frow" key={s}><span>{s}</span><span className="mh-num">{scores[k]} / 5</span></div>
              ))}
            </FlowNode>
            <FlowNode title="Skill evidence" lit={lit(3)}>
              <div className="mh-frow" style={{ marginTop: 0 }}>
                <span>{c.skills[0]}</span>
                <span className="mh-ok"><Check size={13} style={{ verticalAlign: -2 }} aria-hidden="true" /> Peer validated · 12 evaluations</span>
              </div>
            </FlowNode>
            <FlowNode title="Professional portfolio" lit={lit(4)}>
              <div className="mh-frow" style={{ marginTop: 0 }}>
                <span>Share your proof</span><Link2 size={16} color="#2563EB" aria-hidden="true" />
              </div>
            </FlowNode>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
