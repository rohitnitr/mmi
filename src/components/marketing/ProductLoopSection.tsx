'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Award, FileText, Mic, Search, UserPlus, Share2 } from 'lucide-react'
import { Meter, PreviewBadge, SectionHeader, StatusBadge, Waveform } from './shared'

const steps = [
  { icon: UserPlus, n: '01', title: 'Build your professional profile', body: 'Name, photo, headline, target role, skills, projects and links.', status: 'partial' },
  { icon: Search, n: '02', title: 'Find a peer', body: 'Meet people preparing for similar roles or working on similar skills.', status: 'live' },
  { icon: Mic, n: '03', title: 'Interview each other', body: 'Two people, two roles, one valuable session.', status: 'live' },
  { icon: FileText, n: '04', title: 'Give and receive structured feedback', body: 'Rate each other on a clear rubric, with written feedback.', status: 'soon' },
  { icon: Award, n: '05', title: 'Build skill evidence', body: 'Skills move from self-declared to peer-validated.', status: 'soon' },
  { icon: Share2, n: '06', title: 'Build your professional portfolio', body: 'Your profile becomes proof you can share.', status: 'soon' },
] as const

function RoleSwap() {
  const [flip, setFlip] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setFlip((v) => !v), 2400)
    return () => clearInterval(t)
  }, [])
  const a = flip ? 'Interviewer' : 'Candidate'
  const b = flip ? 'Candidate' : 'Interviewer'
  return (
    <>
      <div className="mh-swap">
        {[['You', a], ['Your peer', b]].map(([who, role]) => (
          <div className="mh-swap-box" key={who}>
            <span>{who}</span>
            <AnimatePresence mode="wait">
              <motion.b key={role} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>{role}</motion.b>
            </AnimatePresence>
            {who === 'You' && null}
          </div>
        )).reduce<React.ReactNode[]>((acc, el, k) => (k === 0 ? [el] : [...acc, <span key="x" style={{ fontWeight: 800, color: '#2563EB' }}>⇄</span>, el]), [])}
      </div>
      <p className="mh-small" style={{ marginTop: 14 }}>Then you switch. You don&apos;t just get interviewed. You interview another peer too.</p>
    </>
  )
}

function Panel({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="mh-mock">
        <p className="mh-bold">Your professional profile</p>
        <div className="mh-pgrid">
          {['Name and photo', 'Username', 'Headline', 'Target role', 'Skills', 'Experience', 'Education', 'Projects', 'LinkedIn / GitHub'].map((x) => <span key={x}>{x}</span>)}
        </div>
      </div>
    )
  if (i === 1)
    return (
      <div className="mh-mock">
        <p className="mh-bold">Peers across careers <span className="mh-small">(illustrative)</span></p>
        {[['Software Engineer', 'React · Node.js · SQL'], ['Data Analyst', 'SQL · Python · Analytics'], ['Consultant', 'Strategy · Case Interviews'], ['Finance', 'Financial Modeling · Excel'], ['Government', 'Aptitude · Reasoning · General Studies']].map(([r, s]) => (
          <div className="mh-peer" key={r}><div className="grow"><p className="mh-bold" style={{ fontSize: 14 }}>{r}</p><p className="mh-small">{s}</p></div><span className="mh-online">Active</span></div>
        ))}
      </div>
    )
  if (i === 2)
    return (
      <div className="mh-mock">
        <p className="mh-bold">Two people. Two roles. One valuable session.</p>
        <Waveform bars={34} />
        <RoleSwap />
      </div>
    )
  if (i === 3)
    return (
      <div className="mh-mock">
        <p className="mh-bold">Interview feedback</p>
        <Meter label="Technical Knowledge  4.5 / 5" value={90} />
        <Meter label="Problem Solving  4.4 / 5" value={88} />
        <Meter label="Communication  4.7 / 5" value={94} />
        <Meter label="Role Knowledge  4.3 / 5" value={86} />
        <div className="mh-fb">&ldquo;Strong reasoning and clear communication. Good approach to solving unfamiliar problems.&rdquo;</div>
      </div>
    )
  if (i === 4)
    return (
      <div className="mh-mock">
        <p className="mh-bold">Evidence for one skill</p>
        <div className="mh-pgrid">
          {['Self-declared', 'Interviewed', 'Peer evaluated', 'Peer validated'].map((x, k) => <span key={x}>{k + 1}. {x}</span>)}
        </div>
        <p className="mh-small" style={{ marginTop: 12 }}>You can declare your skills. You cannot declare your own validation score. Only completed peer interactions create evidence.</p>
      </div>
    )
  return (
    <div className="mh-mock">
      <p className="mh-bold">Your portfolio</p>
      <div className="mh-parts">
        {['Skills', 'Peer-validated skills', 'Interview history', 'Peer feedback', 'Achievements', 'MMI score', 'Projects', 'Education', 'Links'].map((x) => <span key={x}>{x}</span>)}
      </div>
      <p className="mh-small" style={{ marginTop: 12 }}>Share your proof with a link.</p>
    </div>
  )
}

export default function ProductLoopSection() {
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => setActive((v) => (v + 1) % steps.length), 5000)
    return () => clearTimeout(t)
  }, [active, auto])

  return (
    <section id="how-it-works" className="mh-sec" style={{ scrollMarginTop: 70, background: 'var(--soft)' }}>
      <div className="mh-wrap">
        <SectionHeader eyebrow="How it works" title="From profile to proof in six steps" description="The interview is the mechanism. Your portfolio is the outcome." />
        <div className="mh-loop">
          <div className="mh-steps" role="tablist" aria-label="How MatchMyInterview works">
            {steps.map((s, k) => (
              <button key={s.n} role="tab" aria-selected={active === k} className={`mh-step${active === k ? ' on' : ''}${auto ? ' auto' : ''}`} onClick={() => { setAuto(false); setActive(k) }}>
                <span className="mh-step-num">{s.n}</span>
                <span>
                  <span className="mh-step-title">{s.title} <StatusBadge status={s.status} /></span>
                  <span className="mh-step-body" style={{ display: 'block' }}>{s.body}</span>
                </span>
                <span className="mh-step-bar"><i key={`${active}-${auto}`} /></span>
              </button>
            ))}
          </div>
          <div className="mh-panel" role="tabpanel">
            <div className="mh-panel-top">
              <span className="mh-bold">{steps[active].n} · {steps[active].title}</span>
              <PreviewBadge label="Illustrative" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
                <Panel i={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
