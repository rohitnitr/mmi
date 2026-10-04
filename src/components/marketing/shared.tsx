'use client'

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from 'react'
import { animate, motion, useInView, useReducedMotion } from 'framer-motion'

export type CtaProps = { onAuth: () => void }

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function PreviewBadge({ label = 'Example preview' }: { label?: string }) {
  return <span className="mh-badge mh-b-preview">{label}</span>
}

const STATUS = { live: ['Live', 'mh-b-live'], partial: ['Basic version live', 'mh-b-live'], soon: ['Coming soon', 'mh-b-soon'], planned: ['Planned', 'mh-b-planned'] } as const
export function StatusBadge({ status }: { status: keyof typeof STATUS }) {
  return <span className={`mh-badge ${STATUS[status][1]}`}>{STATUS[status][0]}</span>
}

export function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: ReactNode; description?: string }) {
  return (
    <Reveal className="mh-head">
      {eyebrow && <span className="mh-eyebrow">{eyebrow}</span>}
      <h2 className="mh-h2">{title}</h2>
      {description && <p className="mh-lead">{description}</p>}
    </Reveal>
  )
}

export function GlowCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div className={`mh-glow ${className}`} onMouseMove={move}>
      {children}
    </div>
  )
}

export function Waveform({ bars = 30 }: { bars?: number }) {
  return (
    <div className="mh-wave" aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <i key={i} style={{ animationDelay: `${(i % 10) * 0.11}s`, animationDuration: `${0.9 + (i % 5) * 0.15}s` }} />
      ))}
    </div>
  )
}

export function Meter({ label, value }: { label?: string; value: number }) {
  const reduce = useReducedMotion()
  return (
    <div className="mh-meter">
      {label && <div className="mh-meter-top"><span>{label}</span></div>}
      <div className="mh-meter-bar">
        {reduce ? (
          <i style={{ width: `${value}%` }} />
        ) : (
          <motion.i initial={{ width: 0 }} whileInView={{ width: `${value}%` }} viewport={{ once: true }} transition={{ duration: 0.9, ease: 'easeOut' }} />
        )}
      </div>
    </div>
  )
}

export function CountUp({ to, decimals = 0, duration = 1.2 }: { to: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!inView || reduce) return
    const c = animate(0, to, { duration, ease: 'easeOut', onUpdate: setV })
    return () => c.stop()
  }, [inView, reduce, to, duration])
  return <span ref={ref}>{(reduce ? to : v).toFixed(decimals)}</span>
}

export function StaggerItem({ children, i = 0 }: { children: ReactNode; i?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return <li>{children}</li>
  return (
    <motion.li initial={{ opacity: 0, x: -14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.4, delay: i * 0.08 }}>
      {children}
    </motion.li>
  )
}
